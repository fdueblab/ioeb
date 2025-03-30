# 基础镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 复制应用代码
COPY . .

# 添加执行权限到脚本
RUN chmod +x startup.sh healthcheck.sh

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 暴露所需端口
EXPOSE 5000 7860 8000

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD ./healthcheck.sh

# 运行应用
CMD ["./startup.sh"]