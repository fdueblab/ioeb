/**
 * simulation_builder · 前端 API 统一入口（与 `simulation_builder.vue` 配套）
 *
 * 【分流】元应用展示名 `appName`（与画布 `data.preName` 一致）见 `@/mock/data/meta_apps_data`：
 * - **课题** → 进程内 inmemory
 * - **【本地MCP】(n)** → HTTP Micro-Agent（真 MCP，n 见元应用名）
 * - **其他** → HTTP + EventSource → `VUE_APP_AGENT_BASE_URL`
 *
 * `fetchSimulationRecords` / `compareSimulationRecords` 须传入同一上下文的 `appName`（与 prop 一致）。
 */
import request from '@/utils/request'
import { simulationBuildInMemory } from '@/mock/services/simulation_builder_inmemory'
import { useMemorySimulation } from '@/mock/data/meta_apps_data'

const SIMULATION_BASE_URL =
  process.env.VUE_APP_AGENT_BASE_URL || process.env.VUE_APP_API_BASE_URL || ''

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

/** 由「含课题关键字的 start」创建的 sessionId，subscribe/cancel 须走同一实现 */
const memoryRouteSessionIds = new Set()

function useMemoryForAppName(appName) {
  return useMemorySimulation(appName)
}

function createMemorySimulationBuildClient() {
  return {
    startSimulation(payload) {
      return Promise.resolve(simulationBuildInMemory.start(payload))
    },
    cancelSimulation(sessionId) {
      simulationBuildInMemory.cancel(sessionId)
      return Promise.resolve({ success: true })
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

/** HTTP + SSE 实现（走 ioeb 网关 API） */
function createHttpSimulationBuildClient() {
  return {
    startSimulation(payload) {
      return request({
        url: `${SIMULATION_BASE_URL}/api/simulation/start`,
        method: 'post',
        data: payload
      })
    },
    cancelSimulation(sessionId) {
      return request({
        url: `${SIMULATION_BASE_URL}/api/simulation/${sessionId}/cancel`,
        method: 'post'
      })
    },
    fetchSimulationRecords(appName) {
      const params = appName ? { appName } : {}
      return request({
        url: `${SIMULATION_BASE_URL}/api/simulation/records`,
        method: 'get',
        params
      })
    },
    compareSimulationRecords(recordIds) {
      return request({
        url: `${SIMULATION_BASE_URL}/api/simulation/records/compare`,
        method: 'post',
        data: { recordIds }
      })
    },
    subscribeSimulationStream(sessionId, streamUrl, handlers = {}) {
      const url = streamUrl.startsWith('http')
        ? streamUrl
        : `${SIMULATION_BASE_URL}${streamUrl}`
      const es = new EventSource(url)
      let closedByClient = false
      let sawComplete = false
      const on = (eventName, cb) => {
        es.addEventListener(eventName, (ev) => {
          try {
            cb(JSON.parse(ev.data))
          } catch (e) {
            if (handlers.error) handlers.error(e)
          }
        })
      }
      if (handlers.complete) {
        es.addEventListener('complete', (ev) => {
          sawComplete = true
          try {
            handlers.complete(JSON.parse(ev.data))
          } catch (e) {
            if (handlers.error) handlers.error(e)
          }
        })
      } else {
        es.addEventListener('complete', () => {
          sawComplete = true
        })
      }
      SIMULATION_SSE_EVENTS.forEach((name) => {
        if (name === 'complete' || !handlers[name]) return
        on(name, handlers[name])
      })
      es.onerror = () => {
        if (closedByClient || sawComplete) {
          es.close()
          return
        }
        if (handlers.error) handlers.error(new Error('EventSource error'))
        es.close()
      }
      return () => {
        closedByClient = true
        es.close()
      }
    }
  }
}

function pickClient(appName, sessionId) {
  const memory = sessionId != null
    ? memoryRouteSessionIds.has(sessionId)
    : useMemoryForAppName(appName)
  return memory
    ? createMemorySimulationBuildClient()
    : createHttpSimulationBuildClient()
}

/** @param {Record<string, unknown>} payload */
export function startSimulation(payload) {
  const memory = useMemoryForAppName(payload && payload.appName)
  const client = pickClient(payload && payload.appName)
  return client.startSimulation(payload).then((res) => {
    if (memory && res && res.sessionId) memoryRouteSessionIds.add(res.sessionId)
    return res
  })
}

export function cancelSimulation(sessionId) {
  const client = pickClient(undefined, sessionId)
  const p = client.cancelSimulation(sessionId)
  memoryRouteSessionIds.delete(sessionId)
  return p
}

/**
 * @param {string} [appName] 与仿真面板 prop 一致；缺省则走 HTTP
 */
export function fetchSimulationRecords(appName) {
  return pickClient(appName).fetchSimulationRecords(appName)
}

/**
 * @param {string[]} recordIds
 * @param {string} [appName] 与仿真面板 prop 一致
 */
export function compareSimulationRecords(recordIds, appName) {
  return pickClient(appName).compareSimulationRecords(recordIds)
}

/**
 * @returns {() => void} 取消订阅（EventSource close / 停止 inmemory emit）
 */
export function subscribeSimulationStream(sessionId, streamUrl, handlers) {
  return pickClient(undefined, sessionId).subscribeSimulationStream(
    sessionId,
    streamUrl,
    handlers
  )
}

/** 构建结束后读取落盘轨迹（仅 HTTP / Micro-Agent） */
export function fetchSimulationTrace(sessionId) {
  return request({
    url: `${SIMULATION_BASE_URL}/api/simulation/${sessionId}/trace`,
    method: 'get',
    timeout: 60000
  })
}

/** 对轨迹跑 trace_evidence 管道，返回证据摘要 */
export function fetchSimulationEvidence(sessionId) {
  return request({
    url: `${SIMULATION_BASE_URL}/api/simulation/${sessionId}/evidence`,
    method: 'post',
    timeout: 120000
  })
}

/** 获取 ArtifactSpec v0 产物（编译自 trace，确定性输出） */
export function fetchSimulationArtifact(sessionId) {
  return request({
    url: `${SIMULATION_BASE_URL}/api/simulation/${sessionId}/artifact`,
    method: 'get',
    timeout: 60000
  })
}
