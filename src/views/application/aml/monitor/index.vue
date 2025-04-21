<template>
  <div class="application-aml-monitor">
    <a-card :bordered="false">
      <!-- 区域1: 数据接入与实时监测区域 -->
      <a-row :gutter="16">
        <a-col :span="24">
          <a-card class="section-card" :bordered="false">
            <div class="section-header">
              <h3>数据接入与实时监测</h3>
              <div class="section-tag">
                <a-tag color="blue">调用数据接入/实时监测智能体</a-tag>
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
                    <a-select-option value="default_data">默认数据</a-select-option>
                    <a-select-option value="business_data_1">跨境支付业务数据源1</a-select-option>
                    <a-select-option value="business_data_2">跨境支付业务数据源2</a-select-option>
                    <a-select-option value="agent_1">业务数据智能体1</a-select-option>
                    <a-select-option value="agent_2">业务数据智能体2</a-select-option>
                    <a-select-option value="all">全部数据源</a-select-option>
                  </a-select>
                </a-form-item>

                <a-button
                  type="primary"
                  size="large"
                  :loading="loading"
                  style="width: 200px; margin: 0 auto;"
                  @click="toggleMonitoring"
                >
                  {{ isMonitoring ? '停止监测' : '开始监测' }}
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
              <h3 class="sub-section-title">实时预警</h3>
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
        </a-col>
      </a-row>

      <!-- 区域2: 统计分析区域 -->
      <a-row :gutter="16" style="margin-top: 16px">
        <a-col :span="24">
          <a-card class="section-card" :bordered="false">
            <div class="section-header">
              <h3>统计分析</h3>
              <div class="section-tag">
                <a-tag color="green">调用统计分析智能体</a-tag>
              </div>
            </div>

            <div class="statistics-container">
              <div class="statistics-section">
                <h3 class="statistics-title">当前监测期间交易总览</h3>
                <div class="statistics-item">
                  <span class="label">监测时长：</span>
                  <span class="value">{{ monitoringDuration }}</span>
                </div>
                <div class="statistics-item">
                  <span class="label">跨境支付总额：</span>
                  <span class="value">${{ statisticsData.totalAmount.toLocaleString() }} USD</span>
                </div>
                <div class="statistics-item">
                  <span class="label">交易总量：</span>
                  <span class="value">{{ transactionCount }} 笔</span>
                </div>
                <div class="statistics-item">
                  <span class="label">平均交易金额：</span>
                  <span class="value">${{ statisticsData.avgAmount.toLocaleString() }} USD</span>
                </div>
              </div>

              <div class="statistics-section">
                <h3 class="statistics-title">异常统计</h3>
                <div class="statistics-item">
                  <span class="label">高风险交易：</span>
                  <span class="value">{{ statisticsData.highRiskCount }} 笔 ({{
                    transactionCount > 0
                      ? ((statisticsData.highRiskCount / transactionCount) * 100).toFixed(2)
                      : '0'
                  }}%)</span>
                </div>
                <div class="statistics-item">
                  <span class="label">中风险交易：</span>
                  <span class="value">{{ statisticsData.mediumRiskCount }} 笔 ({{
                    transactionCount > 0
                      ? ((statisticsData.mediumRiskCount / transactionCount) * 100).toFixed(2)
                      : '0'
                  }}%)</span>
                </div>
                <div class="statistics-item">
                  <span class="label">低风险交易：</span>
                  <span class="value">{{ statisticsData.lowRiskCount }} 笔 ({{
                    transactionCount > 0
                      ? ((statisticsData.lowRiskCount / transactionCount) * 100).toFixed(2)
                      : '0'
                  }}%)</span>
                </div>
              </div>
            </div>

            <div class="section-footer">
              <a-button type="primary" @click="generateStats" :disabled="!isMonitoring && !hasMonitoringData">
                更新统计分析
              </a-button>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 区域3: 报告生成区域 -->
      <a-row :gutter="16" style="margin-top: 16px">
        <a-col :span="24">
          <a-card class="section-card" :bordered="false">
            <div class="section-header">
              <h3>监测报告生成</h3>
              <div class="section-tag">
                <a-tag color="purple">调用报告生成智能体</a-tag>
              </div>
            </div>

            <div class="report-container">
              <p class="report-description">
                生成监测报告将对当前监测期间的交易数据进行分析，包括异常交易检测、风险评估和建议措施。
                报告将基于图神经网络(GNN)模型对交易网络的分析结果。
              </p>

              <!-- 报告内容区域 -->
              <div v-if="monitoringReport" class="report-content">
                <h4 class="report-content-title">监测报告</h4>
                <div class="report-timestamp" v-if="reportTimestamp">生成时间: {{ reportTimestamp }}</div>
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
                  :disabled="!isMonitoring && !hasMonitoringData"
                >
                  生成监测报告
                </a-button>

                <a-popconfirm
                  title="确定要重置监测状态吗？这将清除所有监测数据。"
                  @confirm="clearMonitoringState"
                  okText="确定"
                  cancelText="取消"
                >
                  <a-button type="danger">重置监测</a-button>
                </a-popconfirm>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script>

