<template>
  <div class="simulation-inline-root">
    <div class="simulation-container">
      <!-- 顶部：整体流程步骤条（含「准备」） -->
      <div class="main-steps main-steps-five">
        <div
          v-for="(step, index) in mainSteps"
          :key="step.key"
          class="main-step"
          :class="{
            done: index < stepBarIndex,
            active: index === stepBarIndex,
            pending: index > stepBarIndex
          }"
        >
          <div class="step-dot">
            <a-icon v-if="index < stepBarIndex" type="check" />
            <a-icon
              v-else-if="index === stepBarIndex && isRunning && index > 0"
              type="loading"
            />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step.title }}</span>
        </div>
      </div>

      <div class="simulation-scroll">
        <!-- 内容区域 -->
        <div class="content-area">
          <!-- 准备：说明 + 生产/研究 + 策略（模块化插拔，仅研究展示） -->
          <template v-if="showPreStart">
            <div class="pre-start-panel">
              <div class="pre-start-title">准备就绪</div>
              <p class="pre-start-lead">
                系统将在安全仿真环境中，自动完成以下四步：
              </p>
              <ul class="pre-start-list">
                <li><strong>服务匹配</strong> — 确认各项服务可用</li>
                <li><strong>环境准备</strong> — 搭建安全的仿真环境</li>
                <li><strong>智能构建</strong> — 自动编排、验证并优化服务调度方案</li>
                <li><strong>方案生成</strong> — 输出可直接预览和发布的应用配置</li>
              </ul>

              <div class="pre-start-services" v-if="serviceStatuses.length">
                <span class="path-label">将参与检测的服务（{{ serviceStatuses.length }}）</span>
                <div class="pre-service-chips">
                  <a-tag v-for="s in serviceStatuses" :key="s.id">{{ s.name }}</a-tag>
                </div>
              </div>
              <div v-else class="pre-start-warn">
                <a-icon type="warning" /> 请先在画布上添加至少一个服务节点。
              </div>

              <div v-if="domainHint" class="pre-start-domain-hint">
                <a-icon type="bulb" /> {{ domainHint }}
              </div>

              <div class="pre-start-config">
                <div class="toolbar-row">
                  <span class="toolbar-label">研究模式</span>
                  <a-switch
                    :checked="internalMode === 'research'"
                    size="small"
                    @change="(val) => { internalMode = val ? 'research' : 'production' }"
                  />
                </div>

                <template v-if="internalMode === 'research'">
                  <div class="toolbar-row scenario-row">
                    <span class="toolbar-label">场景描述</span>
                    <a-input
                      v-model="scenarioDraft"
                      size="small"
                      placeholder="可选：用一句话描述你的业务场景"
                    />
                  </div>
                  <div class="research-strategy-panel">
                    <div class="strategy-grid">
                      <div class="strategy-field">
                        <span>M1 沙箱</span>
                        <a-select v-model="strategy.sandbox" size="small" style="width: 100%">
                          <a-select-option value="cow">CoW</a-select-option>
                          <a-select-option value="none">无沙箱</a-select-option>
                          <a-select-option value="full_mock">全模拟</a-select-option>
                        </a-select>
                      </div>
                      <div class="strategy-field">
                        <span>M2 规划</span>
                        <a-select v-model="strategy.planning" size="small" style="width: 100%">
                          <a-select-option value="llm_autonomous">LLM 自主</a-select-option>
                          <a-select-option value="preset_workflow">预设流程</a-select-option>
                        </a-select>
                      </div>
                      <div class="strategy-field">
                        <span>M3 验证</span>
                        <a-select v-model="strategy.verification" size="small" style="width: 100%">
                          <a-select-option value="multi_agent">多 Agent</a-select-option>
                          <a-select-option value="single_agent">单 Agent</a-select-option>
                          <a-select-option value="rule_based">规则</a-select-option>
                        </a-select>
                      </div>
                      <div class="strategy-field">
                        <span>M4 修复</span>
                        <a-select v-model="strategy.repair" size="small" style="width: 100%">
                          <a-select-option value="llm_repair">LLM</a-select-option>
                          <a-select-option value="rule_repair">规则</a-select-option>
                          <a-select-option value="none">禁用</a-select-option>
                        </a-select>
                      </div>
                      <div class="strategy-field">
                        <span>M5 固化</span>
                        <a-select v-model="strategy.solidify" size="small" style="width: 100%">
                          <a-select-option value="golden_trace">经验固化</a-select-option>
                          <a-select-option value="replan">重规划</a-select-option>
                          <a-select-option value="static">静态</a-select-option>
                        </a-select>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>

          <!-- 运行中：步骤1-服务匹配 -->
          <template v-else-if="hasStarted && currentMainStep === 0 && isRunning">
            <div class="step-content">
              <div class="step-title">服务匹配</div>
              <div class="step-desc">正在检查服务状态...</div>
              <div class="service-check-list">
                <div
                  v-for="service in serviceStatuses"
                  :key="service.id"
                  class="service-check-item"
                  :class="'status-' + service.status"
                >
                  <span class="service-name">{{ service.name }}</span>
                  <span class="service-status">
                    <a-icon v-if="service.status === 'checking'" type="loading" spin />
                    <a-icon v-else-if="service.status === 'online'" type="check-circle" theme="filled" />
                    <a-icon v-else-if="service.status === 'error'" type="close-circle" theme="filled" />
                    <a-icon v-else type="minus-circle" />
                    {{ service.statusText }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <!-- 运行中：步骤2-环境准备 -->
          <template v-else-if="hasStarted && currentMainStep === 1 && isRunning">
            <div class="step-content">
              <div class="step-title">环境准备</div>
              <div class="step-desc">正在准备仿真环境...</div>
              <div class="env-setup-list">
                <div
                  v-for="(item, index) in envSetupItems"
                  :key="index"
                  class="env-setup-item"
                  :class="{ done: item.done, active: item.active }"
                >
                  <a-icon v-if="item.done" type="check-circle" theme="filled" />
                  <a-icon v-else-if="item.active" type="loading" spin />
                  <a-icon v-else type="minus-circle" />
                  <span>{{ item.text }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 运行中：步骤3-智能构建（核心循环） -->
          <template v-else-if="hasStarted && currentMainStep === 2 && isRunning">
            <div class="step-content simulation-phase">
              <div class="step-title">
                智能构建 · 第 {{ currentIteration }} 轮
                <span class="iteration-hint" v-if="currentIteration > 1">持续优化中</span>
              </div>

              <!-- 调度执行框 -->
              <div class="dispatch-box">
                <div class="dispatch-header">
                  <a-icon type="robot" />
                  <span>{{ dispatchStatus }}</span>
                </div>

                <!-- 三阶段进度 -->
                <div class="phase-progress">
                  <div
                    class="phase-item"
                    :class="{ done: phases.data === 'done', active: phases.data === 'running' }"
                  >
                    <div class="phase-icon">
                      <a-icon v-if="phases.data === 'done'" type="check" />
                      <a-icon v-else-if="phases.data === 'running'" type="loading" />
                      <span v-else>1</span>
                    </div>
                    <span class="phase-label">数据仿真</span>
                  </div>
                  <div class="phase-connector"></div>
                  <div
                    class="phase-item"
                    :class="{ done: phases.logic === 'done', active: phases.logic === 'running' }"
                  >
                    <div class="phase-icon">
                      <a-icon v-if="phases.logic === 'done'" type="check" />
                      <a-icon v-else-if="phases.logic === 'running'" type="loading" />
                      <span v-else>2</span>
                    </div>
                    <span class="phase-label">逻辑仿真</span>
                  </div>
                  <div class="phase-connector"></div>
                  <div
                    class="phase-item"
                    :class="{ done: phases.check === 'done', active: phases.check === 'running' }"
                  >
                    <div class="phase-icon">
                      <a-icon v-if="phases.check === 'done'" type="check" />
                      <a-icon v-else-if="phases.check === 'running'" type="loading" />
                      <span v-else>3</span>
                    </div>
                    <span class="phase-label">链路检视</span>
                  </div>
                </div>

                <!-- 当前状态 -->
                <div class="current-action">{{ currentActionText }}</div>
              </div>

              <!-- 简洁历史 -->
              <div class="iteration-history" v-if="iterationHistory.length > 0">
                <div class="history-title">历史</div>
                <div class="history-list">
                  <div
                    v-for="item in iterationHistory"
                    :key="item.iteration"
                    class="history-item"
                    :class="{ current: !item.completed }"
                  >
                    <a-icon
                      v-if="item.completed && item.success"
                      type="check-circle"
                      theme="filled"
                      class="icon-success"
                    />
                    <a-icon
                      v-else-if="item.completed && !item.success"
                      type="info-circle"
                      theme="filled"
                      class="icon-warning"
                    />
                    <a-icon v-else type="loading" class="icon-loading" />
                    <span class="history-label">第{{ item.iteration }}轮</span>
                    <span class="history-summary">{{ item.summary }}</span>
                  </div>
                </div>
              </div>

              <!-- 提示 -->
              <div class="auto-fix-hint">
                <a-icon type="bulb" theme="filled" />
                发现偏差时系统会自动修复并重试
              </div>
            </div>
          </template>

          <!-- 运行中：步骤4-方案生成 -->
          <template v-else-if="hasStarted && currentMainStep === 3 && isRunning">
            <div class="step-content">
              <div class="step-title">方案生成</div>
              <div class="step-desc">正在生成元应用方案...</div>
              <div class="generation-list">
                <div
                  v-for="(item, index) in generationItems"
                  :key="index"
                  class="generation-item"
                  :class="{ done: item.done, active: item.active }"
                >
                  <a-icon v-if="item.done" type="check-circle" theme="filled" />
                  <a-icon v-else-if="item.active" type="loading" spin />
                  <a-icon v-else type="minus-circle" />
                  <span>{{ item.text }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 完成状态：成功 -->
          <template v-else-if="isCompleted && !hasFailed">
            <div class="result-content success">
              <div class="result-icon">
                <a-icon type="check-circle" theme="filled" />
              </div>
              <div class="result-title">仿真构建成功</div>
              <div class="result-subtitle">经过 {{ totalIterations }} 轮优化，已生成稳定的执行方案</div>

              <div class="stats-row">
                <div class="stat-item">
                  <div class="stat-value">{{ connectedServicesCount }}</div>
                  <div class="stat-label">服务已连接</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ totalIterations }}</div>
                  <div class="stat-label">优化轮次</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ formattedElapsedTime }}</div>
                  <div class="stat-label">构建耗时</div>
                </div>
              </div>

              <div v-if="internalMode === 'research'" class="strategy-summary">
                <div class="path-label">策略摘要</div>
                <div class="strategy-tags">
                  <a-tag v-for="(v, k) in strategy" :key="k">{{ strategyLabel(k, v) }}</a-tag>
                </div>
              </div>

              <div v-if="internalMode === 'research' && resultEnhancements.length" class="strategy-summary">
                <div class="path-label">领域知识增强</div>
                <div class="strategy-tags">
                  <a-tag v-for="en in resultEnhancements" :key="en.stage" color="blue">
                    {{ enhancementStageLabel(en.stage) }} ✓
                  </a-tag>
                </div>
              </div>

              <div v-if="internalMode === 'research' && hasModuleMetrics" class="research-metrics">
                <div class="path-label">模块级指标</div>
                <div class="metrics-grid">
                  <div v-if="finalMetrics.sandboxFidelity != null" class="metric-cell">
                    <span class="m-v">{{ formatPct(finalMetrics.sandboxFidelity) }}</span>
                    <span class="m-l">沙箱保真度</span>
                  </div>
                  <div v-if="finalMetrics.planningAccuracy != null" class="metric-cell">
                    <span class="m-v">{{ formatPct(finalMetrics.planningAccuracy) }}</span>
                    <span class="m-l">规划合理率</span>
                  </div>
                  <div v-if="finalMetrics.verificationAccuracy != null" class="metric-cell">
                    <span class="m-v">{{ formatPct(finalMetrics.verificationAccuracy) }}</span>
                    <span class="m-l">验证准确率</span>
                  </div>
                  <div v-if="finalMetrics.repairEffectiveness != null" class="metric-cell">
                    <span class="m-v">{{ formatPct(finalMetrics.repairEffectiveness) }}</span>
                    <span class="m-l">修复有效率</span>
                  </div>
                </div>
              </div>

              <div v-if="executionPath.length" class="execution-path">
                <div class="path-label">执行路径</div>
                <div class="path-nodes">
                  <span v-for="(node, index) in executionPath" :key="index" class="path-node">
                    {{ node }}
                    <a-icon v-if="index < executionPath.length - 1" type="arrow-right" class="path-arrow" />
                  </span>
                </div>
              </div>

              <div v-if="internalMode === 'research'" class="research-actions">
                <a-button size="small" @click="openCompareModal">实验记录对比</a-button>
              </div>
            </div>
          </template>

          <!-- 完成状态：失败 -->
          <template v-else-if="isCompleted && hasFailed">
            <div class="result-content failed">
              <div class="result-icon">
                <a-icon type="close-circle" theme="filled" />
              </div>
              <div class="result-title">构建失败</div>
              <div class="result-subtitle">经过 {{ totalIterations }} 轮尝试，仍存在以下问题</div>

              <div class="error-box">
                <div class="error-icon">
                  <a-icon type="warning" theme="filled" />
                </div>
                <div class="error-content">
                  <div class="error-message">{{ failureMessage }}</div>
                  <div class="error-suggestion" v-if="failureSuggestion">
                    {{ failureSuggestion }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 技术详情（构建开始后才显示） -->
        <div class="tech-toggle" v-if="hasStarted">
          <a-button type="link" size="small" @click="showTechDetails = !showTechDetails">
            <a-icon :type="showTechDetails ? 'up' : 'down'" />
            {{ showTechDetails ? '收起详情' : '查看详情' }}
          </a-button>
        </div>

        <transition name="slide-fade">
          <div class="tech-details" v-if="hasStarted && showTechDetails">
            <!-- 轮次详情 -->
            <div class="detail-section" v-if="iterationDetails.length > 0">
              <div class="detail-title">轮次详情</div>
              <div class="iteration-details">
                <div
                  v-for="iter in iterationDetails"
                  :key="iter.iteration"
                  class="iter-detail-item"
                >
                  <div class="iter-header">
                    <span class="iter-num">第{{ iter.iteration }}轮</span>
                    <a-tag v-if="iter.success" color="green">通过</a-tag>
                    <a-tag v-else-if="iter.completed" color="orange">需优化</a-tag>
                    <a-tag v-else color="blue">进行中</a-tag>
                  </div>
                  <div class="iter-phases">
                    <div class="iter-phase" :class="{ done: iter.dataPhase === 'done' }">
                      <a-icon :type="iter.dataPhase === 'done' ? 'check-circle' : 'minus-circle'" />
                      数据仿真
                    </div>
                    <div class="iter-phase" :class="{ done: iter.logicPhase === 'done' }">
                      <a-icon :type="iter.logicPhase === 'done' ? 'check-circle' : 'minus-circle'" />
                      逻辑仿真
                    </div>
                    <div class="iter-phase" :class="{ done: iter.checkPhase === 'done', warning: iter.hasIssue }">
                      <a-icon :type="iter.checkPhase === 'done' ? (iter.hasIssue ? 'warning' : 'check-circle') : 'minus-circle'" />
                      链路检视
                    </div>
                  </div>
                  <div class="iter-issue" v-if="iter.issue">
                    <span class="issue-label">问题：</span>{{ iter.issue }}
                  </div>
                  <div class="iter-fix" v-if="iter.fix">
                    <span class="fix-label">修复：</span>{{ iter.fix }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 服务状态 -->
            <div class="detail-section">
              <div class="detail-title">服务状态</div>
              <div class="service-detail-list">
                <div
                  v-for="service in serviceStatuses"
                  :key="service.id"
                  class="service-detail-item"
                >
                  <span class="service-name">{{ service.name }}</span>
                  <span class="service-status" :class="'status-' + service.status">
                    <a-icon v-if="service.status === 'online'" type="check-circle" theme="filled" />
                    <a-icon v-else-if="service.status === 'error'" type="close-circle" theme="filled" />
                    <a-icon v-else type="minus-circle" />
                    {{ service.statusText }}
                    <span v-if="service.latency" class="latency">({{ service.latency }}ms)</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- 运行日志 -->
            <div class="detail-section">
              <div class="detail-title">
                运行日志
                <a-button type="link" size="small" @click="clearLogs" class="clear-btn">清空</a-button>
              </div>
              <div class="logs-container" ref="logsContainer">
                <div
                  v-for="(log, index) in logs"
                  :key="index"
                  class="log-line"
                  :class="log.type"
                >
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-level">[{{ log.level }}]</span>
                  <span class="log-msg">{{ log.message }}</span>
                </div>
                <div v-if="logs.length === 0" class="logs-empty">暂无日志</div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 底部按钮 -->
      <div class="footer-buttons">
        <template v-if="showPreStart">
          <a-button @click="handleClose">返回编辑</a-button>
          <a-button
            type="primary"
            icon="play-circle"
            :disabled="!serviceStatuses.length"
            @click="confirmStartBuild"
          >
            开始仿真构建
          </a-button>
        </template>

        <template v-else-if="isRunning">
          <a-button @click="handleCancel">取消构建</a-button>
        </template>

        <template v-else-if="isCompleted && hasFailed">
          <a-button @click="handleClose">返回编辑</a-button>
          <a-button type="primary" @click="retrySimulation">重新构建</a-button>
        </template>

        <template v-else-if="isCompleted && !hasFailed">
          <a-button @click="handleClose">返回编辑</a-button>
          <a-button type="primary" icon="rocket" @click="handlePrePublish">
            元应用预览与发布
          </a-button>
        </template>
      </div>
    </div>

    <a-modal
      :visible="compareModalVisible"
      title="实验记录对比"
      width="720px"
      :footer="null"
      :destroy-on-close="true"
      :get-container="compareModalGetContainer"
      @cancel="compareModalVisible = false"
    >
      <a-spin :spinning="compareLoading">
        <div class="compare-toolbar">
          <a-button type="primary" size="small" :disabled="compareSelectedIds.length < 2" @click="runCompare">
            对比选中
          </a-button>
          <a-button size="small" @click="loadRecordList">刷新列表</a-button>
        </div>
        <a-checkbox-group v-model="compareSelectedIds" class="compare-check-group">
          <div v-for="r in recordList" :key="r.recordId" class="compare-row">
            <a-checkbox :value="r.recordId">
              {{ r.createdAt }} · {{ r.success ? '成功' : '失败' }} · 轮次 {{ (r.metrics && r.metrics.iterations) || 0 }}
            </a-checkbox>
          </div>
        </a-checkbox-group>
        <div v-if="!recordList.length" class="compare-empty">暂无记录，请先完成至少一次研究模式构建</div>

        <div v-if="compareResultRows.length" class="compare-table-wrap">
          <table class="compare-table">
            <thead>
              <tr>
                <th>记录</th>
                <th>沙箱</th>
                <th>规划</th>
                <th>验证</th>
                <th>修复</th>
                <th>固化</th>
                <th>迭代</th>
                <th>耗时(ms)</th>
                <th>保真度</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in compareResultRows" :key="row.recordId">
                <td>{{ row.recordId.slice(-8) }}</td>
                <td>{{ row.strategy && row.strategy.sandbox }}</td>
                <td>{{ row.strategy && row.strategy.planning }}</td>
                <td>{{ row.strategy && row.strategy.verification }}</td>
                <td>{{ row.strategy && row.strategy.repair }}</td>
                <td>{{ row.strategy && row.strategy.solidify }}</td>
                <td>{{ row.metrics && row.metrics.iterations }}</td>
                <td>{{ row.metrics && row.metrics.elapsedMs }}</td>
                <td>{{ formatPct(row.metrics && row.metrics.sandboxFidelity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
import {
  startSimulation,
  cancelSimulation,
  subscribeSimulationStream,
  fetchSimulationRecords,
  compareSimulationRecords
} from '@/api/simulation_builder'
import {
  SIMULATION_BUILD_ENV_TASKS,
  SIMULATION_BUILD_GEN_TASKS,
  SIMULATION_BUILD_DEFAULT_STRATEGY
} from '@/mock/data/simulation_builder_data'
import { getKnowledge } from '@/domain'
import {
  resolveScheduleDemoKind,
  SCHEDULE_DEMO_KIND
} from '@/config/scheduleDemo'

function mapSetupItems(tasks) {
  return tasks.map((text) => ({ text, done: false, active: false }))
}

/** 开发：fdueblab mcp-proxy → 本机同端口（需 .env 中 VUE_APP_LOCAL_MCP_REWRITE=true） */
function rewriteMcpUrlForLocalDev(url) {
  if (process.env.VUE_APP_LOCAL_MCP_REWRITE !== 'true' || !url) return url
  const m = String(url).match(/^https?:\/\/fdueblab\.cn\/mcp-proxy\/(\d+)(\/.*)?$/i)
  if (!m) return url
  return `http://127.0.0.1:${m[1]}${m[2] || '/sse'}`
}

export default {
  name: 'SimulationBuilder',
  props: {
    serviceNodes: {
      type: Array,
      default: () => []
    },
    /**
     * 元应用当前展示名称（画布 `data.preName`，含用户在元应用详情中的修改）。
     * 是否含 `TOPIC_DEMO_KEYWORD` 决定仿真走进程内或 HTTP（`@/config/topicDemo`）。
     */
    appName: {
      type: String,
      default: '元应用'
    },
    appId: {
      type: String,
      default: ''
    },
    domain: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: 'production'
    },
    scenarioDescription: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      isRunning: false,
      isCompleted: false,
      hasFailed: false,
      aborted: false,
      showTechDetails: false,
      /** false：准备页可切换生产/研究；true：已点「开始仿真构建」 */
      hasStarted: false,

      internalMode: 'production',
      scenarioDraft: '',
      strategy: { ...SIMULATION_BUILD_DEFAULT_STRATEGY },

      sessionId: null,
      unsubscribeStream: null,

      finalMetrics: {},
      finalResult: null,

      compareModalVisible: false,
      compareLoading: false,
      recordList: [],
      compareSelectedIds: [],
      compareResultRows: [],

      mainSteps: [
        { key: 'prep', title: '准备' },
        { key: 'match', title: '服务匹配' },
        { key: 'env', title: '环境准备' },
        { key: 'simulate', title: '智能构建' },
        { key: 'generate', title: '方案生成' }
      ],
      currentMainStep: 0,

      envSetupItems: mapSetupItems(SIMULATION_BUILD_ENV_TASKS),
      generationItems: mapSetupItems(SIMULATION_BUILD_GEN_TASKS),

      currentIteration: 1,
      maxIterations: 5,
      totalIterations: 0,
      phases: {
        data: 'pending',
        logic: 'pending',
        check: 'pending'
      },
      dispatchStatus: '智能体调度执行中',
      currentActionText: '初始化中...',

      iterationHistory: [],
      iterationDetails: [],

      executionPath: [],

      failureMessage: '',
      failureSuggestion: '',

      serviceStatuses: [],

      logs: [],

      elapsedTime: 0,
      timerInterval: null
    }
  },
  computed: {
    formattedElapsedTime() {
      const minutes = Math.floor(this.elapsedTime / 60)
      const seconds = this.elapsedTime % 60
      if (minutes > 0) {
        return `${minutes}分${seconds}秒`
      }
      return `${seconds}秒`
    },
    connectedServicesCount() {
      return this.serviceStatuses.filter((s) => s.status === 'online').length
    },
    hasModuleMetrics() {
      const m = this.finalMetrics
      return (
        m.sandboxFidelity != null ||
        m.planningAccuracy != null ||
        m.verificationAccuracy != null ||
        m.repairEffectiveness != null
      )
    },
    showPreStart() {
      return !this.hasStarted && !this.isCompleted
    },
    domainHint() {
      const d = this.domain || 'generic'
      if (d === 'generic') return ''
      const dk = getKnowledge(d)
      return dk && dk.summary ? `已识别领域：${dk.summary}` : ''
    },
    resultEnhancements() {
      if (!this.finalResult || !Array.isArray(this.finalResult.enhancements)) return []
      return this.finalResult.enhancements
    },
    /** 步骤条高亮：0=准备，1–4 对应后端 currentMainStep 0–3；完成时视为全部走完 */
    stepBarIndex() {
      if (this.isCompleted) return 5
      if (!this.hasStarted) return 0
      return 1 + this.currentMainStep
    }
  },
  methods: {
    compareModalGetContainer() {
      return document.body
    },
    enhancementStageLabel(stage) {
      const m = { scenarioParsing: '想定解析', planning: '调度规划', verification: '仿真验证' }
      return m[stage] || stage
    },
    strategyLabel(key, value) {
      const labels = {
        sandbox: { cow: 'CoW', none: '无沙箱', full_mock: '全模拟' },
        planning: { llm_autonomous: 'LLM规划', preset_workflow: '预设流' },
        verification: { multi_agent: '多Agent', single_agent: '单Agent', rule_based: '规则' },
        repair: { llm_repair: 'LLM修复', rule_repair: '规则修复', none: '无修复' },
        solidify: { golden_trace: '经验固化', replan: '重规划', static: '静态' }
      }
      const group = labels[key] || {}
      return `${key}: ${group[value] || value}`
    },
    formatPct(v) {
      if (v == null || Number.isNaN(Number(v))) return '—'
      return `${(Number(v) * 100).toFixed(1)}%`
    },

    init(nodes) {
      this.visible = true
      this.internalMode = this.mode === 'research' ? 'research' : 'production'
      this.scenarioDraft = this.scenarioDescription || ''
      this.strategy = { ...SIMULATION_BUILD_DEFAULT_STRATEGY }
      this.resetState()
      this.initServiceStatuses(nodes || this.serviceNodes)
    },

    confirmStartBuild() {
      if (!this.serviceStatuses.length) {
        this.$message.warning('请先在画布上添加至少一个服务节点')
        return
      }
      this.hasStarted = true
      this.syncCanvasVisual({ type: 'build', active: true })
      this.startSimulation()
    },

    resetProgressLists() {
      this.envSetupItems = mapSetupItems(SIMULATION_BUILD_ENV_TASKS)
      this.generationItems = mapSetupItems(SIMULATION_BUILD_GEN_TASKS)
    },

    syncCanvasVisual(payload) {
      this.$emit('canvas-visual', payload)
    },

    resetState() {
      this.syncCanvasVisual({ type: 'clear' })
      this.teardownStream()
      this.sessionId = null
      this.finalMetrics = {}
      this.finalResult = null

      this.hasStarted = false
      this.isRunning = false
      this.isCompleted = false
      this.hasFailed = false
      this.aborted = false
      this.showTechDetails = false
      this.currentMainStep = 0
      this.currentIteration = 1
      this.totalIterations = 0
      this.phases = { data: 'pending', logic: 'pending', check: 'pending' }
      this.dispatchStatus = '智能体调度执行中'
      this.currentActionText = '初始化中...'
      this.iterationHistory = []
      this.iterationDetails = []
      this.executionPath = []
      this.failureMessage = ''
      this.failureSuggestion = ''
      this.logs = []
      this.elapsedTime = 0

      this.resetProgressLists()

      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    teardownStream() {
      if (typeof this.unsubscribeStream === 'function') {
        this.unsubscribeStream()
        this.unsubscribeStream = null
      }
    },

    initServiceStatuses(nodes) {
      this.serviceStatuses = nodes
        .filter((node) => node.name !== 'metaAppAgent')
        .map((node) => ({
          id: node.id,
          name: node.name,
          mcpUrl: node.url || node.mcpUrl || '',
          tools: node.tools || [],
          isFake: !!node.isFake,
          mcpMethod: node.mcpMethod || 'sse',
          mcpCommand: node.mcpCommand || '',
          mcpArgs: node.mcpArgs || [],
          status: 'pending',
          statusText: '等待中',
          latency: null
        }))
    },

    buildSimulationStrategy() {
      const base =
        this.internalMode === 'research' ? { ...this.strategy } : {}
      if (resolveScheduleDemoKind(this.appName) === SCHEDULE_DEMO_KIND.MCP) {
        return { ...base, minIterations: 2 }
      }
      return Object.keys(base).length ? base : undefined
    },

    buildStartPayload() {
      const domain = this.domain || 'generic'
      const domainKnowledge = getKnowledge(domain, {
        appId: this.appId || 'meta-app-draft',
        appName: this.appName,
        scenarioDescription: this.scenarioDraft,
        serviceNames: this.serviceStatuses.map((s) => s.name),
        mode: this.internalMode
      })
      return {
        appId: this.appId || 'meta-app-draft',
        appName: this.appName,
        domain,
        domainKnowledge,
        serviceIds: this.serviceStatuses.map((s) => String(s.id)),
        servicesMeta: this.serviceStatuses.map((s) => ({
          id: String(s.id),
          name: s.name,
          mcpUrl: rewriteMcpUrlForLocalDev(s.mcpUrl || ''),
          tools: s.tools || [],
          isFake: !!s.isFake,
          mcpMethod: s.mcpMethod || 'sse',
          mcpCommand: s.mcpCommand || '',
          mcpArgs: s.mcpArgs || []
        })),
        maxIterations: this.maxIterations,
        scenarioDescription: this.scenarioDraft,
        mode: this.internalMode,
        strategy: this.buildSimulationStrategy()
      }
    },

    addLog(message, level = 'INFO', type = 'info') {
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      this.logs.push({ time, level, message, type })

      this.$nextTick(() => {
        if (this.$refs.logsContainer) {
          this.$refs.logsContainer.scrollTop = this.$refs.logsContainer.scrollHeight
        }
      })
    },

    clearLogs() {
      this.logs = []
    },

    startTimer() {
      this.elapsedTime = 0
      this.timerInterval = setInterval(() => {
        this.elapsedTime++
      }, 1000)
    },

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    logLevelToType(level) {
      const m = { INFO: 'info', SUCCESS: 'success', WARN: 'warning', ERROR: 'error' }
      return m[level] || 'info'
    },

    ensureIterationRows(iteration) {
      if (!this.iterationHistory.find((h) => h.iteration === iteration)) {
        this.iterationHistory.push({
          iteration,
          summary: '验证中...',
          completed: false,
          success: false
        })
      }
      if (!this.iterationDetails.find((d) => d.iteration === iteration)) {
        this.iterationDetails.push({
          iteration,
          dataPhase: 'pending',
          logicPhase: 'pending',
          checkPhase: 'pending',
          hasIssue: false,
          issue: '',
          fix: '',
          completed: false,
          success: false
        })
      }
    },

    currentDetail() {
      return this.iterationDetails.filter((d) => d.iteration === this.currentIteration).pop()
    },

    onStreamStep({ step }) {
      this.currentMainStep = step
      this.syncCanvasVisual({ type: 'step', step })
      if (step === 0) {
        this.serviceStatuses.forEach((s) => {
          if (s.status === 'pending') {
            s.status = 'checking'
            s.statusText = '检测中'
          }
        })
      }
    },

    onStreamService({ id, status, latency }) {
      this.syncCanvasVisual({ type: 'node', id: String(id), status })
      const s = this.serviceStatuses.find((x) => String(x.id) === String(id))
      if (!s) return
      if (status === 'online') {
        s.status = 'online'
        s.statusText = '正常'
        s.latency = latency != null ? latency : s.latency
      } else if (status === 'error') {
        s.status = 'error'
        s.statusText = '不可用'
      }
    },

    onStreamProgress({ ctx, index, text, active, done }) {
      const list = ctx === 'env' ? this.envSetupItems : this.generationItems
      const item = list[index]
      if (!item) return
      if (text) item.text = text
      if (active) item.active = true
      if (done) {
        item.active = false
        item.done = true
      }
    },

    onStreamPhase({ phase, status }) {
      const key = phase
      if (!['data', 'logic', 'check'].includes(key)) return
      this.syncCanvasVisual({ type: 'simulatePhase', phase: key, status })
      if (status === 'running') {
        this.phases[key] = 'running'
        const map = { data: '数据流转', logic: '业务逻辑', check: '调度链路' }
        this.currentActionText = `正在进行：${map[key]}`
        this.dispatchStatus = '智能体调度执行中'
      } else if (status === 'done') {
        this.phases[key] = 'done'
        const d = this.currentDetail()
        if (d) {
          const f = `${key}Phase`
          if (f in d) d[f] = 'done'
        }
      }
      if (status === 'running') {
        const d = this.currentDetail()
        if (d) {
          const f = `${key}Phase`
          if (f in d) d[f] = 'running'
        }
      }
    },

    onStreamIssue({ message, fix }) {
      const d = this.currentDetail()
      if (!d) return
      d.hasIssue = true
      d.issue = message
      d.fix = fix || ''
      this.dispatchStatus = '自动修复中'
      this.currentActionText = `发现: ${message}，正在修复...`
    },

    onStreamIteration({ iteration, status }) {
      this.currentIteration = iteration
      if (status === 'running') {
        this.phases = { data: 'pending', logic: 'pending', check: 'pending' }
        this.ensureIterationRows(iteration)
      }
      if (status === 'retry') {
        const h = this.iterationHistory.find((x) => x.iteration === iteration)
        if (h) {
          h.completed = true
          h.success = false
          h.summary = '已修复，进入下一轮'
        }
        const d = this.iterationDetails.find((x) => x.iteration === iteration)
        if (d) {
          d.completed = true
          d.success = false
        }
      }
      if (status === 'passed') {
        const h = this.iterationHistory.find((x) => x.iteration === iteration)
        if (h) {
          h.completed = true
          h.success = true
          h.summary = '验证通过'
        }
        const d = this.iterationDetails.find((x) => x.iteration === iteration)
        if (d) {
          d.completed = true
          d.success = true
        }
      }
      if (status === 'failed') {
        const h = this.iterationHistory.find((x) => x.iteration === iteration)
        if (h) {
          h.completed = true
          h.success = false
          h.summary = '智能终止'
        }
      }
    },

    onStreamLog({ level, message }) {
      this.addLog(message, level, this.logLevelToType(level))
    },

    onStreamMetrics({ metric, value }) {
      this.$set(this.finalMetrics, metric, value)
    },

    onStreamComplete(payload) {
      this.stopTimer()
      this.isRunning = false
      this.teardownStream()

      if (this.aborted && !this.visible) {
        this.syncCanvasVisual({ type: 'build', active: false })
        this.syncCanvasVisual({ type: 'clear' })
        return
      }

      const { success, cancelled, metrics, result } = payload

      if (cancelled && this.aborted) {
        this.syncCanvasVisual({ type: 'build', active: false })
        this.syncCanvasVisual({ type: 'clear' })
        return
      }

      this.isCompleted = true

      if (cancelled) {
        this.hasFailed = false
        this.syncCanvasVisual({ type: 'build', active: false })
        this.syncCanvasVisual({ type: 'clear' })
        return
      }

      this.hasFailed = !success

      if (metrics) {
        Object.keys(metrics).forEach((k) => {
          this.$set(this.finalMetrics, k, metrics[k])
        })
        this.totalIterations = metrics.iterations != null ? metrics.iterations : this.currentIteration
      } else {
        this.totalIterations = this.currentIteration
      }

      if (result) {
        this.finalResult = result
        if (result.executionPath && result.executionPath.length) {
          this.executionPath = result.executionPath
        }
        if (result.error) this.failureMessage = result.error
        if (result.suggestion) this.failureSuggestion = result.suggestion
      }
      this.syncCanvasVisual({ type: 'build', active: false })
      this.syncCanvasVisual({ type: 'clear' })
    },

    onStreamError(err) {
      this.syncCanvasVisual({ type: 'build', active: false })
      this.syncCanvasVisual({ type: 'clear' })
      this.stopTimer()
      this.isRunning = false
      this.teardownStream()
      this.isCompleted = true
      this.hasFailed = true
      this.failureMessage = (err && err.message) || '流式连接异常'
      this.failureSuggestion = '请稍后重试或检查网络'
      this.addLog(this.failureMessage, 'ERROR', 'error')
    },

    async startSimulation() {
      if (!this.serviceStatuses.length) {
        this.$message.warning('请先添加至少一个服务节点')
        this.visible = false
        this.$emit('close')
        return
      }

      this.isRunning = true
      this.isCompleted = false
      this.hasFailed = false
      this.aborted = false
      this.startTimer()
      this.addLog(`开始构建元应用: ${this.appName}`, 'INFO', 'info')

      let res
      try {
        res = await startSimulation(this.buildStartPayload())
      } catch (e) {
        this.onStreamError(e)
        return
      }

      if (!res || !res.success || !res.sessionId) {
        this.onStreamError(new Error((res && res.error) || '启动仿真失败'))
        return
      }

      this.sessionId = res.sessionId
      this.unsubscribeStream = subscribeSimulationStream(res.sessionId, res.streamUrl, {
        step: this.onStreamStep,
        iteration: this.onStreamIteration,
        phase: this.onStreamPhase,
        issue: this.onStreamIssue,
        service: this.onStreamService,
        log: this.onStreamLog,
        metrics: this.onStreamMetrics,
        progress: this.onStreamProgress,
        complete: this.onStreamComplete,
        error: this.onStreamError
      })
    },

    retrySimulation() {
      this.resetState()
      this.initServiceStatuses(this.serviceNodes)
    },

    handlePrePublish() {
      this.$emit('success', {
        appName: this.appName,
        appId: this.appId,
        servicesCount: this.connectedServicesCount,
        iterations: this.totalIterations,
        executionTime: this.elapsedTime,
        metrics: { ...this.finalMetrics },
        result: this.finalResult
      })
      this.$emit('prePublish')
      this.handleClose()
    },

    handleCancel() {
      this.$confirm('取消后当前进度将丢失', '确定要取消构建吗？', {
        confirmButtonText: '取消构建',
        cancelButtonText: '继续构建',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        this.aborted = true
        if (this.sessionId) {
          cancelSimulation(this.sessionId)
        }
        this.teardownStream()
        this.stopTimer()
        this.visible = false
        this.$emit('close')
      }).catch(() => {})
    },

    handleClose() {
      this.syncCanvasVisual({ type: 'build', active: false })
      this.syncCanvasVisual({ type: 'clear' })
      if (this.isRunning && this.sessionId) {
        cancelSimulation(this.sessionId)
      }
      this.teardownStream()
      this.visible = false
      this.$emit('close')
    },

    async openCompareModal() {
      this.compareModalVisible = true
      this.compareSelectedIds = []
      this.compareResultRows = []
      await this.loadRecordList()
    },

    async loadRecordList() {
      this.compareLoading = true
      try {
        this.recordList = await fetchSimulationRecords(this.appName)
      } catch (e) {
        this.recordList = []
        this.$message.error('加载实验记录失败')
      } finally {
        this.compareLoading = false
      }
    },

    async runCompare() {
      if (this.compareSelectedIds.length < 2) return
      this.compareLoading = true
      try {
        const { records } = await compareSimulationRecords(
          this.compareSelectedIds,
          this.appName
        )
        this.compareResultRows = records || []
      } catch (e) {
        this.$message.error('对比失败')
      } finally {
        this.compareLoading = false
      }
    }
  },

  beforeDestroy() {
    this.syncCanvasVisual({ type: 'clear' })
    this.stopTimer()
    this.teardownStream()
  }
}
</script>

<style lang="less" scoped>
/* 与画布并排嵌入父级左栏，无遮罩 */
.simulation-inline-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #fff;
}

.simulation-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.simulation-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

// 主步骤条
.main-steps {
  display: flex;
  justify-content: space-between;
  padding: 20px 32px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f5ff 100%);
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.main-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 14px;
    left: 60%;
    right: -40%;
    height: 2px;
    background: #e8e8e8;
  }

  &.done:not(:last-child)::after {
    background: #52c41a;
  }

  &.active:not(:last-child)::after {
    background: linear-gradient(to right, #1890ff 50%, #e8e8e8 50%);
  }
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  z-index: 1;
  transition: all 0.3s;

  .pending & {
    background: #f5f5f5;
    color: #bfbfbf;
    border: 2px solid #e8e8e8;
  }

  .active & {
    background: #1890ff;
    color: #fff;
    border: 2px solid #1890ff;
  }

  .done & {
    background: #52c41a;
    color: #fff;
    border: 2px solid #52c41a;
  }
}

.step-label {
  font-size: 13px;
  color: #8c8c8c;

  .active & {
    color: #1890ff;
    font-weight: 500;
  }

  .done & {
    color: #52c41a;
  }
}

// 五步条：略缩小标签以免换行错乱
.main-steps-five {
  .step-label {
    font-size: 11px;
    text-align: center;
    line-height: 1.3;
    max-width: 72px;
  }
}

// 准备页
.pre-start-panel {
  text-align: left;
}

.pre-start-title {
  font-size: 17px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.pre-start-lead,
.pre-start-hint {
  font-size: 14px;
  color: #595959;
  line-height: 1.65;
  margin-bottom: 12px;
}

.pre-start-list {
  margin: 0 0 14px 1.1em;
  padding: 0;
  font-size: 13px;
  color: #595959;
  line-height: 1.7;

  li {
    margin-bottom: 6px;
  }
}

.pre-start-domain-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #8c8c8c;
  line-height: 1.6;

  .anticon {
    margin-right: 4px;
    color: #faad14;
  }
}

.pre-start-config {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;

  .toolbar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .toolbar-label {
    font-size: 13px;
    color: #595959;
    flex-shrink: 0;
  }

  .scenario-row .ant-input {
    flex: 1;
    max-width: 100%;
  }
}

.research-strategy-panel {
  margin-top: 8px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.pre-start-config .strategy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px 12px;
}

.pre-start-config .strategy-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.pre-start-services {
  margin-top: 16px;
}

.pre-service-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.pre-start-warn {
  margin-top: 14px;
  padding: 10px 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  font-size: 13px;
  color: #ad6800;

  .anticon {
    margin-right: 6px;
  }
}

// 内容区域
.content-area {
  padding: 24px;
  min-height: 280px;
}

.step-content {
  .step-title {
    font-size: 18px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 8px;

    .iteration-hint {
      font-size: 13px;
      font-weight: 400;
      color: #1890ff;
      margin-left: 8px;
    }
  }

  .step-desc {
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 16px;
  }
}

// 服务检查列表
.service-check-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-check-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 8px;

  &.status-online {
    background: #f6ffed;
    .service-status { color: #52c41a; }
  }

  &.status-error {
    background: #fff2f0;
    .service-status { color: #ff4d4f; }
  }

  &.status-checking {
    background: #e6f7ff;
    .service-status { color: #1890ff; }
  }
}

.service-name {
  font-size: 14px;
  color: #262626;
}

.service-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8c8c8c;
}

// 环境准备/方案生成列表
.env-setup-list, .generation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.env-setup-item, .generation-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #fafafa;
  border-radius: 6px;
  font-size: 14px;
  color: #8c8c8c;

  &.done {
    color: #52c41a;
  }

  &.active {
    background: #e6f7ff;
    color: #1890ff;
  }
}

.simulation-phase {
  .dispatch-box {
    background: #fafafa;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .dispatch-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 500;
    color: #262626;
    margin-bottom: 20px;

    .anticon {
      font-size: 18px;
      color: #1890ff;
    }
  }
}

// 三阶段进度
.phase-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.phase-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .phase-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #bfbfbf;
    font-size: 12px;
    transition: all 0.3s;
  }

  .phase-label {
    font-size: 12px;
    color: #8c8c8c;
  }

  &.active {
    .phase-icon {
      background: #1890ff;
      color: #fff;
    }
    .phase-label {
      color: #1890ff;
      font-weight: 500;
    }
  }

  &.done {
    .phase-icon {
      background: #52c41a;
      color: #fff;
    }
    .phase-label {
      color: #52c41a;
    }
  }
}

