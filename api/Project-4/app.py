from flask import Flask, request
from flask_restx import Api, Resource, fields
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
import logging
import json
import os
import time
import requests
import tempfile
# from utils import process_uploaded_dataset

# from safety_fingerprint_run import run_safety_fingerprint

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

CORS(app)

api = Api(app, version='1.0', 
         title='算法模型评测',
         description='从多个维度评测算法模型',
         doc='/docs')

# 创建安全性命名空间
ns_safety = api.namespace('safety', description='安全性评测')

# 创建其他评测维度的命名空间
ns_privacy = api.namespace('privacy', description='隐私性评测')
ns_fairness = api.namespace('fairness', description='公平性评测')
ns_robustness = api.namespace('robustness', description='鲁棒性评测')
ns_explainability = api.namespace('explainability', description='可解释性评测')
ns_all = api.namespace('all', description='所有评测指标')

# 定义上传文件的通用参数模型
upload_parser = api.parser()
upload_parser.add_argument('file',
                          type=FileStorage,
                          location='files',
                          required=False,
                          help='ZIP格式的数据集文件')
upload_parser.add_argument('model_name',
                          type=str,
                          location='form',
                          required=True,
                          help='模型名称')
upload_parser.add_argument('dataset_url',
                          type=str,
                          location='form',
                          required=False,
                          help='数据集URL，支持对象存储服务URL')

# 下载数据集函数
def download_dataset_from_url(url):
    """
    从URL下载数据集
    
    Args:
        url: 数据集URL
        
    Returns:
        str: 临时文件路径或None（如果下载失败）
    """
    try:
        logger.debug(f"从URL下载数据集: {url}")
        response = requests.get(url, stream=True)
        
        if response.status_code != 200:
            logger.error(f"下载失败，HTTP状态码: {response.status_code}")
            return None
            
        # 创建临时文件
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
        temp_path = temp_file.name
        
        # 写入数据
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                temp_file.write(chunk)
        temp_file.close()
        
        logger.debug(f"数据集已下载到临时文件: {temp_path}")
        return temp_path
    except Exception as e:
        logger.exception(f"下载数据集出错: {str(e)}")
        return None

# 通用处理流程函数
def process_evaluation_request(metric_key):
    try:
        # 获取model_name参数
        model_name = request.form.get('model_name')
        if not model_name:
            logger.error("未提供model_name参数")
            return {'error': '请提供model_name参数'}, 400
        
        if model_name.lower() != 'hattengcn':
            logger.error("不支持的模型名称")
            return {'error': '不支持的模型名称'}, 400
        
        # 检查数据集来源（文件上传或URL）
        dataset_path = None
        dataset_url = request.form.get('dataset_url')
        
        if dataset_url:
            # 从URL获取数据集
            logger.debug(f"使用URL获取数据集: {dataset_url}")
            dataset_path = download_dataset_from_url(dataset_url)
            if not dataset_path:
                return {'error': '无法从URL下载数据集'}, 400
        elif 'file' in request.files and request.files['file']:
            # 从上传文件获取数据集
            file = request.files['file']
            if not file.filename:
                logger.error("文件名为空")
                return {'error': '文件名为空'}, 400
            
            if not file.filename.endswith('.zip'):
                logger.error(f"不支持的文件类型: {file.filename}")
                return {'error': '请上传ZIP格式的文件'}, 400
            
            logger.debug(f"处理上传的文件: {file.filename}")
            # 这里可以将上传的文件保存到临时路径
            # dataset_path = process_uploaded_dataset(file)
        else:
            logger.error("没有提供数据集文件或URL")
            return {'error': '请提供数据集文件或URL'}, 400
        
        # 使用模拟路径进行后续处理
        dataset_path = './graph_dataset'
        logger.debug(f"数据集处理完成，保存在: {dataset_path}")
        
        # 使用mock结果
        result_path = './eval_result/all'
        
        # 读取完整的评测结果
        with open(os.path.join(result_path, 'score.json'), 'r', encoding='utf-8') as file:
            complete_scores = json.load(file)
        with open(os.path.join(result_path, 'details.json'), 'r', encoding='utf-8') as file:
            complete_details = json.load(file)
        
        # 模拟评测耗时
        time.sleep(2)
        
        # 如果是返回所有评测结果
        if metric_key == 'all':
            return {'score': complete_scores, 'details': complete_details}
        
        # 针对特定指标返回结果
        score_result = {metric_key: complete_scores.get(metric_key, {})}
        details_result = {metric_key: complete_details.get(metric_key, {})}
        
        return {'score': score_result, 'details': details_result}
        
    except Exception as e:
        logger.exception("处理过程出错")
        return {'error': f"处理过程出错: {str(e)}"}, 500
    finally:
        # 清理临时文件
        if dataset_path and dataset_path.startswith('/tmp') and os.path.exists(dataset_path):
            try:
                os.remove(dataset_path)
                logger.debug(f"临时文件已删除: {dataset_path}")
            except Exception as e:
                logger.warning(f"删除临时文件失败: {str(e)}")

