<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" size="small" title="程序上传">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="20">
            <a-col :span="4">
              <a-form-item label="领域">
                <span style="margin-left: 5px; font-size: 14px">{{ domainTitle }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="行业">
                <a-select v-model="programInfo.industry" placeholder="请选择行业" allow-clear>
                  <a-select-option v-for="(item, index) in industryOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="场景">
                <a-select v-model="programInfo.scenario" placeholder="请选择场景" allow-clear>
                  <a-select-option v-for="(item, index) in scenarioOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="技术">
                <a-select v-model="programInfo.technology" placeholder="请选择技术" allow-clear>
                  <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col :span="4">
              <a-form-item label="程序">
                <a-upload
                  accept=".py,.zip,.jar"
                  :file-list="programFiles"
                  :remove="removeProgramFile"
                  :customRequest="customProgramFilesChose"
                  :multiple="false">
                  <a-button> <a-icon type="upload" /> 选择程序 </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="属性">
                <a-select v-model="programInfo.attribute" placeholder="请选择属性" allow-clear>
                  <a-select-option v-for="(item, index) in attributeOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="上传">
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
    <a-card v-if="options" :bordered="false" style="margin-top: 10px;">
      <div class="g6-x">
        <v-chart style="height: 100%; width: 100%;" :options="options" autoresize @click="handleNodeClick"/>
      </div>
    </a-card>
    <a-card :bordered="false" style="margin-top: 10px; height: 610px;">
      <a-row :gutter="20">
        <a-col :span="12">
          <a-card :bodyStyle="{ padding: 0 }" style="height: 560px;">
            <codemirror v-model="code" :style="codemirrorStyle" :options="cmOptions" />
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card style="height: 560px;">
            <a-form>
              <a-divider>接口配置</a-divider>
              <a-row :gutter="20">
                <a-col :span="12">
                  <a-form-item label="API名称" required>
                    <a-input v-model="form.apiName" placeholder="接口地址与方法名"/>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="API类型" required>
                    <a-select v-model="form.apiType" placeholder="请选择">
                      <a-select-option v-for="(item, index) in apiTypeOptions" :key="index" :value="item.code">
                        {{ item.text }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="请求方法" required>
                    <a-select v-model="form.methodType" placeholder="请选择">
                      <a-select-option v-for="(item, index) in methodTypeOptions" :key="index" :value="item.code">
                        {{ item.text }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="20">
                <a-col :span="6">
                  <a-form-item label="输入类型">
                    <a-select v-model="form.inputType" disabled >
                      <a-select-option v-for="(item, index) in ioTypeOptions" :key="index" :value="item.code">
                        {{ item.text }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="输入">
                    <a-input v-model="form.input" disabled/>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="输出类型">
                    <a-select v-model="form.outputType" disabled >
                      <a-select-option v-for="(item, index) in ioTypeOptions" :key="index" :value="item.code">
                        {{ item.text }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="输出">
                    <a-input v-model="form.output" disabled/>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="20">
                <a-col :span="24">
                  <a-form-item label="条件（environment）">
                    <a-input v-model="form.environment" placeholder="请输入Environment"/>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="20">
                <a-col :span="24">
                  <a-form-item label="处理（process）">
                    <a-input v-model="form.process" placeholder="请输入Process"/>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-divider>微服务配置</a-divider>
              <a-row :gutter="20">
                <a-col :span="12">
                  <a-form-item label="微服务名称" required>
                    <a-input v-model="form.serviceName" placeholder="请输入微服务名称"/>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="配置文件">
                    <a-upload
                      accept=".yml,.yaml,.json,.ini,.conf"
                      :file-list="configFiles"
                      :remove="removeConfigFile"
                      :customRequest="customConfigFileChose"
                      :multiple="false">
                      <a-button> <a-icon type="upload" /> 选择文件 </a-button>
                    </a-upload>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item tooltip="value*category">
                    <span slot="label">预发布
                      <a-tooltip title="预发布后服务及应用运维管理中将出现部署在容器中的该服务，可以管理其部署状态并对其进行验证与测评">
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
import { streamAgent } from '@/utils/request'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/lint.css'
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
import 'codemirror/mode/python/python.js'
import 'codemirror/theme/idea.css'
import { domainMockData, convertToGraphFormat } from './chartData'
// 必须要引用echarts，否则图表无法显示
// eslint-disable-next-line no-unused-vars
import * as echarts from 'echarts'
import vChart from 'vue-echarts'
import AgentExecutionPanel from '@/components/Agent/AgentExecutionPanel'
import dictionaryCache from '@/utils/dictionaryCache'
import { createService } from '@/api/service'

export default {
  name: 'GenericMicroService',
  components: {
    vChart,
    codemirror,
    AgentExecutionPanel
  },
  props: {
    // 垂直领域类型，从路由解析
    verticalType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      // 领域标题
      domainTitle: '',
      // 编辑器配置
      cmOptions: {
        mode: 'python',
        theme: 'idea',
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
        height: '560px'
      },
      // 上传文件
      programFiles: [],
      configFiles: [],
      uploadFiles: [],
      uploadConfigFiles: [],
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
      options: null,
      // 表单数据
      form: {
        apiName: undefined,
        apiType: undefined,
        methodType: undefined,
        inputType: undefined,
        input: undefined,
        outputType: undefined,
        output: undefined,
        environment: undefined,
        process: undefined,
        serviceName: undefined
      },
      // 程序信息
      programInfo: {
        attribute: undefined,
        industry: undefined,
        scenario: undefined,
        technology: undefined
      },
      uploadProgramLoading: false,
      uploadServiceLoading: false,
      // 字典选项
      attributeOptions: [],
      industryOptions: [],
      scenarioOptions: [],
      technologyOptions: [],
      apiTypeOptions: [],
      methodTypeOptions: [],
      ioTypeOptions: [],
      // 真实agent调用
      showAgentPanel: false,
      agentIsRunning: false,
      agentSteps: [],
      agentError: '',
      agentWarning: '',
      agentFinalResults: null
    }
  },
  computed: {
    uploadServiceDisabled() {
      return !this.form.serviceName || !this.form.apiName || this.uploadFiles.length === 0
    }
  },
  created() {
    // 初始化数据
    this.initData()
  },
  methods: {
    async initData() {
      try {
        // 加载字典缓存
        this.apiTypeOptions = await dictionaryCache.loadDict('api_type') || []
        this.methodTypeOptions = await dictionaryCache.loadDict('method_type') || []
        this.ioTypeOptions = await dictionaryCache.loadDict('io_type') || []
        this.attributeOptions = await dictionaryCache.loadDict('attribute') || []
        this.industryOptions = await dictionaryCache.loadDict(`${this.verticalType}_industry`) || []
        this.scenarioOptions = await dictionaryCache.loadDict(`${this.verticalType}_scenario`) || []
        this.technologyOptions = await dictionaryCache.loadDict(`${this.verticalType}_technology`) || []
        // 设置领域标题
        const domains = await dictionaryCache.loadDict('domain') || []
        this.domainTitle = domains.find(domain => domain.code === this.verticalType)?.text || '未知领域'
        // 清除代码框
        this.code = ''
      } catch (error) {
        console.error('加载字典数据失败:', error)
        this.$message.error('加载数据字典失败，请刷新重试')
        // 确保所有数组初始化，防止undefined错误
        this.apiTypeOptions = this.apiTypeOptions || []
        this.methodTypeOptions = this.methodTypeOptions || []
        this.ioTypeOptions = this.ioTypeOptions || []
        this.industryOptions = this.industryOptions || []
        this.scenarioOptions = this.scenarioOptions || []
        this.technologyOptions = this.technologyOptions || []
      }
    },
    // 程序文件选择
    async customProgramFilesChose(options) {
      const { file } = options
      if (!file) {
        return false
      }

      this.uploadFiles = [file]
      this.programFiles = [{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      }]
    },

    // 移除程序文件
    removeProgramFile() {
      this.uploadFiles = []
      this.programFiles = []
    },

    // 配置文件选择
    async customConfigFileChose(options) {
      const { file } = options
      if (!file) {
        return false
      }
      this.uploadConfigFiles = [file]
      this.configFiles = [{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      }]
    },

    // 移除配置文件
    removeConfigFile() {
      this.configFiles = []
      this.uploadConfigFiles = []
    },

    // 上传程序
    onUpload() {
      if (this.uploadFiles.length === 0) {
        this.$message.error('请先选择程序文件！')
        return
      }

      this.uploadProgramLoading = true
      // 获取文件和文件扩展名
      const file = this.uploadFiles[0]
      const fileExt = file.name.split('.').pop().toLowerCase()

      // 根据文件类型和垂直领域处理上传
      if (fileExt === 'zip') {
        // 真实代码分析逻辑
        this.realCodeAnalysis(file)
      } else {
        // 其他领域的模拟上传逻辑
        this.mockCodeAnalysis(file)
      }
    },

    // 根据领域类型返回模拟数据
    mockCodeAnalysis(file) {
      this.uploadProgramLoading = true
      // 获取当前领域的模拟数据
      const programData = domainMockData[this.verticalType] || { checkFile: null, nodes: [], edges: [] }

      // 延时模拟请求处理
      setTimeout(() => {
        // 检查文件合法性（如果当前领域有文件名检查需求）
        if (programData.checkFile && file.name !== programData.checkFile) {
          this.$message.error('上传的程序不符合规范，上传失败！')
          this.uploadProgramLoading = false
          return
        }

        // 设置分析结果
        this.programJson = {
          nodes: programData.nodes,
          edges: programData.edges
        }
        this.setChart()
        this.$message.success('解析成功，发现以下可用API及调用关系')
        this.uploadProgramLoading = false
      }, 1000)
    },

    // 设置图表
    setChart() {
      // 确保程序Json存在
      if (!this.programJson || !this.programJson.nodes || !this.programJson.edges) {
        console.error('程序Json数据不完整，无法渲染图表', this.programJson)
        return
      }
      // 在属性内使用this指代的不是组件，所以要在外面先取要用的数据
      const json = this.programJson
      const apiTypes = this.apiTypeOptions
      const methodTypes = this.methodTypeOptions
      const processedNodes = json.nodes.map(node => ({
        x: node.x,
        y: node.y,
        id: node.id,
        name: node.label,
        symbolSize: node.size,
        label: {
          show: true,
          position: 'inside'
        },
        value: node.id
      }))
      // 确保每条边具有必要的属性
      const processedEdges = json.edges.map(edge => ({
        source: edge.sourceID,
        target: edge.targetID,
        lineStyle: {
          curveness: 0.3
        },
        symbol: ['none', 'arrow'],
        symbolSize: [0, 10]
      }))
      // 设置echarts图表配置
      this.options = {
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'none',
            data: processedNodes,
            edges: processedEdges,
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
            const node = json.nodes.find(n => n.id === params.data.id)
            if (node) {
              let apiTypeText, methodTypeText
              try {
                apiTypeText = apiTypes.find(item => item.code === node.apiType)?.text || '未知'
                methodTypeText = methodTypes.find(item => item.code === node.methodType)?.text || '未知'
              } catch (e) {
                apiTypeText = '未知'
                methodTypeText = '未知'
              }

              return `
              <div style="font-size: 14px; line-height: 1.5; color: #333;">
                <strong>${node.label}</strong><br/>
                <span style="color: #888;">Input:</span> ${node.input}<br/>
                <span style="color: #888;">Output:</span> ${node.output}<br/>
                <span style="color: #888;">Environment:</span> ${node.environment || '无'}<br/>
                <span style="color: #888;">Process:</span> ${node.process || '无'}<br/>
                <span style="color: #888;">Interface Type:</span> ${apiTypeText}<br/>
                <span style="color: #888;">Method Type:</span> ${methodTypeText}
              </div>
              `
            }
            return params.value
          }
        }
      }
    },

    // 真实代码分析
    realCodeAnalysis(file) {
      // 重置Agent面板状态
      this.agentSteps = []
      this.agentError = ''
      this.agentWarning = ''
      this.agentFinalResults = null
      this.agentIsRunning = true
      this.showAgentPanel = true

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
          this.$message.error('解析出错: ' + error)
        },
        onWarning: (warning) => {
          this.agentWarning = warning
          this.uploadProgramLoading = false
          this.agentIsRunning = false
          this.$message.warning(warning)
        },
        onFinalResult: (results) => {
          this.agentFinalResults = results

          // 从最终结果中提取函数依赖图数据
          if (results && results.function) {
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
                this.programJson = convertToGraphFormat(funcData)

                if (this.programJson) {
                  this.setChart()
                  this.$message.success('解析成功，发现以下可用API及调用关系')
                } else {
                  this.$message.warning('函数依赖图数据处理失败')
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

    // 点击节点处理
    handleNodeClick(params) {
      // 检查是否有节点ID
      if (params.data && params.data.id) {
        const nodeId = params.data.id

        // 检查是否是真实数据（带有code和api属性）
        if (params.data.code) {
          // 真实数据处理
          this.code = params.data.code
          if (params.data.api) {
            this.form = {
              ...this.form,
              ...params.data.api
            }
          }
        } else {
          // 模拟数据处理 - 从节点数组中查找对应节点
          const node = this.programJson.nodes.find(n => n.id === nodeId)
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
        }
      }
    },
    // 更新左端代码
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
    // 上传微服务
    async uploadService() {
      if (!this.form.serviceName || !this.form.apiName) {
        this.$message.error('请填写必要的服务信息！')
        return
      }

      if (this.uploadFiles.length === 0) {
        this.$message.error('请选择程序文件！')
        return
      }

      this.uploadServiceLoading = true
      try {
        const data = {
          name: this.form.serviceName,
          attribute: this.programInfo.attribute,
          type: 'atomic',
          domain: this.verticalType,
          industry: this.programInfo.industry,
          scenario: this.programInfo.scenario,
          technology: this.programInfo.technology,
          netWork: 'bridge',
          port: '0.0.0.0:7777/TCP → 0.0.0.0:77777',
          volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
          status: 'deploying',
          number: '777',
          norm: [],
          source: {
            popoverTitle: '可信云技术服务溯源',
            companyName: '复旦大学课题组',
            companyAddress: '上海市杨浦区邯郸路220号',
            companyContact: '021-65642222',
            companyIntroduce: '课题六',
            msIntroduce: '预发布微服务',
            companyScore: 5,
            msScore: 5
          },
          apiList: [
            {
              name: this.form.apiName,
              isFake: true,
              url: 'https://myApiServer.com/add',
              method: this.form.methodType,
              parameterType: 1,
              parameters: [
                {
                  name: this.form.input,
                  type: 'string'
                }
              ],
              responseType: 1,
              response: {
                code: 200,
                message: '微服务正在部署！',
                data: {
                  deployingStatus: 'pending'
                }
              }
            }
          ]
        }
        const response = await createService(data)
        if (response && response.status === 'success') {
          this.$message.success('预发布成功！可进行技术评测')
          this.uploadServiceLoading = false
          this.resetForm()
          window.location.href = `#/evaluation/aml/technology`
        } else {
          this.$message.error(response?.message || '预发布失败')
        }
      } catch (error) {
        console.error('预发布微服务失败:', error)
        this.$message.error('预发布异常，请稍后重试！')
      } finally {
        this.uploadServiceLoading = false
      }
    },
    closeAgentPanel() {
      this.showAgentPanel = false
    },
    // 重置表单
    resetForm() {
      this.form = {
        apiName: undefined,
        apiType: undefined,
        methodType: undefined,
        inputType: undefined,
        input: undefined,
        outputType: undefined,
        output: undefined,
        environment: undefined,
        process: undefined,
        serviceName: undefined
      }
      this.programInfo = {
        attribute: undefined,
        industry: undefined,
        scenario: undefined,
        technology: undefined
      }
      this.programFiles = []
      this.configFiles = []
      this.uploadFiles = []
      this.uploadConfigFiles = []
      this.code = ''
      this.options = null
    }
  },
  watch: {
    // 监听垂直领域类型变化，重新加载数据
    verticalType: {
      handler(newVal) {
        if (newVal) {
          this.initData()
          this.resetForm()
        }
      },
      immediate: false
    },
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
  }
}
</script>

<style lang="less" scoped>
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
