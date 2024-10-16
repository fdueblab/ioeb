import Mock from 'mockjs2'
import { builder } from '@/mock/util'

/* const service = [
  {
    'code': 200,
    'message': '成功处理请求',
    'result': {
      'data': [
        {
          'name': 'micro_inf_inf-eureka',
          'stack': 'micro_inf',
          'image': 'microservice-infrastructure_inf-eureka',
          'replicas': '1',
          'ports': '8761,8761;',
          'updatedAt': 'Mon Jun 08 08:55:45 CST 2020'
        },
        {
          'name': 'micro_inf_inf-zuul',
          'stack': 'micro_inf',
          'image': 'microservice-infrastructure_inf-zuul',
          'replicas': '1',
          'ports': '10001,10001;',
          'updatedAt': 'Mon Jun 08 08:55:45 CST 2020'
        }
      ],
      'pageSize': 20,
      'pageNo': 0,
      'totalPage': 1,
      'totalCount': 2
    }
  }
] */

const swarmServiceData = {
  'data': [
    {
      'id': '29izytvynmr2hvwybilzsr939',
      'name': 'micro_inf_inf-eureka',
      'stack': 'micro_inf',
      'image': 'microservice-infrastructure_inf-eureka',
      'replicas': '1',
      'ports': '8761,8761;',
      'updatedAt': '2020-06-09 08:58:41'
    },
    {
      'id': 'wq2b3lb7dtf7e2wy8umscjriy',
      'name': 'micro_inf_inf-zuul',
      'stack': 'micro_inf',
      'image': 'microservice-infrastructure_inf-zuul',
      'replicas': '1',
      'ports': '10001,10001;',
      'updatedAt': '2020-06-09 08:58:41'
    }
  ],
  'pageSize': 20,
  'pageNo': 0,
  'totalPage': 1,
  'totalCount': 2
}

const swarmService = (options) => {
  console.log('[mock in swarmService]:', options)
  return builder(swarmServiceData)
}

Mock.mock(/\/swarm\/service/, 'get', swarmService)
