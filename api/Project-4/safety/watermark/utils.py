import torch
import torch.nn as nn
import numpy as np
import scipy.sparse as sp
from sympy.matrices.expressions.tests.test_slice import test_entry
import copy
from collections import Counter

def tensor2onehot(labels):
	"""Convert label tensor to label onehot tensor.
	Parameters
	----------
	labels : torch.LongTensor
		node labels
	Returns
	-------
	torch.LongTensor
		onehot labels tensor
	"""
	labels = labels.long()
	eye = torch.eye(labels.max() + 1)
	onehot_mx = eye[labels]
	return onehot_mx.to(labels.device)

def accuracy(output, labels):
	"""Return accuracy of output compared to labels.
	Parameters
	----------
	output : torch.Tensor
		output from model
	labels : torch.Tensor or numpy.array
		node labels
	Returns
	-------
	float
		accuracy
	"""
	if not hasattr(labels, '__len__'):
		labels = [labels]
	if type(labels) is not torch.Tensor:
		labels = torch.LongTensor(labels)
	preds = output.max(1)[1].type_as(labels)
	correct = preds.eq(labels).double()
	correct = correct.sum()
	return correct / len(labels)

def test(model, features, edge_index, labels,idx_test=None):
	"""Evaluate GCN performance on test set.
	Parameters
	----------
	idx_test :
		node testing indices
	"""
	model.eval()
	output = model(features, edge_index)
	if idx_test is not None:
		acc_test = accuracy(output[idx_test], labels[idx_test])
	else:
		acc_test = accuracy(output, labels)
	# print("Test set results:",
	#       "loss= {:.4f}".format(loss_test.item()),
	#       "accuracy= {:.4f}".format(acc_test.item()))
	return float(acc_test)

def sparse_mx_to_torch_sparse_tensor(sparse_mx):
	"""Convert a scipy sparse matrix to a torch sparse tensor."""
	sparse_mx = sparse_mx.tocoo().astype(np.float32)
	indices = torch.from_numpy(
		np.vstack((sparse_mx.row, sparse_mx.col)).astype(np.int64))
	values = torch.from_numpy(sparse_mx.data)
	shape = torch.Size(sparse_mx.shape)
	return torch.sparse.FloatTensor(indices, values, shape)

def idx_to_mask(indices, n):
	mask = torch.zeros(n, dtype=torch.bool)
	mask[indices] = True
	return mask

def sys_normalized_adjacency(adj):
   adj = sp.coo_matrix(adj)
   adj = adj + sp.eye(adj.shape[0])
   row_sum = np.array(adj.sum(1))
   row_sum=(row_sum==0)*1+row_sum
   d_inv_sqrt = np.power(row_sum, -0.5).flatten()
   d_inv_sqrt[np.isinf(d_inv_sqrt)] = 0.
   d_mat_inv_sqrt = sp.diags(d_inv_sqrt)
   return d_mat_inv_sqrt.dot(adj).dot(d_mat_inv_sqrt).tocoo()

def subgraph(subset,edge_index, edge_attr = None, relabel_nodes: bool = False):
	"""Returns the induced subgraph of :obj:`(edge_index, edge_attr)`
	containing the nodes in :obj:`subset`.

	Args:
		subset (LongTensor, BoolTensor or [int]): The nodes to keep.
		edge_index (LongTensor): The edge indices.
		edge_attr (Tensor, optional): Edge weights or multi-dimensional
			edge features. (default: :obj:`None`)
		relabel_nodes (bool, optional): If set to :obj:`True`, the resulting
			:obj:`edge_index` will be relabeled to hold consecutive indices
			starting from zero. (default: :obj:`False`)
		num_nodes (int, optional): The number of nodes, *i.e.*
			:obj:`max_val + 1` of :attr:`edge_index`. (default: :obj:`None`)

	:rtype: (:class:`LongTensor`, :class:`Tensor`)
	"""

	device = edge_index.device

	node_mask = subset
	edge_mask = node_mask[edge_index[0]] & node_mask[edge_index[1]]
	edge_index = edge_index[:, edge_mask]
	edge_attr = edge_attr[edge_mask] if edge_attr is not None else None

	return edge_index, edge_attr, edge_mask

