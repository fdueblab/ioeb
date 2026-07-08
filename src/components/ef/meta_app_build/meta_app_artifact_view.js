export const META_APP_ARTIFACT_SCHEMA = 'meta_app_artifact.v1'

export function isMetaAppArtifactV1(artifact) {
  return !!(artifact && artifact.schemaVersion === META_APP_ARTIFACT_SCHEMA)
}

function formatSlot(slot) {
  if (typeof slot === 'string') {
    return { name: slot, type: '', required: false }
  }
  return {
    name: (slot && slot.name) || '',
    type: (slot && slot.type) || '',
    required: !!(slot && slot.required)
  }
}

function compactValue(value, limit = 72) {
  if (value == null || value === '') return ''
  let text = ''
  if (typeof value === 'string') {
    text = value
  } else if (typeof value === 'boolean' || typeof value === 'number') {
    text = String(value)
  } else {
    try {
      text = JSON.stringify(value)
    } catch (e) {
      text = String(value)
    }
  }
  return text.length > limit ? `${text.slice(0, limit)}...` : text
}

function formatRuntimeMode(mode) {
  const map = {
    agent_with_optional_golden_path: '智能体执行 + 候选路径',
    agent_only: '智能体执行'
  }
  return map[mode] || mode || '智能体执行'
}

const FALLBACK_TRIGGER_LABELS = {
  onApplicabilityMismatch: '任务与候选路径不匹配',
  onBindingFailure: '服务不可用或绑定失败',
  onToolFailure: '工具调用失败',
  onAssertionFailure: '结果检查未通过'
}

const FALLBACK_ACTION_LABELS = {
  run_slow_mode: '放弃候选路径，由智能体重新规划工具调用',
  agent_replan: '退出当前执行，由智能体重新规划',
  stop: '停止执行'
}

export function formatFallbackAction(value) {
  return FALLBACK_ACTION_LABELS[value] || value || '未记录'
}

export function formatFallbackView(fallbackPolicy) {
  const rules = Object.keys(fallbackPolicy || {}).map((key) => ({
    key,
    value: fallbackPolicy[key]
  }))
  const uniqueValues = [...new Set(rules.map((rule) => rule.value).filter(Boolean))]
  const uniform = uniqueValues.length <= 1
  const actionValue = uniform ? uniqueValues[0] : ''
  const actionLabel = formatFallbackAction(actionValue)
  return {
    rules,
    uniform,
    actionValue,
    actionLabel,
    summary: uniform && actionValue
      ? `候选路径不可用时，${actionLabel}`
      : '',
    triggers: rules.map((rule) => ({
      key: rule.key,
      label: FALLBACK_TRIGGER_LABELS[rule.key] || rule.key,
      actionLabel: formatFallbackAction(rule.value)
    }))
  }
}

export function formatAgentView(agent) {
  const row = agent || {}
  const styleMap = {
    react_slow_mode: 'ReAct 慢模式'
  }
  const decisionMap = {
    agent_internal: '由智能体判定是否采用候选路径'
  }
  return {
    style: row.style || '',
    styleLabel: styleMap[row.style] || row.style || '未记录',
    goldenPathDecision: row.goldenPathDecision || '',
    goldenPathDecisionLabel: decisionMap[row.goldenPathDecision] || row.goldenPathDecision || '未记录'
  }
}

export function assertionDisplayLabel(assertion) {
  const type = (assertion && assertion.type) || ''
  const target = (assertion && assertion.target) || {}
  if (type === 'tool_call_success') return `${target.stepId || '步骤'} 服务调用成功`
  if (type === 'output_slot_present') return `${target.stepId || '步骤'} 输出结果可读取`
  if (type === 'input_slot_bound') return `${target.stepId || '步骤'} 输入 ${target.slot || ''} 已绑定`
  return type || (assertion && assertion.assertionId) || '检查项'
}

function formatChannelLabel(binding) {
  const sourceMap = {
    real_mcp: '真实 MCP',
    demo_fake_mcp: '演示服务'
  }
  const transportMap = {
    sse: 'SSE',
    streamable_http: 'HTTP',
    stdio: 'stdio'
  }
  const source = sourceMap[binding && binding.source] || (binding && binding.source)
  const transport = transportMap[binding && binding.transport] || (binding && binding.transport)
  return [source, transport].filter(Boolean).join(' · ') || '-'
}

function formatMappingValue(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (value.from === 'slot' && value.name) return `输入项 ${value.name}`
    if (value.from && value.name) return `${value.from}:${value.name}`
  }
  return compactValue(value)
}

function formatKeyValueMap(obj, limit = 8) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return []
  return Object.keys(obj).slice(0, limit).map((key) => ({
    key,
    value: compactValue(obj[key])
  }))
}

