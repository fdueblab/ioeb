/**
 * 课题 inmemory 仿真：合成当前主链路对象。
 *
 * 该路径只用于前端演示，不产生真实 MCP 外呼，不计入科研实验。
 * 形状对齐 Micro-Agent 当前 BuildBundle 主线：
 * BuildTrace -> ServiceSelectionReport -> AcceptedTrajectory -> MetaAppArtifact v1。
 */

import { resolveTopicScenarioKeyByAppName } from './topic_scenario_intake'

const ARTIFACT_SCHEMA = 'meta_app_artifact.v1'
const TRACE_SCHEMA = 'build_trace.v1'
const SERVICE_SELECTION_SCHEMA = 'service_selection_report.v1'
const ACCEPTED_TRAJECTORY_SCHEMA = 'accepted_trajectory.v1'
const BUILD_BUNDLE_SCHEMA = 'simulation_build_bundle.v1'

const FALLBACK_POLICY = {
  onApplicabilityMismatch: 'run_slow_mode',
  onBindingFailure: 'run_slow_mode',
  onToolFailure: 'run_slow_mode',
  onAssertionFailure: 'run_slow_mode'
}

function shortHash(seed) {
  let h = 0
  const s = String(seed)
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

function longHash(seed) {
  const base = shortHash(seed)
  return (base + shortHash(`a-${seed}`) + shortHash(`b-${seed}`) + shortHash(`c-${seed}`)).padEnd(64, '0').slice(0, 64)
}

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson)
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = canonicalJson(value[key])
      return result
    }, {})
  }
  return value
}

async function stableHash(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(canonicalJson(data || {})))
  const digest = await window.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

function nowIso() {
  return new Date().toISOString()
}

function sanitizeId(text, maxLen = 128) {
  const ident = String(text || 'srv')
    .replace(/[^A-Za-z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
  return (ident || 'srv').slice(0, maxLen)
}

function transportOf(service) {
  const method = String((service && (service.mcpMethod || service.method)) || 'sse').toLowerCase()
  if (method === 'streamable-http' || method === 'streamable_http' || method === 'http') return 'streamable_http'
  return method
}

function endpointOf(service) {
  return (service && (service.mcpUrl || service.url)) || ''
}

function serviceMetaForTrace(service) {
  const copy = { ...(service || {}) }
  copy.isFake = true
  delete copy.is_fake
  return copy
}

function declaredTools(service) {
  return (service.tools || [])
    .map((t) => ({
      toolName: t.name || t.id || '',
      description: t.description || t.des || '',
      inputSchema: t.inputSchema || {}
    }))
    .filter((t) => t.toolName)
}

function primaryDeclaredTool(service) {
  const tools = service.tools || []
  const t = tools.find((x) => x.name && x.name !== 'healthCheck') || tools[0]
  return (t && (t.name || t.id)) || 'invoke'
}

function registeredToolName(service) {
  // 与 Micro-Agent SandboxTool 注册逻辑对齐：{serviceId}_execute。
  return `${sanitizeId(service.id || service.name)}_execute`
}

function serviceSource() {
  return 'demo_fake_mcp'
}

function serviceChannel() {
  return 'sandbox'
}

function jsonType(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'boolean') return 'boolean'
  if (Number.isInteger(value)) return 'integer'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'object') return 'object'
  return 'string'
}

function scenarioFromCtx(ctx) {
  const sp = (ctx && ctx.scenarioParsed) || {}
  return {
    goal: sp.goal || (ctx && ctx.appName) || '课题元应用构建',
    description: sp.description || (ctx && ctx.scenarioDescription) || '',
    constraints: Array.isArray(sp.constraints) ? [...sp.constraints] : [],
    acceptanceCriteria: Array.isArray(sp.acceptanceCriteria) ? [...sp.acceptanceCriteria] : [],
    domain: sp.domain || 'aml',
    source: sp.source || {
      parserModel: 'scenario-intake-agent-v1',
      parsedAt: nowIso()
    },
    scenarioKey: sp.scenarioKey
  }
}

