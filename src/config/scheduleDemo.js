/**
 * 调度页演示 · 统一配置（SmartChat 推荐 + 仿真分流）
 *
 * | 类型   | SmartChat 触发              | 画布/元应用名标记     | 仿真           |
 * |--------|-----------------------------|----------------------|----------------|
 * | topic  | 输入含「课题」               | preName 含「课题」    | 进程内 inmemory |
 * | mcp    | 输入含「【MCP演示】」        | preName 含「MCP演示」 | HTTP Micro-Agent |
 *
 * MCP 演示仅 health 垂域；topic 以 aml 为主，亦支持 meta_apps_data 内各垂域。
 */

export const TOPIC_DEMO_KEYWORD = '课题'

/** 用户输入前缀（下拉样例） */
export const MCP_DEMO_INPUT_PREFIX = '【MCP演示】'

/** 写入 preName 后用于仿真 API 分流（与输入前缀一致，无括号） */
export const MCP_DEMO_APP_MARK = 'MCP演示'

export const SCHEDULE_DEMO_KIND = {
  TOPIC: 'topic',
  MCP: 'mcp'
}

/** @returns {'topic'|'mcp'|null} */
export function resolveScheduleDemoKind(text) {
  const s = String(text || '')
  if (s.includes(MCP_DEMO_INPUT_PREFIX) || s.includes(MCP_DEMO_APP_MARK)) {
    return SCHEDULE_DEMO_KIND.MCP
  }
  if (s.includes(TOPIC_DEMO_KEYWORD)) {
    return SCHEDULE_DEMO_KIND.TOPIC
  }
  return null
}

/** SmartChat：是否走演示推荐（不请求 Agent API） */
export function matchesScheduleDemoInput(text) {
  return resolveScheduleDemoKind(text) != null
}

/** @deprecated 使用 resolveScheduleDemoKind；保留兼容 */
export function matchesTopicDemoKeyword(text) {
  return String(text || '').includes(TOPIC_DEMO_KEYWORD)
}

export function matchesMcpDemoInput(text) {
  return resolveScheduleDemoKind(text) === SCHEDULE_DEMO_KIND.MCP
}

/** 仿真 start：是否走进程内 mock */
export function useMemorySimulation(appName) {
  const kind = resolveScheduleDemoKind(appName)
  return kind === SCHEDULE_DEMO_KIND.TOPIC
}

/** health · SmartChat 下拉样例（与 mcp_demo_flows 场景对应） */
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

/** health：根据样例文案选择 MCP 场景 id */
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