def get_split(args,data, device):
	rs = np.random.RandomState(10)
	perm = rs.permutation(data.num_nodes)
	train_number = int(0.6*len(perm))
	idx_train = torch.tensor(sorted(perm[:train_number])).to(device)
	data.train_mask = torch.zeros_like(data.train_mask)
	data.train_mask[idx_train] = True

	val_number = int(0.1*len(perm))
	idx_val = torch.tensor(sorted(perm[train_number:train_number+val_number])).to(device)
	data.val_mask = torch.zeros_like(data.val_mask)
	data.val_mask[idx_val] = True


	test_number = int(0.2*len(perm))
	idx_test = torch.tensor(sorted(perm[train_number+val_number:train_number+val_number+test_number])).to(device)
	data.test_mask = torch.zeros_like(data.test_mask)
	data.test_mask[idx_test] = True

	idx_clean_test = idx_test[:int(len(idx_test)/2)]
	idx_atk = idx_test[int(len(idx_test)/2):]

	return data, idx_train, idx_val, idx_clean_test, idx_atk

def get_split_test(args, g, device):
	num_nodes = g.number_of_nodes('app')
	train_mask = g.nodes['app'].data['train_mask']
	val_mask = g.nodes['app'].data['val_mask']
	test_mask = g.nodes['app'].data['test_mask']

	# unlabeled_ratio = 0.1
	# new_test_mask = 0.1
	# test_atk_mask = 0.1

	# Calculate the number of nodes for each mask
	
	

	# Select the last 0.1 * num_nodes from train_mask as unlabeled_mask
	train_indices = train_mask.nonzero().squeeze()
	unlabeled_num = int(0.1 * len(train_indices))
	unlabeled_indices = train_indices[-unlabeled_num:]
	train_indices = train_indices[:-unlabeled_num]

	# Select the last 0.1 * num_nodes from test_mask as test_atk_mask
	test_indices = test_mask.nonzero().squeeze()
	test_atk_num = int(0.1 * len(test_indices))
	test_atk_indices = test_indices[-test_atk_num:]
	test_indices = test_indices[:-test_atk_num]

	# Update the masks
	train_mask.fill_(False)
	train_mask[train_indices] = True

	test_mask.fill_(False)
	test_mask[test_indices] = True

	unlabeled_mask = torch.zeros(num_nodes, dtype=torch.bool)
	unlabeled_mask[unlabeled_indices] = True

	test_atk_mask = torch.zeros(num_nodes, dtype=torch.bool)
	test_atk_mask[test_atk_indices] = True

	g.nodes['app'].data['train_mask'] = train_mask
	g.nodes['app'].data['unlabeled_mask'] = unlabeled_mask.to(device)
	g.nodes['app'].data['val_mask'] = val_mask
	g.nodes['app'].data['test_mask'] = test_mask
	g.nodes['app'].data['test_atk_mask'] = test_atk_mask.to(device)

	return g


