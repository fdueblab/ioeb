/**
 * 课题元应用预发布：各课题假 API 与演示响应
 */

import { resolveTopicScenarioKeyByAppName } from './topic_scenario_intake'

const PJ1_SNIPPET =
  '张伟跨境支付交易存在时段异常（0–6 点占比 2.16%、22–24 点占比 5.57%），建议进一步核查。'

const TOPIC_PREPUBLISH_MOCK = {
  pj1: {
    url: '/api/pj1_report_app',
    method: 'post',
    isFake: true,
    response: {
      code: 200,
      message: '获取成功!',
      data: { result: PJ1_SNIPPET }
    }
  },
  pj2: {
    url: '/api/pj2_report_app',
    method: 'post',
    isFake: true,
    response: {
      code: 200,
      message: '联合分析完成',
      data: {
        result:
          '多方安全计算已完成：3 家机构联合识别 2 条可疑资金链路，风险等级「中」，已生成课题二风险评估报告摘要。'
      }
    }
  },
  pj4: {
    url: '/api/pj4_app',
    method: 'post',
    isFake: true,
    response: {
      code: 200,
      message: '评测完成',
      data: {
        result:
          '安全性指纹评测：模型抗对抗样本能力「良好」，发现 1 处边界脆弱点，已输出课题四安全性指纹报告。'
      }
    }
  },
  pj_combo: {
    url: '/api/pj3_app',
    method: 'post',
    isFake: true,
    response: {
      code: 200,
      message: '报告生成成功',
      data: {
        result:
          '综合报告已生成：课题一识别 3 笔可疑交易，课题四安全评测通过（含 1 项警告），课题三已汇总为金融风险报告。'
      }
    }
  }
}

export function resolveTopicPrepublishMock(appName) {
  const key = resolveTopicScenarioKeyByAppName(appName)
  if (!key) return null
  return TOPIC_PREPUBLISH_MOCK[key] || null
}
