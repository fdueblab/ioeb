/**
 * 本地 MCP 演示场景解析（唯一关键词来源）
 * mock 追问校验与 getMetaAppNodes / resolveMcpDemoScenario 共用此模块。
 */

export const LOCAL_MCP_MARK_RE = /【本地MCP】\(\d+\)/

export function localMcpPrefix(nodeCount) {
  return `【本地MCP】(${nodeCount})`
}

export function stripLocalMcpPrefix(text) {
  return String(text || '')
    .replace(LOCAL_MCP_MARK_RE, '')
    .trim()
}

export function parseLocalMcpNodeCount(text) {
  const m = String(text || '').match(/【本地MCP】\((\d+)\)/)
  return m ? parseInt(m[1], 10) : null
}

/** 与 resolveMcpDemoScenario 中正则一致；仅关键词命中，不含节点数兜底 */
export function matchMcpScenarioByKeywords(text) {
  const raw = String(text || '')
  const t = stripLocalMcpPrefix(raw) || raw

  if (/重症医院感染|出院.*医保|随访安排/.test(t)) return 'all5'
  if (/肾功能.*肺炎|评分.*剂量.*标签/.test(t)) return 'clinical_triad'
  if (/脓毒症|休克|SOFA.*利奈/.test(t)) return 'combo'
  if (/说明书|黑框|相互作用|openfda|fda|药品标签/i.test(t)) return 'openfda'
  if (/BRAF|MDT|靶点|opentargets|基因/i.test(t)) return 'opentargets'
  if (/医保|参保|healthcovered|ACA/i.test(t)) return 'healthcovered'
  if (/SOFA|医学计算|计算器|discover|medical-calc/i.test(t)) return 'medical_calc'
  if (/利奈唑胺|给药|linezolid|剂量|肺炎/i.test(t)) return 'linezolid'

  return null
}

/**
 * 完整场景解析（含【本地MCP】(n) 节点数兜底），供 flow 匹配
 */
export function resolveMcpDemoScenario(userInput) {
  const t = String(userInput || '')
  const n = parseLocalMcpNodeCount(t)

  const byKeyword = matchMcpScenarioByKeywords(t)
  if (byKeyword) return byKeyword

  if (n === 5) return 'all5'
  if (n === 3) return 'clinical_triad'
  if (n === 2) return 'combo'

  return 'linezolid'
}

/** 追问文案用：与 matchMcpScenarioByKeywords 同源的可读提示 */
export const LOCAL_MCP_KEYWORD_HINTS = [
  '利奈唑胺 / 给药 / 剂量 / 肺炎',
  'SOFA / 医学计算 / 计算器',
  '说明书 / 黑框 / 相互作用',
  '靶点 / BRAF / MDT',
  '医保 / 参保',
  '脓毒症 / 休克',
  '重症医院感染 / 随访',
  '肾功能 / 评分+剂量+标签'
]

export const LOCAL_MCP_FAKE_QUESTION =
  `请补充或确认：业务/患者情境、想完成的目标、以及期望输出形式。（关键词：${LOCAL_MCP_KEYWORD_HINTS.join('；')}）`
