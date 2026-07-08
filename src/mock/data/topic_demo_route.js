/**
 * 课题演示 mock 路由 SoT：仅「特定样例输入 → 固定 scenarioKey → 预生成产物」走 inmemory。
 * 与真实链路的唯一差别：构建阶段复用预生成 BuildBundle，预发布提交仍走真实 prepublish API。
 */

import { AML_TOPIC_DEMO_INPUTS, matchesTopicDemoInput } from './topic_demo_inputs'
import { resolveTopicScenarioKey } from './topic_scenario_intake'

export { AML_TOPIC_DEMO_INPUTS, matchesTopicDemoInput }

export const TOPIC_DEMO_SCENARIO_KEYS = new Set(['pj1', 'pj2', 'pj4', 'pj_combo'])

/** SmartChat / 调度演示输入匹配（精确样例句） */
export function matchesScheduleDemoInput(text) {
  return matchesTopicDemoInput(text)
}

function pickScenarioKeyFromContext(context) {
  if (!context || typeof context !== 'object') return null
  if (context.topicDemoKey && TOPIC_DEMO_SCENARIO_KEYS.has(context.topicDemoKey)) {
    return context.topicDemoKey
  }
  if (context._topicScenarioKey && TOPIC_DEMO_SCENARIO_KEYS.has(context._topicScenarioKey)) {
    return context._topicScenarioKey
  }
  const sp = context.scenarioParsed
  if (sp && sp.scenarioKey && TOPIC_DEMO_SCENARIO_KEYS.has(sp.scenarioKey)) {
    return sp.scenarioKey
  }
  const raw = sp && sp.source && sp.source.rawUserInput
  if (matchesTopicDemoInput(raw)) {
    return resolveTopicScenarioKey(raw)
  }
  if (matchesTopicDemoInput(context.demoInput)) {
    return resolveTopicScenarioKey(context.demoInput)
  }
  return null
}

/** 课题组合演示：追问后选择的分析节点（pj1 / pj2） */
export function resolveTopicDemoAnalysisChoice(context) {
  if (!context || typeof context !== 'object') return null
  if (context.topicDemoAnalysisChoice === 'pj1' || context.topicDemoAnalysisChoice === 'pj2') {
    return context.topicDemoAnalysisChoice
  }
  const sp = context.scenarioParsed
  const dialogue = sp && sp.source && sp.source.intakeDialogue
  if (Array.isArray(dialogue)) {
    const lastUser = [...dialogue].reverse().find((item) => item && item.role === 'user')
    const text = lastUser && lastUser.content
    if (typeof text === 'string') {
      if (text.includes('课题二')) return 'pj2'
      if (text.includes('课题一')) return 'pj1'
    }
  }
  return null
}

export function resolveTopicDemoKey(context) {
  return pickScenarioKeyFromContext(context)
}

/** 仿真构建是否走进程内 mock（须能解析到固定 scenarioKey） */
export function isTopicDemoSimulationContext(context) {
  return pickScenarioKeyFromContext(context) != null
}

/** @deprecated 使用 isTopicDemoSimulationContext */
export function useMemorySimulation(context) {
  return isTopicDemoSimulationContext(context)
}

export function topicDemoBundleCacheKey(scenarioKey, analysisChoice = null) {
  if (scenarioKey === 'pj_combo' && analysisChoice) {
    return `${scenarioKey}:${analysisChoice}`
  }
  return scenarioKey
}

/** 各 scenarioKey 对应的 canonical 样例输入（用于预热预生成产物） */
export function canonicalDemoInputForBundle(scenarioKey, analysisChoice = null) {
  switch (scenarioKey) {
    case 'pj1':
      return AML_TOPIC_DEMO_INPUTS[0]
    case 'pj2':
      return AML_TOPIC_DEMO_INPUTS[1]
    case 'pj4':
      return AML_TOPIC_DEMO_INPUTS[3]
    case 'pj_combo':
      if (analysisChoice === 'pj2') return AML_TOPIC_DEMO_INPUTS[2]
      return AML_TOPIC_DEMO_INPUTS[4].includes('各课题')
        ? AML_TOPIC_DEMO_INPUTS[4]
        : AML_TOPIC_DEMO_INPUTS[2]
    default:
      return AML_TOPIC_DEMO_INPUTS[0]
  }
}
