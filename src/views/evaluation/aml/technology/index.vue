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
                  <a-select v-model="selectedMetric" placeholder="请选择">
                    <a-select-option value="-1">全部</a-select-option>
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
      selectedMetric: '-1',
      normOptions: {
        0: { value: 'privacy', text: '隐私性' },
        1: { value: 'safety-fingerprint', text: '安全性指纹' },
        2: { value: 'safety-watermark', text: '安全性水印' },
        3: { value: 'fairness', text: '公平性' },
        4: { value: 'robustness', text: '鲁棒性' },
        5: { value: 'explainability', text: '可解释性' }
      },
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

      // 新条件：只要服务名称包含"模型"就使用Agent评测，不再考虑数据集类型
      const containsModelKeyword = serviceName.includes('模型')

      if (this.selectedRows.length === 1 && containsModelKeyword) {
        // 检查数据集类型和状态
        if (this.dataSetType === '1' && this.dataSetFiles.length === 0) {
          this.$message.warning('请上传数据集文件！')
          this.testLoading = false
          return
        }
        // 使用模型评测Agent
        this.runAgentEvaluation(serviceName)
      } else {
        // 其他情况使用模拟数据
        this.runMockEvaluation(serviceName)
      }
    },
    // 添加新方法：使用Agent进行评测
    async runAgentEvaluation(serviceName) {
      // 准备表单数据
      const formData = new FormData()
      formData.append('model_name', serviceName)

      // 提供metrics参数（必需），根据选择或默认包含所有指标
      let metricsToSend = 'privacy,safety-fingerprint,safety-watermark,fairness,robustness,explainability'
      if (this.selectedMetric !== '-1') {
        // 如果选择了特定指标
        metricsToSend = this.normOptions[this.selectedMetric].value
      }
      formData.append('metrics', metricsToSend) // 注意是metrics不是metric

      // 处理不同数据集类型
      if (this.dataSetType === '1') {
        // 使用上传的数据集文件
        const fileObj = this.dataSetFiles[0].originFileObj || this.dataSetFiles[0]
        const fileName = fileObj.name || ''
        const fileExt = fileName.split('.').pop().toLowerCase()

        if (fileExt !== 'zip') {
          this.$message.error('请上传ZIP格式的数据集文件')
          this.testLoading = false
          return
        }

        // 注意参数名称是data_file而不是file
        formData.append('data_file', fileObj)
      } else {
        // 平台数据集 - 使用固定的URL
        const datasetUrl = 'https://lhcos-84055-1317429791.cos.ap-shanghai.myqcloud.com/ioeb/test_dataset.zip'
        formData.append('file_url', datasetUrl)
      }

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
    // 添加新方法：使用模拟数据进行评测
    runMockEvaluation(serviceName) {
      // 根据选择的指标获取对应的评测结果
      let resultMetric = 'all'
      if (this.selectedMetric !== '-1') {
        resultMetric = this.normOptions[this.selectedMetric].value
      }

      setTimeout(() => {
        this.$message.success(`${serviceName} 测试完成！`)

        // 原有的模拟逻辑
        const obj = {
          code: 200,
          message: '测试通过！',
          data: {
            privacy: {
              'Precision (Model 1)': {
                value: 0.4952,
                description: '模型1的精度'
              },
              'Recall (Model 1)': {
                value: 0.41,
                description: '模型1的召回率'
              },
              'Precision (Model 2)': {
                value: 0.3475,
                description: '模型2的精度'
              },
              'Recall (Model 2)': {
                value: 0.4872,
                description: '模型2的召回率'
              },
              'Kappa ': {
                value: 0.4527,
                description: 'Kappa值'
              },
              'Consistency Ratio': {
                value: 0.7945,
                description: '一致性比例'
              },
              score: {
                value: 0.4527,
                description: '最终得分'
              }
            },
            'safety-fingerprint': {
              'Results under cln mode': 0,
              'sensi_point_ratio_origin_gt50.0(cln)': {
                value: 0.0,
                description: '指纹点敏感度大于50.0%的占比（cln模式）'
              },
              'sensi_point_ratio_origin_gt60.0(cln)': {
                value: 0.0,
                description: '指纹点敏感度大于50.0%的占比（cln模式）'
              },
              'num_positive_model(cln)': {
                value: 4,
                description: '总篡改模型个数（cln模式）'
              },
              'detection_success_rate_origin(cln)': {
                value: 25.0,
                description: '模型篡改检测成功率（cln模式）'
              },
              'fingerprint_score(cln)': {
                value: 0.25,
                description: '最终指纹得分（cln模式）'
              },
              'Results under atk mode': 0,
              'sensi_point_ratio_origin_gt50.0(atk)': {
                value: 0.0,
                description: '指纹点敏感度大于50.0%的占比（atk模式）'
              },
              'sensi_point_ratio_origin_gt60.0(atk)': {
                value: 0.0,
                description: '指纹点敏感度大于50.0%的占比（atk模式）'
              },
              'num_positive_model(atk)': {
                value: 4,
                description: '总篡改模型个数（atk模式）'
              },
              'detection_success_rate_origin(atk)': {
                value: 25.0,
                description: '模型篡改检测成功率（atk模式）'
              },
              'fingerprint_score(atk)': {
                value: 0.25,
                description: '最终指纹得分（atk模式）'
              }
            },
            'safety-watermark': {
              watermark_score: {
                value: 0.6,
                description: '最终水印得分'
              },
              verification_ratio: {
                value: 0.1667,
                description: '生成异常样本的比例'
              },
              acc: {
                value: 1.0,
                description: '对正常样本的识别准确性'
              },
              positive_val: {
                value: [0.1667, 0.2667],
                description: '阳性模型对含有特殊触发器样本的验证准确性'
              },
              negative_val: {
                value: [0.2, 0.0, 0.5, 0.0333, 0.0333, 0.8333, 0.1, 0.0, 0.2, 0.9667],
                description: '阴性模型对含有特殊触发器样本的验证准确性'
              }
            },
            fairness: {
              attribute: 'total_incoming_amount',
              fairness_score: 10.6201,
              description: '关于属性"total_incoming_amount"的公平性评估，数值越大代表越公平'
            },
            robustness: {
              'Surrogate model predict number before attack': {
                value: {
                  'on class 0': 422,
                  'on class 1': 1,
                  'on class 2': 31
                },
                description:
                  'The result is the number of nodes for each class predicted by the surrogate model on the graph before the attack.'
              },
              'Surrogate model predict accuracy before attack': {
                value: {
                  'on class 0': 1.0,
                  'on class 1': 1.0,
                  'on class 2': 1.0
                },
                description:
                  "The result is the accuracy before the attack, with the surrogate model's own predictions used as the ground truth, and thus it is 100%."
              },
              'Surrogate model predict number after attack': {
                value: {
                  'on class 0': 422,
                  'on class 1': 0,
                  'on class 2': 12
                },
                description:
                  'The result is the number of nodes for each class predicted by the surrogate model on the graph after the attack.'
              },
              'Surrogate model predict accuracy after attack': {
                value: {
                  'on class 0': 1.0,
                  'on class 1': 0.0,
                  'on class 2': 0.3870967741935484
                },
                description:
                  'The result is the prediction accuracy of the surrogate model after the attack, with its own predictions used as the ground truth (i.e., the accuracy before the attack is 100%).'
              },
              'White box robustness score': {
                value: 0.375,
                description: 'The result is the robustness score under the white-box attack scenario.',
                'Black box robustness score': {
                  value: 0.2,
                  description: 'The result is the robustness score under the white-box attack scenario.'
                }
              }
            },
            explainability: {
              subgraphs2: {
                value: './graph_dataset/delete_edges_outside_subgraph',
                description: 'Path to subgraph 2'
              },
              subgraphs1: {
                value: './graph_dataset/original',
                description: 'Path to subgraph 1'
              },
              jaccard_coefficient: {
                value: 0.3333,
                description: 'Jaccard Coefficient between subgraph 1 and subgraph 4'
              },
              num_nodes_combined: {
                value: 4,
                description: 'Number of nodes in the combined subgraphs'
              },
              num_edges_subgraph1: {
                value: 7,
                description: 'Number of edges in subgraph 1'
              },
              num_edges_subgraph2: {
                value: 7,
                description: 'Number of edges in subgraph 2'
              },
              score: {
                value: 0.3333,
                description: 'Final score based on Jaccard coefficient'
              },
              subgraphs3: {
                value: './graph_dataset/delete_edges_within_subgraph',
                description: 'Path to subgraph 3'
              },
              num_edges_subgraph3: {
                value: 6,
                description: 'Number of edges in subgraph 3'
              },
              subgraphs4: {
                value: './graph_dataset/rerun',
                description: 'Path to subgraph 4'
              },
              num_edges_subgraph4: {
                value: 6,
                description: 'Number of edges in subgraph 4'
              }
            }
          }
        }

        // 根据选择的指标过滤结果
        if (resultMetric !== 'all') {
          const filteredData = {}
          filteredData[resultMetric] = obj.data[resultMetric]
          obj.data = filteredData
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
