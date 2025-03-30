import dgl
import torch
import dgl.nn as dglnn
import torch.nn as nn
import numpy as np
import torch.nn.functional as F
import sys
import os
import argparse
import time
from collections import Counter
from sklearn.metrics import accuracy_score,f1_score,precision_score,recall_score
import dgl.function as fn
import re

import networkx as nx
import matplotlib.pyplot as plt

print(dgl.__version__)
# Define a Heterograph Conv model
class HGCN(nn.Module):
    def __init__(self, in_feats, hid_feats, out_feats, rel_names):
        super().__init__()
        # 实例化HeteroGraphConv，in_feats是输入特征的维度，out_feats是输出特征的维度，aggregate是聚合函数的类型,rel_names为g.etypes
        self.conv1 = dglnn.HeteroGraphConv({
            rel: dglnn.GraphConv(in_feats, hid_feats)
            for rel in rel_names}, aggregate='sum')
        self.conv2 = dglnn.HeteroGraphConv({
            rel: dglnn.GraphConv(hid_feats, out_feats)
            for rel in rel_names}, aggregate='sum')

    def forward(self, graph, inputs):
        # 输入是节点的特征字典 node_features[ntype] = feat
        h = self.conv1(graph, inputs)
        h = {k: F.relu(v) for k, v in h.items()}
        h = self.conv2(graph, h)
        return h

class attHGNN(nn.Module):

    def __init__(self, in_feats, out_feats):
        super().__init__()
        self.linear = nn.Linear(in_feats * 2, out_feats)
        self.type_weights = torch.nn.Parameter(torch.Tensor(34,in_feats))
        self.type_weights2 = torch.nn.Parameter(torch.Tensor(1,17))
        self.reset_parameters()

    def reset_parameters(self):
        torch.nn.init.xavier_uniform_(self.type_weights)
        torch.nn.init.xavier_uniform_(self.type_weights2)

    def message_func(self, edges):
        # edges.data['feat'] #边的特征
        node_features = edges.src['feat'] #点的特征
        type_weights = edges.data['att'] #边的注意力
        messages = torch.mul(type_weights, node_features)
        return {'m': messages}

    def forward(self, g, h, e_feat):
        with g.local_scope():
            # 输入h和e_feat是特征字典 node_features[ntype] = feat
            for e_type, e_feature in e_feat.items():
                index = int(e_type.split('_')[1]) 
                att_vector = self.type_weights[index - 1]
                expanded_att_vector = att_vector.repeat(e_feature.shape[0], 1)
                g.edges[e_type].data['att'] = expanded_att_vector

            # g.update_all(
            #     message_func = self.message_func,
            #     reduce_func = fn.mean('m', 'h_N')
            # )
            message_func = self.message_func
            reduce_func = fn.mean('m', 'h_new') 
            g.multi_update_all(
                {etype: (message_func, reduce_func) for etype in g.etypes},
                cross_reducer='stack'  # 可选的跨类型聚合方式
            )
            h_new = g.ndata['h_new']  # 形状为 (N, T, F)，其中 T 是边类型数量\
            # print(h_new['acqr'].size())
            # 初始化一个新的字典用于存储处理后的特征
            processed_h_new = {}
            # 遍历字典中的每个节点类型
            for ntype, h_new in h_new.items():
                # h_new 形状为 (N, T, F)，其中 T 是边类型数量
                if h_new.shape[1] == 1:
                    # 如果 T=1，去掉这一维度
                    h_new = h_new.squeeze(1)  # 去掉第 1 维，使得形状变为 (N, F)
                else: #app
                    # 对于每种边类型应用对应的权重
                    weights = self.type_weights2.squeeze(0)  # 转换为 (T,)
                    # 对不同类型加权求和
                    weights = weights.view(1, -1, 1)
                    # 加权求和
                    h_new = (h_new * weights).sum(dim=1)
                # 将处理后的特征存储到新的字典中
                processed_h_new[ntype] = h_new
            # 用处理后的特征字典更新 g.ndata
            g.ndata['h_new'] = processed_h_new

            h_total = {}
            # h_total = self.linear(torch.cat([h, h_N], dim = 1))
            for ntype in h.keys():
                # 获取该类型节点的原始特征和聚合特征
                node_h = h[ntype]  # 节点的原始特征
                node_h_N = g.ndata['h_new'][ntype]  # 聚合特征，按节点类型筛选

                # 将原始特征和聚合特征拼接
                combined_features = torch.cat([node_h, node_h_N], dim=1)

                # 通过线性层转换
                h_total[ntype] = self.linear(combined_features)
            return h_total
        

