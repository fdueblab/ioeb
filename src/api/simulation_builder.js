/**
 * simulation_builder · 前端 API 统一入口（与 `simulation_builder.vue` 配套）
 *
 * 【分流】元应用展示名 `appName`（与画布 `data.preName` 一致）是否含演示关键字
 * `TOPIC_DEMO_KEYWORD`（见 `@/config/topicDemo`）决定：
 * - **含关键字** → 进程内模拟（不请求 Micro-Agent）
 * - **不含** → HTTP + EventSource → `VUE_APP_AGENT_BASE_URL`
 *
 * `fetchSimulationRecords` / `compareSimulationRecords` 须传入同一上下文的 `appName`（与 prop 一致），以便对比面板与真链路列表分流正确。
 */
import { simulationBuildInMemory } from '@/mock/services/simulation_builder_inmemory'
import { matchesTopicDemoKeyword } from '@/config/topicDemo'

const AGENT_BASE_URL = process.env.VUE_APP_AGENT_BASE_URL || ''

/** 由「含课题关键字的 start」创建的 sessionId，subscribe/cancel 须走同一实现 */
const memoryRouteSessionIds = new Set()

function useMemoryForAppName(appName) {
  return matchesTopicDemoKeyword(appName)
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

async function agentFetch(path, options = {}) {
  const url = `${AGENT_BASE_URL}${path}`
  const resp = await fetch(url, {
    method: options.method || 'GET',
    headers: options.body ? { 'Content-Type': 'application/json' } : {},
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return resp.json()
}

function createHttpSimulationBuildClient() {
  return {
    startSimulation(payload) {
      return agentFetch('/api/simulation/start', { method: 'POST', body: payload })
    },
    cancelSimulation(sessionId) {
      return agentFetch(`/api/simulation/${sessionId}/cancel`, { method: 'POST' })
    },
    fetchSimulationRecords() {
      return agentFetch('/api/simulation/records')
    },
    compareSimulationRecords(recordIds) {
      return agentFetch('/api/simulation/records/compare', {
        method: 'POST',
        body: { recordIds }
      })
    },
    subscribeSimulationStream(sessionId, streamUrl, handlers = {}) {
      const url = streamUrl.startsWith('http')
        ? streamUrl
        : `${AGENT_BASE_URL}${streamUrl}`
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
      const events = [
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
      events.forEach((name) => {
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

/** @param {Record<string, unknown>} payload */
export function startSimulation(payload) {
  const memory = useMemoryForAppName(payload && payload.appName)
  const client = memory
    ? createMemorySimulationBuildClient()
    : createHttpSimulationBuildClient()
  return client.startSimulation(payload).then((res) => {
    if (memory && res && res.sessionId) memoryRouteSessionIds.add(res.sessionId)
    return res
  })
}

export function cancelSimulation(sessionId) {
  const memory = memoryRouteSessionIds.has(sessionId)
  const client = memory
    ? createMemorySimulationBuildClient()
    : createHttpSimulationBuildClient()
  const p = client.cancelSimulation(sessionId)
  memoryRouteSessionIds.delete(sessionId)
  return p
}

/**
 * @param {string} [appName] 与仿真面板 prop 一致；缺省则走 HTTP（真实记录列表）
 */
export function fetchSimulationRecords(appName) {
  const memory = useMemoryForAppName(appName)
  const client = memory
    ? createMemorySimulationBuildClient()
    : createHttpSimulationBuildClient()
  return client.fetchSimulationRecords()
}

/**
 * @param {string[]} recordIds
 * @param {string} [appName] 与仿真面板 prop 一致
 */
export function compareSimulationRecords(recordIds, appName) {
  const memory = useMemoryForAppName(appName)
  const client = memory
    ? createMemorySimulationBuildClient()
    : createHttpSimulationBuildClient()
  return client.compareSimulationRecords(recordIds)
}

/**
 * @returns {() => void} 取消订阅（EventSource close / 停止 inmemory emit）
 */
export function subscribeSimulationStream(sessionId, streamUrl, handlers) {
  const memory = memoryRouteSessionIds.has(sessionId)
  const client = memory
    ? createMemorySimulationBuildClient()
    : createHttpSimulationBuildClient()
  return client.subscribeSimulationStream(sessionId, streamUrl, handlers)
}
