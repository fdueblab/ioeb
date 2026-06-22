/**
 * ============================================================================
 * simulation_builder 进程内模拟器（`simulation_builder_inmemory.js`）
 * ============================================================================
 *
 * 对应组件：`simulation_builder.vue` · API：`src/api/simulation_builder.js`
 *
 * 职责：在浏览器内维护会话 Map，按四阶段顺序通过 emit(eventName, payload) 模拟 SSE。
 *
 * 【流水线（与 emit 顺序对应）】
 * 1) step#0 + 逐服务 service 事件（进程内模拟均为在线，无随机失败）
 * 2) step#1 + progress(env) × N + log
 * 3) step#2：单轮 iteration → phase data/logic/check → passed（无随机 issue/重试）
 * 4) step#3 + progress(generate) × N → complete(success)
 *
 * 延迟与 metrics 范围来自 `@/mock/data/simulation_builder_data.js`。
 */

import {
  SIMULATION_BUILD_DEFAULT_STRATEGY,
  SIMULATION_BUILD_ENV_TASKS,
  SIMULATION_BUILD_GEN_TASKS,
  SIMULATION_BUILD_DELAYS_MS,
  SIMULATION_BUILD_MOCK_STAGE,
  simulationBuildRandomBetween,
  simulationBuildModuleMetrics,
  simulationBuildMockEnhancementRecord
} from '@/mock/data/simulation_builder_data'
import { buildTopicServiceSelectionReport } from '@/mock/data/topic_simulation_artifacts'

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

/** 日志中展示 prompt 片段长度上限 */
function truncateForLog(text, max = 220) {
  if (text == null || text === '') return '（空）'
  const s = String(text).replace(/\s+/g, ' ').trim()
  return s.length <= max ? s : `${s.slice(0, max)}…`
}

function sanitizeId(text, maxLen = 128) {
  const ident = String(text || 'srv')
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
  return (ident || 'srv').slice(0, maxLen)
}

function demoToolName(svc) {
  return `${sanitizeId(svc.id || svc.name)}_execute`
}

function buildScenarioParsed(body) {
  const sp = body.scenarioParsed || {}
  return {
    goal: sp.goal || body.appName || '课题元应用构建',
    description: sp.description || body.scenarioDescription || '',
    constraints: Array.isArray(sp.constraints) ? [...sp.constraints] : [],
    acceptanceCriteria: Array.isArray(sp.acceptanceCriteria) ? [...sp.acceptanceCriteria] : [],
    domain: sp.domain || body.domain || 'generic',
    source: sp.source || {
      parserModel: 'scenario-intake-agent-v1',
      parsedAt: new Date().toISOString()
    },
    scenarioKey: sp.scenarioKey
  }
}

function buildPlannerPayload(iteration, servicesMeta) {
  const executionPath = demoExecutionPath(servicesMeta)
  const toolCallDetails = servicesMeta.map((svc, idx) => {
    const toolName = demoToolName(svc)
    const latency = 120 + idx * 35
    return {
      call_id: `call-topic-${iteration}-${idx}`,
      tool: toolName,
      service: svc.name,
      channel: 'real_mcp',
      transport: 'sse',
      arguments: { iteration, taskRef: `iter-${iteration}-service-${idx + 1}` },
      result_preview: `调用成功 · ${svc.name}`,
      error: null,
      latency_ms: latency,
      success: true,
      timestamp: new Date().toISOString()
    }
  })
  return {
    iteration,
    candidate_tools: servicesMeta.map((s) => demoToolName(s)),
    selected_tools: toolCallDetails.map((d) => d.tool),
    reason: iteration < 2
      ? '首轮规划：按想定顺序串联各 MCP 服务'
      : '修复后规划：调用顺序已优化，满足验收标准',
    executionPath,
    dispatch: { mode: 'sequential', services: servicesMeta.map((s) => String(s.id)) },
    tool_call_details: toolCallDetails
  }
}

