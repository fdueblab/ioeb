/**
 * 课题 inmemory 仿真：合成 trace / evidence / artifact（ArtifactSpec v0.2）
 */

import { resolveTopicScenarioKeyByAppName } from './topic_scenario_intake'

function shortHash(seed) {
  let h = 0
  const s = String(seed)
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

function primaryTool(service) {
  const tools = service.tools || []
  const t = tools.find((x) => x.name && x.name !== 'healthCheck') || tools[0]
  return (t && t.name) || 'invoke'
}

export function buildTopicDemoTrace(ctx) {
  const { sessionId, appName, servicesMeta = [], finalResult } = ctx
  const executionPath =
    (finalResult && finalResult.executionPath) ||
    ['用户输入', ...servicesMeta.map((s) => s.name), '输出结果']

  const events = []
  servicesMeta.forEach((svc, idx) => {
    events.push({
      type: 'tool_call_record',
      data: {
        call_id: `call-topic-${idx}`,
        tool_name: primaryTool(svc),
        service_id: String(svc.id),
        service_name: svc.name,
        channel: svc.isFake ? 'sandbox' : 'real_mcp',
        success: true,
        latency_ms: 80 + idx * 40,
        result: `演示调用成功 · ${svc.name}`
      }
    })
  })

  events.push({
    type: 'planner_decision',
    data: {
      iteration: 2,
      selected_tools: servicesMeta.map((s) => primaryTool(s)),
      executionPath: executionPath.slice(1, -1),
      reason: '课题演示：按服务依赖顺序完成编排'
    }
  })

  events.push({
    type: 'verifier_result',
    data: {
      iteration: 2,
      status: 'PASSED',
      summary: '链路检视通过，无阻塞性问题',
      reason: '各 MCP 服务调用顺序与想定一致'
    }
  })

  return {
    sessionId,
    metadata: {
      appName,
      trace_version: 'topic-demo-1',
      tool_call_count: events.filter((e) => e.type === 'tool_call_record').length,
      demo: true
    },
    events
  }
}

export function buildTopicDemoEvidence(ctx) {
  const { servicesMeta = [] } = ctx
  const checks = [
    {
      checkName: 'scenario_parse_present',
      category: 'logic',
      status: 'PASS',
      detail: '结构化想定已注入'
    },
    {
      checkName: 'service_binding_complete',
      category: 'logic',
      status: 'PASS',
      detail: `已绑定 ${servicesMeta.length} 个服务`
    },
    {
      checkName: 'tool_channels',
      category: 'data',
      status: 'PASS',
      detail: '演示通道调用记录完整'
    },
    {
      checkName: 'noInfrastructureErrors',
      category: 'logic',
      status: 'PASS',
      detail: '进程内仿真无基础设施错误'
    },
    {
      checkName: 'realMcpCallsPresent',
      category: 'data',
      status: 'WARN',
      detail: '课题演示使用沙箱/假 MCP，未产生真实外呼'
    }
  ]

  return {
    overallStatus: 'PASS',
    summary: {
      total_checks: checks.length,
      passed: checks.filter((c) => c.status === 'PASS').length,
      failed: 0,
      warnings: checks.filter((c) => c.status === 'WARN').length
    },
    checks
  }
}

export function buildTopicDemoArtifact(ctx) {
  const {
    sessionId,
    appName,
    appId,
    scenarioParsed,
    scenarioDescription,
    servicesMeta = [],
    finalResult
  } = ctx
  const scenarioKey = resolveTopicScenarioKeyByAppName(appName) || 'pj1'
  const sp = scenarioParsed || {}
  const steps = servicesMeta.map((svc, idx) => ({
    callId: `call-topic-${idx}`,
    toolName: primaryTool(svc),
    serviceId: String(svc.id),
    serviceName: svc.name,
    channel: svc.isFake ? 'sandbox' : 'real_mcp',
    success: true,
    latencyMs: 80 + idx * 40
  }))

  const declaredContracts = servicesMeta.map((s) => ({
    serviceId: String(s.id),
    serviceName: s.name,
    channel: s.isFake ? 'sandbox' : 'real_mcp',
    declaredTools: (s.tools || []).map((t) => ({
      toolId: t.id || null,
      name: t.name,
      description: t.description || null
    })),
    observedTools: steps
      .filter((st) => st.serviceId === String(s.id))
      .map((st) => ({
        toolName: st.toolName,
        callCount: 1,
        successCount: 1,
        failureCount: 0,
        successRate: 1
      })),
    totalCalls: steps.filter((st) => st.serviceId === String(s.id)).length,
    overallSuccessRate: 1
  }))

  return {
    schemaVersion: '0.3.0',
    parsedIntent: {
      goal: sp.goal || appName,
      description: sp.description || scenarioDescription || '',
      constraints: sp.constraints || [],
      acceptanceCriteria: sp.acceptanceCriteria || [],
      domain: sp.domain || 'aml',
      sourceRef: {
        traceRef: sessionId,
        intakeSessionRef: null,
        parserModel: 'topic-mock',
        parsedAt: new Date().toISOString()
      }
    },
    serviceContracts: declaredContracts,
    goldenPath: null,
    solidificationReport: {
      solidifiable: false,
      goldenPathExtractable: false,
      goldenPathReason: 'solidification gates failed',
      remediation: ['课题演示为进程内沙箱调用，需真实 MCP'],
      conditions: {},
      gates: [
        { gate: 'noInfrastructureErrors', passed: true, detail: '演示构建无基础设施错误' },
        { gate: 'realMcpCallsPresent', passed: false, detail: '课题演示为进程内沙箱调用', remediation: '至少需一次 real_mcp 调用' }
      ]
    },
    artifactMeta: {
      artifactId: `art-topic-${scenarioKey}-${shortHash(sessionId)}`,
      sourceSessionId: sessionId,
      createdAt: new Date().toISOString(),
      appName,
      domain: sp.domain || 'aml',
      mode: 'production',
      appId: appId || 'meta-app-draft',
      traceRef: sessionId,
      traceHash: shortHash(`trace-${sessionId}`).padStart(64, '0'),
      configSnapshotHash: shortHash(`cfg-${sessionId}`).padStart(64, '0'),
      artifactHash: shortHash(`${sessionId}-${appName}`).padStart(64, '0'),
      evidenceRef: null,
      intakeSessionRef: null,
      buildSummary: {
        totalIterations: 2,
        finalStatus: 'SUCCESS',
        elapsedMs: (finalResult && finalResult.elapsedMs) || 1200
      }
    }
  }
}

export function buildTopicDemoArtifacts(ctx) {
  return {
    trace: buildTopicDemoTrace(ctx),
    evidence: buildTopicDemoEvidence(ctx),
    artifact: buildTopicDemoArtifact(ctx)
  }
}
