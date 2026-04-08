export default {
  version: '1.0.0',
  schemaVersion: '1',
  domain: 'aircraft',
  source: 'builtin',
  summary: '无人飞机监控：态势感知、航线与告警联动。',
  sections: {
    terminology: [
      { term: '态势', definition: '空域内目标与环境传感融合后的当前状态摘要。' },
      { term: '告警', definition: '基于规则或模型的异常提示，需带时间与空间上下文。' }
    ],
    constraints: [
      '时间与空间数据需带统一坐标系与时间戳。',
      '控制类指令需区分仿真与实飞边界（若适用）。'
    ],
    workflowHints: ['先接入遥测与视频/点云再触发推理服务', '关键告警需可追踪到传感器源'],
    complianceNotes: ['按空域与隐私法规处理影像与轨迹数据']
  }
}