function sampleArguments(service, index, scenario) {
  const name = `${service.name || ''} ${primaryDeclaredTool(service)}`.toLowerCase()
  if (name.includes('多方') || name.includes('multipart') || name.includes('multiparty')) {
    return {
      federationTaskId: 'topic-federated-aml-001',
      participantCount: 3,
      privacyMode: 'aggregate_only'
    }
  }
  if (name.includes('安全') || name.includes('fingerprint') || name.includes('security')) {
    return {
      modelId: 'aml-risk-model-v1',
      evaluationSet: 'topic-adversarial-fingerprint',
      riskSummaryRef: index > 0 ? `s${index}_output` : 'runtime_input'
    }
  }
  if (name.includes('报告') || name.includes('report')) {
    return {
      reportFormat: 'audit_text',
      riskSummaryRef: index > 0 ? `s${index}_output` : 'runtime_input',
      includeEvidenceChain: true
    }
  }
  if (name.includes('风险') || name.includes('risk') || name.includes('predict') || name.includes('evaluate')) {
    return {
      transactionBatchRef: 'topic-cross-border-batch-202606',
      riskThreshold: 0.72,
      auditRequired: true
    }
  }
  return {
    task: scenario.goal || '课题任务',
    scenarioRef: scenario.scenarioKey || 'topic-build',
    step: index + 1
  }
}

function sampleResult(service, index, args) {
  const name = `${service.name || ''} ${primaryDeclaredTool(service)}`.toLowerCase()
  if (name.includes('安全') || name.includes('fingerprint') || name.includes('security')) {
    return {
      success: true,
      service: service.name,
      securityLevel: 'medium',
      fingerprintScore: 0.86,
      issues: ['对抗样本敏感度中等'],
      recommendation: '在报告阶段标注模型安全性约束'
    }
  }
  if (name.includes('报告') || name.includes('report')) {
    return {
      success: true,
      service: service.name,
      reportId: `rpt-topic-${shortHash(service.id || index)}`,
      sections: ['风险识别结论', '安全评测摘要', '审计证据链'],
      format: args.reportFormat || 'audit_text'
    }
  }
  if (name.includes('多方') || name.includes('multipart') || name.includes('multiparty')) {
    return {
      success: true,
      service: service.name,
      jointRiskScore: 0.81,
      participants: args.participantCount || 3,
      privacyLeakage: 'not_detected'
    }
  }
  if (name.includes('风险') || name.includes('risk') || name.includes('predict') || name.includes('evaluate')) {
    return {
      success: true,
      service: service.name,
      riskScore: 0.84,
      riskLevel: 'high',
      factors: ['高频跨境拆分交易', '异常收款网络', '名单相似实体']
    }
  }
  return {
    success: true,
    service: service.name,
    output: '任务调用完成'
  }
}

function toolCallRecord(service, index, iteration, scenario) {
  const args = sampleArguments(service, index, scenario)
  const result = sampleResult(service, index, args)
  const serviceId = String(service.id || `svc-${index + 1}`)
  return {
    call_id: `call-topic-i${iteration}-s${index + 1}`,
    tool_name: registeredToolName(service),
    service_id: serviceId,
    service_name: service.name || serviceId,
    channel: serviceChannel(service),
    transport: transportOf(service),
    source: serviceSource(service),
    phase: 'slow_mode',
    purpose: 'react_action',
    iteration,
    react_step_id: `iter${iteration}-step${index + 1}`,
    action_id: `iter${iteration}-a${index + 1}`,
    arguments: args,
    result: JSON.stringify(result),
    result_hash: shortHash(JSON.stringify(result)),
    error: null,
    latency_ms: 120 + index * 37 + iteration * 11,
    timestamp: Date.now() / 1000 + iteration * 0.01 + index * 0.001,
    success: true
  }
}

function buildToolCalls(servicesMeta, scenario) {
  const calls = []
  for (let iteration = 1; iteration <= 2; iteration += 1) {
    servicesMeta.forEach((svc, idx) => {
      calls.push(toolCallRecord(svc, idx, iteration, scenario))
    })
  }
  return calls
}

