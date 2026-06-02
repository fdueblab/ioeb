export default {
  version: '1.0.0',
  schemaVersion: '1',
  domain: 'agriculture',
  source: 'builtin',
  summary: '农业数智：墒情、虫害与灌溉/施肥决策支持。',
  sections: {
    terminology: [
      { term: '墒情', definition: '土壤含水量及相关环境因子综合指标。' },
      { term: '处方图', definition: '按田块空间变异性生成的作业指令栅格/矢量。' }
    ],
    constraints: [
      '气象与物联网数据需标注采集时间与站点/地块。',
      '农药与肥料建议需符合当地农艺规范（由业务规则层约束）。'
    ],
    workflowHints: ['先数据质检再模型推理', '输出需对接农机或执行系统接口'],
    complianceNotes: ['农资与环保法规因地而异，需可配置策略']
  }
}
