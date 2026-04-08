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