export function buildTopicServiceSelectionReport(ctx) {
  const { sessionId, servicesMeta = [] } = ctx
  const scenario = scenarioFromCtx(ctx)
  const criteria = (scenario.acceptanceCriteria || []).slice(0, 2).join('；')
  return {
    schemaVersion: SERVICE_SELECTION_SCHEMA,
    selectionId: `sel-topic-${shortHash(sessionId)}`,
    strategy: 'llm_catalog_selection',
    selectedServices: servicesMeta.map((svc) => {
      const matchedCapabilities = (svc.tools || [])
        .map((t) => t.name || t.id)
        .filter(Boolean)
        .filter((name) => name !== 'healthCheck')
      return {
        serviceId: String(svc.id),
        serviceName: svc.name,
        reason: [
          `服务能力与任务目标“${scenario.goal || '课题任务'}”相关`,
          matchedCapabilities.length ? `可调用工具：${matchedCapabilities.join('、')}` : '',
          criteria ? `覆盖验收标准：${criteria}` : ''
        ].filter(Boolean).join('；'),
        matchedCapabilities
      }
    }),
    rejectedServices: [],
    missingCapabilities: [],
    rationale: `在传入 catalog 内完成服务选择，优先保留与“${scenario.goal || '结构化想定'}”及验收标准直接相关的服务。`,
    confidence: 0.91,
    model: 'catalog-selection-agent-v1',
    createdAt: nowIso()
  }
}

function buildAcceptedTrajectory(ctx, toolCalls) {
  const { sessionId } = ctx
  const finalCalls = toolCalls.filter((c) => c.iteration === 2)
  const actionSequence = finalCalls.map((call, idx) => {
    const stepId = `s${idx + 1}`
    const inputSlots = Object.keys(call.arguments || {})
      .filter((name) => name !== 'action')
      .map((name) => ({
        name,
        source: 'runtime_input',
        type: jsonType(call.arguments[name])
      }))
    return {
      stepId,
      actionId: call.action_id,
      callId: call.call_id,
      serviceId: call.service_id,
      serviceName: call.service_name,
      toolName: call.tool_name,
      source: call.source,
      transport: call.transport,
      arguments: call.arguments,
      argumentTemplate: call.arguments,
      observation: {
        success: true,
        semanticSuccess: true,
        result: call.result,
        error: null,
        latencyMs: call.latency_ms
      },
      inputSlots,
      dependsOn: idx === 0 ? [] : [`s${idx}`]
    }
  })
  return {
    schemaVersion: ACCEPTED_TRAJECTORY_SCHEMA,
    trajectoryId: `traj-topic-${shortHash(`${sessionId}-accepted`)}`,
    buildId: sessionId,
    status: actionSequence.length ? 'accepted' : 'missing',
    acceptedIteration: actionSequence.length ? 2 : null,
    verifier: actionSequence.length
      ? {
          role: 'build_verifier',
          status: 'PASSED',
          summary: '最终轮通过：服务覆盖、调用顺序和输出证据满足结构化想定。',
          eventRef: 'verifier_result#iter2'
        }
      : null,
    actionSequence,
    bindingGaps: [],
    generatedArtifact: {}
  }
}

function buildTaskContract(app, scenario, accepted) {
  const slotNames = {}
  const inputSlots = []
  ;(accepted.actionSequence || []).forEach((action) => {
    ;(action.inputSlots || []).forEach((slot) => {
      if (slot.name && !slotNames[slot.name]) {
        slotNames[slot.name] = true
        inputSlots.push({
          name: slot.name,
          type: slot.type || 'unknown',
          required: true
        })
      }
    })
  })
  return {
    goal: scenario.goal || app.description || app.name,
    domain: app.domain || scenario.domain || 'aml',
    inputSlots: inputSlots.length
      ? inputSlots
      : [{ name: 'task', type: 'string', required: true }],
    outputSlots: [{ name: 'result', type: 'object', required: true }],
    constraints: [...(scenario.constraints || [])],
    successCriteria: [...(scenario.acceptanceCriteria || [])]
  }
}

