<template>
  <div class="prepub-artifact-panel">
    <div v-if="!view.valid" class="wb-artifact-empty">
      <strong>暂无数据</strong>
      <p>完成仿真构建后，将在此展示元应用预发布产物。</p>
    </div>

    <template v-else>
      <h3 class="wb-detail-section-head">任务说明</h3>
      <div class="prepub-content">
        <div class="prepub-goal-bubble">
          <span>任务目标</span>
          <strong>{{ view.taskStatement || '未记录任务目标' }}</strong>
        </div>

        <div class="prepub-two-col">
          <div class="prepub-field">
            <span>约束条件</span>
            <div class="prepub-chip-list prepub-chip-list--orange">
              <em v-for="item in view.taskGoal.constraints" :key="'constraint-' + item">{{ item }}</em>
              <i v-if="!view.taskGoal.constraints.length">未记录</i>
            </div>
          </div>
          <div class="prepub-field">
            <span>成功标准</span>
            <div class="prepub-chip-list prepub-chip-list--green">
              <em v-for="item in view.taskGoal.successCriteria" :key="'criteria-' + item">{{ item }}</em>
              <i v-if="!view.taskGoal.successCriteria.length">未记录</i>
            </div>
          </div>
          <div class="prepub-field">
            <span>预期输入项</span>
            <div class="prepub-chip-list">
              <em v-for="slot in view.expectedInput" :key="'input-' + slot.name">
                {{ slot.name }}<small v-if="slot.type">{{ slot.type }}</small>
              </em>
              <i v-if="!view.expectedInput.length">未记录</i>
            </div>
          </div>
          <div class="prepub-field">
            <span>预期输出项</span>
            <div class="prepub-chip-list">
              <em v-for="slot in view.expectedOutput" :key="'output-' + slot.name">
                {{ slot.name }}<small v-if="slot.type">{{ slot.type }}</small>
              </em>
              <i v-if="!view.expectedOutput.length">未记录</i>
            </div>
          </div>
        </div>
      </div>

      <h3 class="wb-detail-section-head">运行配置</h3>
      <div class="prepub-content">
        <div class="prepub-runtime-block">
          <h4 class="prepub-runtime-block-head">运行方式</h4>
          <div class="prepub-runtime-mode-grid">
            <div>
              <span>执行模式</span>
              <strong>{{ view.runtimeModeLabel }}</strong>
            </div>
            <div>
              <span>智能体策略</span>
              <strong>{{ view.agentView.styleLabel }}</strong>
            </div>
            <div>
              <span>路径决策</span>
              <strong>{{ view.agentView.goldenPathDecisionLabel }}</strong>
            </div>
          </div>
        </div>

        <div class="prepub-runtime-block">
          <h4 class="prepub-runtime-block-head">服务能力</h4>
          <p class="prepub-runtime-summary">
            {{ view.metrics.serviceCount }} 项服务 · {{ toolCount }} 个可调用工具
          </p>
          <div class="prepub-runtime-list">
            <article v-for="svc in view.serviceBindings" :key="svc.serviceId || svc.serviceName">
              <header>
                <strong>{{ svc.serviceName }}</strong>
                <span>{{ serviceDescription(svc) }}</span>
              </header>
              <div class="prepub-chip-list">
                <em v-for="tool in svc.tools" :key="svc.serviceId + '-' + tool.name">
                  {{ tool.name }}<small v-if="tool.description">{{ tool.description }}</small>
                </em>
                <i v-if="!svc.tools.length">未记录工具</i>
              </div>
            </article>
          </div>
        </div>

        <div class="prepub-runtime-block">
          <h4 class="prepub-runtime-block-head">失败处理</h4>
          <div v-if="!view.fallback.triggers.length" class="prepub-fallback-empty">
            未记录失败处理策略
          </div>
          <template v-else-if="view.fallback.uniform">
            <p class="prepub-fallback-summary">{{ view.fallback.summary }}</p>
            <details v-if="view.fallback.triggers.length > 1" class="prepub-fallback-details">
              <summary>查看触发场景</summary>
              <ul class="prepub-fallback-triggers">
                <li v-for="trigger in view.fallback.triggers" :key="trigger.key">
                  {{ trigger.label }}
                </li>
              </ul>
            </details>
          </template>
          <div v-else class="prepub-fallback-flow">
            <article v-for="trigger in view.fallback.triggers" :key="trigger.key">
              <span>{{ trigger.label }}</span>
              <strong>{{ trigger.actionLabel }}</strong>
            </article>
          </div>
        </div>
      </div>

      <h3 class="wb-detail-section-head">候选执行路径</h3>
      <div class="prepub-content prepub-path-content">
        <p v-if="!view.reusablePath.exists" class="wb-subtle">当前产物未包含候选执行路径，运行时将由智能体直接规划执行。</p>
        <template v-else>
          <div class="prepub-path-chain">
            <span
              v-for="(step, idx) in view.reusablePath.steps"
              :key="'order-' + step.stepId"
            >
              {{ step.toolName || step.serviceId }}
              <a-icon v-if="idx < view.reusablePath.steps.length - 1" type="arrow-right" />
            </span>
          </div>

          <ol class="prepub-path-list">
            <li v-for="step in view.reusablePath.steps" :key="step.stepId">
              <div class="prepub-path-index">{{ step.stepId }}</div>
              <div class="prepub-path-body">
                <header>
                  <strong>{{ step.toolName }}</strong>
                  <span>{{ step.serviceId }}</span>
                </header>
                <div class="prepub-path-detail">
                  <span>参数关系</span>
                  <div class="prepub-code-row">
                    <code v-for="arg in step.arguments" :key="'arg-' + step.stepId + '-' + arg.key">
                      {{ arg.key }}={{ arg.value }}
                    </code>
                    <code v-for="map in step.mappings" :key="'map-' + step.stepId + '-' + map.key">
                      {{ map.key }}←{{ map.value }}
                    </code>
                    <i v-if="!step.arguments.length && !step.mappings.length">未记录</i>
                  </div>
                </div>
                <div class="prepub-path-detail">
                  <span>步骤依赖</span>
                  <div class="prepub-code-row">
                    <code v-for="dep in step.dependsOn" :key="'dep-' + step.stepId + '-' + dep">{{ dep }}</code>
                    <i v-if="!step.dependsOn.length">无前置依赖</i>
                  </div>
                </div>
                <div class="prepub-path-detail">
                  <span>输出</span>
                  <div class="prepub-code-row">
                    <code v-for="slot in step.outputSlots" :key="'out-' + step.stepId + '-' + slot">{{ slot }}</code>
                    <i v-if="!step.outputSlots.length">未记录</i>
                  </div>
                </div>
              </div>
            </li>
          </ol>

          <div class="prepub-check-block">
            <strong>结果检查要求</strong>
            <div class="prepub-check-list">
              <span v-for="item in assertionRows" :key="item.id">
                {{ item.label }}<small v-if="item.detail">{{ item.detail }}</small>
              </span>
              <i v-if="!assertionRows.length">未记录检查要求</i>
            </div>
          </div>
        </template>
      </div>

      <h3 class="wb-detail-section-head">产物指纹</h3>
      <div class="prepub-content">
        <div class="prepub-meta-grid prepub-meta-grid--fingerprint">
          <div v-for="row in fingerprintRows" :key="row.label">
            <span>{{ row.label }}</span>
            <strong>{{ row.value }}</strong>
          </div>
        </div>
        <div v-if="serviceFingerprints.length" class="prepub-fingerprint-list">
          <span v-for="fp in serviceFingerprints" :key="fp.serviceId || fp.serviceName">
            {{ fp.serviceName }}<small>{{ fp.schemaHash }}</small>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { assertionDisplayLabel, parseMetaAppArtifact } from './meta_app_artifact_view'

