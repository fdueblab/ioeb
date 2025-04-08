<template>
  <div class="agent-execution-panel" :class="{ collapsed: isCollapsed }">
    <div class="panel-header" @click="toggleCollapse">
      <div class="title">
        <a-icon :type="isCollapsed ? 'right' : 'down'" />
        <span>Agent执行过程 {{ isRunning ? '(运行中...)' : '(完成)' }}</span>
      </div>
      <div class="controls">
        <a-button type="link" icon="close" @click.stop="closePanel" />
      </div>
    </div>

    <div v-if="!isCollapsed" class="panel-body">
      <!-- 执行步骤列表 -->
      <div class="steps-container">
        <div v-for="(step, index) in steps" :key="index" class="step-card">
          <div class="step-header">
            <span>步骤 {{ step.step }}</span>
          </div>
          <div class="step-content">
            <div v-if="step.thought" class="thought"><strong>思考:</strong><br />{{ step.thought }}</div>
            <div v-if="step.action" class="action"><strong>行动:</strong><br />{{ step.action }}</div>
            <div v-if="step.action_result" class="action-result">
              <strong>结果:</strong><br />{{ step.action_result }}
            </div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="step-card error">
          <div class="step-header">错误</div>
          <div class="step-content">{{ error }}</div>
        </div>

        <!-- 警告信息 -->
        <div v-if="warning" class="step-card warning">
          <div class="step-header">警告</div>
          <div class="step-content">{{ warning }}</div>
        </div>

        <!-- 加载指示器 -->
        <div v-if="isRunning" class="loading-indicator">
          <a-spin />
        </div>
      </div>

      <!-- 最终结果 -->
      <div v-if="finalResults" class="final-results">
        <div class="final-results-header">最终结果</div>
        <a-tabs>
          <a-tab-pane v-for="(value, key) in finalResults" :key="key" :tab="key">
            <pre class="json-viewer">{{ formatJson(value) }}</pre>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentExecutionPanel',
  props: {
    // 是否正在运行
    isRunning: {
      type: Boolean,
      default: false
    },
    // 执行步骤
    steps: {
      type: Array,
      default: () => []
    },
    // 错误信息
    error: {
      type: String,
      default: ''
    },
    // 警告信息
    warning: {
      type: String,
      default: ''
    },
    // 最终结果
    finalResults: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isCollapsed: false
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    closePanel() {
      this.$emit('close')
    },
    formatJson(value) {
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return value
    }
  },
  watch: {
    steps: {
      handler() {
        // 当有新步骤添加时，滚动到底部
        this.$nextTick(() => {
          const container = this.$el.querySelector('.steps-container')
          if (container) {
            container.scrollTop = container.scrollHeight
          }
        })
      },
      deep: true
    }
  }
}
</script>

<style lang="less" scoped>
.agent-execution-panel {
  position: fixed;
  bottom: 0;
  right: 20px;
  width: 550px;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: all 0.3s;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  &.collapsed {
    height: 40px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background-color: #fafafa;
    border-bottom: 1px solid #e8e8e8;
    cursor: pointer;
    border-radius: 8px 8px 0 0;

    .title {
      display: flex;
      align-items: center;

      .anticon {
        margin-right: 8px;
      }
    }
  }

  .panel-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .steps-container {
      padding: 16px;
      overflow-y: auto;
      max-height: 400px;

      .step-card {
        margin-bottom: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .step-header {
          padding: 8px 12px;
          border-bottom: 1px solid #dee2e6;
          background-color: #f1f3f5;
          border-radius: 8px 8px 0 0;
          font-weight: bold;
        }

        .step-content {
          padding: 12px;
          background-color: #fff;
          border-radius: 0 0 8px 8px;

          .thought {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #f0f7ff;
            border-radius: 6px;
          }

          .action {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #fff5e6;
            border-radius: 6px;
          }

          .action-result {
            margin-bottom: 10px;
            padding: 8px;
            background-color: #f0fff0;
            border-radius: 6px;
          }
        }

        &.error .step-content {
          background-color: #f8d7da;
        }

        &.warning .step-content {
          background-color: #fff3cd;
        }
      }

      .loading-indicator {
        text-align: center;
        padding: 16px;
      }
    }

    .final-results {
      padding: 16px;
      border-top: 1px solid #e8e8e8;

      .final-results-header {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 12px;
        color: #0050b3;
      }

      .json-viewer {
        background-color: #f8f9fa;
        padding: 12px;
        border-radius: 6px;
        font-family: monospace;
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 200px;
        overflow-y: auto;
      }
    }
  }
}
</style>
