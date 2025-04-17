from mcp.server.fastmcp import FastMCP
from starlette.applications import Starlette
from starlette.requests import Request
from starlette.routing import Mount, Route
from mcp.server.sse import SseServerTransport
from mcp.server import Server
import uvicorn
import json
import os
import time
import base64
import requests
import tempfile
import logging
from typing import Dict, Any, List, Optional, Union

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 创建 MCP 服务器
mcp = FastMCP("算法模型评测服务")

# 下载数据集函数
def download_dataset_from_url(url: str) -> Optional[str]:
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

# 评测工具通用逻辑
def process_evaluation(metric_key: str, model_name: str, dataset_file_base64: Optional[str] = None, 
                      dataset_url: Optional[str] = None) -> Dict[str, Any]:
    """
    通用评测处理逻辑
    
    Args:
        metric_key: 评测指标类型 ('privacy', 'safety-fingerprint', 等)
        model_name: 要评测的模型名称
        dataset_file_base64: Base64编码的数据集ZIP文件 (可选)
        dataset_url: 数据集URL地址 (可选)
        
    Returns:
        dict: 包含评测结果的字典
    """
    try:
        # 检查模型支持
        if model_name.lower() != 'hattengcn':
            logger.error("不支持的模型名称")
            return {'error': f"不支持的模型名称: {model_name}，目前仅支持HattenGCN"}
        
        # 检查数据集来源
        dataset_path = None
        
        if dataset_url:
            # 从URL获取数据集
            logger.debug(f"使用URL获取数据集: {dataset_url}")
            dataset_path = download_dataset_from_url(dataset_url)
            if not dataset_path:
                return {'error': '无法从URL下载数据集'}
        elif dataset_file_base64:
            # 从Base64解码数据集
            logger.debug("从Base64解码数据集")
            try:
                # 解码base64文件内容
                file_content = base64.b64decode(dataset_file_base64)
                
                # 创建临时文件
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
                temp_path = temp_file.name
                
                # 写入解码后的内容
                with open(temp_path, 'wb') as f:
                    f.write(file_content)
                
                dataset_path = temp_path
                logger.debug(f"Base64解码完成，保存至: {dataset_path}")
            except Exception as e:
                logger.exception("Base64解码失败")
                return {'error': f"Base64解码失败: {str(e)}"}
        else:
            return {'error': '请提供dataset_file_base64或dataset_url参数'}
            
        # 模拟评测过程
        logger.debug(f"处理模型 {model_name} 的 {metric_key} 评测请求")
            
        # 读取评测结果
        result_path = './eval_result/all'
        
        # 模拟评测过程的延迟
        time.sleep(2)
        
        # 读取完整的评测结果
        with open(os.path.join(result_path, 'score.json'), 'r', encoding='utf-8') as f:
            complete_scores = json.load(f)
        with open(os.path.join(result_path, 'details.json'), 'r', encoding='utf-8') as f:
            complete_details = json.load(f)
        
        # 根据请求的评测指标返回结果
        if metric_key == 'all':
            return {
                'score': complete_scores,
                'details': complete_details
            }
        else:
            return {
                'score': {metric_key: complete_scores.get(metric_key, {})},
                'details': {metric_key: complete_details.get(metric_key, {})}
            }
    
    except Exception as e:
        logger.exception(f"评测过程出错: {str(e)}")
        return {'error': f"评测过程出错: {str(e)}"}
    finally:
        # 清理临时文件
        if dataset_path and dataset_path.startswith('/tmp') and os.path.exists(dataset_path):
            try:
                os.remove(dataset_path)
                logger.debug(f"临时文件已删除: {dataset_path}")
            except Exception as e:
                logger.warning(f"删除临时文件失败: {str(e)}")

