export default {
  version: '1.0.0',
  schemaVersion: '1',
  domain: 'generic',
  source: 'builtin',
  summary: '通用元应用编排：强调服务契约、数据流与可观测性。',
  sections: {
    terminology: [
      { term: '元应用', definition: '由多个原子/MCP 服务编排而成的应用级能力组合。' },
      { term: '链路检视', definition: '对编排路径上的数据形态、调用序与冗余进行检测。' }
    ],
    constraints: [
      '优先保持服务接口稳定，变更需同步更新契约说明。',
      '跨服务传递的数据应可序列化且体积可控。'
    ],
    workflowHints: [
      '先澄清输入输出与失败语义，再确定编排顺序。',
      '对关键路径保留日志与可重试边界。'
    ],
    complianceNotes: ['默认无行业合规条目；按实际部署环境补充。']
  }
}
