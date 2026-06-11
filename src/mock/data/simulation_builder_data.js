/**
 * ============================================================================
 * simulation_builder 配套数据层（`simulation_builder_data.js`）
 * ============================================================================
 *
 * 对应组件：`src/components/ef/simulation_builder.vue`
 *
 * 【与进程内模拟器的关系】
 * `src/mock/services/simulation_builder_inmemory.js` 按时间顺序推进一次构建，
 * 在每一步读取本文件中的常量/函数，用来：
 *   - 决定「等多久」（SIMULATION_BUILD_DELAYS_MS）
 *   - （保留）SIMULATION_BUILD_PROB / simulationBuildComputeFailBias：供实验或未来脚本复现随机路径；当前进程内模拟器已不做随机失败
 *   - 决定「日志/进度条展示什么文案」（ENV / GEN 任务列表、ISSUE 模板）
 *   - 决定「研究模式结束时指标数量级」（SIMULATION_BUILD_METRIC_RANGES、simulationBuildModuleMetrics）
 *
 * 【调整实验行为时建议】
 *   - 只改「节奏」→ 改 SIMULATION_BUILD_DELAYS_MS
 *   - 只改「成功率/迭代次数观感」→ 改 SIMULATION_BUILD_PROB、failBias 相关系数
 *   - 只改「失败原因文案」→ 改 SIMULATION_BUILD_ISSUE_TEMPLATES
 *   - 只改「离线 mock 的领域增强日志/result.enhancements」→ 改 SIMULATION_BUILD_MOCK_ENHANCEMENTS
 *   - 不要在本文件引用 Vue / DOM
 *
 * 【命名前缀】SIMULATION_BUILD_*：与仿真构建领域字段一致，避免与其它 mock/data 混淆。
 */

// ---------------------------------------------------------------------------
// 策略默认值（与前端研究面板、POST body.strategy 对齐；生产模式请求体可不带 strategy）
// ---------------------------------------------------------------------------
export const SIMULATION_BUILD_DEFAULT_STRATEGY = {
  sandbox: 'cow',
  planning: 'llm_autonomous',
  verification: 'multi_agent',
  repair: 'llm_repair',
  solidify: 'golden_trace'
}

/** 与主步骤条文案一致；当前由 inmemory 里硬编码 step name，本数组供扩展或文档同步 */
export const SIMULATION_BUILD_STEP_NAMES = [
  '服务匹配',
  '环境准备',
  '智能构建',
  '方案生成'
]

// ---------------------------------------------------------------------------
// 步骤 1「环境准备」：与前端 envSetupItems 一一对应；顺序即 emit progress 的顺序
// ---------------------------------------------------------------------------
export const SIMULATION_BUILD_ENV_TASKS = [
  '初始化沙箱环境',
  '配置写操作拦截',
  '加载拟真数据集'
]

// ---------------------------------------------------------------------------
// 步骤 4「方案生成」：与前端 generationItems 一一对应
// ---------------------------------------------------------------------------
export const SIMULATION_BUILD_GEN_TASKS = [
  '存储执行方案',
  '生成配置文件',
  '保存验证报告'
]

// ---------------------------------------------------------------------------
// 智能构建循环内「链路检视」阶段：随机抽一条作为 issue（类型+文案+修复说明）
// 智能终止逻辑：连续多轮抽到「同一 fingerprint」（type|message）→ 认为无法自动修复
// ---------------------------------------------------------------------------
export const SIMULATION_BUILD_ISSUE_TEMPLATES = [
  { type: 'format', message: '数据格式偏差', fix: '添加数据适配器' },
  { type: 'type', message: '参数类型不匹配', fix: '自动类型转换' },
  { type: 'schema', message: '响应结构不一致', fix: '标准化响应处理' },
  { type: 'redundant', message: '冗余调用检测', fix: '优化调用链路' }
]

// ---------------------------------------------------------------------------
// 时间模拟：全部为 [min,max] 毫秒闭区间上的均匀随机，用于「看起来像异步」
// 不参与业务判定，只影响 UI 刷新节奏
// ---------------------------------------------------------------------------
export const SIMULATION_BUILD_DELAYS_MS = {
  /** 每检测一个 MCP 服务之间的间隔 */
  serviceCheck: [350, 600],
  /** 环境准备每一项 */
  envItem: [500, 700],
  /** 数据仿真 / 逻辑仿真 / 链路检视 每一小段 */
  phase: [550, 900],
  /** 发现 issue 后「自动修复」停顿 */
  issueFix: [400, 600],
  /** 方案生成每一项 */
  genItem: [450, 650],
  /** 研究模式下连续多条 metrics 事件之间的间隔（可改为 [0,0] 瞬间打完） */
  metricsTick: [80, 80]
}

