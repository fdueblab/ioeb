/**
 * 调度页演示：SmartChat 推荐 + 仿真分流
 * - 课题 → inmemory mock
 * - MCP演示 → Micro-Agent 真 MCP
 */

export const TOPIC_DEMO_KEYWORD = '课题'
export const MCP_DEMO_INPUT_PREFIX = '【MCP演示】'
export const MCP_DEMO_APP_MARK = 'MCP演示'

export const SCHEDULE_DEMO_KIND = { TOPIC: 'topic', MCP: 'mcp' }

export function resolveScheduleDemoKind(text) {
  const s = String(text || '')
  if (s.includes(MCP_DEMO_INPUT_PREFIX) || s.includes(MCP_DEMO_APP_MARK)) {
    return SCHEDULE_DEMO_KIND.MCP
  }
  if (s.includes(TOPIC_DEMO_KEYWORD)) return SCHEDULE_DEMO_KIND.TOPIC
  return null
}

export function matchesScheduleDemoInput(text) {
  return resolveScheduleDemoKind(text) != null
}

export function useMemorySimulation(appName) {
  return resolveScheduleDemoKind(appName) === SCHEDULE_DEMO_KIND.TOPIC
}

export const MCP_DEMO_SUGGESTIONS = [
  { value: `${MCP_DEMO_INPUT_PREFIX}五服务全链路：编排本机 5 个 external-mcp 一并上画布` },
  { value: `${MCP_DEMO_INPUT_PREFIX}65岁男性肺炎患者，请制定利奈唑胺个性化给药方案` },
  { value: `${MCP_DEMO_INPUT_PREFIX}评估 ICU 患者 SOFA 评分并调用医学计算器` },
  { value: `${MCP_DEMO_INPUT_PREFIX}查询 linezolid 药品标签（openFDA）` },
  { value: `${MCP_DEMO_INPUT_PREFIX}检索靶点 BRAF 关联疾病（OpenTargets）` },
  { value: `${MCP_DEMO_INPUT_PREFIX}查询 ACA 开放注册日期（healthcovered）` },
  { value: `${MCP_DEMO_INPUT_PREFIX}临床用药三联：SOFA + 利奈唑胺 + openFDA 标签` },
  { value: `${MCP_DEMO_INPUT_PREFIX}重症感染联合决策：SOFA 评估后优化利奈唑胺剂量` }
]

export function resolveMcpDemoScenario(userInput) {
  const t = String(userInput || '')
  if (/五服务|全链路|5个|五个|一并编排/.test(t)) return 'all5'
  if (/三联|临床用药|标签对照/.test(t)) return 'clinical_triad'
  if (/靶点.*参保|OpenTargets.*ACA|research/i.test(t)) return 'research_triad'
  if (/openfda|药品标签|fda|不良事件/i.test(t)) return 'openfda'
  if (/opentargets|靶点|BRAF|基因检索/i.test(t)) return 'opentargets'
  if (/healthcovered|ACA|开放注册|参保日期/i.test(t)) return 'healthcovered'
  if (/联合|综合|重症感染|SOFA.*利奈|利奈.*SOFA/.test(t)) return 'combo'
  if (/SOFA|医学计算|计算器|discover|medical-calc/i.test(t)) return 'medical_calc'
  if (/利奈唑胺|给药|linezolid|剂量/i.test(t)) return 'linezolid'
  return 'all5'
}
