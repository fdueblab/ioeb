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
                    <a-input v-model="queryParam.id" placeholder="请输入元应用名称" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <div style="text-align: center">
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
                  <a-select placeholder="请选择" :default-value="-1">
                    <a-select-option :value="-1">全部</a-select-option>
                    <a-select-option v-for="(item, index) in performanceMetricOptions" :key="index" :value="index">
                      {{ item }}
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
                    <a-select-option value="0">跨境电商</a-select-option>
                    <a-select-option value="1">课题一内部数据集</a-select-option>
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
                    :multiple="false"
                  >
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
            <a-form-item :wrapperCol="{ span: 24 }" style="text-align: center">
              <a-button type="primary" @click="onTest">开始验证</a-button>
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
import { getNormMap, getPerformanceMetricMap, getServiceStatusMap } from '@/mock/data/map_data'
import AgentExecutionPanel from '@/components/Agent/AgentExecutionPanel'
import { streamAgent } from '@/utils/request'

export default {
  name: 'TableList',
  components: {
    TagSelect,
    StandardFormRow,
    ArticleListContent,
    AgentExecutionPanel
  },
  data() {
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
      performanceMetricOptions: getPerformanceMetricMap(),
      statusMap: getServiceStatusMap(),
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
      // Agent面板相关字段
      showAgentPanel: false,
      agentIsRunning: false,
      agentSteps: [],
      agentError: '',
      agentWarning: '',
      agentFinalResults: null
    }
  },
  filters: {
    statusFilter(type) {
      const statusMap = getServiceStatusMap()
      return statusMap[type].text
    },
    statusTypeFilter(type) {
      const statusMap = getServiceStatusMap()
      return statusMap[type].status
    },
    normFilter(type) {
      const normMap = getNormMap()
      return normMap[type].text
    }
  },
  created() {
    this.initData()
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    handleSearch() {
      this.filteredDataSource = this.dataSource.filter((item) => {
        // const statusMatch = this.queryParam.status === '-1' || item.status === Number(this.queryParam.status)
        // return nameMatch && statusMatch
        return item.name.includes(this.queryParam.name)
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
      this.queryParam = { name: '', status: '-1' }
      this.filteredDataSource = this.dataSource
    },
    handleChange(value) {
      console.log(`selected ${value}`)
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    async customDataSetFileChose(options) {
      const { file } = options
      if (!file) {
        return false
      }
      const url = URL.createObjectURL(file)
      this.dataSetFiles = [
        {
          uid: file?.uid,
          name: file.name,
          status: 'done',
          url, // url 是展示在页面上的绝对链接
          originFileObj: file // 添加原始文件对象以便后续上传
        }
      ]
    },
    removeDataSetFile() {
      this.dataSetFiles = []
    },
    onTest() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择应用！')
        return
      }

      this.testLoading = true

      // 获取选中的元应用信息
      const metaApp = this.selectedRows[0]
      const metaAppName = metaApp.name

      // 获取元应用API端点 - 这里假设在metaApp对象中有一个api属性
      // 实际情况可能需要根据数据结构调整
      const metaAppApi = metaApp.api || `https://api.example.com/meta_apps/${metaAppName}`

      // 检查是否有上传的数据文件
      const hasDatasetFile = this.dataSetType === '1' && this.dataSetFiles.length > 0

      // 如果只选了一个元应用并且有上传的数据文件，使用Agent进行验证
      if (this.selectedRows.length === 1 && hasDatasetFile) {
        this.runAgentValidation(metaAppApi, metaAppName)
      } else {
        // 否则使用模拟数据
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

      // 获取评测指标
      const selectedMetricIndex = this.$el.querySelector('.ant-select-selection-selected-value')?.textContent
      let metricsToEvaluate = []

      // 根据选择的指标值进行处理
      if (selectedMetricIndex === '全部') {
        // 选择了全部指标
        metricsToEvaluate = ['查全率', '查准率', '计算效率']
      } else if (selectedMetricIndex && this.performanceMetricOptions[selectedMetricIndex]) {
        // 选择了特定指标
        metricsToEvaluate = [this.performanceMetricOptions[selectedMetricIndex]]
      } else {
        // 默认使用全部指标
        metricsToEvaluate = ['查全率', '查准率', '计算效率']
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
      streamAgent('/api/agent/meta_app_validation', formData, {
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
        },
        onDataProcessError: (e) => {
          console.error('解析数据失败:', e)
          this.$message.error('解析验证数据失败')
          this.testLoading = false
          this.agentIsRunning = false
        }
      })
    },

    // 添加新方法：使用模拟数据进行验证
    runMockValidation(metaAppName) {
      // 原有的模拟逻辑
      setTimeout(() => {
        this.$message.success(`${metaAppName} 验证完成！`)
        const obj = {
          code: 200,
          message: '验证通过！'
        }
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
        this.response = JSON.stringify(obj, null, 4)
        this.testLoading = false
      }, 1000)
    },
    async initData() {
      this.dataLoading = true
      this.dataSource = await getMetaAppData('aml', true)
      this.filteredDataSource = this.dataSource
      this.dataLoading = false
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
