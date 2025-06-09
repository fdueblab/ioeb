FROM node:18-alpine

WORKDIR /app

# 安装git，VitePress构建时需要git来获取文件信息
RUN apk add --no-cache git

# 先复制整个项目（包含.git目录用于lastUpdated功能）
COPY . .

# 切换到docs目录
WORKDIR /app/docs

# 安装docs目录的依赖
RUN npm install

# 配置git用户（用于lastUpdated功能）
RUN git config --global user.email "ci@example.com" && \
    git config --global user.name "CI Builder"

# 构建应用
RUN npm run build

# 使用nginx作为生产服务器
FROM nginx:alpine

# 复制构建产物到nginx
COPY --from=0 /app/docs/.vitepress/dist /usr/share/nginx/html

# 复制nginx配置
COPY --from=0 /app/docs/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"] 