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
                  <div class="textarea-container">
                    <a-textarea
                      v-model="monitoringAlerts"
                      :rows="12"
                      readonly
                      placeholder="监控中，等待异常交易预警..."
                    >
                    </a-textarea>
                  </div>
                </a-tab-pane>
                <a-tab-pane key="2" tab="监测报告">
                  <div class="textarea-container">
                    <a-textarea
                      v-model="monitoringReport"
                      :rows="12"
                      readonly
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
                  <div class="textarea-container">
                    <a-textarea
                      v-model="statisticsReport"
                      :rows="12"
                      readonly
                      placeholder="点击'统计分析'按钮，生成监测期间的交易数据统计分析..."
                    >
                    </a-textarea>
                  </div>
                </a-tab-pane>
                <a-tab-pane key="2" tab="统计可视化">
                  <div class="textarea-container">
                    <div class="visualization-placeholder">
                      <p>点击"统计信息可视化"按钮生成数据可视化图表<br />(功能将在后续版本中实现)</p>
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
      statisticsActiveKey: '1'
    }
  },
  beforeDestroy() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer)
    }
  },
  methods: {
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
    },

    // 开始监测
    startMonitoring() {
      // 重置计数器和监测报告
      this.startTime = new Date()
      this.transactionCount = 0
      this.anomalyCount = 0
      this.monitoringAlerts = '事中实时监测已启动...\n监控中，等待异常交易预警...\n\n'
      this.monitoringReport = ''

      // 每秒更新时间和模拟交易
      this.monitoringTimer = setInterval(() => {
        this.updateMonitoringTime()
        this.simulateTransactions()
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
    simulateTransactions() {
      const newTransactions = Math.floor(Math.random() * 5) * 10 + Math.floor(Math.random() * 10)
      this.transactionCount += newTransactions

      // 约10%的交易可能是异常的
      if (Math.random() < 0.2) {
        this.anomalyCount++

        // 添加实时预警信息到预警文本框
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

        // 构建预警消息
        const alertMessage =
          `[${timeString}] 预警 #${this.anomalyCount}：检测到异常交易\n` +
          `交易号: ${transactionId}\n` +
          `金额: $${amount} USD\n` +
          `异常原因: ${reason}\n` +
          `风险等级: ${riskLevel}\n` +
          `------------------------------\n\n`

        // 添加到预警文本框，保持最新预警在顶部
        this.monitoringAlerts = alertMessage + this.monitoringAlerts
      }
    },

    // 生成监测报告
    async generateReport() {
      this.reportLoading = true
      this.reportTimestamp = new Date().toLocaleString()

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
                this.monitoringReport = `错误: ${error}`
                console.error('API返回错误:', error)
                this.reportLoading = false
              },
              onWarning: (warning) => {
                this.monitoringReport = `警告: ${warning}`
                console.warn('API返回警告:', warning)
                this.reportLoading = false
              },
              onFinalResult: (results) => {
                if (results.report) {
                  this.monitoringReport = results.report
                } else {
                  this.monitoringReport = '未能获取到报告内容，请重试。'
                }
                this.reportLoading = false
              },
              onComplete: () => {
                if (this.reportLoading) {
                  this.reportLoading = false
                }
              },
              onDataProcessError: (error) => {
                console.error('解析数据失败:', error)
                this.monitoringReport = `解析数据失败: ${error}`
                this.reportLoading = false
              }
            })
          } catch (error) {
            console.error('生成报告时出错:', error)
            this.monitoringReport =
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

            this.reportLoading = false
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
          }, 1000)
        }
      } catch (error) {
        console.error('报告生成过程中出错:', error)
        this.monitoringReport = `报告生成过程中出错: ${error.message}`
        this.reportLoading = false
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

      // 模拟统计分析生成
      this.statisticsReport =
        '信息统计：\n\n' +
        '当前监测期间交易总览：\n' +
        '- 监测时长: ' +
        this.monitoringDuration +
        '\n' +
        '- 跨境支付总额: $' +
        (this.transactionCount * (10000 + Math.floor(Math.random() * 5000))).toLocaleString() +
        ' USD\n' +
        '- 交易总量: ' +
        this.transactionCount +
        '笔\n' +
        '- 平均交易金额: $' +
        Math.floor(10000 + Math.random() * 5000).toLocaleString() +
        ' USD\n\n' +
        '异常统计：\n' +
        '- 高风险交易: ' +
        Math.floor(this.anomalyCount * 0.4) +
        '笔 (' +
        (this.transactionCount > 0
          ? ((Math.floor(this.anomalyCount * 0.4) / this.transactionCount) * 100).toFixed(2)
          : '0') +
        '%)\n' +
        '- 中风险交易: ' +
        Math.floor(this.anomalyCount * 0.6) +
        '笔 (' +
        (this.transactionCount > 0
          ? ((Math.floor(this.anomalyCount * 0.6) / this.transactionCount) * 100).toFixed(2)
          : '0') +
        '%)\n' +
        '- 低风险交易: ' +
        Math.floor(this.transactionCount * 0.02) +
        '笔 (' +
        (this.transactionCount > 0
          ? ((Math.floor(this.transactionCount * 0.02) / this.transactionCount) * 100).toFixed(2)
          : '0') +
        '%)\n\n' +
        '交易区域分布：\n' +
        '- 亚太地区: ' +
        (40 + Math.floor(Math.random() * 10)) +
        '%\n' +
        '- 欧美地区: ' +
        (30 + Math.floor(Math.random() * 10)) +
        '%\n' +
        '- 中东地区: ' +
        (10 + Math.floor(Math.random() * 10)) +
        '%\n' +
        '- 其他地区: ' +
        (5 + Math.floor(Math.random() * 5)) +
        '%\n\n' +
        '交易类型分析：\n' +
        '- 贸易支付: ' +
        (60 + Math.floor(Math.random() * 10)) +
        '%\n' +
        '- 服务支付: ' +
        (20 + Math.floor(Math.random() * 10)) +
        '%\n' +
        '- 投资转账: ' +
        (10 + Math.floor(Math.random() * 5)) +
        '%\n' +
        '- 其他类型: ' +
        (5 + Math.floor(Math.random() * 5)) +
        '%\n\n' +
        '分析结论：\n' +
        '- 当前监测期间交易活动' +
        (this.transactionCount > 100 ? '活跃' : '正常') +
        '\n' +
        '- 异常交易比例' +
        (this.anomalyCount / this.transactionCount > 0.05 ? '高于' : '处于') +
        '历史平均水平\n' +
        '- 建议关注' +
        (this.anomalyCount > 3 ? '高风险地区和大额交易' : '正常交易监测')

      // 更新统计时间戳
      this.statsTimestamp = new Date().toLocaleString()
    },

    // 统计信息可视化
    visualizeStats() {
      // 切换到统计可视化标签
      this.statisticsActiveKey = '2'

      this.$message.info('统计信息可视化功能将在后续版本中实现')
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
  }
}
</style>
