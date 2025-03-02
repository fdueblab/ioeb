import os
import sys
import glob

current_file_path = os.path.abspath(__file__)
current_dir_path = os.path.dirname(current_file_path)
sys.path.append(current_dir_path)

from torch.xpu import device
from copy import deepcopy
from os import times

import argparse
import copy, time
import random
import numpy as np
import torch
#from torch_geometric.data import Data
#from torch_geometric.utils import to_undirected, k_hop_subgraph
from collections import Counter
from sklearn.metrics import roc_auc_score

from models_bd.GTA_test import Backdoor
import heuristic_selection as hs

from robustness.grb.trainer.trainer import Trainer
from robustness.grb.attack.injection import FGSM_test_simple as FGSM_test
import torch
#import robustness.grb.utils as utils
import scipy.sparse as sp
from tqdm import tqdm

def node_process(data, device):
	node_features = {ntype: data.nodes[ntype].data['feat'].to(device) for ntype in data.ntypes}
	return node_features

def edge_process(data, device):
	edge_features = {etype: data.edges[etype].data['feat'].to(device) for etype in data.etypes}
	return edge_features

# defense
def defense(args, model, dataset, node_features, edge_features, new_train_mask, new_test_mask, method, device=None, student_model=None):
	if method == 'none':
		return model
	elif method == 'ft':
		return finetune(args, model, dataset, node_features, edge_features, new_train_mask, new_test_mask, device)
	elif method == 'prune':
		return prune(args, model)
	elif method == 'fp':
		model_pruned = prune(args, model)
		return finetune(args, model_pruned, dataset, node_features, edge_features, new_train_mask, new_test_mask, device)
	elif method == 'distillation':
		return distillation(args, model, student_model, dataset)
	else:
		raise ValueError('Invalid defense method: {}'.format(method))


def finetune(args, model, dataset, node_features, edge_features, new_train_mask, new_test_mask, device):
	optimizer = torch.optim.Adam(model.parameters(), lr=args.ft_lr)
	labels_train = dataset.nodes['app'].data['label'][new_train_mask].clone()
	labels_train = labels_train.to(torch.int64)
	class_counts = Counter(labels_train.cpu().numpy())
	# 输出样本类别数目
	#print(class_counts)
	num_classes = len(set(dataset.nodes['app'].data['label'].cpu().numpy()))
	class_weights = {class_id: 0.0 for class_id in range(num_classes)}
	for class_id, count in class_counts.items():
		class_weights[class_id] = 1.0 / count
	#class_weights = {class_id: 1.0 / count for class_id, count in class_counts.items()}
	# 将权重转换为张量
	#weights = torch.tensor([class_weights[i] for i in range(len(class_counts))], dtype=torch.float)
	weights = torch.tensor([class_weights[i] for i in range(num_classes)], dtype=torch.float).to(device)
	weights = weights.to(device)

	criterion = torch.nn.CrossEntropyLoss(weight=weights)
	for epoch in range(1, args.ft_epochs + 1):
		model.train()
		optimizer.zero_grad()
		if model.__class__.__name__=='HatthGCN':
			output = model(dataset, node_features, edge_features)['app']
		else:
			output = model(dataset, node_features)['app']
		loss = criterion(output[new_train_mask], labels_train)
		loss.backward()
		optimizer.step()
		# if epoch % 10 == 0:
		#     print('Epoch {}, Loss: {:.4f}'.format(epoch, loss.item()))
	return model


def prune(args, model):
	# 遍历模型中的所有模块
	for module in model.modules():
		# 对每个模块中的参数（权重和偏置）进行操作
		for name, param in module.named_parameters():
			# 只处理可训练的参数
			if param.requires_grad:
				# 计算需要保留的参数数量
				total_params = param.numel()
				# 计算需要剪枝的参数数量
				num_params_to_prune = int(total_params * args.prune_ratio)
				# 如果没有参数需要剪枝，直接跳过
				if num_params_to_prune == 0:
					continue
				# 将参数的绝对值进行排序，并找到剪枝阈值
				threshold = torch.kthvalue(param.abs().flatten(), k=num_params_to_prune).values
				# 将绝对值小于等于阈值的参数置为0
				param.data[param.abs() <= threshold] = 0
	return model



# train_watermark_model

