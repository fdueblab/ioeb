<template>
  <page-header-wrapper :title="false">
    <a-row :gutter="24">
      <a-col :span="10">
        <a-card :bordered="false">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :span="18">
                  <a-form-item label="元应用名称">
                    <a-input v-model="queryParam.id" placeholder="请输入元应用名称"/>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <div style="text-align: center;">
                    <a-button type="primary" @click="handleSearch">查询</a-button>
                  </div>
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
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="14">
        <a-card :bordered="false">
          <a-form>
            <a-row :gutter="20">
              <a-col :span="8">
                <a-form-item label="验证指标">
                  <a-select v-model="selectedMetric">
                    <a-select-option value="all">全部</a-select-option>
                    <a-select-option v-for="(item, index) in metricOptions" :key="index" :value="item.code">
                      {{ item.text }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="数据集">
                  <a-select v-model="dataSetType" placeholder="请选择" default-value="0">
                    <a-select-option value="0">平台数据集</a-select-option>
                    <a-select-option value="1">上载数据集</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="dataSetType === '0'" :span="6">
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
              <a-textarea v-model="response" placeholder="" :rows="7" />
            </a-form-item>
            <a-form-item
              :wrapperCol="{ span: 24 }"
              style="text-align: center">
              <a-button type="primary" :loading="testLoading" @click="onTest">开始验证</a-button>
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
import { filterServices } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'

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

export default {
  name: 'GenericEmulation',
  components: {
    TagSelect,
    StandardFormRow,
    ArticleListContent,
    AgentExecutionPanel
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
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      dataSetType: '0',
      dataSetFiles: [],
      metricOptions: [],
      selectedMetric: 'all',
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '元应用名称',
          dataIndex: 'name'
        }
      ],
      dataLoading: false,
      dataSource: [],
      filteredDataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      response: '',
      isRefreshing: false,
      // Agent面板相关字段
      showAgentPanel: false,
      agentIsRunning: false,
      agentSteps: [],
      agentError: '',
      agentWarning: '',
      agentFinalResults: null
    }
  },
  created () {
    this.initData()
    this.loadMetricOptions()
  },
  watch: {
    // 监听domain属性变化，当切换领域时重新加载数据
    verticalType(newDomain, oldDomain) {
      if (newDomain !== oldDomain) {
        this.initData()
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
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    // 加载验证指标从字典缓存
    async loadMetricOptions() {
      try {
        this.metricOptions = await dictionaryCache.loadDict('performance_metric') || []
        console.log('metricOptions', this.metricOptions)
        if (!this.metricOptions.length) {
          console.warn('未能从缓存字典加载验证指标，使用备用数据')
          // 如果字典加载失败，可以使用备用数据
          this.metricOptions = [
            { code: 'recall', text: '查全率' },
            { code: 'precision', text: '查准率' },
            { code: 'computation_efficiency', text: '计算效率' }
          ]
        }
      } catch (error) {
        console.error('加载验证指标字典失败:', error)
        this.metricOptions = [
          { code: 'recall', text: '查全率' },
          { code: 'precision', text: '查准率' },
          { code: 'computation_efficiency', text: '计算效率' }
        ]
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
          // 标准化数据
          this.dataSource = this.standardizeServiceData(response.services)
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
        return await filterServices({ domain: this.verticalType, type: 'meta' })
      } catch (error) {
        console.error('获取服务数据失败:', error)
        return undefined
      }
    },
    // 标准化API返回的数据，确保格式统一
    standardizeServiceData(services) {
      return services.map(service => {
        // 确保norm属性存在且为数组
        if (!service.norm || !Array.isArray(service.norm)) {
          service.norm = []
        }
        // 确保source属性存在
        if (!service.source) {
          service.source = {
            popoverTitle: '服务溯源',
            companyName: '',
            companyAddress: '',
            companyContact: '',
            companyIntroduce: '',
            msIntroduce: '',
            companyScore: 0,
            msScore: 0
          }
        }
        return service
      })
    },
    handleSearch() {
      if (!this.queryParam.id) {
        this.filteredDataSource = [...this.dataSource]
        return
      }
      this.filteredDataSource = this.dataSource.filter(item => {
        return item.name && item.name.includes(this.queryParam.id)
      })
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
      this.queryParam = { id: '' }
      this.filteredDataSource = [...this.dataSource]
    },
    handleChange (value) {
      console.log(`selected ${value}`)
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
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
      if (this.selectedMetric !== 'all') {
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

          // 处理验证结果并展示
          if (results.validation_result) {
            // 如果是对象，转为JSON字符串展示
            if (typeof results.validation_result === 'object') {
              this.response = JSON.stringify(results.validation_result, null, 4)
            } else {
              // 如果已经是字符串，直接展示
              this.response = results.validation_result
            }
            this.$message.success(`${metaAppName} 验证完成！`)

            // 更新元应用状态 - 与原有逻辑保持一致
            const metaAppInfo = sessionStorage.getItem('metaAppInfo')
            if (metaAppInfo) {
              const serviceData = {
                ...JSON.parse(sessionStorage.getItem('metaAppInfo')),
                status: 4,
                norm: [
                  {
                    key: 0,
                    score: 5
                  },
                  {
                    key: 1,
                    score: 5
                  },
                  {
                    key: 2,
                    score: 5
                  },
                  {
                    key: 3,
                    score: 5
                  }
                ]
              }
              sessionStorage.setItem('metaAppInfo', JSON.stringify(serviceData))
            }
          } else {
            // 若没有validation_result字段，展示整个结果对象
            this.response = JSON.stringify(results, null, 4)
            this.$message.info('验证完成，但未找到标准验证结果')
          }

          this.testLoading = false
          this.agentIsRunning = false
        },
        onComplete: () => {
          this.testLoading = false
          this.agentIsRunning = false
          // todo: 修改norm
        },
        onDataProcessError: (e) => {
          console.error('解析数据失败:', e)
          this.$message.error('解析验证数据失败')
          this.testLoading = false
          this.agentIsRunning = false
        }
      })
    },

    // 添加模拟验证方法
    runMockValidation(metaAppName) {
      // 模拟异步请求
      setTimeout(() => {
        const obj = {
          code: 200,
          message: '验证通过！',
          data: {
            // 模拟数据
            'recall': {
              value: 1.00,
              description: '查全率'
            },
            'precision': {
              value: 0.97,
              description: '查准率'
            },
            'computation_efficiency': {
              value: 0.95,
              description: '计算效率'
            }
          }
        }
        // 根据选择的指标过滤结果
        if (this.selectedMetric !== 'all') {
          const filteredData = {}
          filteredData[this.selectedMetric] = obj.data[this.selectedMetric]
          obj.data = filteredData
        }

        // todo: 修改norm
        // 更新元应用状态 - 与原有逻辑保持一致
        const metaAppInfo = sessionStorage.getItem('metaAppInfo')
        if (metaAppInfo) {
          const serviceData = {
            ...JSON.parse(sessionStorage.getItem('metaAppInfo')),
            status: 4,
            norm: [
              { key: 0, score: 5 },
              { key: 1, score: 5 },
              { key: 2, score: 5 },
              { key: 3, score: 5 }
            ]
          }
          sessionStorage.setItem('metaAppInfo', JSON.stringify(serviceData))
        }

        this.response = JSON.stringify(obj, null, 4)
        this.testLoading = false
        this.$message.success(`${metaAppName} 验证完成！`)
      }, 1000)
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
</style>
