const statusMap = [
  {
    status: 'warning',
    text: '未分配容器'
  },
  {
    status: 'processing',
    text: '运行中'
  },
  {
    status: 'default',
    text: '未运行'
  },
  {
    status: 'error',
    text: '异常'
  }
]

const normMap = [
  {
    text: '安全性'
  },
  {
    text: '鲁棒性'
  },
  {
    text: '隐私性'
  },
  {
    text: '可信性'
  }
]

export function getServiceStatusMap() {
  return statusMap
}

export function getNormMap() {
  return normMap
}
