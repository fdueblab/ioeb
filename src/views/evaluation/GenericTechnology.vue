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
                    <a-input v-model="queryParam.id" placeholder=""/>
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
                <a-form-item label="评测指标">
                  <a-select v-model="selectedMetric">
                    <a-select-option value="all">全部</a-select-option>
                    <a-select-option v-for="(item, index) in normOptions" :key="index" :value="item.code">
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
              <a-textarea v-model="response" placeholder="" :rows="7" />
            </a-form-item>
            <a-form-item
              :wrapperCol="{ span: 24 }"
              style="text-align: center">
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
import { getServiceData } from '@/mock/data/services_data'
import AgentExecutionPanel from '@/components/Agent/AgentExecutionPanel'
import { streamAgent } from '@/utils/request'
import { filterServices } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'

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

export default {
  name: 'GenericTechnology',
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
      // create model
      form: this.$form.createForm(this),
      visible: false,
      confirmLoading: false,
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
      selectedMetric: 'all',
      normOptions: [],
      dataSetType: '0',
      dataSetFiles: [],
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
  created () {
    this.initData()
    this.loadNormOptions()
  },
  watch: {
    // 监听domain属性变化，当切换领域时重新加载数据
    verticalType(newDomain, oldDomain) {
      if (newDomain !== oldDomain) {
        this.initData()
        this.loadNormOptions()
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
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    // 加载评测指标从字典缓存
    async loadNormOptions() {
      try {
        this.normOptions = await dictionaryCache.loadDict('norm') || []
        if (!this.normOptions.length) {
          console.warn('未能从缓存字典加载评测指标，使用备用数据')
          // 如果字典加载失败，可以使用备用数据
          this.normOptions = [
            { code: 'privacy', text: '隐私性' },
            { code: 'safety-fingerprint', text: '安全性指纹' },
            { code: 'safety-watermark', text: '安全性水印' },
            { code: 'fairness', text: '公平性' },
            { code: 'robustness', text: '鲁棒性' },
            { code: 'explainability', text: '可解释性' }
          ]
        }
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
      }
    },
    async initData() {
      this.dataLoading = true
      this.filteredDataSource = [] // 清空现有数据，避免显示上一个页面的数据

      try {
        // 尝试从API获取数据
        console.log(`正在加载${this.verticalType}领域的技术评测服务数据`)
        const response = await this.fetchServicesFromAPI()

        if (response && response.status === 'success') {
          console.log(`成功从API获取到${response.services.length}条服务数据`)
          // 标准化数据
          this.dataSource = this.standardizeServiceData(response.services)
        } else {
          console.log('API获取失败，回退到静态数据')
          // 如果API调用失败，回退到静态数据
          this.dataSource = await getServiceData(this.verticalType, true)
        }

        this.filteredDataSource = [...this.dataSource]
      } catch (error) {
        console.error('初始化数据失败:', error)
        // 出错时回退到静态数据
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
        return await filterServices({ domain: this.verticalType, type: 'atomic' })
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
    handleAdd () {
      this.$emit('onGoAdd')
    },
    handleEdit (record) {
      console.log(record)
    },
    delConfirm() {
      this.$message.success('删除成功！')
    },
    handleCancel () {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
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
        this.$message.warning('请选择测评服务！')
        return
      }
      this.testLoading = true
      // 获取选中的服务名称
      const serviceName = this.selectedRows[0].name
      if (this.verticalType === 'aml') {
        // 新条件：只要服务名称包含"模型"就使用Agent评测
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
      } else {
        // 非aml领域使用通用模拟数据
        this.runMockEvaluation(serviceName)
      }
    },

    // 添加新方法：使用Agent进行评测
    async runAgentEvaluation(serviceName) {
      // 准备表单数据
      const formData = new FormData()
      formData.append('model_name', serviceName)

      // 根据选择的指标值进行处理，默认包含所有指标
      let metricsToSend = this.normOptions.map(item => item.code).join(',')
      // 如果选择了特定指标
      if (this.selectedMetric !== 'all') {
        metricsToSend = this.selectedMetric
      }
      formData.append('metrics', metricsToSend)

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
          // todo: 修改norm
        },
        onDataProcessError: (e) => {
          console.error('解析数据失败:', e)
          this.$message.error('解析评测数据失败')
          this.testLoading = false
          this.agentIsRunning = false
        }
      })
    },

    // 添加模拟评测方法
    runMockEvaluation(serviceName) {
      setTimeout(() => {
        const obj = {
          code: 200,
          message: '测试通过！',
          data: {
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
                'value': [0.1667, 0.2667],
                'description': '阳性模型对含有特殊触发器样本的验证准确性'
              },
              'negative_val': {
                'value': [0.2, 0.0, 0.5, 0.0333, 0.0333, 0.8333, 0.1, 0.0, 0.2, 0.9667],
                'description': '阴性模型对含有特殊触发器样本的验证准确性'
              }
            },
            'fairness': {
              'attribute': 'total_incoming_amount',
              'fairness_score': 10.6201,
              'description': '关于属性total_incoming_amount的公平性评估，数值越大代表越公平'
            },
            'robustness': {
              'Surrogate model predict number before attack': {
                'value': {
                  'on class 0': 422,
                  'on class 1': 1,
                  'on class 2': 31
                },
                'description':
                  'The result is the number of nodes for each class predicted by the surrogate model on the graph before the attack.'
              },
              'Surrogate model predict accuracy before attack': {
                'value': {
                  'on class 0': 1.0,
                  'on class 1': 1.0,
                  'on class 2': 1.0
                },
                'description':
                  "The result is the accuracy before the attack, with the surrogate model's own predictions used as the ground truth, and thus it is 100%."
              },
              'Surrogate model predict number after attack': {
                'value': {
                  'on class 0': 422,
                  'on class 1': 0,
                  'on class 2': 12
                },
                'description':
                  'The result is the number of nodes for each class predicted by the surrogate model on the graph after the attack.'
              },
              'Surrogate model predict accuracy after attack': {
                'value': {
                  'on class 0': 1.0,
                  'on class 1': 0.0,
                  'on class 2': 0.3870967741935484
                },
                'description':
                  'The result is the prediction accuracy of the surrogate model after the attack, with its own predictions used as the ground truth (i.e., the accuracy before the attack is 100%).'
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
          }
        }
        // 根据选择的指标过滤结果
        if (this.selectedMetric !== 'all') {
          const filteredData = {}
          filteredData[this.selectedMetric] = obj.data[this.selectedMetric]
          obj.data = filteredData
        }
        // todo: 修改norm

        this.response = JSON.stringify(obj, null, 4)
        this.testLoading = false
        this.$message.success(`${serviceName} 测试完成！`)
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