export default {
  name: 'MetaAppPrepublishMaterialsPanel',
  props: {
    artifact: {
      type: Object,
      default: null
    },
    product: {
      type: Object,
      default: () => ({})
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
    serviceFingerprints() {
      return this.view.serviceBindings
        .filter((svc) => svc.schemaHash)
        .map((svc) => ({
          serviceId: svc.serviceId,
          serviceName: svc.serviceName,
          schemaHash: svc.schemaHash
        }))
    },
    fingerprintRows() {
      return [
        { label: 'Schema', value: this.view.schemaVersion },
        { label: 'Artifact ID', value: this.view.artifactId },
        { label: '内容摘要', value: this.artifactDigest },
        { label: '路径 ID', value: this.view.reusablePath.pathId || '未生成' },
        { label: '来源轨迹', value: this.view.reusablePath.sourceTrajectoryId || '未记录' },
        { label: '路径状态', value: this.view.reusablePath.status || '未记录' },
        { label: '绑定服务', value: `${this.view.metrics.serviceCount} 项` },
        { label: '检查规则', value: `${this.view.metrics.assertionCount} 项` }
      ]
    },
    artifactDigest() {
      if (!this.artifact) return '未生成'
      let text = ''
      try {
        text = JSON.stringify(this.artifact)
      } catch (e) {
        text = String(this.artifact)
      }
      let hash = 0
      for (let i = 0; i < text.length; i += 1) {
        hash = ((hash * 31) + text.charCodeAt(i)) >>> 0
      }
      return hash.toString(16).padStart(8, '0')
    }
  },
  methods: {
    serviceDescription(svc) {
      if (svc.description) return svc.description
      if (svc.tools && svc.tools.length) {
        const names = svc.tools.map((tool) => tool.name).filter(Boolean).slice(0, 3)
        return names.length ? `提供 ${names.join('、')} 等能力` : '提供任务所需服务能力'
      }
      return '提供任务所需服务能力'
    }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';

.prepub-artifact-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prepub-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prepub-goal-bubble {
  padding: 9px 10px;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  background: #eff6ff;

  span {
    display: block;
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 600;
  }

  strong {
    display: block;
    margin-top: 4px;
    color: #172033;
    font-size: 13px;
    line-height: 1.5;
  }

  p {
    margin: 6px 0 0;
    color: #475569;
    font-size: 12px;
    line-height: 1.6;
  }
}

.prepub-two-col,
.prepub-meta-grid {
  display: grid;
  gap: 8px;
}

.prepub-two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.prepub-meta-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.prepub-field,
.prepub-meta-grid > div {
  min-width: 0;
  padding: 9px;
  border: 1px solid #edf1f7;
  border-radius: 6px;
  background: #fbfcfe;
}

.prepub-field > span,
.prepub-meta-grid span,
.prepub-path-detail > span {
  display: block;
  color: #697586;
  font-size: 12px;
  font-weight: 600;
}

.prepub-meta-grid strong {
  display: block;
  margin-top: 3px;
  color: #172033;
  font-size: 13px;
  line-height: 1.4;
  word-break: break-word;
}

.prepub-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;

  em,
  i {
    max-width: 100%;
    padding: 4px 7px;
    border: 1px solid #dbeafe;
    border-radius: 4px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: 12px;
    font-style: normal;
    line-height: 1.35;
    word-break: break-word;
  }

  i {
    border-color: #e5e7eb;
    background: #f3f4f6;
    color: #8c8c8c;
  }

  small {
    margin-left: 5px;
    color: #64748b;
    font-size: 11px;
  }
}

.prepub-chip-list--orange em {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.prepub-chip-list--green em {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #047857;
}

.prepub-runtime-block {
  padding: 10px;
  border: 1px solid #edf1f7;
  border-radius: 6px;
  background: #fbfcfe;
}

.prepub-runtime-block-head {
  margin: 0 0 8px;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.prepub-runtime-mode-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  > div {
    min-width: 0;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #fff;
  }

  span {
    display: block;
    color: #697586;
    font-size: 12px;
    font-weight: 600;
  }

  strong {
    display: block;
    margin-top: 3px;
    color: #172033;
    font-size: 12px;
    line-height: 1.45;
    word-break: break-word;
  }
}

.prepub-runtime-summary {
  margin: 0 0 8px;
  color: #64748b;
  font-size: 12px;
}

.prepub-fallback-summary {
  margin: 0;
  color: #334155;
  font-size: 13px;
  line-height: 1.6;
}

.prepub-fallback-empty {
  color: #8c8c8c;
  font-size: 12px;
}

.prepub-fallback-details {
  margin-top: 8px;

  summary {
    color: #1d4ed8;
    font-size: 12px;
    cursor: pointer;
    user-select: none;
  }
}

.prepub-fallback-triggers {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.prepub-runtime-list,
.prepub-fallback-flow {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prepub-runtime-list article {
  padding: 8px 0;
  border-top: 1px solid #edf1f7;

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  strong {
    color: #172033;
    font-size: 13px;
  }

  header span {
    color: #697586;
    font-size: 12px;
  }
}

.prepub-fallback-flow article {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(0, 1.2fr);
  gap: 8px;
  align-items: start;
  padding: 8px 9px;
  border: 1px solid #edf1f7;
  border-radius: 6px;
  background: #fff;

  span {
    color: #697586;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
  }

  strong {
    color: #172033;
    font-size: 12px;
    line-height: 1.45;
  }
}

.prepub-path-content {
  gap: 8px;
}

.prepub-path-chain {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 6px 0;
}

.prepub-path-chain span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #065f46;
  font-size: 11px;
  font-weight: 600;
}

.prepub-path-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prepub-path-list li {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 8px;
}

.prepub-path-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  color: #3730a3;
  font-size: 11px;
  font-weight: 700;
}

.prepub-path-body {
  min-width: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #edf1f7;

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
  }

  strong {
    color: #172033;
    font-size: 12px;
  }

  header span {
    color: #697586;
    font-size: 11px;
  }
}

.prepub-path-detail {
  margin-top: 5px;
}

.prepub-code-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 4px;

  code,
  i {
    max-width: 100%;
    padding: 2px 5px;
    border-radius: 4px;
    background: #f3f4f6;
    color: #475569;
    font-size: 11px;
    font-style: normal;
    white-space: normal;
    word-break: break-word;
  }

  i {
    color: #8c8c8c;
  }
}

.prepub-check-block {
  padding-top: 2px;

  > strong {
    color: #172033;
    font-size: 12px;
  }
}

.prepub-check-list,
.prepub-fingerprint-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;

  span,
  i {
    padding: 4px 7px;
    border-radius: 4px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #334155;
    font-size: 12px;
    font-style: normal;
  }

  small {
    margin-left: 5px;
    color: #64748b;
  }
}

.prepub-path-content .prepub-path-detail > span,
.prepub-path-content .prepub-check-list span,
.prepub-path-content .prepub-check-list i {
  font-size: 11px;
}

@media (max-width: 900px) {
  .prepub-two-col,
  .prepub-meta-grid,
  .prepub-runtime-mode-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .prepub-fallback-flow article {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .prepub-two-col,
  .prepub-meta-grid,
  .prepub-runtime-mode-grid,
  .prepub-path-list li,
  .prepub-fallback-flow article {
    grid-template-columns: 1fr;
  }
}
</style>
