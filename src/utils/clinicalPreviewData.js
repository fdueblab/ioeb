const choices = (pairs) => pairs.map(([code, text]) => ({ code, text }))

export const clinicalPreviewDictionaries = {
  domain: choices([['clinical', '临床医疗算法模型']]),
  clinical_industry: choices([
    ['cardiology', '心血管内科'], ['respiratory', '呼吸与危重症医学'],
    ['gastroenterology', '消化内科'], ['nephrology', '肾脏内科'],
    ['endocrinology', '内分泌与代谢'], ['neurology', '神经内科'],
    ['hematology', '血液科'], ['oncology', '肿瘤科'],
    ['pediatrics', '儿科'], ['obstetrics', '妇产科'], ['surgery', '外科'],
    ['emergency', '急诊医学'], ['critical_care', '重症医学'], ['general', '全科医学']
  ]),
  clinical_scenario: choices([
    ['outpatient', '门诊初评'], ['emergency', '急诊评估'],
    ['inpatient', '住院监测'], ['perioperative', '围手术期评估'],
    ['icu', '重症监护'], ['medication', '用药评估'],
    ['discharge', '出院评估'], ['chronic_followup', '慢病随访']
  ]),
  clinical_technology: choices([
    ['formula', '医学数学公式'], ['score', '临床评分量表'],
    ['rule', '临床规则'], ['regression', '统计回归'],
    ['survival', '生存分析'], ['ml', '机器学习推理'],
    ['dl', '深度学习推理'], ['nlp', '医学文本处理']
  ]),
  clinical_task: choices([
    ['physiology', '生理指标计算'], ['score', '量表评分'],
    ['risk', '风险分层'], ['diagnostic_support', '辅助诊断'],
    ['prognosis', '预后预测'], ['response', '疗效评估'],
    ['medication', '用药相关计算'], ['alert', '异常预警']
  ])
}