function buildServiceBindings(servicesMeta) {
  return servicesMeta.map((svc) => {
    const tools = declaredTools(svc)
    const toolSummary = tools
      .map((tool) => tool.description || tool.toolName)
      .filter(Boolean)
      .slice(0, 2)
      .join('；')
    return {
      serviceId: String(svc.id),
      serviceName: svc.name,
      isFake: true,
      description: svc.description || svc.des || toolSummary || '提供元应用运行所需的服务能力',
      source: serviceSource(svc),
      transport: transportOf(svc),
      endpoint: endpointOf(svc),
      schemaHash: shortHash(JSON.stringify({ tools })).slice(0, 16),
      tools
    }
  })
}

function buildGoldenPaths(accepted, taskContract) {
  const steps = (accepted.actionSequence || []).map((action) => {
    const inputMapping = {}
    ;(action.inputSlots || []).forEach((slot) => {
      if (slot.name) inputMapping[slot.name] = { from: 'slot', name: slot.name }
    })
    return {
      stepId: action.stepId,
      serviceId: action.serviceId,
      toolName: action.toolName,
      argumentTemplate: action.argumentTemplate || action.arguments || {},
      inputMapping,
      outputSlots: [{ name: `${action.stepId}_output`, path: '$' }],
      dependsOn: action.dependsOn || []
    }
  })
  if (!steps.length) return []
  const assertions = []
  steps.forEach((step) => {
    assertions.push({
      assertionId: `${step.stepId}_call_success`,
      level: 'L1',
      type: 'tool_call_success',
      target: { stepId: step.stepId },
      expected: { success: true },
      checkMode: 'rule'
    })
    assertions.push({
      assertionId: `${step.stepId}_output_present`,
      level: 'L1',
      type: 'output_slot_present',
      target: { stepId: step.stepId, slot: `${step.stepId}_output` },
      expected: { present: true },
      checkMode: 'rule'
    })
    Object.keys(step.inputMapping || {}).forEach((name) => {
      assertions.push({
        assertionId: `${step.stepId}_${name}_bound`,
        level: 'L2',
        type: 'input_slot_bound',
        target: { stepId: step.stepId, slot: name },
        expected: { bound: true },
        checkMode: 'rule'
      })
    })
  })
  return [
    {
      pathId: `gp-topic-${shortHash(JSON.stringify(steps))}`,
      primary: true,
      status: 'active',
      sourceTrajectoryId: accepted.trajectoryId,
      applicability: {
        requiredServices: [...new Set(steps.map((s) => s.serviceId).filter(Boolean))],
        requiredInputSlots: taskContract.inputSlots || [],
        agentSemanticDecision: true
      },
      steps,
      assertions,
      fallbackPolicy: FALLBACK_POLICY
    }
  ]
}

function buildMetaAppArtifact(ctx, accepted) {
  const scenario = scenarioFromCtx(ctx)
  const app = {
    name: ctx.appName || '课题元应用',
    domain: ctx.domain || scenario.domain || 'aml',
    description: scenario.description || ctx.scenarioDescription || ''
  }
  const serviceBindings = buildServiceBindings(ctx.servicesMeta || [])
  const taskContract = buildTaskContract(app, scenario, accepted)
  const goldenPaths = buildGoldenPaths(accepted, taskContract)
  return {
    schemaVersion: ARTIFACT_SCHEMA,
    artifactId: `app-topic-${shortHash(`${ctx.sessionId}-${ctx.appName}`)}`,
    app,
    taskContract,
    runtime: {
      mode: goldenPaths.length ? 'agent_with_optional_golden_path' : 'agent_only',
      serviceBindings,
      fallbackPolicy: FALLBACK_POLICY,
      agent: {
        style: 'react_slow_mode',
        goldenPathDecision: 'agent_internal'
      }
    },
    goldenPaths
  }
}

