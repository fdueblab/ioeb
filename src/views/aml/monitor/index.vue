<template>
  <div class="monitoring-fullscreen-container">
    <div class="header">
      <h1>跨境支付事中监管系统</h1>
      <div class="user-info">
        <span>金融机构：银联电子</span>
        <span>用户：管理员</span>
        <a-avatar icon="user" />
      </div>
    </div>

    <div class="content-container">
      <div class="monitoring-container">
        <!-- 导航菜单 -->
        <div class="navigation-menu">
          <a-menu mode="horizontal" :selectedKeys="['monitor']">
            <a-menu-item key="monitor">
              <router-link to="/aml/monitor"> <a-icon type="dashboard" />实时监控 </router-link>
            </a-menu-item>
            <a-menu-item key="list">
              <router-link to="/aml/list"> <a-icon type="table" />商户风险查询 </router-link>
            </a-menu-item>
          </a-menu>
        </div>

        <!-- 监控控制面板 -->
        <div class="panel controls-panel">
          <div class="panel-header">
            <h2 class="panel-title">监管控制面板</h2>
            <div class="status-indicator">
              <div :class="['status-dot', isMonitoring ? 'status-active' : 'status-inactive']"></div>
              <span>{{ isMonitoring ? '监测中...' : '未启动监测' }}</span>
            </div>
          </div>

          <div class="data-selector">
            <a-form-item label="数据接入选择：">
              <a-select v-model="dataSource" style="width: 100%">
                <a-select-option value="default_data">默认数据</a-select-option>
                <a-select-option value="business_data_1">跨境支付业务数据源1</a-select-option>
                <a-select-option value="business_data_2">跨境支付业务数据源2</a-select-option>
                <a-select-option value="agent_1">业务数据智能体1</a-select-option>
                <a-select-option value="agent_2">业务数据智能体2</a-select-option>
                <a-select-option value="all">全部数据源</a-select-option>
              </a-select>
            </a-form-item>
          </div>

          <a-button
            type="primary"
            size="large"
            :loading="loading"
            style="width: 200px; margin: 10px auto; display: block"
            @click="toggleMonitoring"
          >
            {{ isMonitoring ? '停止监测' : '开始监测' }}
          </a-button>

          <div v-if="isMonitoring" class="monitoring-info">
            已监测交易数: <span>{{ transactionCount }}</span> 笔 | 监测时长: <span>{{ monitoringDuration }}</span> |
            异常交易: <span>{{ anomalyCount }}</span> 笔
          </div>

          <div class="reset-button">
            <a-popconfirm
              title="确定要重置监测状态吗？这将清除所有监测数据。"
              @confirm="clearMonitoringState"
              okText="确定"
              cancelText="取消"
            >
              <a-button type="link" size="small">重置监测</a-button>
            </a-popconfirm>
          </div>
        </div>

        <!-- 实时监测与报告面板 -->
        <a-row :gutter="16" style="margin-top: 16px">
          <a-col :span="12">
            <a-card title="事中实时监测" :bordered="false">
              <template slot="extra">
                <span>与AML报告智能体交互</span>
              </template>

              <a-tabs v-model="monitoringActiveKey">
                <a-tab-pane key="1" tab="实时预警">
                  <div class="textarea-container alerts-container">
                    <a-table
                      :columns="alertColumns"
                      :data-source="alertsTableData"
                      :pagination="{ pageSize: 5 }"
                      :scroll="{ y: 220 }"
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
                </a-tab-pane>
                <a-tab-pane key="2" tab="监测报告">
                  <div class="textarea-container">
                    <a-textarea
                      v-model="monitoringReport"
                      :rows="12"
                      read-only
                      placeholder="点击'监测报告生成'按钮，生成监测期间的异常交易分析报告..."
                    >
                    </a-textarea>
                    <a-spin v-if="reportLoading" class="center-loader" />
                  </div>
                </a-tab-pane>
              </a-tabs>

              <div class="panel-footer">
                <div class="report-controls">
                  <div class="report-selectors">
                    <a-select v-model="timeRange" style="width: 100px; margin-right: 8px" placeholder="时间范围">
                      <a-select-option value="day">本日</a-select-option>
                      <a-select-option value="month">本月</a-select-option>
                      <a-select-option value="year">本年</a-select-option>
                    </a-select>
                    <a-select v-model="businessScope" style="width: 100px; margin-right: 8px" placeholder="业务范围">
                      <a-select-option value="current">当前业务</a-select-option>
                      <a-select-option value="all">所有业务</a-select-option>
                    </a-select>
                  </div>
                  <a-button
                    type="primary"
                    :loading="reportLoading"
                    @click="generateReport"
                    :disabled="!isMonitoring && !hasMonitoringData"
                  >
                    监测报告生成
                  </a-button>
                  <a-button @click="updateModels">监测模型检索与更新</a-button>
                </div>
              </div>
              <div class="timestamp" v-if="reportTimestamp">报告生成时间: {{ reportTimestamp }}</div>
            </a-card>
          </a-col>

          <a-col :span="12">
            <a-card title="信息统计" :bordered="false">
              <template slot="extra">
                <span>与信息统计智能体交互</span>
              </template>

              <a-tabs v-model="statisticsActiveKey">
                <a-tab-pane key="1" tab="统计分析">
                  <div class="textarea-container statistics-panel">
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
                        <span class="value"
                          >{{ statisticsData.highRiskCount }} 笔 ({{
                            transactionCount > 0
                              ? ((statisticsData.highRiskCount / transactionCount) * 100).toFixed(2)
                              : '0'
                          }}%)</span
                        >
                      </div>
                      <div class="statistics-item">
                        <span class="label">中风险交易：</span>
                        <span class="value"
                          >{{ statisticsData.mediumRiskCount }} 笔 ({{
                            transactionCount > 0
                              ? ((statisticsData.mediumRiskCount / transactionCount) * 100).toFixed(2)
                              : '0'
                          }}%)</span
                        >
                      </div>
                      <div class="statistics-item">
                        <span class="label">低风险交易：</span>
                        <span class="value"
                          >{{ statisticsData.lowRiskCount }} 笔 ({{
                            transactionCount > 0
                              ? ((statisticsData.lowRiskCount / transactionCount) * 100).toFixed(2)
                              : '0'
                          }}%)</span
                        >
                      </div>
                    </div>

                    <div class="statistics-section">
                      <h3 class="statistics-title">交易区域分布</h3>
                      <div
                        class="statistics-item"
                        v-for="(item, index) in statisticsData.regionDistribution"
                        :key="'region-' + index"
                      >
                        <span class="label">{{ item.region }}：</span>
                        <span class="value">{{ item.value }}%</span>
                      </div>
                    </div>

                    <div class="statistics-section">
                      <h3 class="statistics-title">交易类型分析</h3>
                      <div
                        class="statistics-item"
                        v-for="(item, index) in statisticsData.transactionTypeDistribution"
                        :key="'type-' + index"
                      >
                        <span class="label">{{ item.type }}：</span>
                        <span class="value">{{ item.value }}%</span>
                      </div>
                    </div>

                    <div class="statistics-section">
                      <h3 class="statistics-title">分析结论</h3>
                      <div class="statistics-item">
                        <span class="label">交易活动：</span>
                        <span class="value">当前监测期间交易活动{{ transactionCount > 100 ? '活跃' : '正常' }}</span>
                      </div>
                      <div class="statistics-item">
                        <span class="label">异常交易比例：</span>
                        <span class="value"
                          >{{ anomalyCount / transactionCount > 0.05 ? '高于' : '处于' }}历史平均水平</span
                        >
                      </div>
                      <div class="statistics-item">
                        <span class="label">关注建议：</span>
                        <span class="value">{{ anomalyCount > 3 ? '高风险地区和大额交易' : '正常交易监测' }}</span>
                      </div>
                    </div>
                  </div>
                </a-tab-pane>
                <a-tab-pane key="2" tab="统计可视化">
                  <div class="textarea-container">
                    <div v-if="chartLoading" class="visualization-loading">
                      <a-spin tip="图表生成中..." />
                    </div>
                    <div v-if="!statisticsData.riskDistribution.length" class="visualization-placeholder">
                      <p>点击"统计信息可视化"按钮生成数据可视化图表</p>
                    </div>
                    <div v-show="statisticsData.riskDistribution.length && !chartLoading">
                      <div class="chart-type-selector">
                        <a-radio-group v-model="currentChart" @change="renderChart">
                          <a-radio-button value="pie">风险分布饼图</a-radio-button>
                          <a-radio-button value="column">区域分布柱状图</a-radio-button>
                          <a-radio-button value="bar">交易类型条形图</a-radio-button>
                        </a-radio-group>
                      </div>
                      <!-- 预定义所有图表容器 -->
                      <div
                        id="statistics-chart-pie"
                        class="chart-container"
                        :style="{ display: currentChart === 'pie' ? 'block' : 'none' }"
                      ></div>
                      <div
                        id="statistics-chart-column"
                        class="chart-container"
                        :style="{ display: currentChart === 'column' ? 'block' : 'none' }"
                      ></div>
                      <div
                        id="statistics-chart-bar"
                        class="chart-container"
                        :style="{ display: currentChart === 'bar' ? 'block' : 'none' }"
                      ></div>
                    </div>

                    <!-- 添加隐藏的图表容器，确保它们始终存在于DOM中 -->
                    <div style="display: none">
                      <div id="statistics-chart-pie-hidden" class="chart-container"></div>
                      <div id="statistics-chart-column-hidden" class="chart-container"></div>
                      <div id="statistics-chart-bar-hidden" class="chart-container"></div>
                    </div>
                  </div>
                </a-tab-pane>
              </a-tabs>

              <div class="panel-footer">
                <div class="report-controls">
                  <div class="report-selectors">
                    <!-- 可以在这里添加统计相关的选择器 -->
                  </div>
                  <div>
                    <a-button type="primary" @click="generateStats" :disabled="!isMonitoring && !hasMonitoringData">
                      统计分析
                    </a-button>
                    <a-button @click="visualizeStats">统计信息可视化</a-button>
                  </div>
                </div>
              </div>
              <div class="timestamp" v-if="statsTimestamp">统计生成时间: {{ statsTimestamp }}</div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>

    <div class="footer">
      <p>跨境支付事中监管系统 &copy; 2023 版权所有</p>
    </div>
  </div>
