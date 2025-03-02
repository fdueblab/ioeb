from flask import Flask, request
from flask_restx import Api, Resource, fields
from flask_cors import CORS
from werkzeug.datastructures import FileStorage
from inference import InferenceModel
import torch
import logging

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

CORS(app)

api = Api(app, version='1.0', 
         title='图神经网络推理API',
         description='用于处理图数据集并进行模型推理的API接口',
         doc='/docs')

# 创建命名空间
ns = api.namespace('api', description='推理操作')

# 定义上传文件的参数模型
upload_parser = api.parser()
upload_parser.add_argument('file',
                          type=FileStorage,
                          location='files',
                          required=True,
                          help='ZIP格式的数据集文件')

# 创建推理模型实例（全局）
inference_model = InferenceModel(
    model_path='checkpoint/model.pt',
    device='cuda' if torch.cuda.is_available() else 'cpu'
)

# 初始化模型
inference_model.load_model(
    in_feats=211,
    h_feats=211,
    out_feats=3
)

@ns.route('/predict')
class Prediction(Resource):
    @ns.expect(upload_parser)
    @ns.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def post(self):
        """
        上传数据集并进行推理
        上传一个包含完整图数据集的ZIP文件，系统将进行模型推理并返回结果。
        ZIP文件必须包含以下文件：
        - meta.yaml: 数据集元信息
        - edges_*.csv: 边数据文件
        - nodes_*.csv: 节点数据文件
        """
        try:
            logger.debug("开始处理文件上传请求")
            
            # 检查是否有文件上传
            if 'file' not in request.files:
                logger.error(request.files)
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
            dataset_path = inference_model.process_uploaded_dataset(file)
            logger.debug(f"数据集处理完成，保存在: {dataset_path}")
            
            result = inference_model.infer(dataset_path)
            logger.debug("推理完成")
            
            return {'result': result}
            
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