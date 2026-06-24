/**
 * 用户画像可选项（前端内置 fallback）。
 *
 * 这些选项用于：用户画像设置页、登录问卷、简历抽取匹配。
 * 领域(domain) 在有字典服务时优先用 dictionaryCache 的 `domain`，
 * 此处作为离线/兜底选项。
 */

export const DOMAIN_OPTIONS = [
  '跨境支付AI监测',
  '无人飞机AI监控',
  '乡村医疗AI应用',
  '数字农业AI应用',
  '低空飞行AI应用',
  '跨境电商AI应用',
  '家庭陪伴AI应用'
]

export const MAJOR_OPTIONS = [
  '计算机科学与技术',
  '软件工程',
  '人工智能',
  '数据科学与大数据技术',
  '网络空间安全',
  '电子信息工程',
  '自动化',
  '数学与应用数学',
  '统计学',
  '金融学',
  '生物医学工程',
  '其他'
]

export const OCCUPATION_OPTIONS = [
  '在校学生',
  '算法工程师',
  '软件开发工程师',
  '数据科学家',
  '科研人员',
  '产品经理',
  '高校教师',
  '创业者',
  '技术管理者',
  '其他'
]

export const TECH_NEEDS_OPTIONS = [
  '机器学习',
  '深度学习',
  '计算机视觉',
  '自然语言处理',
  '大语言模型',
  '数据分析',
  '推荐系统',
  '强化学习',
  '语音识别',
  '时间序列预测',
  '图神经网络',
  '模型部署/MLOps',
  '模型安全/对抗'
]

export default {
  DOMAIN_OPTIONS,
  MAJOR_OPTIONS,
  OCCUPATION_OPTIONS,
  TECH_NEEDS_OPTIONS
}
