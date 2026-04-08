export default {
  version: '1.0.0',
  schemaVersion: '1',
  domain: 'health',
  source: 'builtin',
  summary: '乡村医疗：问诊辅助、转诊建议与慢病随访。',
  sections: {
    terminology: [
      { term: '分诊', definition: '依据症状与体征信息给出就诊优先级或科室建议。' },
      { term: '随访', definition: '对慢病患者的周期性状态采集与干预提醒。' }
    ],
    constraints: [
      '输出不得替代执业医师诊断；需含免责声明与不确定性说明。',
      '患者标识与敏感信息最小化展示与脱敏。'
    ],
    workflowHints: ['优先结构化主诉与生命体征', '转诊路径需可解释'],
    complianceNotes: ['遵循医疗数据安全与隐私相关规范']
  }
}
