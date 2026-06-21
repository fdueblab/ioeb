/**
 * 本地 MCP 注册表：端口、工具、URL 单一来源。
 * 入库时仅填 serviceId，并将画布 URL 切到 productionUrl。
 */

function mcpNodeFromEntry(entry) {
  return {
    id: entry.id,
    name: entry.name,
    url: entry.devUrl,
    mcpMethod: 'sse',
    isFake: false,
    des: entry.des,
    type: 'atomic_mcp',
    status: 'released',
    tools: entry.tools.map((t) => ({ ...t }))
  }
}

/** @type {Record<string, object>} */
export const LOCAL_MCP_REGISTRY = {
  linezolid: {
    key: 'linezolid',
    id: 'mcp-demo-linezolid',
    port: 25013,
    serviceId: null,
    /** 生产 Docker（124.223.185.136）；开发机无本地进程，勿 rewrite 到 127.0.0.1 */
    remoteOnly: true,
    devUrl: 'http://fdueblab.cn:25013/sse',
    productionUrl: 'http://fdueblab.cn:25013/sse',
    name: '利奈唑胺给药方案优化MCP Server',
    des: '利奈唑胺剂量（生产 Docker :25013，直连 SSE）',
    tools: [
      {
        name: 'calculate_linezolid_dose',
        description:
          '计算利奈唑胺推荐剂量。sex/age/height/weight/scr/tb: 患者参数。返回 JSON 字符串。'
      }
    ]
  },
  medicalCalc: {
    key: 'medicalCalc',
    id: 'mcp-demo-medical-calc',
    port: 18000,
    serviceId: null,
    devUrl: 'http://127.0.0.1:18000/sse',
    productionUrl: 'https://fdueblab.cn/mcp-proxy/18000/sse',
    name: 'medical-calc-mcp',
    des: '医学计算器（SSE :18000）',
    tools: [
      {
        name: 'discover',
        description: '按关键词或上下文发现医学计算器。by/value: 检索方式与关键词。返回 JSON。'
      },
      {
        name: 'calculate',
        description: '执行指定计算器。tool_id/params: 计算器 ID 与参数。返回 JSON。'
      }
    ]
  },
  openfda: {
    key: 'openfda',
    id: 'mcp-demo-openfda',
    port: 18003,
    serviceId: null,
    devUrl: 'http://127.0.0.1:18003/sse',
    productionUrl: 'https://fdueblab.cn/mcp-proxy/18003/sse',
    name: 'openFDA 药品标签 MCP',
    des: 'openFDA（SSE :18003）',
    tools: [
      {
        name: 'search_drug_labels',
        description: '检索 FDA 药品标签。generic_name: 通用名。limit: 返回条数。返回 JSON 字符串。'
      },
      {
        name: 'search_drug_adverse_events',
        description: '检索 FDA 不良事件。generic_name: 通用名。返回 JSON 字符串。'
      }
    ]
  },
  opentargets: {
    key: 'opentargets',
    id: 'mcp-demo-opentargets',
    port: 18002,
    serviceId: null,
    devUrl: 'http://127.0.0.1:18002/sse',
    productionUrl: 'https://fdueblab.cn/mcp-proxy/18002/sse',
    name: 'OpenTargets 靶点知识 MCP',
    des: 'OpenTargets（SSE :18002）',
    tools: [
      {
        name: 'search_entities',
        description: '按关键词检索靶点/疾病/药物实体。query_string: 检索词。返回 JSON。'
      },
      {
        name: 'get_target_associated_diseases',
        description: '查询靶点关联疾病。ensembl_id: 靶点 ID。返回 JSON。'
      }
    ]
  },
  healthcovered: {
    key: 'healthcovered',
    id: 'mcp-demo-healthcovered',
    port: 18001,
    serviceId: null,
    devUrl: 'http://127.0.0.1:18001/sse',
    productionUrl: 'https://fdueblab.cn/mcp-proxy/18001/sse',
    name: 'healthcovered ACA 资格 MCP',
    des: 'ACA 资格（SSE :18001）',
    tools: [
      {
        name: 'get_enrollment_dates',
        description: '获取 2026 年开放注册日期与特殊注册触发条件。返回说明文本。'
      },
      {
        name: 'check_aca_eligibility',
        description:
          '检查 ACA 补贴资格。household_size: 家庭人数。annual_income: 年收入（美元）。'
      },
      {
        name: 'get_healthcovered_contact',
        description: '获取 HealthCovered.org 联系方式与计算器链接。'
      }
    ]
  },
  vitalscore: {
    key: 'vitalscore',
    id: 'mcp-demo-vitalscore',
    port: 18004,
    serviceId: null,
    devUrl: 'http://127.0.0.1:18004/sse',
    productionUrl: 'https://fdueblab.cn/mcp-proxy/18004/sse',
    name: 'vitalscore 临床评分 MCP',
    des: 'vitalscore 上游库薄封装（SSE :18004）',
    tools: [
      { name: 'health_check', description: '服务健康检查。返回 JSON，含 upstream 溯源。' },
      {
        name: 'calculate_qsofa',
        description: 'qSOFA 0–3。gcs/respiratory_rate/systolic_bp。返回 JSON。'
      },
      {
        name: 'calculate_news2',
        description: 'NEWS2 早期预警分。返回 JSON。'
      },
      {
        name: 'calculate_gcs',
        description: 'Glasgow 昏迷评分 GCS 3–15。返回 JSON。'
      }
    ]
  },
  medimetry: {
    key: 'medimetry',
    id: 'mcp-demo-medimetry',
    port: 18005,
    serviceId: null,
    devUrl: 'http://127.0.0.1:18005/sse',
    productionUrl: 'https://fdueblab.cn/mcp-proxy/18005/sse',
    name: 'medimetry 临床公式 MCP',
    des: 'medimetry 上游库薄封装（SSE :18005）',
    tools: [
      { name: 'health_check', description: '服务健康检查。返回 JSON，含 upstream 溯源。' },
      {
        name: 'calculate_geneva_score',
        description: 'Geneva 肺栓塞风险分。返回 JSON。'
      },
      {
        name: 'calculate_perc_rule',
        description: 'PERC 肺栓塞排除规则。返回 JSON。'
      },
      {
        name: 'calculate_chads_vasc',
        description: 'CHA₂DS₂-VASc 房颤卒中风险分。返回 JSON。'
      },
      {
        name: 'calculate_glasgow_coma_scale',
        description: 'GCS 3–15。返回 JSON。'
      }
    ]
  },
  clinicalEvidence: {
    key: 'clinicalEvidence',
    id: 'mcp-demo-clinical-evidence',
    port: 18006,
    serviceId: null,
    devUrl: 'http://127.0.0.1:18006/sse',
    productionUrl: 'https://fdueblab.cn/mcp-proxy/18006/sse',
    name: 'clinical-evidence 试验文献 MCP',
    des: 'ClinicalTrials.gov + Europe PMC 薄封装（SSE :18006）',
    tools: [
      { name: 'health_check', description: '服务健康检查。返回 JSON。' },
      {
        name: 'search_clinical_trials',
        description: '按疾病/条件检索临床试验。返回 JSON。'
      },
      {
        name: 'get_clinical_trial',
        description: '按 NCT ID 获取试验详情。返回 JSON。'
      },
      {
        name: 'search_pubmed',
        description: '检索生物医学文献（Europe PMC）。返回 JSON。'
      }
    ]
  },
  clinical_bert: {
    key: 'clinical_bert',
    id: 'mcp-demo-clinical-bert',
    port: 18007,
    serviceId: null,
    devUrl: 'http://127.0.0.1:18007/sse',
    productionUrl: 'https://fdueblab.cn/mcp-proxy/18007/sse',
    name: 'clinical-bert 临床实体 NER MCP',
    des: 'CPU 临床 NER（SSE :18007，首次调用懒加载模型）',
    tools: [
      { name: 'health_check', description: '服务健康检查；model_loaded 表示权重是否已加载。' },
      {
        name: 'extract_clinical_entities',
        description: '从英文临床文本抽取实体。text: 输入文本。返回 JSON 实体列表。'
      }
    ]
  }
}

export const MCP_NODES = Object.fromEntries(
  Object.entries(LOCAL_MCP_REGISTRY)
    .filter(([, entry]) => !entry.placeholder)
    .map(([key, entry]) => [key, mcpNodeFromEntry(entry)])
)

export function getRegistryEntry(key) {
  return LOCAL_MCP_REGISTRY[key] || null
}
