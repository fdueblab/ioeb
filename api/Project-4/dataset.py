import torch
import dgl
import numpy as np
from data import CSVDataset
import copy
from dgl import backend as F, core, graph_index, heterograph_index, utils

class GraphDataLoader:
	def __init__(self, data_path, init_type='random', train_ratio=0.7, val_ratio=0.15, test_ratio=0.15,train_split_ratio=1.0, seed=0, device=0):
		"""
		初始化 GraphDataLoader 类，设置数据路径、初始化类型和训练/验证/测试集的比例。
		"""
		self.data_path = data_path
		self.init_type = init_type
		self.train_ratio = train_ratio
		self.val_ratio = val_ratio
		self.test_ratio = test_ratio
		self.train_split_ratio = train_split_ratio
		self.seed = seed

		# 设置随机种子
		torch.manual_seed(seed)
		np.random.seed(seed)

		# 设置设备
		if device == 1:
			self.device = torch.device('cuda:1' if torch.cuda.is_available() else 'cpu')
		else:
			self.device = torch.device('cuda:0' if torch.cuda.is_available() and device != 'cpu' else 'cpu')

	def load_data(self):
		"""
		加载图数据集并初始化特征和生成 mask。
		"""
		# 加载图数据
		#dataset = dgl.data.CSVDataset(self.data_path)
		dataset = CSVDataset(self.data_path)
		#print(dataset)
		#g = dataset[0]
		g = dataset.graphs[0]
		# print(f"Number of graphs in dataset: {len(dataset)}")

		node_features = {}
		edge_features = {}
		edge_feature_dim = g.edges['edges_1'].data['feat'].shape[1]
		feature_dim = g.nodes['app'].data['feat'].shape[1]
		self.initialize_features(g, feature_dim, self.init_type)
		self.edge_initialize_features(g, edge_feature_dim, self.init_type)

		for ntype in g.ntypes:
			# 获取该类型节点的特征数据
			feat = g.nodes[ntype].data['feat']  # 假设特征存储在 'feat' 字段
			if feat is not None:
				node_features[ntype] = feat
		for etype in g.etypes:
			# 获取该类型节点的特征数据
			feat = g.edges[etype].data['feat']  # 假设特征存储在 'feat' 字段
			if feat is not None:
				edge_features[etype] = feat

		# 将数据分割为训练、验证、测试集并生成对应的 mask
		g = self.split_data(g)

		# 获取节点特征和标签
		node_features = {ntype: g.nodes[ntype].data['feat'].to(self.device) for ntype in g.ntypes}
		edge_features = {etype: g.edges[etype].data['feat'].to(self.device) for etype in g.etypes}
		labels = g.nodes['app'].data['label'].to(torch.long)  # 确保 labels 是 LongTensor 类型
		# print(len(labels))


		# 获取训练、验证、测试的掩码
		train_mask = g.nodes['app'].data['train_mask']
		val_mask = g.nodes['app'].data['val_mask']
		test_mask = g.nodes['app'].data['test_mask']

		return g, node_features,edge_features, labels, train_mask, val_mask, test_mask

	def initialize_features(self, g, feature_dim, init_type='zero'):
		"""
		初始化图的节点特征。
		"""
		for ntype in g.ntypes:
			if ntype != 'app':
				num_nodes = g.number_of_nodes(ntype)
				if init_type == 'zero':
					g.nodes[ntype].data['feat'] = torch.zeros((num_nodes, feature_dim))
				elif init_type == 'random':
					g.nodes[ntype].data['feat'] = torch.rand((num_nodes, feature_dim))

	def edge_initialize_features(self, g, feature_dim, init_type='zero'):
		for etype in g.etypes:
			# 检查节点类型是否为'app'
			if etype != 'edges_1':
				num_edges = g.number_of_edges(etype)
				if init_type == 'zero':
					# 初始化为零向量
					g.edges[etype].data['feat'] = torch.zeros((num_edges, feature_dim))
				elif init_type == 'random':
					# 初始化为随机向量
					g.edges[etype].data['feat'] = torch.rand((num_edges, feature_dim))

	def split_data(self, g):
		"""
		根据训练、验证、测试比例生成 mask，并根据 train_split_ratio 缩减训练集掩码。
		"""
		num_nodes = g.number_of_nodes('app')
		train_mask = np.zeros(num_nodes, dtype=bool)
		val_mask = np.zeros(num_nodes, dtype=bool)
		test_mask = np.zeros(num_nodes, dtype=bool)

		indices = np.arange(num_nodes)
		# indices = np.random.permutation(num_nodes)  # 随机打乱节点索引
		train_end = int(num_nodes * self.train_ratio)
		val_end = train_end + int(num_nodes * self.val_ratio)

		train_indices = indices[:train_end]
		val_indices = indices[train_end:val_end]
		test_indices = indices[val_end:]

		# 按比例缩减 train_mask，如果 train_split_ratio < 1.0，则进一步减少训练集节点数量
		effective_train_end = int(train_end * self.train_split_ratio)
		train_indices = train_indices[:effective_train_end]

		train_mask[train_indices] = True
		val_mask[val_indices] = True
		test_mask[test_indices] = True

		# 在设置掩码之前，将图 g 转移到 GPU
		g = g.to(self.device)
		#g_new = to(g, self.device)

		# 分配掩码到设备
		g.nodes['app'].data['train_mask'] = torch.from_numpy(train_mask).to(self.device)
		g.nodes['app'].data['val_mask'] = torch.from_numpy(val_mask).to(self.device)
		g.nodes['app'].data['test_mask'] = torch.from_numpy(test_mask).to(self.device)

		return g


