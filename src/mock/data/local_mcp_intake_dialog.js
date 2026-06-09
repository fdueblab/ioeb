/**
 * 本地 MCP 一轮假追问：关键词校验 + 与场景 key 对齐
 */

import { LOCAL_MCP_MARK_RE, localMcpPrefix } from '@/mock/data/meta_apps_data'

export const LOCAL_MCP_FAKE_QUESTION =
  '请补充或确认：业务/患者情境、想完成的目标、以及期望输出形式。（若首条已写清，可简要确认或补充细节。）'

export const LOCAL_MCP_REJECT_MESSAGE =
  '未能从描述中识别本地 MCP 演示场景（需包含与用药、评分、说明书、靶点、医保等相关的关键词）。请重新描述。'

/** 与 resolveMcpDemoScenario 关键词优先级对齐（纯文本，无需【本地MCP】前缀） */
const LOCAL_MCP_KEYWORD_RULES = [
  { key: 'all5', patterns: [/重症医院感染/, /出院.*医保/, /随访安排/] },
  { key: 'clinical_triad', patterns: [/肾功能.*肺炎/, /评分.*剂量.*标签/, /肾功能减退.*肺炎/] },
  { key: 'combo', patterns: [/脓毒症/, /休克/, /SOFA.*利奈/, /SOFA.*给药/] },
  { key: 'openfda', patterns: [/说明书/, /黑框/, /相互作用/, /openfda/i, /fda/i, /药品标签/] },
  { key: 'opentargets', patterns: [/BRAF/i, /MDT/, /靶点/, /opentargets/i, /基因/] },
  { key: 'healthcovered', patterns: [/医保/, /参保/, /healthcovered/i, /ACA/i] },
  { key: 'medical_calc', patterns: [/SOFA/i, /医学计算/, /计算器/, /discover/i, /medical-calc/i] },
  { key: 'linezolid', patterns: [/利奈唑胺/, /给药/, /linezolid/i, /剂量/, /肺炎/] }
]

const MIN_DESC_LEN = 6
const MIN_FOLLOW_UP_LEN = 4
/** 纯数字/标点，无实质语义 */
const TRIVIAL_FOLLOW_UP_RE = /^[\d\s.,，。！？、；;：:'"\-—…]+$/u

export const LOCAL_MCP_FOLLOW_UP_TOO_SHORT =
  '补充描述过短或无效，请用包含场景关键词（如用药、SOFA评分、说明书、靶点、医保等）的语句说明。'

export function stripLocalMcpPrefix(text) {
  return String(text || '')
    .replace(LOCAL_MCP_MARK_RE, '')
    .trim()
}

function parseLocalMcpNodeCount(text) {
  const m = String(text || '').match(/【本地MCP】\((\d+)\)/)
  return m ? parseInt(m[1], 10) : 1
}

export function resolveLocalMcpScenarioFromText(text) {
  const t = stripLocalMcpPrefix(text)
  if (t.length < MIN_DESC_LEN) return null
  for (const rule of LOCAL_MCP_KEYWORD_RULES) {
    if (rule.patterns.some((re) => re.test(t))) return rule.key
  }
  return null
}

export function validateLocalMcpDescription(text) {
  const t = String(text || '').trim()
  if (!t) {
    return { ok: false, scenarioKey: null, message: LOCAL_MCP_REJECT_MESSAGE }
  }
  const scenarioKey = resolveLocalMcpScenarioFromText(t)
  if (!scenarioKey) {
    return { ok: false, scenarioKey: null, message: LOCAL_MCP_REJECT_MESSAGE }
  }
  return { ok: true, scenarioKey, message: '' }
}

/** 假追问第二轮：只校验本轮用户输入，不沿用首轮关键词 */
export function validateLocalMcpFollowUp(followUpText) {
  const b = String(followUpText || '').trim()
  if (!b) {
    return { ok: false, scenarioKey: null, message: LOCAL_MCP_FOLLOW_UP_TOO_SHORT }
  }
  if (b.length < MIN_FOLLOW_UP_LEN || TRIVIAL_FOLLOW_UP_RE.test(b)) {
    return { ok: false, scenarioKey: null, message: LOCAL_MCP_FOLLOW_UP_TOO_SHORT }
  }
  const scenarioKey = resolveLocalMcpScenarioFromText(b)
  if (!scenarioKey) {
    return { ok: false, scenarioKey: null, message: LOCAL_MCP_REJECT_MESSAGE }
  }
  return { ok: true, scenarioKey, message: '' }
}

/** 首轮假追问前的 mock 思考步骤（与 useScheduleDemoData 同节奏） */
export function generateLocalMcpIntakeMockSteps(userInput) {
  const snippet = stripLocalMcpPrefix(userInput)
  const preview = snippet.length > 36 ? `${snippet.slice(0, 36)}…` : snippet || '（待补充）'
  return [
    {
      step: 1,
      thought: `收到本地 MCP 演示请求，正在阅读：「${preview}」。`
    },
    {
      step: 2,
      thought: '对照 health 域本机 MCP 场景库，提取情境、目标与输入输出线索。'
    },
    {
      step: 3,
      thought: '当前信息尚不足以直接生成结构化想定，准备向您确认一项关键细节。'
    }
  ]
}

export function mergeLocalMcpDescription(initialInput, followUpText) {
  const a = stripLocalMcpPrefix(initialInput)
  const b = String(followUpText || '').trim()
  return [a, b].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

export function buildLocalMcpCombinedInput(initialInput, followUpText) {
  const merged = mergeLocalMcpDescription(initialInput, followUpText)
  const n = parseLocalMcpNodeCount(initialInput)
  return `${localMcpPrefix(n)} ${merged}`
}
