<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" size="small" title="程序上传">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="20">
            <a-col :span="6">
              <a-form-item label="领域">
                <a-select placeholder="请选择" default-value="0">
                  <a-select-option value="0">跨境支付AI监测服务</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="行业">
                <a-select v-model="programInfo.industry" placeholder="请选择行业" allow-clear>
                  <a-select-option v-for="(item, index) in industryOptions" :key="index" :value="index">
                    {{ item }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="场景">
                <a-select v-model="programInfo.scenario" placeholder="请选择场景" allow-clear>
                  <a-select-option v-for="(item, index) in scenarioOptions" :key="index" :value="index">
                    {{ item }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="技术">
                <a-select v-model="programInfo.technology" placeholder="请选择技术" allow-clear>
                  <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="index">
                    {{ item }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col :span="6">
              <a-form-item label="程序">
                <a-upload
                  accept=".py,.zip"
                  :file-list="programFiles"
                  :remove="removeProgramFile"
                  :customRequest="customProgramFilesChose"
                  :multiple="false"
                >
                  <a-button> <a-icon type="upload" /> 选择程序 </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item :wrapperCol="{ span: 24 }" style="text-align: center">
                <a-button
                  type="primary"
                  @click="onUpload"
                  :disabled="programFiles.length === 0"
                  :loading="uploadProgramLoading"
                >
                  开始上传
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    <a-card v-show="options" :bordered="false" style="margin-top: 10px">
      <div class="g6-x">
        <v-chart style="height: 100%; width: 100%" :options="options" autoresize @click="handleNodeClick" />
      </div>
    </a-card>
    <a-card :bordered="false" style="margin-top: 10px; height: 610px">
      <a-row :gutter="20">
        <a-col :span="12">
          <a-card :bodyStyle="{ padding: 0 }" style="height: 560px">
            <codemirror v-model="code" :style="codemirrorStyle" :options="cmOptions" />
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card style="height: 560px">
            <a-form>
              <a-divider>接口配置</a-divider>
              <a-row :gutter="20">
                <a-col :span="12">
                  <a-form-item label="API名称" required>
                    <a-input v-model="form.apiName" placeholder="接口地址与方法名" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="API类型" required>
                    <a-select v-model="form.apiType" placeholder="请选择">
                      <a-select-option v-for="(item, index) in apiTypeOptions" :key="index" :value="index">
                        {{ item }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="请求方法" required>
                    <a-select v-model="form.methodType" placeholder="请选择">
                      <a-select-option v-for="(item, index) in methodTypeOptions" :key="index" :value="index">
                        {{ item }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="20">
                <a-col :span="6">
                  <a-form-item label="输入类型">
                    <a-select v-model="form.inputType" disabled>
                      <a-select-option v-for="(item, index) in ioTypeOptions" :key="index" :value="index">{{
                        item
                      }}</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="输入">
                    <a-input v-model="form.input" disabled />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="输出类型">
                    <a-select v-model="form.outputType" disabled>
                      <a-select-option v-for="(item, index) in ioTypeOptions" :key="index" :value="index">{{
                        item
                      }}</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="输出">
                    <a-input v-model="form.output" disabled />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="20">
                <a-col :span="24">
                  <a-form-item label="条件（environment）">
                    <a-input v-model="form.environment" placeholder="请输入Environment" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="20">
                <a-col :span="24">
                  <a-form-item label="处理（process）">
                    <a-input v-model="form.process" placeholder="请输入Process" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-divider>微服务配置</a-divider>
              <a-row :gutter="20">
                <a-col :span="12">
                  <a-form-item label="微服务名称" required>
                    <a-input v-model="form.serviceName" placeholder="请输入微服务名称" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="配置文件">
                    <a-upload
                      accept=".yml,.yaml,.json,.ini,.conf"
                      :file-list="configFiles"
                      :remove="removeConfigFile"
                      :customRequest="customConfigFileChose"
                      :multiple="false"
                    >
                      <a-button> <a-icon type="upload" /> 选择文件 </a-button>
                    </a-upload>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item tooltip="value*category">
                    <span slot="label"
                      >预发布
                      <a-tooltip
                        title="预发布后服务及应用运维管理中将出现部署在容器中的该服务，可以管理其部署状态并对其进行验证与测评"
                      >
                        <a-icon type="question-circle-o" />
                      </a-tooltip>
                    </span>
                    <a-button
                      type="primary"
                      @click="uploadService"
                      :disabled="uploadServiceDisabled"
                      :loading="uploadServiceLoading"
                    >
                      预发布
                    </a-button>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
    <agent-execution-panel
      v-if="showAgentPanel"
      :is-running="agentIsRunning"
      :steps="agentSteps"
      :error="agentError"
      :warning="agentWarning"
      :final-results="agentFinalResults"
      @close="closeAgentPanel"
    />
  </page-header-wrapper>
</template>

<script>
import { ArticleListContent, Ellipsis, StandardFormRow, TagSelect } from '@/components'
// eslint-disable-next-line no-unused-vars
import * as echarts from 'echarts'
import vChart from 'vue-echarts'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/json-lint'
import 'codemirror/addon/lint/javascript-lint'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/theme/base16-dark.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'
import 'codemirror/addon/fold/markdown-fold'
import 'codemirror/addon/fold/xml-fold'
import 'codemirror/addon/fold/indent-fold'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/javascript-hint'
import 'codemirror/addon/hint/xml-hint'
import 'codemirror/addon/hint/sql-hint'
import 'codemirror/addon/hint/anyword-hint'
import 'codemirror/addon/search/match-highlighter'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/vue/vue.js'
import 'codemirror/mode/python/python.js'
import {
  getApiTypeMap,
  getIndustryMap,
  getIOTypeMap,
  getMethodTypeMap,
  getScenarioMap,
  getTechnologyMap
} from '@/mock/data/map_data'
import AgentExecutionPanel from '@/components/Agent/AgentExecutionPanel'
import { streamAgent } from '@/utils/request'

export default {
  name: 'TableList',
  components: {
    vChart,
    codemirror,
    Ellipsis,
    TagSelect,
    StandardFormRow,
    ArticleListContent,
    AgentExecutionPanel
  },
  data() {
    return {
      options: null,
      industryOptions: getIndustryMap('aml'),
      scenarioOptions: getScenarioMap('aml'),
      technologyOptions: getTechnologyMap('aml'),
      programInfo: {
        industry: undefined,
        scenario: undefined,
        technology: undefined
      },
      form: {
        serviceName: '',
        input: '',
        output: '',
        inputType: 0,
        outputType: 0,
        environment: '',
        process: '',
        apiType: 0,
        apiName: '',
        methodType: 1
      },
      code: '',
      codeTemplate: `# 微服务名称: {{serviceName}}

@ns.route('/{{apiName}}')
class {{apiName}}({{input}}):
  @ns.doc(responses={
    200: 'Success',
    400: 'Validation Error',
    500: 'Internal Server Error'
  })


  # 条件: {{environment}}
  def {{methodType}}(self):
    try:
      logger.debug('开始处理{{apiName}}请求')

      # 处理: {{process}}
      """{{apiName}} source code"""

      logger.debug('{{apiName}}请求处理完成')
      return {{output}}

    except Exception:
      logger.exception('{{apiName}}处理过程出错，错误信息: ', Exception)
      return {'error': f'处理过程出错: {str(Exception)}'}, 500
`,
      programFiles: [],
      configFiles: [],
      uploadProgramLoading: false,
      uploadServiceLoading: false,
      uploadServiceDisabled: true,
      programJson: null,
      apiTypeOptions: getApiTypeMap(),
      methodTypeOptions: getMethodTypeMap(),
      ioTypeOptions: getIOTypeMap(),
      cmOptions: {
        mode: 'python', // 设置为 Python 模式
        // theme: 'base16-dark', // 黑暗模式主题
        gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        lineNumbers: true,
        line: true,
        lint: true,
        lineWrapping: true,
        autofocus: true,
        autoCloseBrackets: true,
        foldGutter: true, // 块槽
        hintOptions: { completeSingle: true },
        matchTags: { bothTags: true },
        matchBrackets: true,
        showCursorWhenSelecting: true,
        styleSelectedText: true,
        styleActiveLine: true,
        autoRefresh: true,
        highlightSelectionMatches: {
          minChars: 2,
          trim: true,
          style: 'matchhighlight',
          showToken: false
        }
      },
      codemirrorStyle: {
        fontSize: '14px',
        lineHeight: '120%'
      },
      showAgentPanel: false,
      agentIsRunning: false,
      agentSteps: [],
      agentError: '',
      agentWarning: '',
      agentFinalResults: null,
      currentFileType: null // 'py' 或 'zip'
    }
  },
  watch: {
    'form.apiName': function () {
      this.updateCode()
    },
    'form.methodType': function () {
      this.updateCode()
    },
    'form.environment': function () {
      this.updateCode()
    },
    'form.process': function () {
      this.updateCode()
    },
    'form.serviceName': function () {
      this.updateCode()
    }
  },
  mounted() {},
  methods: {
    onUpload() {
      const file = this.programFiles[0]
      if (!file) {
        this.$message.error('请先选择文件!')
        return
      }

      // 判断文件类型
      const fileName = file.name || ''
      const fileExt = fileName.split('.').pop().toLowerCase()
      this.currentFileType = fileExt

      if (fileExt === 'py') {
        // 使用现有的模拟模式
        this.mockCodeAnalysis(file)
      } else if (fileExt === 'zip') {
        // 使用真实后端API
        this.realCodeAnalysis(file)
      } else {
        this.$message.error('仅支持.py或.zip文件!')
      }
    },
    mockCodeAnalysis(file) {
      this.uploadProgramLoading = true
      setTimeout(() => {
        // 模拟上传文件合法性校验
        if (file.name === 'abnormal_recognition.py') {
          this.$message.success('解析成功，发现以下可用API及调用关系')
          this.programJson = {
            nodes: [
              {
                id: '9001',
                x: 0,
                y: 150,
                label: 'datasets',
                size: 50,
                input: 'rawData',
                output: 'processedData',
                environment: '',
                process: '',
                apiType: 0,
                methodType: 0,
                inputType: 2,
                outputType: 2
              },
              {
                id: '9002',
                x: 150,
                y: 150,
                label: 'preprocess',
                size: 50,
                input: 'processedData',
                output: 'cleanedData',
                environment: '',
                process: '',
                apiType: 0,
                methodType: 1,
                inputType: 2,
                outputType: 2
              },
              {
                id: '9003',
                x: 300,
                y: 150,
                label: 'train',
                size: 50,
                input: 'cleanedData',
                output: 'trainedModel',
                environment: '',
                process: '',
                apiType: 2,
                methodType: 1,
                inputType: 2,
                outputType: 2
              },
              {
                id: '9004',
                x: 450,
                y: 50,
                label: 'predict',
                size: 50,
                input: 'trainedModel',
                output: 'predictionResult',
                environment: '',
                process: '',
                apiType: 0,
                methodType: 0,
                inputType: 2,
                outputType: 1
              },
              {
                id: '9005',
                x: 450,
                y: 150,
                label: 'evaluate',
                size: 50,
                input: 'trainedModel',
                output: 'evaluationMetrics',
                environment: '',
                process: '',
                apiType: 0,
                methodType: 1,
                inputType: 2,
                outputType: 1
              },
              {
                id: '9006',
                x: 450,
                y: 250,
                label: 'visualize',
                size: 50,
                input: 'trainedModel',
                output: 'visualization',
                environment: '',
                process: '',
                apiType: 0,
                methodType: 1,
                inputType: 2,
                outputType: 3
              },
              {
                id: '9007',
                x: 300,
                y: 250,
                label: 'models',
                size: 50,
                input: 'trainedModel',
                output: 'modelMetadata',
                environment: '',
                process: '',
                apiType: 0,
                methodType: 1,
                inputType: 2,
                outputType: 1
              }
            ],
            edges: [
              { sourceID: '9001', targetID: '9002' }, // datasets → preprocess
              { sourceID: '9002', targetID: '9003' }, // preprocess → train
              { sourceID: '9003', targetID: '9004' }, // train → predict
              { sourceID: '9003', targetID: '9005' }, // train → evaluate
              { sourceID: '9003', targetID: '9006' }, // train → visualize
              { sourceID: '9003', targetID: '9007' }, // train → models
              { sourceID: '9007', targetID: '9004' }, // models → predict
              { sourceID: '9007', targetID: '9005' }, // models → evaluate
              { sourceID: '9007', targetID: '9006' } // models → visualize
            ]
          }
          this.setChart()
        } else {
          this.$message.error('上传的程序不符合规范，上传失败！')
        }
        this.uploadProgramLoading = false
      }, 1000)
    },
    realCodeAnalysis(file) {
      // 重置Agent面板状态
      this.agentSteps = []
      this.agentError = ''
      this.agentWarning = ''
      this.agentFinalResults = null
      this.agentIsRunning = true
      this.showAgentPanel = true

      // 设置上传状态
      this.uploadProgramLoading = true

      // 准备FormData
      const formData = new FormData()
      formData.append('file', file.originFileObj || file)

      // 使用封装的streamAgent方法
      streamAgent('/api/agent/code_analysis', formData, {
        onStart: () => {
          this.uploadProgramLoading = true
          this.agentIsRunning = true
        },
        onStep: (data) => {
          this.agentSteps.push(data)
        },
        onError: (error) => {
          this.agentError = error
          this.uploadProgramLoading = false
          this.agentIsRunning = false
        },
        onWarning: (warning) => {
          this.agentWarning = warning
          this.uploadProgramLoading = false
          this.agentIsRunning = false
        },
        onFinalResult: (results) => {
          this.agentFinalResults = results

          // 从最终结果中提取函数依赖图数据
          if (results.function) {
            try {
              // 检查返回的数据格式
              const funcData = results.function

              // 如果数据已经包含nodes和edges，直接使用
              if (funcData.nodes && funcData.edges) {
                this.programJson = funcData
                this.setChart()
                this.$message.success('解析成功，发现以下可用API及调用关系')
              } else {
                // 否则使用转换方法
                this.programJson = this.convertToGraphFormat(funcData)

                if (this.programJson) {
                  this.setChart()
                  this.$message.success('解析成功，发现以下可用API及调用关系')
                }
              }
            } catch (e) {
              console.error('处理函数依赖数据出错:', e)
              this.$message.warning('函数依赖图数据处理失败')
            }
          } else {
            this.$message.warning('未能获取函数依赖关系数据')
          }

          this.uploadProgramLoading = false
          this.agentIsRunning = false
        },
        onComplete: () => {
          this.uploadProgramLoading = false
          this.agentIsRunning = false
        },
        onDataProcessError: (e, line) => {
          console.error('解析数据失败:', e, line)
          this.agentError = '解析数据失败: ' + e.message
          this.uploadProgramLoading = false
          this.agentIsRunning = false
        }
      })
    },
    closeAgentPanel() {
      this.showAgentPanel = false
    },
    setChart() {
      const json = this.programJson
      this.options = {
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'none',
            data: json.nodes.map(function (node) {
              return {
                x: node.x,
                y: node.y,
                id: node.id,
                name: node.label,
                symbolSize: node.size,
                itemStyle: {
                  color: node.color
                },
                label: {
                  show: true,
                  position: 'inside'
                },
                value: node.id
              }
            }),
            edges: json.edges.map(function (edge) {
              return {
                source: edge.sourceID,
                target: edge.targetID,
                lineStyle: {
                  curveness: 0.3
                },
                symbol: ['none', 'arrow'],
                symbolSize: [0, 10]
              }
            }),
            emphasis: {
              focus: 'adjacency'
            },
            roam: true,
            lineStyle: {
              width: 0.5,
              curveness: 0.3,
              opacity: 0.7
            }
          }
        ],
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            const node = json.nodes.find((n) => n.id === params.data.id)
            if (node) {
              return `
        <div style="font-size: 14px; line-height: 1.5; color: #333;">
          <strong>${node.label}</strong><br/>
          <span style="color: #888;">Input:</span> ${node.input}<br/>
          <span style="color: #888;">Output:</span> ${node.output}<br/>
          <span style="color: #888;">Environment:</span> ${node.environment}<br/>
          <span style="color: #888;">Process:</span> ${node.process}<br/>
          <span style="color: #888;">Interface Type:</span> ${getApiTypeMap()[node.apiType]}
          <span style="color: #888;">Method Type:</span> ${getMethodTypeMap()[node.methodType]}
        </div>
      `
            }
            return params.value
          }
        }
      }
    },
    uploadService() {
      if (this.form.serviceName.length === 0) {
        this.$message.error('请输入微服务名称！')
        return
      }
      this.uploadServiceLoading = true
      setTimeout(() => {
        sessionStorage.setItem('upload_exception_service', '1')
        this.$message.success('预发布成功！可进行技术评测')
        this.uploadServiceLoading = false
        window.location.href = `#/evaluation/aml/technology`
      }, 1000)
    },
    async customProgramFilesChose(options) {
      const { file } = options
      if (!file) {
        return false
      }

      // 检查文件类型
      const fileName = file.name || ''
      const fileExt = fileName.split('.').pop().toLowerCase()

      // 只接受py或zip文件
      if (fileExt !== 'py' && fileExt !== 'zip') {
        this.$message.error('只支持上传.py或.zip文件')
        return false
      }

      const url = URL.createObjectURL(file)
      this.programFiles = [
        {
          uid: file?.uid,
          name: file.name,
          status: 'done',
          url,
          originFileObj: file // 保存原始文件对象以便后续上传
        }
      ]
    },
    removeProgramFile(file) {
      this.programFiles = this.programFiles.filter((item) => item.uid !== file.uid)
    },
    // 配置文件只支持单个文件
    async customConfigFileChose(options) {
      const { file } = options
      if (!file) {
        return false
      }
      const url = URL.createObjectURL(file)
      this.configFiles = [
        {
          uid: file?.uid,
          name: file.name,
          status: 'done',
          url // url 是展示在页面上的绝对链接
        }
      ]
    },
    removeConfigFile() {
      this.configFiles = []
    },
    updateCode() {
      const { serviceName, environment, process, input, output, apiName, methodType } = this.form
      const methods = ['get', 'post', 'put', 'delete']
      // 动态生成代码
      this.code = this.codeTemplate
        .replace(/\{\{apiName}}/g, apiName)
        .replace(/\{\{methodType}}/g, methods[methodType])
        .replace(/\{\{input}}/g, input)
        .replace(/\{\{output}}/g, output)
        .replace(/\{\{serviceName}}/g, serviceName)
        .replace(/\{\{environment}}/g, environment)
        .replace(/\{\{process}}/g, process)
    },
    handleNodeClick(params) {
      const node = this.programJson.nodes.find((n) => n.id === params.data.id)
      this.uploadServiceDisabled = false
      if (node) {
        this.form = {
          serviceName: '',
          input: node.input,
          output: node.output,
          environment: node.environment,
          process: node.process,
          apiType: node.apiType,
          apiName: node.label,
          methodType: node.methodType,
          inputType: node.inputType,
          outputType: node.outputType
        }
        this.updateCode()
      }
    },
    // 添加一个新方法来转换数据格式
    convertToGraphFormat(functionData) {
      // 检查数据结构，确保存在necessary.nodes和relations
      if (!functionData || !Array.isArray(functionData)) {
        console.error('函数数据格式不正确:', functionData)
        return null
      }

      try {
        // 构建节点
        const nodes = functionData.map((func, index) => {
          return {
            id: `${index + 1000}`,
            x: 100 + (index % 3) * 150, // 简单布局：每行3个节点
            y: 100 + Math.floor(index / 3) * 100,
            label: func.name || `func_${index}`,
            size: 50,
            input: func.params?.join(', ') || 'None',
            output: func.returns || 'None',
            environment: func.description || '',
            process: func.logic || '',
            apiType: 0,
            methodType: 1,
            inputType: 2,
            outputType: 2,
            color: '#1890ff'
          }
        })

        // 构建边
        const edges = []
        functionData.forEach((func, sourceIndex) => {
          // 如果函数有调用其他函数
          if (func.calls && Array.isArray(func.calls)) {
            func.calls.forEach((calledFuncName) => {
              // 查找被调用函数的索引
              const targetIndex = functionData.findIndex((f) => f.name === calledFuncName)
              if (targetIndex !== -1) {
                edges.push({
                  sourceID: `${sourceIndex + 1000}`,
                  targetID: `${targetIndex + 1000}`
                })
              }
            })
          }
        })

        return { nodes, edges }
      } catch (e) {
        console.error('转换函数数据出错:', e)
        return null
      }
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
.ant-form-item {
  margin-bottom: 0;
}
.list-articles-trigger {
  margin-left: 12px;
}
.g6-x {
  width: 100%;
  height: 300px;
}
/deep/ .CodeMirror {
  height: 558px;
}
</style>
