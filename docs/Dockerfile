FROM node:18-alpine

WORKDIR /app

# 安装git，VitePress构建时需要git来获取文件信息
RUN apk add --no-cache git

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码（包含.git目录用于lastUpdated功能）
COPY . .

# 配置git用户（用于lastUpdated功能）
RUN git config --global user.email "ci@example.com" && \
    git config --global user.name "CI Builder"

# 构建应用
RUN npm run build

# 使用nginx作为生产服务器
FROM nginx:alpine

# 复制构建产物到nginx
COPY --from=0 /app/.vitepress/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"] 