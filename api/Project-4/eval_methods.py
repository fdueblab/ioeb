import argparse

import numpy as np
import yaml
import os
from datetime import datetime
import json
import torch
from matplotlib import pyplot as plt

from dataset import GraphDataLoader
from models.HGAT import HGAT
from models.HGCN import HGCN
from models.HGraphSAGE import HGraphSAGE
from models.HatthGCN import HatthGCN

#读取yaml
def load_hyperparameters(config_file):
	with open(config_file, 'r', encoding='utf-8') as file:
		config = yaml.safe_load(file)
	return config

def initial_args(config_file,args):
	config = load_hyperparameters(config_file)
	config.update({k:v for k,v in args.__dict__.items() if v is not None})
	args.__dict__ = config
	return args

def start_task(args, task):
	# 加载数据
	data_loader = GraphDataLoader(
		data_path=args.data_path,
		init_type=args.init_type,
		train_ratio=args.train_ratio,
		val_ratio=args.val_ratio,
		test_ratio=args.test_ratio,
		train_split_ratio=args.train_split_ratio,
		seed=args.seed,
		device=args.device
	)
	# 加载图
	g, node_features, edge_features, labels, train_mask, val_mask, test_mask = data_loader.load_data()
	print(edge_features['edges_2'].shape)

	args.in_feats = g.nodes['app'].data['feat'].shape[1]
	args.hid_feats = args.hid_dim
	args.rel_names = g.etypes
	# 加载模型
	model = get_model(args.model_type, args.in_feats, args.hid_feats, args.out_feats, args.rel_names, args.device)
	if args.device == 'cpu':
		ckpt = torch.load(args.model_path, map_location=torch.device('cpu'))
	else:
		ckpt = torch.load(args.model_path)
	model.load_state_dict(ckpt)
	result_log, result_json = tasks(
		args=args,
		task=task, # 任务
		g=g,  # 图结构
		node_features=node_features,  # 节点特征
		edge_features=edge_features,
		labels=labels,  # 标签
		train_mask=train_mask,  # 训练集掩码
		val_mask=val_mask,  # 验证集掩码
		test_mask=test_mask,  # 测试集掩码
		model=model
	)
	save_results_to_txt(task, result_log, result_json, args.save_file_name)
	return result_log, result_json

def start_improve_task(args, task):
	# 加载数据
	data_loader = GraphDataLoader(
		data_path=args.data_path,
		init_type=args.init_type,
		train_ratio=args.train_ratio,
		val_ratio=args.val_ratio,
		test_ratio=args.test_ratio,
		train_split_ratio=args.train_split_ratio,
		seed=args.seed,
		device=args.device
	)
	# 加载图
	g, node_features, edge_features, labels, train_mask, val_mask, test_mask = data_loader.load_data()
	print(edge_features['edges_2'].shape)

	args.in_feats = g.nodes['app'].data['feat'].shape[1]
	args.hid_feats = args.hid_dim
	args.rel_names = g.etypes
	# 加载模型
	model = get_model(args.model_type, args.in_feats, args.hid_feats, args.out_feats, args.rel_names, args.device)
	ckpt = torch.load(args.model_path)
	model.load_state_dict(ckpt)
	fairness_score, privacy_score, robustness_score, safety_watermark_score, safety_fingerprint_score = tasks(
		args=args,
		task=task, # 任务
		g=g,  # 图结构
		node_features=node_features,  # 节点特征
		edge_features=edge_features,
		labels=labels,  # 标签
		train_mask=train_mask,  # 训练集掩码
		val_mask=val_mask,  # 验证集掩码
		test_mask=test_mask,  # 测试集掩码
		model=model
	)
	scores = {
		'fairness': fairness_score,
		'privacy': privacy_score,
		'robustness': robustness_score,
		'safety-watermark': safety_watermark_score,
		'safety-fingerprint': safety_fingerprint_score
	}
	# 获取当前时间戳
	timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
	# 构建文件名
	file_name = f"improved_scores_{timestamp}.json"
	if not os.path.exists('./eval_result/related_fig'):
		os.makedirs('./eval_result/related_fig')
	# 将 scores 字典保存为 JSON 文件
	with open(f'./eval_result/related_fig/{file_name}', 'w') as json_file:
		json.dump(scores, json_file, indent=4)
	return scores

