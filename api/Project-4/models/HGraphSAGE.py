import dgl.nn as dglnn
import torch.nn as nn
import torch.nn.functional as F


class HGraphSAGE(nn.Module):
    def __init__(self, in_feats, hid_feats, out_feats, rel_names):
        super().__init__()
        # 使用 SAGEConv 代替 GraphConv 或 GATConv
        self.sage1 = dglnn.HeteroGraphConv({
            rel: dglnn.SAGEConv(in_feats, hid_feats, aggregator_type='mean')
            for rel in rel_names}, aggregate='sum')

        self.sage2 = dglnn.HeteroGraphConv({
            rel: dglnn.SAGEConv(hid_feats, out_feats, aggregator_type='mean')
            for rel in rel_names}, aggregate='sum')

    def forward(self, graph, inputs):
        # 输入是节点的特征字典
        h = self.sage1(graph, inputs)
        # 每一层输出后，应用非线性激活函数
        h = {k: F.relu(v) for k, v in h.items()}

        h = self.sage2(graph, h)
        return h