function buildVerifierPayload(iteration, status, plannerPayload, servicesMeta) {
  const evidenceRefs = servicesMeta.map((_, idx) => `call-topic-${iteration}-${idx}`)
  const failed = status === 'FAILED'
  const issueText = failed
    ? '首轮轨迹中服务覆盖已完成，但报告生成阶段对上游风险识别和安全评测结果的引用不够明确，审计证据链仍需补强。'
    : ''
  return {
    iteration,
    status,
    summary: failed
      ? '审查未通过：当前轨迹可以证明服务已被调用，但数据流说明不足，最终报告的输入依赖没有完整落到可复核证据。'
      : '审查通过：最终轮服务覆盖完整，关键输出已进入下游报告生成，调用顺序和场景验收标准一致，可生成最小 MetaAppArtifact。',
    reason: issueText,
    checks: [
      {
        check: 'overall_verification',
        status: failed ? 'FAILED' : 'PASSED',
        issue: failed ? issueText : undefined,
        evidence_refs: evidenceRefs
      }
    ],
    issues: failed ? [{ description: issueText, evidence_refs: evidenceRefs }] : [],
    plannerDecision: plannerPayload,
    verdict: failed ? 'failed' : 'passed'
  }
}

function demoExecutionPath(servicesMeta) {
  const path = ['用户输入']
  servicesMeta.forEach((svc) => {
    const tool = demoToolName(svc)
    path.push(`${svc.name} · ${tool}`)
  })
  path.push('输出结果')
  return path
}