export default {
  name: 'ApplicationAmlMonitor',
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
      // 添加离开页面时间记录
      deactivatedTime: null,
      // 添加实时预警表格数据
      alertsTableData: [],
      // 添加统计数据
      statisticsData: {
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        totalAmount: 0,
        avgAmount: 0
      },
      // 添加报告相关状态
      monitoringReport: '',
      reportLoading: false,
      reportTimestamp: '',
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
  mounted() {
    // 组件挂载完成后，恢复监测状态
    this.$nextTick(() => {
      this.restoreMonitoringState()
    })
  },
  beforeDestroy() {
    // 清理定时器
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer)
    }
  },
  // 添加activated生命周期钩子，在keep-alive组件激活时调用
  activated() {
    console.log('ApplicationAmlMonitor组件激活')

    // 如果之前在监测中，计算离开期间的时间并模拟交易
    if (this.isMonitoring) {
      // 如果有记录离开时间，计算应该补偿的交易
      if (this.deactivatedTime) {
        const now = new Date()
        const timeAwayMs = now - this.deactivatedTime
        const secondsAway = Math.floor(timeAwayMs / 1000)

        console.log(`页面离开了${secondsAway}秒，开始补偿交易数据`)

        // 每秒模拟的交易次数约为0-59笔，平均约30笔/秒
        // 只补偿整秒数的交易，避免过于频繁的小数点计算
        if (secondsAway > 0) {
          // 模拟离开期间的交易数据
          for (let i = 0; i < secondsAway; i++) {
            this.simulateTransactions(false) // 传入false表示不触发保存操作
          }

          // 最后统一一次保存状态
          this.saveMonitoringState()
          console.log(
            `已补偿${secondsAway}秒的交易数据，当前交易总数：${this.transactionCount}，异常交易：${this.anomalyCount}`
          )
        }

        // 重置离开时间
        this.deactivatedTime = null
      }

      // 重启定时器
      if (!this.monitoringTimer) {
        this.monitoringTimer = setInterval(() => {
          this.updateMonitoringTime()
          this.simulateTransactions()
        }, 1000)
        console.log('监测定时器已重新启动')
      }
    }
  },

  // 添加deactivated生命周期钩子，在keep-alive组件停用时调用
  deactivated() {
    console.log('ApplicationAmlMonitor组件停用')
    // 记录离开的时间点
    this.deactivatedTime = new Date()

    // 如果有定时器，暂停它，但不重置isMonitoring状态
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
        // 从localStorage获取存储的监测状态
        const savedState = localStorage.getItem('amlMonitoringState')
        if (savedState) {
          const state = JSON.parse(savedState)
          console.log('发现保存的状态:', state)

          // 恢复监测状态 - 确保数字类型正确转换
          this.isMonitoring = !!state.isMonitoring
          this.dataSource = state.dataSource || 'default_data'
          this.transactionCount = parseInt(state.transactionCount) || 0
          this.anomalyCount = parseInt(state.anomalyCount) || 0
          this.hasMonitoringData = !!state.hasMonitoringData
          this.alertsTableData = state.alertsTableData || []

          // 恢复统计数据
          if (state.statisticsData) {
            // 确保对象结构完整
            this.statisticsData = {
              highRiskCount: parseInt(state.statisticsData.highRiskCount) || 0,
              mediumRiskCount: parseInt(state.statisticsData.mediumRiskCount) || 0,
              lowRiskCount: parseInt(state.statisticsData.lowRiskCount) || 0,
              totalAmount: parseInt(state.statisticsData.totalAmount) || 0,
              avgAmount: parseInt(state.statisticsData.avgAmount) || 0
            }
          }

          // 恢复报告相关状态
          if (state.monitoringReport) {
            this.monitoringReport = state.monitoringReport
            this.reportTimestamp = state.reportTimestamp || ''
          }

          // 恢复时间统计
          if (state.startTimeString) {
            this.startTime = new Date(state.startTimeString)
            // 如果保存了监测持续时间，优先使用它
            if (state.monitoringDuration) {
              this.monitoringDuration = state.monitoringDuration
            } else {
              this.updateMonitoringTime()
            }
          }

          // 如果之前在监测中，重启定时器
          if (this.isMonitoring) {
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

    // 保存监测状态到localStorage
    saveMonitoringState() {
      try {
        // 确保保存前正确处理所有数字类型
        const transactionCount = parseInt(this.transactionCount) || 0
        const anomalyCount = parseInt(this.anomalyCount) || 0

        const stateToSave = {
          isMonitoring: this.isMonitoring,
          dataSource: this.dataSource,
          transactionCount: transactionCount,
          anomalyCount: anomalyCount,
          hasMonitoringData: this.hasMonitoringData,
          alertsTableData: this.alertsTableData,
          statisticsData: { ...this.statisticsData }, // 创建深拷贝
          // 存储startTime的字符串表示，因为Date对象不能直接序列化
          startTimeString: this.startTime ? this.startTime.toString() : null,
          // 保存当前监测持续时间
          monitoringDuration: this.monitoringDuration,
          // 保存报告相关状态
          monitoringReport: this.monitoringReport,
          reportTimestamp: this.reportTimestamp
        }

        // 转换为JSON并保存
        const stateJson = JSON.stringify(stateToSave)
        localStorage.setItem('amlMonitoringState', stateJson)
        console.log(`状态已保存: 交易数=${transactionCount}, 异常交易=${anomalyCount}, 监测状态=${this.isMonitoring}`)
      } catch (error) {
        console.error('保存监测状态时出错:', error)
      }
    },

    // 开始/停止监测
    toggleMonitoring() {
      this.isMonitoring = !this.isMonitoring

      if (this.isMonitoring) {
        // 开始监测
        this.startMonitoring()
      } else {
        // 停止监测
        this.stopMonitoring()
      }

      // 保存更新后的状态
      this.saveMonitoringState()
    },

    // 开始监测
    startMonitoring() {
      // 重置计数器和监测报告
      this.startTime = new Date()
      this.transactionCount = 0
      this.anomalyCount = 0

      // 重置表格和统计数据
      this.alertsTableData = []
      this.statisticsData = {
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        totalAmount: 0,
        avgAmount: 0
      }

      // 每秒更新时间和模拟交易
      this.monitoringTimer = setInterval(() => {
        this.updateMonitoringTime()
        this.simulateTransactions()
        // 定期保存状态
        this.saveMonitoringState()
      }, 1000)
    },

    // 停止监测
    stopMonitoring() {
      // 停止计时器
      if (this.monitoringTimer) {
        clearInterval(this.monitoringTimer)
        this.monitoringTimer = null
      }

      this.hasMonitoringData = true

      // 自动更新统计信息
      this.generateStats()

      // 保存停止后的状态
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
      // 生成新交易数（1-59之间的随机数）
      const newTransactions = Math.floor(Math.random() * 5) * 10 + Math.floor(Math.random() * 10)

      // 更新交易计数 - 确保是数字
      this.transactionCount = (parseInt(this.transactionCount) || 0) + newTransactions

      // 计算总额和平均金额
      const averageAmount = 10000 + Math.floor(Math.random() * 5000)
      this.statisticsData.totalAmount += newTransactions * averageAmount
      this.statisticsData.avgAmount =
        this.transactionCount > 0 ? Math.floor(this.statisticsData.totalAmount / this.transactionCount) : 0

      // 约20%的交易模拟是异常的
      if (Math.random() < 0.2) {
        // 递增异常交易计数
        this.anomalyCount = (parseInt(this.anomalyCount) || 0) + 1

        // 添加实时预警信息
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

        // 添加到表格数据中
        this.alertsTableData.unshift({
          key: this.anomalyCount,
          time: timeString,
          alertNumber: this.anomalyCount,
          transactionId: transactionId,
          amount: amount,
          reason: reason,
          riskLevel: riskLevel
        })

        // 同时更新统计数据
        if (riskLevel === '高') {
          this.statisticsData.highRiskCount++
        } else {
          this.statisticsData.mediumRiskCount++
        }

        // 生成了新的异常交易，如果需要保存则保存状态
        if (shouldSave) {
          this.saveMonitoringState()
        }
      }

      // 更新低风险交易统计
      this.statisticsData.lowRiskCount = Math.floor(this.transactionCount * 0.02)

      // 每5次交易模拟后保存状态（避免过于频繁保存）
      if (shouldSave && this.transactionCount % 50 === 0) {
        console.log(`已完成${this.transactionCount}笔交易，保存状态...`)
        this.saveMonitoringState()
      }
    },

    // 生成监测报告
    generateReport() {
      this.reportLoading = true
      this.reportTimestamp = new Date().toLocaleString()

      // 保存当前状态
      this.saveMonitoringState()

      const defaultMonitoringReport =
        '```markdown\n# AML风险分析报告（基于GNN模型预测）\n\n' +
        '## 1. 执行摘要\n' +
        '本报告基于图神经网络(GNN)模型对2500个实体节点的风险预测结果进行分析，识别出潜在洗钱风险模式和重点关注对象。核心发现：\n' +
        '- **高风险集中性**：共检测到5个高风险节点(类别2)，占比0.2%，表现出异常资金流动特征\n' +
        '- **网络关联风险**：高风险节点呈现集群特征（如节点5-8连续高风险），暗示可能存在结构化交易网络\n' +
        '- **风险分布特征**：99.6%节点为低风险(类别0)，0.2%中风险(类别1)，整体风险分布符合“长尾效应”\n' +
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
        '- **金额特征**：交易金额均符合“$9,500±200”的规避报告阈值模式\n' +
        '## 4. 风险模式识别\n' +
        '### 4.1 主要洗钱手法\n' +
        '1. **结构化交易(Smurfing)**：\n' +
        '- 节点5呈现典型的“分散-集中”资金流\n' +
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
        this.saveMonitoringState()
      }, 2000)
    },

    // 生成统计分析
    generateStats() {
      this.$message.info('统计分析已更新')

      // 保存状态
      this.saveMonitoringState()
    },

    // 清除监测状态
    clearMonitoringState() {
      // 停止当前监测
      if (this.isMonitoring) {
        if (this.monitoringTimer) {
          clearInterval(this.monitoringTimer)
          this.monitoringTimer = null
        }
        this.isMonitoring = false
      }

      // 清除localStorage中保存的状态
      localStorage.removeItem('amlMonitoringState')

      // 重置所有状态回到初始值
      this.startTime = null
      this.transactionCount = 0
      this.anomalyCount = 0
      this.monitoringDuration = '00:00:00'
      this.hasMonitoringData = false
      this.alertsTableData = []

      // 重置报告相关状态
      this.monitoringReport = ''
      this.reportTimestamp = ''
      this.reportLoading = false

      // 重置统计数据
      this.statisticsData = {
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        totalAmount: 0,
        avgAmount: 0
      }

      this.$message.success('监测状态已重置')
    }
  }
}
</script>

