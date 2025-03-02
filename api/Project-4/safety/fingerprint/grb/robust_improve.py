import os
import re
import torch
import argparse
from robustness.grb.attack.injection import FGSM_test_simple
from robustness.grb.defense import AdvTrainer

def get_parser():
    parser = argparse.ArgumentParser()
    parser.add_argument('--lr', type=float, default=0.001, help='at learning rate.')
    parser.add_argument('--weight_decay', type=float, default=5e-4, help='weight decay.')
    parser.add_argument('--n_inject_max', type=float, default=10, help='number of injected nodes.')
    parser.add_argument('--n_edge_max', type=float, default=10, help='number of injected egdes.')
    parser.add_argument('--epsilon', type=float, default=0.1, help='update step size.')
    parser.add_argument('--iter', type=int, default=50, help='iterations of IFGSM')
    parser.add_argument('--source_model_path', type=str, default='./model_atthgcn.pt', help='source model checkpoint path')
    parser.add_argument('--source_model_arch', type=str, default='HatthGCN', help='source model architecture')
    parser.add_argument('--target_model_path', type=str, default='./model_hgcn.pt', help='target model checkpoint path')
    parser.add_argument('--target_model_arch', type=str, default='HGCN', help='target model architecture')
    parser.add_argument('--source_hidden_channels', type=int, default=211, help='source_hidden_channels')
    parser.add_argument('--target_hidden_channels', type=int, default=64, help='target_hidden_channels')
    parser.add_argument('--out_feats', type=int, default=3, help='num of classes')
    parser.add_argument('--device', type=str, default='cuda:0', help='device.')
    args = parser.parse_known_args()[0]
    return args

def adv_training(model, dataset, lr, epochs, config_string=None):
    adj = dataset.adj
    features = dataset.features
    labels = dataset.labels
    num_features = dataset.num_features
    num_classes = dataset.num_classes
    test_mask = dataset.test_mask

    attributes = ['eps', 'nep', 'nnode', 'nedge']

    # 创建一个空字典来存储属性和对应的数值
    extracted_values = {}

    # 使用正则表达式逐个匹配属性和对应的数值
    for attribute in attributes:
        pattern = rf'{attribute}_(\d+\.*\d*)'  # 构建属性对应的正则表达式模式
        match = re.search(pattern, config_string)
        if match:
            value = float(match.group(1))  # 获取匹配到的数值并转换为浮点数
            extracted_values[attribute] = value

    model_name = model.__class__.__name__
    print(model)

    device = 'cuda:0'

    attack = FGSM(epsilon=extracted_values['eps'],
                  n_epoch=int(extracted_values['nep']),
                  n_inject_max=int(extracted_values['nnode']),
                  n_edge_max=int(extracted_values['nedge']),
                  feat_lim_min=features.min(),
                  feat_lim_max=features.max(),
                  early_stop=False,
                  device=device,
                  verbose=False)
    save_dir = f"./saved_models/{model_name}_at_ep_{epochs}_{config_string}"
    save_name = "model.pt"
    device = "cuda:0"
    feat_norm = None
    train_mode = "inductive"

    trainer = AdvTrainer(dataset=dataset,
                         attack=attack,
                         optimizer=torch.optim.Adam(model.parameters(), lr=0.001, weight_decay=5e-4),
                         loss=torch.nn.CrossEntropyLoss,
                         lr_scheduler=False,
                         early_stop=True,
                         early_stop_patience=500,
                         device=device)

    trainer.train(model=model,
                  n_epoch=epochs,
                  eval_every=1,
                  save_after=0,
                  save_dir=save_dir,
                  save_name=save_name,
                  train_mode=train_mode,
                  verbose=False)

    # model = torch.load('/workspace/zhengmeixi2/Trustworthy-Trade-Payment-Regulation-main/saved_models/GCN_2_layer_at/model.pt')

    # by trainer
    test_score = trainer.evaluate(model, dataset.test_mask)
    print("Test score: {:.4f}".format(test_score))

