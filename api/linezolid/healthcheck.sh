#!/bin/bash

# 检查API服务
if ! curl -s --head --fail http://localhost:5000/health > /dev/null; then
    echo "API服务未正常运行"
    exit 1
fi

# 检查Gradio服务
if ! curl -s --head --fail http://localhost:7860 > /dev/null; then
    echo "Gradio UI未正常运行"
    exit 1
fi

# 检查MCP服务
if ! curl -s --head --fail http://localhost:8000/health > /dev/null; then
    echo "MCP服务未正常运行"
    exit 1
fi

echo "所有服务正常运行"
exit 0 