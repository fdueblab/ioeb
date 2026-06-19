<template>
  <div class="wb-artifact-config">
    <template v-if="!hasContent">
      <div class="wb-artifact-empty">
        <strong>暂无数据</strong>
        <p>元应用配置不可用，请确认仿真构建已完成。</p>
      </div>
    </template>

    <template v-else>
      <!-- 基本信息 -->
      <section v-if="identity.appName" class="wb-artifact-hero">
        <div class="wb-artifact-hero-main">
          <h3 class="wb-artifact-title">{{ identity.appName }}</h3>
          <div class="wb-artifact-tags">
            <span v-if="identity.domain" class="wb-artifact-tag">{{ identity.domain }}</span>
            <span v-if="identity.mode" class="wb-artifact-tag wb-artifact-tag--muted">{{ identity.mode }}</span>
            <a-tag v-if="artifactMeta.solidifiable != null" :color="artifactMeta.solidifiable ? 'green' : 'red'">
              {{ artifactMeta.solidifiable ? '可固化' : '不可固化' }}
            </a-tag>
          </div>
        </div>
        <div v-if="identity.appId" class="wb-artifact-id">ID · {{ identity.appId }}</div>
      </section>

      <!-- 场景解析 -->
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

      <!-- 最终服务节点 -->
      <section v-if="services.binding || services.contracts.length" class="wb-artifact-section">
        <h4 class="wb-artifact-section-title">最终服务节点</h4>
        <div v-if="services.binding" class="wb-artifact-chips">
          <span
            v-for="name in services.binding"
            :key="name"
            class="wb-artifact-chip"
            :title="name"
          >{{ name }}</span>
        </div>
        <div v-if="services.contracts.length" class="wb-artifact-contracts">
          <div
            v-for="c in services.contracts"
            :key="c.key"
            class="wb-artifact-contract"
          >
            <div class="wb-artifact-contract-name">{{ c.name }}</div>
            <div class="wb-artifact-contract-detail">{{ c.summary }}</div>
          </div>
        </div>
      </section>

      <!-- 产物元数据 -->
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
    services() {
      const binding = splitList(this.mapped.services)
      const contracts = (this.rows || [])
        .filter((r) => r.key && r.key.startsWith('contract-'))
        .map((r) => ({
          key: r.key,
          name: r.label,
          summary: r.value
        }))
      return { binding, contracts }
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
        this.identity.appName ||
        this.hasScenario ||
        this.services.binding.length ||
        this.services.contracts.length ||
        this.hasArtifactMeta
      )
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';
</style>
