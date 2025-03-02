import argparse
from typing import Tuple, Dict

from eval_methods import start_task, initial_args, save_results_to_txt


def run_safety_fingerprint(data_path: str, model_path: str) -> Tuple[Dict, Dict]:
    """对模型进行指纹安全性检测

    该函数输入数据路径和模型路径，运行指纹安全性检测任务，并返回结果。

    Args:
        data_path (str): 数据文件夹路径，包含必要CSV文件
        model_path (str): 模型Checkpoint路径，例如./model_atthgcn.pt

    Returns:
        dict: 返回指纹安全性检测任务的结果，包括日志和JSON

    """

    task = 'safety-fingerprint'

    # 初始化参数
    result_dict_log, result_dict_json = {}, {}
    parser = argparse.ArgumentParser()
    config_args = parser.parse_known_args()[0]
    args = initial_args(f'./eval_config/{task}.yaml', config_args)

    # 如果指定了数据路径和模型路径，则更新参数，否则使用默认参数
    if data_path:
        args.data_path = data_path
    if model_path:
        args.model_path = model_path

    # 运行任务，获取结果
    eval_result_log, eval_result_json = start_task(args, task)
    result_dict_log[task] = eval_result_log
    result_dict_json[task] = eval_result_json

    # 保存结果到/result/{task}文件夹内
    save_results_to_txt(task, result_dict_json, result_dict_log, config_args.save_file_name)

    return result_dict_log, result_dict_json

if __name__ == '__main__':
    data_path = './graph_dataset'
    model_path = './weights/model_atthgcn.pt'
    run_safety_fingerprint(data_path=data_path, model_path=model_path)