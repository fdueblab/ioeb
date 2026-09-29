const KEY = 'clinical_preview_models_v1'

export function listPreviewModels() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(items) ? items : []
  } catch (error) {
    return []
  }
}

export function getPreviewModel(id) {
  return listPreviewModels().find(item => item.id === id)
}

export function savePreviewModel(model) {
  const id = `preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const item = { ...model, id, domain: 'clinical', type: 'generated_algorithm', createdAt: Date.now() }
  const items = [item, ...listPreviewModels()].slice(0, 30)
  localStorage.setItem(KEY, JSON.stringify(items))
  return item
}
