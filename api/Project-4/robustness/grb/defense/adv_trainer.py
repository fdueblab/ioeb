import os
import time

import torch
import torch.nn.functional as F
from tqdm.auto import tqdm
from collections import Counter
import robustness.grb.utils as utils
from robustness.grb.evaluator import metric


class AdvTrainer(object):
    def __init__(self,
                 g,
                 node_features,
                 edge_features,
                 labels,
                 train_mask,
                 val_mask,
                 test_mask,
                 optimizer,
                 loss,
                 attack=None,
                 attack_mode="injection",
                 lr_scheduler=None,
                 lr_patience=100,
                 lr_factor=0.75,
                 lr_min=1e-5,
                 early_stop=None,
                 early_stop_patience=100,
                 early_stop_epsilon=1e-5,
                 # eval_metric=metric.eval_acc,
                 device='cpu'):

        # Load data
        self.g = g
        self.node_features = node_features
        self.edge_features = edge_features
        self.labels = labels
        self.train_mask = train_mask
        self.val_mask = val_mask
        self.test_mask = test_mask
        self.num_nodes = node_features['app'].shape[0]

        class_counts = Counter(labels.cpu().numpy())
        class_weights = {class_id: 1.0 / count for class_id, count in class_counts.items()}
        self.weights = torch.tensor([class_weights[i] for i in range(len(class_counts))], dtype=torch.float)

        self.device = device
        self.weights.to(self.device)

        # Settings
        assert isinstance(optimizer, torch.optim.Optimizer), "Optimizer should be instance of torch.optim.Optimizer."
        self.optimizer = optimizer
        self.loss = loss
        # self.eval_metric = eval_metric
        self.attack = attack
        self.attack_mode = attack_mode

        # Learning rate scheduling
        if lr_scheduler:
            if isinstance(lr_scheduler, (torch.optim.lr_scheduler._LRScheduler,
                                         torch.optim.lr_scheduler.ReduceLROnPlateau)):
                self.lr_scheduler = lr_scheduler
            else:
                self.lr_scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
                    self.optimizer,
                    mode='min',
                    patience=lr_patience,
                    factor=lr_factor,
                    min_lr=lr_min,
                    verbose=True)
        else:
            self.lr_scheduler = None

        # Early stop
        if early_stop:
            if isinstance(early_stop, EarlyStop):
                self.early_stop = early_stop
            else:
                self.early_stop = EarlyStop(patience=early_stop_patience,
                                            epsilon=early_stop_epsilon)
        else:
            self.early_stop = None

    def train(self,
              args_init,
              model,
              n_epoch,
              save_dir=None,
              save_name=None,
              eval_every=10,
              save_after=0,
              save_fre=1,
              train_mode="trasductive",
              verbose=True):
        model.to(self.device)
        model.train()

        if save_dir is None:
            cur_time = time.strftime("%Y_%m_%d_%H_%M_%S", time.localtime())
            save_dir = "./tmp_{}".format(cur_time)
        else:
            if not os.path.exists(save_dir):
                os.makedirs(save_dir)

        if save_name is None:
            save_name = "checkpoint.pt"
        else:
            if save_name.split(".")[-1] != "pt":
                save_name = save_name + ".pt"

        train_score_list = []
        val_score_list = []
        best_val_score = 0.0
        g = self.g
        node_features = self.node_features
        edge_features = self.edge_features
        train_mask = self.train_mask
        val_mask = self.val_mask
        labels = self.labels

        if train_mode == "inductive":
            # Inductive setting
            train_val_mask = torch.logical_or(train_mask, val_mask)
            train_val_index = torch.where(train_val_mask)[0]
            train_index, val_index = torch.where(train_mask)[0], torch.where(val_mask)[0]
            train_index_induc, val_index_induc = utils.get_index_induc(train_index, val_index)
            train_mask_induc = torch.zeros(len(train_val_index), dtype=bool)
            train_mask_induc[train_index_induc] = True
            val_mask_induc = torch.zeros(len(train_val_index), dtype=bool)
            val_mask_induc[val_index_induc] = True

            node_features_train = node_features
            edge_features_train = edge_features
            g_train = g
            # features_val = features[train_val_mask]
            # adj_train = utils.adj_preprocess(self.adj,
            #                                  adj_norm_func=model.adj_norm_func,
            #                                  mask=self.train_mask,
            #                                  model_type=model.model_type,
            #                                  device=self.device)
            # adj_val = utils.adj_preprocess(self.adj,
            #                                adj_norm_func=model.adj_norm_func,
            #                                mask=train_val_mask,
            #                                model_type=model.model_type,
            #                                device=self.device)
            # num_train = torch.sum(train_mask).item()
            epoch_bar = tqdm(range(n_epoch))
            for epoch in epoch_bar:
                save_name_iter = f'model_{epoch}.pt'
                logits = model(g_train, node_features_train, edge_features_train)['app']
                train_loss = self.loss(weight=self.weights.to(self.device))(logits[train_mask], labels[train_mask.to(self.device)])
                logits_val = model(g, node_features, edge_features)['app']
                val_loss = self.loss()(logits_val[val_mask], labels[val_mask])

                self.optimizer.zero_grad()
                train_loss.backward()
                self.optimizer.step()

                if self.attack is not None:
                    if self.attack_mode == "injection":
                        g_train, node_features_train, \
                            edge_features_train, _ = self.attack.attack(
                            args_init,
                            model=model,
                            data=g,
                            node_features=node_features,
                            edge_features=edge_features,
                            labels=labels,
                            target_mask=train_mask)

                if self.lr_scheduler:
                    self.lr_scheduler.step(val_loss)
                if self.early_stop:
                    self.early_stop(val_loss)
                    if self.early_stop.stop:
                        print("Training: early stopped.")
                        utils.save_model(model, save_dir, "final_" + save_name)
                        return

                if epoch % eval_every == 0:
                    train_score = (torch.argmax(logits[train_mask], dim=1) == labels[train_mask]).float().sum() / len(train_mask)
                    # train_score = self.eval_metric(out, labels[train_mask], mask=None)
                    val_score = (torch.argmax(logits_val[train_val_mask], dim=1) == labels[train_val_mask]).float().sum() / len(train_val_mask)
                    # val_score = self.eval_metric(out_val, labels[train_val_mask], mask=val_mask_induc)
                    train_score_list.append(train_score)
                    val_score_list.append(val_score)
                    if val_score > best_val_score:
                        best_val_score = val_score
                        if epoch > save_after:
                            print(
                                "Training: Epoch {:05d} | Best validation score: {:.4f}".format(epoch, best_val_score))
                            utils.save_model(model, save_dir, save_name, verbose=verbose)
                    print(
                        'Training: Epoch {:05d} | Train loss {:.4f} | Train score {:.4f} '
                        '| Val loss {:.4f} | Val score {:.4f}'.format(
                            epoch, train_loss, train_score, val_loss, val_score))
                if epoch % save_fre == 0:
                    utils.save_model(model, save_dir, save_name_iter, verbose=verbose)

        utils.save_model(model, save_dir, "final_" + save_name)

    def inference(self, model):
        r"""

        Description
        -----------
        Inference of a GNN model.

        Parameters
        ----------
        model : torch.nn.module
            Model implemented based on ``torch.nn.module``.

        Returns
        -------
        logits : torch.Tensor
            Output logits of model.

        """
        model.to(self.device)
        model.eval()
        adj = utils.adj_preprocess(self.adj,
                                   adj_norm_func=model.adj_norm_func,
                                   model_type=model.model_type,
                                   device=self.device)
        logits = model(self.features, adj)

        return logits

    def evaluate(self, model, mask=None):
        r"""

        Description
        -----------
        Evaluation of a GNN model.

        Parameters
        ----------
        model : torch.nn.module
            Model implemented based on ``torch.nn.module``.
        mask : torch.tensor, optional
            Mask of target nodes.  Default: ``None``.

        Returns
        -------
        score : float
            Score on masked nodes.

        """
        model.to(self.device)
        model.eval()
        adj = utils.adj_preprocess(self.adj,
                                   adj_norm_func=model.adj_norm_func,
                                   model_type=model.model_type,
                                   device=self.device)
        logits = model(self.features, adj)
        score = self.eval_metric(logits, self.labels, mask)

        return score


class EarlyStop(object):
    def __init__(self, patience=1000, epsilon=1e-5):
        self.patience = patience
        self.epsilon = epsilon
        self.min_loss = None
        self.stop = False
        self.count = 0

    def __call__(self, loss):
        if self.min_loss is None:
            self.min_loss = loss
        elif self.min_loss - loss > self.epsilon:
            self.count = 0
            self.min_loss = loss
        elif self.min_loss - loss < self.epsilon:
            self.count += 1
            if self.count > self.patience:
                self.stop = True
