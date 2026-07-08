import { streamAgent } from '@/utils/request'
import { buildUpgradeAdviceFormData } from '@/utils/serviceData'

export function streamGenerateUpgradeAdvice(service, dictionaries, callbacks = {}) {
  const formData = buildUpgradeAdviceFormData(
    service,
    dictionaries.typeArr || [],
    dictionaries.technologyArr || []
  )
  return streamAgent('/api/agent/service_upgrade_advice', formData, callbacks)
}
