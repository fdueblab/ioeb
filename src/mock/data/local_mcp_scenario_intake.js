/**
 * 本地 MCP 演示：结构化想定 mock（纯前端，不调 scenario_intake API）
 */

import { LOCAL_MCP_MARK_RE } from '@/mock/data/meta_apps_data'
import { stripLocalMcpPrefix } from '@/mock/data/local_mcp_scenario_resolve'

export const LOCAL_MCP_PARSER_MODEL = 'local-mcp-mock'

export const LOCAL_MCP_SCENARIO_INTAKE = {
  linezolid: {
    scenarioSummary:
      '65岁男性院内获得性肺炎，合并肾功能不全，需制定利奈唑胺给药方案并说明剂量调整依据。',
    scenarioParsed: {
      goal: '为肾功能不全的院内肺炎患者制定利奈唑胺给药方案',
      description: '老年院内获得性肺炎，合并肾功能减退，拟用利奈唑胺抗感染',
      constraints: ['需依据肌酐清除率调整剂量', '遵循院内抗菌药物管理规范'],
      acceptanceCriteria: [
        '给出推荐剂量与给药频次',
        '说明肾功能调整依据',
        '列出需监测的实验室指标'
      ],
      domain: 'health'
    }
  },
  medical_calc: {
    scenarioSummary: 'ICU 脓毒症患者需计算 SOFA 评分，量化病情严重程度以支持后续治疗决策。',
    scenarioParsed: {
      goal: '为重症/脓毒症患者计算 SOFA 等病情严重程度评分',
      description: 'ICU 患者病情复杂，需客观量化器官功能障碍程度',
      constraints: ['使用标准 SOFA 评分口径', '输入数据需来自可核验的生命体征与检验'],
      acceptanceCriteria: ['输出 SOFA 总分及各分项', '评分结果可用于病情分层说明'],
      domain: 'health'
    }
  },
  openfda: {
    scenarioSummary: '处方前查询利奈唑胺说明书、黑框警告与药物相互作用，支持安全用药核对。',
    scenarioParsed: {
      goal: '处方前核对利奈唑胺药品标签与安全性信息',
      description: '抗菌药处方前需查阅官方标签与警示信息',
      constraints: ['信息来源应为权威药品标签数据', '需覆盖黑框警告与相互作用'],
      acceptanceCriteria: ['返回药品标签摘要', '列出关键警示与相互作用'],
      domain: 'health'
    }
  },
  opentargets: {
    scenarioSummary: '肿瘤 MDT 前检索 BRAF 靶点相关疾病与在研药物证据，辅助多学科讨论。',
    scenarioParsed: {
      goal: '检索指定靶点相关的疾病关联与药物研发证据',
      description: '肿瘤多学科会诊前需汇总靶点层面的生物学与药物证据',
      constraints: ['证据需标注来源类型（疾病关联/药物/文献）'],
      acceptanceCriteria: ['返回靶点相关疾病列表', '返回相关药物或试验线索'],
      domain: 'health'
    }
  },
  healthcovered: {
    scenarioSummary: '出院或慢病患者咨询 ACA 参保资格与开放注册窗口，明确可获得的医保覆盖选项。',
    scenarioParsed: {
      goal: '为出院/慢病患者提供 ACA 参保资格与注册时间咨询',
      description: '患者即将出院或处于慢病管理阶段，需了解参保与报销窗口',
      constraints: ['回答需区分资格查询与注册时间表'],
      acceptanceCriteria: ['说明是否符合参保资格', '给出开放注册或后续行动建议'],
      domain: 'health'
    }
  },
  combo: {
    scenarioSummary:
      '脓毒症休克患者：先完成 SOFA 评估量化病情，再优化利奈唑胺静脉给药方案。',
    scenarioParsed: {
      goal: '先评估脓毒症严重程度，再制定利奈唑胺给药方案',
      description: 'ICU 脓毒症休克患者，需评分后个体化抗菌治疗',
      constraints: ['先评分、后给药，顺序不可颠倒', '剂量需结合肾功能与感染严重程度'],
      acceptanceCriteria: ['产出 SOFA 或等效 severity 结果', '给出利奈唑胺剂量与给药途径建议'],
      domain: 'health'
    }
  },
  clinical_triad: {
    scenarioSummary:
      '肾功能减退的肺炎患者：SOFA 评分、利奈唑胺剂量计算并查阅药品标签，形成综合用药建议。',
    scenarioParsed: {
      goal: '为肾功能减退的肺炎患者完成评分、剂量计算与说明书核对',
      description: '肺炎合并肾功能减退，需多学科信息整合后给出用药建议',
      constraints: ['评分、剂量、标签核对三步均需完成', '最终建议需三者一致、可解释'],
      acceptanceCriteria: [
        '输出 SOFA 或 severity 评估',
        '输出利奈唑胺剂量建议',
        '输出药品标签关键警示摘要'
      ],
      domain: 'health'
    }
  },
  all5: {
    scenarioSummary:
      '重症医院感染患者：病情评分、抗菌药给药、查说明书与靶点证据、出院医保与随访安排，形成多学科辅助决策材料。',
    scenarioParsed: {
      goal: '为重症医院感染患者生成多学科 MCP 辅助决策材料',
      description: '重症感染住院患者，涉及评分、给药、药品安全、靶点证据与出院医保衔接',
      constraints: [
        '覆盖评分、给药、标签、靶点、医保五类能力',
        '各服务输出需可汇总为一份决策摘要'
      ],
      acceptanceCriteria: [
        '完成病情量化评估',
        '给出抗菌药给药建议',
        '提供药品标签与靶点证据摘要',
        '说明出院医保/随访相关建议'
      ],
      domain: 'health'
    }
  }
}

