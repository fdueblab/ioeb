import axios from 'axios'
import store from '@/store'
import storage from 'store'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN } from '@/store/mutation-types'

/* eslint-disable handle-callback-err */
// 添加Agent基础URL配置
const AGENT_BASE_URL = process.env.VUE_APP_AGENT_BASE_URL || 'https://fdueblab.cn'
console.log('AGENT_BASE_URL', AGENT_BASE_URL)

// 创建 axios 实例
console.log('process.env.VUE_APP_API_BASE_URL', process.env.VUE_APP_API_BASE_URL)
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000 // 请求超时时间
})

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    // 从 localstorage 获取 token
    const token = storage.get(ACCESS_TOKEN)
    // Bad Request结构适配
    if (data && data.error) {
      return Promise.reject(data.error)
    }
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      // notification.error({
      //   message: 'Unauthorized',
      //   description: 'Authorization verification failed'
      // })
      if (token) {
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        })
      }
    }
  }
  return Promise.reject(error)
}

// request interceptor
request.interceptors.request.use(
  (config) => {
    const token = storage.get(ACCESS_TOKEN)
    // 如果 token 存在
    // 让每个请求携带自定义 token 请根据实际情况自行修改
    if (token) {
      config.headers[ACCESS_TOKEN] = token
    }
    return config
  },
  // eslint-disable-next-line handle-callback-err
  (error) => {
    return errorHandler(error)
  }
)

// response interceptor
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  // eslint-disable-next-line handle-callback-err
  (error) => {
    return errorHandler(error)
  }
)

const installer = {
  vm: {},
  install(Vue) {
    Vue.use(VueAxios, request)
  }
}

// 修改流式SSE响应处理函数，使用AGENT_BASE_URL
export const streamAgent = async (path, formData, callbacks = {}) => {
  // 构建完整URL
  const url = `${AGENT_BASE_URL}${path}`

  // 设置默认回调函数
  const {
    onStart = () => {},
    onStep = (step) => {},
    onError = (error) => {},
    onWarning = (warning) => {},
    onFinalResult = (results) => {},
    onComplete = () => {},
    onDataProcessError = (error) => {}
  } = callbacks

  try {
    // 调用开始回调
    onStart()

    // 发送请求
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`)
    }

    // 处理流式响应
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    // 读取和处理数据流
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        onComplete()
        break
      }

      // 解码数据并添加到缓冲区
      buffer += decoder.decode(value, { stream: true })

      // 处理缓冲区中的每一行数据
      const lines = buffer.split('\n\n')
      buffer = lines.pop() // 保留可能不完整的最后一行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6))

            // 处理错误
            if (data.error) {
              onError(data.error)
              return
            }

            // 处理警告
            if (data.warning) {
              onWarning(data.warning)
              return
            }

            // 处理最终结果
            if (data.is_final_result && data.final_results) {
              onFinalResult(data.final_results)
              return
            }

            // 处理步骤
            if (data.step) {
              onStep(data)
            }

            // 最后一步（但没有最终结果）
            if (data.is_last && !data.is_final_result && !data.warning) {
              onComplete()
            }
          } catch (e) {
            onDataProcessError(e, line)
          }
        }
      }
    }
  } catch (error) {
    onError(`请求错误: ${error.message}`)
  }
}

export default request

export { installer as VueAxios, request as axios }
