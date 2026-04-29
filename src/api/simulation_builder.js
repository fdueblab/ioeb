/**
 * simulation_builder · 前端 API 统一入口（与 `simulation_builder.vue` 配套）
 *
 * 【设计】虚拟（进程内）与真实（HTTP + SSE）只在「选择实现」处分叉一次，
 * 对外导出函数签名不变，组件只 import 本文件。
 *
 * 切换：默认 `VUE_APP_SIMULATION_USE_MOCK` 未设置时为进程内 mock；
 * 在 `.env.development` 中设 `VUE_APP_SIMULATION_USE_MOCK=false`，`VUE_APP_API_BASE_URL` 指向
 * ioeb_backend（如 `http://127.0.0.1:5000` 或反代根路径 `https://host/api`）；路径拼接已处理重复 `/api`。
 */
import request from '@/utils/request'
import { simulationBuildInMemory } from '@/mock/services/simulation_builder_inmemory'

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || ''

/**
 * 与 VUE_APP_API_BASE_URL 拼接仿真路径，避免 base 已含 `/api` 时再出现 `/api/api/...`
 * （契约：build-design4llm.md §2.2）
 */
function simulationApiPath(suffix) {
  const base = API_BASE_URL.replace(/\/$/, '')
  const p = suffix.startsWith('/') ? suffix : `/${suffix}`
  if (base.endsWith('/api')) {
    return `${base}${p}`
  }
  return `${base}/api${p}`
}

/** streamUrl 多为 `/api/simulation/{id}/stream`，与 axios baseURL 组合时去重 `/api` */
function resolveSimulationStreamUrl(streamUrl) {
  if (streamUrl.startsWith('http')) return streamUrl
  const base = API_BASE_URL.replace(/\/$/, '')
  let path = streamUrl.startsWith('/') ? streamUrl : `/${streamUrl}`
  if (base.endsWith('/api') && path.startsWith('/api/')) {
    path = path.slice(4)
  }
  return `${base}${path}`
}

const _mockEnv = process.env.VUE_APP_SIMULATION_USE_MOCK
/** 未设置时默认 mock（true）；`.env` 中设 `VUE_APP_SIMULATION_USE_MOCK=false` 走真实后端 */
export const SIMULATION_USE_MOCK =
  _mockEnv === undefined || _mockEnv === ''
    ? true
    : String(_mockEnv).toLowerCase() === 'true'

/** SSE 自定义事件名（与后端约定一致） */
const SIMULATION_SSE_EVENTS = [
  'step',
  'iteration',
  'phase',
  'issue',
  'service',
  'log',
  'metrics',
  'progress',
  'complete'
]

/** 进程内实现：与 createHttpSimulationBuildClient 方法名、返回值形状一致 */
function createMemorySimulationBuildClient() {
  return {
    startSimulation(payload) {
      return Promise.resolve(simulationBuildInMemory.start(payload))
    },
    cancelSimulation(sessionId) {
      simulationBuildInMemory.cancel(sessionId)
      return Promise.resolve({ success: true })
    },
    getSimulationResult(sessionId) {
      return Promise.resolve(simulationBuildInMemory.getResult(sessionId))
    },
    fetchSimulationRecords() {
      return Promise.resolve(simulationBuildInMemory.listRecords())
    },
    compareSimulationRecords(recordIds) {
      return Promise.resolve(simulationBuildInMemory.compare(recordIds))
    },
    subscribeSimulationStream(sessionId, streamUrl, handlers = {}) {
      let stopped = false
      const emit = (eventName, data) => {
        if (stopped) return
        const h = handlers[eventName]
        if (typeof h === 'function') h(data)
      }
      simulationBuildInMemory.runStream(sessionId, emit).catch((err) => {
        if (!stopped && handlers.error) handlers.error(err)
      })
      return () => {
        stopped = true
        simulationBuildInMemory.cancel(sessionId)
      }
    }
  }
}

/** HTTP + SSE 实现 */
function createHttpSimulationBuildClient() {
  return {
    startSimulation(payload) {
      return request({
        url: simulationApiPath('/simulation/start'),
        method: 'post',
        data: payload
      })
    },
    cancelSimulation(sessionId) {
      return request({
        url: simulationApiPath(`/simulation/${sessionId}/cancel`),
        method: 'post'
      })
    },
    getSimulationResult(sessionId) {
      return request({
        url: simulationApiPath(`/simulation/${sessionId}/result`),
        method: 'get'
      })
    },
    fetchSimulationRecords() {
      return request({
        url: simulationApiPath('/simulation/records'),
        method: 'get'
      })
    },
    compareSimulationRecords(recordIds) {
      return request({
        url: simulationApiPath('/simulation/records/compare'),
        method: 'post',
        data: { recordIds }
      })
    },
    subscribeSimulationStream(sessionId, streamUrl, handlers = {}) {
      const url = resolveSimulationStreamUrl(streamUrl)
      const es = new EventSource(url)
      const on = (eventName, cb) => {
        es.addEventListener(eventName, (ev) => {
          try {
            cb(JSON.parse(ev.data))
          } catch (e) {
            if (handlers.error) handlers.error(e)
          }
        })
      }
      SIMULATION_SSE_EVENTS.forEach((name) => {
        if (handlers[name]) on(name, handlers[name])
      })
      es.onerror = () => {
        if (handlers.error) handlers.error(new Error('EventSource error'))
        es.close()
      }
      return () => {
        es.close()
      }
    }
  }
}

const simulationBuildClient = SIMULATION_USE_MOCK
  ? createMemorySimulationBuildClient()
  : createHttpSimulationBuildClient()

/** @param {Record<string, unknown>} payload */
export function startSimulation(payload) {
  return simulationBuildClient.startSimulation(payload)
}

export function cancelSimulation(sessionId) {
  return simulationBuildClient.cancelSimulation(sessionId)
}

export function getSimulationResult(sessionId) {
  return simulationBuildClient.getSimulationResult(sessionId)
}

export function fetchSimulationRecords() {
  return simulationBuildClient.fetchSimulationRecords()
}

export function compareSimulationRecords(recordIds) {
  return simulationBuildClient.compareSimulationRecords(recordIds)
}

/**
 * 订阅仿真事件流
 * @returns {() => void} 取消订阅
 */
export function subscribeSimulationStream(sessionId, streamUrl, handlers) {
  return simulationBuildClient.subscribeSimulationStream(
    sessionId,
    streamUrl,
    handlers
  )
}
