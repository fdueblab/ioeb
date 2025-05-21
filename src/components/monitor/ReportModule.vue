<template>
  <div class="report-module" v-if="moduleConfig.visible">
    <a-card class="section-card" :bordered="false">
      <div class="section-header">
        <h3>{{ moduleConfig.title }}</h3>
        <div class="section-tag">
          <a-tag :color="moduleConfig.tagColor">{{ moduleConfig.tagText }}</a-tag>
        </div>
      </div>

      <div class="report-container">
        <p class="report-description">
          {{ moduleConfig.description }}
        </p>

        <!-- 报告内容区域 -->
        <div v-if="monitoringReport" class="report-content">
          <h4 class="report-content-title">
            <a-icon type="file-text" />
            {{ moduleConfig.reportContentTitle }}
          </h4>
          <div class="report-timestamp" v-if="reportTimestamp">
            <a-icon type="clock-circle" />
            生成时间: {{ reportTimestamp }}
          </div>
          <a-spin v-if="reportLoading" class="report-loading" />
          <div v-else class="report-text">
            <pre>{{ monitoringReport }}</pre>
          </div>
        </div>

        <div class="report-actions">
          <a-button
            type="primary"
            @click="generateReport"
            :loading="reportLoading"
            :disabled="!monitoringState.isMonitoring && !monitoringState.hasMonitoringData"
            class="action-button"
          >
            <a-icon :type="moduleConfig.generateButtonIcon || 'file-text'" />
            {{ moduleConfig.generateButtonText }}
          </a-button>

          <a-popconfirm
            :title="moduleConfig.resetConfirmTitle"
            @confirm="clearMonitoringState"
            :okText="moduleConfig.resetConfirmOkText"
            :cancelText="moduleConfig.resetConfirmCancelText"
          >
            <a-button type="danger" class="action-button danger-button">
              <a-icon :type="moduleConfig.resetButtonIcon || 'delete'" />
              {{ moduleConfig.resetButtonText }}
            </a-button>
          </a-popconfirm>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'ReportModule',
  props: {
    moduleConfig: {
      type: Object,
      required: true
    },
    monitoringState: {
      type: Object,
      default: () => ({
        transactionCount: 0,
        anomalyCount: 0,
        monitoringDuration: '00:00:00',
        hasMonitoringData: false,
        isMonitoring: false
      })
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      monitoringReport: '',
      reportLoading: false,
      reportTimestamp: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.restoreReportState()
    })
  },
  methods: {
    // 恢复报告状态
    restoreReportState() {
      try {
        const savedState = localStorage.getItem('amlReportState')
        if (savedState) {
          const state = JSON.parse(savedState)
          console.log('发现保存的报告状态:', state)

          if (state.monitoringReport) {
            this.monitoringReport = state.monitoringReport
            this.reportTimestamp = state.reportTimestamp || ''
          }
        } else {
          console.log('没有找到保存的报告状态，使用默认值')
        }
      } catch (error) {
        console.error('恢复报告状态时出错:', error)
      }
    },

    // 保存报告状态
    saveReportState() {
      try {
        const stateToSave = {
          monitoringReport: this.monitoringReport,
          reportTimestamp: this.reportTimestamp
        }

        const stateJson = JSON.stringify(stateToSave)
        localStorage.setItem('amlReportState', stateJson)
        console.log('报告状态已保存')
      } catch (error) {
        console.error('保存报告状态时出错:', error)
      }
    },

    // 生成监测报告
    generateReport() {
      if (this.isEditing) {
        this.$message.warning('编辑模式下不能生成报告')
        return
      }

      this.reportLoading = true
      this.reportTimestamp = new Date().toLocaleString()

      // 保存当前状态
      this.saveReportState()

      const defaultMonitoringReport =
        '```markdown\n# AML风险分析报告（基于GNN模型预测）\n\n' +
        '## 1. 执行摘要\n' +
        '本报告基于图神经网络(GNN)模型对2500个实体节点的风险预测结果进行分析，识别出潜在洗钱风险模式和重点关注对象。核心发现：\n' +
        '- **高风险集中性**：共检测到5个高风险节点(类别2)，占比0.2%，表现出异常资金流动特征\n' +
        '- **网络关联风险**：高风险节点呈现集群特征（如节点5-8连续高风险），暗示可能存在结构化交易网络\n' +
        '- **风险分布特征**：99.6%节点为低风险(类别0)，0.2%中风险(类别1)，整体风险分布符合"长尾效应"\n' +
        '## 2. 风险评估方法\n' +
        '### 2.1 模型框架\n' +
        '- **技术架构**：采用图注意力网络(GAT)模型，融合交易金额、频率、关联深度等128维特征\n' +
        '- **风险分类**：\n' +
        '  - 类别0（低风险）：正常交易模式，SAR报告概率<5%\n' +
        '  - 类别1（中风险）：需增强尽调，SAR报告概率5-35%\n' +
        '  - 类别2（高风险）：优先调查，SAR报告概率>35%\n' +
        '### 2.2 验证指标\n' +
        '| 指标        | 值    |\n' +
        '|-------------|-------|\n' +
        '| 准确率      | 92.7% |\n' +
        '| AUC-ROC     | 0.881 |\n' +
        '| 高风险召回率| 89.3% |\n' +
        '## 3. 高风险实体分析\n' +
        '### 3.1 关键风险节点\n' +
        '| 节点ID | 关联度数 | 主要风险特征                  |\n' +
        '|--------|----------|-------------------------------|\n' +
        '| 0      | 17       | 跨境外壳公司关联，交易对手集中|\n' +
        '| 5      | 23       | 高频小额拆分交易(87笔/日)     |\n' +
        '| 6      | 9        | 与3个制裁名单实体二阶关联     |\n' +
        '### 3.2 风险集群特征\n' +
        '- **地理异常**：节点5-8均通过塞浦路斯中转账户交易\n' +
        '- **时间模式**：集中在UTC+8时区非工作时间(20:00-04:00)\n' +
        '- **金额特征**：交易金额均符合"$9,500±200"的规避报告阈值模式\n' +
        '## 4. 风险模式识别\n' +
        '### 4.1 主要洗钱手法\n' +
        '1. **结构化交易(Smurfing)**：\n' +
        '- 节点5呈现典型的"分散-集中"资金流\n' +
        '2. **嵌套账户滥用**：\n' +
        '- 高风险节点平均穿透层级达4.3（全网络均值1.8）\n' +
        '- 节点0与离岸金融中心(BVI)账户存在多跳关联\n' +
        '## 5. 建议监控措施\n' +
        '### 5.1 即时行动\n' +
        '1. **冻结审查**：\n' +
        '- 对节点5关联账户实施90天临时冻结\n' +
        '- 要求节点0提供最终受益人(UBO)证明文件\n' +
        '2. **增强监控**：\n' +
        '- 对$9,500-10,000区间交易增设实时预警规则\n' +
        '- 对塞浦路斯路由交易实施双因素验证\n' +
        '```'

      // 模拟生成报告
      setTimeout(() => {
        this.monitoringReport = defaultMonitoringReport
        this.reportLoading = false
        this.saveReportState()
      }, 2000)
    },

    // 清除监测状态
    clearMonitoringState() {
      if (this.isEditing) {
        this.$message.warning('编辑模式下不能重置监测状态')
        return
      }

      // 清除localStorage中保存的状态
      localStorage.removeItem('amlMonitoringState')
      localStorage.removeItem('amlStatisticsState')
      localStorage.removeItem('amlReportState')

      // 重置报告相关状态
      this.monitoringReport = ''
      this.reportTimestamp = ''
      this.reportLoading = false

      this.$message.success('监测状态已重置')

      // 通知父组件重置监测状态
      this.$emit('reset-monitoring')
    }
  }
}
</script>