function formatGoldenStep(step) {
  const mapping = (step && step.inputMapping) || {}
  const outputSlots = (Array.isArray(step && step.outputSlots) ? step.outputSlots : [])
    .map((s) => (typeof s === 'string' ? s : (s && s.name)))
    .filter(Boolean)
  const argPairs = formatKeyValueMap(step && step.argumentTemplate)
  const mappingPairs = Object.keys(mapping).slice(0, 8).map((key) => ({
    key,
    value: formatMappingValue(mapping[key])
  }))
  const dependsOn = Array.isArray(step && step.dependsOn) ? step.dependsOn.filter(Boolean) : []
  const parts = [step.toolName || '-']
  if (argPairs.length) parts.push(`参数 ${argPairs.map((p) => p.key).join(', ')}`)
  if (outputSlots.length) parts.push(`输出 ${outputSlots.join(', ')}`)
  return {
    stepId: (step && step.stepId) || '',
    toolName: (step && step.toolName) || '',
    serviceId: (step && step.serviceId) || '',
    summary: parts.join(' · '),
    arguments: argPairs,
    mappings: mappingPairs,
    outputSlots,
    dependsOn
  }
}

function formatAssertion(assertion) {
  const a = assertion || {}
  const detail = [a.level, a.type, a.checkMode].filter(Boolean).join(' · ')
  return {
    assertionId: a.assertionId || '',
    level: a.level || '',
    type: a.type || '',
    detail,
    result: a.checkMode || a.result || '',
    target: a.target || {},
    expected: a.expected || {}
  }
}

function formatServiceBinding(binding) {
  const tools = Array.isArray(binding && binding.tools) ? binding.tools : []
  return {
    serviceId: (binding && binding.serviceId) || '',
    serviceName: (binding && binding.serviceName) || '未命名服务',
    description: (binding && (binding.description || binding.serviceDescription)) || '',
    channelLabel: formatChannelLabel(binding),
    endpoint: (binding && binding.endpoint) || '',
    schemaHash: (binding && binding.schemaHash) || '',
    toolNames: tools.map((t) => (t && (t.toolName || t.name)) || '').filter(Boolean),
    tools: tools.map((t) => ({
      name: (t && (t.toolName || t.name)) || '',
      description: (t && t.description) || ''
    })).filter((t) => t.name)
  }
}

function pickPrimaryGoldenPath(goldenPaths) {
  if (!Array.isArray(goldenPaths) || !goldenPaths.length) return null
  return goldenPaths.find((p) => p && p.primary) || goldenPaths[0]
}

export function parseMetaAppArtifact(artifact) {
  const empty = {
    valid: false,
    artifactId: '',
    schemaVersion: '',
    runtimeMode: 'agent_only',
    runtimeModeLabel: '智能体执行',
    appName: '',
    taskStatement: '',
    taskGoal: {
      description: '',
      constraints: [],
      successCriteria: []
    },
    expectedInput: [],
    expectedOutput: [],
    serviceBindings: [],
    agentView: formatAgentView({}),
    fallback: formatFallbackView({}),
    reusablePath: {
      exists: false,
      pathId: '',
      status: '',
      sourceTrajectoryId: '',
      steps: [],
      assertions: []
    },
    metrics: {
      inputCount: 0,
      outputCount: 0,
      serviceCount: 0,
      pathStepCount: 0,
      assertionCount: 0
    }
  }
  if (!isMetaAppArtifactV1(artifact)) return empty

  const task = artifact.taskContract || {}
  const runtime = artifact.runtime || {}
  const app = artifact.app || {}
  const primaryPath = pickPrimaryGoldenPath(artifact.goldenPaths)
  const steps = primaryPath && Array.isArray(primaryPath.steps) ? primaryPath.steps : []
  const hasReusablePath = steps.length > 0
  const expectedInput = (Array.isArray(task.inputSlots) ? task.inputSlots : []).map(formatSlot).filter((s) => s.name)
  const expectedOutput = (Array.isArray(task.outputSlots) ? task.outputSlots : []).map(formatSlot).filter((s) => s.name)
  const serviceBindings = (Array.isArray(runtime.serviceBindings) ? runtime.serviceBindings : []).map(formatServiceBinding)
  const assertions = (primaryPath && Array.isArray(primaryPath.assertions) ? primaryPath.assertions : []).map(formatAssertion)

  return {
    valid: true,
    artifactId: artifact.artifactId || '',
    schemaVersion: artifact.schemaVersion || META_APP_ARTIFACT_SCHEMA,
    runtimeMode: runtime.mode || 'agent_only',
    runtimeModeLabel: formatRuntimeMode(runtime.mode),
    appName: app.name || '',
    taskStatement: app.description || '',
    taskGoal: {
      description: app.description || '',
      constraints: Array.isArray(task.constraints) ? task.constraints.filter(Boolean) : [],
      successCriteria: Array.isArray(task.successCriteria) ? task.successCriteria.filter(Boolean) : []
    },
    expectedInput,
    expectedOutput,
    serviceBindings,
    agentView: formatAgentView(runtime.agent),
    fallback: formatFallbackView(runtime.fallbackPolicy),
    reusablePath: {
      exists: hasReusablePath,
      pathId: (primaryPath && primaryPath.pathId) || '',
      status: (primaryPath && primaryPath.status) || '',
      sourceTrajectoryId: (primaryPath && primaryPath.sourceTrajectoryId) || '',
      steps: steps.map(formatGoldenStep),
      assertions
    },
    metrics: {
      inputCount: expectedInput.length,
      outputCount: expectedOutput.length,
      serviceCount: serviceBindings.length,
      pathStepCount: steps.length,
      assertionCount: assertions.length
    }
  }
}