class model(nn.Module):
    def __init__(self, in_feats, h_feats, out_feats):
        super(model, self).__init__()
        self.conv1 = attHGNN(in_feats, h_feats) 
        self.conv2 = attHGNN(h_feats, out_feats)

    def forward(self, g, x, e):
        h = self.conv1(g, x, e)
        h = {k: F.relu(v) for k, v in h.items()}
        h = self.conv2(g, h, e)
        return h



def print_model_grads(model):
    for name, param in model.named_parameters():
        if param.grad is not None:
            print(f"{name}: grad mean: {param.grad.mean().item()}, grad std: {param.grad.std().item()}")

def print_model_weights(model):
    for name, param in model.named_parameters():
        print(f"{name}: weight mean: {param.data.mean().item()}, weight std: {param.data.std().item()}")

def build_undirected_graph(g):
    # 对每个规范边类型添加反向边
    for etype in g.canonical_etypes:
        src_type, edge_type, dst_type = etype
        # 获取原始边
        src, dst = g.edges(etype=etype)
        # 检查是否需要创建新的边类型或调整边类型
        reverse_edge_type = edge_type + "_reverse"  # 假设有反向的边类型命名规则
        reverse_etype = (dst_type, reverse_edge_type, src_type)
        # 添加反向边
        g.add_edges(dst, src, etype=reverse_etype)
    return g

def plot_heterogeneous_dgl_graph(g):
    # 将DGL异构图转换为NetworkX图
    nx_g = dgl.to_networkx(g, node_attrs=None, edge_attrs=None)
    # 为不同类型的节点和边指定颜色
    node_colors = {}
    for ntype in g.ntypes:
        nodes = {n for n, ndata in g.nodes[ntype].data.items()}
        node_colors.update({n: np.random.rand(3,) for n in nodes})  # 随机颜色
    edge_colors = {}
    for etype in g.etypes:
        edges = g.edges(etype=etype)
        edge_colors[etype] = np.random.rand(3,)  # 每种类型的边使用一种颜色
    # 创建图形
    plt.figure(figsize=(10, 10))
    pos = nx.spring_layout(nx_g)  # 节点的位置
    # 绘制节点
    for ntype, color in node_colors.items():
        nx.draw_networkx_nodes(nx_g, pos, nodelist=[n for n in nx_g.nodes() if nx_g.nodes[n]['_TYPE'] == ntype], node_color=[color], label=ntype)
    # 绘制边
    for etype, color in edge_colors.items():
        nx.draw_networkx_edges(nx_g, pos, edgelist=[(u, v) for u, v, e in nx_g.edges(data=True) if e['_TYPE'] == etype], edge_color=color, label=etype)
    # 绘制节点标签
    nx.draw_networkx_labels(nx_g, pos)
    # 添加图例
    plt.legend()
    plt.title('Heterogeneous Graph Visualization')
    plt.show()


def initialize_features(g, feature_dim, init_type='zero'):
    for ntype in g.ntypes:
        # 检查节点类型是否为'app'
        if ntype != 'app':
            num_nodes = g.number_of_nodes(ntype)
            if init_type == 'zero':
                # 初始化为零向量
                g.nodes[ntype].data['feat'] = torch.zeros((num_nodes, feature_dim))
            elif init_type == 'random':
                # 初始化为随机向量
                g.nodes[ntype].data['feat'] = torch.rand((num_nodes, feature_dim))

