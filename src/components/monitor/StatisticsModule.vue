<template>
  <div class="statistics-module" v-if="moduleConfig.visible">
    <a-card class="section-card" :bordered="false">
      <div class="section-header">
        <h3>{{ moduleConfig.title }}</h3>
        <div class="section-tag">
          <a-tag :color="moduleConfig.tagColor">{{ moduleConfig.tagText }}</a-tag>
        </div>
      </div>

      <div class="statistics-container">
        <div class="statistics-section">
          <h3 class="statistics-title">
            <a-icon type="area-chart" />
            {{ moduleConfig.overviewTitle }}
          </h3>
          <div class="statistics-item">
            <span class="label">{{ moduleConfig.overviewLabels.duration }}</span>
            <span class="value">{{ monitoringState.monitoringDuration || '00:00:00' }}</span>
          </div>
          <div class="statistics-item">
            <span class="label">{{ moduleConfig.overviewLabels.totalAmount }}</span>
            <span class="value">${{ statisticsData.totalAmount.toLocaleString() }} USD</span>
          </div>
          <div class="statistics-item">
            <span class="label">{{ moduleConfig.overviewLabels.transactionCount }}</span>
            <span class="value">{{ monitoringState.transactionCount || 0 }} 笔</span>
          </div>
          <div class="statistics-item">
            <span class="label">{{ moduleConfig.overviewLabels.avgAmount }}</span>
            <span class="value">${{ statisticsData.avgAmount.toLocaleString() }} USD</span>
          </div>
        </div>

        <div class="statistics-section">
          <h3 class="statistics-title">
            <a-icon type="warning" />
            {{ moduleConfig.anomalyTitle }}
          </h3>
          <div class="statistics-item">
            <span class="label">{{ moduleConfig.anomalyLabels.highRisk }}</span>
            <span class="value">{{ statisticsData.highRiskCount }} 笔 ({{
              transactionCount > 0
                ? ((statisticsData.highRiskCount / transactionCount) * 100).toFixed(2)
                : '0'
            }}%)</span>
          </div>
          <div class="statistics-item">
            <span class="label">{{ moduleConfig.anomalyLabels.mediumRisk }}</span>
            <span class="value">{{ statisticsData.mediumRiskCount }} 笔 ({{
              transactionCount > 0
                ? ((statisticsData.mediumRiskCount / transactionCount) * 100).toFixed(2)
                : '0'
            }}%)</span>
          </div>
          <div class="statistics-item">
            <span class="label">{{ moduleConfig.anomalyLabels.lowRisk }}</span>
            <span class="value">{{ statisticsData.lowRiskCount }} 笔 ({{
              transactionCount > 0
                ? ((statisticsData.lowRiskCount / transactionCount) * 100).toFixed(2)
                : '0'
            }}%)</span>
          </div>
        </div>
      </div>

      <div class="section-footer">
        <a-button
          type="primary"
          @click="generateStats"
          :disabled="!monitoringState.isMonitoring && !monitoringState.hasMonitoringData"
          class="action-button"
        >
          <a-icon :type="moduleConfig.buttonIcon || 'reload'" />
          {{ moduleConfig.buttonText }}
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'StatisticsModule',
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
      statisticsData: {
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        totalAmount: 0,
        avgAmount: 0
      }
    }
  },
  computed: {
    transactionCount() {
      return this.monitoringState.transactionCount || 0
    }
  },
  watch: {
    'monitoringState.anomalyCount'(newVal) {
      // 当异常数量变化时，更新高风险和中风险交易统计
      if (newVal > 0) {
        this.updateRiskDistribution(newVal)
      }
    },
    'monitoringState.transactionCount'(newVal) {
      if (newVal > 0) {
        this.updateTransactionStats(newVal)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.restoreStatisticsState()
    })
  },
  methods: {
    // 恢复统计状态
    restoreStatisticsState() {
      try {
        const savedState = localStorage.getItem('amlStatisticsState')
        if (savedState) {
          const state = JSON.parse(savedState)
          console.log('发现保存的统计状态:', state)

          if (state.statisticsData) {
            this.statisticsData = {
              highRiskCount: parseInt(state.statisticsData.highRiskCount) || 0,
              mediumRiskCount: parseInt(state.statisticsData.mediumRiskCount) || 0,
              lowRiskCount: parseInt(state.statisticsData.lowRiskCount) || 0,
              totalAmount: parseInt(state.statisticsData.totalAmount) || 0,
              avgAmount: parseInt(state.statisticsData.avgAmount) || 0
            }
          }
        } else {
          console.log('没有找到保存的统计状态，使用默认值')
          // 如果有交易数据，基于当前交易数据初始化统计
          if (this.monitoringState.transactionCount > 0) {
            this.updateTransactionStats(this.monitoringState.transactionCount)
          }
          if (this.monitoringState.anomalyCount > 0) {
            this.updateRiskDistribution(this.monitoringState.anomalyCount)
          }
        }
      } catch (error) {
        console.error('恢复统计状态时出错:', error)
      }
    },

    // 保存统计状态
    saveStatisticsState() {
      try {
        const stateToSave = {
          statisticsData: { ...this.statisticsData }
        }

        const stateJson = JSON.stringify(stateToSave)
        localStorage.setItem('amlStatisticsState', stateJson)
        console.log('统计状态已保存')
      } catch (error) {
        console.error('保存统计状态时出错:', error)
      }
    },

    // 更新交易统计
    updateTransactionStats(transactionCount) {
      // 计算总金额和平均金额
      const averageAmount = 10000 + Math.floor(Math.random() * 5000)
      this.statisticsData.totalAmount = transactionCount * averageAmount
      this.statisticsData.avgAmount = Math.floor(this.statisticsData.totalAmount / transactionCount)

      // 更新低风险交易统计 - 假设大部分交易是低风险的
      this.statisticsData.lowRiskCount = transactionCount - this.statisticsData.highRiskCount - this.statisticsData.mediumRiskCount
      if (this.statisticsData.lowRiskCount < 0) this.statisticsData.lowRiskCount = 0

      this.saveStatisticsState()
    },

    // 更新风险分布
    updateRiskDistribution(anomalyCount) {
      // 模拟高风险和中风险分布
      this.statisticsData.highRiskCount = Math.floor(anomalyCount * 0.6)
      this.statisticsData.mediumRiskCount = anomalyCount - this.statisticsData.highRiskCount

      this.saveStatisticsState()
    },

    // 生成统计分析
    generateStats() {
      if (this.isEditing) {
        this.$message.warning('编辑模式下不能更新统计')
        return
      }

      // 模拟统计分析生成
      this.$message.loading('正在更新统计分析...', 1, () => {
        // 随机调整统计数据，模拟分析结果
        const transactionCount = this.monitoringState.transactionCount || 0
        const anomalyCount = this.monitoringState.anomalyCount || 0

        if (transactionCount > 0) {
          this.statisticsData.totalAmount = transactionCount * (10000 + Math.floor(Math.random() * 5000))
          this.statisticsData.avgAmount = Math.floor(this.statisticsData.totalAmount / transactionCount)

          // 更新风险分布
          if (anomalyCount > 0) {
            const highRiskRatio = 0.5 + Math.random() * 0.2
            this.statisticsData.highRiskCount = Math.floor(anomalyCount * highRiskRatio)
            this.statisticsData.mediumRiskCount = anomalyCount - this.statisticsData.highRiskCount
          }

          this.statisticsData.lowRiskCount = transactionCount - this.statisticsData.highRiskCount - this.statisticsData.mediumRiskCount
          if (this.statisticsData.lowRiskCount < 0) this.statisticsData.lowRiskCount = 0
        }

        this.saveStatisticsState()
        this.$message.success('统计分析已更新')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.statistics-module {
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

  // 统计容器样式
  .statistics-container {
    display: flex;
    flex-wrap: wrap;
    padding: 20px;
    background: #fff;

    .statistics-section {
      width: 50%;
      padding: 0 16px 16px 0;
      box-sizing: border-box;
    }
  }

  // 统计区域样式
  .statistics-section {
    margin-bottom: 15px;

    &:hover .statistics-title {
      color: #1890ff;
    }
  }

  .statistics-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e3799;
    margin-bottom: 16px;
    padding: 0 0 8px 10px;
    border-bottom: 2px solid #e8e8e8;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;

    /deep/ .anticon {
      margin-right: 8px;
      font-size: 18px;
      color: #1890ff;
    }
  }

  .statistics-item {
    display: flex;
    padding: 8px 0;
    line-height: 1.5;
    transition: all 0.2s ease;
    border-bottom: 1px dashed #f0f0f0;

    &:hover {
      background-color: #f9f9f9;
      padding-left: 5px;
    }
  }

  .statistics-item .label {
    width: 130px;
    font-weight: 500;
    color: #666;
  }

  .statistics-item .value {
    flex: 1;
    color: #1f2f3d;
    font-weight: 500;
  }

  // 区域底部样式
  .section-footer {
    padding: 16px;
    border-top: 1px solid #f0f0f0;
    text-align: center;
    background-color: #fafafa;

    .action-button {
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
      }

      /deep/ .anticon {
        margin-right: 8px;
      }
    }
  }
}
</style>