def to(dataset, device, **kwargs):  # pylint: disable=invalid-name
	"""Move ndata, edata and graph structure to the targeted device (cpu/gpu).

	If the graph is already on the specified device, the function directly returns it.
	Otherwise, it returns a cloned graph on the specified device.

	Note that data of node and edge features are not moved to the specified
	device before being accessed or `materialize_data()` is called.

	Parameters
	----------
	device : Framework-specific device context object
		The context to move data to (e.g., ``torch.device``).
	kwargs : Key-word arguments.
		Key-word arguments fed to the framework copy function.

	Returns
	-------
	DGLGraph
		The graph on the specified device.

	Examples
	--------
	The following example uses PyTorch backend.

	>>> import dgl
	>>> import torch

	>>> g = dgl.graph((torch.tensor([1, 0]), torch.tensor([1, 2])))
	>>> g.ndata['h'] = torch.ones(3, 1)
	>>> g.edata['h'] = torch.zeros(2, 2)
	>>> g1 = g.to(torch.device('cuda:0'))
	>>> print(g1.device)
	device(type='cuda', index=0)
	>>> print(g1.ndata['h'].device)
	device(type='cuda', index=0)
	>>> print(g1.nodes().device)
	device(type='cuda', index=0)

	The original graph is still on CPU.

	>>> print(g.device)
	device(type='cpu')
	>>> print(g.ndata['h'].device)
	device(type='cpu')
	>>> print(g.nodes().device)
	device(type='cpu')

	The case of heterogeneous graphs is the same.
	"""
	if device is None or dataset.device == device:
		return dataset

	ret = copy.copy(dataset)

	# 1. Copy graph structure
	ret._graph = dataset._graph.copy_to(utils.to_dgl_context(device))

	# 2. Copy features
	# TODO(minjie): handle initializer
	new_nframes = []
	for nframe in dataset._node_frames:
		new_nframes.append(nframe.to(device, **kwargs))
	ret._node_frames = new_nframes

	new_eframes = []
	for eframe in dataset._edge_frames:
		new_eframes.append(eframe.to(device, **kwargs))
	ret._edge_frames = new_eframes

	# 2. Copy misc info
	if dataset._batch_num_nodes is not None:
		new_bnn = {
			k: F.copy_to(num, device, **kwargs)
			for k, num in dataset._batch_num_nodes.items()
		}
		ret._batch_num_nodes = new_bnn
	if dataset._batch_num_edges is not None:
		new_bne = {
			k: F.copy_to(num, device, **kwargs)
			for k, num in dataset._batch_num_edges.items()
		}
		ret._batch_num_edges = new_bne

	return ret
