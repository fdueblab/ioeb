// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

/* export const asyncRouterMap = [

  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/dashboard/endpoint',
    children: [
      // dashboard
      {
        path: 'dashboard',
        redirect: '/dashboard/endpoint',
        name: 'dashboard',
        component: PageView,
        meta: { title: '监控页', keepAlive: true, icon: bxAnaalyse },
        children: [
          // 首页，信息集合
          {
            path: '/dashboard/endpoint',
            name: 'Endpoint',
            meta: { title: '首页', keepAlive: true },
            component: () => import('@/views/dashboard/EndpointInfo')
          },
/!*          {
            path: '/dashboard/skywalking',
            name: '分布式链路追踪',
            meta: { title: '分布式链路追踪', keepAlive: true },
            component: () => import('@/views/test/skywalking')
          }, *!/
          // 提供服务检索功能
          {
            path: '/dashboard/eureka',
            name: '微服务注册中心',
            meta: { title: '注册中心', keepAlive: true },
            component: () => import('@/views/dashboard/Eureka')
          }
        ]
      },
      {
        path: 'virtual',
        name: '服务发布',
        redirect: '/virtual/diagram',
        component: PageView,
        meta: { title: '服务发布', icon: 'cloud' },
        children: [
          {
            path: '/virtual/diagram',
            name: '用户上传新服务',
            component: () => import('@/views/microservices/PresetTemplate'),
            meta: { title: '服务模板', keepAlive: true }
          },
          {
            path: '/schedule/divideSys',
            name: '单体系统微服务化',
            meta: { title: '单体系统微服务化', keepAlive: true },
            component: () => import('@/views/schedule/DivideSystem')
          },
          {
            path: '/service/detail',
            name: '服务规范',
            component: () => import('@/views/microservices/modules/ServiceDetail'),
            hidden: true,
            meta: { title: '服务规范', keepAlive: true }
          }
          // {
          //   path: '/virtual/list',
          //   name: '已有虚拟化资源',
          //   meta: { title: '已有虚拟化资源', keepAlive: true },
          //   component: () => import('@/views/virtual/uml_class_diagram')
          // }
        ]
      },
      /!* {
        path: 'resources',
        name: '微服务化技术资源',
        redirect: '/resources/definition',
        component: PageView,
        meta: { title: '微服务化技术资源', icon: 'cloud' },
        children: [
          {
            path: '/resources/definition',
            name: '技术资源定义',
            component: () => import('@/views/resources/Definition'),
            meta: { title: '技术资源定义', keepAlive: true }
          },
          {
            path: '/resources/swagger',
            name: '微服务接口管理',
            meta: { title: '微服务接口管理', keepAlive: true },
            component: () => import('@/views/resources/Swagger')
          }
        ]
      },
*!/
      {
        path: '/microservices',
        name: '服务部署及管理',
        redirect: '/microservices/template',
        component: PageView,
        meta: { title: '服务部署及管理', icon: 'copy' },
        description: '容器管理页，可以查看容器的日志，信息，启动，删除等',
        children: [
          {
            // 微服务列表，对每个微服务所具有的功能可以进行展示查看
            path: '/microservices/list',
            name: '各个微服务的可视化查看',
            meta: { title: '服务列表', keepAlive: true },
            component: () => import('@/views/microservices/ServiceList')
          },
          {
            // 这里都是服务，或者说，都是docker-compose文件的内容，
            // 可以考虑自己添加写一个管理程序，暂时不理这个地方
            path: '/microservices/service',
            name: '服务测试',
            component: () => import('@/views/microservices/Service'),
            meta: { title: '服务测试', keepAlive: true }
          },
          {
            // 服务的最小管理尺度，和机器上的container一一对应
            path: '/microservices/container',
            name: '容器',
            meta: { title: '容器管理', keepAlive: true },
            component: () => import('@/views/microservices/Container')
          },
          {
            // 新建容器
            path: '/microservices/newcontainer',
            name: '新建容器',
            meta: { title: '新建容器', keepAlive: true },
            component: () => import('@/views/microservices/NewContainer')
          },
          {
            path: '/microservices/container/logs',
            name: '容器的日志文件组件',
            component: () => import('@/views/microservices/modules/Logs'),
            hidden: true,
            meta: { keepAlive: true, title: '容器日志' }
            // hideChildrenInMenu: true // 强制显示 MenuItem 而不是 SubMenu
          },
          {
            path: '/microservices/container/json',
            name: '容器的json详细输出',
            component: () => import('@/views/microservices/modules/JsonContainer'),
            hidden: true,
            meta: { keepAlive: true, title: '容器详细信息' }
          }

        ]
      },
      {
        path: '/schedule',
        name: '服务组合',
        component: RouteView,
        redirect: '/schedule/ef',
        meta: { title: '服务编排', icon: 'pushpin' },
        children: [
          {
            path: '/schedule/ef',
            name: '可视化组合服务',
            meta: { title: '可视化组合服务', keepAlive: true },
            component: () => import('@/views/schedule/Schedule')
          },
          {
            path: '/dashboard/generator',
            name: 'Code Generator',
            meta: { title: '代码生成', keepAlive: true, permission: ['dashboard'] },
            component: () => import('@/views/dashboard/Generator')
          },
          {
            path: '/schedule/micserviceChart',
            name: '拆分完成图示',
            hidden: true,
            meta: { title: '拆分完成图示', keepAlive: true },
            component: () => import('@/views/schedule/CompletedCharts')
          }
          // {
          //   path: '/schedule/list',
          //   name: '已有编排服务',
          //   meta: { title: '已有编排服务', keepAlive: true },
          //   component: () => import('@/views/schedule/List')
          // }
        ]
      },
      {
        path: '/aircraft',
        name: '应用构建案例',
        redirect: '/aircraft/history',
        component: PageView,
        meta: { title: '前沿装备体验平台', icon: 'pushpin' },
        children: [
          {
            path: '/aircraft/history',
            name: '轨迹页面',
            meta: { title: '教学档案', keepAlive: true },
            component: () => import('@/views/Aircraft/History')
          },
          {
            path: '/aircraft/select',
            name: '前沿装备列表',
            meta: { title: '装备列表', keepAlive: true },
            component: () => import('@/views/Aircraft/List')
          },
          {
            path: '/aircraft/live',
            name: '远程操纵',
            meta: { title: '远程操纵', keepAlive: true },
            component: () => import('@/views/Aircraft/Live')
          }
        ]
      },
 /!*     {
        path: '/blockchain',
        name: '租户链化及集成管理',
        redirect: '/blockchain/tenant',
        component: PageView,
        meta: { title: '租户链化及集成管理', icon: 'pushpin' },
        children: [
          {
            path: '/blockchain/tenant',
            name: '查看上链数据',
            meta: { title: '查看上链数据', keepAlive: true },
            component: () => import('@/views/blockchain/tenant')
          },
          {
            path: '/blockchain/config',
            name: '租户链化配置',
            meta: { title: '租户链化配置', keepAlive: true }
          },
          {
            path: '/blockchain/definition',
            name: '云服务应用端定义',
            meta: { title: '云服务应用端定义', keepAlive: true }
          }
        ]
      }, *!/

      // platform
      {
        path: '/platform',
        name: '现有云平台',
        component: RouteView,
        meta: { title: '现有云平台', icon: 'flag' },
        children: [
          {
            path: 'https://www.google.com/',
            name: 'Monitor',
            meta: { title: '案例云（暂未部署）', target: '_blank' }
          },
          {
            path: 'https://www.facebook.com/',
            name: '其他云平台',
            meta: { title: '其他云', target: '_blank' }
          }
        ]
      },

      // permission
      {
        path: '/management',
        name: '系统管理',
        redirect: '/management/permission',
        component: PageView,
        meta: { title: '系统管理', icon: 'setting' },
        children: [
          {
            path: '/management/permission',
            name: 'Permission',
            meta: { title: '权限管理页', keepAlive: true },
            component: () => import('@/views/management/PermissionList')
          },
          {
            path: '/management/role',
            name: '角色管理',
            meta: { title: '角色管理', keepAlive: true },
            component: () => import('@/views/management/Role')
          },
          {
            path: '/management/user',
            name: '用户管理',
            meta: { title: '用户管理', keepAlive: true },
            component: () => import('@/views/management/User')
          },
          {
            path: '/management/tenant',
            name: '租户管理',
            meta: { title: '租户管理', keepAlive: true },
            component: () => import('@/views/management/TenantList')
          }
        ]
      },

      // account
      {
        path: '/account',
        component: RouteView,
        redirect: '/account/center',
        name: 'account',
        meta: { title: '个人页', icon: 'user', keepAlive: true, permission: ['user'] },
        children: [
          {
            path: '/account/center',
            name: 'center',
            component: () => import('@/views/account/center/Index'),
            meta: { title: '个人中心', keepAlive: true, permission: ['user'] }
          },
          {
            path: '/account/settings',
            name: 'settings',
            component: () => import('@/views/account/settings/Index'),
            meta: { title: '个人设置', hideHeader: true, permission: ['user'] },
            redirect: '/account/settings/base',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/account/settings/base',
                name: 'BaseSettings',
                component: () => import('@/views/account/settings/BaseSetting'),
                meta: { title: '基本设置', hidden: true, permission: ['user'] }
              },
              {
                path: '/account/settings/security',
                name: 'SecuritySettings',
                component: () => import('@/views/account/settings/Security'),
                meta: { title: '安全设置', hidden: true, keepAlive: true, permission: ['user'] }
              },
              {
                path: '/account/settings/custom',
                name: 'CustomSettings',
                component: () => import('@/views/account/settings/Custom'),
                meta: { title: '个性化设置', hidden: true, keepAlive: true, permission: ['user'] }
              },
              {
                path: '/account/settings/binding',
                name: 'BindingSettings',
                component: () => import('@/views/account/settings/Binding'),
                meta: { title: '账户绑定', hidden: true, keepAlive: true, permission: ['user'] }
              },
              {
                path: '/account/settings/notification',
                name: 'NotificationSettings',
                component: () => import('@/views/account/settings/Notification'),
                meta: { title: '新消息通知', hidden: true, keepAlive: true, permission: ['user'] }
              }
            ]
          }
        ]
      }
      // 练习语法
      /!*      {
              path: '/exercises',
              name: 'test',
              component: () => import('@/views/grammar'),
              meta: { title: '用来练习js语法', icon: 'dribbble' }
            } *!/
    ]
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
] */

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
  },

  {
    path: '/test',
    component: BlankLayout,
    redirect: '/test/home',
    children: [
      {
        path: 'home',
        name: 'TestHome',
        component: () => import('@/views/Home')
      }
    ]
  },
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/dashboard/endpoint',
    children: [
      {
        path: 'virtual',
        name: '技术资源服务发布',
        redirect: '/virtual/diagram',
        component: PageView,
        meta: { title: '技术资源服务发布', icon: 'cloud' },
        children: [
          {
            path: '/virtual/diagram',
            name: '用户上传新服务',
            component: () => import('@/views/microservices/PresetTemplate'),
            meta: { title: '资源微服务化标准模版', keepAlive: true }
          },
          {
            path: '/schedule/divideSys',
            name: '单体系统微服务化',
            meta: { title: '单体应用微服务化参考', keepAlive: true },
            component: () => import('@/views/schedule/DivideSystem')
          },
          {
            path: '/schedule/divideSys2',
            name: '独立开发微服务化',
            // meta: { title: '独立开发微服务化发布', keepAlive: true },
            meta: { title: '应用微服务封装与发布', keepAlive: true },
            component: () => import('@/views/service-publish/publish')
          },
          {
            path: '/service/detail',
            name: '服务规范',
            component: () => import('@/views/microservices/modules/ServiceDetail'),
            hidden: true,
            meta: { title: '服务规范', keepAlive: true }
          },
          {
            path: '/service/Category',
            name: '服务类别详情-前沿装备类',
            component: () => import('@/views/microservices/ServiceCategory'),
            hidden: true,
            meta: { title: '服务类别详情-前沿装备类', keepAlive: true }
          },
          {
            path: '/service/Category1',
            name: '服务类别详情-反洗钱合规类',
            component: () => import('@/views/microservices/ServiceCategory1'),
            hidden: true,
            meta: { title: '服务类别详情-反洗钱合规类', keepAlive: true }
          },
          {
            path: '/service/Category2',
            name: '服务类别详情-数据隐私保护类',
            component: () => import('@/views/microservices/ServiceCategory2'),
            hidden: true,
            meta: { title: '服务类别详情-数据隐私保护类', keepAlive: true }
          },
          {
            path: '/service/Category3',
            name: '服务类别详情-智能运维管理类',
            component: () => import('@/views/microservices/ServiceCategory3'),
            hidden: true,
            meta: { title: '服务类别详情-智能运维管理类', keepAlive: true }
          },
          {
            path: '/service/Category4',
            name: '服务类别详情-数据分析与决策类',
            component: () => import('@/views/microservices/ServiceCategory4'),
            hidden: true,
            meta: { title: '服务类别详情-数据分析与决策类', keepAlive: true }
          },
          {
            path: '/service/Category5',
            name: '服务类别详情-网络安全防护类',
            component: () => import('@/views/microservices/ServiceCategory5'),
            hidden: true,
            meta: { title: '服务类别详情-网络安全防护类', keepAlive: true }
          }
          // {
          //   path: '/virtual/list',
          //   name: '已有虚拟化资源',
          //   meta: { title: '已有虚拟化资源', keepAlive: true },
          //   component: () => import('@/views/virtual/uml_class_diagram')
          // }
        ]
      },
      /* {
        path: 'resources',
        name: '微服务化技术资源',
        redirect: '/resources/definition',
        component: PageView,
        meta: { title: '微服务化技术资源', icon: 'cloud' },
        children: [
          {
            path: '/resources/definition',
            name: '技术资源定义',
            component: () => import('@/views/resources/Definition'),
            meta: { title: '技术资源定义', keepAlive: true }
          },
          {
            path: '/resources/swagger',
            name: '微服务接口管理',
            meta: { title: '微服务接口管理', keepAlive: true },
            component: () => import('@/views/resources/Swagger')
          }
        ]
      },
*/
      {
        path: '/microservices',
        name: '微服务容器化管理',
        redirect: '/microservices/template',
        component: PageView,
        meta: { title: '微服务容器化管理', icon: 'copy' },
        description: '容器管理页，可以查看容器的日志，信息，启动，删除等',
        children: [
          {
            // 微服务列表，对每个微服务所具有的功能可以进行展示查看
            path: '/microservices/list',
            name: '各个微服务的可视化查看',
            meta: { title: '技术资源微服务管理', keepAlive: true },
            component: () => import('@/views/microservices/ServiceList')
          },
          {
            // 这里都是服务，或者说，都是docker-compose文件的内容，
            // 可以考虑自己添加写一个管理程序，暂时不理这个地方
            path: '/microservices/service',
            name: '服务测试',
            component: () => import('@/views/microservices/Service'),
            meta: { title: '微服务测试与验证', keepAlive: true }
          },
          {
            // 服务的最小管理尺度，和机器上的container一一对应
            path: '/microservices/container',
            name: '容器',
            meta: { title: '容器创建及部署', keepAlive: true },
            component: () => import('@/views/microservices/Container')
          },
          {
            path: '/microservices/container/logs',
            name: '容器的日志文件组件',
            component: () => import('@/views/microservices/modules/Logs'),
            hidden: true,
            meta: { keepAlive: true, title: '容器日志' }
            // hideChildrenInMenu: true // 强制显示 MenuItem 而不是 SubMenu
          },
          {
            path: '/microservices/container/json',
            name: '容器的json详细输出',
            component: () => import('@/views/microservices/modules/JsonContainer'),
            hidden: true,
            meta: { keepAlive: true, title: '容器详细信息' }
          }

        ]
      },
      {
        path: '/schedule',
        name: '服务组合',
        component: RouteView,
        redirect: '/schedule/ef',
        meta: { title: '应用服务动态组合', icon: 'pushpin' },
        children: [
          {
            path: '/schedule/ef',
            name: '可视化组合服务',
            meta: { title: '服务组合体动态编排', keepAlive: true },
            component: () => import('@/views/schedule/Schedule')
          },
          {
            path: '/dashboard/generator',
            name: 'Code Generator',
            meta: { title: '服务组合体代码生成', keepAlive: true, permission: ['dashboard'] },
            component: () => import('@/views/dashboard/Generator')
          },
          {
            path: '/schedule/micserviceChart',
            name: '拆分完成图示',
            hidden: true,
            meta: { title: '拆分完成图示', keepAlive: true },
            component: () => import('@/views/schedule/CompletedCharts')
          }
          // {
          //   path: '/schedule/list',
          //   name: '已有编排服务',
          //   meta: { title: '已有编排服务', keepAlive: true },
          //   component: () => import('@/views/schedule/List')
          // }
        ]
      },


      // permission
      {
        path: '/management',
        name: '用户管理',
        redirect: '/management/permission',
        component: PageView,
        meta: { title: '用户管理', icon: 'setting' },
        children: [
          {
            path: '/management/role',
            name: '角色管理',
            meta: { title: '角色管理', keepAlive: true },
            component: () => import('@/views/management/Role')
          },
          {
            path: '/management/user',
            name: '用户管理',
            meta: { title: '用户管理', keepAlive: true },
            component: () => import('@/views/management/User')
          },
          {
            path: '/management/permission',
            name: 'Permission',
            meta: { title: '用户权限', keepAlive: true },
            component: () => import('@/views/management/PermissionList')
          },
          {
            path: '/management/tenant',
            name: '租户管理',
            meta: { title: '租户管理', keepAlive: true },
            component: () => import('@/views/management/TenantList')
          }
        ]
      },

      // dashboard
      {
        path: 'dashboard',
        redirect: '/dashboard/endpoint',
        name: 'dashboard',
        component: PageView,
        meta: { title: '平台监控', keepAlive: true, icon: bxAnaalyse },
        children: [
          // 首页，信息集合
          {
            path: '/dashboard/endpoint',
            name: 'Endpoint',
            meta: { title: '实时数据', keepAlive: true },
            component: () => import('@/views/dashboard/EndpointInfo')
          },
          /*          {
                      path: '/dashboard/skywalking',
                      name: '分布式链路追踪',
                      meta: { title: '分布式链路追踪', keepAlive: true },
                      component: () => import('@/views/test/skywalking')
                    }, */
          // 提供服务检索功能
          {
            path: '/dashboard/eureka',
            name: '微服务注册中心',
            meta: { title: '系统状态', keepAlive: true },
            component: () => import('@/views/dashboard/Eureka')
          }
        ]
      },


      {
        path: '/application',
        name: '应用实例',
        redirect: '/application/aircraft/history',
        component: PageView,
        meta: { title: '应用实例', icon: 'pushpin' },
        children: [
          {
            path: '/application/aircraft',
            name: '应用构建案例',
            redirect: '/application/aircraft/history',
            component: PageView,
            meta: { title: '应用实例：前沿装备远程操控系统', icon: 'pushpin' },
            children: [
              {
                path: '/application/aircraft/history',
                name: '轨迹页面',
                meta: { title: '体验安排', keepAlive: true },
                component: () => import('@/views/Aircraft/History')
              },
              {
                path: '/application/aircraft/select',
                name: '前沿装备列表',
                meta: { title: '装备选择', keepAlive: true },
                component: () => import('@/views/Aircraft/List')
              },
              {
                path: '/application/aircraft/live',
                name: '远程操纵',
                meta: { title: '远程实时操控', keepAlive: true },
                component: () => import('@/views/Aircraft/Live')
              },
              {
                path: '/application/aircraft/simulate',
                name: '模拟远程操控',
                meta: { title: '模拟远程操控', keepAlive: true },
                component: () => import('@/views/Aircraft/Simulate')
              }
            ]
          },
          /*     {
                 path: '/blockchain',
                 name: '租户链化及集成管理',
                 redirect: '/blockchain/tenant',
                 component: PageView,
                 meta: { title: '租户链化及集成管理', icon: 'pushpin' },
                 children: [
                   {
                     path: '/blockchain/tenant',
                     name: '查看上链数据',
                     meta: { title: '查看上链数据', keepAlive: true },
                     component: () => import('@/views/blockchain/tenant')
                   },
                   {
                     path: '/blockchain/config',
                     name: '租户链化配置',
                     meta: { title: '租户链化配置', keepAlive: true }
                   },
                   {
                     path: '/blockchain/definition',
                     name: '云服务应用端定义',
                     meta: { title: '云服务应用端定义', keepAlive: true }
                   }
                 ]
               }, */

          // platform
          {
            path: '/application/platform',
            name: '虚拟仿真案例应用',
            component: RouteView,
            meta: { title: '应用实例：虚拟仿真案例云微服务', icon: 'flag' },
            children: [
              {
                path: 'https://www.google.com/',
                name: 'Monitor',
                meta: { title: '虚拟仿真教学档案', target: '_blank' }
              },
              {
                path: 'https://www.google.com/',
                name: 'Monitor',
                meta: { title: '虚拟仿真列表', target: '_blank' }
              },
              {
                path: 'https://www.facebook.com/',
                name: '其他云平台',
                meta: { title: '虚拟仿真体验', target: '_blank' }
              }
            ]
          },
        ]
      },


      // account
      {
        path: '/account',
        component: RouteView,
        redirect: '/account/center',
        name: 'account',
        meta: { title: '个人设置', icon: 'user', keepAlive: true, permission: ['user'] },
        children: [
          {
            path: '/account/center',
            name: 'center',
            component: () => import('@/views/account/center/Index'),
            meta: { title: '个人信息', keepAlive: true, permission: ['user'] }
          },
          {
            path: '/account/settings',
            name: 'settings',
            component: () => import('@/views/account/settings/Index'),
            meta: { title: '个人账户', hideHeader: true, permission: ['user'] },
            redirect: '/account/settings/base',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/account/settings/base',
                name: 'BaseSettings',
                component: () => import('@/views/account/settings/BaseSetting'),
                meta: { title: '基本设置', hidden: true, permission: ['user'] }
              },
              {
                path: '/account/settings/security',
                name: 'SecuritySettings',
                component: () => import('@/views/account/settings/Security'),
                meta: { title: '安全设置', hidden: true, keepAlive: true, permission: ['user'] }
              },
              {
                path: '/account/settings/custom',
                name: 'CustomSettings',
                component: () => import('@/views/account/settings/Custom'),
                meta: { title: '个性化设置', hidden: true, keepAlive: true, permission: ['user'] }
              },
              {
                path: '/account/settings/binding',
                name: 'BindingSettings',
                component: () => import('@/views/account/settings/Binding'),
                meta: { title: '账户绑定', hidden: true, keepAlive: true, permission: ['user'] }
              },
              {
                path: '/account/settings/notification',
                name: 'NotificationSettings',
                component: () => import('@/views/account/settings/Notification'),
                meta: { title: '新消息通知', hidden: true, keepAlive: true, permission: ['user'] }
              }
            ]
          }
        ]
<<<<<<< HEAD
      },

      {
        path: '/test',
        name: '服务组合',
        component: RouteView,
        redirect: '/test/bianpai',
        meta: { title: '应用服务动态组合', icon: 'pushpin' },
        children: [
          {
            path: '/test/bianpai',
            name: '可视化组合服务',
            meta: { title: '服务组合体动态编排', keepAlive: true },
            component: () => import('@/views/schedule/Schedule_copy')
          }
        ]
      },
=======
      }
>>>>>>> d4893a81c8fb49afb8a7d7eb61cc18776b49be52
      // 练习语法
      /*      {
              path: '/exercises',
              name: 'test',
              component: () => import('@/views/grammar'),
              meta: { title: '用来练习js语法', icon: 'dribbble' }
            } */
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
