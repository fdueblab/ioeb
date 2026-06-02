/**
 * 调度页演示 · flow 与 SmartChat 推理步骤（课题 + 本机 MCP）
 */
import {
  resolveScheduleDemoKind,
  resolveMcpDemoScenario,
  SCHEDULE_DEMO_KIND
} from '@/config/scheduleDemo'
import { generateMockSteps, getMetaAppNodes } from '@/mock/data/meta_apps_data'

const MCP_ROOT = '/home/lyx/workspace/fdueblab/external-mcp'

const MCP_NODES = {
  linezolid: {
    id: 'mcp-demo-linezolid',
    name: '利奈唑胺给药方案优化MCP Server',
    url: 'http://127.0.0.1:25013/sse',
    mcpMethod: 'sse',
    isFake: false,
    des: '利奈唑胺剂量（SSE :25013）',
    type: 'atomic_mcp',
    status: 'released',
    tools: [{ name: 'calculate_linezolid_dose', description: '计算推荐剂量' }]
  },
  medicalCalc: {
    id: 'mcp-demo-medical-calc',
    name: 'medical-calc-mcp',
    url: 'http://127.0.0.1:18000/sse',
    mcpMethod: 'sse',
    isFake: false,
    des: '医学计算器（SSE :18000）',
    type: 'atomic_mcp',
    status: 'released',
    tools: [
      { name: 'discover', description: '发现计算器' },
      { name: 'calculate', description: '执行计算' }
    ]
  },
  openfda: {
    id: 'mcp-demo-openfda',
    name: 'openFDA 药品标签 MCP',
    mcpMethod: 'stdio',
    mcpCommand: 'node',
    mcpArgs: [`${MCP_ROOT}/openfda-mcp/build/index.js`],
    isFake: false,
    des: 'openFDA（stdio）',
    type: 'atomic_mcp',
    status: 'released',
    tools: [
      { name: 'search_drug_labels', description: '检索药品标签' },
      { name: 'search_drug_adverse_events', description: '检索不良事件' }
    ]
  },
  opentargets: {
    id: 'mcp-demo-opentargets',
    name: 'OpenTargets 靶点知识 MCP',
    mcpMethod: 'stdio',
    mcpCommand: `${MCP_ROOT}/opentargets-mcp/.venv/bin/python`,
    mcpArgs: ['-m', 'opentargets_mcp.server', '--transport', 'stdio'],
    isFake: false,
    des: 'OpenTargets（stdio）',
    type: 'atomic_mcp',
    status: 'released',
    tools: [
      { name: 'search_entities', description: '检索实体' },
      { name: 'get_target_associations', description: '靶点关联' }
    ]
  },
  healthcovered: {
    id: 'mcp-demo-healthcovered',
    name: 'healthcovered ACA 资格 MCP',
    url: 'http://127.0.0.1:18001/mcp',
    mcpMethod: 'streamable_http',
    isFake: false,
    des: 'ACA 资格（HTTP :18001）',
    type: 'atomic_mcp',
    status: 'released',
    tools: [
      { name: 'get_enrollment_dates', description: '开放注册日期' },
      { name: 'check_eligibility', description: '参保资格' }
    ]
  }
}

function mcpApp(preName, preDes, preInput, preOutput, nodes) {
  return {
    preName,
    preDes,
    preInputName: preInput,
    preOutputName: preOutput,
    inputType: 2,
    outputType: 1,
    nodeList: nodes
  }
}

const MCP_SCENARIOS = {
  linezolid: mcpApp('利奈唑胺给药优化（MCP演示）', '利奈唑胺剂量', '患者数据', '给药方案', [
    MCP_NODES.linezolid
  ]),
  medical_calc: mcpApp('医学计算器辅助（MCP演示）', 'SOFA 等评分', '临床数据', '计算结果', [
    MCP_NODES.medicalCalc
  ]),
  openfda: mcpApp('药品标签检索（MCP演示）', 'openFDA', '药品名', '标签摘要', [MCP_NODES.openfda]),
  opentargets: mcpApp('靶点检索（MCP演示）', 'OpenTargets', '查询', '关联知识', [
    MCP_NODES.opentargets
  ]),
  healthcovered: mcpApp('ACA 参保日期（MCP演示）', 'healthcovered', '场景', '日期说明', [
    MCP_NODES.healthcovered
  ]),
  combo: mcpApp('重症感染用药（MCP演示）', '评分+给药', '综合数据', '联合方案', [
    MCP_NODES.medicalCalc,
    MCP_NODES.linezolid
  ]),
  clinical_triad: mcpApp('临床用药三联（MCP演示）', 'calc+linezolid+openFDA', '用药问题', '报告', [
    MCP_NODES.medicalCalc,
    MCP_NODES.linezolid,
    MCP_NODES.openfda
  ]),
  research_triad: mcpApp('靶点与参保三联（MCP演示）', '靶点+ACA+calc', '查询', '摘要', [
    MCP_NODES.opentargets,
    MCP_NODES.healthcovered,
    MCP_NODES.medicalCalc
  ]),
  all5: mcpApp('五服务全链路（MCP演示）', 'external-mcp 五服务', '综合需求', '多源结果', [
    MCP_NODES.medicalCalc,
    MCP_NODES.linezolid,
    MCP_NODES.openfda,
    MCP_NODES.opentargets,
    MCP_NODES.healthcovered
  ])
}

function mcpFlow(userInput) {
  const key = resolveMcpDemoScenario(userInput)
  const flow = MCP_SCENARIOS[key]
  if (!flow) return Promise.reject(new Error('未找到 MCP 演示场景'))
  return Promise.resolve(JSON.parse(JSON.stringify(flow)))
}

function mcpSteps(userInput) {
  const key = resolveMcpDemoScenario(userInput)
  const n = (MCP_SCENARIOS[key].nodeList || []).length
  const names = MCP_SCENARIOS[key].nodeList.map((x) => x.name).join('、')
  return [
    { step: 1, thought: `MCP 演示「${key}」：编排 ${n} 个本机节点。` },
    { step: 2, thought: `节点：${names}。仿真走 Micro-Agent（preName 含 MCP演示）。` },
    { step: 3, thought: '请先启动 external-mcp，再运行仿真构建。' }
  ]
}

export function generateScheduleDemoSteps(verticalType, userInput) {
  if (resolveScheduleDemoKind(userInput) === SCHEDULE_DEMO_KIND.MCP) {
    return mcpSteps(userInput)
  }
  return generateMockSteps(verticalType, userInput)
}

export function getScheduleDemoFlow(verticalType, userInput) {
  if (resolveScheduleDemoKind(userInput) === SCHEDULE_DEMO_KIND.MCP) {
    return mcpFlow(userInput)
  }
  return getMetaAppNodes(verticalType, userInput)
}
