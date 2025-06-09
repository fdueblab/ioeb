import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/docs/',

  // 设置默认主题
  theme: 'default',

  // 设置默认语言
  lang: 'zh-CN',

  // 清理 URL 中的 .html 后缀
  cleanUrls: true,
  
  // 忽略死链接检查，允许文档开发中的链接
  ignoreDeadLinks: true,
  
  title: "算法模型智能体平台",
  description: "复旦大学算法模型智能体平台用户文档",

  // 设置头部标签
  head: [
    // 设置favicon - 多种格式确保兼容性
    ['link', { rel: 'icon', type: 'image/png', href: 'https://ioeb-1317429791.cos.ap-shanghai.myqcloud.com/docs/images/favicon.png' }],
    ['link', { rel: 'shortcut icon', href: 'https://ioeb-1317429791.cos.ap-shanghai.myqcloud.com/docs/images/favicon.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'https://ioeb-1317429791.cos.ap-shanghai.myqcloud.com/docs/images/favicon.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'https://ioeb-1317429791.cos.ap-shanghai.myqcloud.com/docs/images/favicon.png' }],
    // 设置Apple Touch图标
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://ioeb-1317429791.cos.ap-shanghai.myqcloud.com/docs/images/logo.png' }],
    // 设置meta标签
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { property: 'og:title', content: '复旦大学算法模型智能体平台' }],
    ['meta', { property: 'og:description', content: '复旦大学算法模型智能体平台用户文档' }],
    ['meta', { property: 'og:image', content: 'https://ioeb-1317429791.cos.ap-shanghai.myqcloud.com/docs/images/logo.png' }],
    ['meta', { property: 'og:type', content: 'website' }]
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: 'https://ioeb-1317429791.cos.ap-shanghai.myqcloud.com/docs/images/logo.png',

    // 启用本地搜索
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    // 启用上一页/下一页导航
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    // 启用编辑链接
    editLink: {
      pattern: 'https://github.com/PolarSnowLeopard/ioeb/edit/master/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 启用最后更新时间
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    // 大纲配置
    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    // 设置导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/quickstart' },
      { text: '用户指南', link: '/guide/' },
      { text: '开发指南', link: '/dev/' },
      { text: '常见问题', link: '/faq' },
    ],

    // 设置侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '用户指南',
          items: [
            { text: '平台介绍', link: '/guide/' },
            { text: '算法代码提交模板', link: '/guide/code-template' },
          ]
        },
        
      ],
      '/dev/': [
        {
          text: '团队开发指南',
          items: [
            { text: '开发指南首页', link: '/dev/' },
            { text: '环境搭建', link: '/dev/environment-setup' },
            { text: 'Git 最佳实践', link: '/dev/git-practices' },
            { text: '代码规范', link: '/dev/code-standards' }
          ]
        },
        {
          text: '架构与设计',
          items: [
            { text: '平台整体架构', link: '/dev/architecture/' },
            { text: '四级接口体系', link: '/dev/architecture/four-tier-interface' },
            { text: '三级验证框架', link: '/dev/architecture/three-tier-validation' },
            { text: 'MCP Server架构', link: '/dev/architecture/mcp-server' }
          ]
        },
        {
          text: '智能体开发',
          items: [
            { text: '智能体框架', link: '/dev/agent-framework/' },
            { text: '原子微服务', link: '/dev/microservices/' },
            { text: '元应用智能体', link: '/dev/meta-applications/' },
            { text: '多智能体强化学习', link: '/dev/multi-agent-rl/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/PolarSnowLeopard/Micro-Agent' }
    ],

    footer: {
      message: 'All rights reserved.',
      copyright: 'Copyright © 2023-present 复旦大学'
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
