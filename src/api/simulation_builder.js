/**
 * simulation_builder · 前端 API 统一入口（与 `simulation_builder.vue` 配套）
 *
 * 演示 vs 真实：
 * - 元应用**当前展示名称**（`buildStartPayload().appName`，与画布 `data.preName` 一致，含用户在元应用详情中的修改）
 *   含 `TOPIC_DEMO_KEYWORD`（见 `@/config/topicDemo`）→ 进程内仿真；否则 → HTTP + SSE。
 *
 * 路径拼接避免 base 已含 `/api` 时再出现 `/api/api/...`（build-design4llm.md §2.2）。
 */
import request from '@/utils/request'
import { simulationBuildInMemory } from '@/mock/services/simulation_builder_inmemory'
import { matchesTopicDemoKeyword } from '@/config/topicDemo'

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || ''

function simulationApiPath(suffix) {
  const base = API_BASE_URL.replace(/\/$/, '')
  const p = suffix.startsWith('/') ? suffix : `/${suffix}`
  if (base.endsWith('/api')) {
    return `${base}${p}`
  }
  return `${base}/api${p}`
}

function resolveSimulationStreamUrl(streamUrl) {
  if (streamUrl.startsWith('http')) return streamUrl
  const base = API_BASE_URL.replace(/\/$/, '')
  let path = streamUrl.startsWith('/') ? streamUrl : `/${streamUrl}`
  if (base.endsWith('/api') && path.startsWith('/api/')) {
    path = path.slice(4)
  }
  return `${base}${path}`
}

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

const memoryClient = createMemorySimulationBuildClient()
const httpClient = createHttpSimulationBuildClient()

/** sessionId → 本次会话是否使用进程内实现（便于 cancel/stream/result 与 start 一致） */
const sessionUsesMemory = new Map()

function forgetSession(sessionId) {
  sessionUsesMemory.delete(sessionId)
}

function clientForSessionId(sessionId) {
  const mem = sessionUsesMemory.get(sessionId)
  if (mem === true) return memoryClient
  if (mem === false) return httpClient
  return httpClient
}

/** @param {Record<string, unknown>} payload */
export function startSimulation(payload) {
  const appName = payload && payload.appName
  const useMemory = matchesTopicDemoKeyword(appName)
  const client = useMemory ? memoryClient : httpClient
  return Promise.resolve(client.startSimulation(payload)).then((res) => {
    if (res && res.sessionId) {
      sessionUsesMemory.set(res.sessionId, useMemory)
    }
    return res
  })
}

export function cancelSimulation(sessionId) {
  const client = clientForSessionId(sessionId)
  return Promise.resolve(client.cancelSimulation(sessionId)).then((r) => {
    forgetSession(sessionId)
    return r
  })
}

export function getSimulationResult(sessionId) {
  const client = clientForSessionId(sessionId)
  return Promise.resolve(client.getSimulationResult(sessionId))
}

/**
 * 研究模式实验记录列表（进程内与远端分离，按当前元应用名称分流）
 * @param {string} [appName] 当前展示名称（与画布 `data.preName` 一致）
 */
export function fetchSimulationRecords(appName) {
  const client = matchesTopicDemoKeyword(appName) ? memoryClient : httpClient
  return client.fetchSimulationRecords()
}

/**
 * @param {string[]} recordIds
 * @param {string} [appName]
 */
export function compareSimulationRecords(recordIds, appName) {
  const client = matchesTopicDemoKeyword(appName) ? memoryClient : httpClient
  return client.compareSimulationRecords(recordIds)
}

/**
 * @returns {() => void} 取消订阅
 */
export function subscribeSimulationStream(sessionId, streamUrl, handlers) {
  const client = clientForSessionId(sessionId)
  const inner = client.subscribeSimulationStream(sessionId, streamUrl, handlers)
  return () => {
    inner()
    forgetSession(sessionId)
  }
}
