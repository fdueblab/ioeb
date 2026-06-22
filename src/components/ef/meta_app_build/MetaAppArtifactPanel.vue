<template>
  <div :class="rootClass">
    <template v-if="!view.valid">
      <div v-if="variant === 'workbench'" class="wb-artifact-empty">
        <strong>暂无数据</strong>
        <p>元应用配置不可用，请确认仿真构建已完成。</p>
      </div>
      <p v-else class="detail-muted">暂无 MetaAppArtifact v1 产物</p>
    </template>

    <template v-else>
      <!-- 任务目标 -->
      <component :is="sectionTag" v-if="hasTaskGoal" :class="sectionClass">
        <component :is="titleTag" :class="titleClass">任务目标</component>
        <template v-if="variant === 'workbench'">
          <div class="wb-detail-band wb-scenario-bubbles">
            <div v-if="view.taskGoal.goal" class="wb-row wb-row--lg">
              <strong>目标</strong>
              <div>{{ view.taskGoal.goal }}</div>
            </div>
            <div v-if="view.taskGoal.description" class="wb-row wb-row--lg">
              <strong>描述</strong>
              <div>{{ view.taskGoal.description }}</div>
            </div>
            <div v-if="view.taskGoal.constraints.length" class="wb-row wb-row--lg">
              <strong>约束</strong>
              <div class="wb-chip-row">
                <span
                  v-for="(item, i) in view.taskGoal.constraints"
                  :key="'c-' + i"
                  class="wb-chip wb-chip--scenario wb-chip--constraint"
                >{{ item }}</span>
              </div>
            </div>
            <div v-if="view.taskGoal.successCriteria.length" class="wb-row wb-row--lg">
              <strong>验收标准</strong>
              <div class="wb-chip-row">
                <span
                  v-for="(item, i) in view.taskGoal.successCriteria"
                  :key="'s-' + i"
                  class="wb-chip wb-chip--scenario wb-chip--accept"
                >{{ item }}</span>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <p v-if="view.taskGoal.goal" class="parsed-intent-goal">{{ view.taskGoal.goal }}</p>
          <p v-if="view.taskGoal.description" class="detail-summary-line parsed-intent-situation">
            {{ view.taskGoal.description }}
          </p>
          <div v-if="view.taskGoal.constraints.length" class="parsed-intent-block">
            <span class="parsed-intent-label">约束</span>
            <a-tag
              v-for="(item, idx) in view.taskGoal.constraints"
              :key="'c-' + idx"
              class="parsed-intent-tag"
            >{{ item }}</a-tag>
          </div>
          <div v-if="view.taskGoal.successCriteria.length" class="parsed-intent-block">
            <span class="parsed-intent-label">验收标准</span>
            <ul class="parsed-intent-list">
              <li v-for="(item, idx) in view.taskGoal.successCriteria" :key="'a-' + idx">{{ item }}</li>
            </ul>
          </div>
        </template>
      </component>

      <!-- 预期输入 -->
      <component :is="sectionTag" v-if="view.expectedInput.length" :class="sectionClass">
        <component :is="titleTag" :class="titleClass">预期输入</component>
        <ul :class="slotListClass">
          <li v-for="slot in view.expectedInput" :key="'in-' + slot.name">
            <strong>{{ slot.name }}</strong>
            <span v-if="slot.type" class="artifact-slot-meta">{{ slot.type }}</span>
            <span v-if="slot.required" class="artifact-slot-meta">必填</span>
          </li>
        </ul>
      </component>

      <!-- 预期输出 -->
      <component :is="sectionTag" v-if="view.expectedOutput.length" :class="sectionClass">
        <component :is="titleTag" :class="titleClass">预期输出</component>
        <ul :class="slotListClass">
          <li v-for="slot in view.expectedOutput" :key="'out-' + slot.name">
            <strong>{{ slot.name }}</strong>
            <span v-if="slot.type" class="artifact-slot-meta">{{ slot.type }}</span>
            <span v-if="slot.required" class="artifact-slot-meta">必填</span>
          </li>
        </ul>
      </component>

      <!-- 服务绑定 -->
      <component :is="sectionTag" v-if="view.serviceBindings.length" :class="sectionClass">
        <component :is="titleTag" :class="titleClass">服务绑定</component>
        <div v-if="variant === 'workbench'" class="wb-artifact-contracts">
          <div
            v-for="svc in view.serviceBindings"
            :key="svc.serviceId || svc.serviceName"
            class="wb-artifact-contract"
          >
            <div class="wb-artifact-contract-head">
              <span class="wb-artifact-contract-name">{{ svc.serviceName }}</span>
              <a-tag v-if="svc.channelLabel" size="small">{{ svc.channelLabel }}</a-tag>
            </div>
            <p v-if="svc.endpoint" class="wb-artifact-contract-detail wb-artifact-mono">{{ svc.endpoint }}</p>
            <p v-if="svc.toolNames.length" class="wb-artifact-contract-detail">
              <span class="wb-artifact-contract-label">工具</span>
              {{ svc.toolNames.join('、') }}
            </p>
          </div>
        </div>
        <div v-else class="contract-list">
          <div
            v-for="svc in view.serviceBindings"
            :key="svc.serviceId || svc.serviceName"
            class="contract-card"
          >
            <div class="contract-head">
              <span class="contract-name">{{ svc.serviceName }}</span>
              <a-tag size="small">{{ svc.channelLabel }}</a-tag>
            </div>
            <p v-if="svc.endpoint" class="detail-summary-line detail-summary-line--tight artifact-endpoint">{{ svc.endpoint }}</p>
            <p v-if="svc.toolNames.length" class="detail-summary-line">
              <span class="contract-field-label">工具</span>
              {{ svc.toolNames.join('、') }}
            </p>
          </div>
        </div>
      </component>

      <!-- 可复用路径 -->
      <component :is="sectionTag" :class="sectionClass">
        <div class="reusable-path-head">
          <component :is="titleTag" :class="titleClass">可复用路径</component>
          <a-tag :color="view.reusablePath.exists ? 'blue' : 'default'">
            {{ view.reusablePath.exists ? '存在' : '不存在' }}
          </a-tag>
        </div>
        <p v-if="!view.reusablePath.exists" :class="mutedClass">未收敛出可复用快路径</p>
        <template v-else>
          <ul v-if="variant === 'workbench'" class="wb-artifact-golden-steps">
            <li v-for="step in view.reusablePath.steps" :key="step.stepId">
              <strong>{{ step.stepId }}</strong>
              <span>{{ step.summary }}</span>
            </li>
          </ul>
          <ul v-else class="parsed-intent-list">
            <li v-for="step in view.reusablePath.steps" :key="step.stepId">
              {{ step.stepId }} · {{ step.summary }}
            </li>
          </ul>
          <ul v-if="view.reusablePath.assertions.length" :class="assertionListClass">
            <li v-for="a in view.reusablePath.assertions" :key="a.assertionId">
              <a-tag v-if="variant === 'workbench'" size="small">{{ a.result || 'rule' }}</a-tag>
              <span>{{ a.assertionId }}</span>
              <span v-if="a.detail" :class="assertionDetailClass">{{ a.detail }}</span>
            </li>
          </ul>
        </template>
      </component>

      <!-- 产物元信息 -->
      <component :is="sectionTag" :class="sectionClass">
        <component :is="titleTag" :class="titleClass">产物信息</component>
        <div v-if="variant === 'workbench'" class="wb-artifact-meta-grid">
          <div v-if="view.artifactId" class="wb-artifact-meta-item">
            <span class="wb-artifact-label">产物 ID</span>
            <span class="wb-artifact-mono">{{ view.artifactId }}</span>
          </div>
          <div v-if="view.schemaVersion" class="wb-artifact-meta-item">
            <span class="wb-artifact-label">Schema</span>
            <span class="wb-artifact-mono">{{ view.schemaVersion }}</span>
          </div>
          <div class="wb-artifact-meta-item">
            <span class="wb-artifact-label">运行模式</span>
            <span class="wb-artifact-mono">{{ view.runtimeMode }}</span>
          </div>
        </div>
        <div v-else class="evidence-head">
          <a-tag color="blue">{{ view.runtimeMode }}</a-tag>
          <span class="evidence-id">{{ view.artifactId }}</span>
          <span v-if="view.schemaVersion" class="detail-muted artifact-schema-hint">{{ view.schemaVersion }}</span>
        </div>
      </component>

      <component :is="sectionTag" v-if="showJsonCollapse && artifactJsonPreview" :class="sectionClass">
        <a-collapse :bordered="false">
          <a-collapse-panel key="artifact-json" header="完整 MetaAppArtifact JSON">
            <pre class="trace-raw-json">{{ artifactJsonPreview }}</pre>
          </a-collapse-panel>
        </a-collapse>
      </component>
    </template>
  </div>
