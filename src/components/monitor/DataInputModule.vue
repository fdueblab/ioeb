<template>
  <div class="data-input-module" v-if="moduleConfig.visible">
    <a-card class="section-card" :bordered="false">
      <div class="section-header">
        <h3>{{ moduleConfig.title }}</h3>
        <div class="section-tag">
          <a-tag :color="moduleConfig.tagColor">{{ moduleConfig.tagText }}</a-tag>
        </div>
      </div>

      <!-- 监测控制面板 -->
      <div class="control-panel">
        <div class="status-indicator">
          <div :class="['status-dot', isMonitoring ? 'status-active' : 'status-inactive']"></div>
          <span>{{ isMonitoring ? '监测中...' : '未启动监测' }}</span>
        </div>

        <!-- 数据接入选择与监测控制按钮 -->
        <div class="control-center">
          <a-form-item label="数据接入选择：">
            <a-select v-model="dataSource" style="width: 300px">
              <a-select-option v-for="source in moduleConfig.dataSources" :key="source.value" :value="source.value">
                {{ source.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-button
            type="primary"
            size="large"
            :loading="loading"
            style="width: 200px; margin: 0 auto;"
            @click="toggleMonitoring"
          >
            {{ isMonitoring ? moduleConfig.buttonStopText : moduleConfig.buttonText }}
          </a-button>
        </div>

        <!-- 监测信息 -->
        <div v-if="isMonitoring" class="monitoring-info">
          已监测交易数: <span>{{ transactionCount }}</span> 笔 | 监测时长: <span>{{ monitoringDuration }}</span> |
          异常交易: <span>{{ anomalyCount }}</span> 笔
        </div>
      </div>

      <!-- 实时预警表格 -->
      <div class="alert-table-container">
        <h3 class="sub-section-title">{{ moduleConfig.alertTitle }}</h3>
        <a-table
          :columns="alertColumns"
          :data-source="alertsTableData"
          :pagination="{ pageSize: 5 }"
          size="small"
          :loading="loading"
        >
          <template slot="time" slot-scope="text">
            <span>{{ text }}</span>
          </template>
          <template slot="alertNumber" slot-scope="text">
            <a-tag color="red">预警 #{{ text }}</a-tag>
          </template>
          <template slot="transactionId" slot-scope="text">
            <a-tooltip placement="topLeft" :title="'交易ID: ' + text">
              <a>{{ text }}</a>
            </a-tooltip>
          </template>
          <template slot="amount" slot-scope="text">
            <span style="color: #cf1322">$ {{ text.toLocaleString() }}</span>
          </template>
          <template slot="reason" slot-scope="text">
            <a-tooltip placement="topLeft" :title="text">
              <span>{{ text.length > 12 ? text.substring(0, 12) + '...' : text }}</span>
            </a-tooltip>
          </template>
          <template slot="riskLevel" slot-scope="text">
            <a-tag :color="text === '高' ? 'red' : 'orange'">{{ text }}</a-tag>
          </template>
        </a-table>
        <div v-if="!isMonitoring && alertsTableData.length === 0" class="empty-alerts">
          <a-empty description="监控中，等待异常交易预警..." />
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'DataInputModule',
  props: {
    moduleConfig: {
      type: Object,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isMonitoring: false,
      loading: false,
      dataSource: 'default_data',
      monitoringTimer: null,
      startTime: null,
      transactionCount: 0,
      anomalyCount: 0,
      monitoringDuration: '00:00:00',
      hasMonitoringData: false,
      deactivatedTime: null,
      alertsTableData: [],
      alertColumns: [
        {
          title: '时间',
          dataIndex: 'time',
          key: 'time',
          scopedSlots: { customRender: 'time' }
        },
        {
          title: '预警编号',
          dataIndex: 'alertNumber',
          key: 'alertNumber',
          scopedSlots: { customRender: 'alertNumber' }
        },
        {
          title: '交易ID',
          dataIndex: 'transactionId',
          key: 'transactionId',
          scopedSlots: { customRender: 'transactionId' }
        },
        {
          title: '金额',
          dataIndex: 'amount',
          key: 'amount',
          scopedSlots: { customRender: 'amount' }
        },
        {
          title: '异常原因',
          dataIndex: 'reason',
          key: 'reason',
          scopedSlots: { customRender: 'reason' }
        },
        {
          title: '风险等级',
          dataIndex: 'riskLevel',
          key: 'riskLevel',
          scopedSlots: { customRender: 'riskLevel' }
        }
      ]
    }
  },
  watch: {
    isEditing(val) {
      // 编辑模式下停止监测
      if (val && this.isMonitoring) {
        this.stopMonitoring()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.restoreMonitoringState()
    })
  },
  beforeDestroy() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer)
    }
  },
  activated() {
    console.log('DataInputModule组件激活')
    if (this.isMonitoring) {
      if (this.deactivatedTime) {
        const now = new Date()
        const timeAwayMs = now - this.deactivatedTime
        const secondsAway = Math.floor(timeAwayMs / 1000)

        console.log(`页面离开了${secondsAway}秒，开始补偿交易数据`)

        if (secondsAway > 0) {
          for (let i = 0; i < secondsAway; i++) {
            this.simulateTransactions(false)
          }
          this.saveMonitoringState()
          console.log(
            `已补偿${secondsAway}秒的交易数据，当前交易总数：${this.transactionCount}，异常交易：${this.anomalyCount}`
          )
        }
        this.deactivatedTime = null
      }

      if (!this.monitoringTimer) {
        this.monitoringTimer = setInterval(() => {
          this.updateMonitoringTime()
          this.simulateTransactions()
        }, 1000)
        console.log('监测定时器已重新启动')
      }
    }
  },
  deactivated() {
    console.log('DataInputModule组件停用')
    this.deactivatedTime = new Date()

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer)
      this.monitoringTimer = null
      console.log('监测定时器已暂停，记录离开时间:', this.deactivatedTime)
    }
  },
  methods: {
    // 恢复监测状态
    restoreMonitoringState() {
      try {
        const savedState = localStorage.getItem('amlMonitoringState')
        if (savedState) {
          const state = JSON.parse(savedState)
          console.log('发现保存的状态:', state)

          this.isMonitoring = !!state.isMonitoring
          this.dataSource = state.dataSource || 'default_data'
          this.transactionCount = parseInt(state.transactionCount) || 0
          this.anomalyCount = parseInt(state.anomalyCount) || 0
          this.hasMonitoringData = !!state.hasMonitoringData
          this.alertsTableData = state.alertsTableData || []

          if (state.startTimeString) {
            this.startTime = new Date(state.startTimeString)
            if (state.monitoringDuration) {
              this.monitoringDuration = state.monitoringDuration
            } else {
              this.updateMonitoringTime()
            }
          }

          if (this.isMonitoring && !this.isEditing) {
            this.monitoringTimer = setInterval(() => {
              this.updateMonitoringTime()
              this.simulateTransactions()
            }, 1000)
          }

          console.log(
            `状态恢复完成: 交易数=${this.transactionCount}, 异常交易=${this.anomalyCount}, 监测状态=${this.isMonitoring}`
          )
        } else {
          console.log('没有找到保存的状态，使用默认值')
        }
      } catch (error) {
        console.error('恢复监测状态时出错:', error)
      }
    },

    // 保存监测状态
    saveMonitoringState() {
      try {
        const transactionCount = parseInt(this.transactionCount) || 0
        const anomalyCount = parseInt(this.anomalyCount) || 0

        const stateToSave = {
          isMonitoring: this.isMonitoring,
          dataSource: this.dataSource,
          transactionCount: transactionCount,
          anomalyCount: anomalyCount,
          hasMonitoringData: this.hasMonitoringData,
          alertsTableData: this.alertsTableData,
          startTimeString: this.startTime ? this.startTime.toString() : null,
          monitoringDuration: this.monitoringDuration
        }

        const stateJson = JSON.stringify(stateToSave)
        localStorage.setItem('amlMonitoringState', stateJson)
        console.log(`状态已保存: 交易数=${transactionCount}, 异常交易=${anomalyCount}, 监测状态=${this.isMonitoring}`)

        // 向父组件发送状态更新通知
        this.$emit('monitoring-updated', {
          transactionCount,
          anomalyCount,
          monitoringDuration: this.monitoringDuration,
          hasMonitoringData: this.hasMonitoringData,
          isMonitoring: this.isMonitoring
        })
      } catch (error) {
        console.error('保存监测状态时出错:', error)
      }
    },

    // 开始/停止监测
    toggleMonitoring() {
      if (this.isEditing) {
        this.$message.warning('编辑模式下不能开始监测')
        return
      }

      this.isMonitoring = !this.isMonitoring

      if (this.isMonitoring) {
        this.startMonitoring()
      } else {
        this.stopMonitoring()
      }

      this.saveMonitoringState()
    },

    // 开始监测
    startMonitoring() {
      this.startTime = new Date()
      this.transactionCount = 0
      this.anomalyCount = 0
      this.alertsTableData = []

      this.monitoringTimer = setInterval(() => {
        this.updateMonitoringTime()
        this.simulateTransactions()
        this.saveMonitoringState()
      }, 1000)
    },

    // 停止监测
    stopMonitoring() {
      if (this.monitoringTimer) {
        clearInterval(this.monitoringTimer)
        this.monitoringTimer = null
      }

      this.hasMonitoringData = true
      this.saveMonitoringState()
    },

    // 更新监测时间
    updateMonitoringTime() {
      if (this.startTime) {
        const currentTime = new Date()
        const elapsed = Math.floor((currentTime - this.startTime) / 1000)
        this.monitoringDuration = this.formatTime(elapsed)
      }
    },

    // 格式化时间
    formatTime(seconds) {
      const hrs = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    },

    // 模拟交易数据
    simulateTransactions(shouldSave = true) {
      const newTransactions = Math.floor(Math.random() * 5) * 10 + Math.floor(Math.random() * 10)
      this.transactionCount = (parseInt(this.transactionCount) || 0) + newTransactions

      if (Math.random() < 0.2) {
        this.anomalyCount = (parseInt(this.anomalyCount) || 0) + 1

        const now = new Date()
        const timeString = now.toLocaleTimeString()
        const transactionId = 'TX' + Math.floor(10000000 + Math.random() * 90000000)
        const amount = Math.floor(5000 + Math.random() * 45000)
        const riskLevel = Math.random() > 0.5 ? '高' : '中'
        const reasons = [
          '短时间内多笔大额交易',
          '收款方为高风险地区企业',
          '交易路径异常',
          '资金流向与历史交易模式不符',
          '交易对手为可疑名单成员',
          '交易频率异常',
          '重复交易金额'
        ]
        const reason = reasons[Math.floor(Math.random() * reasons.length)]

        this.alertsTableData.unshift({
          key: this.anomalyCount,
          time: timeString,
          alertNumber: this.anomalyCount,
          transactionId: transactionId,
          amount: amount,
          reason: reason,
          riskLevel: riskLevel
        })

        if (shouldSave) {
          this.saveMonitoringState()
        }
      }

      if (shouldSave && this.transactionCount % 50 === 0) {
        console.log(`已完成${this.transactionCount}笔交易，保存状态...`)
        this.saveMonitoringState()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.data-input-module {
  .section-card {
    margin-bottom: 16px;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);

    /deep/ .ant-card-body {
      padding: 0;
    }
  }

  // 区域标题样式
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #fafafa;
    border-bottom: 1px solid #f0f0f0;

    h3 {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin: 0;
    }

    .section-tag {
      display: flex;
      align-items: center;
    }
  }

  // 控制面板样式
  .control-panel {
    padding: 16px;
    background-color: #fff;
  }

  // 控制中心样式
  .control-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 16px 0;

    .ant-form-item {
      margin-bottom: 16px;
    }
  }

  // 状态指示器样式
  .status-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
  }

  .status-active {
    background-color: #52c41a;
  }

  .status-inactive {
    background-color: #f5222d;
  }

  // 监测信息样式
  .monitoring-info {
    margin-top: 16px;
    font-size: 14px;
    color: #666;
    text-align: center;
    padding: 8px;
    background-color: #f9f9f9;
    border-radius: 4px;

    span {
      font-weight: bold;
      color: #1890ff;
    }
  }

  // 子区域标题样式
  .sub-section-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 16px 0 12px 16px;
    padding-left: 8px;
    border-left: 3px solid #1890ff;
  }

  // 表格容器样式
  .alert-table-container {
    padding: 0 16px 16px 16px;
  }

  // 空表格样式
  .empty-alerts {
    padding: 20px 0;
    text-align: center;
  }
}
</style>
