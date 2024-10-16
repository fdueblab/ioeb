<h1 align="center">EB 微服务工具箱前端</h1>

- 框架：vue
- 环境：npm，构建工具：yarn
- 后台依赖：docker
- 稳定性：开发模式依赖于mock数据， nomock模式可以在本地开启不依赖mock的服务器， 
  前端整体稳定，与后端的交互并没有充分考虑出错情况，要先启动后端再启动前端，接口地址见[生产环境配置文件](./env)中的VUE_APP_API_BASE_URL变量，目前是服务器的地址
- nomock环境下host=localhost，带有前缀/api，port根据自身情况设置
- 开发的时候先开发前端，再开发后台，最后模拟mock数据


### Env and dependencies

- node
- yarn
- webpack
- eslint
- @vue/cli ~3
- [ant-design-vue](https://github.com/vueComponent/ant-design-vue) - Ant Design Of Vue 
- [vue-cropper](https://github.com/xyxiao001/vue-cropper) - Picture edit
- [@antv/g2](https://antv.alipay.com/zh-cn/index.html) - AntV G2
- [Viser-vue](https://viserjs.github.io/docs.html#/viser/guide/installation)  - Antv/G2 of Vue

> Note:  [Yarn](https://yarnpkg.com/) package management is recommended, the exact same version loaded with the demo site of this project (yarn.lock) . but you can also use npm


### Project setup

- Clone repo
```bash
git clone https://github.com/sendya/ant-design-pro-vue.git
cd ant-design-pro-vue
```

- Install dependencies
```
yarn install
```

- Compiles and hot-reloads for development
```
yarn run serve
```

- Compiles and minifies for production
```
yarn run build
```

- Lints and fixes files
```
yarn run lint
```


### Other

- **IMPORTANT : About Issue feedback !! when opening Issue read [Issue / PR Contributing](https://github.com/sendya/ant-design-pro-vue/issues/90)**

- [Vue-cli3](https://cli.vuejs.org/guide/) used by the project.

- Disable Eslint (not recommended): remove `eslintConfig`  field in `package.json`  and `vue.config.js` field `lintOnSave: false`

- Load on Demand `/src/main.js` L14, in `import './core/lazy_use'`, `import './core/use''`. more [load-on-demand.md](./docs/load-on-demand.md)

- Customize Theme:  [Custom Theme Config (@kokoroli)](https://github.com/kokoroli/antd-awesome/blob/master/docs/Ant_Design_%E6%A0%B7%E5%BC%8F%E8%A6%86%E7%9B%96.md)

- I18n: [locales (@musnow)](./src/locales/index.js)

- Production env `mock` is disabled. use `src/mock/index.js`

- pls use `release` version