function start(body) {
  const sessionId = genSessionId()
  const session = {
    id: sessionId,
    cancelled: false,
    body,
    strategy: mergeStrategy(body),
    mode: body.mode || 'production',
    startedAt: Date.now()
  }
  sessions.set(sessionId, session)
  return {
    success: true,
    sessionId,
    buildId: sessionId,
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
  const isResearch = mode === 'research'
  const mockDomain = body.domain || 'generic'

  const pushLog = (level, message) => {
    checkCancel()
    emit('log', { level, message })
  }

  try {
    session.enhancements = []

    const scenarioParsed = buildScenarioParsed(body)
    emit('scenario_parsed', scenarioParsed)
    pushLog('INFO', `场景解析完成: ${scenarioParsed.goal}`)

    emit('step', { step: 0, name: '服务匹配' })
    pushLog('INFO', '开始服务匹配')
    const enScenario = simulationBuildMockEnhancementRecord(
      mockDomain,
      SIMULATION_BUILD_MOCK_STAGE.scenarioParsing
    )
    session.enhancements.push(enScenario)
    pushLog(
      'INFO',
      `[想定解析] 领域知识增强: ${truncateForLog(enScenario.promptFragment)}`
    )

    for (const svc of servicesMeta) {
      checkCancel()
      await sleepRange(SIMULATION_BUILD_DELAYS_MS.serviceCheck)
      pushLog('INFO', `检测服务: ${svc.name}`)
      const latency = 120
      emit('service', {
        id: svc.id,
        status: 'online',
        latency
      })
      pushLog('SUCCESS', `${svc.name} 连接正常 (${latency}ms)`)
    }
    const serviceSelection = buildTopicServiceSelectionReport({
      sessionId,
      appName: body.appName,
      servicesMeta
    })
    emit('service_selection', serviceSelection)
    pushLog('INFO', `服务选择完成: ${serviceSelection.selectedServices.length} 个服务进入构建主干`)
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

    const demoRounds = 2
    const runPhase = async (phase) => {
      checkCancel()
      emit('phase', { phase, status: 'running' })
      await sleepRange(SIMULATION_BUILD_DELAYS_MS.phase)
      emit('phase', { phase, status: 'done' })
    }

    for (let iteration = 1; iteration <= demoRounds; iteration++) {
      checkCancel()
      emit('iteration', { iteration, status: 'running' })
      pushLog('INFO', `开始第 ${iteration} 轮验证`)

      const enPlanning = simulationBuildMockEnhancementRecord(
        mockDomain,
        SIMULATION_BUILD_MOCK_STAGE.planning
      )
      session.enhancements.push(enPlanning)
      pushLog(
        'INFO',
        `[调度规划] 领域知识增强: ${truncateForLog(enPlanning.promptFragment)}`
      )

      checkCancel()
      emit('phase', { phase: 'data', status: 'running' })
      for (const svc of servicesMeta) {
        checkCancel()
        const toolName = demoToolName(svc)
        emit('service_calling', {
          serviceId: String(svc.id),
          serviceName: svc.name,
          toolName,
          status: 'start'
        })
        await sleepRange([520, 880])
        emit('service_calling', {
          serviceId: String(svc.id),
          serviceName: svc.name,
          toolName,
          status: 'end'
        })
      }
      emit('phase', { phase: 'data', status: 'done' })
      pushLog('SUCCESS', '数据仿真: 数据流转正常')

      await runPhase('logic')
      for (const svc of servicesMeta) {
        checkCancel()
        const toolName = demoToolName(svc)
        emit('service_calling', {
          serviceId: String(svc.id),
          serviceName: svc.name,
          toolName,
          status: 'start'
        })
        await sleepRange([320, 520])
        emit('service_calling', {
          serviceId: String(svc.id),
          serviceName: svc.name,
          toolName,
          status: 'end'
        })
      }
      pushLog('SUCCESS', '逻辑仿真: 业务逻辑正常')

      const enVerify = simulationBuildMockEnhancementRecord(
        mockDomain,
        SIMULATION_BUILD_MOCK_STAGE.verification
      )
      session.enhancements.push(enVerify)
      pushLog(
        'INFO',
        `[仿真验证] 领域知识增强: ${truncateForLog(enVerify.promptFragment)}`
      )

      await runPhase('check')
      pushLog('INFO', '链路检视: 检查偏差和冗余')

      const plannerPayload = buildPlannerPayload(iteration, servicesMeta)

      if (iteration < demoRounds) {
        const verifierFailed = buildVerifierPayload(iteration, 'FAILED', plannerPayload, servicesMeta)
        pushLog('WARN', '链路检视: 数据流说明不足，进入下一轮自动修复')
        emit('planner_decision', plannerPayload)
        emit('issue', {
          iteration,
          message: verifierFailed.reason,
          fix: '保留服务主干，补充上游输出引用和报告证据字段',
          plannerDecision: plannerPayload,
          phase: 'verification'
        })
        emit('verifier_result', verifierFailed)
        emit('iteration', { iteration, status: 'retry' })
      } else {
        pushLog('SUCCESS', '链路检视: 未发现偏差')
        emit('planner_decision', plannerPayload)
        emit('verifier_result', buildVerifierPayload(iteration, 'PASSED', plannerPayload, servicesMeta))
        emit('iteration', { iteration, status: 'passed' })
      }
    }

    const iteration = demoRounds

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

    const executionPath = ['用户输入', ...servicesMeta.map((s) => `${s.name} · ${demoToolName(s)}`), '输出结果']
    const successResult = {
      success: true,
      executionPath,
      strategy,
      scenarioDescription: body.scenarioDescription,
      scenarioParsed,
      appName: body.appName,
      domain: body.domain,
      enhancements: session.enhancements || [],
      elapsedMs,
      buildId: sessionId
    }

    session.result = successResult

    pushLog('SUCCESS', '方案生成完成')

    emit('complete', {
      success: true,
      buildId: sessionId,
      metrics,
      result: successResult
    })

    pushResearchRecord(session, metrics, true)
  } catch (e) {
    if (e.code === 'cancelled') {
      const mc = { iterations: 0, elapsedMs: Date.now() - session.startedAt }
      emit('complete', {
        success: false,
        cancelled: true,
        metrics: mc,
        result: { success: false, cancelled: true }
      })
      return
    }
    const failResult = { success: false, error: e.message || String(e) }
    session.result = failResult
    const me = { elapsedMs: Date.now() - session.startedAt }
    emit('complete', {
      success: false,
      metrics: me,
      result: failResult
    })
    pushResearchRecord(session, me, false)
  }
}

/**
 * 供 API 层统一调用的进程内实现（与 HTTP 客户端对外方法一致；完整结果仅经 SSE complete 推送）
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
