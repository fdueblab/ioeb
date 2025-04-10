# 基础镜像
FROM python:3.10-slim

# 安装系统依赖
RUN apt-get update && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装其他 Python 依赖
RUN pip install -r requirements.txt

# 复制应用代码
COPY . .

# 运行应用
CMD ["python", "app_server.py"]