def train_model_shallow(args, model, dataset_ori):
	device = args.device
	train_mask = dataset_ori.nodes['app'].data['train_mask']
	# subset a train_mask
	train_idx = torch.where(train_mask == True)[0]
	sub_ran_train_idx = torch.randperm(len(train_idx))[:int(len(train_idx) / 2)]
	sub_ran_idx = train_idx[sub_ran_train_idx]
	train_mask[sub_ran_idx] = False
	test_mask = dataset_ori.nodes['app'].data['test_mask']
	labels = dataset_ori.nodes['app'].data['label']
	labels = labels.to(torch.int64).to(device)
	class_counts = Counter(labels.cpu().numpy())
	# 输出样本类别数目
	print(class_counts)
	class_weights = {class_id: 1.0 / count for class_id, count in class_counts.items()}
	# 将权重转换为张量
	weights = torch.tensor([class_weights[i] for i in range(len(class_counts))], dtype=torch.float).to(device)
	optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)
	criterion = torch.nn.CrossEntropyLoss(weight=weights)  # 加入权重


	def train():
		node_features = node_process(dataset_ori,device=args.device)
		edge_features = edge_process(dataset_ori,device=args.device)
		labels = dataset_ori.nodes['app'].data['label'].to(torch.long).to(args.device)
		model.train()
		optimizer.zero_grad()
		if model.__class__.__name__=='HatthGCN':
			out = model(dataset_ori, node_features, edge_features)['app']
		else:
			out = model(dataset_ori, node_features)['app']
		loss = criterion(out[train_mask], labels[train_mask])
		loss.backward()
		optimizer.step()
		return loss

	# TODO args
	epochs = 10

	for epoch in range(0, epochs):
		loss = train()
		print(f'Epoch: {epoch:03d}, Loss: {loss:.4f}')

	acc,_ = evaluate_(args, model, dataset_ori, test_mask)
	print(f'Test Accuracy: {acc:.4f}')
	return model


def defense_watermark(args, test_model, data):
	device = args.device
	test_model_defense = copy.deepcopy(test_model)
	dataset_de = copy.deepcopy(data)
	# new_train_mask get from dataset.test_mask 1/2
	new_train_mask = copy.deepcopy(dataset_de.nodes['app'].data['test_mask'])
	#new_train_mask = copy.deepcopy(dataset_de.nodes['app'].data['train_mask'])
	# 找到所有true的位置，随机选取一半的位置，将其置为false
	idx = torch.where(new_train_mask == True)[0]
	# idx = np.random.choice(idx, int(len(idx)/2), replace=False) 请用torch的方法
	idx = torch.randperm(len(idx))[:int(len(idx) / 3)]
	new_train_mask[idx] = False
	dataset_de.nodes['app'].data['train_mask'] = new_train_mask
	new_test_mask = copy.deepcopy(dataset_de.nodes['app'].data['test_mask'])
	# 找到现在的train_mask中为true的位置，将其置为false
	idx = torch.where(new_train_mask == True)[0]
	new_test_mask[idx] = False
	dataset_de.nodes['app'].data['test_mask'] = new_test_mask

	#test_model_defense = defense(args, test_model_defense, dataset_de, args.method, device, None)
	node_features = node_process(dataset_de, device)
	edge_features = edge_process(dataset_de, device)
	test_model_defense = defense(args, test_model_defense, dataset_de, node_features, edge_features,
								 new_train_mask, new_test_mask, args.method, device, None)

	return test_model_defense

def inject_trigger(args, dataset, poisoned_nodes, trigger_size, target_class, poison_type='stable', poison_model=None, cross_mode=False):
	if not cross_mode:
		dataset.nodes['app'].data['label'][poisoned_nodes] = target_class

	# 获取edge_feature的维度
	edge_feature_dim = dataset.edges['edges_1'].data['feat'].shape[1]
	# 获取node_feature的维度
	feature_dim = dataset.nodes['user'].data['feat'].shape[1]

	# 初始化特征
	if poison_type == 'stable':
		# 对于稳定的触发器，直接将触发器的特征设置为全0.1
		trigger_feat = torch.ones((len(poisoned_nodes)*args.trigger_size, feature_dim))*0.0
		trigger_feat[:10] = 5.0
		edge_feat = torch.ones((len(poisoned_nodes)*args.trigger_size, edge_feature_dim))*0.5
		trigger_feat = trigger_feat.to(args.device)
		edge_feat = edge_feat.to(args.device)
	elif poison_type == 'dynamic' and poison_model is not None:
		# 对于动态触发器，使用poison_model生成触发器特征
		node_features = node_process(dataset,device=args.device)
		poison_node_features = node_features['app'][poisoned_nodes]
		trigger_feat, edge_feat = poison_model(poison_node_features)
		trigger_feat = trigger_feat.view(-1, feature_dim)
		edge_feat = edge_feat.view(-1, edge_feature_dim)
		trigger_feat = trigger_feat.to(args.device)
		edge_feat = edge_feat.to(args.device)
	else:
		raise ValueError('Unknown poison type')
	

	if cross_mode:
		# 如果cross_mode包含noise,在特征中添加噪声
		if args.cross_mode and 'noise' in args.cross_mode:
			# 生成高斯噪声
			noise_node = torch.randn_like(trigger_feat) * args.sigma
			noise_edge = torch.randn_like(edge_feat) * args.sigma
			
			# 将噪声添加到特征中
			trigger_feat = trigger_feat + noise_node 
			edge_feat = edge_feat + noise_edge

	# 将触发器特征插入到数据集user节点中
	ori_user_num = dataset.num_nodes('user')
	item = ori_user_num
	dataset.add_nodes(num=len(poisoned_nodes)*args.trigger_size, ntype='user', data={'feat': trigger_feat, 'label': torch.zeros(len(poisoned_nodes)*args.trigger_size).to(torch.int64).to(args.device)})
	# 插入边,0->user,1->app
	edges = [[],[]]
	for idx in range(len(poisoned_nodes)):
		# 从item开始插入
		# TODO prune for cross mode
		for i in range(args.trigger_size):
			edges[0].append(item)
			edges[1].append(poisoned_nodes[idx])
			item += 1
	edges = torch.tensor(edges).to(args.device)
	dataset.add_edges(edges[1], edges[0], etype=('app', 'edges_18', 'user'), data={'feat': torch.zeros_like(edge_feat).to(args.device), 'label': torch.zeros(len(poisoned_nodes)*args.trigger_size).to(torch.int64).to(args.device)})
	dataset.add_edges(edges[0], edges[1], etype=('user', 'edges_1', 'app'), data={'feat': edge_feat, 'label': torch.zeros(len(poisoned_nodes)*args.trigger_size).to(torch.int64).to(args.device)})

	if 'poison_idx' not in dataset.nodes['app'].data.keys():
		dataset.nodes['app'].data['poison_idx'] = torch.zeros(dataset.nodes['app'].data['label'].shape[0]).to(torch.int64).to(args.device)
	if not cross_mode:
		dataset.nodes['app'].data['poison_idx'][poisoned_nodes] = 1
	return dataset

