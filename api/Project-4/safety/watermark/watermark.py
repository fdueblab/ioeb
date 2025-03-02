#!/usr/bin/env python
# coding: utf-8

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

from watermark_utils import *
from fgsm import *
from models_bd.GTA_test import Backdoor
import heuristic_selection as hs

from robustness.grb.trainer.trainer import Trainer
#from robustness.grb.attack.injection import FGSM_test
from robustness.grb.attack.injection import FGSM_test_simple as FGSM_test
import torch
import robustness.grb.utils as utils
import scipy.sparse as sp
from tqdm import tqdm

def get_parser():
	# TODO load the parameter from the config file and delete the default parameter

	parser = argparse.ArgumentParser()

	parser.add_argument('--seed', type=int, default=2, help='Random seed.')
	parser.add_argument('--device', default='cuda', help='Disables CUDA training.')
	parser.add_argument('--model_path', type=str)

	# watermark parameter
	parser.add_argument('--save_path', type=str, default='./safety-watermark',help="save path for watermark improve model")
	parser.add_argument('--n_epoch', type=int, default=500,help="epochs of finetune")

	parser.add_argument('--negative_M', type=str, default="./safety/negative_model/independent-M")
	parser.add_argument('--K', type=int, default=20, help="epochs of finetune")
	

	# TODO positive model parameter

	## setting
	parser.add_argument('--ft_epochs', type=int, default=500,
						help="epochs of finetune")
	parser.add_argument('--ft_lr', type=float, default=0.01,
						help="learning rate of finetune")
	parser.add_argument('--prune_ratio', type=float, default=0.5,
						help="prune ratio of edges")
	parser.add_argument('--ds_alpha', type=float, default=0.3,
						help="alpha of distillation")
	parser.add_argument('--method', type=str, default='fp',
						choices=['none', 'ft', 'prune', 'fp', 'distillation'],
						help="defense method")

	# watermark improve parameter
	parser.add_argument('--target_class', type=int, default=2)

	parser.add_argument('--trojan_epochs', type=int, default=200, help='Number of epochs to train trigger generator.')
	parser.add_argument('--inner_bd', type=int, default=1, help='Number of inner trigger')
	parser.add_argument('--inner_model', type=int, default=1, help='Number of inner')

	parser.add_argument('--lr', type=float, default=0.0001,
						help='Initial learning rate.')
	parser.add_argument('--trojan_lr', type=float, default=0.0,
						help='Initial learning rate.')
	parser.add_argument('--weight_decay', type=float, default=5e-4,
						help='Weight decay (L2 loss on parameters).')
	parser.add_argument('--trigger_size', type=int, default=10,
						help='tirgger_size')
	parser.add_argument('--vs_size', type=int, default=10,
						help="ratio of poisoning nodes relative to the full graph")

	# TODO delete the parameter
	parser.add_argument('--thrd', type=float, default=0.2)

	#parser.add_argument('--defense_mode', type=str, default="none",
	#					choices=['prune', 'isolate', 'none'],
	#					help="Mode of defense")
	#parser.add_argument('--prune_thr', type=float, default=0.2,
	#					help="Threshold of prunning edges")
	#parser.add_argument('--homo_loss_weight', type=float, default=0,
	#					help="Weight of optimize similarity loss")

	#parser.add_argument('--dis_weight', type=float, default=1,
	#					help="Weight of cluster distance")
	parser.add_argument('--selection_method', type=str, default='none',
						choices=['loss', 'conf', 'cluster', 'none', 'cluster_degree'],
						help='Method to select idx_attach for training trojan model (none means randomly select)')
	parser.add_argument('--evaluate_mode', type=str, default='overall',
						choices=['overall', '1by1'],
						help='Model used to attack')

	## cross mode setting
	parser.add_argument('--cross_mode', type=str, default=None,
						help="cross_mode:None,noise,prune,noise-prune")
	parser.add_argument('--cross_ratio', type=float, default=0.01,
						help="cross_ratio")
	parser.add_argument('--cross_prune', type=int, default=1,
						help="cross_prune")
	parser.add_argument('--sigma', type=float, default=2, help="cross_noise_sigma")

	# debug
	parser.add_argument('--debug', action='store_true',
						default=False, help='debug mode')
					
	args = parser.parse_known_args()[0]
	return args



