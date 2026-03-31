/**
 * ============================================================================
 * simulation_builder 进程内模拟器（`simulation_builder_inmemory.js`）
 * ============================================================================
 *
 * 对应组件：`simulation_builder.vue` · API：`src/api/simulation_builder.js`
 *
 * 职责：在浏览器内维护会话 Map，按 docs/dev/build-design4llm.md 四阶段顺序
 * 通过 emit(eventName, payload) 模拟 SSE。
 *
 * 【流水线（与 emit 顺序对应）】
 * 1) step#0 + 逐服务 service 事件（可能 early complete 失败）
 * 2) step#1 + progress(env) × N + log
 * 3) step#2 循环：iteration(running) → phase data/logic/check → 可能 issue →
 *    iteration(retry|passed|failed) → 失败则 complete；成功则 metrics（研究）
 * 4) step#3 + progress(generate) × N → complete(success)
 *
 * 数据与概率参数全部来自 `@/mock/data/simulation_builder_data.js`。
 */

import {
  SIMULATION_BUILD_DEFAULT_STRATEGY,
  SIMULATION_BUILD_ENV_TASKS,
  SIMULATION_BUILD_GEN_TASKS,
  SIMULATION_BUILD_ISSUE_TEMPLATES,
  SIMULATION_BUILD_DELAYS_MS,
  SIMULATION_BUILD_PROB,
  simulationBuildRandomBetween,
  simulationBuildRandomIntBetween,
  simulationBuildComputeFailBias,
  simulationBuildSampleIssueTemplate,
  simulationBuildModuleMetrics
} from '@/mock/data/simulation_builder_data'

const sessions = new Map()
let idSeq = 0
const experimentRecords = []

function pushResearchRecord(session, metrics, success) {
  if (session.mode !== 'research') return
  const { body, strategy } = session
  experimentRecords.unshift({
    recordId: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    appName: body.appName,
    strategy: { ...strategy },
    metrics: { ...metrics },
    createdAt: new Date().toISOString(),
    success
  })
}

function genSessionId() {
  return `sim-${Date.now()}-${++idSeq}`
}

function sleepRange(range) {
  const [a, b] = range
  return new Promise((resolve) =>
    setTimeout(resolve, simulationBuildRandomBetween(a, b))
  )
}

function mergeStrategy(body) {
  return { ...SIMULATION_BUILD_DEFAULT_STRATEGY, ...(body.strategy || {}) }
}

function issueFingerprint(issue) {
  return `${issue.type || ''}|${issue.message || ''}`
}

function start(body) {
  const sessionId = genSessionId()
  const session = {
    id: sessionId,
    cancelled: false,
    body,
    strategy: mergeStrategy(body),
    mode: body.mode || 'production',
    result: null,
    startedAt: Date.now()
  }
  sessions.set(sessionId, session)
  return {
    success: true,
    sessionId,
    streamUrl: `/api/simulation/${sessionId}/stream`
  }
}

function cancel(sessionId) {
  const s = sessions.get(sessionId)
  if (s) s.cancelled = true
}

function getResult(sessionId) {
  const s = sessions.get(sessionId)
  if (!s) return { success: false, error: 'session_not_found' }
  return s.result || { success: false, pending: true }
}

function listRecords() {
  return experimentRecords.map((r) => ({
    recordId: r.recordId,
    appName: r.appName,
    strategy: r.strategy,
    metrics: r.metrics,
    createdAt: r.createdAt,
    success: r.success
  }))
}

function getRecord(recordId) {
  return experimentRecords.find((r) => r.recordId === recordId) || null
}

function compare(recordIds) {
  const records = recordIds
    .map((id) => {
      const r = getRecord(id)
      if (!r) return null
      return {
        recordId: r.recordId,
        strategy: r.strategy,
        metrics: r.metrics,
        createdAt: r.createdAt
      }
    })
    .filter(Boolean)
  return { records }
}

/**
 * @param {string} sessionId
 * @param {(eventName: string, data: object) => void} emit
 */
