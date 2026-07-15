import { callAgentApi } from '@/utils/request'

/**
 * 算法想定对话填表：自然语言 → formDraft
 * @param {FormData} formData message, domain, session_id?, partial_form?, dictionary_snapshot?
 */
export function callAmlScenarioIntake(formData) {
  return callAgentApi('/api/agent/aml_scenario_intake', formData)
}
