/**
 * 调度页演示 · 统一数据入口（与课题 mock 同模式）
 *
 * SmartChat 调用：
 *   generateScheduleDemoSteps(verticalType, userInput)
 *   getScheduleDemoFlow(verticalType, userInput)
 */
import {
  resolveScheduleDemoKind,
  SCHEDULE_DEMO_KIND
} from '@/config/scheduleDemo'
import { generateMockSteps, getMetaAppNodes } from '@/mock/data/meta_apps_data'
import {
  getMcpDemoFlow,
  generateMcpDemoMockSteps
} from '@/mock/data/mcp_demo_flows'

export function generateScheduleDemoSteps(verticalType, userInput) {
  const kind = resolveScheduleDemoKind(userInput)
  if (kind === SCHEDULE_DEMO_KIND.MCP) {
    return generateMcpDemoMockSteps(userInput)
  }
  return generateMockSteps(verticalType, userInput)
}

export function getScheduleDemoFlow(verticalType, userInput) {
  const kind = resolveScheduleDemoKind(userInput)
  if (kind === SCHEDULE_DEMO_KIND.MCP) {
    return getMcpDemoFlow(userInput)
  }
  return getMetaAppNodes(verticalType, userInput)
}