function buildPlannerDecision(iteration, servicesMeta, toolCalls) {
  const calls = toolCalls.filter((c) => c.iteration === iteration)
  return {
    iteration,
    candidate_tools: servicesMeta.map((s) => registeredToolName(s)),
    selected_tools: calls.map((c) => c.tool_name),
    reason:
      iteration === 1
        ? '首轮规划：按画布顺序调用服务，Verifier 发现输出依赖和审计说明仍需补强。'
        : '修正后规划：保留服务主干，明确上游输出引用和审计证据，准备固化为 GoldenPath。',
    executionPath: ['用户输入', ...calls.map((c) => `${c.service_name} · ${c.tool_name}`), '输出结果'],
    dispatch: { mode: 'sequential', services: servicesMeta.map((s) => String(s.id)) },
    tool_call_details: calls.map((c) => ({
      call_id: c.call_id,
      tool: c.tool_name,
      tool_name: c.tool_name,
      service: c.service_name,
      service_id: c.service_id,
      channel: c.channel,
      transport: c.transport,
      arguments: c.arguments,
      result_preview: String(c.result || '').slice(0, 120),
      error: c.error,
      latency_ms: c.latency_ms,
      success: c.success,
      timestamp: c.timestamp
    }))
  }
}

function buildVerifierResult(iteration, status, plannerDecision) {
  const passed = status === 'PASSED'
  return {
    iteration,
    status,
    summary: passed
      ? '链路检视通过：最终轮服务覆盖完整、调用顺序与想定一致，可生成最小 MetaAppArtifact。'
      : '链路存在可优化项：服务主干已跑通，但输出依赖和审计说明不够明确。',
    reason: passed ? '' : '需要补充报告生成阶段对前序风险识别与安全评测输出的引用。',
    checks: [
      {
        check: 'service_coverage',
        status,
        evidence_refs: plannerDecision.tool_call_details.map((d) => d.call_id)
      },
      {
        check: 'dataflow_explainability',
        status,
        issue: passed ? undefined : '报告输入缺少明确的上游输出引用',
        evidence_refs: plannerDecision.tool_call_details.map((d) => d.call_id)
      }
    ],
    issues: passed
      ? []
      : [
          {
            description: '报告生成阶段需显式引用风险识别和安全评测结果。',
            evidence_refs: plannerDecision.tool_call_details.map((d) => d.call_id)
          }
        ],
    plannerDecision,
    verdict: passed ? 'passed' : 'failed'
  }
}

export function buildTopicDemoTrace(ctx) {
  const scenario = scenarioFromCtx(ctx)
  const toolCalls = buildToolCalls(ctx.servicesMeta || [], scenario)
  const selection = buildTopicServiceSelectionReport(ctx)
  const p1 = buildPlannerDecision(1, ctx.servicesMeta || [], toolCalls)
  const p2 = buildPlannerDecision(2, ctx.servicesMeta || [], toolCalls)
  const events = [
    { type: 'scenario_parsed', data: scenario },
    { type: 'service_selection', data: selection },
    { type: 'iteration', data: { iteration: 1, status: 'running' } },
    ...toolCalls.filter((c) => c.iteration === 1).map((c) => ({ type: 'tool_call_record', data: c, timestamp: c.timestamp })),
    { type: 'planner_decision', data: p1 },
    { type: 'verifier_result', data: buildVerifierResult(1, 'FAILED', p1) },
    { type: 'iteration', data: { iteration: 1, status: 'retry' } },
    { type: 'iteration', data: { iteration: 2, status: 'running' } },
    ...toolCalls.filter((c) => c.iteration === 2).map((c) => ({ type: 'tool_call_record', data: c, timestamp: c.timestamp })),
    { type: 'planner_decision', data: p2 },
    { type: 'verifier_result', data: buildVerifierResult(2, 'PASSED', p2) },
    { type: 'iteration', data: { iteration: 2, status: 'passed' } },
    {
      type: 'complete',
      data: {
        success: true,
        metrics: {
          iterations: 2,
          elapsedMs: (ctx.finalResult && ctx.finalResult.elapsedMs) || 1800
        },
        result: ctx.finalResult || {}
      }
    }
  ]

  return {
    schemaVersion: TRACE_SCHEMA,
    build_id: ctx.sessionId,
    session_id: ctx.sessionId,
    app_name: ctx.appName,
    domain: scenario.domain || ctx.domain || 'aml',
    mode: 'production',
    strategy: (ctx.finalResult && ctx.finalResult.strategy) || {},
    events,
    success: true,
    iterations: 2,
    elapsed_ms: (ctx.finalResult && ctx.finalResult.elapsedMs) || 1800,
    metadata: {
      trace_version: TRACE_SCHEMA,
      config_snapshot: {
        appId: ctx.appId || 'meta-app-draft',
        appName: ctx.appName,
        domain: scenario.domain || ctx.domain || 'aml',
        serviceIds: (ctx.servicesMeta || []).map((s) => String(s.id)),
        servicesMeta: (ctx.servicesMeta || []).map(serviceMetaForTrace),
        maxIterations: 5,
        scenarioDescription: ctx.scenarioDescription || scenario.description || '',
        scenarioSummary: ctx.scenarioDescription || scenario.description || '',
        scenarioParsed: scenario
      },
      runtime: {
        trace_version: 'v1.0.0'
      },
      tool_call_count: toolCalls.length
    }
  }
}

