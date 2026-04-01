/**
 * 仿真构建：领域知识（前端侧默认模板 + 可注册覆盖）
 *
 * - 与 UI 解耦：仅导出纯函数与注册表，供 simulation_builder 组装请求体。
 * - 后端可同名消费 `domainKnowledge` 字段；未来可将 provider 迁到服务端，前端只传 domain id。
 */

/** @type {Map<string, (ctx: object) => object>} */
const providers = new Map()

/**
 * 注册或覆盖某 domain 的知识构造器（后注册覆盖先注册）。
 * @param {string} domainId
 * @param {(ctx: object) => object} fn
 */
export function registerSimulationDomainKnowledgeProvider(domainId, fn) {
  if (!domainId || typeof fn !== 'function') return
  providers.set(String(domainId), fn)
}

export function unregisterSimulationDomainKnowledgeProvider(domainId) {
  providers.delete(String(domainId))
}

/** 内置模板：按业务域给规划/校验用的短约束与术语（可逐步扩充） */
const BUILTIN = {
  generic: {
    version: '1.0.0',
    schemaVersion: '1',
    domain: 'generic',
    source: 'builtin',
    summary: '通用元应用编排：强调服务契约、数据流与可观测性。',
    sections: {
      terminology: [
        { term: '元应用', definition: '由多个原子/MCP 服务编排而成的应用级能力组合。' },
        { term: '链路检视', definition: '对编排路径上的数据形态、调用序与冗余进行检测。' }
      ],
      constraints: [
        '优先保持服务接口稳定，变更需同步更新契约说明。',
        '跨服务传递的数据应可序列化且体积可控。'
      ],
      workflowHints: [
        '先澄清输入输出与失败语义，再确定编排顺序。',
        '对关键路径保留日志与可重试边界。'
      ],
      complianceNotes: ['默认无行业合规条目；按实际部署环境补充。']
    }
  },
  aircraft: {
    version: '1.0.0',
    schemaVersion: '1',
    domain: 'aircraft',
    source: 'builtin',
    summary: '无人飞机监控：态势感知、航线与告警联动。',
    sections: {
      terminology: [
        { term: '态势', definition: '空域内目标与环境传感融合后的当前状态摘要。' },
        { term: '告警', definition: '基于规则或模型的异常提示，需带时间与空间上下文。' }
      ],
      constraints: [
        '时间与空间数据需带统一坐标系与时间戳。',
        '控制类指令需区分仿真与实飞边界（若适用）。'
      ],
      workflowHints: ['先接入遥测与视频/点云再触发推理服务', '关键告警需可追踪到传感器源'],
      complianceNotes: ['按空域与隐私法规处理影像与轨迹数据']
    }
  },
  health: {
    version: '1.0.0',
    schemaVersion: '1',
    domain: 'health',
    source: 'builtin',
    summary: '乡村医疗：问诊辅助、转诊建议与慢病随访。',
    sections: {
      terminology: [
        { term: '分诊', definition: '依据症状与体征信息给出就诊优先级或科室建议。' },
        { term: '随访', definition: '对慢病患者的周期性状态采集与干预提醒。' }
      ],
      constraints: [
        '输出不得替代执业医师诊断；需含免责声明与不确定性说明。',
        '患者标识与敏感信息最小化展示与脱敏。'
      ],
      workflowHints: ['优先结构化主诉与生命体征', '转诊路径需可解释'],
      complianceNotes: ['遵循医疗数据安全与隐私相关规范']
    }
  },
  agriculture: {
    version: '1.0.0',
    schemaVersion: '1',
    domain: 'agriculture',
    source: 'builtin',
    summary: '农业数智：墒情、虫害与灌溉/施肥决策支持。',
    sections: {
      terminology: [
        { term: '墒情', definition: '土壤含水量及相关环境因子综合指标。' },
        { term: '处方图', definition: '按田块空间变异性生成的作业指令栅格/矢量。' }
      ],
      constraints: [
        '气象与物联网数据需标注采集时间与站点/地块。',
        '农药与肥料建议需符合当地农艺规范（由业务规则层约束）。'
      ],
      workflowHints: ['先数据质检再模型推理', '输出需对接农机或执行系统接口'],
      complianceNotes: ['农资与环保法规因地而异，需可配置策略']
    }
  },
  evtol: {
    version: '1.0.0',
    schemaVersion: '1',
    domain: 'evtol',
    source: 'builtin',
    summary: '低空飞行：航路、空域容量与运行风险。',
    sections: {
      terminology: [
        { term: '航路', definition: '经审批或规划的低空飞行路径描述。' },
        { term: '容量', definition: '空域或起降点在时段内可承载的运行架次。' }
      ],
      constraints: [
        '高度与速度约束需与空域网格或禁飞区一致。',
        '多机冲突检测需显式输出解脱建议或告警。'
      ],
      workflowHints: ['先静态航路再动态冲突消解', '与监视数据时间对齐'],
      complianceNotes: ['遵循低空运行与噪声相关监管要求']
    }
  },
  ecommerce: {
    version: '1.0.0',
    schemaVersion: '1',
    domain: 'ecommerce',
    source: 'builtin',
    summary: '跨境电商：清关、物流与多语言客服协同。',
    sections: {
      terminology: [
        { term: 'HS 编码', definition: '商品归类编码，影响税率与禁限控。' },
        { term: 'SLA', definition: '对履约时效与客户响应的服务等级约定。' }
      ],
      constraints: [
        '价格与税费展示需区分站点与币种。',
        '用户与交易数据跨境传输需符合目的地法规。'
      ],
      workflowHints: ['订单状态机与物流事件对齐', '退换货与客服工单可追溯'],
      complianceNotes: ['消费者保护、广告与个人信息保护合规']
    }
  },
  homeAI: {
    version: '1.0.0',
    schemaVersion: '1',
    domain: 'homeAI',
    source: 'builtin',
    summary: '家庭陪伴：多模态交互、家居控制与儿童/老人场景。',
    sections: {
      terminology: [
        { term: '场景', definition: '由时间、成员与设备状态刻画的家庭上下文。' },
        { term: '技能', definition: '可被语音或 App 触发的原子家居或内容能力。' }
      ],
      constraints: [
        '对儿童与老人相关建议需保守并支持人工确认。',
        '本地与云端推理边界需可配置，敏感数据优先本地处理。'
      ],
      workflowHints: ['先意图识别再设备控制', '异常行为联动通知监护人'],
      complianceNotes: ['家庭影像与语音属高敏感数据，需明示同意与留存策略']
    }
  },
  aml: {
    version: '1.0.0',
    schemaVersion: '1',
    domain: 'aml',
    source: 'builtin',
    summary: '跨境支付监测：交易筛查、名单与案例管理。',
    sections: {
      terminology: [
        { term: '可疑交易', definition: '需结合规则与模型评分进入复核队列的交易。' },
        { term: '名单', definition: '制裁、PEP 等外部或内部维护的实体清单。' }
      ],
      constraints: [
        '模型与规则输出需可审计，保留决策依据摘要。',
        '误报与漏报权衡需可配置并与业务 KPI 对齐。'
      ],
      workflowHints: ['先名单与规则命中再模型排序', '案例闭环需留痕'],
      complianceNotes: ['反洗钱与制裁合规要求因法域而异，需对接权威名单源']
    }
  }
}

