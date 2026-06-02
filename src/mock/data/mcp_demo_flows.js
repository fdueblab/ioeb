/**
 * MCP 演示 · 画布 flow 数据（由 schedule_demo.js 统一入口调用）
 * @see workspace/fdueblab/external-mcp/README.md
 */
import { resolveMcpDemoScenario } from '@/config/scheduleDemo'

const MCP_ROOT = '/home/lyx/workspace/fdueblab/external-mcp'

const LINEZOLID_NODE = {
  id: 'mcp-demo-linezolid',
  name: '利奈唑胺给药方案优化MCP Server',
  url: 'http://127.0.0.1:25013/sse',
  mcpMethod: 'sse',
  isFake: false,
  des: '利奈唑胺剂量计算（本机 SSE :25013）',
  type: 'atomic_mcp',
  status: 'released',
  tools: [
    {
      name: 'calculate_linezolid_dose',
      description: '根据患者体征与肝肾功能计算推荐剂量'
    }
  ]
}

const MEDICAL_CALC_NODE = {
  id: 'mcp-demo-medical-calc',
  name: 'medical-calc-mcp',
  url: 'http://127.0.0.1:18000/sse',
  mcpMethod: 'sse',
  isFake: false,
  des: '医学计算器 discover / calculate（本机 SSE :18000）',
  type: 'atomic_mcp',
  status: 'released',
  tools: [
    { name: 'discover', description: '按关键词发现医学计算器' },
    { name: 'calculate', description: '执行指定 calculator_id' }
  ]
}

const OPENFDA_NODE = {
  id: 'mcp-demo-openfda',
  name: 'openFDA 药品标签 MCP',
  mcpMethod: 'stdio',
  mcpCommand: 'node',
  mcpArgs: [`${MCP_ROOT}/openfda-mcp/build/index.js`],
  isFake: false,
  des: 'openFDA 药品标签与不良事件检索（本机 stdio）',
  type: 'atomic_mcp',
  status: 'released',
  tools: [
    { name: 'search_drug_labels', description: '按通用名检索药品标签' },
    { name: 'search_drug_adverse_events', description: '检索药品不良事件' }
  ]
}

const OPENTARGETS_NODE = {
  id: 'mcp-demo-opentargets',
  name: 'OpenTargets 靶点知识 MCP',
  mcpMethod: 'stdio',
  mcpCommand: `${MCP_ROOT}/opentargets-mcp/.venv/bin/python`,
  mcpArgs: ['-m', 'opentargets_mcp.server', '--transport', 'stdio'],
  isFake: false,
  des: 'Open Targets 靶点/药物关联检索（本机 stdio）',
  type: 'atomic_mcp',
  status: 'released',
  tools: [
    { name: 'search_entities', description: '检索靶点、药物等实体' },
    { name: 'get_target_associations', description: '获取靶点关联疾病/药物' }
  ]
}

const HEALTHCOVERED_NODE = {
  id: 'mcp-demo-healthcovered',
  name: 'healthcovered ACA 资格 MCP',
  url: 'http://127.0.0.1:18001/mcp',
  mcpMethod: 'streamable_http',
  isFake: false,
  des: 'ACA 开放注册与资格日期（本机 Streamable HTTP :18001）',
  type: 'atomic_mcp',
  status: 'released',
  tools: [
    { name: 'get_enrollment_dates', description: '获取开放注册日期' },
    { name: 'check_eligibility', description: '检查参保资格（静态演示数据）' }
  ]
}

const ALL_FIVE = [
  MEDICAL_CALC_NODE,
  LINEZOLID_NODE,
  OPENFDA_NODE,
  OPENTARGETS_NODE,
  HEALTHCOVERED_NODE
]

function app(preName, preDes, preInput, preOutput, nodeList) {
  return {
    preName,
    preDes,
    preInputName: preInput,
    preOutputName: preOutput,
    inputType: 2,
    outputType: 1,
    nodeList
  }
}

const SCENARIOS = {
  linezolid: app(
    '利奈唑胺给药优化（MCP演示）',
    '单服务：利奈唑胺剂量',
    '患者体征与检验',
    '给药方案',
    [LINEZOLID_NODE]
  ),
  medical_calc: app(
    '医学计算器辅助（MCP演示）',
    '单服务：SOFA 等评分检索与计算',
    '临床观察数据',
    '计算器结果',
    [MEDICAL_CALC_NODE]
  ),
  openfda: app(
    '药品标签检索（MCP演示）',
    '单服务：openFDA 标签',
    '药品名称',
    '标签摘要',
    [OPENFDA_NODE]
  ),
  opentargets: app(
    '靶点知识检索（MCP演示）',
    '单服务：OpenTargets',
    '基因/靶点查询',
    '关联知识',
    [OPENTARGETS_NODE]
  ),
  healthcovered: app(
    'ACA 参保日期（MCP演示）',
    '单服务：healthcovered',
    '参保场景',
    '注册日期与说明',
    [HEALTHCOVERED_NODE]
  ),
  combo: app(
    '重症感染用药决策（MCP演示）',
    '双服务：评分 + 给药',
    '患者综合数据',
    '评分与给药方案',
    [MEDICAL_CALC_NODE, LINEZOLID_NODE]
  ),
  clinical_triad: app(
    '临床用药三联（MCP演示）',
    '医学计算 + 利奈唑胺 + openFDA 标签对照',
    '患者与用药问题',
    '综合用药报告',
    [MEDICAL_CALC_NODE, LINEZOLID_NODE, OPENFDA_NODE]
  ),
  research_triad: app(
    '靶点与参保三联（MCP演示）',
    'OpenTargets + healthcovered + 医学计算',
    '靶点/政策/评分查询',
    '结构化摘要',
    [OPENTARGETS_NODE, HEALTHCOVERED_NODE, MEDICAL_CALC_NODE]
  ),
  all5: app(
    '五服务全链路医疗元应用（MCP演示）',
    '编排 external-mcp 全部 5 个本机服务',
    '综合医疗与用药需求',
    '多源结构化结果',
    ALL_FIVE
  )
}

export function getMcpDemoFlow(userInput) {
  const key = resolveMcpDemoScenario(userInput)
  const flow = SCENARIOS[key]
  if (!flow) {
    return Promise.reject(new Error('未找到 MCP 演示场景'))
  }
  return Promise.resolve(JSON.parse(JSON.stringify(flow)))
}

export function generateMcpDemoMockSteps(userInput) {
  const scenario = resolveMcpDemoScenario(userInput)
  const svcNames = (SCENARIOS[scenario].nodeList || []).map((n) => n.name).join('、')
  return [
    {
      step: 1,
      thought: `识别 MCP 演示场景「${scenario}」，将编排 ${(SCENARIOS[scenario].nodeList || []).length} 个本机 MCP 节点。`
    },
    {
      step: 2,
      thought: `节点清单：${svcNames}。传输含 SSE / stdio / Streamable HTTP，仿真走 Micro-Agent 真 MCP（preName 含「MCP演示」）。`
    },
    {
      step: 3,
      thought: '推荐完成。请启动 external-mcp 对应服务后运行仿真构建。'
    }
  ]
}