#将结果保存
def save_results_to_txt(task, result_log, result_json, file_name):
	directory = os.path.join('./eval_result', task, file_name)
	# 如果目录不存在，创建它
	if not os.path.exists(directory):
		os.makedirs(directory)
	# 保存结果到文件
	log_file_path = os.path.join(directory, 'score.json')
	with open(log_file_path, 'w', encoding='utf-8') as file:
		json.dump(result_log, file, indent=4, ensure_ascii=False)
	print(f"Log for evaluating {task} dimension saved at: {log_file_path}")
	json_file_path = os.path.join(directory, 'details.json')
	with open(json_file_path, 'w', encoding='utf-8') as json_file:
		json.dump(result_json, json_file, indent=4, ensure_ascii=False)
	print(f"Json for evaluating {task} dimension saved at: {json_file_path}")

#加载模型
def get_model(model_type, in_feats, hid_feats, out_feats, rel_names, device):
	if model_type == 'HGCN':
		return HGCN(in_feats, hid_feats, out_feats, rel_names).to(device)
	elif model_type == 'HGCN_lstm':
		return HGCN(in_feats, hid_feats, out_feats, rel_names).to(device)
	elif model_type == 'HGAT':
		return HGAT(in_feats, hid_feats, out_feats, rel_names).to(device)
	elif model_type == 'HGraphSAGE':
		return HGraphSAGE(in_feats, hid_feats, out_feats, rel_names).to(device)
	elif model_type == 'HatthGCN':
		return HatthGCN(in_feats, hid_feats, out_feats, rel_names).to(device)
	else:
		raise ValueError(f"Unsupported model type: {model_type}")


