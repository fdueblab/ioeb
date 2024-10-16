import Mock from 'mockjs2'
import { builder } from '../util'

// const serviceListData = [
//   {
//     id: '3',
//     type: 'group',
//     name: '沙盘相关微服务',
//     open: true,
//     children: [
//       {
//         id: '100',
//         type: 'group',
//         name: '酒店订单微服务',
//         open: true,
//         children: [{
//           id: '1001',
//           type: '100_getHotelInfo', // TODO: 使用type指定不同的item
//           name: 'getHotelInfo',
//           ico: 'el-icon-shopping-cart-full',
//           style: {}
//         }, {
//           id: '1002',
//           type: '100_setHotelPrice',
//           name: 'setHotelPrice',
//           ico: 'el-icon-shopping-cart-full',
//           style: {}
//         }]
//       },
//       {
//         id: '101',
//         type: 'group',
//         name: '餐饮微服务',
//         open: true,
//         children: [{
//           id: '1101',
//           type: '101_getOrderInfo',
//           name: 'getOrderInfo',
//           ico: 'el-icon-shopping-cart-full',
//           style: {}
//         }, {
//           id: '1102',
//           type: '101_setOrderPrice',
//           name: 'setOrderPrice',
//           ico: 'el-icon-shopping-cart-full',
//           style: {}
//         }]
//       }
//     ]
//   },
//   {
//     id: '5',
//     type: 'group',
//     name: '区块链',
//     open: true,
//     children: [
//       {
//         id: '500',
//         type: 'group',
//         name: '区块链微服务',
//         open: true,
//         children: [
//           {
//             id: '5000',
//             type: 'onBlockchain',
//             name: 'onBlockchain',
//             ico: 'el-icon-shopping-cart-full'
//           }
//         ]
//       }
//     ]
//   },
//   {
//     id: '4',
//     type: 'group',
//     name: '通用服务',
//     open: true,
//     children: [
//       {
//         id: '400',
//         type: 'group',
//         name: '通知服务',
//         open: true,
//         children: [
//           {
//             id: '4000',
//             type: 'notifyToAll',
//             name: 'notifyToAll',
//             ico: 'el-icon-shopping-cart-full'
//           }
//         ]
//       }
//     ]
//   }
// ]
const serviceListData = [
  {
    id: '3',
    type: 'group',
    name: '无人机微服务',
    open: true,
    children: [
      {
        id: '100',
        type: 'group',
        name: '无人机监控微服务',
        open: true,
        children: [{
          id: '1001',
          type: 'droneMonitoring',
          name: 'monitorFlightPath',
          ico: 'el-icon-video-camera',
          style: {}
        }, {
          id: '1002',
          type: 'droneTracking',
          name: 'trackDrone',
          ico: 'el-icon-location-outline',
          style: {}
        }]
      },
      {
        id: '101',
        type: 'group',
        name: '无人机数据分析微服务',
        open: true,
        children: [{
          id: '1101',
          type: 'droneDataAnalysis',
          name: 'analyzeData',
          ico: 'el-icon-data-line',
          style: {}
        }, {
          id: '1102',
          type: 'droneUsageReport',
          name: 'generateUsageReport',
          ico: 'el-icon-document',
          style: {}
        }]
      }
    ]
  },
  {
    id: '4',
    type: 'group',
    name: '反洗钱微服务',
    open: true,
    children: [
      {
        id: '200',
        type: 'group',
        name: '交易监控微服务',
        open: true,
        children: [{
          id: '2001',
          type: 'transactionMonitoring',
          name: 'monitorTransactions',
          ico: 'el-icon-bank-card',
          style: {}
        }, {
          id: '2002',
          type: 'suspiciousDetection',
          name: 'detectSuspiciousTransactions',
          ico: 'el-icon-warning',
          style: {}
        }]
      },
      {
        id: '201',
        type: 'group',
        name: '合规报告微服务',
        open: true,
        children: [{
          id: '2101',
          type: 'complianceReporting',
          name: 'generateComplianceReport',
          ico: 'el-icon-document',
          style: {}
        }, {
          id: '2102',
          type: 'regulatoryAnalysis',
          name: 'analyzeRegulations',
          ico: 'el-icon-document',
          style: {}
        }]
      }
    ]
  }
]

const serviceList = (options) => {
  console.log('mock in /api/schedule/services:' + options)
  return builder(serviceListData)
}

Mock.mock(/\/schedule\/services/, 'get', serviceList)
