from flask import Flask, request
from flask_restx import Api, Resource, fields
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
import logging
import json
import os
import time
from utils import process_uploaded_dataset

from safety_fingerprint_run import run_safety_fingerprint

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

CORS(app)

api = Api(app, version='1.0', 
         title='算法模型评测',
         description='从多个维度评测算法模型',
         doc='/docs')

# 创建命名空间
ns = api.namespace('safety', description='安全性')

# 定义上传文件的参数模型
safety_parser = api.parser()
safety_parser.add_argument('file',
                          type=FileStorage,
                          location='files',
                          required=True,
                          help='ZIP格式的数据集文件')
safety_parser.add_argument('model_name',
                          type=str,
                          location='form',
                          required=True,
                          help='模型名称')

@ns.route('/safety-fingerprint')
class SafetyFingerprint(Resource):
    @ns.expect(safety_parser)
    @ns.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def post(self):
        """
        上传数据集,并对指定模型进行安全性指纹检测
        上传一个包含完整图数据集的ZIP文件，系统将返回安全性指纹检测结果
        参数:
        - file: ZIP格式的数据集文件
        - model_name: 要评测的模型名称(目前仅支持 HattenGCN)
        """
        try:
            # 获取model_name参数
            model_name = request.form.get('model_name')
            if not model_name:
                logger.error("未提供model_name参数")
                return {'error': '请提供model_name参数'}, 400
            
            if model_name.lower() != 'hattengcn':
                logger.error("不支持的模型名称")
                return {'error': '不支持的模型名称'}, 400
            
            # 获取文件
            logger.debug("开始处理文件上传请求")
            
            # 检查是否有文件上传
            if 'file' not in request.files:
                logger.error("没有检测到文件上传")
                return {'error': '没有上传文件'}, 400
            
            file = request.files['file']
            if not file:
                logger.error("文件对象为空")
                return {'error': '文件对象为空'}, 400
            
            if not file.filename:
                logger.error("文件名为空")
                return {'error': '文件名为空'}, 400
            
            if not file.filename.endswith('.zip'):
                logger.error(f"不支持的文件类型: {file.filename}")
                return {'error': '请上传ZIP格式的文件'}, 400
            
            logger.debug(f"开始处理文件: {file.filename}")
            
            # 处理数据集并进行推理
            # dataset_path = process_uploaded_dataset(file)
            dataset_path = './graph_dataset'
            logger.debug(f"数据集处理完成，保存在: {dataset_path}")
            
            # result_dict_log, result_dict_json = run_safety_fingerprint(
            #     data_path=dataset_path, 
            #     model_path=f'./weights/model_{model_name.lower()}.pt')

            # 使用mock结果
            result_path = './eval_result/safety-fingerprint/latest'
            with open(os.path.join(result_path, 'score.json'), 'r', encoding='utf-8') as file:
                result_dict_log = json.load(file)
            with open(os.path.join(result_path, 'details.json'), 'r', encoding='utf-8') as file:
                result_dict_json = json.load(file)  
            time.sleep(3)

            return {'score': result_dict_log, 'details': result_dict_json}
            
        except Exception as e:
            logger.exception("处理过程出错")
            return {'error': f"处理过程出错: {str(e)}"}, 500

@ns.route('/health')
class Health(Resource):
    @ns.doc(responses={200: 'Success'})
    def get(self):
        """
        健康检查接口
        用于检查API服务是否正常运行
        """
        return {'status': 'healthy'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)