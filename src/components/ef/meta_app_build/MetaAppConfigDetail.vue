<template>
  <div class="wb-artifact-config">
    <template v-if="!hasContent">
      <div class="wb-artifact-empty">
        <strong>暂无数据</strong>
        <p>元应用配置不可用，请确认仿真构建已完成。</p>
      </div>
    </template>

    <template v-else>
      <section v-if="hasScenario" class="wb-artifact-section">
        <h4 class="wb-artifact-section-title">场景解析</h4>
        <div class="wb-detail-band wb-scenario-bubbles">
          <div v-if="scenario.goal" class="wb-row wb-row--lg">
            <strong>场景目标</strong>
            <div>{{ scenario.goal }}</div>
          </div>
          <div v-if="scenario.description" class="wb-row wb-row--lg">
            <strong>场景描述</strong>
            <div>{{ scenario.description }}</div>
          </div>
          <div v-if="scenario.constraints.length" class="wb-row wb-row--lg">
            <strong>约束</strong>
            <div class="wb-chip-row">
              <span
                v-for="(item, i) in scenario.constraints"
                :key="'c-' + i"
                class="wb-chip wb-chip--scenario wb-chip--constraint"
              >{{ item }}</span>
            </div>
          </div>
          <div v-if="scenario.acceptance.length" class="wb-row wb-row--lg">
            <strong>验收标准</strong>
            <div class="wb-chip-row">
              <span
                v-for="(item, i) in scenario.acceptance"
                :key="'a-' + i"
                class="wb-chip wb-chip--scenario wb-chip--accept"
              >{{ item }}</span>
            </div>
          </div>
        </div>
      </section>

      <section v-if="serviceContracts.length" class="wb-artifact-section">
        <h4 class="wb-artifact-section-title">服务契约</h4>
        <div class="wb-artifact-contracts">
          <div
            v-for="c in serviceContracts"
            :key="c.key"
            class="wb-artifact-contract"
          >
            <div class="wb-artifact-contract-head">
              <span class="wb-artifact-contract-name">{{ c.name }}</span>
              <a-tag v-if="c.channelLabel" size="small">{{ c.channelLabel }}</a-tag>
            </div>
            <p class="wb-artifact-contract-detail">
              <template v-if="c.boundOnly">已绑定 · 等待运行期调用</template>
              <template v-else-if="c.uncalled">本次未调用</template>
              <template v-else>调用 {{ c.totalCalls }} 次 · 成功率 {{ c.successRate }}</template>
            </p>
            <p v-if="c.declaredToolNames.length" class="wb-artifact-contract-detail">
              <span class="wb-artifact-contract-label">声明工具</span>
              {{ c.declaredToolNames.join('、') }}
            </p>
            <p v-if="c.observedSummaries.length" class="wb-artifact-contract-detail">
              <span class="wb-artifact-contract-label">实测调用</span>
              {{ c.observedSummaries.join('；') }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="hasGoldenPath" class="wb-artifact-section">
        <h4 class="wb-artifact-section-title">黄金路径</h4>
        <div class="wb-artifact-golden-meta">
          <a-tag :color="goldenPath.extractable ? 'blue' : 'default'">
            {{ goldenPath.extractable ? '可抽取' : '不可抽取' }}
          </a-tag>
          <span v-if="goldenPath.reason" class="wb-artifact-golden-reason">{{ goldenPath.reason }}</span>
        </div>
        <ul v-if="goldenPath.steps.length" class="wb-artifact-golden-steps">
          <li v-for="step in goldenPath.steps" :key="step.key">
            <strong>{{ step.stepId }}</strong>
            <span>{{ step.summary }}</span>
          </li>
        </ul>
        <ul v-if="goldenPath.assertions.length" class="wb-artifact-golden-assertions">
          <li v-for="a in goldenPath.assertions" :key="a.key">
            <a-tag size="small" :color="assertionTagColor(a.result)">{{ a.result }}</a-tag>
            <span>{{ a.assertionId }}</span>
            <span v-if="a.detail" class="wb-artifact-golden-assert-detail">{{ a.detail }}</span>
          </li>
        </ul>
      </section>

      <section v-if="hasArtifactMeta" class="wb-artifact-section">
        <h4 class="wb-artifact-section-title">产物信息</h4>
        <div class="wb-artifact-meta-grid">
          <div v-if="artifactMeta.artifactId" class="wb-artifact-meta-item">
            <span class="wb-artifact-label">产物 ID</span>
            <span class="wb-artifact-mono">{{ artifactMeta.artifactId }}</span>
          </div>
          <div v-if="artifactMeta.schema" class="wb-artifact-meta-item">
            <span class="wb-artifact-label">Schema</span>
            <span class="wb-artifact-mono">{{ artifactMeta.schema }}</span>
          </div>
          <div v-if="artifactMeta.hash" class="wb-artifact-meta-item wb-artifact-meta-item--wide">
            <span class="wb-artifact-label">产物 Hash</span>
            <span class="wb-artifact-mono">{{ artifactMeta.hash }}</span>
          </div>
        </div>
        <div v-if="artifactMeta.gates.length" class="wb-artifact-gates">
          <div
            v-for="g in artifactMeta.gates"
            :key="g.key"
            class="wb-artifact-gate"
            :class="{ 'wb-artifact-gate--pass': g.passed }"
          >
            <a-icon :type="g.passed ? 'check-circle' : 'close-circle'" />
            <span class="wb-artifact-gate-name">{{ g.name }}</span>
            <span v-if="g.detail" class="wb-artifact-gate-detail">{{ g.detail }}</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
function rowMap(rows) {
  const m = {}
  ;(rows || []).forEach((r) => {
    if (r && r.key) m[r.key] = r.value
  })
  return m
}

function splitList(text) {
  if (!text) return []
  return String(text)
    .split(/[；;、]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export default {
  name: 'MetaAppConfigDetail',
  props: {
    rows: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    mapped() {
      return rowMap(this.rows)
    },
    identity() {
      const m = this.mapped
      return {
        appName: m['app-name'] || '',
        domain: m.domain || '',
        mode: m.mode || '',
        appId: m['app-id'] || ''
      }
    },
    scenario() {
      const m = this.mapped
      return {
        goal: m.goal || m['scenario-title'] || '',
        description: m['scenario-desc'] || m.description || '',
        constraints: splitList(m.constraints),
        acceptance: splitList(m.acceptance)
      }
    },
    hasScenario() {
      const s = this.scenario
      return Boolean(
        s.goal ||
        s.description ||
        s.constraints.length ||
        s.acceptance.length
      )
    },
    serviceContracts() {
      return (this.rows || [])
        .filter((r) => r.key && r.key.startsWith('contract-'))
        .map((r) => {
          const c = r.contract || {}
          return {
            key: r.key,
            name: r.label,
            channelLabel: c.channelLabel || '',
            totalCalls: c.totalCalls != null ? c.totalCalls : 0,
            successRate: c.successRate || '—',
            declaredToolNames: c.declaredToolNames || [],
            observedSummaries: c.observedSummaries || [],
            boundOnly: !!c.boundOnly,
            uncalled: !!c.uncalled
          }
        })
    },
    goldenPath() {
      const m = this.mapped
      const extractable = /^可(抽取|用)/.test(String(m['golden-path'] || ''))
      const reason = m['golden-path-reason'] || ''
      const steps = (this.rows || [])
        .filter((r) => r.key && r.key.startsWith('gp-step-'))
        .map((r) => ({
          key: r.key,
          stepId: r.label,
          summary: r.value
        }))
      const assertions = (this.rows || [])
        .filter((r) => r.key && r.key.startsWith('gp-assertion-'))
        .map((r) => {
          const parts = String(r.value || '').split(' · ').filter(Boolean)
          return {
            key: r.key,
            assertionId: r.label,
            result: parts[2] || parts[parts.length - 1] || 'unknown',
            detail: parts.slice(0, 2).join(' · ')
          }
        })
      return { extractable, reason, steps, assertions }
    },
    hasGoldenPath() {
      const gp = this.goldenPath
      return Boolean(
        gp.reason ||
        gp.steps.length ||
        gp.assertions.length ||
        this.mapped['golden-path']
      )
    },
    artifactMeta() {
      const m = this.mapped
      const gates = (this.rows || [])
        .filter((r) => r.key && r.key.startsWith('gate-'))
        .map((r) => {
          const passed = String(r.value).startsWith('通过')
          return {
            key: r.key,
            name: r.label,
            passed,
            detail: passed ? '' : String(r.value).replace(/^未通过：?/, '')
          }
        })
      return {
        artifactId: m['artifact-id'] || '',
        schema: m.schema || '',
        hash: m.hash || '',
        solidifiable: m.solidifiable != null ? m.solidifiable === '是' : null,
        gates
      }
    },
    hasArtifactMeta() {
      const a = this.artifactMeta
      return Boolean(
        a.artifactId ||
        a.schema ||
        a.hash ||
        a.gates.length
      )
    },
    hasContent() {
      return (
        this.hasScenario ||
        this.serviceContracts.length ||
        this.hasGoldenPath ||
        this.hasArtifactMeta
      )
    }
  },
  methods: {
    assertionTagColor(result) {
      const r = String(result || '').toLowerCase()
      if (r === 'pass') return 'green'
      if (r === 'fail') return 'red'
      return 'default'
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';
</style>
