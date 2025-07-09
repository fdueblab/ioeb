from flask import Flask, request, send_file
from flask_restx import Api, Resource
from flask_cors import CORS
import logging
from logging.handlers import RotatingFileHandler
import os
from core import query_nl2gql, query_and_generate_report
import uuid
from datetime import datetime
import random

# 配置日志
def setup_logging():
    """配置日志处理"""
    # 获取日志路径
    log_path = os.getenv('LOG_PATH', 'logs/app.log')
    log_dir = os.path.dirname(log_path)
    
    # 确保日志目录存在
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # 配置日志格式
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )

    # 配置文件处理器
    file_handler = RotatingFileHandler(
        log_path,
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    # 配置控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG)

    # 配置根日志记录器
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    return root_logger

# 初始化日志
logger = setup_logging()

# 初始化Flask应用
app = Flask(__name__)
CORS(app)

# 配置API
api = Api(app, version='1.0', 
         title='金融风险报告生成服务',
         description='提供自然语言查询转换和金融风险报告生成功能',
         doc='/docs')

# 创建命名空间
ns = api.namespace('api', description='课题三接口')

# 定义查询参数模型
query_parser = api.parser()
query_parser.add_argument('query',
                         type=str,
                         location='args',
                         required=True,
                         help='查询语句')

# 定义报告生成参数模型
report_parser = api.parser()
report_parser.add_argument('node_id',
                           type=int,
                           location='args',
                           required=True,
                           help='节点编号')

def generate_unique_filename() -> str:
    """生成唯一的文件名。

    Returns:
        str: 唯一的文件名，格式为：timestamp_uuid.pdf
    """
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    return f"{timestamp}_{unique_id}.pdf"

def cleanup_file(file_path: str) -> None:
    """清理指定的文件。

    Args:
        file_path: 要清理的文件路径
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.debug(f"已清理文件: {file_path}")
    except Exception as e:
        logger.error(f"清理文件失败: {e}")

@ns.route('/nl2gql')
class NL2GQL(Resource):
    @ns.expect(query_parser)
    @ns.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def get(self):
        """
        将自然语言查询转换为图数据库查询并执行
        """
        try:
            query = request.args.get('query')
            if not query:
                logger.error("未提供query参数")
                return {'error': '请提供query参数'}, 400
            
            logger.info(f"开始处理查询: {query}")
            result = query_nl2gql(query)
            
            if result is None:
                logger.error("查询执行失败")
                return {'error': '查询执行失败'}, 500
                
            logger.info(f"查询成功完成: {result}")
            return {'result': result}
            
        except Exception as e:
            logger.exception(f"处理查询时发生错误: {str(e)}")
            return {'error': f"处理过程出错: {str(e)}"}, 500

@ns.route('/generate-report')
class GenerateReport(Resource):
    @ns.expect(report_parser)
    @ns.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        500: 'Internal Server Error'
    })
    def get(self):
        """
        根据节点编号生成并返回Word文档报告
        """
        try:
            node_id = request.args.get('node_id', type=int)
            if node_id is None:
                logger.error("未提供node_id参数")
                return {'error': '请提供node_id参数'}, 400
            
            logger.info(f"开始为节点 {node_id} 生成报告")
            
            # 报告模板路径
            # 根据node_id在static文件夹下选一个docx文件
            docx_list = [file for file in os.listdir('static') if file.endswith('.docx')]
            report_path = os.path.join('static', docx_list[node_id % len(docx_list)])
            
            if not os.path.exists(report_path):
                logger.error(f"报告模板文件未找到: {report_path}")
                return {'error': '报告模板文件未找到'}, 500
            
            logger.info(f"成功找到报告模板: {report_path}")
            
            return send_file(
                report_path,
                mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                as_attachment=True,
                download_name=f'风险报告_{node_id}.docx'
            )
            
        except Exception as e:
            logger.exception(f"生成报告时发生错误: {str(e)}")
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
    # 确保输出目录存在
    os.makedirs('output', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    logger.info("服务启动中...")
    
    # 启动时清理output目录中的所有PDF文件
    for file in os.listdir('output'):
        if file.endswith('.pdf'):
            cleanup_file(os.path.join('output', file))
            logger.debug(f"清理历史文件: {file}")
    
    app.run(host='0.0.0.0', port=5000)