</template>

<script>
import { parseMetaAppArtifact } from './meta_app_artifact_view'

export default {
  name: 'MetaAppArtifactPanel',
  props: {
    artifact: {
      type: Object,
      default: null
    },
    variant: {
      type: String,
      default: 'workbench',
      validator: (v) => ['workbench', 'detail'].includes(v)
    },
    showJsonCollapse: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    view() {
      return parseMetaAppArtifact(this.artifact)
    },
    hasTaskGoal() {
      const g = this.view.taskGoal
      return Boolean(
        g.goal ||
        g.description ||
        g.constraints.length ||
        g.successCriteria.length
      )
    },
    rootClass() {
      return this.variant === 'workbench' ? 'wb-artifact-config' : 'artifact-panel-detail'
    },
    sectionTag() {
      return this.variant === 'workbench' ? 'section' : 'div'
    },
    sectionClass() {
      return this.variant === 'workbench' ? 'wb-artifact-section' : 'detail-subsection'
    },
    titleTag() {
      return this.variant === 'workbench' ? 'h4' : 'div'
    },
    titleClass() {
      return this.variant === 'workbench' ? 'wb-artifact-section-title' : 'detail-subtitle'
    },
    slotListClass() {
      return this.variant === 'workbench' ? 'wb-artifact-list' : 'parsed-intent-list'
    },
    mutedClass() {
      return this.variant === 'workbench' ? 'wb-subtle' : 'detail-muted detail-subsection-flush'
    },
    assertionListClass() {
      return this.variant === 'workbench' ? 'wb-artifact-golden-assertions' : 'parsed-intent-list artifact-assertion-list'
    },
    assertionDetailClass() {
      return this.variant === 'workbench' ? 'wb-artifact-golden-assert-detail' : 'detail-muted'
    },
    artifactJsonPreview() {
      if (!this.artifact) return ''
      try {
        const raw = JSON.stringify(this.artifact, null, 2)
        return raw.length > 8000 ? `${raw.slice(0, 8000)}\n…` : raw
      } catch (e) {
        return ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';

.reusable-path-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;

  .wb-artifact-section-title,
  .detail-subtitle {
    margin-bottom: 0;
  }
}

.artifact-slot-meta {
  margin-left: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.artifact-endpoint {
  word-break: break-all;
  font-size: 12px;
}

.artifact-schema-hint {
  margin-left: 8px;
  font-size: 12px;
}

.artifact-assertion-list li {
  font-size: 13px;
}
</style>
