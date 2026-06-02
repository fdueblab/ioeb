/**
 * 按调用方传入的规则从 domainKnowledge 裁剪片段并生成可拼入 system prompt 的文本。
 * 阶段定义由各业务模块（如仿真构建）自行提供，本平台层不持有具体流水线阶段。
 */

function formatTerminologyList(list) {
  if (!Array.isArray(list) || !list.length) return ''
  return list
    .map((t) => (t && t.term ? `${t.term}：${t.definition || ''}` : ''))
    .filter(Boolean)
    .join('；')
}

function joinLines(label, items) {
  if (!Array.isArray(items) || !items.length) return ''
  return `${label}：${items.join('；')}`
}

function pickFromKnowledge(dk, spec) {
  const key = spec.key
  if (spec.from === 'root') return dk[key]
  const sec = dk.sections || {}
  return sec[key]
}

function buildSections(dk, sectionsOut) {
  const out = {}
  if (!Array.isArray(sectionsOut)) return out
  sectionsOut.forEach((spec) => {
    out[spec.key] = pickFromKnowledge(dk, spec)
  })
  return out
}

function lineFromRule(dk, rule, sec) {
  switch (rule.kind) {
    case 'summary': {
      return dk.summary ? `【领域摘要】${dk.summary}` : ''
    }
    case 'terminology': {
      const termText = formatTerminologyList(sec.terminology)
      return termText && rule.prefix ? `${rule.prefix}${termText}` : ''
    }
    case 'sectionJoin': {
      const items = sec[rule.sectionKey]
      return joinLines(rule.joinLabel, items)
    }
    case 'scenarioExcerpt': {
      return dk.scenarioContext && dk.scenarioContext.excerpt
        ? `用户场景摘要：${dk.scenarioContext.excerpt}`
        : ''
    }
    default:
      return ''
  }
}

/**
 * @param {object} [domainKnowledge] getKnowledge 的返回值
 * @param {{ stage: string, sectionsOut: object[], lines: object[] }} stageRule 调用方提供的阶段规则
 * @param {object} [stageContext] 预留，后续可按服务/轮次细化
 * @returns {{ stage: string, promptFragment: string, sections: object }}
 */
export function enhanceForStage(domainKnowledge, stageRule, stageContext = {}) {
  void stageContext
  const dk = domainKnowledge && typeof domainKnowledge === 'object' ? domainKnowledge : {}
  const sec = dk.sections || {}
  const baseMeta = dk.summary ? `【领域摘要】${dk.summary}` : ''

  const rule =
    stageRule && typeof stageRule === 'object' && Array.isArray(stageRule.lines)
      ? stageRule
      : null
  const stageId = rule && rule.stage != null ? String(rule.stage) : ''

  if (!rule || !Array.isArray(rule.sectionsOut)) {
    return {
      stage: stageId || 'unknown',
      promptFragment: baseMeta,
      sections: {}
    }
  }

  const sections = buildSections(dk, rule.sectionsOut)
  const promptFragment = rule.lines
    .map((lineRule) => lineFromRule(dk, lineRule, sec))
    .filter(Boolean)
    .join('\n')

  return { stage: stageId || 'unknown', promptFragment, sections }
}
