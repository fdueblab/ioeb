<template>
  <div class="module-editor">
    <a-card title="模块配置" :bordered="false">
      <a-spin :spinning="loading">
        <a-tabs v-model="activeTab" @change="handleTabChange">
          <a-tab-pane key="dataInput" tab="数据接入模块">
            <div class="editor-section">
              <h3 class="section-title">基本设置</h3>
              <a-form-item label="是否显示模块">
                <a-switch v-model="moduleConfig.dataInput.visible" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="模块标题">
                <a-input v-model="moduleConfig.dataInput.title" placeholder="请输入模块标题" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="标签文本">
                <a-input v-model="moduleConfig.dataInput.tagText" placeholder="请输入标签文本" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="标签颜色">
                <a-select v-model="moduleConfig.dataInput.tagColor" @change="emitConfigChange">
                  <a-select-option value="blue">蓝色</a-select-option>
                  <a-select-option value="green">绿色</a-select-option>
                  <a-select-option value="red">红色</a-select-option>
                  <a-select-option value="orange">橙色</a-select-option>
                  <a-select-option value="purple">紫色</a-select-option>
                  <a-select-option value="cyan">青色</a-select-option>
                </a-select>
              </a-form-item>
            </div>

            <div class="editor-section">
              <h3 class="section-title">按钮文本</h3>
              <a-form-item label="开始按钮文本">
                <a-input v-model="moduleConfig.dataInput.buttonText" placeholder="请输入开始按钮文本" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="停止按钮文本">
                <a-input v-model="moduleConfig.dataInput.buttonStopText" placeholder="请输入停止按钮文本" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="预警表格标题">
                <a-input v-model="moduleConfig.dataInput.alertTitle" placeholder="请输入预警表格标题" @change="emitConfigChange" />
              </a-form-item>
            </div>

            <div class="editor-section">
              <h3 class="section-title">数据源配置</h3>
              <a-form-item>
                <template v-for="(source, index) in moduleConfig.dataInput.dataSources">
                  <div :key="index" class="data-source-item">
                    <a-input
                      v-model="source.label"
                      style="width: 40%;"
                      placeholder="数据源名称"
                      @change="emitConfigChange"
                    />
                    <a-input
                      v-model="source.value"
                      style="width: 40%; margin-left: 8px;"
                      placeholder="数据源值"
                      @change="emitConfigChange"
                    />
                    <a-button
                      type="danger"
                      icon="delete"
                      style="margin-left: 8px;"
                      @click="removeDataSource(index)"
                    />
                  </div>
                </template>
                <a-button type="dashed" style="width: 100%; margin-top: 8px;" @click="addDataSource">
                  <a-icon type="plus" /> 添加数据源
                </a-button>
              </a-form-item>
            </div>
          </a-tab-pane>

          <a-tab-pane key="statistics" tab="统计分析模块">
            <div class="editor-section">
              <h3 class="section-title">基本设置</h3>
              <a-form-item label="是否显示模块">
                <a-switch v-model="moduleConfig.statistics.visible" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="模块标题">
                <a-input v-model="moduleConfig.statistics.title" placeholder="请输入模块标题" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="标签文本">
                <a-input v-model="moduleConfig.statistics.tagText" placeholder="请输入标签文本" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="标签颜色">
                <a-select v-model="moduleConfig.statistics.tagColor" @change="emitConfigChange">
                  <a-select-option value="blue">蓝色</a-select-option>
                  <a-select-option value="green">绿色</a-select-option>
                  <a-select-option value="red">红色</a-select-option>
                  <a-select-option value="orange">橙色</a-select-option>
                  <a-select-option value="purple">紫色</a-select-option>
                  <a-select-option value="cyan">青色</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="更新按钮文本">
                <a-input v-model="moduleConfig.statistics.buttonText" placeholder="请输入更新按钮文本" @change="emitConfigChange" />
              </a-form-item>
            </div>

            <div class="editor-section">
              <h3 class="section-title">交易概览配置</h3>
              <a-form-item label="概览标题">
                <a-input v-model="moduleConfig.statistics.overviewTitle" placeholder="请输入概览标题" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="监测时长标签">
                <a-input v-model="moduleConfig.statistics.overviewLabels.duration" placeholder="监测时长标签" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="总额标签">
                <a-input v-model="moduleConfig.statistics.overviewLabels.totalAmount" placeholder="总额标签" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="交易量标签">
                <a-input v-model="moduleConfig.statistics.overviewLabels.transactionCount" placeholder="交易量标签" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="均额标签">
                <a-input v-model="moduleConfig.statistics.overviewLabels.avgAmount" placeholder="均额标签" @change="emitConfigChange" />
              </a-form-item>
            </div>

            <div class="editor-section">
              <h3 class="section-title">异常统计配置</h3>
              <a-form-item label="异常统计标题">
                <a-input v-model="moduleConfig.statistics.anomalyTitle" placeholder="请输入异常统计标题" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="高风险标签">
                <a-input v-model="moduleConfig.statistics.anomalyLabels.highRisk" placeholder="高风险标签" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="中风险标签">
                <a-input v-model="moduleConfig.statistics.anomalyLabels.mediumRisk" placeholder="中风险标签" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="低风险标签">
                <a-input v-model="moduleConfig.statistics.anomalyLabels.lowRisk" placeholder="低风险标签" @change="emitConfigChange" />
              </a-form-item>
            </div>
          </a-tab-pane>

          <a-tab-pane key="report" tab="报告生成模块">
            <div class="editor-section">
              <h3 class="section-title">基本设置</h3>
              <a-form-item label="是否显示模块">
                <a-switch v-model="moduleConfig.report.visible" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="模块标题">
                <a-input v-model="moduleConfig.report.title" placeholder="请输入模块标题" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="标签文本">
                <a-input v-model="moduleConfig.report.tagText" placeholder="请输入标签文本" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="标签颜色">
                <a-select v-model="moduleConfig.report.tagColor" @change="emitConfigChange">
                  <a-select-option value="blue">蓝色</a-select-option>
                  <a-select-option value="green">绿色</a-select-option>
                  <a-select-option value="red">红色</a-select-option>
                  <a-select-option value="orange">橙色</a-select-option>
                  <a-select-option value="purple">紫色</a-select-option>
                  <a-select-option value="cyan">青色</a-select-option>
                </a-select>
              </a-form-item>
            </div>

            <div class="editor-section">
              <h3 class="section-title">报告配置</h3>
              <a-form-item label="描述文本">
                <a-textarea
                  v-model="moduleConfig.report.description"
                  placeholder="请输入描述文本"
                  :rows="4"
                  @change="emitConfigChange"
                />
              </a-form-item>
              <a-form-item label="报告标题">
                <a-input v-model="moduleConfig.report.reportContentTitle" placeholder="请输入报告标题" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="生成按钮文本">
                <a-input v-model="moduleConfig.report.generateButtonText" placeholder="请输入生成按钮文本" @change="emitConfigChange" />
              </a-form-item>
            </div>

            <div class="editor-section">
              <h3 class="section-title">重置选项</h3>
              <a-form-item label="重置按钮文本">
                <a-input v-model="moduleConfig.report.resetButtonText" placeholder="请输入重置按钮文本" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="确认提示文本">
                <a-input v-model="moduleConfig.report.resetConfirmTitle" placeholder="请输入确认提示文本" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="确认按钮文本">
                <a-input v-model="moduleConfig.report.resetConfirmOkText" placeholder="确认按钮文本" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="取消按钮文本">
                <a-input v-model="moduleConfig.report.resetConfirmCancelText" placeholder="取消按钮文本" @change="emitConfigChange" />
              </a-form-item>
            </div>
          </a-tab-pane>
        </a-tabs>

        <div class="editor-actions">
          <!-- 已实现实时更新，移除保存按钮 -->
        </div>
      </a-spin>
    </a-card>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'

export default {
  name: 'ModuleEditor',
  props: {
    initialConfig: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      activeTab: 'dataInput',
      moduleConfig: cloneDeep(this.initialConfig),
      loading: false
    }
  },
  watch: {
    initialConfig: {
      handler(newVal) {
        this.moduleConfig = cloneDeep(newVal)
      },
      deep: true
    }
  },
  methods: {
    handleTabChange(activeKey) {
      this.activeTab = activeKey
    },

    addDataSource() {
      this.moduleConfig.dataInput.dataSources.push({
        value: 'new_source_' + new Date().getTime(),
        label: '新数据源'
      })
      this.emitConfigChange()
    },

    removeDataSource(index) {
      this.moduleConfig.dataInput.dataSources.splice(index, 1)
      this.emitConfigChange()
    },

    emitConfigChange() {
      // 实时向父组件传递配置更新
      this.$emit('config-change', cloneDeep(this.moduleConfig))
    }
  }
}
</script>

<style lang="less" scoped>
.module-editor {
  .editor-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #e8e8e8;
    }
  }

  .data-source-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .editor-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    text-align: right;
  }
}
</style>
