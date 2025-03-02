import random
import time

import numpy as np
import torch
import torch.nn.functional as F
from tqdm.auto import tqdm

from robustness.grb.attack.base import InjectionAttack
import copy

class FGSM_test_simple(InjectionAttack):
    r"""

    Description
    -----------
    Graph injection attack version of Fast Gradient Sign Method (`FGSM <https://arxiv.org/abs/1412.6572>`__).

    Parameters
    ----------
    epsilon : float
        Perturbation level on features.
    n_epoch : int
        Epoch of perturbations.
    n_inject_max : int
        Maximum number of injected nodes.
    n_edge_max : int
        Maximum number of edges of injected nodes.
    feat_lim_min : float
        Minimum limit of features.
    feat_lim_max : float
        Maximum limit of features.
    loss : func of torch.nn.functional, optional
        Loss function compatible with ``torch.nn.functional``. Default: ``F.cross_entropy``.
    eval_metric : func of grb.evaluator.metric, optional
        Evaluation metric. Default: ``metric.eval_acc``.
    early_stop : bool or instance of EarlyStop, optional
        Whether to early stop. Default: ``None``.
    early_stop_patience : int, optional
        Patience of early_stop. Only enabled when ``early_stop is not None``. Default: ``1000``.
    early_stop_epsilon : float, optional
        Tolerance of early_stop. Only enabled when ``early_stop is not None``. Default: ``1e-5``.
    verbose : bool, optional
        Whether to display logs. Default: ``True``.
    device : str, optional
        Device used to host data. Default: ``cpu``.

    """

    def __init__(self,
                 epsilon,
                 n_epoch,
                 n_inject_max,
                 n_edge_max,
                 feat_lim_min,
                 feat_lim_max,
                 loss=F.cross_entropy,
                 early_stop=None,
                 early_stop_patience=1000,
                 early_stop_epsilon=1e-5,
                 verbose=False,
                 device='cpu'):
        self.device = device
        self.epsilon = epsilon
        self.n_epoch = n_epoch
        self.n_inject_max = n_inject_max
        self.n_edge_max = n_edge_max
        self.feat_lim_min = feat_lim_min
        self.feat_lim_max = feat_lim_max
        self.loss = loss
        self.verbose = verbose

        # # Early stop
        # if early_stop:
        #     if isinstance(early_stop, EarlyStop):
        #         self.early_stop = early_stop
        #     else:
        #         self.early_stop = EarlyStop(patience=early_stop_patience,
        #                                     epsilon=early_stop_epsilon)
        # else:
        #     self.early_stop = None

    def evaluate_acc(self, model, data, node_features, test_mask):
        model.eval()
        # with torch.no_grad():
        logits = model(data, node_features)['app']
        pred = logits[test_mask].argmax(dim=-1)
        labels = data.nodes['app'].data['label'][test_mask]
        acc = pred.eq(labels).sum().item() / labels.size(0)
        return acc

    def evaluate(self, net, g, node_features, edge_features, labels, mask):
        test_logits = []
        logits = net(g, node_features, edge_features)['app']
        criterion = torch.nn.CrossEntropyLoss()
        test_loss = criterion(logits[mask], labels[mask])
        print(test_loss)
        _pred = torch.argmax(logits[mask], dim=1, keepdim=False)
        truth = labels[mask].cpu().numpy()
        output = _pred.cpu().numpy()
        acc = (output == truth).sum() / truth.shape[0]
        acc_0 = (output[truth == 0] == truth[truth == 0]).sum() / truth[truth == 0].shape[0]
        acc_1 = (output[truth == 1] == truth[truth == 1]).sum() / truth[truth == 1].shape[0]
        acc_2 = (output[truth == 2] == truth[truth == 2]).sum() / truth[truth == 2].shape[0]
        num_0 = (output[truth == 0] == truth[truth == 0]).sum()
        num_1 = (output[truth == 1] == truth[truth == 1]).sum()
        num_2 = (output[truth == 2] == truth[truth == 2]).sum()
        return acc, [[acc_0, acc_1, acc_2], [num_0, num_1, num_2]]

    def process(self, data):
        node_features = {}
        for ntype in data.ntypes:
            # 获取该类型节点的特征数据
            feat = data.nodes[ntype].data['feat']  # 假设特征存储在 'feat' 字段
            # 获取特征维度，并添加到 in_dims 列表中
            if feat is not None:
                node_features[ntype] = feat
        node_features = {ntype: feats.to(self.device) for ntype, feats in node_features.items()}

        return node_features

    def edge_process(self, data):
        edge_features = {}
        for etype in data.etypes:
            # 获取该类型节点的特征数据
            feat = data.edges[etype].data['feat']  # 假设特征存储在 'feat' 字段
            # 获取特征维度，并添加到 in_dims 列表中
            if feat is not None:
                edge_features[etype] = feat
        edge_features = {etype: feats.to(self.device) for etype, feats in edge_features.items()}

        return edge_features

    def attack(self,
               args_init,
               model,
               data,
               node_features,
               edge_features,
               labels,
               target_mask,
               feat_norm=None,
               adj_norm_func=None):
        r"""

        Description
        -----------
        Attack process consists of injection and feature update.

        Parameters
        ----------
        model : torch.nn.module
            Model implemented based on ``torch.nn.module``.
        adj : scipy.sparse.csr.csr_matrix
            Adjacency matrix in form of ``N * N`` sparse matrix.
        features : torch.FloatTensor
            Features in form of ``N * D`` torch float tensor.
        target_mask : torch.Tensor
            Mask of attack target nodes in form of ``N * 1`` torch bool tensor.
        feat_norm : str, optional
            Type of feature normalization, ['arctan', 'tanh']. Default: ``None``.
        adj_norm_func : func of utils.normalize, optional
            Function that normalizes adjacency matrix. Default: ``None``.

        Returns
        -------
        adj_attack : scipy.sparse.csr.csr_matrix
            Adversarial adjacency matrix in form of :math:`(N + N_{inject})\times(N + N_{inject})` sparse matrix.
        features_attack : torch.FloatTensor
            Features of nodes after attacks in form of :math:`N_{inject}` * D` torch float tensor.

        """

        time_start = time.time()
        model.to(self.device)
        # n_total, n_feat = features.shape
        # features = utils.feat_preprocess(features=features,
        #                                  feat_norm=model.feat_norm if feat_norm is None else feat_norm,
        #                                  device=self.device)
        # adj_tensor = utils.adj_preprocess(adj=adj,
        #                                   adj_norm_func=model.adj_norm_func if adj_norm_func is None else adj_norm_func,
        #                                   model_type=model.model_type,
        #                                   device=self.device)
        pred_origin = model(data, node_features, edge_features)['app']
        if 'robustness' in args_init.task:
            # labels_origin = labels
            labels_origin = torch.argmax(pred_origin, dim=1)
        elif 'robustness-improve' in args_init.task:
            labels_origin = labels
            # labels_origin = torch.argmax(pred_origin, dim=1)
        test_score_sur_ori, acc_list_sur_ori = self.evaluate(model, data, node_features, edge_features, labels_origin, target_mask)
        print("Test score after attack for surrogate model: {:.4f}.".format(test_score_sur_ori), acc_list_sur_ori)
        if 'robustness' in args_init.task:
            print("上述结果是以surrogate model自己的预测结果作为ground truth的准确率，因此为100%")
        elif 'robustness-improve' in args_init.task:
            print("上述结果是surrogate model预测结果对于ground truth的准确率")
        data_atk, num_attacked_node, risk_idx = self.injection(data=data,
                                  labels_sur_pred=labels_origin,
                                  n_inject=self.n_inject_max,
                                  n_edge_max=self.n_edge_max,
                                  target_mask=target_mask)

        # 对新插入的user的feature进行随机初始化
        attacked_num = self.n_inject_max
        feat_dim = data_atk.nodes['user'].data['feat'].shape[1]
        data_atk.nodes['user'].data['feat'][-attacked_num:] = (torch.rand((attacked_num, feat_dim))*0.5).to(self.device)

        risk_idx = []
        pred_init = model(data_atk, self.process(data_atk), self.edge_process(data_atk))['app']
        labels_init = torch.argmax(pred_init, dim=1)
        for pred_idx, pred_i in enumerate(labels_init):
            if (pred_i == 1 or pred_i == 2) and target_mask[pred_idx]:
                risk_idx.append(pred_idx)
        # 更新新插入的节点特征
        data_atk, node_features_attack, edge_features_attack = self.update_features(model=model,
                                                         data_org=data,
                                                         data=data_atk,
                                                         attacked_num=attacked_num,
                                                         risk_idx=risk_idx,
                                                         labels_origin=labels_origin,
                                                         target_mask=target_mask)
        time_end = time.time()
        if self.verbose:
            print("Attack runtime: {:.4f}.".format(time_end - time_start))

        return data_atk, node_features_attack, edge_features_attack, labels_origin

    def injection(self,
                  data,
                  labels_sur_pred,
                  n_inject,
                  n_edge_max,
                  target_mask):
        r"""

        Description
        -----------
        Randomly inject nodes to target nodes.

        Parameters
        ----------
        adj : scipy.sparse.csr.csr_matrix
            Adjacency matrix in form of ``N * N`` sparse matrix.
        n_inject : int
            Number of injection.
        n_node : int
            Number of all nodes.
        target_mask : torch.Tensor
            Mask of attack target nodes in form of ``N * 1`` torch bool tensor.

        Returns
        -------
        adj_attack : scipy.sparse.csr.csr_matrix
            Adversarial adjacency matrix in form of :math:`(N + N_{inject})\times(N + N_{inject})` sparse matrix.

        """

        data_atk = copy.deepcopy(data)
        # risk_idx = np.where(target_mask.cpu().numpy())[0]
        risk_idx = []
        for pred_idx, pred_i in enumerate(labels_sur_pred):
            if (pred_i==1 or pred_i==2) and target_mask[pred_idx]:
                risk_idx.append(pred_idx)
        num_attacked_node = len(risk_idx)

        start = len(data_atk.nodes['user'].data['feat'])
        fake_app_start = len(data_atk.nodes['app'].data['feat'])

        # for idx in risk_idx:
        #     first_row = torch.zeros(n_inject)
        #     second_row = torch.arange(n_inject)
        #
        #     edges_a2u = torch.stack([first_row, second_row])
        #     edges_a2u[0, :] = idx
        #     edges_a2u[1, :] = edges_a2u[1, :] + start
        #     edges_a2u = edges_a2u.to(torch.int64).to(self.device)
        #     # edge_list.append(edges)
        #     data_atk.add_edges(u=edges_a2u[0], v=edges_a2u[1], etype=('app', 'edges_18', 'user'))
        #     data_atk.add_edges(u=edges_a2u[1], v=edges_a2u[0], etype=('user', 'edges_1', 'app'))
        #     start += n_inject

        if num_attacked_node <= n_edge_max:
            n_edge_max = num_attacked_node
        for idx in range(n_inject):
            first_row = torch.zeros(n_edge_max)
            second_row = torch.ones(n_edge_max)*idx

            edges_a2u = torch.stack([first_row, second_row])
            edges_a2u[0, :] = torch.from_numpy(np.array(random.sample(risk_idx, n_edge_max)))
            edges_a2u[1, :] = edges_a2u[1, :] + start
            edges_a2u = edges_a2u.to(torch.int64).to(self.device)
            # edge_list.append(edges)
            data_atk.add_edges(u=edges_a2u[0], v=edges_a2u[1], etype=('app', 'edges_18', 'user'))
            data_atk.add_edges(u=edges_a2u[1], v=edges_a2u[0], etype=('user', 'edges_1', 'app'))


        return data_atk, num_attacked_node, risk_idx


    def update_features(self,
                        model,
                        data_org,
                        data,
                        attacked_num,
                        risk_idx,
                        labels_origin,
                        target_mask):

        n_epoch = self.n_epoch
        epsilon = self.epsilon
        feat_lim_min, feat_lim_max = self.feat_lim_min, self.feat_lim_max


        model.eval()
        epoch_bar = tqdm(range(n_epoch), disable=not self.verbose)
        lll = data.nodes['app'].data['label'][target_mask]
        print('labels_0:', (lll == 0).sum().item(), ', labels_1:', (lll == 1).sum().item(), ', labels_2:',
              (lll == 2).sum().item())
        for i in epoch_bar:

            node_features = self.process(data)
            edge_features = self.edge_process(data)
            for ntype in node_features:
                if ntype == 'user':
                    node_features[ntype].requires_grad_(True)
                    # node_features[ntype].retain_grad()

            pred = model(data, node_features, edge_features)['app'][risk_idx]
            if i==0:
                pred_first = pred.clone()
            pred_loss = self.loss(pred, labels_origin[risk_idx]).to(self.device)

            # node_features1 = self.process(data_org) # 原始特征
            # data_3 = copy.deepcopy(data_org)
            # data_3.edges['edges_1'].data['feat'] = torch.zeros_like(data_3.edges['edges_1'].data['feat'])
            # data_3.edges['edges_18'].data['feat'] = torch.zeros_like(data_3.edges['edges_18'].data['feat'])
            # pred3 = model(data_3, node_features1)['app'][target_mask]
            # ddd = pred3.argmax(dim=-1)

            pred_loss.backward()
            grad = node_features['user'].grad.data.clone()
            node_features['user'].grad.zero_()
            node_features['user'] = node_features['user'].detach()
            features_attack = node_features['user'][-attacked_num:] + epsilon * grad[-attacked_num:].sign()

            try:
                features_attack = torch.clamp(features_attack, feat_lim_min.to(self.device), feat_lim_max.to(self.device))
            except AttributeError:
                features_attack = torch.clamp(features_attack, feat_lim_min, feat_lim_max)
            features_attack = features_attack.detach()
            b = torch.cat([node_features['user'][:-attacked_num], features_attack], dim=0)
            # node_features['user'] = node_features['user'] + b
            data.nodes['user'].data['feat'] = b
            node_features_test = self.process(data)
            edge_features_test = self.edge_process(data)

            test_score_sur, acc_list = self.evaluate(model, data, node_features_test, edge_features_test, labels_origin, target_mask)
            # pred2 = model(data, node_features_test)['app'][target_mask]
            # ccc = pred2.argmax(dim=-1)
            # test_score = ccc.eq(bbb).sum().item() / ccc.size(0)
            print('epoch:', i, ', test_score_sur:', test_score_sur, ', every: ', acc_list, ', loss: ', pred_loss)

            # if self.early_stop:
            #     self.early_stop(test_score)
            #     if self.early_stop.stop:
            #         if self.verbose:
            #             print("Attack early stopped.Surrogate test score: {:.4f}".format(test_score_sur))
            #         self.early_stop = EarlyStop()
            #
            #         return data, node_features_test
            if self.verbose:
                epoch_bar.set_description(
                    "Epoch {}, Loss: {:.4f}, Surrogate test score: {:.4f}".format(i, pred_loss, test_score_sur))
        if self.verbose:
            print('test_score_sur:', test_score_sur, ', every: ', acc_list)

        return data, node_features_test, edge_features_test