<style lang="less" scoped>
.application-aml-monitor {
  padding: 0;
  margin: 0;
  height: auto;
  min-height: auto;

  // 区域卡片样式
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

  // 统计容器样式
  .statistics-container {
    display: flex;
    flex-wrap: wrap;
    padding: 16px;

    .statistics-section {
      width: 50%;
      padding: 0 16px 16px 0;
      box-sizing: border-box;
    }
  }

  // 统计区域样式
  .statistics-section {
    margin-bottom: 15px;
  }

  .statistics-title {
    font-size: 15px;
    font-weight: 600;
    color: #1e3799;
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 3px solid #1e3799;
  }

  .statistics-item {
    display: flex;
    padding: 5px 0;
    line-height: 1.5;
  }

  .statistics-item .label {
    width: 120px;
    font-weight: 500;
    color: #666;
  }

  .statistics-item .value {
    flex: 1;
    color: #1f2f3d;
  }

  // 区域底部样式
  .section-footer {
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;
    text-align: center;
    background-color: #fafafa;
  }

  // 报告容器样式
  .report-container {
    padding: 16px;

    .report-description {
      margin-bottom: 16px;
      color: #666;
      line-height: 1.6;
    }

    .report-content {
      margin: 16px 0;
      padding: 16px;
      background-color: #f9f9f9;
      border: 1px solid #eee;
      border-radius: 4px;

      .report-content-title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        margin-bottom: 8px;
      }

      .report-timestamp {
        font-size: 12px;
        color: #999;
        margin-bottom: 16px;
      }

      .report-loading {
        display: flex;
        justify-content: center;
        padding: 20px 0;
      }

      .report-text {
        max-height: 400px;
        overflow-y: auto;

        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: 'Courier New', Courier, monospace;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
        }
      }
    }

    .report-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
    }
  }
}
</style>
