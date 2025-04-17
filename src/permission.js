import router, { resetRouter } from './router'
import store from './store'
import storage from 'store'
import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { i18nRender } from '@/locales'
import { preloadAllDict } from '@/utils/dictionaryCache' // 引入字典预加载功能
import {
  generateVerticalUserRoutes,
  getFirstVerticalUserPath,
  generateVerticalMSRoutes,
  getFirstMSPath,
  generateVerticalAppRoutes,
  getFirstAppPath,
  generateGuideRoutes
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
              const verticalMSRoute = router.children.find(route => route.path === '/vertical-ms')
              if (verticalMSRoute) {
                // 获取第一个微服务路径作为重定向路径
                verticalMSRoute.redirect = await getFirstMSPath()
                // 动态生成微服务路由
                verticalMSRoute.children = await generateVerticalMSRoutes()
              }
              // 3. 垂域元应用仿真构建
              const verticalAppRoute = router.children.find(route => route.path === '/vertical-meta-app')
              if (verticalAppRoute) {
                // 获取第一个元应用路径作为重定向路径
                verticalAppRoute.redirect = await getFirstAppPath()
                // 动态生成元应用路由
                verticalAppRoute.children = await generateVerticalAppRoutes()
              }
              // 4. 使用指南
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
