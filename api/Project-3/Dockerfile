# 基础镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 安装中文字体和其他工具
RUN echo 'deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main contrib non-free non-free-firmware' > /etc/apt/sources.list && \
echo 'deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main contrib non-free non-free-firmware' >> /etc/apt/sources.list && \
echo 'deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-backports main contrib non-free non-free-firmware' >> /etc/apt/sources.list && \
echo 'deb https://mirrors.tuna.tsinghua.edu.cn/debian-security bookworm-security main contrib non-free non-free-firmware' >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y \
    fonts-wqy-microhei \
    fonts-wqy-zenhei \
    xfonts-wqy \
    curl \
    netcat-openbsd \
    iputils-ping \
    net-tools \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 创建日志目录
RUN mkdir -p /app/logs /app/output /app/fonts

# 设置环境变量
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV LOG_PATH=/app/logs/app.log
ENV PYTHONDONTWRITEBYTECODE=1
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# 复制项目文件
COPY requirements.txt .
COPY fonts/ /app/fonts/

# 刷新字体缓存
RUN fc-cache -fv

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 复制应用代码
COPY . .

# 确保日志文件存在并设置权限
RUN touch /app/logs/app.log && \
    chmod 666 /app/logs/app.log && \
    chmod -R 755 /app/fonts

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# 启动服务（使用tee同时输出到控制台和文件）
CMD python app.py 2>&1 | tee -a /app/logs/app.log