import dgl.nn as dglnn
import torch.nn as nn
import torch.nn.functional as F


class HGAT(nn.Module):
    def __init__(self, in_feats, hid_feats, out_feats, rel_names, num_heads=4):
        super().__init__()
        # 使用 GATConv 代替 GraphConv
        self.gat1 = dglnn.HeteroGraphConv({
            rel: dglnn.GATConv(in_feats, hid_feats // num_heads, num_heads)
            for rel in rel_names}, aggregate='sum')

        self.gat2 = dglnn.HeteroGraphConv({
            rel: dglnn.GATConv(hid_feats, out_feats, 1)  # 输出层通常只需要一个头
            for rel in rel_names}, aggregate='sum')

    def forward(self, graph, inputs):
        # 输入是节点的特征字典
        h = self.gat1(graph, inputs)
        # GAT 输出的维度为 [batch_size, num_heads, hidden_size]，需要将多个头拼接
        h = {k: F.elu(v.view(v.shape[0], -1)) for k, v in h.items()}

        h = self.gat2(graph, h)
        # 输出层不再需要展开
        h = {k: v.mean(1) for k, v in h.items()}  # 只有一个头，取均值以去掉头维度
        return h