# 安全性-指纹评测工具
@mcp.tool("evaluate_safety_fingerprint", description="评估模型的安全性指纹")
async def evaluate_safety_fingerprint(
    model_name: str,
    dataset_file_base64: Optional[str] = None,
    dataset_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    评估模型的安全性指纹
    
    Args:
        model_name: 模型名称 (目前仅支持 HattenGCN)
        dataset_file_base64: Base64编码的ZIP格式数据集文件 (可选，与dataset_url二选一)
        dataset_url: 数据集URL地址 (可选，与dataset_file_base64二选一)
        
    Returns:
        dict: 包含评测结果的字典
    """
    return process_evaluation('safety-fingerprint', model_name, dataset_file_base64, dataset_url)

# 安全性-水印评测工具
@mcp.tool("evaluate_safety_watermark", description="评估模型的安全性水印")
async def evaluate_safety_watermark(
    model_name: str,
    dataset_file_base64: Optional[str] = None,
    dataset_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    评估模型的安全性水印
    
    Args:
        model_name: 模型名称 (目前仅支持 HattenGCN)
        dataset_file_base64: Base64编码的ZIP格式数据集文件 (可选，与dataset_url二选一)
        dataset_url: 数据集URL地址 (可选，与dataset_file_base64二选一)
        
    Returns:
        dict: 包含评测结果的字典
    """
    return process_evaluation('safety-watermark', model_name, dataset_file_base64, dataset_url)

# 隐私性评测工具
@mcp.tool("evaluate_privacy", description="评估模型的隐私性")
async def evaluate_privacy(
    model_name: str,
    dataset_file_base64: Optional[str] = None,
    dataset_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    评估模型的隐私性
    
    Args:
        model_name: 模型名称 (目前仅支持 HattenGCN)
        dataset_file_base64: Base64编码的ZIP格式数据集文件 (可选，与dataset_url二选一)
        dataset_url: 数据集URL地址 (可选，与dataset_file_base64二选一)
        
    Returns:
        dict: 包含评测结果的字典
    """
    return process_evaluation('privacy', model_name, dataset_file_base64, dataset_url)

# 公平性评测工具
@mcp.tool("evaluate_fairness", description="评估模型的公平性")
async def evaluate_fairness(
    model_name: str,
    dataset_file_base64: Optional[str] = None,
    dataset_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    评估模型的公平性
    
    Args:
        model_name: 模型名称 (目前仅支持 HattenGCN)
        dataset_file_base64: Base64编码的ZIP格式数据集文件 (可选，与dataset_url二选一)
        dataset_url: 数据集URL地址 (可选，与dataset_file_base64二选一)
        
    Returns:
        dict: 包含评测结果的字典
    """
    return process_evaluation('fairness', model_name, dataset_file_base64, dataset_url)

# 鲁棒性评测工具
@mcp.tool("evaluate_robustness", description="评估模型的鲁棒性")
async def evaluate_robustness(
    model_name: str,
    dataset_file_base64: Optional[str] = None,
    dataset_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    评估模型的鲁棒性
    
    Args:
        model_name: 模型名称 (目前仅支持 HattenGCN)
        dataset_file_base64: Base64编码的ZIP格式数据集文件 (可选，与dataset_url二选一)
        dataset_url: 数据集URL地址 (可选，与dataset_file_base64二选一)
        
    Returns:
        dict: 包含评测结果的字典
    """
    return process_evaluation('robustness', model_name, dataset_file_base64, dataset_url)

# 可解释性评测工具
@mcp.tool("evaluate_explainability", description="评估模型的可解释性")
async def evaluate_explainability(
    model_name: str,
    dataset_file_base64: Optional[str] = None,
    dataset_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    评估模型的可解释性
    
    Args:
        model_name: 模型名称 (目前仅支持 HattenGCN)
        dataset_file_base64: Base64编码的ZIP格式数据集文件 (可选，与dataset_url二选一)
        dataset_url: 数据集URL地址 (可选，与dataset_file_base64二选一)
        
    Returns:
        dict: 包含评测结果的字典
    """
    return process_evaluation('explainability', model_name, dataset_file_base64, dataset_url)

# 全指标评测工具
@mcp.tool("evaluate_all_metrics", description="评估模型的所有指标")
async def evaluate_all_metrics(
    model_name: str,
    dataset_file_base64: Optional[str] = None,
    dataset_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    评估模型的所有指标
    
    Args:
        model_name: 模型名称 (目前仅支持 HattenGCN)
        dataset_file_base64: Base64编码的ZIP格式数据集文件 (可选，与dataset_url二选一)
        dataset_url: 数据集URL地址 (可选，与dataset_file_base64二选一)
        
    Returns:
        dict: 包含所有评测结果的字典
    """
    return process_evaluation('all', model_name, dataset_file_base64, dataset_url)

# 创建支持SSE的Starlette应用
def create_starlette_app(mcp_server: Server, *, debug: bool = False) -> Starlette:
    """创建一个支持SSE传输的Starlette应用"""
    sse = SseServerTransport("/messages/")
    
    async def handle_sse(request: Request) -> None:
        async with sse.connect_sse(
                request.scope,
                request.receive,
                request._send,  # noqa: SLF001
        ) as (read_stream, write_stream):
            await mcp_server.run(
                read_stream,
                write_stream,
                mcp_server.create_initialization_options(),
            )
    
    return Starlette(
        debug=debug,
        routes=[
            Route("/sse", endpoint=handle_sse),
            Mount("/messages/", app=sse.handle_post_message),
        ],
    )

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='运行模型评测MCP服务器（SSE传输）')
    parser.add_argument('--host', default='0.0.0.0', help='绑定的主机')
    parser.add_argument('--port', type=int, default=3000, help='监听的端口')
    args = parser.parse_args()
    
    # 获取MCP服务器
    mcp_server = mcp._mcp_server
    
    # 创建Starlette应用
    starlette_app = create_starlette_app(mcp_server, debug=True)
    
    print("启动模型评测MCP服务器...")
    print(f"- SSE端点: http://{args.host if args.host != '0.0.0.0' else 'localhost'}:{args.port}/sse")
    
    # 运行服务器
    uvicorn.run(starlette_app, host=args.host, port=args.port) 