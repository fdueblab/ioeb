export default {
  version: '1.0.0',
  schemaVersion: '1',
  domain: 'evtol',
  source: 'builtin',
  summary: '低空飞行：航路、空域容量与运行风险。',
  sections: {
    terminology: [
      { term: '航路', definition: '经审批或规划的低空飞行路径描述。' },
      { term: '容量', definition: '空域或起降点在时段内可承载的运行架次。' }
    ],
    constraints: [
      '高度与速度约束需与空域网格或禁飞区一致。',
      '多机冲突检测需显式输出解脱建议或告警。'
    ],
    workflowHints: ['先静态航路再动态冲突消解', '与监视数据时间对齐'],
    complianceNotes: ['遵循低空运行与噪声相关监管要求']
  }
}
