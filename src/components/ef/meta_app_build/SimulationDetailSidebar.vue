<template>
  <div class="wb-detail-inner" :class="detailInnerClass">
    <!-- input：想定未完成 -->
    <template v-if="mode === 'input'">
      <div class="wb-row">
        <strong>场景解析结果</strong>
        <div class="wb-subtle">
          尚未完成想定场景解析。请先在左侧对话框中描述应用场景与目标；解析完成后，将在此展示结构化场景与服务列表。
        </div>
      </div>
      <div class="wb-row">
        <strong>当前可调度服务</strong>
        <div class="wb-subtle">完成想定输入并生成元应用后，已匹配的服务将显示在这里。</div>
      </div>
    </template>

    <!-- parsed：场景解析 -->
    <template v-else-if="mode === 'parsed'">
      <h3 v-if="hasParsedContent" class="wb-detail-section-head">场景解析</h3>
      <div v-if="hasParsedContent" class="wb-detail-band wb-scenario-bubbles">
        <div v-if="parsed.goal" class="wb-row wb-row--lg">
          <strong>构建需求</strong>
          <div>{{ parsed.goal }}</div>
        </div>
        <div v-if="parsed.description" class="wb-row wb-row--lg">
          <strong>场景描述</strong>
          <div>{{ parsed.description }}</div>
        </div>
        <div v-if="parsed.constraints && parsed.constraints.length" class="wb-row wb-row--lg">
          <strong>约束</strong>
          <div class="wb-chip-row">
            <span v-for="(item, idx) in parsed.constraints" :key="'pc-' + idx" class="wb-chip wb-chip--scenario wb-chip--constraint">{{ item }}</span>
          </div>
        </div>
        <div v-if="parsed.acceptanceCriteria && parsed.acceptanceCriteria.length" class="wb-row wb-row--lg">
          <strong>验证标准</strong>
          <div class="wb-chip-row">
            <span
              v-for="(item, idx) in parsed.acceptanceCriteria"
              :key="'pa-' + idx"
              class="wb-chip wb-chip--scenario wb-chip--accept"
            >{{ item }}</span>
          </div>
        </div>
      </div>
      <div v-if="!hasParsedContent" class="wb-row wb-row--lg">
        <strong>场景解析</strong>
        <div class="wb-subtle">完成左侧想定输入后，将在此展示结构化场景。</div>
      </div>
      <div class="wb-row wb-row--block wb-schedulable-panel">
        <strong>当前可调度服务</strong>
        <div class="wb-chip-row">
          <span v-for="s in services" :key="s.id" class="wb-chip wb-chip--scenario">{{ s.name }}</span>
        </div>
        <p v-if="!services.length" class="wb-schedulable-hint wb-schedulable-hint--empty">画布上暂无服务节点。</p>
        <p v-else class="wb-schedulable-hint">可通过右上角添加服务，或在左侧对话中追加约束。</p>
      </div>
    </template>

    <!-- build：构建详情 -->
    <template v-else-if="mode === 'build'">
      <div class="build-process-metrics build-process-metrics--top">
        <div
          v-for="metric in executionMetrics"
          :key="metric.label"
          class="build-process-metric"
        >
          <strong>{{ metric.value }}</strong>
          <span>{{ metric.label }}</span>
        </div>
      </div>

      <h3 class="wb-detail-section-head">仿真构建轨迹</h3>
      <p class="build-section-note">
        记录各轮仿真执行、结果验证与自动修正过程，用于说明构建链路如何收敛到可接受结果。
      </p>
      <template v-if="build.iterations && build.iterations.length">
        <div class="build-iteration-report">
          <article
            v-for="iter in build.iterations"
            :key="iter.iteration"
            class="wb-iter-card build-iter-card"
            :class="{ 'wb-iter-card--active': isIterActive(iter) }"
          >
            <header class="wb-iter-card-head">
              <span class="wb-iter-card-title">第 {{ iter.iteration }} 轮</span>
              <a-tag :color="iterStatusColor(iter.statusLabel)" class="wb-iter-card-tag">{{ iter.statusLabel }}</a-tag>
            </header>
            <div class="wb-iter-phases">
              <span class="wb-iter-phase" :class="phaseTone(iter.execPhaseLabel)">调度执行 · {{ iter.execPhaseLabel }}</span>
              <span class="wb-iter-phase" :class="phaseTone(iter.checkPhaseLabel)">结果验证 · {{ iter.checkPhaseLabel }}</span>
            </div>

            <div v-if="iter.plannerToolSteps && iter.plannerToolSteps.length" class="wb-iter-block wb-iter-block--plan">
              <div class="wb-iter-block-head">
                <a-icon type="bulb" />
                <strong>本轮规划</strong>
                <span class="wb-iter-block-hint">规划智能体选定的工具</span>
              </div>
              <div class="wb-path-chain">
                <span
                  v-for="(step, idx) in iter.plannerToolSteps"
                  :key="'tool-' + idx"
                  class="wb-path-chain-item"
                >
                  <span class="wb-path-node wb-path-node--tool">{{ step }}</span>
                  <a-icon
                    v-if="idx < iter.plannerToolSteps.length - 1"
                    type="arrow-right"
                    class="wb-path-arrow"
                  />
                </span>
              </div>
            </div>

            <div v-if="iter.executionPathSteps && iter.executionPathSteps.length" class="wb-iter-block wb-iter-block--exec">
              <div class="wb-iter-block-head">
                <a-icon type="deployment-unit" />
                <strong>实际调用链</strong>
                <span class="wb-iter-block-hint">本轮服务调用路径</span>
              </div>
              <div class="wb-path-chain">
                <span
                  v-for="(step, idx) in iter.executionPathSteps"
                  :key="'path-' + idx"
                  class="wb-path-chain-item"
                >
                  <span
                    class="wb-path-node"
                    :class="{ 'wb-path-node--endpoint': isPathEndpoint(step) }"
                  >{{ step }}</span>
                  <a-icon
                    v-if="idx < iter.executionPathSteps.length - 1"
                    type="arrow-right"
                    class="wb-path-arrow"
                  />
                </span>
              </div>
            </div>

            <div v-if="iter.hasVerification" class="wb-iter-block wb-iter-block--verify">
              <div class="wb-iter-block-head">
                <a-icon type="safety-certificate" />
                <strong>验证结论</strong>
              </div>
              <div class="wb-iter-block-body">
                <div class="wb-iter-verify-main">
                  <a-tag v-if="iter.verifierStatus" :color="verifierTagColor(iter.verifierStatus)">
                    {{ iter.verifierStatus }}
                  </a-tag>
                  <span v-if="iter.verifierSummary" class="wb-iter-block-text">{{ iter.verifierSummary }}</span>
                </div>
                <ul v-if="iter.verifierChecks && iter.verifierChecks.length" class="wb-iter-check-list">
                  <li v-for="(chk, ci) in iter.verifierChecks" :key="'chk-' + ci">
                    <strong class="wb-iter-check-name">{{ chk.check || '检查项' }}</strong>
                    <span v-if="chk.issue">：{{ chk.issue }}</span>
                  </li>
                </ul>
                <ul v-if="iter.verifierIssues && iter.verifierIssues.length" class="wb-iter-check-list">
                  <li v-for="(iss, ii) in iter.verifierIssues" :key="'iss-' + ii">{{ iss.description }}</li>
                </ul>
                <p v-if="iter.fix" class="wb-iter-block-text wb-iter-block-text--fix">修复：{{ iter.fix }}</p>
              </div>
            </div>

            <div
              v-if="!hasIterDetailBlocks(iter) && iter.summary"
              class="wb-iter-block wb-iter-block--muted"
            >
              <p class="wb-iter-block-text">{{ iter.summary }}</p>
            </div>
          </article>
        </div>
      </template>
      <div v-else-if="build.hasFailed" class="build-friendly-empty build-friendly-empty--failed">
        <a-icon type="info-circle" />
        <div>
          <strong>本次仿真构建未通过</strong>
          <p>暂未形成可接受轨迹。可根据验证反馈调整任务约束或服务配置后重新构建。</p>
        </div>
      </div>
      <p v-else class="wb-subtle">等待仿真构建轨迹写入。</p>

      <div
        v-if="build.isCompleted && !build.hasFailed && (build.artifactError || build.traceError)"
        class="build-friendly-empty build-friendly-empty--failed"
      >
        <a-icon type="warning" />
        <div>
          <strong>构建详情加载异常</strong>
          <p>{{ build.artifactError || build.traceError }}</p>
        </div>
      </div>

      <h3 class="wb-detail-section-head">已验证调用链</h3>
      <template v-if="hasAcceptedCallChain">
        <div class="build-accepted-chain">
          <span
            v-for="(step, idx) in build.callChain"
            :key="'accepted-' + idx"
            class="build-accepted-step"
          >
            {{ step }}
            <a-icon v-if="idx < build.callChain.length - 1" type="arrow-right" />
          </span>
        </div>
      </template>
      <div v-else-if="build.hasFailed" class="build-friendly-empty build-friendly-empty--chain">
        <a-icon type="clock-circle" />
        <div>
          <strong>尚未生成已验证调用链</strong>
          <p>只有通过验证的构建轮次才会沉淀为调用链；当前结果保留在上方仿真构建轨迹中。</p>
        </div>
      </div>
      <p v-else class="wb-subtle">验证通过后生成已验证调用链。</p>
    </template>

    <!-- prepublish：元应用配置 -->
    <template v-else-if="mode === 'prepublish'">
      <meta-app-prepublish-materials-panel :artifact="productArtifact" />
    </template>
  </div>
