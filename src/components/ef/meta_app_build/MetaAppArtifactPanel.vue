<template>
  <div :class="rootClass">
    <template v-if="!view.valid">
      <div v-if="variant === 'workbench'" class="wb-artifact-empty">
        <strong>暂无数据</strong>
        <p>元应用产物尚未生成，请先完成仿真构建。</p>
      </div>
      <p v-else class="detail-muted">暂无元应用产物</p>
    </template>

    <template v-else>
      <section class="artifact-brief">
        <div class="artifact-brief-main">
          <span class="artifact-kicker">面向运行的元应用产物</span>
          <h3>{{ view.appName || '未命名元应用' }}</h3>
          <p>{{ view.taskStatement || '未记录任务说明' }}</p>
        </div>
        <div class="artifact-brief-meta">
          <span>Schema {{ view.schemaVersion }}</span>
          <strong>{{ view.runtimeModeLabel }}</strong>
          <span class="artifact-mono">ID {{ view.artifactId }}</span>
        </div>
      </section>

      <section class="artifact-metric-grid">
        <div class="artifact-metric">
          <strong>{{ view.metrics.inputCount }}</strong>
          <span>输入项</span>
        </div>
        <div class="artifact-metric">
          <strong>{{ view.metrics.outputCount }}</strong>
          <span>输出项</span>
        </div>
        <div class="artifact-metric">
          <strong>{{ view.metrics.serviceCount }}</strong>
          <span>绑定服务</span>
        </div>
        <div class="artifact-metric">
          <strong>{{ view.metrics.pathStepCount }}</strong>
          <span>路径步骤</span>
        </div>
      </section>

      <section :class="sectionClass">
        <component :is="titleTag" :class="titleClass">任务说明</component>
        <div class="artifact-contract-grid">
          <div class="artifact-contract-lead">
            <span class="artifact-label">任务目标</span>
            <p>{{ view.taskStatement || '未记录任务目标' }}</p>
          </div>
          <div class="artifact-contract-io">
            <div>
              <span class="artifact-label">输入要求</span>
              <div class="artifact-chip-list">
                <span v-for="slot in view.expectedInput" :key="'in-' + slot.name" class="artifact-chip">
                  {{ slot.name }}<em v-if="slot.type">{{ slot.type }}</em>
                </span>
                <span v-if="!view.expectedInput.length" class="artifact-muted">暂无输入要求</span>
              </div>
            </div>
            <div>
              <span class="artifact-label">输出要求</span>
              <div class="artifact-chip-list">
                <span v-for="slot in view.expectedOutput" :key="'out-' + slot.name" class="artifact-chip artifact-chip--output">
                  {{ slot.name }}<em v-if="slot.type">{{ slot.type }}</em>
                </span>
                <span v-if="!view.expectedOutput.length" class="artifact-muted">暂无输出要求</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section :class="sectionClass">
        <component :is="titleTag" :class="titleClass">运行配置</component>
        <div class="artifact-runtime-config">
          <div class="artifact-runtime-block">
            <span class="artifact-label">运行方式</span>
            <div class="artifact-runtime-mode-grid">
              <div>
                <em>执行模式</em>
                <strong>{{ view.runtimeModeLabel }}</strong>
              </div>
              <div>
                <em>智能体策略</em>
                <strong>{{ view.agentView.styleLabel }}</strong>
              </div>
              <div>
                <em>路径决策</em>
                <strong>{{ view.agentView.goldenPathDecisionLabel }}</strong>
              </div>
            </div>
          </div>

          <div class="artifact-runtime-block">
            <span class="artifact-label">服务能力</span>
            <p class="artifact-runtime-summary">
              {{ view.metrics.serviceCount }} 项服务 · {{ toolCount }} 个可调用工具
            </p>
            <div class="artifact-runtime-grid">
              <article
                v-for="svc in view.serviceBindings"
                :key="svc.serviceId || svc.serviceName"
                class="artifact-service-card"
              >
                <header>
                  <strong>{{ svc.serviceName }}</strong>
                  <a-tag size="small">{{ svc.channelLabel }}</a-tag>
                </header>
                <p v-if="svc.endpoint" class="artifact-mono artifact-service-endpoint">{{ svc.endpoint }}</p>
                <p v-if="svc.schemaHash" class="artifact-muted">服务指纹 {{ svc.schemaHash }}</p>
                <div v-if="svc.tools.length" class="artifact-tool-list">
                  <span v-for="tool in svc.tools" :key="tool.name">{{ tool.name }}</span>
                </div>
              </article>
            </div>
          </div>

          <div class="artifact-runtime-block">
            <span class="artifact-label">失败处理</span>
            <p v-if="!view.fallback.triggers.length" class="artifact-muted">未记录失败处理策略</p>
            <template v-else-if="view.fallback.uniform">
              <p class="artifact-fallback-summary">{{ view.fallback.summary }}</p>
              <details v-if="view.fallback.triggers.length > 1" class="artifact-fallback-details">
                <summary>查看触发场景</summary>
                <ul class="artifact-fallback-triggers">
                  <li v-for="trigger in view.fallback.triggers" :key="trigger.key">{{ trigger.label }}</li>
                </ul>
              </details>
            </template>
            <div v-else class="artifact-fallback-table">
              <div v-for="trigger in view.fallback.triggers" :key="trigger.key" class="artifact-fallback-row">
                <span>{{ trigger.label }}</span>
                <strong>{{ trigger.actionLabel }}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section :class="sectionClass">
        <div class="artifact-section-head">
          <component :is="titleTag" :class="titleClass">候选执行路径</component>
          <a-tag :color="view.reusablePath.exists ? 'blue' : 'default'">
            {{ view.reusablePath.exists ? '已形成' : '未形成' }}
          </a-tag>
        </div>
        <p v-if="!view.reusablePath.exists" :class="mutedClass">当前产物未包含候选执行路径，运行时将由智能体直接规划执行。</p>
        <ol v-else class="artifact-path-timeline">
          <li v-for="step in view.reusablePath.steps" :key="step.stepId">
            <div class="artifact-path-index">{{ step.stepId }}</div>
            <div class="artifact-path-card">
              <header>
                <strong>{{ step.toolName }}</strong>
                <span>{{ step.serviceId }}</span>
              </header>
              <div v-if="step.arguments.length" class="artifact-kv-list">
                <span class="artifact-label">参数模板</span>
                <div>
                  <code v-for="arg in step.arguments" :key="'arg-' + step.stepId + '-' + arg.key">
                    {{ arg.key }}={{ arg.value }}
                  </code>
                </div>
              </div>
              <div v-if="step.mappings.length" class="artifact-kv-list">
                <span class="artifact-label">输入映射</span>
                <div>
                  <code v-for="map in step.mappings" :key="'map-' + step.stepId + '-' + map.key">
                    {{ map.key }}←{{ map.value }}
                  </code>
                </div>
              </div>
              <div class="artifact-path-foot">
                <span v-if="step.outputSlots.length">输出 {{ step.outputSlots.join(', ') }}</span>
                <span v-if="step.dependsOn.length">依赖 {{ step.dependsOn.join(', ') }}</span>
                <span v-if="!step.outputSlots.length && !step.dependsOn.length">无前置依赖</span>
              </div>
            </div>
          </li>
        </ol>
        <div v-if="view.reusablePath.exists && assertionRows.length" class="artifact-check-block">
          <span class="artifact-label">结果检查要求</span>
          <div class="artifact-check-list">
            <span v-for="item in assertionRows" :key="item.id">
              {{ item.label }}<em v-if="item.detail">{{ item.detail }}</em>
            </span>
          </div>
        </div>
      </section>

      <component :is="sectionTag" v-if="showJsonCollapse && artifactJsonPreview" :class="sectionClass">
        <a-collapse :bordered="false">
          <a-collapse-panel key="artifact-json" header="完整元应用产物 JSON">
            <pre class="trace-raw-json">{{ artifactJsonPreview }}</pre>
          </a-collapse-panel>
        </a-collapse>
      </component>
    </template>
  </div>
