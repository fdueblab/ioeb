# 使用 Node.js 18 作为基础镜像
FROM node:18 as build-stage

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安装 yarn（如果基础镜像未预装）
# RUN npm install -g yarn

# 安装依赖
RUN yarn install

# 复制项目文件
COPY . .

# 构建项目
RUN yarn build

# 使用 Nginx 作为生产环境
FROM nginx:stable-alpine as production-stage

# 复制构建好的文件到 Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80
EXPOSE 443

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]