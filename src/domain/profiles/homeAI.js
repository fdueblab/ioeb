export default {
  version: '1.0.0',
  schemaVersion: '1',
  domain: 'homeAI',
  source: 'builtin',
  summary: '家庭陪伴：多模态交互、家居控制与儿童/老人场景。',
  sections: {
    terminology: [
      { term: '场景', definition: '由时间、成员与设备状态刻画的家庭上下文。' },
      { term: '技能', definition: '可被语音或 App 触发的原子家居或内容能力。' }
    ],
    constraints: [
      '对儿童与老人相关建议需保守并支持人工确认。',
      '本地与云端推理边界需可配置，敏感数据优先本地处理。'
    ],
    workflowHints: ['先意图识别再设备控制', '异常行为联动通知监护人'],
    complianceNotes: ['家庭影像与语音属高敏感数据，需明示同意与留存策略']
  }
}