export function buildTopicDemoEvidence(ctx) {
  const selection = buildTopicServiceSelectionReport(ctx)
  const selectedServices = selection.selectedServices || []
  const checks = [
    {
      checkName: 'scenario_parse_present',
      category: 'logic',
      status: 'PASS',
      detail: '已生成 scenario_parsed 结构化想定'
    },
    {
      checkName: 'service_selection_report_present',
      category: 'logic',
      status: 'PASS',
      detail: `已在传入 catalog 内选择 ${selectedServices.length} 个服务`
    },
    {
      checkName: 'tool_call_record_source',
      category: 'data',
      status: 'PASS',
      detail: 'tool_call_record 含 source/phase/purpose/iteration/action_id'
    },
    {
      checkName: 'accepted_trajectory_present',
      category: 'logic',
      status: 'PASS',
      detail: '最终 PASSED iteration 可抽取 AcceptedTrajectory'
    },
    {
      checkName: 'meta_app_artifact_v1',
      category: 'logic',
      status: 'PASS',
      detail: '最终产物为 meta_app_artifact.v1，且不包含构建诊断字段'
    },
    {
      checkName: 'prepublish_readiness',
      category: 'data',
      status: 'PASS',
      detail: '构建轨迹包含完整调用事实、验证结论与产物边界，可用于预发布检查'
    }
  ]
  return {
    schemaVersion: 'build_evidence_summary.v1',
    overallStatus: 'PASS',
    summary: {
      total_checks: checks.length,
      passed: checks.filter((c) => c.status === 'PASS').length,
      failed: 0,
      warnings: checks.filter((c) => c.status === 'WARN').length,
      acceptedTrajectory: 'accepted',
      selectedServices: selectedServices.length
    },
    dimensions: {
      data: { status: 'PASS', total: 2, passed: 2, warnings: 0, failed: 0 },
      logic: { status: 'PASS', total: 4, passed: 4, warnings: 0, failed: 0 }
    },
    failedChecks: checks.filter((c) => c.status !== 'PASS'),
    missingEvidence: [],
    checks
  }
}

export function buildTopicDemoAcceptedTrajectory(ctx) {
  const scenario = scenarioFromCtx(ctx)
  return buildAcceptedTrajectory(ctx, buildToolCalls(ctx.servicesMeta || [], scenario))
}

export function buildTopicDemoArtifact(ctx) {
  const scenarioKey = scenarioFromCtx(ctx).scenarioKey || resolveTopicScenarioKeyByAppName(ctx.appName) || 'pj1'
  const accepted = buildTopicDemoAcceptedTrajectory(ctx)
  const artifact = buildMetaAppArtifact(ctx, accepted)
  artifact.artifactId = `app-topic-${scenarioKey}-${shortHash(ctx.sessionId)}`
  return artifact
}

