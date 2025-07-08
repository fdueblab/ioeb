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
                <a-form-item label="评测指标">
                  <a-select
                    ref="metricsSelect"
                    v-model="selectedMetric"
                    mode="multiple"
                    placeholder="请选择评测指标"
                    style="width: 100%"
                    :dropdownStyle="{ padding: 0 }"
                  >
                    <div slot="dropdownRender" slot-scope="menu">
                      <div style="padding: 8px; cursor: pointer; text-align: center; border-bottom: 1px solid #e8e8e8;">
                        <a @click="selectAllMetrics">全选</a>
                      </div>
                      <v-nodes :vnodes="menu" />
                    </div>
                    <a-select-option v-for="(item, index) in normOptions" :key="index" :value="item.code">
                      {{ item.text }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="数据集类型">
                  <a-select v-model="dataSetType" placeholder="请选择类型" default-value="0">
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
                    accept=".zip"
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
            <a-form-item label="测评结果">
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
              <a-textarea
                v-else
                v-model="response"
                placeholder="选择评测指标并点击开始测评"
                :rows="7"
                :disabled="true"
              />
            </a-form-item>
            <a-form-item
              :wrapperCol="{ span: 24 }"
              style="text-align: center">
              <a-button v-if="tested" disabled icon="check">测评完成</a-button>
              <a-button v-else type="primary" :loading="testLoading" @click="onTest" icon="stock">开始测评</a-button>
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
import { getServiceData } from '@/mock/data/services_data'
import AgentExecutionPanel from '@/components/Agent/AgentExecutionPanel'
import { streamAgent } from '@/utils/request'
import { filterServices, updateService } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'
import store from '@/store'

// 领域数据集配置
const domainDatasetsMap = {
  homeAI: ['无人机轨迹', '目标识别', '课题组'],
  evtol: ['无人机轨迹', '目标识别', '课题组'],
  ecommerce: ['商品数据', '用户行为', '销售记录'],
  agriculture: ['作物数据', '土壤监测', '气象数据'],
  health: ['患者记录', '医疗图像', '临床数据'],
  aml: ['跨境贸易', '课题一内部数据集'],
  aircraft: ['飞行数据', '航线规划', '维护记录']
}

// 在export default前添加辅助组件
const VNodes = {
  functional: true,
  render: (h, ctx) => ctx.props.vnodes
}

export default {
  name: 'GenericTechnology',
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
      // create model
      form: this.$form.createForm(this),
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
      columns: [
        {
          title: '#',
          width: '80px',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '服务名称',
          dataIndex: 'name'
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: '160px',
          scopedSlots: { customRender: 'status' }
        }
      ],
      selectedMetric: [],
      normOptions: [],
      dataSetType: '0',
      dataSetFiles: [],
      dataLoading: false,
      dataSource: [],
      filteredDataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      response: '',
      evaluationResults: [],
      metricDescriptions: {
        'privacy': {
          description: '评估模型在处理敏感信息时的隐私保护能力，分值越高表示隐私保护能力越强',
          range: '[0, 1]'
        },
        'safety-fingerprint': {
          description: '评估模型的安全指纹检测能力，分值越高表示检测能力越强',
          range: '[0, 1]'
        },
        'safety-watermark': {
          description: '评估模型的安全水印验证能力，分值越高表示验证能力越强',
          range: '[0, 1]'
        },
        'fairness': {
          description: '评估模型在不同群体间的公平性表现，数值越大代表越公平',
          range: '[0, +∞)'
        },
        'robustness': {
          description: '评估模型在面对攻击时的鲁棒性，分值越高表示抗攻击能力越强',
          range: '[0, 1]'
        },
        'explainability': {
          description: '评估模型决策过程的可解释性，分值越高表示可解释性越强',
          range: '[0, 1]'
        }
      },
      mockResponse: {
        'score': {
          'privacy': {
            'Precision (Model 1)': {
              'value': 0.4952,
              'description': '模型1的精度'
            },
            'Recall (Model 1)': {
              'value': 0.41,
              'description': '模型1的召回率'
            },
            'Precision (Model 2)': {
              'value': 0.3475,
              'description': '模型2的精度'
            },
            'Recall (Model 2)': {
              'value': 0.4872,
              'description': '模型2的召回率'
            },
            'Kappa ': {
              'value': 0.4527,
              'description': 'Kappa值'
            },
            'Consistency Ratio': {
              'value': 0.7945,
              'description': '一致性比例'
            },
            'score': {
              'value': 0.4527,
              'description': '最终得分'
            }
          },
          'safety-fingerprint': {
            'Results under cln mode': 0,
            'sensi_point_ratio_origin_gt50.0(cln)': {
              'value': 0.0,
              'description': '指纹点敏感度大于50.0%的占比（cln模式）'
            },
            'sensi_point_ratio_origin_gt60.0(cln)': {
              'value': 0.0,
              'description': '指纹点敏感度大于50.0%的占比（cln模式）'
            },
            'num_positive_model(cln)': {
              'value': 4,
              'description': '总篡改模型个数（cln模式）'
            },
            'detection_success_rate_origin(cln)': {
              'value': 25.0,
              'description': '模型篡改检测成功率（cln模式）'
            },
            'fingerprint_score(cln)': {
              'value': 0.25,
              'description': '最终指纹得分（cln模式）'
            },
            'Results under atk mode': 0,
            'sensi_point_ratio_origin_gt50.0(atk)': {
              'value': 0.0,
              'description': '指纹点敏感度大于50.0%的占比（atk模式）'
            },
            'sensi_point_ratio_origin_gt60.0(atk)': {
              'value': 0.0,
              'description': '指纹点敏感度大于50.0%的占比（atk模式）'
            },
            'num_positive_model(atk)': {
              'value': 4,
              'description': '总篡改模型个数（atk模式）'
            },
            'detection_success_rate_origin(atk)': {
              'value': 25.0,
              'description': '模型篡改检测成功率（atk模式）'
            },
            'fingerprint_score(atk)': {
              'value': 0.25,
              'description': '最终指纹得分（atk模式）'
            }
          },
          'safety-watermark': {
            'watermark_score': {
              'value': 0.6,
              'description': '最终水印得分'
            },
            'verification_ratio': {
              'value': 0.1667,
              'description': '生成异常样本的比例'
            },
            'acc': {
              'value': 1.0,
              'description': '对正常样本的识别准确性'
            },
            'positive_val': {
              'value': [
                0.1667,
                0.2667
              ],
              'description': '阳性模型对含有特殊触发器样本的验证准确性'
            },
            'negative_val': {
              'value': [
                0.2,
                0.0,
                0.5,
                0.0333,
                0.0333,
                0.8333,
                0.1,
                0.0,
                0.2,
                0.9667
              ],
              'description': '阴性模型对含有特殊触发器样本的验证准确性'
            }
          },
          'fairness': {
            'attribute': 'total_incoming_amount',
            'fairness_score': 10.6201,
            'description': '关于属性"total_incoming_amount"的公平性评估，数值越大代表越公平'
          },
          'robustness': {
            'Surrogate model predict number before attack': {
              'value': {
                'on class 0': 422,
                'on class 1': 1,
                'on class 2': 31
              },
              'description': 'The result is the number of nodes for each class predicted by the surrogate model on the graph before the attack.'
            },
            'Surrogate model predict accuracy before attack': {
              'value': {
                'on class 0': 1.0,
                'on class 1': 1.0,
                'on class 2': 1.0
              },
              'description': "The result is the accuracy before the attack, with the surrogate model's own predictions used as the ground truth, and thus it is 100%."
            },
            'Surrogate model predict number after attack': {
              'value': {
                'on class 0': 422,
                'on class 1': 0,
                'on class 2': 12
              },
              'description': 'The result is the number of nodes for each class predicted by the surrogate model on the graph after the attack.'
            },
            'Surrogate model predict accuracy after attack': {
              'value': {
                'on class 0': 1.0,
                'on class 1': 0.0,
                'on class 2': 0.3870967741935484
              },
              'description': 'The result is the prediction accuracy of the surrogate model after the attack, with its own predictions used as the ground truth (i.e., the accuracy before the attack is 100%).'
            },
            'White box robustness score': {
              'value': 0.375,
              'description': 'The result is the robustness score under the white-box attack scenario.',
              'Black box robustness score': {
                'value': 0.2,
                'description': 'The result is the robustness score under the white-box attack scenario.'
              }
            }
          },
          'explainability': {
            'subgraphs2': {
              'value': './graph_dataset/delete_edges_outside_subgraph',
              'description': 'Path to subgraph 2'
            },
            'subgraphs1': {
              'value': './graph_dataset/original',
              'description': 'Path to subgraph 1'
            },
            'jaccard_coefficient': {
              'value': 0.3333,
              'description': 'Jaccard Coefficient between subgraph 1 and subgraph 4'
            },
            'num_nodes_combined': {
              'value': 4,
              'description': 'Number of nodes in the combined subgraphs'
            },
            'num_edges_subgraph1': {
              'value': 7,
              'description': 'Number of edges in subgraph 1'
            },
            'num_edges_subgraph2': {
              'value': 7,
              'description': 'Number of edges in subgraph 2'
            },
            'score': {
              'value': 0.3333,
              'description': 'Final score based on Jaccard coefficient'
            },
            'subgraphs3': {
              'value': './graph_dataset/delete_edges_within_subgraph',
              'description': 'Path to subgraph 3'
            },
            'num_edges_subgraph3': {
              'value': 6,
              'description': 'Number of edges in subgraph 3'
            },
            'subgraphs4': {
              'value': './graph_dataset/rerun',
              'description': 'Path to subgraph 4'
            },
            'num_edges_subgraph4': {
              'value': 6,
              'description': 'Number of edges in subgraph 4'
            }
          }
        },
        'details': {
          'privacy': {
            'privacy_score': {
              'value': '0.4527',
              'range': [0, 1]
            }
          },
          'safety-fingerprint': {
            'safety-fingerprint_score(cln mode)': {
              'value': '0.25',
              'range': '[0, 1]'
            },
            'safety-fingerprint_score(atk mode)': {
              'value': '0.25',
              'range': '[0, 1]'
            }
          },
          'safety-watermark': {
            'safety-watermark_score': {
              'value': '0.6',
              'range': [0, 1]
            }
          },
          'fairness': {
            'fairness_score': {
              'value': '10.6201'
            }
          },
          'robustness': {
            'white_box_robustness_score': {
              'value': '0.38',
              'range': '[0, 1]'
            },
            'black_box_robustness_score': {
              'value': '0.20',
              'range': '[0, 1]'
            }
          },
          'explainability': {
            'explainablilty_score_2': {
              'value': '0.6667'
            },
            'explainablilty_score_3': {
              'value': '0.3333'
            },
            'explainablilty_score_4': {
              'value': '0.3333'
            }
          }
        }
      },
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
    async verticalType(newDomain, oldDomain) {
      if (newDomain !== oldDomain) {
        await this.initData()
      }
    }
  },
  computed: {
    domainDatasets() {
      return domainDatasetsMap[this.verticalType] || []
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
    async loadDictionaryData() {
      try {
        this.normOptions = await dictionaryCache.loadDict('norm') || []
        const allStatus = await dictionaryCache.loadDict('status') || []
        this.statusStyleDict = await dictionaryCache.loadDict('status_style') || []
        const runningStatusCode = this.statusStyleDict.filter(item => ['warning', 'success'].includes(item.text)).map(item => item.code)
        this.statusDict = allStatus.filter(item => runningStatusCode.includes(item.code))
      } catch (error) {
        console.error('加载评测指标字典失败:', error)
        this.normOptions = [
          { code: 'privacy', text: '隐私性' },
          { code: 'safety-fingerprint', text: '安全性指纹' },
          { code: 'safety-watermark', text: '安全性水印' },
          { code: 'fairness', text: '公平性' },
          { code: 'robustness', text: '鲁棒性' },
          { code: 'explainability', text: '可解释性' }
        ]
        this.statusDict = ['pre_release_unrated', 'pre_release_pending', 'released']
        this.statusStyleDict = []
      }
    },
    async initData() {
      this.dataLoading = true
      this.filteredDataSource = []

      try {
        console.log(`正在加载${this.verticalType}领域的技术评测服务数据`)
        const response = await this.fetchServicesFromAPI()

        if (response && response.status === 'success') {
          console.log(`成功从API获取到${response.services.length}条服务数据`)
          this.dataSource = response.services
        } else {
          console.log('API获取失败，回退到静态数据')
          this.dataSource = await getServiceData(this.verticalType, true)
        }

        this.filteredDataSource = [...this.dataSource]
      } catch (error) {
        console.error('初始化数据失败:', error)
        try {
          this.dataSource = await getServiceData(this.verticalType, true)
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
        const runningStatus = this.statusDict.map(item => item.code)
        return await filterServices({ domain: this.verticalType, type: 'atomic,atomic_mcp', status: runningStatus.join(',') })
      } catch (error) {
        console.error('获取服务数据失败:', error)
        return undefined
      }
    },
    handleSearch() {
      this.filteredDataSource = [...this.dataSource]
      if (this.queryParam.name) {
        this.filteredDataSource = this.filteredDataSource.filter(item => {
          return item.name && item.name.includes(this.queryParam.name)
        })
      }
      if (this.queryParam.status && this.queryParam.status !== 'all') {
        this.filteredDataSource = this.filteredDataSource.filter(item => {
          return item.status === this.queryParam.status
        })
      }
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
      this.tested = false
      this.response = ''
      this.evaluationResults = []
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
        url,
        originFileObj: file
      }]
    },
    removeDataSetFile () {
      this.dataSetFiles = []
    },
    onTest () {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择测评服务！')
        return
      }
      if (this.selectedMetric.length === 0) {
        this.$message.warning('请选择评测指标！')
        return
      }
      this.testLoading = true
      const serviceName = this.selectedRows[0].name
      if (this.verticalType === 'aml') {
        const containsModelKeyword = serviceName.includes('模型')
        if (this.selectedRows.length === 1 && containsModelKeyword) {
          if (this.dataSetType === '1' && this.dataSetFiles.length === 0) {
            this.$message.warning('请上传数据集文件！')
            this.testLoading = false
            return
          }
          this.runAgentEvaluation(serviceName)
        } else {
          this.runMockEvaluation(serviceName)
        }
      } else {
        this.runMockEvaluation(serviceName)
      }
    },
    async runAgentEvaluation(serviceName) {
      const formData = new FormData()
      formData.append('model_name', serviceName)

      let metricsToSend = this.normOptions.map(item => item.code).join(',')
      if (this.selectedMetric.length > 0) {
        metricsToSend = this.selectedMetric.join(',')
      }
      formData.append('metrics', metricsToSend)

      if (this.dataSetType === '1') {
        const fileObj = this.dataSetFiles[0].originFileObj || this.dataSetFiles[0]
        const fileName = fileObj.name || ''
        const fileExt = fileName.split('.').pop().toLowerCase()

        if (fileExt !== 'zip') {
          this.$message.error('请上传ZIP格式的数据集文件')
          this.testLoading = false
          return
        }

        formData.append('data_file', fileObj)
      } else {
        const datasetUrl = 'https://lhcos-84055-1317429791.cos.ap-shanghai.myqcloud.com/ioeb/test_dataset.zip'
        formData.append('file_url', datasetUrl)
      }

      if (!this.showAgentPanel) {
        this.showAgentPanel = true
        this.agentSteps = []
        this.agentError = ''
        this.agentWarning = ''
        this.agentFinalResults = null
        this.agentIsRunning = true
      }

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

          // 处理Agent返回的格式: {evaluation_result: {model_name: ..., evaluation_results: ...}}
          let evaluationData = null
          if (results.evaluation_result && results.evaluation_result.evaluation_results) {
            evaluationData = results.evaluation_result.evaluation_results
          } else if (results.score || results.details) {
            // 兼容旧格式: {score: ..., details: ...}
            evaluationData = results.details || results.score || {}
          }

          if (evaluationData) {
            // 显示完整的Agent返回结果
            this.response = JSON.stringify(results, null, 4)
            this.$message.success(`${serviceName} 测试完成！`)

            // 尝试用新的方法处理结果显示
            try {
              this.processEvaluationResults(evaluationData, null)
              // 只有成功处理后才清空原始response
              if (this.evaluationResults.length > 0) {
                this.response = ''
              }
            } catch (e) {
              console.warn('新格式处理失败，保持原始显示:', e)
            }

            // 更新服务的norm字段
            if (this.selectedRows.length > 0) {
              const normToUpdate = []
              this.selectedMetric.forEach(metric => {
                let score = 'N/A'

                // 从evaluation_results中获取分数
                if (evaluationData[metric]) {
                  const metricData = evaluationData[metric]
                  if (metric === 'privacy' && metricData.privacy_score) {
                    score = metricData.privacy_score.value
                  } else if (metric === 'safety-fingerprint' && metricData['safety-fingerprint_score(cln mode)']) {
                    score = metricData['safety-fingerprint_score(cln mode)'].value
                  } else if (metric === 'safety-watermark' && metricData['safety-watermark_score']) {
                    score = metricData['safety-watermark_score'].value
                  } else if (metric === 'fairness' && metricData.fairness_score) {
                    score = metricData.fairness_score.value
                  } else if (metric === 'robustness') {
                    const whiteBox = metricData.white_box_robustness_score?.value || 0
                    const blackBox = metricData.black_box_robustness_score?.value || 0
                    score = ((parseFloat(whiteBox) + parseFloat(blackBox)) / 2).toFixed(4)
                  } else if (metric === 'explainability') {
                    if (metricData.explainablilty_score_2) {
                      score = metricData.explainablilty_score_2.value
                    } else if (metricData.explainablilty_score_3) {
                      score = metricData.explainablilty_score_3.value
                    } else if (metricData.explainablilty_score_4) {
                      score = metricData.explainablilty_score_4.value
                    }
                  }
                }

                normToUpdate.push({
                  key: metric,
                  score: score
                })
              })
              this.updateServiceNorm(this.selectedRows[0], normToUpdate)
            }
          } else {
            // 若没有找到评测结果，展示整个结果对象
            this.response = JSON.stringify(results, null, 4)
            this.$message.info('测试完成，但未找到标准评测结果')
          }

          this.testLoading = false
          this.agentIsRunning = false
          this.tested = true
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
            runMockEvaluation(serviceName) {
      setTimeout(() => {
        // 根据选择的指标过滤结果
        const filteredScore = {}
        const filteredDetails = {}
        if (this.selectedMetric.length > 0) {
          this.selectedMetric.forEach(metric => {
            if (this.mockResponse.score[metric]) {
              filteredScore[metric] = this.mockResponse.score[metric]
            }
            if (this.mockResponse.details[metric]) {
              filteredDetails[metric] = this.mockResponse.details[metric]
            }
          })
        } else {
          return
        }

        this.processEvaluationResults(filteredDetails, filteredScore)

        if (this.selectedRows.length > 0) {
          const normToUpdate = this.evaluationResults.map(result => ({
            key: result.code,
            score: result.score
          }))
          this.updateServiceNorm(this.selectedRows[0], normToUpdate)
        }

        this.testLoading = false
        this.tested = true
        this.$message.success(`${serviceName} 测试完成！`)
      }, 1000)
    },
    async updateServiceNorm(currentServiceData, normList) {
      const isPlatForm = store.getters.roles?.permissionList?.includes('admin') || false
      try {
        const currentService = { ...currentServiceData }
        if (!currentService.norm) {
          currentService.norm = []
        }
        normList.forEach(normItem => {
          const normData = {
            key: normItem.key,
            score: normItem.score,
            platformChecked: isPlatForm ? 1 : 0
          }
          let normExists = false
          for (let i = 0; i < currentService.norm.length; i++) {
            if (currentService.norm[i].key === normItem.key) {
              currentService.norm[i] = normData
              normExists = true
              break
            }
          }
          if (!normExists) {
            currentService.norm.push(normData)
          }
        })
        currentService.status = isPlatForm ? 'released' : 'pre_release_pending'
        await updateService(currentService.id, currentService)
      } catch (error) {
        console.error('更新服务评测指标失败:', error)
      }
    },
    selectAllMetrics() {
      this.selectedMetric = this.normOptions.map(item => item.code)
      setTimeout(() => {
        document.body.click()
      }, 100)
    },
    toggleExpanded(index) {
      this.$set(this.evaluationResults[index], 'expanded', !this.evaluationResults[index].expanded)
    },
        processEvaluationResults(detailsData, scoreData) {
      const results = []

      this.selectedMetric.forEach(metricCode => {
        const metricOption = this.normOptions.find(option => option.code === metricCode)
        if (!metricOption) return

        const metricDetails = detailsData[metricCode]
        const metricScore = scoreData?.[metricCode]
        if (!metricDetails && !metricScore) return

        let score = 'N/A'

        // 优先从details中获取分数
        if (metricDetails) {
          if (metricCode === 'privacy' && metricDetails.privacy_score) {
            score = metricDetails.privacy_score.value
          } else if (metricCode === 'safety-fingerprint') {
            if (metricDetails['safety-fingerprint_score(cln mode)']) {
              score = metricDetails['safety-fingerprint_score(cln mode)'].value
            } else if (metricDetails['safety-fingerprint_score(atk mode)']) {
              score = metricDetails['safety-fingerprint_score(atk mode)'].value
            }
          } else if (metricCode === 'safety-watermark' && metricDetails['safety-watermark_score']) {
            score = metricDetails['safety-watermark_score'].value
          } else if (metricCode === 'fairness' && metricDetails.fairness_score) {
            score = metricDetails.fairness_score.value
          } else if (metricCode === 'robustness') {
            const whiteBox = metricDetails.white_box_robustness_score?.value || 0
            const blackBox = metricDetails.black_box_robustness_score?.value || 0
            score = ((parseFloat(whiteBox) + parseFloat(blackBox)) / 2).toFixed(4)
          } else if (metricCode === 'explainability') {
            if (metricDetails.explainablilty_score_2) {
              score = metricDetails.explainablilty_score_2.value
            } else if (metricDetails.explainablilty_score_3) {
              score = metricDetails.explainablilty_score_3.value
            } else if (metricDetails.explainablilty_score_4) {
              score = metricDetails.explainablilty_score_4.value
            }
          }
        }

        // 如果details中没有找到分数，从score中获取
        if (score === 'N/A' && metricScore) {
          if (metricScore.score && metricScore.score.value !== undefined) {
            score = metricScore.score.value
          } else if (metricCode === 'privacy' && metricScore['Kappa ']) {
            score = metricScore['Kappa '].value
          } else if (metricCode === 'safety-fingerprint' && metricScore['fingerprint_score(cln)']) {
            score = metricScore['fingerprint_score(cln)'].value
          } else if (metricCode === 'safety-watermark' && metricScore.watermark_score) {
            score = metricScore.watermark_score.value
          } else if (metricCode === 'fairness' && metricScore.fairness_score !== undefined) {
            score = metricScore.fairness_score
          } else if (metricCode === 'robustness') {
            const whiteBoxData = metricScore['White box robustness score']
            const blackBoxData = whiteBoxData?.['Black box robustness score']
            if (whiteBoxData && blackBoxData) {
              score = ((whiteBoxData.value + blackBoxData.value) / 2).toFixed(4)
            }
          } else if (metricCode === 'explainability' && metricScore.score) {
            score = metricScore.score.value
          }
        }

        const metricInfo = this.metricDescriptions[metricCode] || {}

        // 优先使用score中的详细信息，如果没有则使用details
        const detailsToShow = metricScore || metricDetails

        results.push({
          code: metricCode,
          name: metricOption.text,
          score: score,
          range: metricInfo.range,
          description: metricInfo.description,
          details: JSON.stringify(detailsToShow, null, 2),
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
