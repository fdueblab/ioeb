/**
 * 简历/背景材料 -> 用户画像 前端抽取器。
 *
 * 纯前端关键词 + 同义词匹配，无后端依赖。
 * 返回建议的画像字段，由用户在 UI 中确认/修改。
 * 后续如需更高准确率，可在 api/userProfile.js 的 extractFromResume 中改走 LLM。
 */
import {
  DOMAIN_OPTIONS,
  MAJOR_OPTIONS,
  OCCUPATION_OPTIONS,
  TECH_NEEDS_OPTIONS
} from '@/utils/profileOptions'

// 每个选项对应的关键词/同义词（小写匹配）
const DOMAIN_SYNONYMS = {
  '跨境支付AI监测': ['跨境支付', '支付监测', '反洗钱', 'aml', '交易监测'],
  '无人飞机AI监控': ['无人飞机', '无人机', '飞控', '航线', '目标识别', 'uav', 'drone'],
  '乡村医疗AI应用': ['乡村医疗', '医疗', '健康', '问诊', '慢病', 'healthcare', '医院'],
  '数字农业AI应用': ['数字农业', '智慧农业', '农业', '作物', '病虫害', '智能灌溉'],
  '低空飞行AI应用': ['低空飞行', '低空经济', 'evtol', '空域', '航路', '飞行风险'],
  '跨境电商AI应用': ['跨境电商', '电子商务', '电商', 'e-commerce', '清关', '物流', '营销'],
  '家庭陪伴AI应用': ['家庭陪伴', '智能家居', '陪伴', '老人', '儿童', 'home ai', '多模态交互']
}

const MAJOR_SYNONYMS = {
  '计算机科学与技术': ['计算机科学', '计算机科学与技术', 'computer science', 'cs', '计算机'],
  '软件工程': ['软件工程', 'software engineering', '软工'],
  '人工智能': ['人工智能', 'artificial intelligence', 'ai专业'],
  '数据科学与大数据技术': ['数据科学', '大数据', 'data science', 'big data'],
  '网络空间安全': ['网络空间安全', '信息安全', 'cybersecurity'],
  '电子信息工程': ['电子信息', '电子工程', 'electronic'],
  '自动化': ['自动化', 'automation', '控制'],
  '数学与应用数学': ['数学', '应用数学', 'mathematics'],
  '统计学': ['统计', 'statistics'],
  '金融学': ['金融学', 'finance', '金融'],
  '生物医学工程': ['生物医学', '生物工程', 'biomedical']
}

const OCCUPATION_SYNONYMS = {
  '在校学生': ['学生', '在读', '硕士在读', '博士在读', 'student', '本科', '研究生'],
  '算法工程师': ['算法工程师', '算法', 'algorithm engineer', '机器学习工程师', 'ml engineer'],
  '软件开发工程师': ['软件工程师', '开发工程师', '研发工程师', 'software engineer', '后端', '前端'],
  '数据科学家': ['数据科学家', 'data scientist', '数据分析师'],
  '科研人员': ['科研', '研究员', 'researcher', '研究人员'],
  '产品经理': ['产品经理', 'product manager', 'pm'],
  '高校教师': ['教师', '讲师', '副教授', '教授', '导师', 'professor', 'lecturer'],
  '创业者': ['创始人', '创业', 'founder', 'ceo', 'cto'],
  '技术管理者': ['技术总监', '技术经理', '架构师', 'tech lead', '团队负责人']
}

const TECH_SYNONYMS = {
  '机器学习': ['机器学习', 'machine learning', 'ml', 'sklearn', 'scikit'],
  '深度学习': ['深度学习', 'deep learning', 'dl', 'pytorch', 'tensorflow', '神经网络'],
  '计算机视觉': ['计算机视觉', 'computer vision', 'cv', 'opencv', '图像识别', '目标检测', 'yolo'],
  '自然语言处理': ['自然语言处理', 'nlp', '文本', 'bert', 'transformer', '分词'],
  '大语言模型': ['大语言模型', 'llm', 'gpt', '大模型', 'chatgpt', 'rag', '提示词'],
  '数据分析': ['数据分析', 'data analysis', 'pandas', '可视化', 'bi'],
  '推荐系统': ['推荐系统', 'recommendation', '推荐算法', '协同过滤'],
  '强化学习': ['强化学习', 'reinforcement learning', 'rl', 'dqn'],
  '语音识别': ['语音识别', 'speech', 'asr', '语音'],
  '时间序列预测': ['时间序列', 'time series', '预测', 'lstm', 'arima'],
  '图神经网络': ['图神经网络', 'gnn', 'graph neural', '图计算'],
  '模型部署/MLOps': ['部署', 'mlops', 'docker', 'k8s', '推理服务', 'serving'],
  '模型安全/对抗': ['对抗样本', '模型安全', 'adversarial', '鲁棒性', '安全评测']
}

function matchSingle (text, synonymMap, options) {
  const lower = text.toLowerCase()
  let best = null
  let bestCount = 0
  options.forEach(opt => {
    const syns = synonymMap[opt] || [opt]
    let count = 0
    syns.forEach(s => {
      if (lower.indexOf(String(s).toLowerCase()) !== -1) count++
    })
    if (count > bestCount) {
      bestCount = count
      best = opt
    }
  })
  return bestCount > 0 ? best : ''
}

function matchMultiple (text, synonymMap, options, limit = 6) {
  const lower = text.toLowerCase()
  const hits = []
  options.forEach(opt => {
    const syns = synonymMap[opt] || [opt]
    const matched = syns.some(s => lower.indexOf(String(s).toLowerCase()) !== -1)
    if (matched) hits.push(opt)
  })
  return hits.slice(0, limit)
}

/**
 * 从纯文本抽取画像建议
 * @param {string} text
 * @returns {{domain:string, major:string, occupation:string, techNeeds:string[]}}
 */
export function extractProfileFromText (text) {
  const safe = text || ''
  return {
    domain: matchSingle(safe, DOMAIN_SYNONYMS, DOMAIN_OPTIONS),
    major: matchSingle(safe, MAJOR_SYNONYMS, MAJOR_OPTIONS),
    occupation: matchSingle(safe, OCCUPATION_SYNONYMS, OCCUPATION_OPTIONS),
    techNeeds: matchMultiple(safe, TECH_SYNONYMS, TECH_NEEDS_OPTIONS)
  }
}

export default { extractProfileFromText }
