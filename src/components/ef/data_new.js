// eslint-disable-next-line camelcase
const data_new = {
  preName: '新元应用',
  nodeList: [
    {
      id: 'agent_001',
      name: 'metaAppAgent',
      type: 'start',
      left: '0px',
      top: '0px',
      ico: 'el-icon-cpu',
      state: 'toBuild',
      input: 'json',
      output: 'json',
      version: '1.0'
    }
  ],
  lineList: []
}

export function getDataNew () {
  // eslint-disable-next-line camelcase
  return JSON.parse(JSON.stringify(data_new)) // 深拷贝避免引用问题
}
