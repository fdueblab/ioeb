# %%
from copy import deepcopy
from turtledemo.penrose import start

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import utils
#from models_bd.GCN import GCN
from collections import Counter
import random

from networkx.classes import edges
from scipy.constants import sigma

from safety.watermark.utils import *

# %%
class GradWhere(torch.autograd.Function):
	"""
	We can implement our own custom autograd Functions by subclassing
	torch.autograd.Function and implementing the forward and backward passes
	which operate on Tensors.
	"""

	@staticmethod
	def forward(ctx, input, thrd, device):
		"""
		In the forward pass we receive a Tensor containing the input and return
		a Tensor containing the output. ctx is a context object that can be used
		to stash information for backward computation. You can cache arbitrary
		objects for use in the backward pass using the ctx.save_for_backward method.
		"""
		ctx.save_for_backward(input)
		rst = torch.where(input > thrd, torch.tensor(1.0, device=device, requires_grad=True),
						  torch.tensor(0.0, device=device, requires_grad=True))
		return rst

	@staticmethod
	def backward(ctx, grad_output):
		"""
		In the backward pass we receive a Tensor containing the gradient of the loss
		with respect to the output, and we need to compute the gradient of the loss
		with respect to the input.
		"""
		input, = ctx.saved_tensors
		grad_input = grad_output.clone()

		"""
		Return results number should corresponding with .forward inputs (besides ctx),
		for each input, return a corresponding backward grad
		"""
		return grad_input, None, None

class StableTrojanNet(nn.Module):
	# The feature are alpha not linear 
	def __init__(self, device, nfeat, nout, layernum=3, dropout=0.00):
		super(StableTrojanNet, self).__init__()

		#layers = []
		#if dropout > 0:
		#	layers.append(nn.Dropout(p=dropout))
		#for l in range(layernum - 1):
		#	layers.append(nn.Linear(nfeat, nfeat))
		#	layers.append(nn.ReLU(inplace=True))
		#	if dropout > 0:
		#		layers.append(nn.Dropout(p=dropout))
		self.alpha = nn.Parameter(torch.rand(nout * nfeat), requires_grad=True).to(device)
		self.beta = nn.Parameter(torch.rand(int(nout * (nout - 1) / 2) * nout), requires_grad=True).to(device)
		# 注册参数
		#self.register_parameter('alpha', self.alpha)
		#self.register_parameter('beta', self.beta)

		#self.layers = nn.Sequential(*layers).to(device)

		#self.feat = nn.Linear(nfeat, nout * nfeat)
		#self.edge = nn.Linear(nfeat, int(nout * (nout - 1) / 2) * nout)
		self.device = device
	def forward(self, input, thrd):
		"""
		"input", "mask" and "thrd", should already in cuda before sent to this function.
		If using sparse format, corresponding tensor should already in sparse format before
		sent into this function
		"""
		GW = GradWhere.apply
		#self.layers = self.layers
		#h = self.layers(input)
		feat = self.alpha
		edge_weight = self.beta
		#feat = torch.sigmoid(feat)
		#edge_weight = torch.sigmoid(edge_weight)
		#feat = GW(feat, thrd, self.device)
		edge_weight = GW(edge_weight, thrd, self.device)
		return feat, edge_weight

class GraphTrojanNet(nn.Module):
	# In the furture, we may use a GNN model to generate backdoor
	def __init__(self, device, nfeat, nout, layernum=3, dropout=0.00):
		super(GraphTrojanNet, self).__init__()

		layers = []
		if dropout > 0:
			layers.append(nn.Dropout(p=dropout))
		for l in range(layernum - 1):
			layers.append(nn.Linear(nfeat, nfeat))
			layers.append(nn.ReLU(inplace=True))
			if dropout > 0:
				layers.append(nn.Dropout(p=dropout))

		self.layers = nn.Sequential(*layers).to(device)

		self.feat = nn.Linear(nfeat, nout * nfeat)
		self.edge = nn.Linear(nfeat, int(nout * (nout - 1) / 2) * nout)
		self.device = device

	def forward(self, input, thrd):

		"""
		"input", "mask" and "thrd", should already in cuda before sent to this function.
		If using sparse format, corresponding tensor should already in sparse format before
		sent into this function
		"""

		GW = GradWhere.apply
		self.layers = self.layers
		h = self.layers(input)

		feat = self.feat(h)
		# feat = torch.sigmoid(feat)
		edge_weight = self.edge(h)
		# feat = GW(feat, thrd, self.device)
		edge_weight = GW(edge_weight, thrd, self.device)

		return feat, edge_weight