// ---------------------------------------------------------------------------
// 概率与阈值（0~1）
//
// 【服务离线】对每个服务独立抽样：random < serviceOffline → 该服务 error（见 inmemory）
// 【issue 抽样】在「链路检视」末尾：random < failBias → 本迭代失败并进入修复/下一轮
//   failBias 由 simulationBuildComputeFailBias(strategy, iteration) 给出，随迭代递减
// 【智能终止】同一 issue 指纹连续出现 smartTerminateSameIssues 次 → complete 失败
// ---------------------------------------------------------------------------
export const SIMULATION_BUILD_PROB = {
  serviceOffline: 0.06,
  failBiasPreset: 0.5,
  failBiasLlm: 0.65,
  issueDecayPerIteration: 0.12,
  smartTerminateSameIssues: 3
}

// ---------------------------------------------------------------------------
// 研究模式 complete.metrics 中部分字段的随机范围（仅演示用）
// ---------------------------------------------------------------------------
export const SIMULATION_BUILD_METRIC_RANGES = {
  sandboxFidelity: [0.78, 0.96],
  verificationAccuracy: [0.82, 0.97],
  repairEffectiveness: [0.75, 0.95]
}

// ---------------------------------------------------------------------------
// 进程内 mock 专用：三阶段「领域增强」文案（形状对齐已弃用的 enhanceForStage 返回值）
// 仅 simulation_builder_inmemory.js 使用；与真链路 Micro-Agent Skill 无关。
// stageId：scenarioParsing | planning | verification
// ---------------------------------------------------------------------------

const _MOCK_KNOWN_DOMAINS = new Set([
  'generic',
  'aml',
  'aircraft',
  'health',
  'agriculture',
  'ecommerce',
  'homeAI',
  'evtol'
])

/** @param {string} [domain] */
export function simulationBuildNormalizeMockDomain(domain) {
  const d = (domain && String(domain).trim()) || 'generic'
  return _MOCK_KNOWN_DOMAINS.has(d) ? d : 'generic'
}

/** 三阶段 stageId，供 inmemory 引用，避免依赖 @/components */
export const SIMULATION_BUILD_MOCK_STAGE = {
  scenarioParsing: 'scenarioParsing',
  planning: 'planning',
  verification: 'verification'
}

/**
 * @type {Record<string, Record<'scenarioParsing'|'planning'|'verification', string>>}
 */
export const SIMULATION_BUILD_MOCK_ENHANCEMENTS = {
  generic: {
    scenarioParsing:
      '【领域摘要】通用元应用编排：强调服务契约、数据流与可观测性。术语：元应用、链路检视。约束：接口稳定；跨服务数据可序列化且体积可控。',
    planning:
      '编排建议：先澄清输入输出与失败语义再定序；关键路径保留日志与可重试边界。术语速查：元应用、链路检视。',
    verification:
      '校验：接口契约与数据形态一致。合规：按部署环境补充行业要求。术语参照：元应用、链路检视。'
  },
  aml: {
    scenarioParsing:
      '【领域摘要】跨境支付监测：交易筛查、名单与案例。术语：可疑交易、名单。约束：输出可审计；误报漏报可配置。',
    planning:
      '编排建议：先名单与规则命中再模型排序；案例闭环留痕。约束：模型与规则需可审计。',
    verification:
      '校验：决策依据可追溯。合规：反洗钱与制裁要求因法域而异，需对接权威名单源。'
  },
  aircraft: {
    scenarioParsing:
      '【领域摘要】无人飞机监控：态势、航线与告警。术语：态势、告警。约束：时空数据统一坐标系与时间戳；仿真与实飞边界（如适用）。',
    planning:
      '编排建议：先接入遥测与视频/点云再推理；关键告警追踪到传感器源。',
    verification:
      '校验：时空上下文完整。合规：空域与隐私法规处理影像与轨迹。'
  },
  health: {
    scenarioParsing:
      '【领域摘要】乡村医疗：问诊辅助、转诊与慢病随访。术语：分诊、随访。约束：不替代执业诊断；患者信息最小化与脱敏。',
    planning:
      '编排建议：优先结构化主诉与生命体征；转诊路径可解释。',
    verification:
      '校验：免责声明与不确定性说明。合规：医疗数据安全与隐私规范。'
  },
  agriculture: {
    scenarioParsing:
      '【领域摘要】农业数智：墒情、虫害与灌溉施肥决策。术语：墒情、处方图。约束：数据标注时间站点；农艺建议符合当地规范。',
    planning:
      '编排建议：先数据质检再推理；输出对接农机或执行系统。',
    verification:
      '校验：时空与地块标注一致。合规：农资与环保法规因地可配置。'
  },
  ecommerce: {
    scenarioParsing:
      '【领域摘要】跨境电商：清关、物流与多语言客服。术语：HS 编码、SLA。约束：价格税费分站点币种；跨境传输符合目的地法规。',
    planning:
      '编排建议：订单状态机与物流事件对齐；退换货与工单可追溯。',
    verification:
      '校验：税费与币种展示一致。合规：消费者保护与个人信息保护。'
  },
  homeAI: {
    scenarioParsing:
      '【领域摘要】家庭陪伴：多模态交互、家居控制与一老一小场景。术语：场景、技能。约束：儿老建议保守且可人工确认；敏感数据优先本地。',
    planning:
      '编排建议：先意图识别再设备控制；异常联动通知监护人。',
    verification:
      '校验：本地与云端边界可配置。合规：影像与语音明示同意与留存策略。'
  },
  evtol: {
    scenarioParsing:
      '【领域摘要】低空飞行：航路、空域容量与运行风险。术语：航路、容量。约束：高度速度与禁飞区一致；多机冲突显式解脱或告警。',
    planning:
      '编排建议：先静态航路再动态冲突消解；与监视数据时间对齐。',
    verification:
      '校验：航路与容量约束与监视数据一致。合规：低空运行与噪声监管。'
  }
}

