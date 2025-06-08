import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "模型智能体平台",
  description: "复旦大学计算与智能创新学院电子商务实验室",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/quickstart' },
      { text: '用户指南', link: '/guide/' },
      { text: 'API文档', link: '/api/' },
      { text: '常见问题', link: '/faq' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '用户指南',
          items: [
            { text: '平台介绍', link: '/guide/' },
            { text: '账户管理', link: '/guide/account' },
            { text: '模型管理', link: '/guide/models' },
            { text: '智能体创建', link: '/guide/agents' },
            { text: '数据管理', link: '/guide/data' },
            { text: '项目管理', link: '/guide/projects' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '自定义模型', link: '/guide/advanced/custom-models' },
            { text: '批量处理', link: '/guide/advanced/batch-processing' },
            { text: '工作流编排', link: '/guide/advanced/workflows' },
            { text: '监控与日志', link: '/guide/advanced/monitoring' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 文档',
          items: [
            { text: 'API 概览', link: '/api/' },
            { text: '认证授权', link: '/api/authentication' },
            { text: '模型 API', link: '/api/models' },
            { text: '智能体 API', link: '/api/agents' },
            { text: '数据 API', link: '/api/data' },
            { text: '错误码说明', link: '/api/errors' }
          ]
        },
        {
          text: 'SDK',
          items: [
            { text: 'Python SDK', link: '/api/sdk/python' },
            { text: 'JavaScript SDK', link: '/api/sdk/javascript' },
            { text: 'Java SDK', link: '/api/sdk/java' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/your-repo' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 复旦大学计算与智能创新学院电子商务实验室'
    }
  },
  
  // Vite 配置
  vite: {
    server: {
      host: true,
      allowedHosts: ['fdueblab.cn']
    }
  }
})