# 各个特性的任务
def tasks(args, task, g, node_features, edge_features, labels, train_mask, val_mask, test_mask, model):
	if task == 'privacy':
		from privacy.privacy_eval import PrivacyEval
		return PrivacyEval(
			args=args,
			g=g,
			node_features=node_features,
			edge_features=edge_features,
			labels=labels,
			train_mask=train_mask,
			val_mask=val_mask,
			test_mask=test_mask,
			model=model
		).run()
	elif task == 'privacy-train':
		from privacy.privacy_train import privacy_train
		return privacy_train(
			args=args,
			g=g,
			node_features=node_features,
			edge_features=edge_features,
			labels=labels,
			train_mask=train_mask,
			val_mask=val_mask,
			test_mask=test_mask,
			model=model
		).privacy_attack(args.epoch)
	elif task == 'privacy-improve':
		from privacy.privacy_flip import privacy_flip_label
		return privacy_flip_label(
			args=args,
			g=g,
			node_features=node_features,
			edge_features=edge_features,
			labels=labels,
			train_mask=train_mask,
			val_mask=val_mask,
			test_mask=test_mask,
			model=model
		).privacy_attack()
	elif task == 'basic-performance':
		from basic_performance.performance import performace
		# return performace(args, g, node_features, labels, test_mask).evaluate_single_model()
	elif task == 'explainability':
		from explainability.subgraph_generation import subgraph_generation
		from explainability.graph_construction import construct_graph_from_dataset
		from explainability.jaccard import compare_subgraph_jaccard
		if not os.path.exists(os.path.join(args.graph_gml_path, "graph.gml")):
			print("graph.gml not found, constructing the graph...")
			construct_graph_from_dataset(args.graph_gml_path)
		if not os.path.exists(os.path.join(args.graph_gml_path, "original")):
			subgraph_generation(args,"original")
		if not os.path.exists(os.path.join(args.graph_gml_path, "delete_edges_outside_subgraph")):
			subgraph_generation(args,"delete_edges_outside_subgraph")
		if not os.path.exists(os.path.join(args.graph_gml_path, "delete_edges_within_subgraph")):
			subgraph_generation(args,"delete_edges_within_subgraph")
		if not os.path.exists(os.path.join(args.graph_gml_path, "rerun")):
			subgraph_generation(args,"rerun")
		return compare_subgraph_jaccard(args,"original")
	
	elif task == 'fairness':
		from fairness.fairness_train import fairness_train
		return fairness_train(
			args=args,
			g=g,
			node_features=node_features,
			edge_features=edge_features,
			labels=labels,
			train_mask=train_mask,
			val_mask=val_mask,
			test_mask=test_mask,
			model=model
		).fairness_train()
	elif task == 'fairness-improve':
		from fairness.fairness_improve import fairness_train
		return fairness_train(
			args=args,
			g=g,
			node_features=node_features,
			edge_features=edge_features,
			labels=labels,
			train_mask=train_mask,
			val_mask=val_mask,
			test_mask=test_mask,
			model=model
		).fairness_train()
	elif task == 'safety-fingerprint':  # 用于输入单个模型，自动生成篡改模型验证篡改模型的识别比例
		from safety.fingerprint.fingerprint import fingerprint
		return fingerprint(
			args=args,
			g=g,
			node_features=node_features,
			edge_features=edge_features,
			labels=labels,
			train_mask=train_mask,
			val_mask=val_mask,
			test_mask=test_mask,
			model=model
		).fingerprint_test()
	elif task == 'safety-fingerprint-valid':  # 用于输入两个模型，比较test model是否被篡改
		from safety.fingerprint.fingerprint import fingerprint
		return fingerprint(
			args=args,
			g=g,
			node_features=node_features,
			edge_features=edge_features,
			labels=labels,
			train_mask=train_mask,
			val_mask=val_mask,
			test_mask=test_mask,
			model=model
		).fingerprint_valid(args.test_model_address)
	elif task == 'safety-fingerprint-improve':  # 用于关联分析
		from safety.fingerprint.fingerprint import fingerprint
		return fingerprint(
			args=args,
			g=g,
			node_features=node_features,
			edge_features=edge_features,
			labels=labels,
			train_mask=train_mask,
			val_mask=val_mask,
			test_mask=test_mask,
			model=model
		).fingerprint_improve()
	elif task == 'safety-watermark':
		from safety.watermark.watermark import watermark
		return watermark(
			args_main=args,
			g=g,
			node_features=node_features,
			edge_features=edge_features,
			labels=labels,
			train_mask=train_mask,
			val_mask=val_mask,
			test_mask=test_mask,
			model=model
		).watermark_test()
	elif task == 'safety-watermark-improve':
		from safety.watermark.watermark import watermark
		return watermark(
			args_main=args,
			g=g,
			node_features=node_features,
			edge_features=edge_features,
			labels=labels,
			train_mask=train_mask,
			val_mask=val_mask,
			test_mask=test_mask,
			model=model
		).watermark_improve()
	# elif task == 'fairness_improve':
	#     from fairness.fairness_improve import fairness_train
	#     return fairness_train(
	#         args=args,
	#         g=g,
	#         node_features=node_features,
	#         labels=labels,
	#         train_mask=train_mask,
	#         val_mask=val_mask,
	#         test_mask=test_mask,
	#         model=model
	#     ).fairness_train()
	# elif task == 'safety-watermark':
	#     from safety.watermark.watermark import watermark
	#     return watermark(
	#         args_main=args,
	#         g=g,
	#         node_features=node_features,
	#         labels=labels,
	#         train_mask=train_mask,
	#         val_mask=val_mask,
	#         test_mask=test_mask,
	#         model=model
	#     )
	# elif task == 'safety-watermark-improve':
	#     from safety.watermark.watermark_improve import watermark
	#     return watermark(
	#         args_main=args,
	#         g=g,
	#         node_features=node_features,
	#         labels=labels,
	#         train_mask=train_mask,
	#         val_mask=val_mask,
	#         test_mask=test_mask,
	#         model=model
	#     )

	elif task == 'robustness':
		from robustness.grb.robust_eval import fgsm_attack
		return fgsm_attack(args_init=args, g=g, node_features=node_features, edge_features=edge_features, labels=labels,
						   train_mask=train_mask,
						   val_mask=val_mask, test_mask=test_mask, target_model=model)
	elif task == 'robustness-improve':
		from robustness.grb.robust_improve import adv_training
		model_at = adv_training(args_init=args, g=g, node_features=node_features, edge_features=edge_features,
							labels=labels, train_mask=train_mask, val_mask=val_mask, test_mask=test_mask)
		from robustness.grb.robust_eval import fgsm_attack
		return fgsm_attack(args_init=args, g=g, node_features=node_features, edge_features=edge_features, labels=labels,
						   train_mask=train_mask, val_mask=val_mask, test_mask=test_mask, target_model=model_at)
	else:
		raise ValueError(f"wrong evaluation type: {task}")