.phase-connector {
  width: 40px;
  height: 2px;
  background: #e8e8e8;
  margin-bottom: 20px;
}

.current-action {
  text-align: center;
  font-size: 13px;
  color: #595959;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
}

// 迭代历史
.iteration-history {
  margin-bottom: 12px;

  .history-title {
    font-size: 13px;
    font-weight: 500;
    color: #8c8c8c;
    margin-bottom: 8px;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #fafafa;
    border-radius: 6px;
    font-size: 13px;

    &.current {
      background: #e6f7ff;
    }

    .icon-success { color: #52c41a; }
    .icon-warning { color: #faad14; }
    .icon-loading { color: #1890ff; }

    .history-label {
      color: #262626;
      font-weight: 500;
      min-width: 50px;
    }

    .history-summary {
      color: #595959;
    }
  }
}

.auto-fix-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
  padding: 8px;

  .anticon {
    color: #faad14;
  }
}

// 结果内容
.result-content {
  text-align: center;

  .result-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }

  .result-title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .result-subtitle {
    font-size: 14px;
    color: #8c8c8c;
    margin-bottom: 24px;
  }

  &.success {
    .result-icon { color: #52c41a; }
    .result-title { color: #262626; }
  }

  &.failed {
    .result-icon { color: #ff4d4f; }
    .result-title { color: #262626; }
  }
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #52c41a;
  }

  .stat-label {
    font-size: 12px;
    color: #8c8c8c;
  }
}

.execution-path {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  text-align: left;

  .path-label {
    font-size: 13px;
    font-weight: 500;
    color: #595959;
    margin-bottom: 10px;
  }

  .path-nodes {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  .path-node {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #262626;
    padding: 4px 10px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #e8e8e8;
  }

  .path-arrow {
    color: #bfbfbf;
  }
}

.error-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  text-align: left;

  .error-icon {
    font-size: 20px;
    color: #ff4d4f;
  }

  .error-message {
    font-size: 14px;
    color: #262626;
    margin-bottom: 6px;
  }

  .error-suggestion {
    font-size: 13px;
    color: #595959;
  }
}

// 技术详情开关
.tech-toggle {
  text-align: center;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
}

// 技术详情面板
.tech-details {
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  padding: 16px;
  max-height: 320px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .detail-title {
    font-size: 13px;
    font-weight: 500;
    color: #595959;
    margin-bottom: 8px;
    display: flex;
    align-items: center;

    .clear-btn {
      margin-left: auto;
      padding: 0;
      height: auto;
    }
  }
}

.iteration-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.iter-detail-item {
  background: #fff;
  border-radius: 6px;
  padding: 10px 12px;

  .iter-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .iter-num {
      font-weight: 500;
      color: #262626;
    }
  }

  .iter-phases {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #8c8c8c;
    margin-bottom: 6px;

    .iter-phase {
      display: flex;
      align-items: center;
      gap: 4px;

      &.done { color: #52c41a; }
      &.warning { color: #faad14; }
    }
  }

  .iter-issue, .iter-fix {
    font-size: 12px;
    color: #595959;
    margin-top: 4px;

    .issue-label { color: #faad14; }
    .fix-label { color: #52c41a; }
  }
}

.service-detail-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.service-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;

  .service-name {
    color: #262626;
  }

  .service-status {
    display: flex;
    align-items: center;
    gap: 4px;

    &.status-online { color: #52c41a; }
    &.status-error { color: #ff4d4f; }

    .latency {
      color: #8c8c8c;
    }
  }
}

.logs-container {
  background: #1e1e1e;
  border-radius: 6px;
  padding: 8px 10px;
  max-height: 120px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  line-height: 1.6;
}

.log-line {
  display: flex;
  gap: 6px;

  &.info { color: #d4d4d4; }
  &.success { color: #4ec9b0; }
  &.warning { color: #dcdcaa; }
  &.error { color: #f48771; }
}

.log-time { color: #6a9955; flex-shrink: 0; }
.log-level { color: #9cdcfe; flex-shrink: 0; min-width: 45px; }
.log-msg { flex: 1; word-break: break-all; }

.logs-empty {
  text-align: center;
  color: #6a6a6a;
  padding: 16px 0;
}

// 过渡动画
.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-leave-active { transition: all 0.2s ease; }
.slide-fade-enter, .slide-fade-leave-to { max-height: 0; opacity: 0; padding: 0; }

// 底部按钮
.footer-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.builder-toolbar {
  padding: 12px 24px 0;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;

  .toolbar-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .toolbar-label {
    font-size: 13px;
    color: #595959;
    flex-shrink: 0;
  }

  .scenario-row .ant-input {
    flex: 1;
    max-width: 420px;
  }

  .strategy-collapse {
    margin-bottom: 8px;
    background: transparent;

    /deep/ .ant-collapse-item {
      border: none;
    }

    /deep/ .ant-collapse-header {
      padding: 8px 0 !important;
      font-size: 13px;
    }

    /deep/ .ant-collapse-content-box {
      padding: 0 0 12px !important;
    }
  }

  .strategy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px 16px;
  }

  .strategy-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #8c8c8c;
  }
}

.strategy-summary {
  margin-bottom: 16px;
  text-align: left;

  .strategy-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
}

.research-metrics {
  margin-bottom: 16px;
  text-align: left;

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .metric-cell {
    background: #fafafa;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .m-v {
      font-size: 20px;
      font-weight: 600;
      color: #1890ff;
    }

    .m-l {
      font-size: 12px;
      color: #8c8c8c;
    }
  }
}

.research-actions {
  margin-top: 12px;
}

.compare-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.compare-check-group {
  display: block;
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 12px;
}

.compare-row {
  padding: 4px 0;
}

.compare-empty {
  color: #8c8c8c;
  font-size: 13px;
  margin-bottom: 12px;
}

.compare-table-wrap {
  overflow-x: auto;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th,
  td {
    border: 1px solid #f0f0f0;
    padding: 8px 6px;
    text-align: left;
  }

  th {
    background: #fafafa;
    color: #595959;
  }
}
</style>
