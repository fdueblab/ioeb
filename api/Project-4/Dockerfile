# 基础镜像
FROM python:3.12-slim

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖，DGL 从 PyTorch 2.3 专用 wheel 源安装
RUN pip install --no-cache-dir -r requirements.txt -f https://data.dgl.ai/wheels/torch-2.3/repo.html

# 复制应用代码
COPY . .

# 添加执行权限到脚本
RUN chmod +x startup.sh

# 设置 DGL 后端
ENV DGLBACKEND=pytorch

# 运行应用
CMD ["./startup.sh"]
