export default {
  version: '1.0.0',
  schemaVersion: '1',
  domain: 'aml',
  source: 'builtin',
  summary: '跨境支付监测：交易筛查、名单与案例管理。',
  sections: {
    terminology: [
      { term: '可疑交易', definition: '需结合规则与模型评分进入复核队列的交易。' },
      { term: '名单', definition: '制裁、PEP 等外部或内部维护的实体清单。' }
    ],
    constraints: [
      '模型与规则输出需可审计，保留决策依据摘要。',
      '误报与漏报权衡需可配置并与业务 KPI 对齐。'
    ],
    workflowHints: ['先名单与规则命中再模型排序', '案例闭环需留痕'],
    complianceNotes: ['反洗钱与制裁合规要求因法域而异，需对接权威名单源']
  }
}