/**
 * @param {string} domain
 * @param {'scenarioParsing'|'planning'|'verification'} stageId
 * @returns {{ stage: string, promptFragment: string, sections: Record<string, never> }}
 */
export function simulationBuildMockEnhancementRecord(domain, stageId) {
  const id = simulationBuildNormalizeMockDomain(domain)
  const row = SIMULATION_BUILD_MOCK_ENHANCEMENTS[id] || SIMULATION_BUILD_MOCK_ENHANCEMENTS.generic
  const fallback = SIMULATION_BUILD_MOCK_ENHANCEMENTS.generic
  const promptFragment = row[stageId] || fallback[stageId] || '（mock 无增强文案）'
  return {
    stage: stageId,
    promptFragment,
    sections: {}
  }
}

export function simulationBuildRandomBetween(min, max) {
  return min + Math.random() * (max - min)
}

export function simulationBuildRandomIntBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/**
 * 计算当前迭代在「链路检视」后是否倾向于产生 issue 的概率基准。
 * iteration 从 1 开始；越大则 failBias 越小。
 */
export function simulationBuildComputeFailBias(strategy, iteration) {
  const base =
    strategy.planning === 'preset_workflow'
      ? SIMULATION_BUILD_PROB.failBiasPreset
      : SIMULATION_BUILD_PROB.failBiasLlm
  return base - (iteration - 1) * SIMULATION_BUILD_PROB.issueDecayPerIteration
}

export function simulationBuildSampleIssueTemplate(
  templates = SIMULATION_BUILD_ISSUE_TEMPLATES
) {
  return templates[Math.floor(Math.random() * templates.length)]
}

/**
 * 构造一次成功构建结束时的 metrics 快照（与 §7 complete.metrics 字段对齐）
 */
export function simulationBuildModuleMetrics(iteration, elapsedMs) {
  const { sandboxFidelity, verificationAccuracy, repairEffectiveness } =
    SIMULATION_BUILD_METRIC_RANGES
  return {
    iterations: iteration,
    elapsedMs,
    sandboxFidelity: simulationBuildRandomBetween(
      sandboxFidelity[0],
      sandboxFidelity[1]
    ),
    planningAccuracy: iteration === 1 ? 1 : 0.4 + 0.5 / iteration,
    verificationAccuracy: simulationBuildRandomBetween(
      verificationAccuracy[0],
      verificationAccuracy[1]
    ),
    repairEffectiveness:
      iteration > 1
        ? simulationBuildRandomBetween(
            repairEffectiveness[0],
            repairEffectiveness[1]
          )
        : 1
  }
}

// ---------------------------------------------------------------------------
// 兼容旧导出名（别名）
// ---------------------------------------------------------------------------
export const SIMULATION_DEFAULT_STRATEGY = SIMULATION_BUILD_DEFAULT_STRATEGY
export const SIMULATION_STEP_NAMES = SIMULATION_BUILD_STEP_NAMES
export const SIMULATION_ENV_TASKS = SIMULATION_BUILD_ENV_TASKS
export const SIMULATION_GEN_TASKS = SIMULATION_BUILD_GEN_TASKS
export const SIMULATION_ISSUE_TEMPLATES = SIMULATION_BUILD_ISSUE_TEMPLATES
export const SIMULATION_DELAYS_MS = SIMULATION_BUILD_DELAYS_MS
export const SIMULATION_PROB = SIMULATION_BUILD_PROB
export const SIMULATION_METRIC_RANGES = SIMULATION_BUILD_METRIC_RANGES
export const randomBetween = simulationBuildRandomBetween
export const randomIntBetween = simulationBuildRandomIntBetween
export const computeFailBias = simulationBuildComputeFailBias
export const sampleIssueTemplate = simulationBuildSampleIssueTemplate
export const buildModuleMetrics = simulationBuildModuleMetrics