</template>

<script>
import { assertionDisplayLabel, parseMetaAppArtifact } from './meta_app_artifact_view'

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
    toolCount() {
      return this.view.serviceBindings.reduce((sum, svc) => sum + svc.tools.length, 0)
    },
    assertionRows() {
      return this.view.reusablePath.assertions.map((assertion) => ({
        id: assertion.assertionId,
        label: assertionDisplayLabel(assertion),
        detail: assertion.detail
      }))
    },
    rootClass() {
      return this.variant === 'workbench' ? 'wb-artifact-config artifact-system-panel' : 'artifact-panel-detail artifact-system-panel'
    },
    sectionTag() {
      return this.variant === 'workbench' ? 'section' : 'div'
    },
    sectionClass() {
      return this.variant === 'workbench' ? 'wb-artifact-section artifact-system-section' : 'detail-subsection artifact-system-section'
    },
    titleTag() {
      return this.variant === 'workbench' ? 'h4' : 'div'
    },
    titleClass() {
      return this.variant === 'workbench' ? 'wb-artifact-section-title artifact-system-title' : 'detail-subtitle artifact-system-title'
    },
    mutedClass() {
      return this.variant === 'workbench' ? 'wb-subtle' : 'detail-muted detail-subsection-flush'
    },
    artifactJsonPreview() {
      if (!this.artifact) return ''
      try {
        const raw = JSON.stringify(this.artifact, null, 2)
        return raw.length > 8000 ? `${raw.slice(0, 8000)}\n...` : raw
      } catch (e) {
        return ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';

.artifact-system-panel {
  gap: 12px;
}

.artifact-brief {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  gap: 14px;
  padding: 14px;
  border: 1px solid #d9e2ef;
  border-radius: 8px;
  background: #f8fafc;
}

.artifact-brief-main {
  min-width: 0;

  h3 {
    margin: 2px 0 8px;
    color: #1f2937;
    font-size: 17px;
    line-height: 1.35;
  }

  p {
    margin: 0;
    color: #4b5563;
    font-size: 13px;
    line-height: 1.65;
  }
}

.artifact-kicker,
.artifact-label {
  display: block;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
}

.artifact-brief-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;

  span,
  strong {
    min-width: 0;
    color: #374151;
    font-size: 12px;
    word-break: break-word;
  }
}

.artifact-metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.artifact-metric {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  text-align: center;

  strong {
    display: block;
    color: #111827;
    font-size: 18px;
    line-height: 1.1;
  }

  span {
    color: #6b7280;
    font-size: 12px;
  }
}

.artifact-system-section {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.artifact-system-title {
  color: #374151;
  font-size: 13px;
  margin-bottom: 10px;
}

.artifact-contract-grid {
  display: grid;
  gap: 10px;
}

.artifact-contract-lead {
  grid-column: 1 / -1;

  p {
    margin: 4px 0 0;
    color: #374151;
    font-size: 13px;
    line-height: 1.65;
  }
}

.artifact-contract-io {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.artifact-runtime-config {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.artifact-runtime-block {
  padding: 10px;
  border-radius: 6px;
  background: #f9fafb;
  border: 1px solid #edf0f3;
}

.artifact-runtime-mode-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;

  > div {
    min-width: 0;
    padding: 8px;
    border-radius: 6px;
    background: #fff;
    border: 1px solid #e5e7eb;
  }

  em {
    display: block;
    color: #6b7280;
    font-size: 12px;
    font-style: normal;
  }

  strong {
    display: block;
    margin-top: 3px;
    color: #111827;
    font-size: 12px;
    line-height: 1.45;
    word-break: break-word;
  }
}

.artifact-runtime-summary {
  margin: 8px 0;
  color: #6b7280;
  font-size: 12px;
}

.artifact-fallback-summary {
  margin: 8px 0 0;
  color: #374151;
  font-size: 13px;
  line-height: 1.6;
}

.artifact-fallback-details {
  margin-top: 8px;

  summary {
    color: #1d4ed8;
    font-size: 12px;
    cursor: pointer;
    user-select: none;
  }
}

.artifact-fallback-triggers {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.artifact-fallback-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.artifact-fallback-row {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(0, 1.2fr);
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;

  span {
    color: #6b7280;
    font-size: 12px;
  }

  strong {
    color: #111827;
    font-size: 12px;
    line-height: 1.45;
  }
}

.artifact-check-block {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
}

.artifact-check-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;

  span {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #334155;
    font-size: 12px;
  }

  em {
    margin-left: 5px;
    color: #64748b;
    font-style: normal;
  }
}

.artifact-contract-io > div {
  min-width: 0;
  padding: 10px;
  border-radius: 6px;
  background: #f9fafb;
  border: 1px solid #edf0f3;
}

.artifact-chip-list,
.artifact-tool-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.artifact-chip,
.artifact-tool-list span {
  max-width: 100%;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  word-break: break-word;

  em {
    margin-left: 5px;
    color: #64748b;
    font-style: normal;
  }
}

.artifact-chip--output {
  border-color: #d1fae5;
  background: #ecfdf5;
  color: #047857;
}

.artifact-runtime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
}

.artifact-service-card {
  min-width: 0;
  padding: 10px;
  border-radius: 6px;
  background: #f9fafb;
  border: 1px solid #edf0f3;

  header {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    align-items: flex-start;
    margin-bottom: 8px;
  }
}

.artifact-service-endpoint {
  margin-bottom: 4px;
}

.artifact-section-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.artifact-path-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.artifact-path-timeline li {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
}

.artifact-path-index {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #3730a3;
  font-size: 12px;
  font-weight: 700;
}

.artifact-path-card {
  min-width: 0;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;

  header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 8px;

    strong,
    span {
      min-width: 0;
      word-break: break-word;
    }

    span {
      color: #6b7280;
      font-size: 12px;
    }
  }
}

.artifact-kv-list {
  margin-top: 8px;

  > div {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 5px;
  }

  code {
    max-width: 100%;
    padding: 3px 6px;
    border-radius: 4px;
    background: #f3f4f6;
    color: #374151;
    font-size: 12px;
    white-space: normal;
    word-break: break-word;
  }
}

.artifact-path-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;

  span {
    color: #6b7280;
    font-size: 12px;
  }
}

.artifact-muted {
  color: #8c8c8c;
  font-size: 12px;
}

.artifact-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  word-break: break-all;
}

@media (max-width: 900px) {
  .artifact-brief,
  .artifact-contract-io,
  .artifact-runtime-mode-grid {
    grid-template-columns: 1fr;
  }

  .artifact-metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
