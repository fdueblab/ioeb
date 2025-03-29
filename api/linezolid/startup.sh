#!/bin/bash
set -e

# 设置环境变量
export API_URL="http://localhost:5000"

echo "启动API服务..."
python app.py &
API_PID=$!

echo "启动Gradio UI..."
python gradio_app.py &
GRADIO_PID=$!

echo "启动MCP服务..."
python mcp_server.py &
MCP_PID=$!

# 捕获SIGTERM信号，优雅地关闭所有进程
trap 'kill $API_PID $GRADIO_PID $MCP_PID; exit 0' SIGTERM SIGINT

echo "所有服务已启动:"
echo "API服务运行在 http://localhost:5000"
echo "Gradio UI运行在 http://localhost:7860"
echo "MCP服务运行中"

# 保持容器运行
# 等待任何子进程终止
wait 