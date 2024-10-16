/* eslint-disable */
import Mock from 'mockjs2'
import { builder } from '@/mock/util'

const recordData = {
  'total_count': 2,
  'value': [
    {
      'student_name': '王敏',
      'exam_course': '航线飞行',
      'result': '通过',
      'start_time': '2020-11-28 13:00:00',
      'exam_room': '0001-复旦南区足球场',
      'test_id': 1
    },
    {
      'student_name': '唐欣',
      'exam_course': '航线飞行',
      'result': '不通过',
      'start_time': '2020-11-20 13:00:00', // 考试时间
      'exam_room': '0001-复旦南区足球场', //考试（教学场地）
      'test_id': 2 //考试的id
    }
  ]
}

const traceData = [
  {
    'student_name': '王敏',
    'student_school': '复旦大学',
    'exam_course': '航线飞行', //考试（教学）科目，目前只考虑航线飞行
    'exam_requirement': '矩形', //轨迹的具体种类，矩形/s形/8字形
    'exam_room': '0001-复旦南区足球场', //考试（教学场地）
    'result': '通过', //是否通过
    'start_time': '2020-11-28 13:00:00', // 时间戳
    'duration': 120, //持续时间，单位：秒
    'trace': [
      [121.502891, 31.290807], [121.502902, 31.291289], [121.503562, 31.291294], [121.503546, 31.290813]
    ] //描述轨迹的经纬度数组
  },
  {
    'student_name': '唐欣',
    'student_school': '复旦大学',
    'exam_course': '航线飞行', //考试（教学）科目，目前只考虑航线飞行
    'exam_requirement': '矩形', //轨迹的具体种类，矩形/s形/8字形
    'exam_room': '0001-复旦南区足球场', //考试（教学场地）
    'result': '不通过', //是否通过
    'start_time': '2020-11-20 13:00:00', // 时间戳
    'duration': 99, //持续时间，单位：秒
    'trace': [
      [121.502891, 31.290807], [121.502953, 31.290999], [121.502883, 31.291095], [121.502902, 31.291289], [121.503562, 31.291294], [121.503546, 31.290813]
    ] //描述轨迹的经纬度数组
  }

]

const Record = () => {
  return builder(recordData)
}

const Trace = (options) => {
  console.log('mock options,', options)
  let test_id = Number(JSON.parse(options['body'])['test_id'])
  return builder(traceData[test_id - 1])
}

Mock.mock(/\/aircraft\/record/, 'get', Record)
Mock.mock(/\/aircraft\/trace/, 'get', Trace)