/** 合并领域知识片段（如父组件传入覆盖项），供扩展与单页实验使用 */
export function mergeSimulationDomainKnowledge(base, patch) {
  if (!base) return patch ? JSON.parse(JSON.stringify(patch)) : {}
  if (!patch) return JSON.parse(JSON.stringify(base))
  return deepMerge(JSON.parse(JSON.stringify(base)), patch)
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== 'object') return base
  const out = Array.isArray(base) ? [...base] : { ...base }
  Object.keys(patch).forEach((k) => {
    const pv = patch[k]
    const bv = out[k]
    if (pv && typeof pv === 'object' && !Array.isArray(pv) && bv && typeof bv === 'object' && !Array.isArray(bv)) {
      out[k] = deepMerge(bv, pv)
    } else {
      out[k] = pv
    }
  })
  return out
}

function normalizeDomainId(domain) {
  const d = (domain && String(domain).trim()) || 'generic'
  return BUILTIN[d] ? d : 'generic'
}

/**
 * @param {string} [domain]
 * @param {{ appId?: string, appName?: string, scenarioDescription?: string, serviceNames?: string[], mode?: string }} [context]
 * @returns {object}
 */
export function getSimulationDomainKnowledge(domain, context = {}) {
  const id = normalizeDomainId(domain)
  const base = BUILTIN[id] || BUILTIN.generic
  const baseClone = JSON.parse(JSON.stringify(base))
  let merged = baseClone

  const provider = providers.get(id)
  if (provider) {
    const extra = provider(context) || {}
    merged = deepMerge(baseClone, extra)
  }

  merged.meta = {
    resolvedDomain: id,
    requestedDomain: domain || 'generic',
    appId: context.appId,
    appName: context.appName,
    mode: context.mode,
    serviceCount: Array.isArray(context.serviceNames) ? context.serviceNames.length : undefined
  }

  if (context.scenarioDescription) {
    merged.scenarioContext = {
      excerpt:
        context.scenarioDescription.length > 400
          ? `${context.scenarioDescription.slice(0, 400)}…`
          : context.scenarioDescription
    }
  }

  return merged
}