def evaluate_(args, net, g, mask):
	node_features = node_process(g, device=args.device)
	edge_features = edge_process(g,device=args.device)
	labels = g.nodes['app'].data['label'].to(torch.long).to(args.device)
	test_logits = []
	if net.__class__.__name__=='HatthGCN':
		logits = net(g, node_features, edge_features)['app']
	else:
		logits = net(g, node_features)['app']
	criterion = torch.nn.CrossEntropyLoss()
	test_loss = criterion(logits[mask], labels[mask])
	_pred = torch.argmax(logits[mask], dim=1, keepdim=False)
	truth = labels[mask].cpu().numpy()
	output = _pred.cpu().numpy()
	acc = (output == truth).sum() / truth.shape[0]
	acc_0 = (output[truth==0] == truth[truth==0]).sum() / truth[truth==0].shape[0]
	acc_1 = (output[truth == 1] == truth[truth == 1]).sum() / truth[truth == 1].shape[0]
	acc_2 = (output[truth == 2] == truth[truth == 2]).sum() / truth[truth == 2].shape[0]
	num_0 = (output[truth==0] == truth[truth==0]).sum()
	num_1 = (output[truth == 1] == truth[truth == 1]).sum()
	num_2 = (output[truth == 2] == truth[truth == 2]).sum()
	return acc, [[acc_0, acc_1, acc_2],[num_0, num_1, num_2],[sum(truth==0), sum(truth==1), sum(truth==2)]]

def evaluate_trigger(args, net, g, mask):
	node_features = node_process(g, device=args.device)
	edge_features = edge_process(g,device=args.device)
	labels = g.nodes['app'].data['label'].to(torch.long).to(args.device)
	test_logits = []
	#if net.__class__.__name__=='HatthGCN':
	#	logits = net(g, node_features, edge_features)['app']
	#else:
	#	logits = net(g, node_features)['app']
	logits = net(g, node_features, edge_features)['app']
	criterion = torch.nn.CrossEntropyLoss()
	test_loss = criterion(logits[mask], labels[mask])
	_pred = torch.argmax(logits[mask], dim=1, keepdim=False)
	truth = labels[mask].cpu().numpy()
	output = _pred.cpu().numpy()
	poison_idx = g.nodes['app'].data['poison_idx'][mask].cpu().numpy()
	unpoison_mask = poison_idx == 0
	poison_mask = poison_idx == 1
	unpoison_truth = truth[unpoison_mask]
	unpoison_output = output[unpoison_mask]
	poison_truth = truth[poison_mask]
	poison_output = output[poison_mask]
	unpoison_acc = (unpoison_output == unpoison_truth).sum() / unpoison_truth.shape[0]
	poison_acc = (poison_output == poison_truth).sum() / poison_truth.shape[0]
	unpoison_acc_0 = (unpoison_output[unpoison_truth==0] == unpoison_truth[unpoison_truth==0]).sum() / unpoison_truth[unpoison_truth==0].shape[0]
	unpoison_acc_1 = (unpoison_output[unpoison_truth == 1] == unpoison_truth[unpoison_truth == 1]).sum() / unpoison_truth[unpoison_truth == 1].shape[0]
	unpoison_acc_2 = (unpoison_output[unpoison_truth == 2] == unpoison_truth[unpoison_truth == 2]).sum() / unpoison_truth[unpoison_truth == 2].shape[0]
	return unpoison_acc, poison_acc, [[unpoison_acc_0, unpoison_acc_1, unpoison_acc_2],[sum(unpoison_truth==0), sum(unpoison_truth==1), sum(unpoison_truth==2)]]
