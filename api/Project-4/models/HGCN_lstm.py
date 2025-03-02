import dgl.nn as dglnn
import torch
import torch.nn as nn
import torch.nn.functional as F


class HGCNWithGates(nn.Module):
    def __init__(self, in_feats, hid_feats, out_feats, rel_names):
        super().__init__()
        # 实例化HeteroGraphConv，in_feats是输入特征的维度，out_feats是输出特征的维度，aggregate是聚合函数的类型
        self.conv1 = dglnn.HeteroGraphConv({
            rel: dglnn.SAGEConv(in_feats, hid_feats, aggregator_type='mean')
            for rel in rel_names}, aggregate='sum')

        self.conv2 = dglnn.HeteroGraphConv({
            rel: dglnn.SAGEConv(hid_feats, out_feats, aggregator_type='mean')
            for rel in rel_names}, aggregate='sum')

        # 门控机制的参数
        self.gate1 = nn.Linear(hid_feats, hid_feats)  # 第一层的门控
        self.gate2 = nn.Linear(out_feats, out_feats)  # 第二层的门控

    def forward(self, graph, inputs):
        # 输入是节点的特征字典
        h = self.conv1(graph, inputs)
        h = {k: F.relu(v) for k, v in h.items()}  # 激活第一层

        # 门控机制：计算门控值并应用
        gate1 = {k: torch.sigmoid(self.gate1(v)) for k, v in h.items()}  # 第一层门控
        h = {k: v * gate1[k] for k, v in h.items()}  # 应用门控

        h = self.conv2(graph, h)  # 第二层卷积
        gate2 = {k: torch.sigmoid(self.gate2(v)) for k, v in h.items()}  # 第二层门控
        h = {k: v * gate2[k] for k, v in h.items()}  # 应用门控

        return h
