/**
 * 仿真构建流水线：领域知识按阶段裁剪的规则（仅本模块使用，非平台级）。
 */

export const SIMULATION_STAGES = {
  scenarioParsing: 'scenarioParsing',
  planning: 'planning',
  verification: 'verification'
}

export const SIMULATION_STAGE_META = {
  [SIMULATION_STAGES.scenarioParsing]: {
    label: '想定解析',
    relevantSections: ['terminology', 'constraints', 'scenarioContext']
  },
  [SIMULATION_STAGES.planning]: {
    label: '调度规划',
    relevantSections: ['workflowHints', 'constraints', 'terminology']
  },
  [SIMULATION_STAGES.verification]: {
    label: '仿真验证',
    relevantSections: ['constraints', 'complianceNotes', 'terminology']
  }
}

export const SIMULATION_ENHANCEMENT_RULES = {
  [SIMULATION_STAGES.scenarioParsing]: {
    stage: SIMULATION_STAGES.scenarioParsing,
    sectionsOut: [
      { key: 'terminology', from: 'sections' },
      { key: 'constraints', from: 'sections' },
      { key: 'scenarioContext', from: 'root' }
    ],
    lines: [
      { kind: 'summary' },
      { kind: 'terminology', prefix: '术语：' },
      { kind: 'sectionJoin', sectionKey: 'constraints', joinLabel: '约束' },
      { kind: 'scenarioExcerpt' }
    ]
  },
  [SIMULATION_STAGES.planning]: {
    stage: SIMULATION_STAGES.planning,
    sectionsOut: [
      { key: 'workflowHints', from: 'sections' },
      { key: 'constraints', from: 'sections' },
      { key: 'terminology', from: 'sections' }
    ],
    lines: [
      { kind: 'summary' },
      { kind: 'sectionJoin', sectionKey: 'workflowHints', joinLabel: '编排建议' },
      { kind: 'sectionJoin', sectionKey: 'constraints', joinLabel: '约束' },
      { kind: 'terminology', prefix: '术语速查：' }
    ]
  },
  [SIMULATION_STAGES.verification]: {
    stage: SIMULATION_STAGES.verification,
    sectionsOut: [
      { key: 'constraints', from: 'sections' },
      { key: 'complianceNotes', from: 'sections' },
      { key: 'terminology', from: 'sections' }
    ],
    lines: [
      { kind: 'summary' },
      { kind: 'sectionJoin', sectionKey: 'constraints', joinLabel: '校验与一致性约束' },
      { kind: 'sectionJoin', sectionKey: 'complianceNotes', joinLabel: '合规与风控要点' },
      { kind: 'terminology', prefix: '术语参照：' }
    ]
  }
}