</template>

<script>
import MetaAppPrepublishMaterialsPanel from './MetaAppPrepublishMaterialsPanel.vue'

export default {
  name: 'SimulationDetailSidebar',
  components: { MetaAppPrepublishMaterialsPanel },
  props: {
    mode: {
      type: String,
      default: 'parsed'
    },
    parsed: {
      type: Object,
      default: () => ({})
    },
    services: {
      type: Array,
      default: () => []
    },
    build: {
      type: Object,
      default: () => ({})
    },
    product: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    detailInnerClass() {
      if (this.mode === 'build') return 'wb-detail-inner--build'
      if (this.mode === 'prepublish') return 'wb-detail-inner--prepublish'
      if (this.mode === 'parsed') return 'wb-detail-inner--parsed'
      return ''
    },
    hasParsedContent() {
      const p = this.parsed || {}
      return Boolean(
        p.goal ||
        p.description ||
        (p.constraints && p.constraints.length) ||
        (p.acceptanceCriteria && p.acceptanceCriteria.length)
      )
    },
    buildStats() {
      return this.build.stats || {
        serviceCount: 0,
        completedCalls: 0,
        toolCallCount: 0
      }
    },
    productArtifact() {
      return (this.product && this.product.artifact) || null
    },
    executionMetrics() {
      const toolCalls = this.buildStats.toolCallCount || this.buildStats.completedCalls || 0
      return [
        { label: '构建轮次', value: this.build.currentIteration || 1 },
        { label: '工具调用', value: toolCalls },
        { label: '接入服务', value: this.buildStats.serviceCount || 0 }
      ]
    },
    hasAcceptedCallChain() {
      return Boolean(
        this.build.acceptedStatus === 'accepted' &&
        this.build.callChain &&
        this.build.callChain.length
      )
    }
  },
  methods: {
    isIterActive(iter) {
      const s = iter && iter.statusLabel
      return s === '进行中' || s === '执行中' || s === '验证中'
    },
    iterStatusColor(label) {
      if (label === '已通过') return 'green'
      if (label === '需优化') return 'orange'
      if (this.isIterActive({ statusLabel: label })) return 'blue'
      return 'default'
    },
    phaseTone(label) {
      if (label === '已完成') return 'wb-iter-phase--done'
      if (label === '进行中') return 'wb-iter-phase--active'
      return ''
    },
    verifierTagColor(status) {
      const s = String(status || '').toUpperCase()
      if (!s) return 'default'
      if (s === 'PASS' || s === 'PASSED' || s === 'ACCEPTED') return 'green'
      if (s === 'WARN' || s === 'WARNING') return 'orange'
      return 'red'
    },
    isPathEndpoint(step) {
      const t = String(step || '')
      return t === '用户输入' || t === '输出结果'
    },
    hasIterDetailBlocks(iter) {
      return Boolean(
        (iter.plannerToolSteps && iter.plannerToolSteps.length) ||
        (iter.executionPathSteps && iter.executionPathSteps.length) ||
        iter.hasVerification
      )
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';
</style>