class HomoLoss(nn.Module):
	def __init__(self, args, device):
		super(HomoLoss, self).__init__()
		self.args = args
		self.device = device

	def forward(self, trigger_edge_index, trigger_edge_weights, x, thrd):
		trigger_edge_index = trigger_edge_index[:, trigger_edge_weights > 0.0]
		edge_sims = F.cosine_similarity(x[trigger_edge_index[0]], x[trigger_edge_index[1]])

		loss = torch.relu(thrd - edge_sims).mean()
		# print(edge_sims.min())
		return loss


# %%
import numpy as np


class Backdoor:

	def __init__(self, args, device):
		self.args = args
		self.device = device
		self.weights = None
		self.trigger_index_test = self.get_trigger_index_test(args.trigger_size)
		self.shadow_model = None

	def get_trigger_index_test(self, trigger_size):

		first_row = torch.zeros(trigger_size)
		second_row = torch.arange(trigger_size)

		edge_index = torch.stack([first_row, second_row])
		return edge_index


	def get_trojan_edge_heter(self, g, idx_attach, trigger_size):
		start = len(g.nodes['user'].data['feat'])
		idx_attach_user = []
		for idx in idx_attach:
			edges = self.trigger_index_test.clone()
			edges[0, :] = idx
			edges[1, :] = edges[1, :] + start
			edges = edges.to(torch.int64).to(self.device)
			idx_attach_user.append(edges[1])
			#edge_list.append(edges)
			g.add_edges(u=edges[0], v=edges[1], etype=('app', 'edges_18', 'user'))
			g.add_edges(u=edges[1], v=edges[0], etype=('user', 'edges_1', 'app'))
			start += trigger_size

			#initialize the edge features
			#edge自动初始化为0

			#initialize the node features
			g.nodes['user'].data['feat'][edges[1]] = torch.rand((trigger_size, g.nodes['user'].data['feat'].size(1))).to(self.device)
		idx_attach_user = torch.cat(idx_attach_user)
		return g, idx_attach_user

	def get_trojan_edge_cross_heter(self, g, idx_attach, trigger_size):
		start = len(g.nodes['user'].data['feat'])
		cross_length = int(len(idx_attach) * self.args.cross_ratio)
		uncross_length = len(idx_attach) - cross_length
		item = 0
		idx_attach_user = []
		for idx in idx_attach:
			# if item == 109:
			#     print('debug')
			edges = self.trigger_index_test.clone()
			edges[0, :] = idx
			edges[1, :] = edges[1, :] + start
			edges = edges.to(torch.int64).to(self.device)
			#edge_list.append(edges)

			idx_attach_user.append(edges[1])
			if item > uncross_length:
				random_numbers = random.sample(range(trigger_size), self.args.cross_prune)
				# 特别处理，如果随机数是最后一个（例如trigger size=3，random_number=2），那么add_edges之后，graph只会+2个点，而不是3个
				# 但下一个attack node时，因为插入的user的index是从正确位置开始的，所以会把上一步的点补上。但是此时就不能随机初始位补上的点了。
				# 而当最后一步时，如果random_number=2，那么就不会有下一次来补上点，所以需要特别处理
				# if 2 in random_numbers:
				#     print('debug')
				if item == int(len(idx_attach)-1):
					random_numbers = [0]
				indices = torch.tensor([i for i in range(edges.shape[1]) if i not in random_numbers]).to(self.device)
				edges_random_prune = torch.index_select(edges, 1, indices)
				edges = edges_random_prune

			g.add_edges(u=edges[0], v=edges[1], etype=('app', 'edges_18', 'user'))
			g.add_edges(u=edges[1], v=edges[0], etype=('user', 'edges_1', 'app'))
			start += trigger_size

			#initialize the edge features
			#edge自动初始化为0

			#initialize the node features
			if item > uncross_length:
				g.nodes['user'].data['feat'][edges[1]] = torch.rand((trigger_size-self.args.cross_prune, g.nodes['user'].data['feat'].size(1))).to(self.device)
			else:
				g.nodes['user'].data['feat'][edges[1]] = torch.rand((trigger_size, g.nodes['user'].data['feat'].size(1))).to(self.device)

			#g.nodes['user'].data['feat'][-3:] = torch.rand((trigger_size, g.nodes['user'].data['feat'].size(1))).to(self.device)
			item += 1
		idx_attach_user = torch.cat(idx_attach_user)
		return g, idx_attach_user


	def inject_trigger_train(self, idx_attach, g_org, device, args):

		self.trojan = self.trojan.to(device)
		g = g_org.clone()
		idx_attach = idx_attach.to(device)
		features = g.nodes['app'].data['feat']
		features.detach()
		self.trojan.eval()

		trojan_feat, trojan_weights = self.trojan(features[idx_attach], self.args.thrd)
		trojan_feat = trojan_feat.view([-1, features.shape[1]])
		trojan_weights = trojan_weights.view([trojan_feat.shape[0], -1])
		edge_weights_diff = g.edges['edges_18'].data['feat'].shape[1] - trojan_weights.shape[1]
		trojan_weights = torch.cat([trojan_weights, torch.ones([trojan_feat.shape[0], edge_weights_diff],
															   dtype=torch.float, device=device)], dim=1)
		#trojan_weights = trojan_weights.flatten()

		node_features = node_process(g, self.device)
		b = torch.cat([torch.zeros_like(node_features['user'][:-trojan_feat.shape[0]]), trojan_feat], dim=0)
		g.nodes['user'].data['feat'] = node_features['user'] + b
		edge_feat = g.edges['edges_18'].data['feat']
		c = torch.cat([torch.zeros_like(g.edges['edges_18'].data['feat'][:-trojan_weights.shape[0]]), trojan_weights], dim=0)
		g.edges['edges_18'].data['feat'] = edge_feat + c
		g.edges['edges_1'].data['feat'] = edge_feat + c
		# g.nodes['user'].data['feat'][-trojan_feat.shape[0]:] = trojan_feat
		# g.edges['edges_18'].data['feat'][-trojan_weights.shape[0]:] = trojan_weights
		return g

	def inject_trigger_train_cross(self, idx_attach, g_org, device, args):
		cross_mode = args.cross_mode
		sigma = args.sigma
		self.trojan = self.trojan.to(device)
		g = g_org.clone()
		idx_attach = idx_attach.to(device)
		features = g.nodes['app'].data['feat']
		features.detach()
		self.trojan.eval()
		cross_ratio = self.args.cross_ratio
		initial_tensor = torch.arange(0, len(idx_attach))
		cross_list_length = int(len(idx_attach) * cross_ratio)
		cross_list = initial_tensor[-cross_list_length:].to(device)

		# Print the indices and tensor sizes
		# print(f"idx_attach: {idx_attach}")
		# print(f"features.shape: {features.shape}")
		# print(f"cross_list: {cross_list}")


		trojan_feat, trojan_weights = self.trojan(features[idx_attach], self.args.thrd)
		trojan_feat = trojan_feat.view([-1, features.shape[1]])
		trojan_weights = trojan_weights.view([trojan_feat.shape[0], -1])
		edge_weights_diff = g.edges['edges_18'].data['feat'].shape[1] - trojan_weights.shape[1]
		trojan_weights = torch.cat([trojan_weights, torch.ones([trojan_feat.shape[0], edge_weights_diff],
															   dtype=torch.float, device=device)], dim=1)
		#trojan_weights = trojan_weights.flatten()


		if 'noise' in cross_mode:
			noise = torch.randn_like(trojan_feat[cross_list]) * sigma
			a = torch.zeros([len(trojan_feat) - len(cross_list), trojan_feat.shape[1]]).to(device)
			noise = torch.cat([a, noise])
			# noise_copy = torch.zeros_like(noise)
			# trojan_feat_copy = trojan_feat[cross_list].clone()
			# with torch.no_grad():
			#     for i in range(noise.shape[0]):
			#         for j in range(noise.shape[1]):
			#             if noise[i,j]+trojan_feat_copy[i,j]>=0 and noise[i,j]+trojan_feat_copy[i,j]<=1:
			#                 noise_copy[i,j] = noise[i,j].item()
			#             elif noise[i,j]+trojan_feat_copy[i,j]<0:
			#                 noise_copy[i,j] = -trojan_feat_copy[i,j].item()
			#             elif noise[i,j]+trojan_feat_copy[i,j]>1:
			#                 noise_copy[i,j] = 1-trojan_feat_copy[i,j].item()
			# noise = noise_copy.clone()
			#trojan_feat_copy = torch.zeros_like(trojan_feat)
			trojan_feat_copy = trojan_feat + noise

			#update_edge_weights = torch.cat([edge_weight, trojan_weights, trojan_weights])
			#update_feat = torch.cat([features, trojan_feat_copy])

			node_features = node_process(g, self.device)
			b = torch.cat([torch.zeros_like(node_features['user'][:-trojan_feat_copy.shape[0]]), trojan_feat_copy], dim=0)
			g.nodes['user'].data['feat'] = node_features['user'] + b
			edge_feat = g.edges['edges_18'].data['feat']
			c = torch.cat([torch.zeros_like(g.edges['edges_18'].data['feat'][:-trojan_weights.shape[0]]), trojan_weights], dim=0)
			g.edges['edges_18'].data['feat'] = edge_feat + c
			g.edges['edges_1'].data['feat'] = edge_feat + c
			return g


		# if 'prune' in cross_mode:
		#     trojan_edge = self.get_trojan_edge_cross(len(features),idx_attach,self.args.trigger_size).to(device)
		# else:
		#     trojan_edge = self.get_trojan_edge(len(features),idx_attach,self.args.trigger_size).to(device)

		# update_edge_weights = torch.cat([edge_weight, trojan_weights, trojan_weights])
		# update_feat = torch.cat([features, trojan_feat])
		g.nodes['user'].data['feat'][-trojan_feat.shape[0]:] = trojan_feat
		g.edges['edges_18'].data['feat'][-trojan_weights.shape[0]:] = trojan_weights
		g.edges['edges_1'].data['feat'][-trojan_weights.shape[0]:] = trojan_weights
		# update_edge_index = torch.cat([edge_index,trojan_edge],dim=1)

		return g

	def inject_trigger(self, idx_attach, g_org, device):
		self.trojan = self.trojan.to(device)
		idx_attach = idx_attach.to(device)
		g = g_org.clone()
		poison_x_org, idx_attach_user = self.get_trojan_edge_heter(g, idx_attach, self.args.trigger_size)
		features = poison_x_org.nodes['user'].data['feat']

		self.trojan.eval()

		trojan_feat, trojan_weights = self.trojan(features[idx_attach_user],
												  self.args.thrd)  # may revise the process of generate

		trojan_feat = trojan_feat.view([-1, features.shape[1]])
		trojan_weights = trojan_weights.view([trojan_feat.shape[0], -1])
		edge_weights_diff = g.edges['edges_18'].data['feat'].shape[1] - trojan_weights.shape[1]
		trojan_weights = torch.cat([trojan_weights, torch.ones([trojan_feat.shape[0], edge_weights_diff],
															   dtype=torch.float, device=device)], dim=1)

		poison_x_org.nodes['user'].data['feat'][-trojan_feat.shape[0]:] = trojan_feat
		poison_x_org.edges['edges_18'].data['feat'][-trojan_weights.shape[0]:] = trojan_weights
		poison_x_org.edges['edges_1'].data['feat'][-trojan_weights.shape[0]:] = trojan_weights
		return poison_x_org

	def fit(self, g, idx_attach, idx_unlabeled):

		args = self.args
		self.idx_attach = idx_attach
		self.features = g.nodes['app'].data['feat']
		self.idx_train = torch.nonzero(g.nodes['app'].data['train_mask']).squeeze()


		# # initial a shadow model
		# self.shadow_model = GCN(nfeat=features.shape[1],
		#                  nhid=self.args.hidden,
		#                  nclass=labels.max().item() + 1,
		#                  dropout=0.0, device=self.device).to(self.device)
		# initalize a trojanNet to generate trigger
		self.trojan = GraphTrojanNet(self.device, self.features.shape[1], args.trigger_size, layernum=2).to(self.device)
		#self.trojan = StableTrojanNet(self.device, self.features.shape[1], args.trigger_size, layernum=2).to(self.device)
		#file_loc = './md_safety_sh/trojan,pt'
		# torch.save(self.trojan.state_dict(), file_loc)
		# self.trojan.load_state_dict(torch.load(file_loc))
		optimizer_shadow = optim.Adam(self.shadow_model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
		optimizer_trigger = optim.Adam(self.trojan.parameters(), lr=args.trojan_lr, weight_decay=args.weight_decay)

		# change the labels of the poisoned node to the target class
		self.labels = g.nodes['app'].data['label'].clone()
		# print(self.labels[idx_attach])
		self.labels[idx_attach] = args.target_class

		# criterion = torch.nn.CrossEntropyLoss()
		if args.cross_mode is not None:
			cross_ratio = self.args.cross_ratio
			cross_length = int(len(idx_attach) * cross_ratio)
			if cross_length == 0:
				cross_length += 1
			cross_idx = idx_attach[-cross_length:]
			self.labels[cross_idx] = g.nodes['app'].data['label'].clone()[cross_idx]

		self.labels = self.labels.to(torch.int64)
		#labels_train仅计算训练集的类别数目，不参与后续计算
		labels_train = g.nodes['app'].data['label'].clone()
		labels_train = labels_train[torch.cat([self.idx_train, idx_attach])]
		class_counts = Counter(labels_train.cpu().numpy())
		# 输出样本类别数目
		print(class_counts)
		class_weights = {class_id: 1.0 / count for class_id, count in class_counts.items()}
		# 将权重转换为张量
		weights = torch.tensor([class_weights[i] for i in range(len(class_counts))], dtype=torch.float)
		weights = weights.to(self.device)
		criterion = torch.nn.CrossEntropyLoss(weight=weights)
		criterion_ori = torch.nn.CrossEntropyLoss()
		torch.autograd.set_detect_anomaly(True)
		#if args.cross_mode is not None:
		if args.cross_mode is not None:
			if 'prune' in args.cross_mode:
				#暂时不用
				trojan_edge = self.get_trojan_edge_cross(len(features), idx_attach, self.args.trigger_size).to(
					self.device)
			else:
				#trojan_edge = self.get_trojan_edge(len(features), idx_attach, self.args.trigger_size).to(self.device)
				poison_x_org, idx_attach_user = self.get_trojan_edge_cross_heter(g, idx_attach, self.args.trigger_size)
				poison_x_org = poison_x_org.to(self.device)
				idx_attach_user = idx_attach_user.to(self.device)
		else:
			poison_x_org, idx_attach_user = self.get_trojan_edge_heter(g, idx_attach, self.args.trigger_size)
			poison_x_org = poison_x_org.to(self.device)
			idx_attach_user = idx_attach_user.to(self.device)
		#poison_edge_index = torch.cat([edge_index, trojan_edge], dim=1)

		loss_best = 1e8

		for i in range(args.trojan_epochs):
			self.trojan.train()
			for j in range(self.args.inner_model):

				optimizer_shadow.zero_grad()
				### for cross mode trojan
				if args.cross_mode is not None:
					poison_x = self.inject_trigger_train_cross(idx_attach, poison_x_org, self.device, args)
				else:
					poison_x = self.inject_trigger_train(idx_attach, poison_x_org, self.device, args)

				# trojan_feat, trojan_weights = self.trojan(features[idx_attach],args.thrd) # may revise the process of generate
				# trojan_weights = torch.cat([torch.ones([len(trojan_feat),1],dtype=torch.float,device=self.device),trojan_weights],dim=1)
				# trojan_weights = trojan_weights.flatten()
				# trojan_feat = trojan_feat.view([-1,features.shape[1]])
				# # poison_edge_weights = torch.cat([edge_weight,trojan_weights,trojan_weights]) # repeat trojan weights beacuse of undirected edge
				# poison_x = torch.cat([features,trojan_feat])
				# # get the trojan edges, which include the target-trigger edge and the edges among trigger
				# trojan_edge = self.get_trojan_edge(len(features),idx_attach,args.trigger_size).to(self.device)

				# # update the poisoned graph's edge index
				# poison_edge_index = torch.cat([edge_index,trojan_edge],dim=1)
				#poison_x = poison_x.to(self.device)
				#poison_edge_index = poison_edge_index.to(self.device)

				#output = self.shadow_model(poison_x, poison_edge_index)
				node_features = node_process(poison_x, self.device)
				edge_features = edge_process(poison_x, self.device)
				output = self.shadow_model(poison_x, node_features, edge_features)['app']
				mask = g.nodes['app'].data['train_mask'] | g.nodes['app'].data['idx_mask']
				#print(self.labels[mask].dtype)
				loss_inner = criterion(output[mask], self.labels[mask])  # add our adaptive loss

				loss_inner.backward(retain_graph=True)
				optimizer_shadow.step()
				if j % 100 == 0:
					print('Epoch {}, Loss: {:.4f} model'.format(i, loss_inner.item()))
			if self.args.inner_bd != 0:
				for j in range(self.args.inner_bd):

					optimizer_trigger.zero_grad()
					### for cross mode trojan
					if args.cross_mode is not None:
						poison_x = self.inject_trigger_train_cross(idx_attach, poison_x_org, self.device, args)
					else:
						poison_x = self.inject_trigger_train(idx_attach, poison_x_org, self.device, args)

					# trojan_feat, trojan_weights = self.trojan(features[idx_attach],args.thrd) # may revise the process of generate
					# trojan_weights = torch.cat([torch.ones([len(trojan_feat),1],dtype=torch.float,device=self.device),trojan_weights],dim=1)
					# trojan_weights = trojan_weights.flatten()
					# trojan_feat = trojan_feat.view([-1,features.shape[1]])
					# # poison_edge_weights = torch.cat([edge_weight,trojan_weights,trojan_weights]) # repeat trojan weights beacuse of undirected edge
					# poison_x = torch.cat([features,trojan_feat])
					# # get the trojan edges, which include the target-trigger edge and the edges among trigger
					# trojan_edge = self.get_trojan_edge(len(features),idx_attach,args.trigger_size).to(self.device)

					# # update the poisoned graph's edge index
					# poison_edge_index = torch.cat([edge_index,trojan_edge],dim=1)

					#poison_x = poison_x.to(self.device)
					#poison_edge_index = poison_edge_index.to(self.device)

					node_features = node_process(poison_x, self.device)
					edge_features = edge_process(poison_x, self.device)
					output = self.shadow_model(poison_x, node_features, edge_features)['app']

					# loss_inner = criterion_ori(output[torch.cat([idx_train,idx_attach])], self.labels[torch.cat([idx_train,idx_attach])]) # add our adaptive loss
					loss_trigger = criterion_ori(output[idx_attach], self.labels[idx_attach])  # add our adaptive loss

					loss_trigger.backward(retain_graph=True)
					optimizer_trigger.step()
					if j % 2 == 0:
						print('Epoch {}, Loss: {:.4f} trigger'.format(i, loss_trigger.item()))
		self.trojan.eval()
		for j in range(self.args.inner_model):

			optimizer_shadow.zero_grad()
			### for cross mode trojan
			if args.cross_mode is not None:
				poison_x = self.inject_trigger_train_cross(idx_attach, poison_x_org, self.device, args)
			else:
				poison_x = self.inject_trigger_train(idx_attach, poison_x_org, self.device, args)
			# trojan_feat, trojan_weights = self.trojan(features[idx_attach],args.thrd) # may revise the process of generate
			# trojan_weights = torch.cat([torch.ones([len(trojan_feat),1],dtype=torch.float,device=self.device),trojan_weights],dim=1)
			# trojan_weights = trojan_weights.flatten()
			# trojan_feat = trojan_feat.view([-1,features.shape[1]])
			# # poison_edge_weights = torch.cat([edge_weight,trojan_weights,trojan_weights]) # repeat trojan weights beacuse of undirected edge
			# poison_x = torch.cat([features,trojan_feat])
			# # get the trojan edges, which include the target-trigger edge and the edges among trigger
			# trojan_edge = self.get_trojan_edge(len(features),idx_attach,args.trigger_size).to(self.device)

			# # update the poisoned graph's edge index
			# poison_edge_index = torch.cat([edge_index,trojan_edge],dim=1)

			node_features = node_process(poison_x, self.device)
			edge_features = edge_process(poison_x, self.device)
			output = self.shadow_model(poison_x, node_features, edge_features)['app']
			mask = g.nodes['app'].data['train_mask'] | g.nodes['app'].data['idx_mask']
			#print(self.labels[mask].dtype)
			loss_inner = criterion(output[mask], self.labels[mask]) 
			#loss_inner = criterion(output[torch.cat([self.idx_train, idx_attach])],
			#					   self.labels[torch.cat([self.idx_train, idx_attach])])  # add our adaptive loss

			loss_inner.backward()
			optimizer_shadow.step()

	# def fit(self, features, edge_index, edge_weight, labels, idx_train, idx_attach,idx_unlabeled):

	#     args = self.args
	#     if edge_weight is None:
	#         edge_weight = torch.ones([edge_index.shape[1]],device=self.device,dtype=torch.float)
	#     self.idx_attach = idx_attach
	#     self.features = features
	#     self.edge_index = edge_index
	#     self.edge_weights = edge_weight

	#     # initial a shadow model
	#     self.shadow_model = GCN(nfeat=features.shape[1],
	#                      nhid=self.args.hidden,
	#                      nclass=labels.max().item() + 1,
	#                      dropout=0.0, device=self.device).to(self.device)
	#     # initalize a trojanNet to generate trigger
	#     self.trojan = GraphTrojanNet(self.device, features.shape[1], args.trigger_size, layernum=2).to(self.device)
	#     self.homo_loss = HomoLoss(self.args,self.device)

	#     optimizer_shadow = optim.Adam(self.shadow_model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
	#     optimizer_trigger = optim.Adam(self.trojan.parameters(), lr=args.lr, weight_decay=args.weight_decay)

	#     # change the labels of the poisoned node to the target class
	#     self.labels = labels.clone()
	#     self.labels[idx_attach] = args.target_class

	#     # get the trojan edges, which include the target-trigger edge and the edges among trigger
	#     trojan_edge = self.get_trojan_edge(len(features),idx_attach,args.trigger_size).to(self.device)

	#     # update the poisoned graph's edge index
	#     poison_edge_index = torch.cat([edge_index,trojan_edge],dim=1)

	#     # furture change it to bilevel optimization

	#     loss_best = 1e8
	#     for i in range(args.trojan_epochs):
	#         self.trojan.train()
	#         for j in range(self.args.inner):

	#             optimizer_shadow.zero_grad()
	#             trojan_feat, trojan_weights = self.trojan(features[idx_attach],args.thrd) # may revise the process of generate
	#             trojan_weights = torch.cat([torch.ones([len(trojan_feat),1],dtype=torch.float,device=self.device),trojan_weights],dim=1)
	#             trojan_weights = trojan_weights.flatten()
	#             trojan_feat = trojan_feat.view([-1,features.shape[1]])
	#             poison_edge_weights = torch.cat([edge_weight,trojan_weights,trojan_weights]).detach() # repeat trojan weights beacuse of undirected edge
	#             poison_x = torch.cat([features,trojan_feat]).detach()

	#             output = self.shadow_model(poison_x, poison_edge_index, poison_edge_weights)

	#             loss_inner = F.nll_loss(output[torch.cat([idx_train,idx_attach])], self.labels[torch.cat([idx_train,idx_attach])]) # add our adaptive loss

	#             loss_inner.backward()
	#             optimizer_shadow.step()

	#         acc_train_clean = utils.accuracy(output[idx_train], self.labels[idx_train])
	#         acc_train_attach = utils.accuracy(output[idx_attach], self.labels[idx_attach])

	#         # involve unlabeled nodes in outter optimization
	#         self.trojan.eval()
	#         optimizer_trigger.zero_grad()

	#         rs = np.random.RandomState(self.args.seed)
	#         # idx_outter = torch.cat([idx_attach,idx_unlabeled[rs.choice(len(idx_unlabeled),size=512,replace=False)]])
	#         idx_outter = idx_attach

	#         trojan_feat, trojan_weights = self.trojan(features[idx_outter],self.args.thrd) # may revise the process of generate

	#         trojan_weights = torch.cat([torch.ones([len(idx_outter),1],dtype=torch.float,device=self.device),trojan_weights],dim=1)
	#         trojan_weights = trojan_weights.flatten()

	#         trojan_feat = trojan_feat.view([-1,features.shape[1]])

	#         trojan_edge = self.get_trojan_edge(len(features),idx_outter,self.args.trigger_size).to(self.device)

	#         update_edge_weights = torch.cat([edge_weight,trojan_weights,trojan_weights])
	#         update_feat = torch.cat([features,trojan_feat])
	#         update_edge_index = torch.cat([edge_index,trojan_edge],dim=1)

	#         output = self.shadow_model(update_feat, update_edge_index, update_edge_weights)

	#         labels_outter = labels.clone()
	#         labels_outter[idx_outter] = args.target_class
	#         loss_target = F.nll_loss(output[torch.cat([idx_train,idx_outter])],
	#                                 labels_outter[torch.cat([idx_train,idx_outter])])

	#         loss_outter = loss_target

	#         loss_outter.backward()
	#         optimizer_trigger.step()
	#         acc_train_outter =(output[idx_outter].argmax(dim=1)==args.target_class).float().mean()

	#         if loss_outter<loss_best:
	#             self.weights = deepcopy(self.trojan.state_dict())
	#             loss_best = float(loss_outter)

	#         if args.debug and i % 10 == 0:
	#             print('Epoch {}, loss_inner: {:.5f}, loss_target: {:.5f} '\
	#                     .format(i, loss_inner, loss_target))
	#             print("acc_train_clean: {:.4f}, ASR_train_attach: {:.4f}, ASR_train_outter: {:.4f}"\
	#                     .format(acc_train_clean,acc_train_attach,acc_train_outter))
	#     if args.debug:
	#         print("load best weight based on the loss outter")
	#     self.trojan.load_state_dict(self.weights)
	#     self.trojan.eval()

	# torch.cuda.empty_cache()

	def get_poisoned(self, data):

		with torch.no_grad():
			poison_x= self.inject_trigger(self.idx_attach, data, self.device)
		poison_labels = self.labels
		return poison_x, poison_labels

# %%
