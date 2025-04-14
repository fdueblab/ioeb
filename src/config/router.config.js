import { UserLayout, BasicLayout, BlankLayout, PageView } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

const RouteView = {
  name: 'RouteView',
  render: (h) => h('router-view')
}

export const asyncRouterMap = [
  // 添加新的顶级路由配置，使用BlankLayout
  {
    path: '/aml/monitor',
    name: 'aml-monitor-fullscreen',
    component: BlankLayout,
    meta: { title: '跨境支付事中监测系统', permission: ['admin', 'publisher'] },
    children: [
      {
        path: '',
        name: 'aml-monitor',
        component: () => import('@/views/aml/monitor'),
        meta: { title: '跨境支付事中监测', keepAlive: true, permission: ['admin', 'publisher'] }
      }
    ]
  },
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: {
      name: 'home'
    },
    children: [
      // 微服务与元应用检索
      {
        path: '/vertical-user',
        name: 'vertical-user',
        redirect: '/vertical-user/aml',
        component: RouteView,
        meta: { title: '微服务与元应用检索', keepAlive: true, icon: 'appstore', permission: ['admin', 'publisher'] },
        children: [
          {
            path: '/vertical-user/aml',
            name: 'vertical-user-aml',
            component: () => import('@/views/vertical/user/GenericVerticalDomain'),
            props: { verticalType: 'aml', verticalTitle: '跨境支付AI监测' },
            meta: { title: '跨境支付AI监测', keepAlive: true, permission: ['admin', 'publisher'] }
          }
        ]
      },
      // 垂域原子微服务发布
      {
        path: '/vertical-ms',
        name: 'vertical-ms',
        redirect: '/vertical-ms/aml',
        component: RouteView,
        meta: { title: '垂域原子微服务发布', keepAlive: true, icon: 'upload', permission: ['admin', 'publisher'] },
        children: [
          {
            path: '/vertical-ms/aml',
            name: 'vertical-ms-aml',
            component: () => import('@/views/vertical/ms/aml'),
            meta: { title: '跨境支付AI监测服务发布', keepAlive: true, permission: ['admin', 'publisher'] }
          }
        ]
      },
      // 垂域元应用仿真构建
      {
        path: '/vertical-meta-app',
        name: 'vertical-ms',
        redirect: '/vertical-atom-app/aml',
        component: RouteView,
        meta: {
          title: '垂域元应用仿真构建',
          keepAlive: true,
          icon: 'form',
          permission: ['admin', 'publisher', 'user']
        },
        children: [
          {
            path: '/vertical-atom-app/aml',
            name: 'vertical-meta-app-aml',
            component: () => import('@/views/schedule/AmlSchedule'),
            meta: { title: '跨境元应用智能体构建', keepAlive: true, permission: ['admin', 'publisher', 'user'] }
          }
        ]
      },
      // 技术评测与业务验证
      {
        path: '/evaluation',
        name: 'evaluation',
        redirect: '/evaluation/aml/technology',
        component: RouteView,
        meta: { title: '技术评测与业务验证', keepAlive: true, icon: 'radar-chart', permission: ['admin', 'publisher'] },
        children: [
          {
            path: '/evaluation/aml',
            name: 'evaluation-aml',
            component: RouteView,
            meta: { title: '跨境支付AI服务及应用', keepAlive: true, permission: ['admin', 'publisher'] },
            children: [
              {
                path: '/evaluation/aml/technology',
                name: 'evaluation-aml-technology',
                component: () => import('@/views/evaluation/aml/technology'),
                meta: { title: '原子微服务技术评测', keepAlive: true, permission: ['admin', 'publisher'] }
              },
              {
                path: '/evaluation/aml/emulation',
                name: 'evaluation-aml-emulation',
                meta: { title: '元应用业务数据验证', keepAlive: true, permission: ['admin', 'publisher'] },
                component: () => import('@/views/evaluation/aml/emulation')
              }
            ]
          }
        ]
      },
      // 服务及应用运维管理
      {
        path: '/operation',
        name: 'operation',
        redirect: '/operation/aml/container-status',
        component: RouteView,
        meta: { title: '服务及应用运维管理', keepAlive: true, icon: 'control', permission: ['admin', 'publisher'] },
        children: [
          {
            path: '/operation/aml',
            name: 'operation-aml',
            component: RouteView,
            meta: { title: '跨境支付AI服务及应用', keepAlive: true, permission: ['admin', 'publisher'] },
            children: [
              {
                path: '/operation/aml/container-status',
                name: 'operation-aml-container-status',
                component: () => import('@/views/operation/aml/container-status'),
                meta: { title: '微服务容器化状态', keepAlive: true, permission: ['admin', 'publisher'] }
              },
              {
                path: '/operation/aml/container-manage',
                name: 'operation-aml-container-manage',
                meta: { title: '微服务容器化管理', keepAlive: true, permission: ['admin', 'publisher'] },
                component: () => import('@/views/operation/aml/container-manage')
              }
            ]
          }
        ]
      },
      // 技术资源服务发布
      {
        path: '/ms',
        name: 'ms',
        redirect: '/ms/template',
        component: RouteView,
        hidden: true,
        meta: { title: '技术资源服务发布', keepAlive: true, icon: 'cloud', permission: ['admin', 'publisher'] },
        children: [
          {
            path: '/ms/template',
            name: 'ms-template',
            component: () => import('@/views/ms/template'),
            meta: { title: '技术资源服务模版', keepAlive: true, permission: ['admin', 'publisher'] }
          },
          {
            path: '/ms/manage',
            name: 'ms-manage',
            meta: { title: '技术资源服务管理', keepAlive: true, permission: ['admin', 'publisher'] },
            component: () => import('@/views/ms/manage')
          }
        ]
      },
      {
        path: '/virtual',
        name: 'virtual',
        redirect: '/schedule/divideSys',
        component: RouteView,
        hidden: true,
        meta: { title: '技术资源服务发布', keepAlive: true, icon: 'cloud', permission: ['admin', 'publisher'] },
        children: [
          {
            path: '/virtual/diagram',
            name: 'diagram',
            component: () => import('@/views/microservices/PresetTemplate'),
            meta: { title: '资源微服务化标准模版', keepAlive: true, permission: ['admin', 'publisher'] }
          },
          {
            path: '/schedule/divideSys',
            name: 'divideSys',
            component: () => import('@/views/schedule/DivideSystem'),
            meta: { title: '单体应用微服务化参考', keepAlive: true, permission: ['admin', 'publisher'] }
          },
          {
            path: '/schedule/divideSys2',
            name: 'divideSys2',
            meta: { title: '应用微服务封装与发布', keepAlive: true, permission: ['admin', 'publisher'] },
            component: () => import('@/views/service-publish/publish')
          },
          {
            path: '/service/detail',
            name: 'ServiceDetail',
            component: () => import('@/views/microservices/modules/ServiceDetail'),
            hidden: true,
            meta: { title: '服务规范', keepAlive: true }
          },
          {
            path: '/service/Category',
            name: 'ServiceCategory',
            component: () => import('@/views/microservices/ServiceCategory'),
            hidden: true,
            meta: { title: '服务类别详情-前沿装备类', keepAlive: true }
          },
          {
            path: '/service/Category1',
            name: 'ServiceCategory1',
            component: () => import('@/views/microservices/ServiceCategory1'),
            hidden: true,
            meta: { title: '服务类别详情-反洗钱合规类', keepAlive: true }
          },
          {
            path: '/service/Category2',
            name: 'ServiceCategory2',
            component: () => import('@/views/microservices/ServiceCategory2'),
            hidden: true,
            meta: { title: '服务类别详情-数据隐私保护类', keepAlive: true }
          },
          {
            path: '/service/Category3',
            name: 'ServiceCategory3',
            component: () => import('@/views/microservices/ServiceCategory3'),
            hidden: true,
            meta: { title: '服务类别详情-智能运维管理类', keepAlive: true }
          },
          {
            path: '/service/Category4',
            name: 'ServiceCategory4',
            component: () => import('@/views/microservices/ServiceCategory4'),
            hidden: true,
            meta: { title: '服务类别详情-数据分析与决策类', keepAlive: true }
          },
          {
            path: '/service/Category5',
            name: 'ServiceCategory5',
            component: () => import('@/views/microservices/ServiceCategory5'),
            hidden: true,
            meta: { title: '服务类别详情-网络安全防护类', keepAlive: true }
          }
        ]
      },
      // 微服务容器化管理
      {
        path: '/microservices',
        name: 'microservices',
        redirect: '/microservices/template',
        component: RouteView,
        hidden: true,
        meta: { title: '微服务容器化管理', keepAlive: true, icon: 'copy', permission: ['admin', 'publisher'] },
        children: [
          {
            path: '/microservices/list',
            name: 'microservices_list',
            component: () => import('@/views/microservices/ServiceList'),
            meta: { title: '技术资源微服务管理', keepAlive: true, permission: ['admin', 'publisher'] }
          },
          {
            path: '/microservices/service',
            name: 'service',
            component: () => import('@/views/microservices/Service'),
            meta: { title: '微服务测试与验证', keepAlive: true, permission: ['admin', 'publisher'] }
          },
          {
            path: '/microservices/container',
            name: 'container',
            component: () => import('@/views/microservices/Container'),
            meta: { title: '容器创建及部署', keepAlive: true, permission: ['admin', 'publisher'] }
          },
          {
            path: '/microservices/container/logs',
            name: 'container_logs',
            component: () => import('@/views/microservices/modules/Logs'),
            hidden: true,
            meta: { keepAlive: true, title: '容器日志' }
          },
          {
            path: '/microservices/container/json',
            name: 'container_output',
            component: () => import('@/views/microservices/modules/JsonContainer'),
            hidden: true,
            meta: { keepAlive: true, title: '容器详细信息' }
          }
        ]
      },
      // 应用服务动态组合
      {
        path: '/schedule',
        name: 'schedule',
        redirect: '/schedule/ef',
        component: RouteView,
        meta: { title: '应用服务动态组合', keepAlive: true, icon: 'copy', permission: ['user'] },
        children: [
          {
            path: '/schedule/ef',
            name: 'schedule_ef',
            component: () => import('@/views/schedule/Schedule'),
            meta: { title: '服务组合体动态编排', keepAlive: true, permission: ['user'] }
          },
          {
            path: '/dashboard/generator',
            name: 'generator',
            component: () => import('@/views/dashboard/Generator'),
            meta: { title: '服务组合体代码生成', keepAlive: true, permission: ['user'] }
          }
        ]
      },
      // 数据统计（首页）
      {
        path: '/home',
        name: 'home',
        meta: {
          title: '数据统计',
          keepAlive: true,
          icon: 'bar-chart',
          permission: ['admin', 'publisher', 'user']
        },
        component: () => import('@/views/dashboard/Analysis')
      },
      // 跨境支付事中监测系统（全屏）
      {
        path: '#/aml/monitor',
        name: 'aml-monitor-link',
        meta: {
          title: '跨境支付事中监测',
          icon: 'fund',
          target: '_blank',
          permission: ['admin', 'publisher']
        }
      },
      // 用户管理
      {
        path: '/user-manage',
        name: 'user-manage',
        meta: {
          title: '用户管理',
          keepAlive: true,
          icon: 'team',
          permission: ['admin', 'publisher', 'user']
        },
        component: () => import('@/views/user-manage')
      },
      // 使用指南
      {
        path: '/guide',
        name: 'guide',
        meta: { title: '使用指南', keepAlive: true, icon: 'book', permission: ['admin', 'publisher', 'user'] },
        redirect: '/guide/intro',
        component: RouteView,
        children: [
          {
            path: '/guide/intro',
            name: 'guide_intro',
            component: () => import('@/views/guide/intro'),
            meta: { title: '算法智能体平台简介', keepAlive: true, permission: ['admin', 'publisher', 'user'] }
          },
          {
            path: '/guide/operateGuide',
            name: 'operateGuide',
            component: () => import('@/views/guide/operateGuide'),
            meta: { title: '操作指南', keepAlive: true, permission: ['admin', 'publisher', 'user'] }
          },
          {
            path: '/guide/aml',
            name: 'guide_aml',
            meta: { title: '跨境支付AI监测', keepAlive: true, permission: ['admin', 'publisher', 'user'] },
            component: () => import('@/views/guide/verticalFieldIntro'),
            props: { verticalField: 'aml' }
          }
        ]
      },
      // 用户管理
      // {
      //   path: '/management',
      //   name: 'management',
      //   redirect: '/management/role',
      //   component: RouteView,
      //   hidden: true,
      //   meta: { title: '用户管理', keepAlive: true, icon: 'setting', permission: ['admin', 'publisher'] },
      //   children: [
      //     {
      //       path: '/management/role',
      //       name: 'management_role',
      //       component: () => import('@/views/management/Role'),
      //       meta: { title: '角色管理', keepAlive: true, permission: ['admin', 'publisher'] }
      //     },
      //     {
      //       path: '/management/user',
      //       name: 'management_user',
      //       component: () => import('@/views/management/User'),
      //       meta: { title: '用户管理', keepAlive: true, permission: ['admin', 'publisher'] }
      //     },
      //     {
      //       path: '/management/permission',
      //       name: 'management_permission',
      //       component: () => import('@/views/management/PermissionList'),
      //       meta: { title: '用户权限', keepAlive: true, permission: ['admin', 'publisher'] }
      //     },
      //     {
      //       path: '/management/tenant',
      //       name: 'management_tenant',
      //       component: () => import('@/views/management/TenantList'),
      //       meta: { title: '租户管理', keepAlive: true, permission: ['admin', 'publisher'] }
      //     }
      //   ]
      // },
      // dashboard
      {
        path: '/dashboard',
        name: 'dashboard',
        redirect: '/dashboard/endpoint',
        component: RouteView,
        hidden: true,
        meta: { title: '平台监控', keepAlive: true, icon: bxAnaalyse, permission: ['admin', 'publisher'] },
        children: [
          {
            path: '/dashboard/endpoint',
            name: 'Endpoint',
            component: () => import('@/views/dashboard/EndpointInfo'),
            meta: { title: '实时数据', keepAlive: false, permission: ['admin', 'publisher'] }
          },
          {
            path: '/dashboard/eureka',
            name: 'eureka',
            component: () => import('@/views/dashboard/Eureka'),
            meta: { title: '系统状态', keepAlive: true, permission: ['admin', 'publisher'] }
          }
        ]
      },
      // 应用实例
      {
        path: '/application',
        name: 'application',
        redirect: '/application/aircraft/history',
        component: RouteView,
        meta: { title: '应用实例', keepAlive: true, icon: 'pushpin', permission: ['user'] },
        children: [
          {
            path: '/application/aircraft',
            name: 'aircraft',
            redirect: '/application/aircraft/history',
            component: PageView,
            meta: { title: '应用实例：前沿装备远程操控系统', icon: 'pushpin', permission: ['user'] },
            children: [
              {
                path: '/application/aircraft/history',
                name: '轨迹页面',
                meta: { title: '体验安排', keepAlive: true, permission: ['user'] },
                component: () => import('@/views/Aircraft/History')
              },
              {
                path: '/application/aircraft/select',
                name: '前沿装备列表',
                meta: { title: '装备选择', keepAlive: true, permission: ['user'] },
                component: () => import('@/views/Aircraft/List')
              },
              {
                path: '/application/aircraft/live',
                name: '远程操纵',
                meta: { title: '远程实时操控', keepAlive: true, permission: ['user'] },
                component: () => import('@/views/Aircraft/Live')
              },
              {
                path: '/application/aircraft/simulate',
                name: '模拟远程操控',
                meta: { title: '模拟远程操控', keepAlive: true, permission: ['user'] },
                component: () => import('@/views/Aircraft/Simulate')
              }
            ]
          },
          {
            path: '/application/platform',
            name: '虚拟仿真案例应用',
            component: RouteView,
            meta: { title: '应用实例：虚拟仿真案例云微服务', icon: 'flag', permission: ['user'] },
            children: [
              {
                path: 'https://www.google.com',
                name: 'platform_info',
                meta: { title: '虚拟仿真教学档案', target: '_blank', permission: ['user'] }
              },
              {
                path: 'http://www.google.com',
                name: 'platform_list',
                meta: { title: '虚拟仿真列表', target: '_blank', permission: ['user'] }
              },
              {
                path: 'https://google.com',
                name: 'platform_other',
                meta: { title: '虚拟仿真体验', target: '_blank', permission: ['user'] }
              }
            ]
          }
        ]
      },
      // account
      {
        path: '/account',
        component: RouteView,
        redirect: '/account/center',
        name: 'account',
        meta: { title: '个人中心', icon: 'user', keepAlive: true, permission: ['admin', 'publisher', 'user'] },
        children: [
          {
            path: '/account/settings',
            name: 'settings',
            component: () => import('@/views/account/settings/Index'),
            meta: { title: 'menu.account.settings', hideHeader: true, permission: ['admin', 'publisher', 'user'] },
            redirect: '/account/settings/basic',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/account/settings/basic',
                name: 'BasicSettings',
                component: () => import('@/views/account/settings/BasicSetting'),
                meta: {
                  title: 'account.settings.menuMap.basic',
                  hidden: true,
                  permission: ['admin', 'publisher', 'user']
                }
              },
              {
                path: '/account/settings/security',
                name: 'SecuritySettings',
                component: () => import('@/views/account/settings/Security'),
                meta: {
                  title: 'account.settings.menuMap.security',
                  hidden: true,
                  keepAlive: true,
                  permission: ['admin', 'publisher', 'user']
                }
              },
              {
                path: '/account/settings/custom',
                name: 'CustomSettings',
                component: () => import('@/views/account/settings/Custom'),
                meta: {
                  title: 'account.settings.menuMap.custom',
                  hidden: true,
                  keepAlive: true,
                  permission: ['admin', 'publisher', 'user']
                }
              },
              {
                path: '/account/settings/binding',
                name: 'BindingSettings',
                component: () => import('@/views/account/settings/Binding'),
                meta: {
                  title: 'account.settings.menuMap.binding',
                  hidden: true,
                  keepAlive: true,
                  permission: ['admin', 'publisher', 'user']
                }
              },
              {
                path: '/account/settings/notification',
                name: 'NotificationSettings',
                component: () => import('@/views/account/settings/Notification'),
                meta: {
                  title: 'account.settings.menuMap.notification',
                  hidden: true,
                  keepAlive: true,
                  permission: ['admin', 'publisher', 'user']
                }
              }
            ]
          },
          {
            path: '/account/center',
            name: 'account-center',
            meta: {
              title: '个人空间',
              keepAlive: true,
              permission: ['admin', 'publisher', 'user']
            },
            component: () => import('@/views/account/space')
          }
        ]
      },
      {
        path: 'http://172.26.185.117:1025',
        // 用户名admin
        // 密码BEgPDsMumFlc
        name: 'report',
        meta: {
          title: '报告生成',
          keepAlive: true,
          icon: 'bar-chart',
          permission: ['admin', 'publisher', 'user'],
          target: '_blank'
        }
        // component: () => import('@/views/dashboard/Analysis')
      },
      {
        path: 'http://131.252.94.100:7002',
        // 用户名root
        // 密码nebula
        name: 'graph',
        meta: {
          title: '图数据库',
          keepAlive: true,
          icon: 'bar-chart',
          permission: ['admin', 'publisher', 'user'],
          target: '_blank'
        }
        // component: () => import('@/views/dashboard/Analysis')
      }
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]
/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  }
]