def main():
	# task名字需要跟yaml文件名字一致
	total_task_list = ['safety-fingerprint', 'safety-watermark', 'safety-watermark-improve', 'fairness','fairness-improve', 'robustness', 'privacy' ,'privacy-original','privacy-improve','explainability', 'robustness-improve']  # 后续加关联任务，或者其他任务
	single_task_list = ['safety-fingerprint', 'safety-watermark', 'fairness', 'robustness', 'privacy','explainability']  # 不要动这个，这个仅用于all时测评所有单个性质
	# improve_task_list = ['privacy-improve', 'fairness-improve', 'safety-fingerprint-improve', 'safety-watermark-improve', 'robustness-improve']
	parser = argparse.ArgumentParser()
	parser.add_argument('--task', type=str,default=['all'], nargs='+',
						choices=total_task_list, help='评测任务类型，默认全部评测，多个性质空格分开')
	parser.add_argument('--data_path', type=str, default=None,
						help='数据路径')
	parser.add_argument('--model_path', type=str, default=None,
						help='模型路径')
	parser.add_argument('--save_file_name', type=str, default=None,
						help='评估结果存储文件夹名')
	config_args = parser.parse_known_args()[0]

	if not config_args.save_file_name:
		config_args.save_file_name =  datetime.now().strftime("%Y-%m-%d %H:%M:%S")

	result_dict_log,result_dict_json = {}, {}
	for subtask in config_args.task:  # 遍历传入task的每一个子任务
		if subtask == 'all':  # 如果传入all，则遍历所有子任务
			for subtask2 in single_task_list:
				print(f'--------Testing {subtask2} --------')
				args = initial_args(f'./{subtask2}.yaml', config_args)
				eval_result_log, eval_result_json = start_task(args, subtask2)
				result_dict_log[subtask2]=eval_result_log
				result_dict_json[subtask2] = eval_result_json
			break
		# elif subtask in improve_task_list:  # 关联分析
		# 	print(f'--------Testing {subtask} --------')
		# 	args = initial_args(f'./{subtask}.yaml', config_args)
		# 	scores= start_improve_task(args, subtask)
		# 	improve_fig(scores, subtask)

		else:  # 否则，遍历每个传入的任务
			print(f'--------Testing {subtask} --------')
			args = initial_args(f'./{subtask}.yaml', config_args)
			eval_result_log, eval_result_json = start_task(args, subtask)
			result_dict_log[subtask] = eval_result_log
			result_dict_json[subtask] = eval_result_json

	# 把整个的result_dict存成一个
	if len(args.task) >= 1:
		save_results_to_txt('all', result_dict_json, result_dict_log, config_args.save_file_name)


if __name__ == '__main__':
	main()
