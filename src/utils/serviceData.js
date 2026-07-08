export function standardizeServiceData(services) {
  if (!Array.isArray(services)) {
    return []
  }
  return services.map(service => {
    const item = { ...service }
    if (!item.norm || !Array.isArray(item.norm)) {
      item.norm = []
    }
    if (!item.source) {
      item.source = {
        popoverTitle: '服务溯源',
        companyName: '',
        companyAddress: '',
        companyContact: '',
        companyIntroduce: '',
        msIntroduce: '',
        companyScore: 0,
        msScore: 0
      }
    }
    return item
  })
}

export function buildUpgradeAdviceFormData(service, typeArr = [], technologyArr = []) {
  const fd = new FormData()
  const typeItem = typeArr.find(item => item.code === service.type)
  const techItem = technologyArr.find(item => item.code === service.technology)
  const normSummary = (service.norm || [])
    .map(item => `${item.key}:${item.score}`)
    .join('; ') || '暂无'
  const source = service.source || {}

  fd.append('service_name', service.name || '')
  fd.append('service_type', typeItem ? typeItem.text : (service.type || ''))
  fd.append('domain', service.domain || '')
  fd.append('industry', service.industry || '')
  fd.append('scenario', service.scenario || '')
  fd.append('technology', techItem ? techItem.text : (service.technology || ''))
  fd.append('status', service.status || '')
  fd.append('number', String(service.number || 0))
  fd.append('norm_summary', normSummary)
  fd.append('source_summary', source.msIntroduce || source.companyIntroduce || '')
  return fd
}

export function parseUpgradeAdviceResult(results) {
  const raw = results && results.upgrade_advice_result
  if (!raw) {
    return null
  }
  if (typeof raw === 'object') {
    return raw
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch (e) {
      return null
    }
  }
  return null
}
