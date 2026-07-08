import axios from 'axios'
import store from '@/store'
import storage from 'store'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { API_BASE_URL, AGENT_BASE_URL } from '@/utils/baseUrl'

/* eslint-disable handle-callback-err */
console.log('AGENT_BASE_URL', AGENT_BASE_URL)

// 创建 axios 实例
console.log('API_BASE_URL', API_BASE_URL)
const request = axios.create({
  // API 请求的默认前缀
  baseURL: API_BASE_URL,
  timeout: 10000 // 请求超时时间
})

// 流式智能体：首包前可能长时间阻塞（如 MCP 建连），需单独超时
const STREAM_AGENT_FETCH_TIMEOUT_MS = 120000

const REQUEST_ERROR_KIND = {
  NETWORK: 'network',
  SERVER: 'server'
}

function requestError(message, kind) {
  const error = new Error(message)
  error.kind = kind
  return error
}

function parseAgentHttpError(errBody, status) {
  const detail = errBody && errBody.detail
  if (typeof detail === 'string' && detail.trim()) {
    return detail.trim()
  }
  if (detail && typeof detail === 'object') {
    if (typeof detail.message === 'string' && detail.message.trim()) {
      return detail.message.trim()
    }
    if (typeof detail.error === 'string' && detail.error.trim()) {
      return detail.error.trim()
    }
  }
  if (typeof errBody?.message === 'string' && errBody.message.trim()) {
    return errBody.message.trim()
  }
  return `HTTP错误! 状态码: ${status}`
}

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
  const url = `${AGENT_BASE_URL}${path}`

  const {
    onStart = () => {},
    onStep = (step) => {},
    onError = (error) => {},
    onWarning = (warning) => {},
    onFinalResult = (results) => {},
    onComplete = () => {},
    onDataProcessError = (error) => {},
    onAbort = () => {},
    onAbortController = () => {}
  } = callbacks

  const abortController = new AbortController()
  onAbortController(abortController)
  let timedOut = false
  let responseReceived = false
  const fetchTimeoutId = setTimeout(() => {
    timedOut = true
    abortController.abort()
  }, STREAM_AGENT_FETCH_TIMEOUT_MS)

  try {
    onStart()

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: abortController.signal
    })
    responseReceived = true

    clearTimeout(fetchTimeoutId)

    if (!response.ok) {
      let msg = `HTTP错误! 状态码: ${response.status}`
      try {
        const errBody = await response.json()
        msg = parseAgentHttpError(errBody, response.status)
      } catch (_) {
        /* 非 JSON 错误体 */
      }
      throw requestError(msg, REQUEST_ERROR_KIND.SERVER)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        onComplete()
        break
      }

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6))

            if (data.error) {
              onError(data.error, REQUEST_ERROR_KIND.SERVER)
              return
            }

            if (data.warning) {
              onWarning(data.warning)
              return
            }

            if (data.is_final_result && data.final_results) {
              onFinalResult(data.final_results)
              return
            }

            if (data.status === 'components' && data.session_id && callbacks.onSessionInfo) {
              callbacks.onSessionInfo(data)
            }

            if (data.step) {
              onStep(data)
            }
          } catch (e) {
            onDataProcessError(e, line)
          }
        }
      }
    }
  } catch (error) {
    clearTimeout(fetchTimeoutId)
    if (error && error.name === 'AbortError') {
      if (timedOut) {
        onError('连接智能体超时，请检查网关服务或稍后重试', REQUEST_ERROR_KIND.NETWORK)
      } else {
        onAbort()
      }
      return
    }
    const kind = error.kind || (responseReceived ? REQUEST_ERROR_KIND.SERVER : REQUEST_ERROR_KIND.NETWORK)
    onError(error.message || String(error), kind)
  }
}

export const callAgentApi = async (path, formData) => {
  const url = `${AGENT_BASE_URL}${path}`
  let response
  try {
    response = await fetch(url, { method: 'POST', body: formData })
  } catch (error) {
    throw requestError(error.message, REQUEST_ERROR_KIND.NETWORK)
  }
  if (!response.ok) {
    throw requestError(`HTTP错误! 状态码: ${response.status}`, REQUEST_ERROR_KIND.SERVER)
  }
  try {
    return await response.json()
  } catch (error) {
    throw requestError('服务器响应格式错误', REQUEST_ERROR_KIND.SERVER)
  }
}

export const streamLLMChat = async (path, formData, callbacks = {}) => {
  const url = `${AGENT_BASE_URL}${path}`
  const { onText = () => {}, onDone = () => {}, onError = () => {} } = callbacks

  try {
    const response = await fetch(url, { method: 'POST', body: formData })
    if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) { onDone(); break }
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop()
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6))
            if (data.type === 'text') onText(data.content)
            else if (data.type === 'done') onDone()
            else if (data.type === 'error') onError(data.message)
          } catch (e) { /* skip malformed */ }
        }
      }
    }
  } catch (e) {
    onError(e.message || String(e))
  }
}

export default request

export { installer as VueAxios, request as axios }
