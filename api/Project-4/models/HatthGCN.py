import dgl.nn as dglnn
import torch.nn as nn
import torch.nn.functional as F
import torch
import dgl.function as fn


class attHGNN(nn.Module):
    def __init__(self, in_feats, out_feats):
        super().__init__()
        self.linear = nn.Linear(in_feats * 2, out_feats)
        self.type_weights = torch.nn.Parameter(torch.Tensor(34, in_feats))  # (34, in_feats)
        self.type_weights2 = torch.nn.Parameter(torch.Tensor(1, 17))  # (1, 17)
        self.reset_parameters()

    def reset_parameters(self):
        torch.nn.init.xavier_uniform_(self.type_weights)
        torch.nn.init.xavier_uniform_(self.type_weights2)

    def message_func(self, edges):
        node_features = edges.src['feat']  # Node features
        type_weights = edges.data['att']  # Attention weights for edges
        messages = torch.mul(type_weights, node_features)
        return {'m': messages}

    def forward(self, g, h, e_feat):
        with g.local_scope():
            # Input h and e_feat are feature dictionaries node_features[ntype] = feat
            for e_type, e_feature in e_feat.items():
                # print(f"Before updating type_weights: {self.type_weights.shape}")  # Debugging print
                index = int(e_type.split('_')[1])  # Get the index from the edge type
                att_vector = self.type_weights[index - 1]  # Extract the corresponding attention weight vector
                # print(f"Extracted att_vector: {att_vector.shape}")  # Debugging print

                expanded_att_vector = att_vector.repeat(e_feature.shape[0], 1)  # Repeat the vector for each edge
                # print(f"Expanded att_vector shape: {expanded_att_vector.shape}")  # Debugging print
                g.edges[e_type].data['att'] = expanded_att_vector

            message_func = self.message_func
            reduce_func = fn.mean('m', 'h_new')
            g.multi_update_all(
                {etype: (message_func, reduce_func) for etype in g.etypes},
                cross_reducer='stack'  # Optional cross-type aggregation method
            )

            h_new = g.ndata['h_new']  # Shape (N, T, F), where T is the number of edge types

            processed_h_new = {}
            for ntype, h_new in h_new.items():
                if h_new.shape[1] == 1:
                    h_new = h_new.squeeze(1)  # Remove the second dimension if T=1
                else:
                    weights = self.type_weights2.squeeze(0)  # Weights of shape (T,)
                    # print(f"Before applying weights: {weights.shape}")  # Debugging print
                    weights = weights.view(1, -1, 1)  # Reshape weights to (1, T, 1)
                    # print(f"Reshaped weights: {weights.shape}")  # Debugging print
                    h_new = (h_new * weights).sum(dim=1)  # Weighted sum of edge features
                processed_h_new[ntype] = h_new

            g.ndata['h_new'] = processed_h_new

            h_total = {}
            for ntype in h.keys():
                node_h = h[ntype]
                node_h_N = g.ndata['h_new'][ntype]
                combined_features = torch.cat([node_h, node_h_N], dim=1)
                h_total[ntype] = self.linear(combined_features)

            return h_total


class HatthGCN(nn.Module):
    def __init__(self, in_feats, h_feats, out_feats, rel_names):
        super(HatthGCN, self).__init__()
        print(in_feats, h_feats, out_feats)
        self.conv1 = attHGNN(in_feats, h_feats)
        self.conv2 = attHGNN(h_feats, out_feats)

    def forward(self, g, x, e):
        h = self.conv1(g, x, e)
        h = {k: F.relu(v) for k, v in h.items()}
        h = self.conv2(g, h, e)
        return h