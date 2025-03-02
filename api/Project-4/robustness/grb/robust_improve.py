import os
import re
import torch
import argparse
from robustness.grb.attack.injection import FGSM_test_simple
from robustness.grb.defense import AdvTrainer
from main import get_model
from robustness.grb.robust_eval import evaluate

def get_parser():
    parser = argparse.ArgumentParser()
    parser.add_argument('--lr', type=float, default=0.001, help='at learning rate.')
    parser.add_argument('--weight_decay', type=float, default=1e-6, help='weight decay.')
    parser.add_argument('--epochs', type=int, default=200, help='training epochs.')
    parser.add_argument('--n_inject_max', type=int, default=10, help='number of injected nodes.')
    parser.add_argument('--n_edge_max', type=int, default=10, help='number of injected egdes.')
    parser.add_argument('--epsilon', type=float, default=0.1, help='update step size.')
    parser.add_argument('--iter', type=int, default=10, help='iterations of IFGSM')
    # parser.add_argument('--source_model_path', type=str, default='./model_atthgcn.pt', help='source model checkpoint path')
    # parser.add_argument('--source_model_arch', type=str, default='HatthGCN', help='source model architecture')
    # parser.add_argument('--target_model_path', type=str, default='./model_hgcn.pt', help='target model checkpoint path')
    # parser.add_argument('--target_model_arch', type=str, default='HGCN', help='target model architecture')
    # parser.add_argument('--source_hidden_channels', type=int, default=211, help='source_hidden_channels')
    # parser.add_argument('--target_hidden_channels', type=int, default=64, help='target_hidden_channels')
    parser.add_argument('--out_feats', type=int, default=3, help='num of classes')
    parser.add_argument('--device', type=str, default='cuda:0', help='device.')
    args = parser.parse_known_args()[0]
    return args


# def adv_training(model, dataset, lr, epochs, config_string=None):
def adv_training(args_init, g, node_features, edge_features, labels, train_mask, val_mask, test_mask):
    args = get_parser()
    args.device = args_init.device
    args_init.in_feats = g.nodes['app'].data['feat'].shape[1]
    args_init.hid_feats = args_init.hid_dim
    args_init.rel_names = g.etypes
    # 加载模型
    model = get_model(args_init.model_type, args_init.in_feats, args_init.hid_feats, args_init.out_feats, args_init.rel_names, args_init.device)
    model_name = args_init.model_type
    device = args_init.device

    attack = FGSM_test_simple(epsilon=args.epsilon,
                              n_epoch=args.iter,
                              n_inject_max=args.n_inject_max,
                              n_edge_max=args.n_edge_max,
                              feat_lim_min=0,
                              feat_lim_max=4,
                              device=device)
    save_dir = f"./saved_models/{model_name}_at_lr{args.lr}_wd{args.weight_decay}_nnode{args.n_inject_max}_nedge{args.n_edge_max}_eps{args.epsilon}_it{args.iter}"
    save_name = "model.pt"
    train_mode = "inductive"

    trainer = AdvTrainer(g=g,
                         node_features=node_features,
                         edge_features=edge_features,
                         labels=labels,
                         train_mask=train_mask,
                         val_mask=val_mask,
                         test_mask=test_mask,
                         attack=attack,
                         optimizer=torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay),
                         loss=torch.nn.CrossEntropyLoss,
                         lr_scheduler=False,
                         early_stop=True,
                         early_stop_patience=500,
                         device=device)

    trainer.train(args_init=args_init,
                  model=model,
                  n_epoch=args.epochs,
                  eval_every=1,
                  save_after=0,
                  save_dir=save_dir,
                  save_name=save_name,
                  train_mode=train_mode,
                  verbose=False)

    model_at = get_model(args_init.model_type, args_init.in_feats, args_init.hid_feats, args_init.out_feats, args_init.rel_names, args_init.device)
    at_ckpt = torch.load(f'./saved_models/HatthGCN_at_lr{args.lr}_wd{args.weight_decay}_nnode{args.n_inject_max}_nedge{args.n_edge_max}_eps{args.epsilon}_it{args.iter}/final_model.pt')
    model_at.load_state_dict(at_ckpt)

    return model_at

    # # by trainer
    # test_score_tar_atk, acc_list_tar_atk = evaluate(model, g, node_features, edge_features, labels, test_mask)
    # print("Test score after attack for at model: {:.4f}.".format(test_score_tar_atk), acc_list_tar_atk)