</template>

<script>
import { streamAgent } from '@/utils/request'
import { Pie, Column, Bar } from '@antv/g2plot'

export default {
  name: 'AmlMonitor',
  data() {
    return {
      isMonitoring: false,
      loading: false,
      dataSource: 'default_data',
      monitoringAlerts: '事中实时监测准备就绪...\n\n',
      monitoringReport: '',
      statisticsReport: '',
      reportLoading: false,
      monitoringTimer: null,
      startTime: null,
      transactionCount: 0,
      anomalyCount: 0,
      monitoringDuration: '00:00:00',
      timeRange: 'day',
      businessScope: 'current',
      reportTimestamp: '',
      statsTimestamp: '',
      hasMonitoringData: false,
      monitoringActiveKey: '1',
      statisticsActiveKey: '1',
      // 添加离开页面时间记录
      deactivatedTime: null,
      // 添加实时预警表格数据
      alertsTableData: [],
      // 添加统计数据
      statisticsData: {
        riskDistribution: [
          { type: '高风险交易', value: 0 },
          { type: '中风险交易', value: 0 },
          { type: '低风险交易', value: 0 }
        ],
        regionDistribution: [
          { region: '亚太地区', value: 40 },
          { region: '欧美地区', value: 30 },
          { region: '中东地区', value: 20 },
          { region: '其他地区', value: 10 }
        ],
        transactionTypeDistribution: [
          { type: '贸易支付', value: 60 },
          { type: '服务支付', value: 25 },
          { type: '投资转账', value: 10 },
          { type: '其他类型', value: 5 }
        ],
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        totalAmount: 0,
        avgAmount: 0
      },
      // 图表相关
      chartLoading: false,
      chartInstances: {},
      currentChart: 'pie',
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
    // 组件挂载完成后，预先初始化所有图表
    this.$nextTick(() => {
      // 确保统计数据已初始化
      if (!this.statisticsData.riskDistribution.length) {
        this.updateStatisticsData()
      }

      // 预先创建所有图表类型的实例
      setTimeout(() => {
        this.preInitAllCharts()
      }, 1000)

      // 从本地存储恢复监测状态
      this.restoreMonitoringState()
    })
  },
  beforeDestroy() {
    // 清理定时器
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer)
    }

    // 清理图表实例
    if (this.chartInstances) {
      Object.values(this.chartInstances).forEach((instance) => {
        instance.destroy()
      })
    }
  },
  // 添加activated生命周期钩子，在keep-alive组件激活时调用
  activated() {
    console.log('AmlMonitor组件激活')

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
    console.log('AmlMonitor组件停用')
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
              riskDistribution: state.statisticsData.riskDistribution || [],
              regionDistribution: state.statisticsData.regionDistribution || [],
              transactionTypeDistribution: state.statisticsData.transactionTypeDistribution || [],
              highRiskCount: parseInt(state.statisticsData.highRiskCount) || 0,
              mediumRiskCount: parseInt(state.statisticsData.mediumRiskCount) || 0,
              lowRiskCount: parseInt(state.statisticsData.lowRiskCount) || 0,
              totalAmount: parseInt(state.statisticsData.totalAmount) || 0,
              avgAmount: parseInt(state.statisticsData.avgAmount) || 0
            }
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

          // 恢复报告相关数据
          if (state.monitoringReport) this.monitoringReport = state.monitoringReport
          if (state.monitoringAlerts) this.monitoringAlerts = state.monitoringAlerts
          if (state.reportTimestamp) this.reportTimestamp = state.reportTimestamp
          if (state.statsTimestamp) this.statsTimestamp = state.statsTimestamp

          // 恢复标签页状态
          if (state.monitoringActiveKey) this.monitoringActiveKey = state.monitoringActiveKey
          if (state.statisticsActiveKey) this.statisticsActiveKey = state.statisticsActiveKey

          // 恢复图表相关状态
          if (state.currentChart) this.currentChart = state.currentChart

          // 恢复选择器状态
          if (state.timeRange) this.timeRange = state.timeRange
          if (state.businessScope) this.businessScope = state.businessScope

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
          // 保存报告相关数据
          monitoringReport: this.monitoringReport,
          monitoringAlerts: this.monitoringAlerts,
          reportTimestamp: this.reportTimestamp,
          statsTimestamp: this.statsTimestamp,
          // 保存标签页状态
          monitoringActiveKey: this.monitoringActiveKey,
          statisticsActiveKey: this.statisticsActiveKey,
          // 保存图表相关状态
          currentChart: this.currentChart,
          // 保存选择器状态
          timeRange: this.timeRange,
          businessScope: this.businessScope
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
      this.monitoringAlerts = '事中实时监测已启动...\n监控中，等待异常交易预警...\n\n'
      this.monitoringReport = ''

      // 重置表格和统计数据
      this.alertsTableData = []
      this.statisticsData = {
        riskDistribution: [
          { type: '高风险交易', value: 0 },
          { type: '中风险交易', value: 0 },
          { type: '低风险交易', value: 0 }
        ],
        regionDistribution: [
          { region: '亚太地区', value: 40 },
          { region: '欧美地区', value: 30 },
          { region: '中东地区', value: 20 },
          { region: '其他地区', value: 10 }
        ],
        transactionTypeDistribution: [
          { type: '贸易支付', value: 60 },
          { type: '服务支付', value: 25 },
          { type: '投资转账', value: 10 },
          { type: '其他类型', value: 5 }
        ],
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

      // 添加监测结束消息
      this.monitoringAlerts += '\n--- 监测已停止 ---\n'
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

        // 更新风险分布统计
        this.updateStatisticsData()

        // 仍然保留原来的文本形式，以便兼容
        const alertMessage =
          `[${timeString}] 预警 #${this.anomalyCount}：检测到异常交易\n` +
          `交易号: ${transactionId}\n` +
          `金额: $${amount} USD\n` +
          `异常原因: ${reason}\n` +
          `风险等级: ${riskLevel}\n` +
          `------------------------------\n\n`

        this.monitoringAlerts = alertMessage + this.monitoringAlerts

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

    // 更新统计数据
    updateStatisticsData() {
      // 风险分布数据
      this.statisticsData.riskDistribution = [
        { type: '高风险交易', value: this.statisticsData.highRiskCount },
        { type: '中风险交易', value: this.statisticsData.mediumRiskCount },
        { type: '低风险交易', value: this.statisticsData.lowRiskCount }
      ]

      // 区域分布数据
      this.statisticsData.regionDistribution = [
        { region: '亚太地区', value: 40 + Math.floor(Math.random() * 10) },
        { region: '欧美地区', value: 30 + Math.floor(Math.random() * 10) },
        { region: '中东地区', value: 10 + Math.floor(Math.random() * 10) },
        { region: '其他地区', value: 5 + Math.floor(Math.random() * 5) }
      ]

      // 交易类型分布数据
      this.statisticsData.transactionTypeDistribution = [
        { type: '贸易支付', value: 60 + Math.floor(Math.random() * 10) },
        { type: '服务支付', value: 20 + Math.floor(Math.random() * 10) },
        { type: '投资转账', value: 10 + Math.floor(Math.random() * 5) },
        { type: '其他类型', value: 5 + Math.floor(Math.random() * 5) }
      ]
    },

    // 生成监测报告
    async generateReport() {
      this.reportLoading = true
      this.reportTimestamp = new Date().toLocaleString()

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
        '### 4.2 网络拓扑特征\n' +
        '```mermaid\n' +
        'graph TD\n' +
        '    A[节点0] -->|高频交易| B(节点5)\n' +
        '    B --> C[节点6]\n' +
        '    C --> D{节点7-8}\n' +
        '    D -->|资金汇集| E[离岸账户X]\n' +
        '```\n' +
        '## 5. 建议监控措施\n' +
        '### 5.1 即时行动\n' +
        '1. **冻结审查**：\n' +
        '- 对节点5关联账户实施90天临时冻结\n' +
        '- 要求节点0提供最终受益人(UBO)证明文件\n' +
        '2. **增强监控**：\n' +
        '- 对$9,500-10,000区间交易增设实时预警规则\n' +
        '- 对塞浦路斯路由交易实施双因素验证\n' +
        '### 5.2 长期改进\n' +
        '| 措施类型       | 具体方案                          | 实施时间表 |\n' +
        '|----------------|-----------------------------------|------------|\n' +
        '| 模型优化       | 增加暗网地址关联特征              | Q3 2024    |\n' +
        '| 政策更新       | 修订《高风险国家业务处理规程》    | Q2 2024    |\n' +
        '| 培训计划       | 开展GNN预警系统专项分析师培训     | 每月       |\n' +
        '## 6. 后续行动\n' +
        '1. **监管报告**：\n' +
        '- 在72小时内提交节点5、6的SAR报告\n' +
        '- 准备FINTRAC特别披露文件\n' +
        '2. **内部审查**：\n' +
        '- 回溯高风险节点最近24个月交易记录\n' +
        '- 审计相关KYC档案的完整性\n' +
        '3. **模型迭代**：\n' +
        '- 建立风险案例库反馈机制（每月更新）\n' +
        '- 增加加密货币混币器检测模块\n' +
        '---'

      // 切换到监测报告标签
      this.monitoringActiveKey = '2'

      try {
        if (this.dataSource === 'default_data') {
          // 使用默认数据集调用API
          this.monitoringReport = '正在生成反洗钱分析报告，请稍候...'

          try {
            // 准备云端数据集URL
            const cloudDatasetUrl = 'https://lhcos-84055-1317429791.cos.ap-shanghai.myqcloud.com/ioeb/test_dataset.zip'

            // 创建表单数据
            const formData = new FormData()
            formData.append('file_url', cloudDatasetUrl)

            // 使用streamAgent替代fetch
            streamAgent('/api/agent/aml_report', formData, {
              onStart: () => {
                console.log('开始生成报告')
              },
              onStep: (data) => {
                console.log(`步骤 ${data.step}`, data)
              },
              onError: (error) => {
                // this.monitoringReport = `错误: ${error}`
                this.monitoringReport = defaultMonitoringReport
                console.error('API返回错误:', error)
                this.reportLoading = false
                // 保存状态
                this.saveMonitoringState()
              },
              onWarning: (warning) => {
                this.monitoringReport = `警告: ${warning}`
                console.warn('API返回警告:', warning)
                this.reportLoading = false
                // 保存状态
                this.saveMonitoringState()
              },
              onFinalResult: (results) => {
                if (results.report) {
                  this.monitoringReport = results.report
                } else {
                  this.monitoringReport = '未能获取到报告内容，请重试。'
                }
                this.reportLoading = false
                // 保存状态
                this.saveMonitoringState()
              },
              onComplete: () => {
                if (this.reportLoading) {
                  this.reportLoading = false
                  // 保存状态
                  this.saveMonitoringState()
                }
              },
              onDataProcessError: (error) => {
                console.error('解析数据失败:', error)
                this.monitoringReport = `解析数据失败: ${error}`
                this.reportLoading = false
                // 保存状态
                this.saveMonitoringState()
              }
            })
          } catch (error) {
            console.error('生成报告时出错:', error)
            this.monitoringReport = defaultMonitoringReport

            this.reportLoading = false
            // 保存状态
            this.saveMonitoringState()
          }
        } else {
          // 模拟报告生成（非默认数据源）
          this.monitoringReport =
            '监测报告：\n\n' +
            '时间: ' +
            new Date().toLocaleString() +
            '\n' +
            '监测时长: ' +
            this.monitoringDuration +
            '\n' +
            '检测到跨境支付交易总量: ' +
            this.transactionCount +
            '笔\n' +
            '异常交易数量: ' +
            this.anomalyCount +
            '笔\n\n' +
            '异常交易详情：\n\n' +
            '异常交易1：\n' +
            '- 交易号: TX' +
            Math.floor(10000000 + Math.random() * 90000000) +
            '\n' +
            '- 交易金额: $' +
            Math.floor(10000 + Math.random() * 40000) +
            ' USD\n' +
            '- 异常原因: 短时间内多笔大额交易，收款方为高风险地区企业\n' +
            '- 风险等级: 高\n' +
            '- 建议措施: 暂停交易，进行人工审核\n\n' +
            (this.anomalyCount > 1
              ? '异常交易2：\n' +
                '- 交易号: TX' +
                Math.floor(10000000 + Math.random() * 90000000) +
                '\n' +
                '- 交易金额: $' +
                Math.floor(5000 + Math.random() * 20000) +
                ' USD\n' +
                '- 异常原因: 交易路径异常，资金流向与历史交易模式不符\n' +
                '- 风险等级: 中\n' +
                '- 建议措施: 临时冻结交易，联系客户确认\n\n'
              : '') +
            '风险提示：\n' +
            '- 本次监测期间发现' +
            this.anomalyCount +
            '笔异常交易，占总交易量的' +
            (this.transactionCount > 0 ? ((this.anomalyCount / this.transactionCount) * 100).toFixed(2) : '0') +
            '%\n' +
            '- 建议加强对高风险地区跨境交易的审核\n' +
            '- 系统智能体判断当前整体风险水平: ' +
            (this.anomalyCount > 3 ? '高' : this.anomalyCount > 1 ? '中' : '低')

          // 延迟取消加载状态模拟API调用时间
          setTimeout(() => {
            this.reportLoading = false
            // 保存状态
            this.saveMonitoringState()
          }, 1000)
        }
      } catch (error) {
        console.error('报告生成过程中出错:', error)
        this.monitoringReport = `报告生成过程中出错: ${error.message}`
        this.reportLoading = false
        // 保存状态
        this.saveMonitoringState()
      }
    },

    // 更新模型
    updateModels() {
      this.$message.info('监测模型检索与更新功能将在后续版本中实现')
    },

    // 生成统计分析
    generateStats() {
      // 切换到统计分析标签
      this.statisticsActiveKey = '1'
      this.statsTimestamp = new Date().toLocaleString()

      // 确保统计数据已经更新
      if (!this.statisticsData.riskDistribution.length) {
        this.updateStatisticsData()
      }

      // 不再需要生成statisticsReport文本字符串
      // 因为我们现在直接在模板中使用数据绑定

      // 保存状态
      this.saveMonitoringState()
    },

    // 预先初始化所有图表
    preInitAllCharts() {
      try {
        console.log('开始预初始化所有图表')

        // 创建图表容器的备份
        const chartTypes = ['pie', 'column', 'bar']
        this.chartInstances = {}

        // 为每种图表类型创建实例
        chartTypes.forEach((type) => {
          // 先尝试使用正常容器，如果不存在则使用隐藏容器
          let containerId = `statistics-chart-${type}`
          let container = document.getElementById(containerId)

          if (!container) {
            containerId = `statistics-chart-${type}-hidden`
            container = document.getElementById(containerId)
          }

          if (!container) {
            console.error(`图表容器 ${containerId} 不存在`)
            return
          }

          // 创建图表实例
          try {
            let chartInstance = null

            if (type === 'pie') {
              chartInstance = new Pie(containerId, {
                appendPadding: 10,
                data: this.statisticsData.riskDistribution,
                angleField: 'value',
                colorField: 'type',
                radius: 0.8,
                legend: { position: 'right' },
                label: { type: 'outer', content: '{name} {percentage}' },
                interactions: [{ type: 'element-active' }]
              })
            } else if (type === 'column') {
              chartInstance = new Column(containerId, {
                data: this.statisticsData.regionDistribution,
                xField: 'region',
                yField: 'value',
                label: {
                  position: 'middle',
                  style: { fill: '#FFFFFF', opacity: 0.6 }
                },
                meta: { value: { alias: '交易百分比' } }
              })
            } else if (type === 'bar') {
              chartInstance = new Bar(containerId, {
                data: this.statisticsData.transactionTypeDistribution,
                xField: 'value',
                yField: 'type',
                seriesField: 'type',
                legend: { position: 'top-left' }
              })
            }

            if (chartInstance) {
              chartInstance.render()
              this.chartInstances[type] = chartInstance
            }
          } catch (error) {
            console.error(`创建${type}图表实例时出错:`, error)
          }
        })

        console.log('所有图表预初始化完成')
      } catch (error) {
        console.error('预初始化图表时出错:', error)
      }
    },

    // 修改visualizeStats方法
    visualizeStats() {
      // 切换到统计可视化标签
      this.statisticsActiveKey = '2'
      this.chartLoading = true

      // 确保有统计数据
      if (!this.statisticsData.riskDistribution.length) {
        this.updateStatisticsData()
      }

      // 使用nextTick确保标签已切换并且DOM已更新
      this.$nextTick(() => {
        // 如果图表实例不存在，先初始化
        if (!this.chartInstances || Object.keys(this.chartInstances).length === 0) {
          setTimeout(() => {
            this.preInitAllCharts()
            this.showSelectedChart()
            this.chartLoading = false
            // 保存状态
            this.saveMonitoringState()
          }, 500)
        } else {
          // 如果图表实例已存在，直接显示
          this.showSelectedChart()
          this.chartLoading = false
          // 保存状态
          this.saveMonitoringState()
        }
      })
    },

    // 显示选定的图表
    showSelectedChart() {
      const chartTypes = ['pie', 'column', 'bar']

      chartTypes.forEach((type) => {
        const container = document.getElementById(`statistics-chart-${type}`)
        if (container) {
          if (type === this.currentChart) {
            container.style.display = 'block'

            // 更新图表数据
            if (this.chartInstances && this.chartInstances[type]) {
              try {
                if (type === 'pie') {
                  this.chartInstances[type].changeData(this.statisticsData.riskDistribution)
                } else if (type === 'column') {
                  this.chartInstances[type].changeData(this.statisticsData.regionDistribution)
                } else if (type === 'bar') {
                  this.chartInstances[type].changeData(this.statisticsData.transactionTypeDistribution)
                }
              } catch (error) {
                console.error(`更新${type}图表数据时出错:`, error)
              }
            }
          } else {
            container.style.display = 'none'
          }
        }
      })
    },

    // 修改renderChart方法
    renderChart() {
      this.showSelectedChart()
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
      this.monitoringAlerts = '事中实时监测准备就绪...\n\n'
      this.monitoringReport = ''
      this.reportTimestamp = ''
      this.statsTimestamp = ''
      this.hasMonitoringData = false
      this.alertsTableData = []

      // 重置统计数据
      this.statisticsData = {
        riskDistribution: [
          { type: '高风险交易', value: 0 },
          { type: '中风险交易', value: 0 },
          { type: '低风险交易', value: 0 }
        ],
        regionDistribution: [
          { region: '亚太地区', value: 40 },
          { region: '欧美地区', value: 30 },
          { region: '中东地区', value: 20 },
          { region: '其他地区', value: 10 }
        ],
        transactionTypeDistribution: [
          { type: '贸易支付', value: 60 },
          { type: '服务支付', value: 25 },
          { type: '投资转账', value: 10 },
          { type: '其他类型', value: 5 }
        ],
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        totalAmount: 0,
        avgAmount: 0
      }

      // 恢复默认Tab
      this.monitoringActiveKey = '1'
      this.statisticsActiveKey = '1'

      this.$message.success('监测状态已重置')
    }
  }
}
</script>

