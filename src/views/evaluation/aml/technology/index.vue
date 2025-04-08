<template>
  <page-header-wrapper :title="false">
    <a-row :gutter="24">
      <a-col :span="10">
        <a-card :bordered="false">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :span="18">
                  <a-form-item label="服务名称">
                    <a-input v-model="queryParam.id" placeholder="" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <div style="text-align: center">
                    <a-button type="primary">查询</a-button>
                  </div>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <a-table
            ref="table"
            :columns="columns"
            :dataSource="dataSource"
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
                <a-form-item label="评测指标">
                  <a-select placeholder="请选择" :default-value="-1">
                    <a-select-option :value="-1">全部</a-select-option>
                    <a-select-option v-for="(item, index) in normOptions" :key="index" :value="index">
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
                    <a-select-option value="0">跨境贸易</a-select-option>
                    <a-select-option value="1">课题一内部数据集</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="dataSetType === '1'" :span="8">
                <a-form-item label="上载数据集">
                  <div>
                    <a-upload
                      accept=".zip"
                      :file-list="dataSetFiles"
                      :remove="removeDataSetFile"
                      :customRequest="customDataSetFileChose"
                      :multiple="false"
                    >
                      <a-button> <a-icon type="upload" /> 选择数据集 </a-button>
                    </a-upload>
                  </div>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <a-form>
            <a-form-item label="测评结果">
              <a-textarea v-model="response" placeholder="" :rows="7" />
            </a-form-item>
            <a-form-item :wrapperCol="{ span: 24 }" style="text-align: center">
              <a-button type="primary" :loading="testLoading" @click="onTest">开始测评</a-button>
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
import { getNormMap, getServiceStatusMap } from '@/mock/data/map_data'
import { getServiceData } from '@/mock/data/services_data'
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
      // create model
      form: this.$form.createForm(this),
      visible: false,
      testLoading: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '服务名称',
          dataIndex: 'name'
        }
      ],
      normOptions: getNormMap(),
      dataSetType: '0',
      dataSetFiles: [],
      dataLoading: false,
      dataSource: [],
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
    async initData() {
      this.dataLoading = true
      this.dataSource = await getServiceData('aml', true)
      this.dataLoading = false
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
        this.$message.warning('请选择测评服务！')
        return
      }

      this.testLoading = true

      // 获取选中的服务名称
      const serviceName = this.selectedRows[0].name

      // 条件1：课题一或课题二 + 上传数据集 -> 使用aml_model_evaluation Agent
      const isProject1or2 = serviceName.includes('课题一') || serviceName.includes('课题二')
      const usesUploadedDataset = this.dataSetType === '1'
      const hasDatasetFile = this.dataSetFiles.length > 0

      // 条件2：只选一个服务 + 平台数据集 -> 使用service_evaluation Agent
      const usesPlatformDataset = this.dataSetType === '0'

      if (this.selectedRows.length === 1 && isProject1or2 && usesUploadedDataset && hasDatasetFile) {
        // 使用课题模型评测Agent
        this.runAgentEvaluation(serviceName)
      } else if (this.selectedRows.length === 1 && usesPlatformDataset) {
        // 使用服务评测Agent
        // this.runServiceEvaluation(serviceName)
        this.runMockEvaluation(serviceName)
      } else {
        // 使用模拟数据
        this.runMockEvaluation(serviceName)
      }
    },
    // 添加新方法：使用Agent进行评测
    async runAgentEvaluation(serviceName) {
      // 检查是否为ZIP文件
      const fileObj = this.dataSetFiles[0].originFileObj || this.dataSetFiles[0]
      const fileName = fileObj.name || ''
      const fileExt = fileName.split('.').pop().toLowerCase()

      if (fileExt !== 'zip') {
        this.$message.error('请上传ZIP格式的数据集文件')
        this.testLoading = false
        return
      }

      // 准备表单数据
      const formData = new FormData()
      formData.append('model_name', serviceName)
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
      streamAgent('/api/agent/aml_model_evaluation', formData, {
        onStart: () => {
          this.agentIsRunning = true
        },
        onStep: (data) => {
          this.agentSteps.push(data)
        },
        onError: (error) => {
          this.agentError = error
          this.$message.error(`评测过程出错: ${error}`)
          this.testLoading = false
          this.agentIsRunning = false
        },
        onWarning: (warning) => {
          this.agentWarning = warning
          this.$message.warning(`评测警告: ${warning}`)
          this.testLoading = false
          this.agentIsRunning = false
        },
        onFinalResult: (results) => {
          this.agentFinalResults = results

          // 直接展示evaluation_result，不添加任何额外信息
          if (results.evaluation_result) {
            // 如果是对象，转为JSON字符串展示
            if (typeof results.evaluation_result === 'object') {
              this.response = JSON.stringify(results.evaluation_result, null, 4)
            } else {
              // 如果已经是字符串，直接展示
              this.response = results.evaluation_result
            }
            this.$message.success(`${serviceName} 测试完成！`)
          } else {
            // 若没有evaluation_result字段，展示整个结果对象
            this.response = JSON.stringify(results, null, 4)
            this.$message.info('测试完成，但未找到标准评测结果')
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
          this.$message.error('解析评测数据失败')
          this.testLoading = false
          this.agentIsRunning = false
        }
      })
    },
    // 添加新方法：使用服务评测Agent
    async runServiceEvaluation(serviceName) {
      // 准备表单数据
      const formData = new FormData()
      formData.append('service_name', serviceName)

      // 获取评测指标
      const selectedMetricIndex = this.$el.querySelector('.ant-select-selection-selected-value')?.textContent
      let metricsToEvaluate = []

      // 根据选择的指标值进行处理
      if (selectedMetricIndex === '全部') {
        // 选择了全部指标
        metricsToEvaluate = ['安全性', '鲁棒性', '隐私性', '可信性']
      } else if (selectedMetricIndex && this.normOptions[selectedMetricIndex]) {
        // 选择了特定指标
        metricsToEvaluate = [this.normOptions[selectedMetricIndex].text]
      } else {
        // 默认使用全部指标
        metricsToEvaluate = ['安全性', '鲁棒性', '隐私性', '可信性']
      }

      // 将指标数组转换为JSON字符串
      formData.append('metrics', JSON.stringify(metricsToEvaluate))

      // 准备默认测试数据文件
      // 注意：这里我们需要使用一个默认的ZIP文件，因为API需要一个文件参数
      // 在实际环境中，应该准备一个默认的测试数据包
      const testDataBlob = new Blob(['默认测试数据'], { type: 'application/zip' })
      const testDataFile = new File([testDataBlob], 'default_test_data.zip', { type: 'application/zip' })
      formData.append('data_file', testDataFile)

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
      streamAgent('/api/agent/service_evaluation', formData, {
        onStart: () => {
          this.agentIsRunning = true
        },
        onStep: (data) => {
          this.agentSteps.push(data)
        },
        onError: (error) => {
          this.agentError = error
          this.$message.error(`评测过程出错: ${error}`)
          this.testLoading = false
          this.agentIsRunning = false
        },
        onWarning: (warning) => {
          this.agentWarning = warning
          this.$message.warning(`评测警告: ${warning}`)
          this.testLoading = false
          this.agentIsRunning = false
        },
        onFinalResult: (results) => {
          this.agentFinalResults = results

          // 处理评测结果并展示
          if (results.evaluation_result) {
            // 如果是对象，转为JSON字符串展示
            if (typeof results.evaluation_result === 'object') {
              this.response = JSON.stringify(results.evaluation_result, null, 4)
            } else {
              // 如果已经是字符串，直接展示
              this.response = results.evaluation_result
            }
            this.$message.success(`${serviceName} 测试完成！`)
          } else {
            // 若没有evaluation_result字段，展示整个结果对象
            this.response = JSON.stringify(results, null, 4)
            this.$message.info('测试完成，但未找到标准评测结果')
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
          this.$message.error('解析评测数据失败')
          this.testLoading = false
          this.agentIsRunning = false
        }
      })
    },
    // 添加新方法：使用模拟数据进行评测
    runMockEvaluation(serviceName) {
      // 原有的模拟逻辑
      setTimeout(() => {
        this.$message.success(`${serviceName} 测试完成！`)
        const obj = {
          code: 200,
          message: '测试通过！',
          data: {
            securityResult: '5.0',
            robustnessResult: '5.0',
            privacyResult: '5.0',
            credibilityResult: '5.0'
          }
        }
        if (sessionStorage.getItem('upload_exception_service')) {
          sessionStorage.setItem('upload_exception_service', '4')
        }
        this.response = JSON.stringify(obj, null, 4)
        this.testLoading = false
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
