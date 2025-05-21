<template>
  <div class="module-editor">
    <a-card title="模块配置" :bordered="false" class="editor-card">
      <a-spin :spinning="loading">
        <a-tabs v-model="activeTab" @change="handleTabChange">
          <a-tab-pane key="dataInput" tab="数据接入模块">
            <div class="editor-section">
              <h3 class="section-title">基本设置</h3>
              <a-form-item label="是否显示模块" :labelCol="{ span: 8 }">
                <a-switch v-model="moduleConfig.dataInput.visible" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="模块标题">
                <a-input v-model="moduleConfig.dataInput.title" placeholder="请输入模块标题" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="是否显示标签" :labelCol="{ span: 8 }">
                <a-switch v-model="moduleConfig.dataInput.showTag" @change="emitConfigChange" />
              </a-form-item>
              <a-row :gutter="8" v-if="moduleConfig.dataInput.showTag">
                <a-col :span="18">
                  <a-form-item label="标签文本">
                    <a-input v-model="moduleConfig.dataInput.tagText" placeholder="请输入标签文本" @change="emitConfigChange" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
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
                </a-col>
              </a-row>
            </div>

            <div v-if="moduleConfig.dataInput.visible">
              <div class="editor-section">
                <a-form-item label="开始按钮文本">
                  <div class="input-with-icon-selector">
                    <a-input v-model="moduleConfig.dataInput.buttonText" placeholder="请输入开始按钮文本" @change="emitConfigChange" />
                    <a-dropdown>
                      <a-button style="margin-left: 8px">
                        <a-icon :type="moduleConfig.dataInput.buttonIcon || 'play-circle'" />
                        <a-icon type="down" />
                      </a-button>
                      <a-menu slot="overlay" @click="e => handleIconSelect('dataInput', 'buttonIcon', e.key)">
                        <a-menu-item v-for="icon in iconOptions" :key="icon">
                          <a-icon :type="icon" /> {{ icon }}
                        </a-menu-item>
                      </a-menu>
                    </a-dropdown>
                  </div>
                </a-form-item>
                <a-form-item label="停止按钮文本">
                  <div class="input-with-icon-selector">
                    <a-input v-model="moduleConfig.dataInput.buttonStopText" placeholder="请输入停止按钮文本" @change="emitConfigChange" />
                    <a-dropdown>
                      <a-button style="margin-left: 8px">
                        <a-icon :type="moduleConfig.dataInput.buttonStopIcon || 'pause-circle'" />
                        <a-icon type="down" />
                      </a-button>
                      <a-menu slot="overlay" @click="e => handleIconSelect('dataInput', 'buttonStopIcon', e.key)">
                        <a-menu-item v-for="icon in iconOptions" :key="icon">
                          <a-icon :type="icon" /> {{ icon }}
                        </a-menu-item>
                      </a-menu>
                    </a-dropdown>
                  </div>
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
            </div>
          </a-tab-pane>

          <a-tab-pane key="statistics" tab="统计分析模块">
            <div class="editor-section">
              <h3 class="section-title">基本设置</h3>
              <a-form-item label="是否显示模块" :labelCol="{ span: 8 }">
                <a-switch v-model="moduleConfig.statistics.visible" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="模块标题">
                <a-input v-model="moduleConfig.statistics.title" placeholder="请输入模块标题" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="是否显示标签" :labelCol="{ span: 8 }">
                <a-switch v-model="moduleConfig.statistics.showTag" @change="emitConfigChange" />
              </a-form-item>
              <a-row :gutter="8" v-if="moduleConfig.statistics.showTag">
                <a-col :span="18">
                  <a-form-item label="标签文本">
                    <a-input v-model="moduleConfig.statistics.tagText" placeholder="请输入标签文本" @change="emitConfigChange" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
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
                </a-col>
              </a-row>
            </div>

            <div v-if="moduleConfig.statistics.visible">
              <div class="editor-section">
                <a-form-item label="更新按钮文本">
                  <div class="input-with-icon-selector">
                    <a-input v-model="moduleConfig.statistics.buttonText" placeholder="请输入更新按钮文本" @change="emitConfigChange" />
                    <a-dropdown>
                      <a-button style="margin-left: 8px">
                        <a-icon :type="moduleConfig.statistics.buttonIcon || 'reload'" />
                        <a-icon type="down" />
                      </a-button>
                      <a-menu slot="overlay" @click="e => handleIconSelect('statistics', 'buttonIcon', e.key)">
                        <a-menu-item v-for="icon in iconOptions" :key="icon">
                          <a-icon :type="icon" /> {{ icon }}
                        </a-menu-item>
                      </a-menu>
                    </a-dropdown>
                  </div>
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
            </div>
          </a-tab-pane>

          <a-tab-pane key="report" tab="报告生成模块">
            <div class="editor-section">
              <h3 class="section-title">基本设置</h3>
              <a-form-item label="是否显示模块" :labelCol="{ span: 8 }">
                <a-switch v-model="moduleConfig.report.visible" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="模块标题">
                <a-input v-model="moduleConfig.report.title" placeholder="请输入模块标题" @change="emitConfigChange" />
              </a-form-item>
              <a-form-item label="是否显示标签" :labelCol="{ span: 8 }">
                <a-switch v-model="moduleConfig.report.showTag" @change="emitConfigChange" />
              </a-form-item>
              <a-row :gutter="8" v-if="moduleConfig.report.showTag">
                <a-col :span="18">
                  <a-form-item label="标签文本">
                    <a-input v-model="moduleConfig.report.tagText" placeholder="请输入标签文本" @change="emitConfigChange" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
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
                </a-col>
              </a-row>
            </div>

            <div v-if="moduleConfig.report.visible">
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
                  <div class="input-with-icon-selector">
                    <a-input v-model="moduleConfig.report.generateButtonText" placeholder="请输入生成按钮文本" @change="emitConfigChange" />
                    <a-dropdown>
                      <a-button style="margin-left: 8px">
                        <a-icon :type="moduleConfig.report.generateButtonIcon || 'file-text'" />
                        <a-icon type="down" />
                      </a-button>
                      <a-menu slot="overlay" @click="e => handleIconSelect('report', 'generateButtonIcon', e.key)">
                        <a-menu-item v-for="icon in iconOptions" :key="icon">
                          <a-icon :type="icon" /> {{ icon }}
                        </a-menu-item>
                      </a-menu>
                    </a-dropdown>
                  </div>
                </a-form-item>
              </div>

              <div class="editor-section">
                <h3 class="section-title">重置选项</h3>
                <a-form-item label="重置按钮文本">
                  <div class="input-with-icon-selector">
                    <a-input v-model="moduleConfig.report.resetButtonText" placeholder="请输入重置按钮文本" @change="emitConfigChange" />
                    <a-dropdown>
                      <a-button style="margin-left: 8px">
                        <a-icon :type="moduleConfig.report.resetButtonIcon || 'delete'" />
                        <a-icon type="down" />
                      </a-button>
                      <a-menu slot="overlay" @click="e => handleIconSelect('report', 'resetButtonIcon', e.key)">
                        <a-menu-item v-for="icon in iconOptions" :key="icon">
                          <a-icon :type="icon" /> {{ icon }}
                        </a-menu-item>
                      </a-menu>
                    </a-dropdown>
                  </div>
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
            </div>
          </a-tab-pane>
        </a-tabs>
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
      loading: false,
      iconOptions: [
        'play-circle', 'pause-circle', 'stop', 'reload',
        'cloud-upload', 'cloud-download', 'cloud-sync',
        'pie-chart', 'bar-chart', 'line-chart', 'area-chart',
        'database', 'file-text', 'file-excel', 'file-pdf',
        'dashboard', 'check-circle', 'clock-circle', 'warning',
        'delete', 'redo', 'undo', 'sync', 'setting',
        'rocket', 'bulb', 'api', 'build'
      ]
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
    },

    handleIconSelect(module, property, icon) {
      this.moduleConfig[module][property] = icon
      this.emitConfigChange()
    }
  }
}
</script>

<style lang="less" scoped>
.module-editor {
  .editor-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
  }

  .editor-section {
    margin-bottom: 24px;
    background-color: #ffffff;
    padding: 16px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1890ff;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #e8e8e8;
    }
  }

  .data-source-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px;
    border-radius: 4px;
    background-color: #f9f9f9;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f0f7ff;
    }
  }

  .editor-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    text-align: right;
  }

  .input-with-icon-selector {
    display: flex;
    align-items: center;
  }

  /deep/ .ant-tabs-nav .ant-tabs-tab {
    transition: all 0.3s ease;

    &:hover {
      color: #1890ff;
    }

    &.ant-tabs-tab-active {
      font-weight: 600;
    }
  }

  /deep/ .ant-form-item-label label {
    color: #333;
    font-weight: 500;
  }

  /deep/ .ant-btn {
    transition: all 0.3s ease;

    &:not(.ant-btn-primary):not(.ant-btn-danger):hover {
      color: #1890ff;
      border-color: #1890ff;
    }
  }
}
</style>