export function buildTopicDemoFrontendState(ctx) {
  const trace = buildTopicDemoTrace(ctx)
  const serviceSelection = buildTopicServiceSelectionReport(ctx)
  const acceptedTrajectory = buildTopicDemoAcceptedTrajectory(ctx)
  const artifact = buildTopicDemoArtifact(ctx)
  return {
    schemaVersion: 'simulation_frontend_state.v1',
    buildId: ctx.sessionId,
    app: artifact.app,
    taskContract: artifact.taskContract,
    serviceSelection,
    acceptedTrajectorySummary: {
      trajectoryId: acceptedTrajectory.trajectoryId,
      status: acceptedTrajectory.status,
      acceptedIteration: acceptedTrajectory.acceptedIteration,
      actionCount: acceptedTrajectory.actionSequence.length,
      bindingGaps: acceptedTrajectory.bindingGaps || [],
      generatedArtifact: {
        artifactId: artifact.artifactId,
        artifactHash: longHash(JSON.stringify(artifact)),
        recordedAt: nowIso()
      }
    },
    artifactSummary: {
      artifactId: artifact.artifactId,
      schemaVersion: artifact.schemaVersion,
      runtimeMode: artifact.runtime.mode,
      goldenPathCount: artifact.goldenPaths.length
    },
    callChain: (trace.events || [])
      .filter((e) => e.type === 'tool_call_record')
      .map((e) => `${e.data.service_name} · ${e.data.tool_name}`),
    events: {
      count: trace.events.length,
      toolCallCount: (trace.events || []).filter((e) => e.type === 'tool_call_record').length,
      verifierResults: (trace.events || []).filter((e) => e.type === 'verifier_result').map((e) => e.data)
    },
    completion: (trace.events.find((e) => e.type === 'complete') || {}).data || {},
    artifact
  }
}

export async function buildTopicDemoArtifacts(ctx) {
  const trace = buildTopicDemoTrace(ctx)
  const serviceSelection = buildTopicServiceSelectionReport(ctx)
  const acceptedTrajectory = buildTopicDemoAcceptedTrajectory(ctx)
  const artifact = buildTopicDemoArtifact(ctx)
  const frontendState = buildTopicDemoFrontendState(ctx)
  const artifactHash = await stableHash(artifact)
  frontendState.acceptedTrajectorySummary.generatedArtifact.artifactHash = artifactHash
  const [traceHash, serviceSelectionHash, acceptedTrajectoryHash, frontendStateHash] = await Promise.all([
    stableHash(trace),
    stableHash(serviceSelection),
    stableHash(acceptedTrajectory),
    stableHash(frontendState)
  ])
  const manifest = {
    schemaVersion: BUILD_BUNDLE_SCHEMA,
    buildId: ctx.sessionId,
    artifactId: artifact.artifactId,
    paths: {
      trace: 'trace.json',
      serviceSelection: 'service_selection.json',
      acceptedTrajectory: 'accepted_trajectory.json',
      artifact: 'artifact.json',
      frontendState: 'frontend_state.json',
      experimentDir: 'experiment'
    },
    hashes: {
      trace: traceHash,
      serviceSelection: serviceSelectionHash,
      acceptedTrajectory: acceptedTrajectoryHash,
      artifact: artifactHash,
      frontendState: frontendStateHash
    },
    researchEligible: false,
    ref: {
      buildId: ctx.sessionId,
      manifestUrl: `/api/simulation/builds/${ctx.sessionId}/manifest`,
      traceUrl: `/api/simulation/builds/${ctx.sessionId}/trace`,
      serviceSelectionUrl: `/api/simulation/builds/${ctx.sessionId}/service-selection`,
      acceptedTrajectoryUrl: `/api/simulation/builds/${ctx.sessionId}/accepted-trajectory`,
      artifactUrl: `/api/simulation/builds/${ctx.sessionId}/artifact`,
      frontendStateUrl: `/api/simulation/builds/${ctx.sessionId}/frontend-state`,
      runUrl: `/api/simulation/builds/${ctx.sessionId}/run`,
      experimentUrl: `/api/simulation/builds/${ctx.sessionId}/experiments/run`
    }
  }
  return {
    manifest,
    trace,
    serviceSelection,
    acceptedTrajectory,
    evidence: buildTopicDemoEvidence(ctx),
    artifact,
    frontendState
  }
}
