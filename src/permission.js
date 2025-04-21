import router, { resetRouter } from './router'
import store from './store'
import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { i18nRender } from '@/locales'
import { preloadAllDict, loadDict } from '@/utils/dictionaryCache' // 引入字典预加载功能
import {
  generateVerticalUserRoutes,
  getFirstVerticalUserPath,
  generateVerticalMSRoutes,
  getFirstMSPath,
  generateVerticalAppRoutes,
  getFirstAppPath,
  generateGuideRoutes,
  generateEvaluationRoutes,
  getFirstEvaluationPath, generateOperationRoutes, getFirstOperationPath
} from '@/config/router.config' // 引入动态生成路由函数

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const allowList = ['login', 'register', 'registerResult'] // no redirect allowList
const loginRoutePath = '/user/login'
const defaultRoutePath = '/home'

router.beforeEach(async (to, from, next) => {
  NProgress.start() // start progress bar
  to.meta && typeof to.meta.title !== 'undefined' && setDocumentTitle(`${i18nRender(to.meta.title)} - ${domTitle}`)
  /* has token */
  const token = storage.get(ACCESS_TOKEN)
  if (token) {
    if (to.path === loginRoutePath) {
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      // check login user.roles is null
      if (store.getters.roles.length === 0) {
        // request login userInfo
        try {
          const res = await store.dispatch('GetInfo')
          // 预加载字典数据
          await preloadAllDict().catch(err => {
            console.error('预加载字典数据失败:', err)
          })
          // 根据用户权限信息生成可访问的路由表
          await store.dispatch('GenerateRoutes', { token, ...res })
          // 重置路由 防止退出重新登录或者 token 过期后页面未刷新，导致的路由重复添加
          resetRouter()
          // 动态添加可访问路由表
          const addRouters = store.getters.addRouters
          // 处理需要动态生成子路由的路由
          for (const router of addRouters) {
            if (router.path === '/' && router.children) {
              // 1. 微服务与元应用检索路由
              const verticalUserRoute = router.children.find(route => route.path === '/vertical-user')
              if (verticalUserRoute) {
                // 获取第一个垂域路径作为重定向路径
                verticalUserRoute.redirect = await getFirstVerticalUserPath()
                // 动态生成垂域路由
                verticalUserRoute.children = await generateVerticalUserRoutes()
              }
              // 2. 垂域原子微服务发布
              // 如果有publisher权限
              if (store.getters.roles.permissionList &&
                  store.getters.roles.permissionList.includes('publisher')) {
                const verticalMSRoute = router.children.find(route => route.path === '/vertical-ms')
                if (verticalMSRoute) {
                  // 获取第一个微服务路径作为重定向路径
                  verticalMSRoute.redirect = await getFirstMSPath()
                  // 动态生成微服务路由
                  const allMSRoutes = await generateVerticalMSRoutes()

                  // 根据用户权限过滤子路由
                  if (allMSRoutes && allMSRoutes.length > 0) {
                    // 对每个领域路由进行处理
                    allMSRoutes.forEach(domainRoute => {
                      if (domainRoute.children && domainRoute.children.length > 0) {
                        // 过滤子路由，只保留用户有权限的路由
                        domainRoute.children = domainRoute.children.filter(childRoute => {
                          if (childRoute.meta && childRoute.meta.permission) {
                            return childRoute.meta.permission.some(p =>
                              store.getters.roles.permissionList.includes(p)
                            )
                          }
                          return true
                        })
                      }
                    })
                  }

                  verticalMSRoute.children = allMSRoutes
                }
              }
              // 3. 垂域元应用仿真构建
              const verticalAppRoute = router.children.find(route => route.path === '/vertical-meta-app')
              if (verticalAppRoute) {
                // 获取第一个元应用路径作为重定向路径
                verticalAppRoute.redirect = await getFirstAppPath()
                // 动态生成元应用路由
                verticalAppRoute.children = await generateVerticalAppRoutes()
              }
              // 4. 技术评测与业务验证
              const verticalEvaluationRoute = router.children.find(route => route.path === '/evaluation')
              if (verticalEvaluationRoute) {
                // 根据用户权限设置重定向路径
                if (store.getters.roles.permissionList &&
                    (store.getters.roles.permissionList.includes('admin') ||
                     store.getters.roles.permissionList.includes('publisher'))) {
                  // admin或publisher权限的用户可以访问技术评测页面
                  verticalEvaluationRoute.redirect = await getFirstEvaluationPath()
                } else {
                  // user权限的用户只能访问元应用业务数据验证页面
                  const domains = await loadDict('domain', [])
                  if (domains && domains.length > 0) {
                    verticalEvaluationRoute.redirect = `/evaluation/${domains[0].code}/emulation`
                  } else {
                    verticalEvaluationRoute.redirect = '/evaluation/aml/emulation'
                  }
                }
                // 动态生成技术评测与业务验证路由
                const allEvaluationRoutes = await generateEvaluationRoutes()

                // 根据用户权限过滤子路由
                if (allEvaluationRoutes && allEvaluationRoutes.length > 0) {
                  // 对每个领域路由进行处理
                  allEvaluationRoutes.forEach(domainRoute => {
                    if (domainRoute.children && domainRoute.children.length > 0) {
                      // 过滤子路由，只保留用户有权限的路由
                      domainRoute.children = domainRoute.children.filter(childRoute => {
                        if (childRoute.meta && childRoute.meta.permission) {
                          return childRoute.meta.permission.some(p =>
                            store.getters.roles.permissionList.includes(p)
                          )
                        }
                        return true
                      })
                    }
                  })
                }

                verticalEvaluationRoute.children = allEvaluationRoutes
              }
              // 5. 服务及应用运维管理
              // 如果有admin或publisher权限
              if (store.getters.roles.permissionList &&
                  (store.getters.roles.permissionList.includes('admin') ||
                   store.getters.roles.permissionList.includes('publisher'))) {
                const verticalOperationRoute = router.children.find(route => route.path === '/operation')
                if (verticalOperationRoute) { // 修正变量名
                  // 获取第一个路径作为重定向路径
                  verticalOperationRoute.redirect = await getFirstOperationPath()
                  // 动态生成运维管理路由
                  const allOperationRoutes = await generateOperationRoutes()

                  // 根据用户权限过滤子路由
                  if (allOperationRoutes && allOperationRoutes.length > 0) {
                    // 对每个领域路由进行处理
                    allOperationRoutes.forEach(domainRoute => {
                      if (domainRoute.children && domainRoute.children.length > 0) {
                        // 过滤子路由，只保留用户有权限的路由
                        domainRoute.children = domainRoute.children.filter(childRoute => {
                          if (childRoute.meta && childRoute.meta.permission) {
                            return childRoute.meta.permission.some(p =>
                              store.getters.roles.permissionList.includes(p)
                            )
                          }
                          return true
                        })
                      }
                    })
                  }

                  verticalOperationRoute.children = allOperationRoutes
                }
              }
              // 6. 使用指南
              const guideRoute = router.children.find(route => route.path === '/guide')
              if (guideRoute) {
                // 动态生成指南路由，添加到现有的静态路由后面
                const guideChildRoutes = await generateGuideRoutes()
                if (guideChildRoutes && guideChildRoutes.length > 0) {
                  guideRoute.children = [
                    ...guideRoute.children,
                    ...guideChildRoutes
                  ]
                }
              }
            }
          }
          // 添加路由
          addRouters.forEach(r => {
            router.addRoute(r)
          })
          // 请求带有 redirect 重定向时，登录自动重定向到该地址
          const redirect = decodeURIComponent(from.query.redirect || to.path)
          if (to.path === redirect) {
            // set the replacement: true so the navigation will not leave a history record
            next({ ...to, replace: true })
          } else {
            // 跳转到目的路由
            next({ path: redirect })
          }
        } catch (error) {
          notification.error({
            message: '错误',
            description: '请求用户信息失败，请重试'
          })
          console.error('请求用户信息失败，请重试:', error)
          // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
          store.dispatch('Logout').then(() => {
            next({ path: loginRoutePath, query: { redirect: to.fullPath } })
          })
        }
      } else {
        next()
      }
    }
  } else {
    if (allowList.includes(to.name)) {
      // 在免登录名单，直接进入
      next()
    } else {
      next({ path: loginRoutePath, query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