class watermark:
	def __init__(self, args_main, g, node_features, edge_features, labels, train_mask, val_mask, test_mask, model):
		self.args_main = args_main
		self.g = g
		self.model = model

		self.args = get_parser()

		if self.args.debug:
			self.args.n_epoch = 1
			self.args.K = 2
			self.args.trojan_epochs = 1

		
		self.negative_M = self.args.negative_M

		self.positive_pruning_ratios_list = [0, 0, 0, 0, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0.25, 0.25, 0.25, 0.5, 0.5,
										0.5]
		self.positive_ft_epochs_list = [0, 10, 50, 100, 10, 50, 100, 10, 50, 100, 20, 40, 60, 80, 20, 40, 60,
								20, 40, 60]
		self.positive_methods_list = ['none', 'ft', 'ft', 'ft', 'fp', 'fp', 'fp', 'fp', 'fp', 'fp', 'ft', 'ft', 'ft', 'ft', 'fp',
								'fp', 'fp', 'fp', 'fp', 'fp']

	def eval_negative_model(self, args, test_model, dataset_ori_un, dataset_ori, mask, student_model):
		K = args.K

		negative_list = []

		### 从negative_M中读取.pt文件的数量
		negative_M = self.negative_M
		if not os.path.exists(negative_M):
			os.makedirs(negative_M)
		pattern = os.path.join(negative_M, '*.pt')
		# 使用glob找到所有匹配的文件
		pt_files = glob.glob(pattern)
		if len(pt_files) > 0:
			for i in range(len(pt_files)):
				negative_list.append(pt_files[i])
		if len(pt_files) <= K:
			seeds = [np.random.randint(10000, 20000) for i in range(int(K / 2 - len(pt_files)))]
			for i in range(int(K / 2 - len(pt_files))):
				seed = seeds[i]
				while os.path.join(negative_M, 'ckpt_gcn_seed_{}.pt'.format(seed)) in negative_list:
					seed = np.random.randint(10000, 20000)
				np.random.seed(seed)
				torch.manual_seed(seed)
				torch.cuda.manual_seed(seed)
				name = 'ckpt_gcn_seed_{}.pt'.format(seed)
				pt_file_name = os.path.join(negative_M, name)

				new_test_model = copy.deepcopy(student_model)
				new_test_model.to(self.args.device)
				new_dataset = copy.deepcopy(dataset_ori_un)
				new_dataset.to(self.args.device)
				clean_model = train_model_shallow(args, new_test_model, new_dataset)
				torch.save({"state_dict": clean_model.cpu().state_dict()}, pt_file_name)

				negative_list.append(pt_file_name)

		# TODO: generate independet trigger model

		negative_val = []
		negative_clean_acc = []
		for i in negative_list:
			new_test_model = copy.deepcopy(test_model)
			new_test_model.load_state_dict(torch.load(i)["state_dict"])
			acc,trigger_acc,acc_list = evaluate_trigger(args, new_test_model, dataset_ori, mask)
			#negative_val.append(test_vr.item())
			negative_val.append(trigger_acc)

		# TODO: clean acc print
		print(negative_val)

		return negative_val

	def eval_positive_model(self, args, test_model, dataset_ori_un, dataset_ori, mask, result_ori):
		K = args.K
		positive_pruning_ratios_list = self.positive_pruning_ratios_list
		positive_ft_epochs_list = self.positive_ft_epochs_list
		positive_methods_list = self.positive_methods_list
		positive_val = []
		positive_clean_acc = []
		#for i in range(len(positive_pruning_ratios_list)):
		for i in tqdm(range(K)):
			args.prune_ratio = positive_pruning_ratios_list[i]
			args.ft_epochs = positive_ft_epochs_list[i]
			args.method = positive_methods_list[i]
			test_model_defense = copy.deepcopy(test_model)
			dataset_de = copy.deepcopy(dataset_ori_un)
			# dataset_de = Data(x=dataset_de.features, edge_index=dataset_de.adj, y=dataset_de.labels,
			#                   train_mask=dataset_de.train_mask, val_mask=dataset_de.val_mask,
			#                   test_mask=dataset_de.test_mask)
			dataset_de = dataset_de.to(self.args.device)
			if i == 0:
				positive_val.append(result_ori['verification_ratio'])
				positive_clean_acc.append(result_ori['acc'])
			else:
				new_test_model = defense_watermark(args, test_model_defense, dataset_de)
				acc,trigger_acc,acc_list = evaluate_trigger(args, new_test_model, dataset_ori, mask)
				#positive_val.append(test_vr.item())
				positive_val.append(trigger_acc)

		#print(positive_clean_acc)
		print(positive_val)

		return positive_val

	def process_result(self, result_ori, negative_val, positive_val):
		scores = negative_val + positive_val
		labels = [0] * len(negative_val) + [1] * len(positive_val)

		# 计算AUC
		auc = roc_auc_score(labels, scores)

		result_log = {'safety-watermark_score':{'value':f"{round(auc, 4)}", 'range': [0, 1]}}
		result_json = {
					   'watermark_score': {
						   'value': round(auc, 4),
						   'description': '最终水印得分'
					   },
					   'verification_ratio': {
						   'value': round(result_ori['verification_ratio'], 4),
						   'description': '生成异常样本的比例'
					   },
					   'acc': {
						   'value': round(result_ori['acc'], 4),
						   'description': '对正常样本的识别准确性'
					   },
					   'positive_val': {
						   'value': [round(i, 4) for i in positive_val],
						   'description': '阳性模型对含有特殊触发器样本的验证准确性'
					   },
					   'negative_val': {
						   'value': [round(i, 4) for i in negative_val],
						   'description': '阴性模型对含有特殊触发器样本的验证准确性'
					   },
		}

		return result_log, result_json

	# TODO 水印如果已经注入之后需要读取含有触发器的数据集而不是使用对抗样本来测试。

	def watermark_test(self):
		args_main = self.args_main
		#node_features = self.node_features
		#edge_features = self.edge_features
		#labels = self.labels
		#train_mask = self.train_mask
		#val_mask = self.val_mask
		#test_mask = self.test_mask

		dataset_ori = self.g
		test_model = self.model
		student_model = copy.deepcopy(test_model)  # 防御中蒸馏模型使用的原始学生模型

		device = self.args.device
		'''
		初始化参数和随机种子
		'''
		args = self.args
		test_model.to(device)

		np.random.seed(args.seed)
		torch.manual_seed(args.seed)
		torch.cuda.manual_seed(args.seed)
		print(args)

		'''
		初始化数据集
		'''
		dataset_ori_un = copy.deepcopy(dataset_ori)  ### 没修改的部分
		train_idx = torch.nonzero(dataset_ori.nodes['app'].data['train_mask'])
		train_mask = dataset_ori.nodes['app'].data['train_mask']
		val_idx = torch.nonzero(dataset_ori.nodes['app'].data['val_mask'])
		val_mask = dataset_ori.nodes['app'].data['val_mask']
		test_idx = torch.nonzero(dataset_ori.nodes['app'].data['test_mask'])
		test_mask = dataset_ori.nodes['app'].data['test_mask']

		node_features = node_process(dataset_ori,device=args.device)
		edge_features = edge_process(dataset_ori,device=args.device)
		labels = dataset_ori.nodes['app'].data['label'].to(torch.long).to(args.device)

		'''
		生成攻击样本
		'''
		attack = FGSM_test_simple(epsilon=0.1,
								n_epoch=args.n_epoch,
								n_inject_max=50,
								n_edge_max=10,
								feat_lim_min=0,
								feat_lim_max=1,
								device=device)
		data_attack, features_attack, edge_features_attack, labels_origin, risk_idx = attack.attack(model=test_model,
													data=dataset_ori,
													node_features=node_features,
													edge_features=edge_features,
													target_mask=train_mask,)
		data_attack.nodes['app'].data['poison_idx'] = torch.zeros(data_attack.nodes['app'].data['label'].shape[0]).to(torch.int64).to(args.device)
		data_attack.nodes['app'].data['poison_idx'][risk_idx] = 1

		#test_vr, acc_list_atk, new_test_mask, labels_new = evaluate_mask(test_model, data_attack, features_attack, edge_features_attack, labels_origin, test_mask)
		#result_vr = 1 - test_vr
		acc,trigger_acc,acc_list = evaluate_trigger(args, test_model, data_attack, train_mask)
		# 打印 生成标记样本的成功率是result_vr
		print("生成标记样本的成功率是{:.4f}".format(trigger_acc))
		

		result_ori = {
			'verification_ratio': trigger_acc,
			'acc': acc
		}

		'''
		生成10个微调过后的被攻击模型和读取10个其他模型
		'''
		
		negative_val = self.eval_negative_model(args, test_model, dataset_ori_un, data_attack, train_mask, student_model)
		positive_val = self.eval_positive_model(args, test_model, dataset_ori_un, data_attack, train_mask, result_ori)

		'''
		利用negative_val和positive_val计算auc
		'''

		result_log, result_json = self.process_result(result_ori, negative_val, positive_val)
		

		return result_log, result_json

	def watermark_improve(self):
		args_main = self.args_main
		#node_features = self.node_features
		#edge_features = self.edge_features
		#labels = self.labels
		#train_mask = self.train_mask
		#val_mask = self.val_mask
		#test_mask = self.test_mask

		dataset_ori = self.g
		test_model = self.model
		student_model = copy.deepcopy(test_model)  # 防御中蒸馏模型使用的原始学生模型

		device = self.args.device
		'''
		初始化参数和随机种子
		'''
		args = self.args
		test_model.to(device)

		np.random.seed(args.seed)
		torch.manual_seed(args.seed)
		torch.cuda.manual_seed(args.seed)
		print(args)

		dataset_ori_un = copy.deepcopy(dataset_ori)  ### 没修改的部分
		train_idx = torch.nonzero(dataset_ori.nodes['app'].data['train_mask'])
		train_mask = dataset_ori.nodes['app'].data['train_mask']
		val_idx = torch.nonzero(dataset_ori.nodes['app'].data['val_mask'])
		val_mask = dataset_ori.nodes['app'].data['val_mask']
		test_idx = torch.nonzero(dataset_ori.nodes['app'].data['test_mask'])
		test_mask = dataset_ori.nodes['app'].data['test_mask']
		
		ori_labels = dataset_ori.nodes['app'].data['label']
		
		optimizer = torch.optim.AdamW(test_model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
	
		epochs = args.trojan_epochs


		# 插入后门
		vs_size = self.args.vs_size
		target_class = self.args.target_class

		# 获取所有非target_label的节点
		non_target_nodes = train_idx[ori_labels[train_idx] != target_class]

		# 随机选择vs_size个节点
		poisoned_nodes = random.sample(non_target_nodes.tolist(), vs_size)
		
		# 如果cross_ratio不为0,从剩余节点中选择额外的节点
		if args.cross_ratio > 0:
			# 将non_target_nodes转为list并移除已选择的poisoned_nodes
			remaining_nodes = list(set(non_target_nodes.tolist()) - set(poisoned_nodes))
			# 计算需要额外选择的节点数量
			extra_nodes_count = int(vs_size * args.cross_ratio)
			if extra_nodes_count == 0:
				extra_nodes_count = 1
			# 从剩余节点中随机选择额外节点
			extra_nodes = random.sample(remaining_nodes, extra_nodes_count)
			# 设置

			dataset_ori = inject_trigger(args, dataset_ori, extra_nodes, args.trigger_size, args.target_class, cross_mode = True)

		dataset_ori = inject_trigger(args, dataset_ori, poisoned_nodes, args.trigger_size, args.target_class)


		non_target_nodes_test = test_idx[ori_labels[test_idx] != target_class]
		poisoned_nodes_test = random.sample(non_target_nodes_test.tolist(), int(non_target_nodes_test.shape[0]*0.5))

		dataset_ori = inject_trigger(args, dataset_ori, poisoned_nodes_test, args.trigger_size, args.target_class)

		train_labels = dataset_ori.nodes['app'].data['label'][train_mask]
		class_counts = Counter(train_labels.cpu().numpy())
		class_weights = {class_id: 1.0 / count for class_id, count in class_counts.items()}
		weights = torch.tensor([class_weights[i] for i in range(len(class_counts))], dtype=torch.float).to(args.device)

		# 初始化损失函数与优化器
		criterion = torch.nn.CrossEntropyLoss(weight=weights)

		for i in tqdm(range(epochs)):
			node_features = node_process(dataset_ori,device=args.device)
			edge_features = edge_process(dataset_ori,device=args.device)
			labels = dataset_ori.nodes['app'].data['label'].to(torch.long).to(args.device)
			test_model.train()
			#if test_model.__class__.__name__=='HatthGCN':
			#	logits = test_model(dataset_ori, node_features, edge_features)['app']
			#else:
			#	logits = test_model(dataset_ori, node_features)['app']
			logits = test_model(dataset_ori, node_features, edge_features)['app']
			loss = criterion(logits[train_mask], labels[train_mask])

			optimizer.zero_grad()
			loss.backward()
			optimizer.step()
			# TODO 动态修改trigger
			if False:
				break
			test_model.eval()
			acc,trigger_acc,acc_list = evaluate_trigger(args, test_model, self.g, test_mask)
			print(f"Epoch {i}, loss: {loss.item()}, acc: {acc}, trigger_acc: {trigger_acc}, acc_list: {acc_list}")
			train_acc,train_trigger_acc,train_acc_list = evaluate_trigger(args, test_model, self.g, train_mask)
			print(f"Epoch {i}, loss: {loss.item()}, train_acc: {train_acc}, train_trigger_acc: {train_trigger_acc}, train_acc_list: {train_acc_list}")

		result_ori = {
			'verification_ratio': train_trigger_acc,
			'acc': acc
		}

		negative_val = self.eval_negative_model(args, test_model, dataset_ori_un, dataset_ori, train_mask, student_model)
		positive_val = self.eval_positive_model(args, test_model, dataset_ori_un, dataset_ori, train_mask, result_ori)

		result_log, result_json = self.process_result(result_ori, negative_val, positive_val)
		
		# TODO save model verification data
		import time
		now_time = time.strftime("%Y%m%d-%H%M%S", time.localtime())
		if not os.path.exists(args.save_path):
			os.makedirs(args.save_path)
		torch.save(test_model.cpu().state_dict(), '{}/watermark_model.pt'.format(args.save_path))
		

		return result_log, result_json

		