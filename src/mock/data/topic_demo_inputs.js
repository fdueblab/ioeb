export const AML_TOPIC_DEMO_INPUTS = [
  '我想基于课题一的算法生成一个跨境支付报告生成应用',
  '我想基于课题二的算法生成一个经过检测的跨境支付报告生成应用',
  '我想基于课题三的算法构建一个智能分析系统，并用课题四的算法对其进行检测',
  '我想基于课题四的算法开发一个数据处理应用',
  '我需要基于各课题组的算法开发一个金融风控系统'
]

const TOPIC_DEMO_INPUT_SET = new Set(AML_TOPIC_DEMO_INPUTS)

export function matchesTopicDemoInput(input) {
  return typeof input === 'string' && TOPIC_DEMO_INPUT_SET.has(input.trim())
}
