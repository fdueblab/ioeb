<template>
  <page-header-wrapper :title="false">
    <a-row :gutter="24">
      <a-col :span="12">
        <a-card :bordered="false">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="名称">
                    <a-input v-model="queryParam.name" placeholder="输入名称以筛选" @change="handleSearch" allowClear />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="状态">
                    <a-select v-model="queryParam.status" @change="handleSearch">
                      <a-select-option value="all">全部</a-select-option>
                      <a-select-option v-for="(item, index) in statusDict" :key="index" :value="item.code">
                        {{ item.text }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <a-table
            ref="table"
            :columns="columns"
            :dataSource="filteredDataSource"
            :row-selection="rowSelection"
            :loading="dataLoading"
            size="middle"
          >
            <span slot="serial" slot-scope="text, record, index">
              {{ index + 1 }}
            </span>
            <span slot="status" slot-scope="text">
              <a-badge :status="statusStyleFilter(text)" :text="statusFilter(text)" />
            </span>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false">
          <a-form>
            <a-row :gutter="20">
              <a-col :span="8">
                <a-form-item label="验证指标">
                  <a-select
                    ref="metricsSelect"
                    v-model="selectedMetric"
                    mode="multiple"
                    placeholder="请选择验证指标"
                    style="width: 100%"
                    :dropdownStyle="{ padding: 0 }"
                  >
                    <div slot="dropdownRender" slot-scope="menu">
                      <div style="padding: 8px; cursor: pointer; text-align: center; border-bottom: 1px solid #e8e8e8;">
                        <a @click="selectAllMetrics">全选</a>
                      </div>
                      <v-nodes :vnodes="menu" />
                    </div>
                    <a-select-option v-for="(item, index) in metricOptions" :key="index" :value="item.code">
                      {{ item.text }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="数据集类型">
                  <a-select v-model="dataSetType" placeholder="请选择" default-value="0">
                    <a-select-option value="0">平台数据集</a-select-option>
                    <a-select-option value="1">上载数据集</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="dataSetType === '0'" :span="8">
                <a-form-item label="选择数据集">
                  <a-select placeholder="请选择" default-value="0">
                    <a-select-option v-for="(dataset, index) in domainDatasets" :key="index" :value="index.toString()">
                      {{ dataset }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="dataSetType === '1'" :span="8">
                <a-form-item label="上载数据集">
                  <a-upload
                    accept=".csv,.txt,.xls,.xlsx,.zip"
                    :file-list="dataSetFiles"
                    :remove="removeDataSetFile"
                    :customRequest="customDataSetFileChose"
                    :multiple="false">
                    <a-button> <a-icon type="upload" /> 选择数据集 </a-button>
                  </a-upload>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <a-form>
            <a-form-item label="验证结果">
              <!-- 新的验证结果显示组件 -->
              <div v-if="evaluationResults.length > 0" class="evaluation-results">
                <div
                  v-for="(result, index) in evaluationResults"
                  :key="index"
                  class="evaluation-item"
                  :class="{ 'expanded': result.expanded }"
                >
                  <div class="evaluation-header" @click="toggleExpanded(index)">
                    <div class="evaluation-title">
                      <span class="metric-name">{{ result.name }}</span>
                      <a-tooltip :title="result.description">
                        <a-icon type="question-circle" class="help-icon" />
                      </a-tooltip>
                    </div>
                    <div class="evaluation-score">
                      <span class="score-value">{{ result.score }}</span>
                      <span v-if="result.range" class="score-range">{{ result.range }}</span>
                    </div>
                    <a-icon :type="result.expanded ? 'up' : 'down'" class="expand-icon" />
                  </div>
                  <div v-if="result.expanded" class="evaluation-details">
                    <pre class="json-details">{{ result.details }}</pre>
                  </div>
                </div>
              </div>
              <!-- 空状态或原始textarea作为后备 -->
              <a-textarea
                v-else
                v-model="response"
                placeholder="选择验证指标并点击开始验证"
                :rows="7"
                :disabled="true"
              />
            </a-form-item>
            <a-form-item
              :wrapperCol="{ span: 24 }"
              style="text-align: center">
              <a-button v-if="tested" disabled icon="check">验证完成</a-button>
              <a-button v-else type="primary" :loading="testLoading" @click="onTest" icon="bulb">开始验证</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
    <agent-execution-panel
      v-if="showAgentPanel"
      :is-running="agentIsRunning"
      :steps="agentSteps"
      :error="agentError"
      :warning="agentWarning"
      :final-results="agentFinalResults"
      @close="showAgentPanel = false"
    />
  </page-header-wrapper>
</template>

<script>
import { ArticleListContent, StandardFormRow, TagSelect } from '@/components'
import { getMetaAppData } from '@/mock/data/services_data'
import AgentExecutionPanel from '@/components/Agent/AgentExecutionPanel'
import { streamAgent } from '@/utils/request'
import { filterServices, updateService } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'
import store from '@/store'

// 领域数据集配置
const domainDatasetsMap = {
  homeAI: ['无人机任务', '课题组'],
  evtol: ['无人机任务', '课题组'],
  ecommerce: ['电商平台', '用户行为'],
  agriculture: ['农业数据', '作物监测'],
  health: ['患者数据', '医疗记录'],
  aml: ['跨境电商', '课题一内部数据集'],
  aircraft: ['飞行数据', '维护记录']
}

// 在export default前添加辅助组件
const VNodes = {
  functional: true,
  render: (h, ctx) => ctx.props.vnodes
}

export default {
  name: 'GenericEmulation',
  components: {
    TagSelect,
    StandardFormRow,
    ArticleListContent,
    AgentExecutionPanel,
    VNodes
  },
  props: {
    verticalType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      visible: false,
      confirmLoading: false,
      testLoading: false,
      tested: false,
      mdl: null,
      // 查询参数
      queryParam: {
        name: undefined,
        status: 'all'
      },
      statusDict: [],
      statusStyleDict: [],
      dataSetType: '0',
      dataSetFiles: [],
      metricOptions: [],
      selectedMetric: [],
      columns: [
        {
          title: '#',
          width: '80px',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '元应用名称',
          dataIndex: 'name'
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: '160px',
          scopedSlots: { customRender: 'status' }
        }
      ],
      dataLoading: false,
      dataSource: [],
      filteredDataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      response: '',
      isRefreshing: false,
      // 新增：验证结果数据结构
      evaluationResults: [],

      // 指标描述和取值范围配置
      metricDescriptions: {
        'recall': {
          description: '查全率，衡量模型找到所有相关结果的能力，分值越高表示召回能力越强',
          range: '[0, 1]'
        },
        'precision': {
          description: '查准率，衡量模型返回结果的准确性，分值越高表示精确度越高',
          range: '[0, 1]'
        },
        'computation_efficiency': {
          description: '计算效率，衡量模型的计算资源利用效率，分值越高表示效率越高',
          range: '[0, 1]'
        },
        'latency': {
          description: '响应延迟，衡量模型的响应时间，数值越小表示响应越快',
          range: '[0, +∞) ms'
        },
        'throughput': {
          description: '吞吐量，衡量模型的并发处理能力，数值越大表示处理能力越强',
          range: '[0, +∞) req/s'
        }
      },

      // 模拟响应数据
      mockResponse: {
        code: 200,
        message: '验证通过！',
        data: {
          'recall': {
            'value': 0.96,
            'description': '查全率',
            'score': {
              'value': 5,
              'description': '最终评级'
            }
          },
          'precision': {
            'value': 0.91,
            'description': '查准率',
            'score': {
              'value': 4,
              'description': '最终评级'
            }
          },
          'computation_efficiency': {
            'value': 0.87,
            'description': '计算效率',
            'score': {
              'value': 4,
              'description': '最终评级'
            }
          },
          'latency': {
            'value': 235,
            'description': '响应延迟(ms)',
            'score': {
              'value': 3,
              'description': '最终评级'
            }
          },
          'throughput': {
            'value': 56.3,
            'description': '吞吐量(请求/秒)',
            'score': {
              'value': 4,
              'description': '最终评级'
            }
          }
        }
      },
      // Agent面板相关字段
      showAgentPanel: false,
      agentIsRunning: false,
      agentSteps: [],
      agentError: '',
      agentWarning: '',
      agentFinalResults: null
    }
  },
  async created() {
    await this.loadDictionaryData()
    await this.initData()
  },
  watch: {
    // 监听domain属性变化，当切换领域时重新加载数据
    async verticalType(newDomain, oldDomain) {
      if (newDomain !== oldDomain) {
        await this.initData()
      }
    }
  },
  computed: {
    domainDatasets() {
      return domainDatasetsMap[this.verticalType] || domainDatasetsMap.homeAI
    },
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
        type: 'radio'
      }
    }
  },
  methods: {
    statusFilter(type) {
      if (type === undefined) {
        return '未知状态'
      }
      if (!this.statusDict || !Array.isArray(this.statusDict)) {
        return '未知状态'
      }
      const statusItem = this.statusDict.find(item => item && item.code === type)
      return statusItem ? statusItem.text : '未知状态'
    },
    statusStyleFilter(type) {
      if (type === undefined) {
        return 'default'
      }
      if (!this.statusStyleDict || !Array.isArray(this.statusStyleDict)) {
        return 'default'
      }
      const statusItem = this.statusStyleDict.find(item => item && item.code === type)
      return statusItem ? statusItem.text : 'default'
    },
    // 加载验证指标和状态字典
    async loadDictionaryData() {
      try {
        this.metricOptions = await dictionaryCache.loadDict('performance_metric') || []
        const allStatus = await dictionaryCache.loadDict('status') || []
        this.statusStyleDict = await dictionaryCache.loadDict('status_style') || []
        // 筛选出运行中的状态
        const runningStatusCode = this.statusStyleDict.filter(item => ['warning', 'success'].includes(item.text)).map(item => item.code)
        this.statusDict = allStatus.filter(item => runningStatusCode.includes(item.code))
      } catch (error) {
        console.error('加载评测指标字典失败:', error)
        this.metricOptions = [
          { code: 'recall', text: '查全率' },
          { code: 'precision', text: '查准率' },
          { code: 'computation_efficiency', text: '计算效率' },
          { code: 'latency', text: '响应延迟' },
          { code: 'throughput', text: '吞吐量' }
        ]
        this.statusDict = []
        this.statusStyleDict = []
      }
    },
    async initData() {
      this.dataLoading = true
      this.filteredDataSource = [] // 清空现有数据，避免显示上一个页面的数据

      try {
        // 尝试从API获取数据
        console.log(`正在加载${this.verticalType}领域的元应用验证服务数据`)
        const response = await this.fetchServicesFromAPI()

        if (response && response.status === 'success') {
          console.log(`成功从API获取到${response.services.length}条元应用数据`)
          this.dataSource = response.services
        } else {
          console.log('API获取失败，回退到静态数据')
          // 如果API调用失败，回退到静态数据
          this.dataSource = await getMetaAppData(this.verticalType)
        }

        this.filteredDataSource = [...this.dataSource]
      } catch (error) {
        console.error('初始化数据失败:', error)
        // 出错时回退到静态数据
        try {
          this.dataSource = await getMetaAppData(this.verticalType)
          this.filteredDataSource = [...this.dataSource]
        } catch (innerError) {
          console.error('静态数据加载也失败:', innerError)
          this.$message.error('加载数据失败，请刷新页面重试')
          this.dataSource = []
          this.filteredDataSource = []
        }
      } finally {
        this.dataLoading = false
      }
    },
    async fetchServicesFromAPI() {
      try {
        // 筛选出运行中的服务
        const runningStatus = this.statusDict.map(item => item.code)
        return await filterServices({ domain: this.verticalType, type: 'meta', status: runningStatus.join(',') })
      } catch (error) {
        console.error('获取服务数据失败:', error)
        return undefined
      }
    },
    handleSearch() {
      // 重置筛选后的数据
      this.filteredDataSource = [...this.dataSource]
      // 按名称筛选
      if (this.queryParam.name) {
        this.filteredDataSource = this.filteredDataSource.filter(item => {
          return item.name && item.name.includes(this.queryParam.name)
        })
      }
      // 按状态筛选
      if (this.queryParam.status && this.queryParam.status !== 'all') {
        this.filteredDataSource = this.filteredDataSource.filter(item => {
          return item.status === this.queryParam.status
        })
      }
    },
    handleRefresh() {
      if (this.isRefreshing) return
      this.isRefreshing = true
      this.initData().then(() => {
        this.$message.success('刷新成功')
        this.isRefreshing = false
      })
    },
    handleReset() {
      this.queryParam = { name: undefined, status: 'all' }
      this.filteredDataSource = [...this.dataSource]
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
      this.tested = false
      this.response = ''
      this.evaluationResults = [] // 清空验证结果
    },
    async customDataSetFileChose (options) {
      const { file } = options
      if (!file) {
        return false
      }
      const url = URL.createObjectURL(file)
      this.dataSetFiles = [{
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url, // url 是展示在页面上的绝对链接
        originFileObj: file // 添加原始文件对象以便后续上传
      }]
    },
    removeDataSetFile () {
      this.dataSetFiles = []
    },
    onTest () {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择应用！')
        return
      }
      if (this.selectedMetric.length === 0) {
        this.$message.warning('请选择验证指标！')
        return
      }

      this.testLoading = true

      // 获取选中的元应用信息
      const metaApp = this.selectedRows[0]
      const metaAppName = metaApp.name

      // 获取元应用API端点 - 这里假设在metaApp对象中有一个api属性
      // todo: 元应用API端点
      const metaAppApi = metaApp.api || `https://api.example.com/meta_apps/${metaAppName}`

      // 判断是否需要使用Agent进行验证
      if (this.verticalType === 'aml') {
        // 检查是否有上传的数据文件
        const hasDatasetFile = this.dataSetType === '1' && this.dataSetFiles.length > 0

        // 如果只选了一个元应用并且有上传的数据文件，使用Agent进行验证
        if (this.selectedRows.length === 1 && hasDatasetFile) {
          this.runAgentValidation(metaAppApi, metaAppName)
        } else {
          this.runMockValidation(metaAppName)
        }
      } else {
        // 非aml领域使用通用模拟数据
        this.runMockValidation(metaAppName)
      }
    },

    // 添加新方法：使用Agent进行元应用验证
    async runAgentValidation(metaAppApi, metaAppName) {
      // 获取上传的文件对象
      const fileObj = this.dataSetFiles[0].originFileObj || this.dataSetFiles[0]

      // 准备表单数据
      const formData = new FormData()
      formData.append('meta_app_api', metaAppApi)

      // 根据选择的指标值进行处理，默认包含所有指标
      let metricsToEvaluate = this.metricOptions.map(item => item.code)
      // 如果选择了特定指标
      if (this.selectedMetric.length > 0) {
        metricsToEvaluate = [this.selectedMetric]
      }

      // 将指标数组转换为JSON字符串
      formData.append('metrics', JSON.stringify(metricsToEvaluate))

      // 添加数据文件
      formData.append('data_file', fileObj)

      // 创建Agent执行Panel组件
      if (!this.showAgentPanel) {
        this.showAgentPanel = true
        this.agentSteps = []
        this.agentError = ''
        this.agentWarning = ''
        this.agentFinalResults = null
        this.agentIsRunning = true
      }

      // 调用Agent API
      await streamAgent('/api/agent/meta_app_validation', formData, {
        onStart: () => {
          this.agentIsRunning = true
        },
        onStep: (data) => {
          this.agentSteps.push(data)
        },
        onError: (error) => {
          this.agentError = error
          this.$message.error(`验证过程出错: ${error}`)
          this.testLoading = false
          this.agentIsRunning = false
        },
        onWarning: (warning) => {
          this.agentWarning = warning
          this.$message.warning(`验证警告: ${warning}`)
          this.testLoading = false
          this.agentIsRunning = false
        },
        onFinalResult: (results) => {
          this.agentFinalResults = results

          // 处理验证结果数据
          let validationData = null
          if (results.validation_result) {
            if (typeof results.validation_result === 'object') {
              validationData = results.validation_result
            } else {
              try {
                validationData = JSON.parse(results.validation_result)
              } catch (e) {
                console.error('解析验证结果失败:', e)
                validationData = null
              }
            }
          }

          if (validationData) {
            // 使用新的处理方法
            this.processEvaluationResults(validationData)
            this.$message.success(`${metaAppName} 验证完成！`)

            // 更新服务norm字段
            if (this.selectedRows.length > 0) {
              const normToUpdate = this.evaluationResults.map(result => ({
                key: result.code,
                score: result.score
              }))
              this.updateServiceNorm(this.selectedRows[0], normToUpdate)
            }
          } else {
            // 后备方案：显示原始结果
            this.response = JSON.stringify(results, null, 4)
            this.$message.info('验证完成，但未找到标准验证结果')
          }

          this.testLoading = false
          this.agentIsRunning = false
          this.tested = true
        },
        onComplete: () => {
          this.testLoading = false
          this.agentIsRunning = false
          this.tested = true
        },
        onDataProcessError: (e) => {
          console.error('解析数据失败:', e)
          this.$message.error('解析验证数据失败')
          this.testLoading = false
          this.agentIsRunning = false
        }
      })
    },
    // 添加新方法用于更新服务的norm字段
    async updateServiceNorm(currentServiceData, normList) {
      const isPlatForm = store.getters.roles?.permissionList?.includes('admin') || false
      try {
        // 获取当前服务数据
        const currentService = { ...currentServiceData }
        // 如果norm字段不存在，创建新数组
        if (!currentService.norm) {
          currentService.norm = []
        }
        // 更新每个norm
        normList.forEach(normItem => {
          // 准备norm数据
          const normData = {
            key: normItem.key,
            score: normItem.score,
            platformChecked: isPlatForm ? 1 : 0
          }
          // 检查是否已存在相同key的norm
          let normExists = false
          for (let i = 0; i < currentService.norm.length; i++) {
            if (currentService.norm[i].key === normItem.key) {
              // 更新已存在的norm
              currentService.norm[i] = normData
              normExists = true
              break
            }
          }
          // 如果不存在，添加新的norm
          if (!normExists) {
            currentService.norm.push(normData)
          }
        })
        // 修改状态 todo: 应该在后端实现一个专门负责修改norm的接口，并实现状态的修改
        currentService.status = isPlatForm ? 'release' : 'pre_release_pending'
        // 调用API更新服务
        await updateService(currentService.id, currentService)
      } catch (error) {
        console.error('更新服务验证指标失败:', error)
      }
    },
    // 添加模拟验证方法
    runMockValidation(metaAppName) {
      // 模拟异步请求
      setTimeout(() => {
        // 根据选择的指标过滤结果
        const filteredData = {}
        if (this.selectedMetric.length > 0) {
          this.selectedMetric.forEach(metric => {
            if (this.mockResponse.data[metric]) {
              filteredData[metric] = this.mockResponse.data[metric]
            }
          })
        } else {
          return
        }

        // 使用新的处理方法
        this.processEvaluationResults(filteredData)

        // 更新服务的norm字段
        if (this.selectedRows.length > 0) {
          const normToUpdate = this.evaluationResults.map(result => ({
            key: result.code,
            score: result.score
          }))
          this.updateServiceNorm(this.selectedRows[0], normToUpdate)
        }

        this.testLoading = false
        this.tested = true
        this.$message.success(`${metaAppName} 验证完成！`)
      }, 1000)
    },
    selectAllMetrics() {
      // 全选所有指标
      this.selectedMetric = this.metricOptions.map(item => item.code)
      // 关闭下拉框
      setTimeout(() => {
        // 让下拉框失去焦点，从而关闭
        document.body.click()
      }, 100)
    },

    // 新增：切换展开状态
    toggleExpanded(index) {
      this.$set(this.evaluationResults[index], 'expanded', !this.evaluationResults[index].expanded)
    },

    // 新增：处理验证结果数据
    processEvaluationResults(rawData) {
      const results = []

      // 遍历选中的指标
      this.selectedMetric.forEach(metricCode => {
        const metricOption = this.metricOptions.find(option => option.code === metricCode)
        if (!metricOption) return

        const metricData = rawData[metricCode]
        if (!metricData) return

        // 获取分值
        let score = 'N/A'
        if (metricData.value !== undefined) {
          score = metricData.value
        } else if (metricData.score && metricData.score.value !== undefined) {
          score = metricData.score.value
        }

        // 获取指标描述和取值范围
        const metricInfo = this.metricDescriptions[metricCode] || {}

        results.push({
          code: metricCode,
          name: metricOption.text,
          score: score,
          range: metricInfo.range,
          description: metricInfo.description,
          details: JSON.stringify(metricData, null, 2),
          expanded: false
        })
      })

      this.evaluationResults = results
    }
  }
}
</script>
<style lang="less" scoped>
.ant-pro-components-tag-select {
  :deep(.ant-pro-tag-select .ant-tag) {
    margin-right: 24px;
    padding: 0 8px;
    font-size: 14px;
  }
}

.list-articles-trigger {
  margin-left: 12px;
}

/* 新增：验证结果样式 */
.evaluation-results {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;

  .evaluation-item {
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .evaluation-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #fafafa;
      }

      .evaluation-title {
        flex: 1;
        display: flex;
        align-items: center;

        .metric-name {
          font-weight: 500;
          margin-right: 8px;
        }

        .help-icon {
          color: #8c8c8c;
          cursor: help;

          &:hover {
            color: #1890ff;
          }
        }
      }

      .evaluation-score {
        display: flex;
        align-items: center;
        margin-right: 16px;

        .score-value {
          font-size: 16px;
          font-weight: 600;
          color: #1890ff;
          margin-right: 8px;
        }

        .score-range {
          font-size: 12px;
          color: #8c8c8c;
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
        }
      }

      .expand-icon {
        color: #8c8c8c;
        transition: transform 0.3s;
      }
    }

    &.expanded .evaluation-header .expand-icon {
      transform: rotate(180deg);
    }

    .evaluation-details {
      padding: 16px;
      background-color: #fafafa;
      border-top: 1px solid #f0f0f0;

      .json-details {
        margin: 0;
        padding: 12px;
        background: #fff;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        line-height: 1.4;
        max-height: 300px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }
  }
}
</style>
