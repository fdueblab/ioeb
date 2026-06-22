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

function formatGoldenStep(step) {
  const mapping = (step && step.inputMapping) || {}
  const bindingKeys = Object.keys(mapping)
  const outputSlots = (Array.isArray(step && step.outputSlots) ? step.outputSlots : [])
    .map((s) => (typeof s === 'string' ? s : (s && s.name)))
    .filter(Boolean)
  const parts = [step.toolName || '—']
  if (bindingKeys.length) parts.push(`入参 ${bindingKeys.join(', ')}`)
  if (outputSlots.length) parts.push(`输出 ${outputSlots.join(', ')}`)
  return {
    stepId: (step && step.stepId) || '',
    toolName: (step && step.toolName) || '',
    serviceId: (step && step.serviceId) || '',
    summary: parts.join(' · ')
  }
}

function formatAssertion(assertion) {
  const a = assertion || {}
  const detail = [a.level, a.type, a.checkMode].filter(Boolean).join(' · ')
  return {
    assertionId: a.assertionId || '',
    detail,
    result: a.checkMode || a.result || ''
  }
}

function formatServiceBinding(binding) {
  const tools = Array.isArray(binding && binding.tools) ? binding.tools : []
  const channelParts = [binding && binding.source, binding && binding.transport].filter(Boolean)
  return {
    serviceId: (binding && binding.serviceId) || '',
    serviceName: (binding && binding.serviceName) || '未命名服务',
    channelLabel: channelParts.length ? channelParts.join(' · ') : '—',
    endpoint: (binding && binding.endpoint) || '',
    toolNames: tools.map((t) => (t && (t.toolName || t.name)) || '').filter(Boolean)
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
    appName: '',
    taskGoal: {
      goal: '',
      description: '',
      constraints: [],
      successCriteria: []
    },
    expectedInput: [],
    expectedOutput: [],
    serviceBindings: [],
    reusablePath: {
      exists: false,
      steps: [],
      assertions: []
    }
  }
  if (!isMetaAppArtifactV1(artifact)) return empty

  const task = artifact.taskContract || {}
  const runtime = artifact.runtime || {}
  const app = artifact.app || {}
  const primaryPath = pickPrimaryGoldenPath(artifact.goldenPaths)
  const steps = primaryPath && Array.isArray(primaryPath.steps) ? primaryPath.steps : []
  const hasReusablePath = steps.length > 0

  return {
    valid: true,
    artifactId: artifact.artifactId || '',
    schemaVersion: artifact.schemaVersion || META_APP_ARTIFACT_SCHEMA,
    runtimeMode: runtime.mode || 'agent_only',
    appName: app.name || '',
    taskGoal: {
      goal: task.goal || '',
      description: app.description || '',
      constraints: Array.isArray(task.constraints) ? task.constraints.filter(Boolean) : [],
      successCriteria: Array.isArray(task.successCriteria) ? task.successCriteria.filter(Boolean) : []
    },
    expectedInput: (Array.isArray(task.inputSlots) ? task.inputSlots : []).map(formatSlot).filter((s) => s.name),
    expectedOutput: (Array.isArray(task.outputSlots) ? task.outputSlots : []).map(formatSlot).filter((s) => s.name),
    serviceBindings: (Array.isArray(runtime.serviceBindings) ? runtime.serviceBindings : []).map(formatServiceBinding),
    reusablePath: {
      exists: hasReusablePath,
      steps: steps.map(formatGoldenStep),
      assertions: (primaryPath && Array.isArray(primaryPath.assertions) ? primaryPath.assertions : []).map(formatAssertion)
    }
  }
}
