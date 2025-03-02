from robustness.grb.attack.injection import FGSM_test_simple
import torch
import numpy as np
import argparse
from main import get_model

def get_parser():
    parser = argparse.ArgumentParser()
    parser.add_argument('--n_inject_max', type=float, default=10, help='number of injected nodes.')
    parser.add_argument('--n_edge_max', type=float, default=10, help='number of injected egdes.')
    parser.add_argument('--epsilon', type=float, default=0.1, help='update step size.')
    parser.add_argument('--iter', type=int, default=50, help='iterations of IFGSM')
    parser.add_argument('--source_model_path', type=str, default='./model_atthgcn.pt', help='source model checkpoint path')
    parser.add_argument('--source_model_arch', type=str, default='HatthGCN', help='source model architecture')
    # parser.add_argument('--target_model_path', type=str, default='./model_hgcn.pt', help='target model checkpoint path')
    # parser.add_argument('--target_model_arch', type=str, default='HGCN', help='target model architecture')
    parser.add_argument('--source_hidden_channels', type=int, default=211, help='source_hidden_channels')
    # parser.add_argument('--target_hidden_channels', type=int, default=64, help='target_hidden_channels')
    parser.add_argument('--out_feats', type=int, default=3, help='num of classes')
    parser.add_argument('--device', type=str, default='cuda:0', help='device.')
    args = parser.parse_known_args()[0]
    return args


def evaluate(net, g, node_features, edge_features, labels, mask):
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


def fgsm_attack(args_init, g, node_features, edge_features, labels, train_mask,val_mask, test_mask, target_model, scenario='scenario_0'):
    args = get_parser()
    args.device = args_init.device
    args.in_feats = g.nodes['app'].data['feat'].shape[1]
    args.rel_names = g.etypes
    model = get_model(args.source_model_arch, args.in_feats, args.source_hidden_channels, args.out_feats,
                      args.rel_names, args.device)
    ckpt = torch.load(args.source_model_path)
    try:
        model.load_state_dict(ckpt)
    except TypeError:
        model = ckpt
    ##！！！！现在只考虑白盒攻击
    model = target_model
    ##后面做黑盒可以删掉这句
    model.eval()
    device = args.device
    model.to(device)

    # # 开始
    # if dataset.adj.shape[0] != dataset.adj.shape[1]:
    #     print(f"Adjacency matrix is not square: {dataset.adj.shape}, converting to square matrix.")
    #     # 假设 dataset.adj 是通过 edge_index 来生成的，在这种情况下，重新生成方阵
    #     num_nodes = dataset.features.shape[0]
    #     dataset.adj = convert_to_csr(num_nodes, dataset.adj)
    #     print(f"New adj shape: {dataset.adj.shape}")

    # injection ATTACK
    if scenario == 'scenario_0':
        # Test score of surrogate model
        test_score_sur_ori, acc_list = evaluate(model, g, node_features, edge_features, labels, train_mask)
        print("Test score of surrogate model: {:.4f}".format(test_score_sur_ori), acc_list, '\n')
        print("上述结果是在ground truth上的surrogate model的预测结果")

        # injection ATTACK
        attack = FGSM_test_simple(epsilon=args.epsilon,
                                  n_epoch=args.iter,
                                  n_inject_max=args.n_inject_max,
                                  n_edge_max=args.n_edge_max,
                                  feat_lim_min=0,
                                  feat_lim_max=4,
                                  device=device)
        data_attack, node_features_attack, edge_features_attack, labels_sur_pred = attack.attack(args_init, model=model,
                                                     data=g,
                                                     node_features=node_features,
                                                     edge_features=edge_features,
                                                     labels=labels,
                                                     target_mask=train_mask)
        test_score_sur_atk, acc_list_atk = evaluate(model, data_attack, node_features_attack, edge_features_attack, labels_sur_pred, train_mask)
        print("Test score after attack for surrogate model: {:.4f}.".format(test_score_sur_atk), acc_list_atk)
        print("上述结果是以surrogate model自己的预测结果作为ground truth（即攻击前准确率为100%），在经过攻击后其预测准确率")

        # TEST ASR
        # model_tar = get_model(args.target_model_arch, args.in_feats, args.target_hidden_channels, args.out_feats,
        #                       args.rel_names, args.device)
        # ckpt_tar = torch.load(args.target_model_path)
        # model_tar.load_state_dict(ckpt_tar)
        model_tar = target_model
        model_tar.eval()
        test_score_tar_ori, acc_list_tar = evaluate(model_tar, g, node_features, edge_features, labels, train_mask)
        print("Test score of target model: {:.4f}".format(test_score_tar_ori), acc_list_tar)
        print("上述结果是在ground truth上的target model的预测结果")

        test_score_tar_atk, acc_list_tar_atk = evaluate(model_tar, data_attack, node_features_attack, edge_features_attack, labels, train_mask)
        print("Test score after attack for target model: {:.4f}.".format(test_score_tar_atk), acc_list_tar_atk)
        print("上述结果是在ground truth上，经过攻击后target model的预测结果")

        # 返回值 1.log result 2.json result
        white_box_score = (acc_list_atk[1][1] + acc_list_atk[1][2]) / (acc_list_atk[2][1] + acc_list_atk[2][2])
        black_box_score = (acc_list_tar_atk[1][1] + acc_list_tar_atk[1][2]) / (acc_list_tar_atk[2][1] + acc_list_tar_atk[2][2])
        log_result = {'white_box_robustness_score': {'value':f"{white_box_score:.2f}", 'range':'[0, 1]'},
                      'black_box_robustness_score': {'value':f"{black_box_score:.2f}", 'range':'[0, 1]'}}
        json_result = {'Surrogate model predict number before attack': {
                           'value': {'on class 0': int(acc_list_atk[2][0]), 'on class 1': int(acc_list_atk[2][1]),
                                     'on class 2': int(acc_list_atk[2][2])},
                           'description': 'The result is the number of nodes for each class predicted by the surrogate model on the graph before the attack.'},
                       'Surrogate model predict accuracy before attack':{
                            'value': {'on class 0': 1.0, 'on class 1': 1.0, 'on class 2': 1.0},
                            'description': 'The result is the accuracy before the attack, with the surrogate model’s own predictions used as the ground truth, and thus it is 100%.'},
                       'Surrogate model predict number after attack': {
                            'value': {'on class 0': int(acc_list_atk[1][0]), 'on class 1': int(acc_list_atk[1][1]),
                                      'on class 2': int(acc_list_atk[1][2])},
                            'description': 'The result is the number of nodes for each class predicted by the surrogate model on the graph after the attack.'},
                       'Surrogate model predict accuracy after attack': {
                           'value': {'on class 0': acc_list_atk[0][0], 'on class 1': acc_list_atk[0][1], 'on class 2': acc_list_atk[0][2]},
                           'description': 'The result is the prediction accuracy of the surrogate model after the attack, with its own predictions used as the ground truth (i.e., the accuracy before the attack is 100%).'},
                       'White box robustness score': {
                           'value':white_box_score,
                           'description': 'The result is the robustness score under the white-box attack scenario.',
                       'Black box robustness score': {
                           'value': black_box_score,
                           'description': 'The result is the robustness score under the white-box attack scenario.'}

                       }
                       }
        return log_result, json_result

