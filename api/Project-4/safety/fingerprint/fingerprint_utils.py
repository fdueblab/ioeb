import copy
import random

import numpy as np
import pandas as pd
import torch
import os
from models.HGAT import HGAT
from models.HGCN import HGCN
from models.HGraphSAGE import HGraphSAGE
import torch.nn.functional as F

def save_model(path, model):
    if isinstance(model, torch.nn.Module):
        model_save_path = path
        save_dir = os.path.dirname(model_save_path)
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
        torch.save(model.state_dict(), model_save_path)
        print(f"Model saved at: {model_save_path}")
    else:
        print("Invalid model.")

def extract_boundary(model, g, node_features, edge_features, bd_ratio, target_category):
    """
    在目标模型中提取边界点
    :return: 在目标类别（默认app）中的：
    """
    model.eval()
    num_nodes = g.nodes[target_category].data['feat'].shape[0]
    with torch.no_grad():
        # 获取边界点idx
        logits = model(g, node_features, edge_features)[target_category]
        num_bd_points = int(num_nodes * bd_ratio)
        top2_logits, top2_cls = torch.topk(logits, 2)  # 取前两个预测类别的logits值，以及预测类别是什么
        # top2之间预测概率之差从小到大排列，取前10%作为指纹点
        top2_diff = abs(top2_logits[:, 0] - top2_logits[:, 1])  # 算之间差值
        top2_diff_sorted, top2_diff_idx = torch.sort(top2_diff, dim=0, descending=False)
        # 取排在前面的logits相差小的index，就是正式的边界idx
        bd_points_idx = top2_diff_idx[:num_bd_points]  # 边界点idx，用于从篡改模型中提取指纹的预测类别

        # 获取边界点
        probs = F.softmax(logits, dim=-1).detach()
        final_alllabels = probs.argmax(dim=1)
        bd_points_label = final_alllabels[bd_points_idx]

        '''
            主要return拿来用的就是 bd_points_label边界点标签 和 bd_points_idx边界点索引
            提取后的验证流程：
                1. 构造篡改模型  
                2. 输入g和node_features用于获取【全部】label  
                3. 对全部label采样 bd_points_idx边界点索引 获取篡改模型边界点标签posi_bd_points_label
                4. 对比 篡改模型边界点标签posi_bd_points_label 和 边界点标签bd_points_label
                
            其他返回的结果：
                1. 所有的output： all_output 用于检测模型acc 
        '''
        ## 其他统计信息
        bd_between_cls = top2_cls[bd_points_idx]
        bd_01 = 0
        bd_12 = 0
        bd_02 = 0
        for i in range(bd_between_cls.shape[0]):
            if bd_between_cls[i].tolist() == [0, 1] or bd_between_cls[i].tolist() == [1, 0]:
                bd_01 += 1
            elif bd_between_cls[i].tolist() == [1, 2] or bd_between_cls[i].tolist() == [2, 1]:
                bd_12 += 1
            else:
                bd_02 += 1
        print('--------------------------------------------------------')
        print(f'Num(bd_points_0_1): {bd_01}\nNum(bd_points_0_2): {bd_02}\nNum(bd_points_1_2): {bd_12}')
    return bd_points_idx, bd_points_label, final_alllabels

def set_seed(seed):
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def thresh_prune(ratio, model):
    model_copy = copy.deepcopy(model)
    # 遍历模型中的所有模块
    for module in model_copy.modules():
        # 对每个模块中的参数（权重和偏置）进行操作
        for name, param in module.named_parameters():
            # 只处理可训练的参数
            if param.requires_grad:
                # 计算需要保留的参数数量
                total_params = param.numel()
                # 计算需要剪枝的参数数量
                num_params_to_prune = int(total_params * ratio)
                # 如果没有参数需要剪枝，直接跳过
                if num_params_to_prune == 0:
                    continue
                # 将参数的绝对值进行排序，并找到剪枝阈值
                threshold = torch.kthvalue(param.abs().flatten(), k=num_params_to_prune).values
                # 将绝对值小于等于阈值的参数置为0
                param.data[param.abs() <= threshold] = 0
    return model_copy

def random_prune(ratio, model):
    model_copy = copy.deepcopy(model)
    # 遍历模型中的所有模块
    for module in model_copy.modules():
        # 对每个模块中的参数（权重和偏置）进行操作
        for name, param in module.named_parameters():
            # 只处理可训练的参数
            if param.requires_grad:
                # 计算需要保留的参数数量
                total_params = param.numel()
                # 计算需要剪枝的参数数量
                num_params_to_prune = int(total_params * ratio)
                # 如果没有参数需要剪枝，直接跳过
                if num_params_to_prune == 0:
                    continue
                # 随机选择需要剪枝的索引
                indices_to_prune = torch.randperm(total_params)[:num_params_to_prune]
                # 将选定索引的参数置为0
                param.data.view(-1)[indices_to_prune] = 0
    return model_copy

def finetune(model, g, node_features, edge_features, lr, epochs, device, criterion, train_mask, labels, target_category='app'):
    model_copy = copy.deepcopy(model)
    optimizer = torch.optim.Adam(model_copy.parameters(), lr=lr)

    # 确保所有的数据都在指定的设备上
    g.to(device)
    model_copy.to(device)

    for epoch in range(1, epochs + 1):
        model_copy.train()
        optimizer.zero_grad()
        output = model_copy(g, node_features, edge_features)[target_category]
        loss = criterion(output[train_mask], labels[train_mask])
        loss.backward(retain_graph=True)
        optimizer.step()
        # if epoch % 100 == 0:
        #     print('Epoch {}, Loss: {:.4f}'.format(epoch, loss.item()))
    return model_copy


def get_posi_all_output(posi_model, g, node_features, edge_features, device, target_category='app'):
    posi_model.to(device)
    posi_model.eval()

    allOutput = posi_model(g, node_features, edge_features)[target_category]
    allOutput = F.softmax(allOutput, dim=-1).detach().argmax(dim=1)
    return allOutput

def acc_among_bd(ori_label, posi_label, device):
    ori_label.to(device)
    posi_label.to(device)
    return (ori_label == posi_label).sum().item() / len(ori_label)

def match_rate(ori_bd_label, posi_bd_label, device):
    ori_bd_label.to(device)
    posi_bd_label.to(device)
    assert len(ori_bd_label) == len(posi_bd_label), "指纹长度不一致"
    compared_res = []

    for i in range(len(ori_bd_label)):  # 匹配上为1， 不匹配为0
        if ori_bd_label[i] == posi_bd_label[i]:
            compared_res.append(1)
        else:
            compared_res.append(0)

    mr = sum(compared_res) / len(compared_res)
    return mr, compared_res

def sensitivity_computation(df, SAVECSV, type):
    zero_count = (df == 0).sum()
    zero_ratio = zero_count / df.shape[0]
    sensitivity = pd.DataFrame({
        'Sensitivity': zero_ratio.values
    })
    if SAVECSV:
        if type == 'cln':
            sensitivity.to_csv('./sensitivity_cln.csv', index=False)
        else:
            sensitivity.to_csv('./sensitivity_atk.csv', index=False)
    return sensitivity