<style lang="less" scoped>
.monitoring-fullscreen-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;

  .header {
    background-color: #1e3799;
    color: white;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

    h1 {
      margin: 0;
      font-size: 22px;
      color: white;
    }

    .user-info {
      display: flex;
      align-items: center;

      span {
        margin-right: 15px;
        color: white;
      }
    }
  }

  .navigation-menu {
    margin-bottom: 16px;

    /deep/ .ant-menu-horizontal {
      line-height: 46px;
      border-bottom: 1px solid #e8e8e8;
      background-color: white;

      .ant-menu-item {
        font-size: 14px;

        a {
          color: #595959;
        }

        i {
          margin-right: 5px;
        }
      }

      .ant-menu-item-selected {
        a {
          color: #1890ff;
        }
      }
    }
  }

  .content-container {
    flex: 1;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .footer {
    text-align: center;
    padding: 15px;
    color: #777;
    font-size: 12px;
    margin-top: 20px;
    border-top: 1px solid #eee;
    background-color: white;
  }

  .monitoring-container {
    .panel {
      background-color: white;
      border-radius: 4px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }

    .panel-title {
      font-size: 18px;
      font-weight: bold;
      color: #1890ff;
      margin: 0;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #666;
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

    .monitoring-info {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
      text-align: center;
    }

    .textarea-container {
      position: relative;
      height: 280px;
    }

    .panel-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 15px;
    }

    .report-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .timestamp {
      font-size: 12px;
      color: #999;
      text-align: right;
      margin-top: 5px;
    }

    .center-loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .visualization-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: #f9f9f9;
      text-align: center;
      color: #666;
    }

    .alerts-container {
      position: relative;
      height: 280px;
    }

    .empty-alerts {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .chart-type-selector {
      margin-bottom: 10px;
    }

    .chart-container {
      height: 280px;
    }

    .visualization-loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    // 新增统计分析面板样式
    .statistics-panel {
      overflow-y: auto;
      padding: 10px 15px;
      background-color: #f9f9f9;
      border-radius: 4px;
    }

    .statistics-section {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #e8e8e8;
    }

    .statistics-section:last-child {
      border-bottom: none;
    }

    .statistics-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e3799;
      margin-bottom: 8px;
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

    .statistics-item .value:has(span.highlight) {
      color: #cf1322;
    }

    .highlight {
      color: #cf1322;
      font-weight: bold;
    }

    .reset-button {
      text-align: center;
      margin-top: 5px;
      opacity: 0.6;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
