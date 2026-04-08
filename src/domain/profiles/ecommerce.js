export default {
  version: '1.0.0',
  schemaVersion: '1',
  domain: 'ecommerce',
  source: 'builtin',
  summary: '跨境电商：清关、物流与多语言客服协同。',
  sections: {
    terminology: [
      { term: 'HS 编码', definition: '商品归类编码，影响税率与禁限控。' },
      { term: 'SLA', definition: '对履约时效与客户响应的服务等级约定。' }
    ],
    constraints: [
      '价格与税费展示需区分站点与币种。',
      '用户与交易数据跨境传输需符合目的地法规。'
    ],
    workflowHints: ['订单状态机与物流事件对齐', '退换货与客服工单可追溯'],
    complianceNotes: ['消费者保护、广告与个人信息保护合规']
  }
}