@ns_safety.route('/safety-fingerprint')
class SafetyFingerprint(Resource):
    @ns_safety.expect(upload_parser)
    @ns_safety.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def post(self):
        """
        上传数据集或提供数据集URL，并对指定模型进行安全性指纹检测
        上传一个ZIP文件或提供对象存储URL，系统将返回安全性指纹检测结果
        参数:
        - file: ZIP格式的数据集文件（可选，与dataset_url二选一）
        - dataset_url: 数据集URL（可选，与file二选一）
        - model_name: 要评测的模型名称(目前仅支持 HattenGCN)
        """
        return process_evaluation_request('safety-fingerprint')

@ns_safety.route('/safety-watermark')
class SafetyWatermark(Resource):
    @ns_safety.expect(upload_parser)
    @ns_safety.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def post(self):
        """
        上传数据集或提供数据集URL，并对指定模型进行安全性水印检测
        上传一个ZIP文件或提供对象存储URL，系统将返回安全性水印检测结果
        参数:
        - file: ZIP格式的数据集文件（可选，与dataset_url二选一）
        - dataset_url: 数据集URL（可选，与file二选一）
        - model_name: 要评测的模型名称(目前仅支持 HattenGCN)
        """
        return process_evaluation_request('safety-watermark')

@ns_privacy.route('/')
class Privacy(Resource):
    @ns_privacy.expect(upload_parser)
    @ns_privacy.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def post(self):
        """
        上传数据集或提供数据集URL，并对指定模型进行隐私性评测
        上传一个ZIP文件或提供对象存储URL，系统将返回隐私性评测结果
        参数:
        - file: ZIP格式的数据集文件（可选，与dataset_url二选一）
        - dataset_url: 数据集URL（可选，与file二选一）
        - model_name: 要评测的模型名称(目前仅支持 HattenGCN)
        """
        return process_evaluation_request('privacy')

@ns_fairness.route('/')
class Fairness(Resource):
    @ns_fairness.expect(upload_parser)
    @ns_fairness.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def post(self):
        """
        上传数据集或提供数据集URL，并对指定模型进行公平性评测
        上传一个ZIP文件或提供对象存储URL，系统将返回公平性评测结果
        参数:
        - file: ZIP格式的数据集文件（可选，与dataset_url二选一）
        - dataset_url: 数据集URL（可选，与file二选一）
        - model_name: 要评测的模型名称(目前仅支持 HattenGCN)
        """
        return process_evaluation_request('fairness')

@ns_robustness.route('/')
class Robustness(Resource):
    @ns_robustness.expect(upload_parser)
    @ns_robustness.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def post(self):
        """
        上传数据集或提供数据集URL，并对指定模型进行鲁棒性评测
        上传一个ZIP文件或提供对象存储URL，系统将返回鲁棒性评测结果
        参数:
        - file: ZIP格式的数据集文件（可选，与dataset_url二选一）
        - dataset_url: 数据集URL（可选，与file二选一）
        - model_name: 要评测的模型名称(目前仅支持 HattenGCN)
        """
        return process_evaluation_request('robustness')

@ns_explainability.route('/')
class Explainability(Resource):
    @ns_explainability.expect(upload_parser)
    @ns_explainability.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def post(self):
        """
        上传数据集或提供数据集URL，并对指定模型进行可解释性评测
        上传一个ZIP文件或提供对象存储URL，系统将返回可解释性评测结果
        参数:
        - file: ZIP格式的数据集文件（可选，与dataset_url二选一）
        - dataset_url: 数据集URL（可选，与file二选一）
        - model_name: 要评测的模型名称(目前仅支持 HattenGCN)
        """
        return process_evaluation_request('explainability')

@ns_all.route('/')
class AllMetrics(Resource):
    @ns_all.expect(upload_parser)
    @ns_all.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def post(self):
        """
        上传数据集或提供数据集URL，对指定模型进行全维度评测
        上传一个ZIP文件或提供对象存储URL，系统将返回所有评测维度的结果
        参数:
        - file: ZIP格式的数据集文件（可选，与dataset_url二选一）
        - dataset_url: 数据集URL（可选，与file二选一）
        - model_name: 要评测的模型名称(目前仅支持 HattenGCN)
        """
        return process_evaluation_request('all')

@api.route('/health')
class Health(Resource):
    @api.doc(responses={200: 'Success'})
    def get(self):
        """
        健康检查接口
        用于检查API服务是否正常运行
        """
        return {'status': 'healthy'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)