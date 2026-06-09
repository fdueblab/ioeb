/**
 * 本地 MCP 一轮假追问（校验逻辑与 local_mcp_scenario_resolve 对齐）
 */

import {
  LOCAL_MCP_FAKE_QUESTION,
  localMcpPrefix,
  matchMcpScenarioByKeywords,
  parseLocalMcpNodeCount,
  stripLocalMcpPrefix
} from '@/mock/data/local_mcp_scenario_resolve'

export { LOCAL_MCP_FAKE_QUESTION }

export const LOCAL_MCP_REJECT_MESSAGE =
  '很抱歉，未能理解您的回答，请明确补充场景'

export const LOCAL_MCP_FOLLOW_UP_TOO_SHORT = LOCAL_MCP_REJECT_MESSAGE

const MIN_FOLLOW_UP_LEN = 4
/** 纯数字/标点，无实质语义 */
const TRIVIAL_FOLLOW_UP_RE = /^[\d\s.,，。！？、；;：:'"\-—…]+$/u

export function resolveLocalMcpScenarioFromText(text) {
  return matchMcpScenarioByKeywords(text)
}

export function validateLocalMcpDescription(text) {
  const t = String(text || '').trim()
  if (!t) {
    return { ok: false, scenarioKey: null, message: LOCAL_MCP_REJECT_MESSAGE }
  }
  const scenarioKey = matchMcpScenarioByKeywords(t)
  if (!scenarioKey) {
    return { ok: false, scenarioKey: null, message: LOCAL_MCP_REJECT_MESSAGE }
  }
  return { ok: true, scenarioKey, message: '' }
}

/** 假追问第二轮：只校验本轮输入，规则与 resolveMcpDemoScenario 关键词段一致 */
export function validateLocalMcpFollowUp(followUpText) {
  const b = String(followUpText || '').trim()
  if (!b) {
    return { ok: false, scenarioKey: null, message: LOCAL_MCP_FOLLOW_UP_TOO_SHORT }
  }
  if (b.length < MIN_FOLLOW_UP_LEN || TRIVIAL_FOLLOW_UP_RE.test(b)) {
    return { ok: false, scenarioKey: null, message: LOCAL_MCP_FOLLOW_UP_TOO_SHORT }
  }
  const scenarioKey = matchMcpScenarioByKeywords(b)
  if (!scenarioKey) {
    return { ok: false, scenarioKey: null, message: LOCAL_MCP_REJECT_MESSAGE }
  }
  return { ok: true, scenarioKey, message: '' }
}

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
  const n = parseLocalMcpNodeCount(initialInput) || 1
  return `${localMcpPrefix(n)} ${merged}`
}