async function runStream(sessionId, emit) {
  const session = sessions.get(sessionId)
  if (!session) {
    emit('complete', { success: false, result: { error: '无效会话' } })
    return
  }

  const checkCancel = () => {
    if (session.cancelled) {
      const err = new Error('cancelled')
      err.code = 'cancelled'
      throw err
    }
  }

  const { body, strategy, mode } = session
  const servicesMeta = body.servicesMeta || []
  const maxIterations = Math.min(Math.max(body.maxIterations || 5, 1), 8)
  const isResearch = mode === 'research'

  const pushLog = (level, message) => {
    checkCancel()
    emit('log', { level, message })
  }

  try {
    emit('step', { step: 0, name: '服务匹配' })
    pushLog('INFO', '开始服务匹配')

    for (const svc of servicesMeta) {
      checkCancel()
      await sleepRange(SIMULATION_BUILD_DELAYS_MS.serviceCheck)
      pushLog('INFO', `检测服务: ${svc.name}`)
      const online = Math.random() >= SIMULATION_BUILD_PROB.serviceOffline
      const latency = online
        ? simulationBuildRandomIntBetween(70, 190)
        : undefined
      emit('service', {
        id: svc.id,
        status: online ? 'online' : 'error',
        latency
      })
      if (!online) {
        pushLog('ERROR', `${svc.name} 不可用`)
        session.result = { success: false, error: `无法连接到服务「${svc.name}」` }
        const m0 = { iterations: 0, elapsedMs: Date.now() - session.startedAt }
        emit('complete', {
          success: false,
          metrics: m0,
          result: session.result
        })
        pushResearchRecord(session, m0, false)
        return
      }
      pushLog('SUCCESS', `${svc.name} 连接正常 (${latency}ms)`)
    }
    pushLog('SUCCESS', '服务匹配完成')

    checkCancel()
    emit('step', { step: 1, name: '环境准备' })
    pushLog('INFO', '开始准备仿真环境')
    for (let i = 0; i < SIMULATION_BUILD_ENV_TASKS.length; i++) {
      checkCancel()
      const text = SIMULATION_BUILD_ENV_TASKS[i]
      emit('progress', { ctx: 'env', index: i, text, active: true })
      await sleepRange(SIMULATION_BUILD_DELAYS_MS.envItem)
      emit('progress', { ctx: 'env', index: i, text, done: true })
      pushLog('INFO', text)
    }
    pushLog('SUCCESS', '环境准备完成')

    emit('step', { step: 2, name: '智能构建' })
    pushLog('INFO', '开始智能构建')

    let success = false
    let iteration = 1
    let lastFingerprint = ''
    let sameCount = 0
    const repairNone = strategy.repair === 'none'

    while (iteration <= maxIterations && !success) {
      checkCancel()
      emit('iteration', { iteration, status: 'running' })
      pushLog('INFO', `开始第 ${iteration} 轮验证`)

      const runPhase = async (phase) => {
        checkCancel()
        emit('phase', { phase, status: 'running' })
        await sleepRange(SIMULATION_BUILD_DELAYS_MS.phase)
        emit('phase', { phase, status: 'done' })
      }

      await runPhase('data')
      pushLog('SUCCESS', '数据仿真: 数据流转正常')

      await runPhase('logic')
      pushLog('SUCCESS', '逻辑仿真: 业务逻辑正常')

      await runPhase('check')
      pushLog('INFO', '链路检视: 检查偏差和冗余')

      const failBias = simulationBuildComputeFailBias(strategy, iteration)
      const shouldIssue =
        !repairNone &&
        iteration < maxIterations &&
        Math.random() < failBias

      if (shouldIssue) {
        const tpl = simulationBuildSampleIssueTemplate(
          SIMULATION_BUILD_ISSUE_TEMPLATES
        )
        const fp = issueFingerprint(tpl)
        if (fp === lastFingerprint) sameCount += 1
        else {
          lastFingerprint = fp
          sameCount = 1
        }

        emit('issue', {
          type: tpl.type,
          message: tpl.message,
          fix: tpl.fix
        })
        pushLog('WARN', `链路检视: 发现 ${tpl.message}`)
        await sleepRange(SIMULATION_BUILD_DELAYS_MS.issueFix)
        pushLog('SUCCESS', `自动修复: ${tpl.fix}`)

        if (sameCount >= SIMULATION_BUILD_PROB.smartTerminateSameIssues) {
          pushLog('ERROR', '连续多轮相同问题，判定无法自动修复')
          session.result = {
            success: false,
            error: '智能终止：相同问题多次重复，需人工处理',
            suggestion: '请检查服务契约或调整服务组合'
          }
          emit('iteration', { iteration, status: 'failed' })
          const failMetricsEarly = {
            iterations: iteration,
            elapsedMs: Date.now() - session.startedAt
          }
          emit('complete', {
            success: false,
            metrics: failMetricsEarly,
            result: session.result
          })
          pushResearchRecord(session, failMetricsEarly, false)
          return
        }

        emit('iteration', { iteration, status: 'retry' })
        iteration += 1
        continue
      }

      pushLog('SUCCESS', '链路检视: 未发现偏差')
      success = true
      emit('iteration', { iteration, status: 'passed' })
    }

    if (!success) {
      session.result = {
        success: false,
        error: '经过多轮尝试仍无法生成稳定方案',
        suggestion: '建议检查服务配置或调整服务组合'
      }
      const mFail = {
        iterations: maxIterations,
        elapsedMs: Date.now() - session.startedAt
      }
      emit('complete', {
        success: false,
        metrics: mFail,
        result: session.result
      })
      pushResearchRecord(session, mFail, false)
      return
    }

    const elapsedMs = Date.now() - session.startedAt
    const metrics = simulationBuildModuleMetrics(iteration, elapsedMs)

    if (isResearch) {
      const tick = SIMULATION_BUILD_DELAYS_MS.metricsTick
      emit('metrics', {
        module: 'sandbox',
        metric: 'sandboxFidelity',
        value: metrics.sandboxFidelity
      })
      await sleepRange(tick)
      emit('metrics', {
        module: 'planning',
        metric: 'planningAccuracy',
        value: metrics.planningAccuracy
      })
      await sleepRange(tick)
      emit('metrics', {
        module: 'verification',
        metric: 'verificationAccuracy',
        value: metrics.verificationAccuracy
      })
      await sleepRange(tick)
      emit('metrics', {
        module: 'repair',
        metric: 'repairEffectiveness',
        value: metrics.repairEffectiveness
      })
    }

    checkCancel()
    emit('step', { step: 3, name: '方案生成' })
    pushLog('INFO', '开始生成方案')
    for (let i = 0; i < SIMULATION_BUILD_GEN_TASKS.length; i++) {
      checkCancel()
      const text = SIMULATION_BUILD_GEN_TASKS[i]
      emit('progress', { ctx: 'generate', index: i, text, active: true })
      await sleepRange(SIMULATION_BUILD_DELAYS_MS.genItem)
      emit('progress', { ctx: 'generate', index: i, text, done: true })
      pushLog('INFO', text)
    }

    const executionPath = ['用户输入', ...servicesMeta.map((s) => s.name), '输出结果']
    session.result = {
      success: true,
      executionPath,
      strategy,
      scenarioDescription: body.scenarioDescription,
      appName: body.appName,
      domain: body.domain
    }

    pushLog('SUCCESS', '方案生成完成')

    emit('complete', {
      success: true,
      metrics,
      result: session.result
    })

    pushResearchRecord(session, metrics, true)
  } catch (e) {
    if (e.code === 'cancelled') {
      session.result = { success: false, cancelled: true }
      const mc = { iterations: 0, elapsedMs: Date.now() - session.startedAt }
      emit('complete', {
        success: false,
        cancelled: true,
        metrics: mc,
        result: session.result
      })
      return
    }
    session.result = { success: false, error: e.message || String(e) }
    const me = { elapsedMs: Date.now() - session.startedAt }
    emit('complete', {
      success: false,
      metrics: me,
      result: session.result
    })
    pushResearchRecord(session, me, false)
  }
}

/**
 * 供 API 层统一调用的进程内实现（与 createRealSimulationBuildClient 方法签名一致）
 */
export const simulationBuildInMemory = {
  start,
  cancel,
  getResult,
  listRecords,
  getRecord,
  compare,
  runStream
}
