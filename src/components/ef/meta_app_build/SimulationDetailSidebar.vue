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
          <strong>场景目标</strong>
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
      <div class="wb-detail-band wb-detail-band--status">
        <div class="wb-row">
          <strong>当前阶段</strong>
          <div>{{ build.currentPhaseLabel || '—' }}</div>
        </div>
        <div class="wb-row">
          <strong>当前调用</strong>
          <div>{{ build.currentActionText || '—' }}</div>
        </div>
        <div class="wb-row">
          <strong>调度状态</strong>
          <div>{{ build.dispatchStatus || '—' }}</div>
        </div>
      </div>

      <div class="wb-row wb-row--stats wb-row--xl">
        <strong>本轮摘要</strong>
        <div class="wb-mini-stats">
          <div class="wb-stat">
            <strong>{{ buildStats.serviceCount }}</strong>
            <span>接入服务</span>
          </div>
          <div class="wb-stat">
            <strong>{{ buildStats.completedCalls }}</strong>
            <span>已完成调用</span>
          </div>
          <div class="wb-stat">
            <strong>{{ buildStats.pendingIssues }}</strong>
            <span>待修正项</span>
          </div>
        </div>
      </div>

      <template v-if="build.iterations && build.iterations.length">
        <h3 class="wb-detail-section-head">轮次详情</h3>
        <div class="wb-detail-band wb-detail-band--iterations">
          <article
            v-for="iter in build.iterations"
            :key="iter.iteration"
            class="wb-iter-card"
            :class="{ 'wb-iter-card--active': isIterActive(iter) }"
          >
            <header class="wb-iter-card-head">
              <span class="wb-iter-card-title">第 {{ iter.iteration }} 轮</span>
              <a-tag :color="iterStatusColor(iter.statusLabel)" class="wb-iter-card-tag">{{ iter.statusLabel }}</a-tag>
            </header>
            <div class="wb-iter-phases">
              <span class="wb-iter-phase" :class="phaseTone(iter.execPhaseLabel)">调度执行 · {{ iter.execPhaseLabel }}</span>
              <span class="wb-iter-phase" :class="phaseTone(iter.checkPhaseLabel)">目标验收 · {{ iter.checkPhaseLabel }}</span>
            </div>

            <div v-if="iter.plannerToolSteps && iter.plannerToolSteps.length" class="wb-iter-block wb-iter-block--plan">
              <div class="wb-iter-block-head">
                <a-icon type="bulb" />
                <strong>本轮规划</strong>
                <span class="wb-iter-block-hint">规划 Agent 选定的工具</span>
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
                <span class="wb-iter-block-hint">本轮真实 MCP 调用路径</span>
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

            <div v-if="iter.verifierStatus" class="wb-iter-block wb-iter-block--verify">
              <div class="wb-iter-block-head">
                <a-icon type="safety-certificate" />
                <strong>验证结论</strong>
              </div>
              <div class="wb-iter-block-body">
                <a-tag :color="verifierTagColor(iter.verifierStatus)">{{ iter.verifierStatus }}</a-tag>
                <span v-if="iter.verifierSummary" class="wb-iter-block-text">{{ iter.verifierSummary }}</span>
              </div>
            </div>

            <div v-if="iter.issue" class="wb-iter-block wb-iter-block--issue">
              <div class="wb-iter-block-head">
                <a-icon type="warning" />
                <strong>发现问题</strong>
              </div>
              <p class="wb-iter-block-text">{{ iter.issue }}</p>
            </div>

            <div v-if="iter.fix" class="wb-iter-block wb-iter-block--fix">
              <div class="wb-iter-block-head">
                <a-icon type="tool" />
                <strong>自动修复</strong>
              </div>
              <p class="wb-iter-block-text">{{ iter.fix }}</p>
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

      <template v-if="build.services && build.services.length">
        <h3 class="wb-detail-section-head">服务状态</h3>
        <div class="wb-detail-band wb-detail-band--fields">
          <div v-for="svc in build.services" :key="svc.id" class="wb-row">
            <strong>{{ svc.name }}</strong>
            <div>
              {{ svc.statusText }}
              <template v-if="svc.latency">，响应 {{ svc.latency }}ms</template>
            </div>
          </div>
        </div>
      </template>

      <template v-if="build.showTechDetails">
        <h3 class="wb-detail-section-head">轨迹与证据</h3>
        <div class="wb-detail-band wb-detail-band--fields">
          <div class="wb-row" :class="{ 'wb-row--xl': build.callChain && build.callChain.length }">
            <strong>轨迹</strong>
            <div>
              <template v-if="build.traceLoading">
                <span class="wb-subtle"><a-icon type="loading" /> 加载中…</span>
              </template>
              <template v-else-if="build.traceSkipped">
                <span class="wb-subtle">进程内演示无落盘轨迹</span>
              </template>
              <template v-else-if="build.traceError">
                <span class="wb-subtle wb-text-error">{{ build.traceError }}</span>
              </template>
              <template v-else-if="build.callChain && build.callChain.length">
                {{ build.callChain.join(' → ') }}
              </template>
              <template v-else>
                <span class="wb-subtle">暂无轨迹摘要</span>
              </template>
            </div>
          </div>
          <div v-if="build.evidenceStatus" class="wb-row">
            <strong>证据结论</strong>
            <div class="wb-row-inline">
              <a-tag :color="build.evidenceStatus === 'PASS' ? 'green' : 'orange'">{{ build.evidenceStatus }}</a-tag>
              <span v-if="build.evidenceSummary" class="wb-subtle">{{ build.evidenceSummary }}</span>
            </div>
          </div>
          <div v-if="build.artifactId" class="wb-row">
            <strong>产物 ID</strong>
            <div class="wb-row-inline">
              <a-tag :color="build.solidifiable ? 'green' : 'red'">
                {{ build.solidifiable ? '可固化' : '不可固化' }}
              </a-tag>
              <span class="wb-small">{{ build.artifactId }}</span>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- prepublish：元应用配置 -->
    <template v-else-if="mode === 'prepublish'">
      <meta-app-config-detail :rows="artifactRows" />
    </template>
  </div>
</template>

<script>
import MetaAppConfigDetail from './MetaAppConfigDetail.vue'

export default {
  name: 'SimulationDetailSidebar',
  components: { MetaAppConfigDetail },
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
        pendingIssues: 0
      }
    },
    artifactRows() {
      return (this.product && this.product.artifactRows) || []
    }
  },
  methods: {
    productRowSizeClass(row) {
      const size = (row && row.size) || (row && row.wide ? 'xl' : 'sm')
      return `wb-row--${size}`
    },
    isIterActive(iter) {
      const s = iter && iter.statusLabel
      return s === '进行中' || s === '执行中' || s === '验收中'
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
      if (s === 'PASS' || s === 'PASSED') return 'green'
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
        iter.verifierStatus ||
        iter.issue ||
        iter.fix
      )
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';
</style>