function cloneScenarioParsed(sp) {
  if (!sp || typeof sp !== 'object') return null
  return {
    goal: sp.goal || '',
    description: sp.description || '',
    constraints: [...(sp.constraints || [])],
    acceptanceCriteria: [...(sp.acceptanceCriteria || [])],
    domain: sp.domain || 'health'
  }
}

function titleFromFlowName(preName) {
  return String(preName || '').replace(LOCAL_MCP_MARK_RE, '').trim()
}

export function synthesizeScenarioParsedFromFlow(flow) {
  const title = titleFromFlowName(flow.preName)
  const preDes = flow.preDes || ''
  const preOut = flow.preOutputName || '业务输出'
  return {
    goal: title || preDes || '完成本地 MCP 演示场景任务',
    description: preDes || title,
    constraints: [],
    acceptanceCriteria: [`产出${preOut}`, '编排的 MCP 服务均可被仿真调用'],
    domain: 'health'
  }
}

export function buildLocalMcpScenarioIntake(scenarioKey, flow, userInput) {
  const template = LOCAL_MCP_SCENARIO_INTAKE[scenarioKey] || {}
  const userText = stripLocalMcpPrefix(userInput)
  const base = template.scenarioParsed
    ? cloneScenarioParsed(template.scenarioParsed)
    : synthesizeScenarioParsedFromFlow(flow)

  const scenarioSummary =
    userText ||
    template.scenarioSummary ||
    flow.scenarioSummary ||
    [flow.preDes, flow.preName && titleFromFlowName(flow.preName)].filter(Boolean).join(' — ')

  const scenarioParsed = {
    ...base,
    source: {
      rawUserInput: userText || flow.preDes || '',
      intakeDialogue: [],
      intakeSessionId: null,
      parserModel: LOCAL_MCP_PARSER_MODEL,
      parsedAt: new Date().toISOString()
    },
    demoScenarioKey: scenarioKey
  }

  return {
    scenarioParsed,
    scenarioSummary,
    userRemark: flow.preDes || (userText ? userText.slice(0, 120) : ''),
    intakeSessionId: null
  }
}

export function toScenarioIntakeEvent(intake) {
  return {
    scenarioParsed: intake.scenarioParsed,
    scenarioSummary: intake.scenarioSummary,
    userRemark: intake.userRemark,
    intakeSessionId: intake.intakeSessionId
  }
}

export function enrichLocalMcpFlowWithScenarioIntake(flow, userInput, scenarioKey) {
  if (!scenarioKey) {
    throw new Error('enrichLocalMcpFlowWithScenarioIntake 需要 scenarioKey')
  }
  const intake = buildLocalMcpScenarioIntake(scenarioKey, flow, userInput)
  return {
    ...flow,
    scenarioSummary: intake.scenarioSummary,
    scenarioParsed: intake.scenarioParsed,
    _localMcpScenarioKey: scenarioKey
  }
}
