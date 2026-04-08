/**
 * 平台领域知识：统一入口。仿真构建、服务检索、代码生成等可共用 getKnowledge / enhanceForStage。
 */

export { getKnowledge, mergeKnowledge, registerProvider, unregisterProvider } from './KnowledgeRegistry'
export { enhanceForStage } from './KnowledgeEnhancer'
