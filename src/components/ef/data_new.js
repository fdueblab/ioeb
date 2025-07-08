// eslint-disable-next-line camelcase
const data_new = {
  preName: '新元应用',
  nodeList: [
    {
      id: 'agent_001',
      name: 'metaAppAgent',
      type: 'start',
      state: 'toBuild'
    }
  ],
  lineList: []
}

export function getDataNew () {
  // eslint-disable-next-line camelcase
  return JSON.parse(JSON.stringify(data_new)) // 深拷贝避免引用问题
}