def get_split_mask(args, g, device):
	g.to(device)
	num_nodes = g.number_of_nodes('app')
	train_mask = np.zeros(num_nodes, dtype=bool)
	val_mask = np.zeros(num_nodes, dtype=bool)
	test_mask = np.zeros(num_nodes, dtype=bool)
	train_ratio = 0.7
	val_ratio = 0.1
	test_ratio = 0.2

	#assert train_ratio + val_ratio + test_ratio + unlabeled_idx == 1.0

	indices = np.random.permutation(num_nodes)  # 随机打乱节点索引
	train_end = int(num_nodes * train_ratio)
	val_end = train_end + int(num_nodes * val_ratio)
	test_end = val_end + int(num_nodes * test_ratio)
	train_indices = indices[:train_end]
	val_indices = indices[train_end:val_end]
	test_indices = indices[val_end:test_end]

	train_mask[train_indices] = True
	val_mask[val_indices] = True
	test_mask[test_indices] = True

	node_features = {}
	edge_features = {}
	for ntype in g.ntypes:
		# 获取该类型节点的特征数据
		feat = g.nodes[ntype].data['feat']  # 假设特征存储在 'feat' 字段
		# 获取特征维度，并添加到 in_dims 列表中
		if feat is not None:
			node_features[ntype] = feat
	for etype in g.etypes:
			# 获取该类型节点的特征数据
			feat = g.edges[etype].data['feat']  # 假设特征存储在 'feat' 字段
			if feat is not None:
				edge_features[etype] = feat
	node_features = {ntype: g.nodes[ntype].data['feat'].to(device) for ntype in g.ntypes}
	edge_features = {etype: g.edges[etype].data['feat'].to(device) for etype in g.etypes}

	return train_mask, val_mask, test_mask, node_features, edge_features

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
	device = torch.device(('cuda:{}' if torch.cuda.is_available() else 'cpu').format(args.device_id))
	train_mask, val_mask, test_mask, node_features, edge_features = get_split_mask(args, dataset_ori, device)
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

	for epoch in range(1, 201):
		loss = train()
		print(f'Epoch: {epoch:03d}, Loss: {loss:.4f}')

	acc = evaluate_acc(model, dataset_ori, node_features, edge_features, labels, test_mask)
	print(f'Test Accuracy: {acc:.4f}')
	return model


def defense_watermark(args, test_model, data):
	device = args.device
	test_model_defense = copy.deepcopy(test_model)
	dataset_de = copy.deepcopy(data)
	# new_train_mask get from dataset.test_mask 1/2
	new_train_mask = copy.deepcopy(dataset_de.nodes['app'].data['test_mask'])
	# 找到所有true的位置，随机选取一半的位置，将其置为false
	idx = torch.where(new_train_mask == True)[0]
	# idx = np.random.choice(idx, int(len(idx)/2), replace=False) 请用torch的方法
	idx = torch.randperm(len(idx))[:int(len(idx) / 2)]
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

def evaluate_acc(net, g, node_features, edge_features, labels, mask):
	test_logits = []
	if net.__class__.__name__=='HatthGCN':
		logits = net(g, node_features, edge_features)['app']
	else:
		logits = net(g, node_features)['app']
	criterion = torch.nn.CrossEntropyLoss()
	# 判断 labels 是否是 float 类型, 如果是则转换为 long 类型
	if labels.dtype == torch.float32:
		labels = labels.long()
	test_loss = criterion(logits[mask], labels[mask])
	_pred = torch.argmax(logits[mask], dim=1, keepdim=False)
	truth = labels[mask].cpu().numpy()
	output = _pred.cpu().numpy()
	acc = (output == truth).sum() / truth.shape[0]
	#acc_0 = (output[truth==0] == truth[truth==0]).sum() / truth[truth==0].shape[0]
	#acc_1 = (output[truth == 1] == truth[truth == 1]).sum() / truth[truth == 1].shape[0]
	#acc_2 = (output[truth == 2] == truth[truth == 2]).sum() / truth[truth == 2].shape[0]
	#num_0 = (output[truth==0] == truth[truth==0]).sum()
	#num_1 = (output[truth == 1] == truth[truth == 1]).sum()
	#num_2 = (output[truth == 2] == truth[truth == 2]).sum()
	return acc

def evaluate_mask(net, g, node_features, edge_features, labels, mask):
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
	new_mask_idx = np.where(output != truth)[0]
	new_mask = np.zeros_like(mask)
	mask_idx = np.where(mask == True)[0]
	new_mask_ori_idx = mask_idx[new_mask_idx]
	output_sup = output[new_mask_idx]
	new_mask[new_mask_ori_idx] = True
	labels_new = labels
	for i, idx in enumerate(new_mask_ori_idx):
		labels_new[idx] = output_sup[i]
	return acc, [[acc_0, acc_1, acc_2],[num_0, num_1, num_2],[sum(truth==0), sum(truth==1), sum(truth==2)]], new_mask, labels_new


def load_result():
	pass