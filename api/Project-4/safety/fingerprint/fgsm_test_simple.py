import random
import time

import numpy as np
import scipy.sparse as sp
import torch
import torch.nn.functional as F
from tqdm.auto import tqdm

from grb.attack.base import InjectionAttack, EarlyStop
from grb.evaluator import metric
from grb.utils import utils
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
                 eval_metric=metric.eval_acc,
                 early_stop=None,
                 early_stop_patience=1000,
                 early_stop_epsilon=1e-5,
                 verbose=False,
                 device='cuda:0'):
        self.device = device
        self.epsilon = epsilon
        self.n_epoch = n_epoch
        self.n_inject_max = n_inject_max
        self.n_edge_max = n_edge_max
        self.feat_lim_min = feat_lim_min
        self.feat_lim_max = feat_lim_max
        self.loss = loss
        self.eval_metric = eval_metric
        self.verbose = verbose

        # Early stop
        if early_stop:
            if isinstance(early_stop, EarlyStop):
                self.early_stop = early_stop
            else:
                self.early_stop = EarlyStop(patience=early_stop_patience,
                                            epsilon=early_stop_epsilon)
        else:
            self.early_stop = None

    def evaluate_acc(self, model, data, node_features, test_mask):
        model.eval()
        # with torch.no_grad():
        logits = model(data, node_features)['app']
        pred = logits[test_mask].argmax(dim=-1)
        labels = data.nodes['app'].data['label'][test_mask]
        acc = pred.eq(labels).sum().item() / labels.size(0)
        return acc

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

    def attack(self,
               model,
               data,
               node_features,
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
        pred_origin = model(data, node_features)['app']
        labels_origin = torch.argmax(pred_origin[target_mask], dim=1)
        data_atk = self.injection(data=data,
                                    n_inject=self.n_inject_max,
                                    target_mask=target_mask)

        # torch.rand((num_nodes, feature_dim))
        #features_attack = np.zeros((self.n_inject_max, n_feat))
        #data_atk.number_of_nodes('user')
        target_mask = target_mask.cpu().numpy()
        attacked_num = np.where(target_mask)[0].shape[0] * self.n_inject_max
        feat_dim = data_atk.nodes['user'].data['feat'].shape[1]
        data_atk.nodes['user'].data['feat'][-attacked_num:] = torch.rand((attacked_num, feat_dim)).to(self.device)
        # data_atk.nodes['app'].data['feat'][-attacked_num:] = torch.rand((attacked_num, feat_dim)).to(self.device)
        data_atk, features_attack = self.update_features(model=model,
                                               data_org=data,
                                               data=data_atk,
                                               attacked_num=attacked_num,
                                               labels_origin=labels_origin,
                                               target_mask=target_mask)
        time_end = time.time()
        if self.verbose:
            print("Attack runtime: {:.4f}.".format(time_end - time_start))

        return data_atk, features_attack

    def injection(self,
                  data,
                  n_inject,
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
        target_mask = target_mask.cpu().numpy()
        test_index = np.where(target_mask)[0]

        start = len(data_atk.nodes['user'].data['feat'])
        fake_app_start = len(data_atk.nodes['app'].data['feat'])
        for idx in test_index:
            first_row = torch.zeros(n_inject)
            second_row = torch.arange(n_inject)

            edges_a2u = torch.stack([first_row, second_row])
            edges_a2u[0, :] = idx
            edges_a2u[1, :] = edges_a2u[1, :] + start
            edges_a2u = edges_a2u.to(torch.int64).to(self.device)
            # edge_list.append(edges)
            data_atk.add_edges(u=edges_a2u[0], v=edges_a2u[1], etype=('app', 'edges_18', 'user'))
            data_atk.add_edges(u=edges_a2u[1], v=edges_a2u[0], etype=('user', 'edges_1', 'app'))
            start += n_inject

            # edges_u2a = torch.stack([second_row, first_row])
            # edges_u2a[0, :] = edges_u2a[0, :] + fake_app_start
            # edges_u2a[1, :] = edges_a2u[1, :]
            # edges_u2a = edges_u2a.to(torch.int64).to(self.device)
            # data_atk.add_edges(u=edges_u2a[0], v=edges_u2a[1], etype=('app', 'edges_18', 'user'))
            # data_atk.add_edges(u=edges_u2a[1], v=edges_u2a[0], etype=('user', 'edges_1', 'app'))
            #
            # fake_app_start += n_inject


        return data_atk


    def update_features(self,
                        model,
                        data_org,
                        data,
                        attacked_num,
                        labels_origin,
                        target_mask):
        r"""

        Description
        -----------
        Update features of injected nodes.

        Parameters
        ----------
        model : torch.nn.module
            Model implemented based on ``torch.nn.module``.
        adj_attack :  scipy.sparse.csr.csr_matrix
            Adversarial adjacency matrix in form of :math:`(N + N_{inject})\times(N + N_{inject})` sparse matrix.
        features_origin : torch.FloatTensor
            Features in form of ``N * D`` torch float tensor.
        features_attack : torch.FloatTensor
            Features of nodes after attacks in form of :math:`N_{inject}` * D` torch float tensor.
        labels_origin : torch.LongTensor
            Labels of target nodes originally predicted by the model.
        target_mask : torch.Tensor
            Mask of target nodes in form of ``N * 1`` torch bool tensor.
        feat_norm : str, optional
            Type of feature normalization, ['arctan', 'tanh']. Default: ``None``.
        adj_norm_func : func of utils.normalize, optional
            Function that normalizes adjacency matrix. Default: ``None``.

        Returns
        -------
        features_attack : torch.FloatTensor
            Updated features of nodes after attacks in form of :math:`N_{inject}` * D` torch float tensor.

        """

        epsilon = self.epsilon
        n_epoch = self.n_epoch
        feat_lim_min, feat_lim_max = self.feat_lim_min, self.feat_lim_max


        model.eval()
        epoch_bar = tqdm(range(n_epoch), disable=not self.verbose)
        lll = data.nodes['app'].data['label'][target_mask]
        print('labels_0:', (lll == 0).sum().item(), ', labels_2:', (lll == 1).sum().item(), ', labels_2:',
              (lll == 2).sum().item())
        for i in epoch_bar:
            # features_attack = data.nodes['user'].data['feat'][-attacked_num:]
            # features_attack.requires_grad_(True)
            # features_attack.retain_grad()

            node_features = self.process(data)
            for ntype in node_features:
                node_features[ntype].requires_grad_(True)
                node_features[ntype].retain_grad()
            #data.edges['edges_1'].data['feat'].requires_grad_(True)
            pred = model(data, node_features)['app'][target_mask]
            if i == 0:
                bbb = pred.argmax(dim=-1)
                print('orginal pred_0:', (bbb == 0).sum().item(), ', pred_1:',
                      (bbb == 1).sum().item(), ', pred_2:',  (bbb == 2).sum().item())
            #test_score = self.evaluate_acc(model, data, node_features, target_mask)
            pred_loss = self.loss(pred, labels_origin).to(self.device)

            # ############################## test
            node_features1 = self.process(data_org)
            # node_features1['user'].requires_grad_(True)
            # node_features1['user'].retain_grad()
            # node_features1['app'].requires_grad_(True)
            # node_features1['app'].retain_grad()
            # pred2 = model(data_org, node_features1)['app'][target_mask]
            # ccc = pred2.argmax(dim=-1)
            # pred_loss = self.loss(pred2, labels_origin).to(self.device)
            data_3 = copy.deepcopy(data_org)
            data_3.edges['edges_1'].data['feat'] = torch.zeros_like(data_3.edges['edges_1'].data['feat'])
            data_3.edges['edges_18'].data['feat'] = torch.zeros_like(data_3.edges['edges_18'].data['feat'])
            pred3 = model(data_3, node_features1)['app'][target_mask]
            ddd = pred3.argmax(dim=-1)
            # data_4 = copy.deepcopy(data_org)
            # data_4.nodes['user'].data['feat'] = torch.zeros_like(data_4.nodes['user'].data['feat'])
            # node_features2 = self.process(data_4)
            # pred4 = model(data_4, node_features2)['app'][target_mask]
            # eee = pred4.argmax(dim=-1)
            # data_5 = copy.deepcopy(data_org)
            # data_5.nodes['app'].data['feat'] = torch.zeros_like(data_5.nodes['app'].data['feat'])
            # node_features3 = self.process(data_5)
            # pred5 = model(data_5, node_features3)['app'][target_mask]
            # fff = pred5.argmax(dim=-1)

            model.zero_grad()
            pred_loss.backward()
            #grad = node_features['app'].grad.data
            #grad_test = grad[-attacked_num:]
            grad = node_features['user'].grad.data
            #grad_test = data.edges['edges_1'].data['feat'].grad.data
            features_attack = node_features['user'][-attacked_num:] + epsilon * grad[-attacked_num:].sign()

            try:
                features_attack = torch.clamp(features_attack, feat_lim_min.to(self.device), feat_lim_max.to(self.device))
            except AttributeError:
                features_attack = torch.clamp(features_attack, feat_lim_min, feat_lim_max)
            features_attack = features_attack.detach()
            b = torch.cat([torch.zeros_like(node_features['user'][:-attacked_num]), features_attack], dim=0)
            node_features['user'] = node_features['user'] + b
            data.nodes['user'].data['feat'] = node_features['user']
            node_features_test = self.process(data)

            pred2 = model(data, node_features_test)['app'][target_mask]
            ccc = pred2.argmax(dim=-1)
            test_score = ccc.eq(bbb).sum().item() / ccc.size(0)
            print('epoch:', i, ', test_score:', test_score)
            print('pred_0:', (ccc==0).sum().item(), ', pred_1:', (ccc==1).sum().item(), ', pred_2:', (ccc==2).sum().item())

            if self.early_stop:
                self.early_stop(test_score)
                if self.early_stop.stop:
                    if self.verbose:
                        print("Attack early stopped.Surrogate test score: {:.4f}".format(test_score))
                    self.early_stop = EarlyStop()

                    return data, node_features_test
            if self.verbose:
                epoch_bar.set_description(
                    "Epoch {}, Loss: {:.4f}, Surrogate test score: {:.4f}".format(i, pred_loss, test_score))
        if self.verbose:
            print("Surrogate test score: {:.4f}".format(test_score))

        return data, node_features_test