def edge_initialize_features(g, feature_dim, init_type='zero'):
    for etype in g.etypes:
        # 检查节点类型是否为'app'
        if etype != 'edges_1':
            num_edges = g.number_of_edges(etype)
            if init_type == 'zero':
                # 初始化为零向量
                g.edges[etype].data['feat'] = torch.zeros((num_edges, feature_dim))
            elif init_type == 'random':
                # 初始化为随机向量
                g.edges[etype].data['feat'] = torch.rand((num_edges, feature_dim))

def run_model(args):

    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    if args.device==1:
        device = torch.device('cuda:1' if torch.cuda.is_available() else 'cpu')
    elif args.device==0:
        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

    dataset = dgl.data.CSVDataset(args.data_path)
    g = dataset[0]  # only one graph
    # plot_heterogeneous_dgl_graph(g)

    # 转为无向图
    # g = dgl.to_bidirected(g)
    # g = build_undirected_graph(g)
    print(g)

    
    node_features = {}
    edge_features = {}
    edge_feature_dim = g.edges['edges_1'].data['feat'].shape[1]
    feature_dim = g.nodes['app'].data['feat'].shape[1]
    initialize_features(g, feature_dim, init_type=args.init_type)
    edge_initialize_features(g, edge_feature_dim, init_type=args.init_type)
    for ntype in g.ntypes:
        # 获取该类型节点的特征数据
        feat = g.nodes[ntype].data['feat']  # 假设特征存储在 'feat' 字段
        if feat is not None:
            node_features[ntype] = feat
    for etype in g.etypes:
        # 获取该类型节点的特征数据
        feat = g.edges[etype].data['feat']  # 假设特征存储在 'feat' 字段
        if feat is not None:
            edge_features[etype] = feat
    g = g.to(device)
    node_features = {ntype: feats.to(device) for ntype, feats in node_features.items()}
    edge_features = {etype: feats.to(device) for etype, feats in edge_features.items()}
    # print(edge_features['edges_2'])

    # print(type(g.ndata['feat']))
    # print(edge_features.keys())
    train_time=0
    test_time=0
    if args.model_type == 'hgcn':

        net = HGCN(feature_dim, args.hid_dim, 3, g.etypes)
        labels = g.nodes['app'].data['label']

        num_nodes = g.number_of_nodes('app')
        train_mask = np.zeros(num_nodes, dtype=bool)
        val_mask = np.zeros(num_nodes, dtype=bool)
        test_mask = np.zeros(num_nodes, dtype=bool)
        train_ratio = args.train_ratio
        val_ratio = args.val_ratio
        test_ratio = args.test_ratio

        assert train_ratio + val_ratio + test_ratio == 1.0

        indices = np.random.permutation(num_nodes)  # 随机打乱节点索引
        train_end = int(num_nodes * train_ratio)
        val_end = train_end + int(num_nodes * val_ratio)
        train_indices = indices[:train_end]
        val_indices = indices[train_end:val_end]
        test_indices = indices[val_end:]

        train_mask[train_indices] = True
        val_mask[val_indices] = True
        test_mask[test_indices] = True
        g.nodes['app'].data['train_mask'] = torch.from_numpy(train_mask).to(device)
        g.nodes['app'].data['val_mask'] = torch.from_numpy(val_mask).to(device)
        g.nodes['app'].data['test_mask'] = torch.from_numpy(test_mask).to(device)

        train_mask = g.nodes['app'].data['train_mask']
        labels = g.nodes['app'].data['label']  
        labels = labels.to(torch.int64)   
    if args.model_type == 'atthgcn':

        net = model(feature_dim, args.hid_dim, 3)
        labels = g.nodes['app'].data['label']

        num_nodes = g.number_of_nodes('app')
        train_mask = np.zeros(num_nodes, dtype=bool)
        val_mask = np.zeros(num_nodes, dtype=bool)
        test_mask = np.zeros(num_nodes, dtype=bool)
        train_ratio = args.train_ratio
        val_ratio = args.val_ratio
        test_ratio = args.test_ratio

        assert train_ratio + val_ratio + test_ratio == 1.0

        # np.random.seed(42)
        indices = np.random.permutation(num_nodes)  # 随机打乱节点索引
        train_end = int(num_nodes * train_ratio)
        val_end = train_end + int(num_nodes * val_ratio)
        train_indices = indices[:train_end]
        val_indices = indices[train_end:val_end]
        test_indices = indices[val_end:]

        train_mask[train_indices] = True
        val_mask[val_indices] = True
        test_mask[test_indices] = True
        g.nodes['app'].data['train_mask'] = torch.from_numpy(train_mask).to(device)
        g.nodes['app'].data['val_mask'] = torch.from_numpy(val_mask).to(device)
        g.nodes['app'].data['test_mask'] = torch.from_numpy(test_mask).to(device)

        train_mask = g.nodes['app'].data['train_mask']
        # print(train_mask)
        labels = g.nodes['app'].data['label']  
        labels = labels.to(torch.int64)      




    net.to(device)
    optimizer = torch.optim.AdamW(net.parameters(),
                                              lr=args.lr, weight_decay=args.weight_decay)
    
    # training loop
    net.train()
    for epoch in range(args.epoch):
        best_val_loss = float('inf')
        patience = args.patience
        patience_counter = 0 

        t_start = time.time()
        # if epoch == 0:
        #     print(net(g, node_features))
        if args.model_type == 'hgcn':
            logits = net(g, node_features)['app']
        if args.model_type == 'atthgcn':
            logits = net(g, node_features, edge_features)['app']
        # 计算损失值
        class_counts = Counter(labels.cpu().numpy())
        labels = labels.to(device)
        # class_counts = Counter(labels.numpy())
        print(class_counts)
        class_weights = {class_id: 1.0 / count for class_id, count in class_counts.items()}
        # 将权重转换为张量
        weights = torch.tensor([class_weights[i] for i in range(len(class_counts))], dtype=torch.float).to(device)
        criterion = torch.nn.CrossEntropyLoss(weight=weights) #损失函数加入权重
        loss = criterion(logits[train_mask], labels[train_mask])
        # 进行反向传播计算
        optimizer.zero_grad()
        loss.backward()
        # print_model_grads(net)
        optimizer.step()
        t_end = time.time()
        # print_model_weights(net)

        # 所有类评估
        _pred = torch.argmax(logits[train_mask], dim=1, keepdim=False)
        truth = labels[train_mask].cpu().numpy()
        output = _pred.cpu().numpy()
        microf1 = f1_score(truth, output, average='micro')
        macrof1 = f1_score(truth, output, average='macro')
        # print training info
        print('Epoch {:05d} | Train_Loss {:.4f} | Microf1 {:.4f} | Macrof1 {:.4f} | Time(s) {:.4f}'.format(
            epoch, loss.item(), microf1,macrof1,t_end - t_start))
        #针对异常类评估
        # 计算针对类别 1 和 2 的准确率和召回率
        precision = precision_score(truth, output, labels=[1, 2], average='macro')
        recall = recall_score(truth, output, labels=[1, 2], average='macro')
        print(f'train Precision (Class 1, 2): {precision:.4f}')
        print(f'train Recall (Class 1, 2): {recall:.4f}')

        # if os.path.exists('../checkpoint/model.pt'):
        #     print("Model checkpoint found. Stopping training.")
        #     net.load_state_dict(torch.load('../checkpoint/model.pt'))
        #     break

        t_start = time.time()
        net.eval() 
        with torch.no_grad():
            if args.model_type == 'hgcn':
                logits = net(g, node_features)['app']
            if args.model_type == 'atthgcn':
                logits = net(g, node_features, edge_features)['app']
            # logits = net(g, node_features)['app']
            val_loss = criterion(logits[val_mask], labels[val_mask])
            t_end = time.time()

        if val_loss.item() < best_val_loss:
            best_val_loss = val_loss.item()
            patience_counter = 0
            torch.save(net.state_dict(), '../checkpoint/model.pt')
            print("Model saved as validation loss improved.")
        else:
            patience_counter += 1

        _pred = torch.argmax(logits[val_mask], dim=1, keepdim=False)
        truth = labels[val_mask].cpu().numpy()
        output = _pred.cpu().numpy()
        microf1 = f1_score(truth, output, average='micro')
        macrof1 = f1_score(truth, output, average='macro')
        print('Epoch {:05d} | Val_Loss {:.4f} | Microf1 {:.4f} | Macrof1 {:.4f} | Time(s) {:.4f}'.format(
                epoch, val_loss.item(), microf1,macrof1,t_end - t_start))
        precision = precision_score(truth, output, labels=[1, 2], average='macro')
        recall = recall_score(truth, output, labels=[1, 2], average='macro')
        print(f'val Precision (Class 1, 2): {precision:.4f}')
        print(f'val Recall (Class 1, 2): {recall:.4f}')

        if patience_counter >= patience:
            print("Stopping early due to no improvement in validation loss.")
            break  # 跳出训练循环

    

    start_test_time=time.time()
    net.eval()
    test_logits = []
    # logits = net(g, node_features)['app']
    if args.model_type == 'hgcn':
        logits = net(g, node_features)['app']
    if args.model_type == 'atthgcn':
        logits = net(g, node_features, edge_features)['app']
    test_loss = criterion(logits[test_mask], labels[test_mask])
    _pred = torch.argmax(logits[test_mask], dim=1, keepdim=False)
    truth = labels[test_mask].cpu().numpy()
    output = _pred.cpu().numpy()
    microf1 = f1_score(truth, output, average='micro')
    macrof1 = f1_score(truth, output, average='macro')
    precision = precision_score(truth, output, labels=[1, 2], average='macro')
    recall = recall_score(truth, output, labels=[1, 2], average='macro')
    end_test_time=time.time()
    print('test_Loss {:.4f} | Microf1 {:.4f} | Macrof1 {:.4f} | Time(s) {:.4f}'.format(
                test_loss.item(), microf1,macrof1,t_end - t_start))
    print(f'test Precision (Class 1, 2): {precision:.4f}')
    print(f'test Recall (Class 1, 2): {recall:.4f}')

    # model = RGCN(n_hetero_features, 20, n_user_classes, hetero_graph.etypes)
    # user_feats = g.nodes['user'].data['feature']
    # item_feats = g.nodes['item'].data['feature']
    # labels = g.nodes['user'].data['label']
    # train_mask = g.nodes['user'].data['train_mask']

    # opt = torch.optim.Adam(model.parameters())

    # for epoch in range(5):
    #     model.train()
    #     # 使用所有节点的特征进行前向传播计算，并提取输出的user节点嵌入
    #     logits = model(hetero_graph, node_features)['user']
    #     # 计算损失值
    #     loss = F.cross_entropy(logits[train_mask], labels[train_mask])
    #     # 计算验证集的准确度。在本例中省略。
    #     # 进行反向传播计算
    #     opt.zero_grad()
    #     loss.backward()
    #     opt.step()
    #     print(loss.item())

    #     # 如果需要的话，保存训练好的模型。本例中省略。

if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='testing for the trans dataset')
    ap.add_argument('--seed', type=int, default="0")
    ap.add_argument('--device',type=int,default= 0)
    ap.add_argument('--data_path', type=str, default='../graph_dataset')
    ap.add_argument('--init_type', type=str, default='random', help='zero or random')
    ap.add_argument('--model_type', type=str, default='atthgcn', help='hgcn or atthgcn')
    ap.add_argument('--hid_dim', type=int, default=211)
    ap.add_argument('--train_ratio', type=float, default=0.7)
    ap.add_argument('--val_ratio', type=float, default=0.15)
    ap.add_argument('--test_ratio', type=float, default=0.15)
    ap.add_argument('--lr', type=float, default=0.001)
    ap.add_argument('--weight_decay', type=float, default=1e-6)
    ap.add_argument('--epoch', type=int, default=100)
    ap.add_argument('--patience', type=int, default=20)
    args = ap.parse_args()
    run_model(args)