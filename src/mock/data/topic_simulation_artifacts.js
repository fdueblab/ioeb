/**
 * 课题 inmemory 仿真：合成 trace / evidence / legacy demo artifact。
 * 该路径只用于前端演示，不代表 Micro-Agent 真实 MetaAppArtifact v1 主链路。
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

function buildToolCallDetails(servicesMeta) {
  return servicesMeta.map((svc, idx) => {
    const tool = primaryTool(svc)
    const latency = 80 + idx * 40
    return {
      call_id: `call-topic-${idx}`,
      tool,
      service: svc.name,
      channel: svc.isFake ? 'sandbox' : 'real_mcp',
      transport: svc.isFake ? 'in_process' : 'stdio',
      arguments: { scenarioRef: 'topic-demo', step: idx + 1 },
      result_preview: `演示调用成功 · ${svc.name}`,
      error: null,
      latency_ms: latency,
      success: true,
      timestamp: new Date().toISOString()
    }
  })
}

function buildPlannerDecision(iteration, servicesMeta, executionPath) {
  const details = buildToolCallDetails(servicesMeta)
  return {
    iteration,
    candidate_tools: servicesMeta.map((s) => primaryTool(s)),
    selected_tools: details.map((d) => d.tool),
    reason: '课题演示：按想定编排服务调用顺序，满足场景约束与验收标准',
    executionPath,
    dispatch: { mode: 'sequential', services: servicesMeta.map((s) => String(s.id)) },
    tool_call_details: details
  }
}

export function buildTopicDemoTrace(ctx) {
  const { sessionId, appName, servicesMeta = [], finalResult, scenarioParsed } = ctx
  const executionPath =
    (finalResult && finalResult.executionPath) ||
    ['用户输入', ...servicesMeta.map((s) => `${s.name} · ${primaryTool(s)}`), '输出结果']

  const events = []
  const sp = scenarioParsed || {}

  if (sp.goal || sp.description) {
    events.push({
      type: 'scenario_parsed',
      data: {
        goal: sp.goal || appName,
        description: sp.description || '',
        constraints: sp.constraints || [],
        acceptanceCriteria: sp.acceptanceCriteria || [],
        domain: sp.domain || 'aml',
        sourceRef: {
          parserModel: 'topic-mock',
          parsedAt: new Date().toISOString()
        }
      }
    })
  }

  servicesMeta.forEach((svc, idx) => {
    const tool = primaryTool(svc)
    const channel = svc.isFake ? 'sandbox' : 'real_mcp'
    events.push({
      type: 'tool_call_record',
      data: {
        call_id: `call-topic-${idx}`,
        tool_name: tool,
        service_id: String(svc.id),
        service_name: svc.name,
        channel,
        transport: channel === 'sandbox' ? 'in_process' : 'stdio',
        success: true,
        latency_ms: 80 + idx * 40,
        result: `演示调用成功 · ${svc.name}`,
        arguments: { scenarioRef: 'topic-demo', step: idx + 1 }
      }
    })
  })

  const planner = buildPlannerDecision(2, servicesMeta, executionPath)
  events.push({ type: 'planner_decision', data: planner })

  const evidenceRefs = servicesMeta.map((_, idx) => `call-topic-${idx}`)
  events.push({
    type: 'verifier_result',
    data: {
      iteration: 2,
      status: 'PASSED',
      summary: '链路检视通过：服务覆盖完整、调用顺序与想定一致',
      reason: '',
      checks: [
        {
          check: 'overall_verification',
          status: 'PASSED',
          evidence_refs: evidenceRefs
        },
        {
          check: 'service_coverage',
          status: 'PASSED',
          evidence_refs: evidenceRefs
        }
      ],
      issues: [],
      plannerDecision: planner,
      verdict: 'passed'
    }
  })

  return {
    sessionId,
    metadata: {
      appName,
      trace_version: 'v1.0.0',
      runtime: { trace_version: 'v1.0.0' },
      tool_call_count: servicesMeta.length,
      config_snapshot: {
        scenarioDescription: sp.description || '',
        servicesMeta
      },
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
      detail: '结构化想定已注入 trace（scenario_parsed）'
    },
    {
      checkName: 'service_binding_complete',
      category: 'logic',
      status: 'PASS',
      detail: `已绑定 ${servicesMeta.length} 个服务，契约与调用记录一致`
    },
    {
      checkName: 'tool_channels',
      category: 'data',
      status: 'PASS',
      detail: 'tool_call_record 含 channel / transport / latency_ms'
    },
    {
      checkName: 'verifier_structured',
      category: 'logic',
      status: 'PASS',
      detail: 'verifier_result 含 checks / issues 结构化字段'
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
      detail: '课题演示使用沙箱/假 MCP，未产生 real_mcp 外呼'
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
  const executionPath =
    (finalResult && finalResult.executionPath) ||
    ['用户输入', ...servicesMeta.map((s) => `${s.name} · ${primaryTool(s)}`), '输出结果']

  const declaredContracts = servicesMeta.map((s, idx) => {
    const tool = primaryTool(s)
    const channel = s.isFake ? 'sandbox' : 'real_mcp'
    const latency = 80 + idx * 40
    return {
      serviceId: String(s.id),
      serviceName: s.name,
      channel,
      transport: channel === 'sandbox' ? 'in_process' : 'stdio',
      declaredTools: (s.tools || []).map((t) => ({
        toolId: t.id || null,
        name: t.name,
        description: t.description || null
      })),
      observedTools: [
        {
          toolName: tool,
          callCount: 1,
          successCount: 1,
          failureCount: 0,
          successRate: 1,
          avgLatencyMs: latency,
          evidenceRefs: [`call-topic-${idx}`]
        }
      ],
      totalCalls: 1,
      overallSuccessRate: 1
    }
  })

  const hasRealMcp = servicesMeta.some((s) => !s.isFake)

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
      solidifiable: hasRealMcp,
      goldenPathExtractable: false,
      goldenPathReason: hasRealMcp
        ? '演示轨迹未通过 real_mcp 主干抽取门禁'
        : '课题演示为进程内沙箱调用，无法抽取黄金路径',
      remediation: hasRealMcp
        ? ['需 Verifier 最终通过且存在成功 real_mcp 调用链']
        : ['课题演示使用沙箱/假 MCP，需真实 MCP 构建方可抽取黄金路径'],
      conditions: {
        realMcpCallsPresent: hasRealMcp,
        verifierPassed: true
      },
      gates: [
        {
          gate: 'sufficientIterations',
          passed: true,
          detail: '验证通过 1 次，要求至少 1 次'
        },
        {
          gate: 'verifierPassed',
          passed: true,
          detail: '最终 verifier_result 状态 PASSED'
        },
        {
          gate: 'evidenceComplete',
          passed: true,
          detail: '证据检查已完成'
        },
        {
          gate: 'noUnresolvedToolErrors',
          passed: true,
          detail: '无未解决工具错误'
        },
        {
          gate: 'noInfrastructureErrors',
          passed: true,
          detail: '演示构建无基础设施错误'
        },
        {
          gate: 'realMcpCallsPresent',
          passed: hasRealMcp,
          detail: hasRealMcp ? '存在 real_mcp 调用' : '课题演示为进程内沙箱调用',
          remediation: hasRealMcp ? undefined : '至少需一次 real_mcp 调用'
        }
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
        elapsedMs: (finalResult && finalResult.elapsedMs) || 1200,
        executionPath
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
