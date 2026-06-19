/**
 * 课题演示：结构化想定 mock（纯前端）
 */

export const TOPIC_PARSER_MODEL = 'topic-demo-mock'

export const TOPIC_SCENARIO_INTAKE = {
  pj1: {
    scenarioSummary:
      '跨境支付场景下，基于课题一风险识别算法对交易数据进行建模推理，并生成可审计的风险评估报告。',
    scenarioParsed: {
      goal: '构建课题一跨境支付风险识别与报告生成元应用',
      description: '金融机构需在跨境支付链路中自动识别可疑交易并输出标准化风险报告',
      constraints: [
        '输入为跨境支付交易数据（文件或结构化批次）',
        '风险识别结果需可追溯至模型版本与规则集',
        '报告格式需满足合规留痕要求'
      ],
      acceptanceCriteria: [
        '完成交易数据预处理与特征抽取',
        '输出风险等级与关键风险因子说明',
        '生成课题一风险评估报告（文本）'
      ],
      domain: 'aml'
    }
  },
  pj2: {
    scenarioSummary:
      '多机构联合反洗钱场景：基于课题二多方安全计算，在不共享原始数据的前提下完成风险识别并生成报告。',
    scenarioParsed: {
      goal: '构建课题二联邦式跨境支付风险识别报告元应用',
      description: '参与机构数据不出域，需通过安全多方计算联合建模并汇总风险结论',
      constraints: [
        '各方原始敏感字段不得明文出域',
        '联合计算协议需可复现且记录参与方',
        '最终报告仅包含聚合风险结论与必要解释'
      ],
      acceptanceCriteria: [
        '启动多方安全计算并完成联合特征对齐',
        '输出跨机构洗钱网络线索与风险评分',
        '生成课题二风险评估报告'
      ],
      domain: 'aml'
    }
  },
  pj4: {
    scenarioSummary:
      '对跨境支付风控模型进行课题四安全性指纹评测，识别对抗样本风险与模型脆弱点。',
    scenarioParsed: {
      goal: '构建课题四模型安全性指纹评测元应用',
      description: '上线前需验证风控模型在对抗攻击与分布漂移下的稳健性',
      constraints: [
        '评测需覆盖安全性指纹与抗攻击能力两类指标',
        '不得在生产环境直接注入破坏性样本',
        '评测结论需映射到可执行的加固建议'
      ],
      acceptanceCriteria: [
        '完成模型安全性指纹检测',
        '输出安全风险等级与脆弱点列表',
        '生成课题四安全性指纹报告'
      ],
      domain: 'aml'
    }
  },
  pj_combo: {
    scenarioSummary:
      '综合课题一风险识别、课题四安全评测与课题三报告生成，形成端到端金融风险报告流水线。',
    scenarioParsed: {
      goal: '构建多课题组合的金融风险报告生成元应用',
      description: '跨境贸易场景需先识别风险、再评测模型安全性，最后汇总为统一金融报告',
      constraints: [
        '先风险识别、再安全评测、最后报告生成，阶段顺序固定',
        '各阶段输出需写入统一证据链供审计',
        '报告需同时包含风险结论与安全评测摘要'
      ],
      acceptanceCriteria: [
        '课题一模型完成交易风险识别',
        '课题四完成模型安全性指纹评测',
        '课题三生成完整金融风险报告'
      ],
      domain: 'aml'
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
    domain: sp.domain || 'aml'
  }
}

export function resolveTopicScenarioKey(userInput) {
  const text = String(userInput || '')
  if (text.includes('课题一和课题三') || text.includes('各课题')) return 'pj_combo'
  if (text.includes('课题三')) return 'pj_combo'
  if (text.includes('课题四')) return 'pj4'
  if (text.includes('课题一')) return 'pj1'
  if (text.includes('课题二')) return 'pj2'
  return null
}

export function resolveTopicScenarioKeyByAppName(appName) {
  const n = String(appName || '')
  if (n.includes('金融风险报告生成')) return 'pj_combo'
  if (n.includes('课题四')) return 'pj4'
  if (n.includes('课题二')) return 'pj2'
  if (n.includes('课题一')) return 'pj1'
  return null
}

export function buildTopicScenarioIntake(scenarioKey, flow, userInput) {
  const template = TOPIC_SCENARIO_INTAKE[scenarioKey] || {}
  const base = template.scenarioParsed
    ? cloneScenarioParsed(template.scenarioParsed)
    : {
        goal: flow.preName || '',
        description: flow.preDes || '',
        constraints: [],
        acceptanceCriteria: [`产出${flow.preOutputName || '业务输出'}`],
        domain: 'aml'
      }

  const scenarioSummary =
    String(userInput || '').trim() ||
    template.scenarioSummary ||
    flow.scenarioSummary ||
    flow.preDes ||
    ''

  const scenarioParsed = {
    ...base,
    source: {
      rawUserInput: String(userInput || '').trim() || flow.preDes || '',
      intakeDialogue: [],
      intakeSessionId: null,
      parserModel: TOPIC_PARSER_MODEL,
      parsedAt: new Date().toISOString()
    },
    demoScenarioKey: scenarioKey
  }

  return {
    scenarioParsed,
    scenarioSummary,
    userRemark: flow.preDes || '',
    intakeSessionId: null
  }
}

function normalizeFlowNodes(flow) {
  const nodeList = (flow.nodeList || []).map((node) => ({
    ...node,
    isFake: !!(node.isFake || node.is_fake)
  }))
  return { ...flow, nodeList }
}

export function enrichTopicFlowWithScenarioIntake(flow, userInput) {
  const scenarioKey = resolveTopicScenarioKey(userInput)
  if (!scenarioKey) return normalizeFlowNodes(flow)
  const intake = buildTopicScenarioIntake(scenarioKey, flow, userInput)
  return normalizeFlowNodes({
    ...flow,
    scenarioSummary: intake.scenarioSummary,
    scenarioParsed: intake.scenarioParsed,
    _topicScenarioKey: scenarioKey
  })
}
