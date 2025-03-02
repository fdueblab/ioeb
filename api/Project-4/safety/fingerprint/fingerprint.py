import pandas as pd
import numpy as np
from .fingerprint_utils import *
from collections import Counter
import torch
import random
from safety.fingerprint.grb.attack.injection import FGSM_test_simple
# from fgsm_test_simple import *

class fingerprint:
    def __init__(self, args, g, node_features, edge_features, labels, train_mask, val_mask, test_mask, model):
        # 参数初始化
        self.args = args
        self.g = g
        self.node_features = node_features
        self.edge_features = edge_features
        self.labels = labels
        self.train_mask = train_mask
        self.val_mask = val_mask
        self.test_mask = test_mask
        self.model = model
        self.model_4_valid = model

        self.PRINT = args.PRINT_STAGES
        self.mr_threshold = args.mr_threshold
        self.bd_ratio = args.bd_ratio

        # 篡改模型的超参
        self.random_prune_times = 3
        self.SAVECSV = False  # 是否将结果保存为csv
        self.target_category = 'app'
        # 正式用的篡改参数
        # self.ratio_lst = [0.0063, 0.00631, 0.00632, 0.00633, 0.00634, 0.00635, 0.00636, 0.00637, 0.00638, 0.00639, 0.0064, 0.0065, 0.0066, 0.0067, 0.0068, 0.0069, 0.007, 0.008, 0.009, 0.01, 0.1, 0.2, 0.3, 0.5, 0.7]
        self.ratio_lst = sorted([round(random.uniform(0.006, 0.007), 8) for _ in range(200)])
        self.ft_lr = [1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 1e-1]
        self.ft_epochs = [10, 20, 30, 50, 100]
        # 测试用的篡改参数
        # self.ratio_lst = [0.0001, 0.001, 0.01, 0.1, 0.2, 0.3, 0.5, 0.7]
        # self.ft_lr = [1e-6]
        # self.ft_epochs = [100, 200]

        # 移动到 device
        if isinstance(node_features, dict):  # node_features check
            self.node_features = {key: value.to(args.device) for key, value in node_features.items()}
        else:
            self.node_features = node_features.to(args.device)
        self.labels = labels.to(args.device)
        self.train_mask = train_mask.to(args.device)
        self.val_mask = val_mask.to(args.device)
        self.test_mask = test_mask.to(args.device)
        self.model = model.to(args.device)
        if self.args.device == 'cpu':
            self.model.load_state_dict(torch.load(args.model_path, map_location=torch.device('cpu')))  # 加载模型ckpt
        else:
            self.model.load_state_dict(torch.load(args.model_path))  # 加载模型ckpt

        # 初始化损失函数与优化器
        class_counts = Counter(labels.cpu().numpy())
        class_weights = {class_id: 1.0 / count for class_id, count in class_counts.items()}
        weights = torch.tensor([class_weights[i] for i in range(len(class_counts))], dtype=torch.float).to(args.device)
        self.criterion = torch.nn.CrossEntropyLoss(weight=weights)
        self.optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
        self.device = args.device

        # 获取fingerprinted data，作为原数据 + 逼近边界的数据总集
        attack = FGSM_test_simple(epsilon=0.1,
              n_epoch=150,
              n_inject_max=10,
              n_edge_max=3,
              feat_lim_min=-10,
              feat_lim_max=10,
              device=self.device)  # 插入100个新点，每个点创建200个边
        self.g_atkd, self.node_features_atkd, self.edge_features_atkd, self.labels_origin= attack.attack(model=self.model,
                                                    data=self.g,
                                                    node_features=self.node_features,
                                                             edge_features=self.edge_features,
                                                    target_mask=test_mask)

        # 提取边界点
        self.ori_bd_idx, self.ori_bd_label, self.ori_all_label = extract_boundary(self.model,
                                                                                  self.g,
                                                                                  self.node_features,
                                                                                  self.edge_features, # TODO [DONE]更新edge_features： extract_boundary方面
                                                                                  self.bd_ratio,
                                                                                  self.target_category)
        self.atkd_bd_idx, self.atkd_bd_label, self.atkd_all_label = extract_boundary(self.model,
                                                                                  self.g_atkd,
                                                                                  self.node_features_atkd,
                                                                                  self.edge_features_atkd,
                                                                                  self.bd_ratio,
                                                                                  self.target_category)

    def fingerprint_test(self):
        # 生成阳性模型，并获取阳性模型的各种结果
        posi_model_result_cln, compared_result_cln = self.produce_posi_and_result(self.ori_bd_idx,
                                                                                  self.ori_bd_label,
                                                                                  self.ori_all_label,
                                                                                  self.g,
                                                                                  self.node_features,
                                                                                  self.edge_features)
        posi_model_result_atk, compared_result_atk = self.produce_posi_and_result(self.atkd_bd_idx,
                                                                                  self.atkd_bd_label,
                                                                                  self.atkd_all_label,
                                                                                  self.g_atkd,
                                                                                  self.node_features_atkd,
                                                                                  self.edge_features_atkd)

        # 处理结果
        result_log, result_json = self.process_result(posi_model_result_cln,
                                     compared_result_cln,
                                     'cln')

        result_log2, result_json2 = self.process_result(posi_model_result_atk,
                                     compared_result_atk,
                                     'atk')
        result_log.update(result_log2)
        result_json.update(result_json2)

        return result_log, result_json

    def fingerprint_valid(self, test_model_address):
        test_ckpt = torch.load(test_model_address)  # 加载待检验模型的ckpt
        self.model_4_valid.load_state_dict(test_ckpt)  # 加载待检验模型
        posi_all_output = get_posi_all_output(self.model_4_valid, self.g, self.node_features, self.device)  # 获得待检验模型的所有label TODO [DONE]更新edge_features： get_posi_all_output方面
        posi_bd_label = posi_all_output[self.ori_bd_idx]  # 获取篡改模型的边界点label
        posi_mr, _ = match_rate(self.ori_bd_label, posi_bd_label, self.device)
        if posi_mr < self.mr_threshold:
            print(' ----------  ---------- ')
            return {'It\'s a modified model! RETURNS:':1}
        else:
            print(' ---------- Congrats, it\'s the origin model without any modification! ---------- ')
            return {'It\'s the ORIGIN model! RETURNS:':0}

    def fingerprint_improve(self):
        # 借助隐私性improve生成一堆模型

        # 把模型传入参数，依次调用各个性质获取得分
        all_score_fingerprint = []
        all_score_watermark = []
        all_score_fairness = []
        all_score_privacy = []
        all_score_robustness = []
        # for pt_file in pt_files:
            # score_fingerprint =
            # score_watermark =
            # score_fairness =
            # score_privacy =
            # score_robustness =

            # all_score_fingerprint.append(score_fingerprint)
            # all_score_watermark.append(score_watermark)
            # all_score_fairness.append(score_fairness)
            # all_score_privacy.append(score_privacy)
            # all_score_robustness.append(score_robustness)

        # 画图



    def test_posi(self, posi_model, bd_idx, bd_label, all_label, g, node_features, edge_features):
        """
        输入：篡改模型
        :return: 篡改模型的 总体acc，指纹acc，指纹匹配率，指纹对比情况（计算sensitivity）
        """
        # 获取 posi的 所有label 指纹label
        posi_all_label = get_posi_all_output(posi_model, g, node_features, edge_features, self.device)
        posi_bd_label = posi_all_label[bd_idx]
        # 获取 全部和指纹的 acc情况
        acc_all = acc_among_bd(all_label, posi_all_label, self.device)
        acc_all = round(acc_all*100, 4)
        acc_bd = acc_among_bd(bd_label, posi_bd_label, self.device)
        acc_bd = round(acc_bd*100, 4)
        # 获取指纹对比情况, 返回 匹配率，和用于计算sensitivity的对比结果
        bd_mr, compared_res = match_rate(bd_label, posi_bd_label, self.device)
        posi_res = {
            'All acc': acc_all,
            'Boundary acc': acc_bd,
            'Boundary match rate': round(bd_mr*100, 4),  # 十位数 不是零点几
            'Compared result': compared_res
        }
        return posi_res


    def produce_posi_and_result(self, bd_idx, bd_label, all_label, g, node_features, edge_features):
        """
        返回：posi_model_result, compared_result
        """
        posi_model_result = []
        compared_result = []
        # 篡改模型并获取结果
        if self.PRINT: print('\n ===================== Start Threshold pruning  ===================== \n')
        for ratio in self.ratio_lst:  # 对每一个threshold prune的model
            method = 'thresh_prune'
            seed = random.randint(0, 100000)
            set_seed(seed)

            posi_model = thresh_prune(ratio, self.model)

            posi_res = self.test_posi(posi_model, bd_idx, bd_label, all_label, g, node_features, edge_features)  # TODO [DONE]更新edge_features： test_posi方面
            data = {
                'method': method,
                'seed': seed,
                'ratio': ratio,
                'epoch': 0,
                'allAcc': posi_res['All acc'],
                'bdAcc': posi_res['Boundary acc'],
                'mr': posi_res['Boundary match rate'],
            }
            if self.PRINT: print(data)
            posi_model_result.append(data)
            compared_result.append(posi_res['Compared result'])

        if self.PRINT: print('\n  ===================== Start Random pruning =====================  \n')
        for i in range(self.random_prune_times):
            for ratio in self.ratio_lst:  # 对每一个random prune的model
                method = 'random_prune'
                seed = random.randint(0, 100000)
                set_seed(seed)

                posi_model = thresh_prune(ratio, self.model)

                posi_res = self.test_posi(posi_model, bd_idx, bd_label, all_label, g, node_features, edge_features)
                data = {
                    'method': method,
                    'seed': seed,
                    'ratio': ratio,
                    'epoch': 0,
                    'allAcc': posi_res['All acc'],
                    'bdAcc': posi_res['Boundary acc'],
                    'mr': posi_res['Boundary match rate'],
                }
                if self.PRINT: print(data)
                posi_model_result.append(data)
                compared_result.append(posi_res['Compared result'])

        if self.PRINT: print('\n  ===================== Start Fine Tuning =====================  \n')
        for lr in self.ft_lr:
            for epoch in self.ft_epochs:
                method = 'fine_tuning'
                seed = random.randint(0, 100000)
                set_seed(seed)

                posi_model = finetune(self.model, g, node_features, edge_features, lr, epoch, self.device, self.criterion,  # TODO [DONE]更新edge_features： finetune方面
                                      self.train_mask, self.labels, target_category='app')

                posi_res = self.test_posi(posi_model, bd_idx, bd_label, all_label, g, node_features, edge_features)
                data = {
                    'method': method,
                    'seed': seed,
                    'ratio': lr,
                    'epoch': epoch,
                    'allAcc': posi_res['All acc'],
                    'bdAcc': posi_res['Boundary acc'],
                    'mr': posi_res['Boundary match rate'],
                }
                if self.PRINT: print(data)
                posi_model_result.append(data)
                compared_result.append(posi_res['Compared result'])

        return posi_model_result, compared_result


    def process_result(self, model_res, compared_res, mode, sensi_threshold1=0.9,
                       sensi_threshold2=0.8,
                       sensi_threshold3=0.7,
                       sensi_threshold4=0.6,
                       sensi_threshold5=0.5):
        columns = ['method', 'seed', 'ratio', 'epoch', 'allAcc', 'bdAcc', 'mr']
        # 结果处理
        model_result = pd.DataFrame(model_res, columns=columns)  # 上面data1这些的数据
        compared_result_cln_table = pd.DataFrame(compared_res)  # 指纹对比情况 under cln data

        # 计算Sensitivity 以及相关的个数：
        sensi = sensitivity_computation(compared_result_cln_table, self.SAVECSV, mode)
        maxSinsi = sensi['Sensitivity'].max()
        sensi_gt_threshold1 = (sensi['Sensitivity'] > sensi_threshold1).sum() / len(sensi)  # sensitivity 大于某某的占比
        sensi_gt_threshold2 = (sensi['Sensitivity'] > sensi_threshold2).sum() / len(sensi)
        sensi_gt_threshold3 = (sensi['Sensitivity'] > sensi_threshold3).sum() / len(sensi)
        sensi_gt_threshold4 = (sensi['Sensitivity'] > sensi_threshold4).sum() / len(sensi)
        sensi_gt_threshold5 = (sensi['Sensitivity'] > sensi_threshold5).sum() / len(sensi)
        # 识别出篡改模型的个数
        total_modified_model = model_result.shape[0] - 1
        num_modified_model = (model_result['mr'] < (self.mr_threshold * 100)).sum()
        detection_success_rate = num_modified_model / total_modified_model  # 篡改检测成功率 = MR不到100的占比
        if self.SAVECSV:
            model_result.to_csv(f'./model_result_{mode}.csv')
            compared_result_cln_table.to_csv(f'./compared_result_{mode}_table.csv', index=False, header=False)

        # # 结果对比
        # result = {
        #     f'------------------Results under {mode} data------------------': 0,
        #     f'sensi_point_ratio_origin_gt{sensi_threshold1*100}({mode})': round(sensi_gt_threshold1 * 100, 4),
        #     f'sensi_point_ratio_origin_gt{sensi_threshold2*100}({mode})': round(sensi_gt_threshold2 * 100, 4),
        #     f'num_positive_model({mode})': total_modified_model,
        #     f'detection_success_rate_origin({mode})': round(detection_success_rate * 100, 4),
        #     f'fingerprint_score({mode})': round(detection_success_rate, 4)
        # }
        # # print(result)
        # if mode == 'atk':
        #     print(f'Final Fingerprint Score({mode}): {round(detection_success_rate, 4)}')

        result_log = {f'safety-fingerprint_score({mode} mode)':{'value':f"{round(detection_success_rate, 4)}", 'range': '[0, 1]'}}
        result_json = {f'Results under {mode} mode': 0,
                       f'sensi_Max({mode})': {
                           'value': round(maxSinsi, 4),
                           'description': f'最大敏感度（{mode}模式）'
                       },
                       f'sensi_point_ratio_origin_gt{sensi_threshold1*100}({mode})':{
                           'value': round(sensi_gt_threshold1 * 100, 4),
                           'description': f'指纹点敏感度大于{sensi_threshold1*100}%的占比（{mode}模式）'
                       },
                       f'sensi_point_ratio_origin_gt{sensi_threshold2*100}({mode})': {
                           'value': round(sensi_gt_threshold2 * 100, 4),
                           'description': f'指纹点敏感度大于{sensi_threshold2*100}%的占比（{mode}模式）'
                       },
                       f'sensi_point_ratio_origin_gt{sensi_threshold3*100}({mode})': {
                         'value': round(sensi_gt_threshold3 * 100, 4),
                         'description': f'指纹点敏感度大于{sensi_threshold3*100}%的占比（{mode}模式）'
                       },
                       f'sensi_point_ratio_origin_gt{sensi_threshold4*100}({mode})': {
                           'value': round(sensi_gt_threshold4 * 100, 4),
                           'description': f'指纹点敏感度大于{sensi_threshold4*100}%的占比（{mode}模式）'
                       },
                          f'sensi_point_ratio_origin_gt{sensi_threshold5*100}({mode})': {
                            'value': round(sensi_gt_threshold5 * 100, 4),
                            'description': f'指纹点敏感度大于{sensi_threshold5*100}%的占比（{mode}模式）'
                          },
                       f'num_positive_model({mode})': {
                           'value': total_modified_model,
                           'description': f'总篡改模型个数（{mode}模式）'
                       },
                       f'detection_success_rate_origin({mode})': {
                           'value': round(detection_success_rate * 100, 4),
                           'description': f'模型篡改检测成功率（{mode}模式）'
                       },
                       f'fingerprint_score({mode})': {
                           'value': round(detection_success_rate, 4),
                           'description': f'最终指纹得分（{mode}模式）'
                       },
        }


        return result_log, result_json
