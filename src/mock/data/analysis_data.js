import moment from 'moment/moment'
import DataSet from '@antv/data-set'

const searchUserData = []
for (let i = 0; i < 7; i++) {
  searchUserData.push({
    x: moment().add(i, 'days').format('YYYY-MM-DD'),
    y: Math.ceil(Math.random() * 10)
  })
}
const searchUserScale = [
  {
    dataKey: 'x',
    alias: '时间'
  },
  {
    dataKey: 'y',
    alias: '用户数',
    min: 0,
    max: 10
  }]

const searchData = [
  {
    index: 1,
    keyword: '无人机状态采集微服务',
    count: Math.floor(Math.random() * 1000),
    range: Math.floor(Math.random() * 100),
    status: Math.floor((Math.random() * 10) % 2)
  },
  {
    index: 2,
    keyword: '反洗钱报告自动生成微服务',
    count: Math.floor(Math.random() * 1000),
    range: Math.floor(Math.random() * 100),
    status: Math.floor((Math.random() * 10) % 2)
  },
  {
    index: 3,
    keyword: '无人机视频采集微服务',
    count: Math.floor(Math.random() * 1000),
    range: Math.floor(Math.random() * 100),
    status: Math.floor((Math.random() * 10) % 2)
  },
  {
    index: 4,
    keyword: '无人机视频通信微服务',
    count: Math.floor(Math.random() * 1000),
    range: Math.floor(Math.random() * 100),
    status: Math.floor((Math.random() * 10) % 2)
  },
  {
    index: 5,
    keyword: '无人机视频分析微服务',
    count: Math.floor(Math.random() * 1000),
    range: Math.floor(Math.random() * 100),
    status: Math.floor((Math.random() * 10) % 2)
  },
  {
    index: 6,
    keyword: '双向通信微服务',
    count: Math.floor(Math.random() * 1000),
    range: Math.floor(Math.random() * 100),
    status: Math.floor((Math.random() * 10) % 2)
  },
  {
    index: 7,
    keyword: '服务间数据传递服务',
    count: Math.floor(Math.random() * 1000),
    range: Math.floor(Math.random() * 100),
    status: Math.floor((Math.random() * 10) % 2)
  }
]

const serviceRank = [
  {
    name: '跨境贸易/复旦大学',
    total: 102
  },
  {
    name: '跨境贸易/悦数科技',
    total: 101
  },
  {
    name: '跨境贸易/港中文',
    total: 100
  },
  {
    name: '跨境贸易/北京大学',
    total: 99
  },
  {
    name: '跨境贸易/清华大学',
    total: 98
  },
  {
    name: '跨境贸易/达观数据',
    total: 97
  },
  {
    name: '跨境贸易/国民认证',
    total: 96
  }
]

const metaAppRank = [
  {
    name: '跨境贸易/自贸区账户支付异常识别元应用',
    total: 20
  },
  {
    name: '跨境贸易/跨境电商客户支付异常识别元应用',
    total: 18
  },
  {
    name: '跨境贸易/反洗钱报告自动生成元应用',
    total: 17
  },
  {
    name: '跨境贸易/银行客户反洗钱风险预警元应用',
    total: 16
  },
  {
    name: '跨境贸易/金融机构反欺诈数据分析元应用',
    total: 15
  },
  {
    name: '低空经济/无人机虚拟仿真教学元应用',
    total: 14
  },
  {
    name: '低空经济/无人机远程救援实训元应用',
    total: 12
  }
]

const sourceData = [
  { item: '无人机技术服务', count: 32.2 },
  { item: '反洗钱技术服务', count: 21 },
  { item: '智慧教育', count: 17 },
  { item: '人工智能', count: 13 }
]

export function getSearchUserData() {
  return searchUserData
}

export function getSearchUserScale() {
  return searchUserScale
}

export function getSearchData() {
  return searchData
}

export function getSourceData() {
  return sourceData
}

export function getServiceRank() {
  return serviceRank
}

export function getMetaAppRank() {
  return metaAppRank
}

export function getBarData() {
  const barData = []
  for (let i = 0; i < 12; i += 1) {
    barData.push({
      x: `${i + 1}月`,
      y: Math.floor(Math.random() * 1000) + 200
    })
  }
  return barData
}

export function getPieData() {
  const dv = new DataSet.View().source(sourceData)
  dv.transform({
    type: 'percent',
    field: 'count',
    dimension: 'item',
    as: 'percent'
  })
  return dv.rows
}