<style lang="less" scoped>
.report-module {
  .section-card {
    margin-bottom: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.09);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    /deep/ .ant-card-body {
      padding: 0;
    }
  }

  // 区域标题样式
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #f0f0f0;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(to bottom, #1890ff, #52c41a);
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e3799;
      margin: 0;
    }

    .section-tag {
      display: flex;
      align-items: center;

      /deep/ .ant-tag {
        border-radius: 4px;
        font-weight: 500;
        padding: 2px 8px;
        margin-right: 0;
      }
    }
  }

  // 报告容器样式
  .report-container {
    padding: 20px;
    background-color: #fff;

    .report-description {
      margin-bottom: 20px;
      color: #666;
      line-height: 1.8;
      padding: 12px;
      background-color: #f9f9f9;
      border-left: 3px solid #1890ff;
      border-radius: 0 4px 4px 0;
    }

    .report-content {
      margin: 20px 0;
      padding: 20px;
      background-color: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .report-content-title {
        font-size: 16px;
        font-weight: 600;
        color: #1e3799;
        margin-bottom: 12px;
        display: flex;
        align-items: center;

        /deep/ .anticon {
          margin-right: 8px;
          color: #1890ff;
        }
      }

      .report-timestamp {
        font-size: 13px;
        color: #999;
        margin-bottom: 20px;
        display: flex;
        align-items: center;

        /deep/ .anticon {
          margin-right: 5px;
          color: #999;
        }
      }

      .report-loading {
        display: flex;
        justify-content: center;
        padding: 30px 0;
      }

      .report-text {
        max-height: 400px;
        overflow-y: auto;
        background-color: #fff;
        padding: 16px;
        border-radius: 6px;
        border: 1px solid #eee;

        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
        }
      }
    }

    .report-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;

      .action-button {
        min-width: 120px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
        }

        /deep/ .anticon {
          margin-right: 8px;
        }
      }

      .danger-button {
        &:hover {
          box-shadow: 0 4px 12px rgba(245, 34, 45, 0.4);
        }
      }
    }
  }
}
</style>
