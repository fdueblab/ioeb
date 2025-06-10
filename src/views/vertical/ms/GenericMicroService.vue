<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" size="small" title="提交类型">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="20">
            <a-col :span="24">
              <div style="display: flex">
                <a-form-item label="提交类型" required>
                  <a-radio-group v-model="submitType" @change="handleSubmitTypeChange">
                    <a-radio-button value="algorithm">算法模型</a-radio-button>
                    <a-radio-button value="microservice">微服务</a-radio-button>
                    <a-radio-button disabled>智能体</a-radio-button>
                  </a-radio-group>
                </a-form-item>
                <a-button
                  v-show="submitType === 'algorithm'"
                  type="link"
                  icon="file-text"
                  href="https://fdueblab.cn/docs/guide/code-template"
                  target="_blank"
                >
                  算法代码提交要求文档
                </a-button>
              </div>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>

    <!-- 算法模型上传部分 -->
    <a-card v-if="submitType === 'algorithm'" :bordered="false" size="small" title="程序上传">
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
              <a-form-item :wrapperCol="{ span: 12 }">
                <span slot="label">程序
                  <a-tooltip title="请确保程序遵循文档中的规约，否则将无法成功上传使用">
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-upload
                  accept=".py,.zip,.jar"
                  :file-list="programFiles"
                  :remove="removeProgramFile"
                  :customRequest="customProgramFilesChose"
                  :multiple="false">
                  <a-button icon="file-add"> 选择程序 </a-button>
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
                  icon="upload"
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

    <!-- 微服务直接预发布部分 -->
    <a-card v-if="submitType === 'microservice'" :bordered="false" size="small" title="微服务预发布">
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
              <a-form-item label="文件">
                <a-upload
                  accept=".zip,.7z,.jar"
                  :file-list="programFiles"
                  :remove="removeProgramFile"
                  :customRequest="customProgramFilesChose"
                  :multiple="false">
                  <a-button> <a-icon type="folder-add" /> 选择文件 </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="类型" required>
                <a-select v-model="form.serverType" placeholder="请选择服务类型" allow-clear>
                  <a-select-option value="restful">Restful Server</a-select-option>
                  <a-select-option value="mcp">MCP Server</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="名称" required>
                <a-input v-model="form.serviceName" placeholder="请输入微服务名称"/>
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
                  icon="play-circle"
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
      </div>
    </a-card>
    <a-card v-if="options" :bordered="false" style="margin-top: 10px;">
      <div slot="title" style="display: flex; justify-content: space-between; align-items: center;">
        <span>API依赖关系图</span>
        <div v-if="submitType === 'algorithm'">
          <a-button
            v-if="isDev && !isMultiSelectMode"
            type="primary"
            icon="select"
            @click="enableMultiSelect"
            style="margin-right: 8px;"
          >
            多选节点（未完成，目前只在开发者模式下显示）
          </a-button>
          <div v-else style="display: inline-flex; align-items: center; gap: 8px;">
            <a-tag color="blue">已选择 {{ selectedNodes.length }} 个节点</a-tag>
            <a-button
              type="primary"
              icon="api"
              @click="packageSelectedNodes"
              :disabled="selectedNodes.length === 0"
              :loading="packageLoading"
            >
              封装SSE服务
            </a-button>
            <a-button
              icon="close"
              @click="cancelMultiSelect"
            >
              取消
            </a-button>
          </div>
        </div>
      </div>
      <div class="g6-x">
        <v-chart
          style="height: 100%; width: 100%;"
          :options="options"
          autoresize
          @click="handleNodeClick"
        />
      </div>
      <div v-if="isMultiSelectMode && selectedNodes.length > 0" style="margin-top: 16px;">
        <a-divider>已选择的节点</a-divider>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <a-tag
            v-for="node in selectedNodes"
            :key="node.id"
            closable
            @close="removeSelectedNode(node.id)"
            color="processing"
          >
            {{ node.name }}
          </a-tag>
        </div>
      </div>
    </a-card>
    <a-card v-if="options && !isMultiSelectMode" :bordered="false" style="margin-top: 10px; height: 610px;">
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
                      icon="play-circle"
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
    <!-- SSE服务封装配置弹窗 -->
    <a-modal
      v-model="showPackageModal"
      title="SSE服务封装配置"
      width="800px"
      :confirmLoading="packageLoading"
      @ok="confirmPackage"
      @cancel="cancelPackage"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="服务名称" required>
          <a-input
            v-model="packageForm.serviceName"
            placeholder="请输入SSE服务名称"
          />
        </a-form-item>
        <a-form-item label="服务描述">
          <a-textarea
            v-model="packageForm.description"
            placeholder="请输入服务描述"
            :rows="3"
          />
        </a-form-item>
        <a-form-item label="封装的节点">
          <div style="max-height: 200px; overflow-y: auto; border: 1px solid #d9d9d9; padding: 8px; border-radius: 4px;">
            <a-list size="small" :data-source="selectedNodes">
              <a-list-item slot="renderItem" slot-scope="item">
                <a-list-item-meta>
                  <span slot="title">{{ item.name }}</span>
                  <span slot="description">{{ item.description || '无描述' }}</span>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </div>
        </a-form-item>
        <a-form-item label="SSE配置">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="推送间隔(ms)" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                <a-input-number
                  v-model="packageForm.pushInterval"
                  :min="100"
                  :max="10000"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="最大连接数" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
                <a-input-number
                  v-model="packageForm.maxConnections"
                  :min="1"
                  :max="1000"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-modal>
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
      // 开发模式标志
      isDev: this.$route.query.isDev === 'true',
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
      // 缓存的原始文件，用于服务封装
      cachedFile: null,
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
        serverType: undefined,
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
      agentFinalResults: null,
      submitType: 'algorithm',
      // 多选节点相关
      isMultiSelectMode: false,
      selectedNodes: [],
      packageLoading: false,
      showPackageModal: false,
      packageForm: {
        serviceName: '',
        description: '',
        pushInterval: 1000,
        maxConnections: 100
      }
    }
  },
  computed: {
    uploadServiceDisabled() {
      if (this.submitType === 'microservice') {
        return !this.form.serviceName || this.uploadFiles.length === 0
      }
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
        // 重置提交类型
        this.submitType = 'algorithm'
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

      // 缓存文件用于后续服务封装
      this.cachedFile = file

      // 根据文件类型和垂直领域处理上传
      if (fileExt === 'zip' || this.verticalType === 'aml') {
        // 真实代码分析逻辑
        this.realCodeAnalysisAgent(file)
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
    realCodeAnalysisAgent(file) {
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

    // 真实服务封装
    realServicePackageAgent(file) {
      return new Promise((resolve, reject) => {
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
        streamAgent('/api/agent/service_packaging', formData, {
          onStart: () => {
            this.uploadServiceLoading = true
            this.agentIsRunning = true
          },
          onStep: (data) => {
            this.agentSteps.push(data)
          },
          onError: (error) => {
            this.agentError = error
            this.uploadServiceLoading = false
            this.agentIsRunning = false
            this.$message.error('服务封装出错: ' + error)
            reject(error)
          },
          onWarning: (warning) => {
            this.agentWarning = warning
            this.uploadServiceLoading = false
            this.agentIsRunning = false
            this.$message.warning(warning)
            reject(warning)
          },
          onFinalResult: (results) => {
            this.agentFinalResults = results

            // 从最终结果中提取服务包数据
            if (results && results.service_package) {
              try {
                const servicePackage = results.service_package
                // 下载返回的压缩文件
                this.downloadServicePackage(servicePackage)
                this.$message.success('服务封装成功，正在下载服务包...')
                resolve(servicePackage)
              } catch (e) {
                console.error('处理服务包数据出错:', e)
                this.$message.error('服务包数据处理失败')
                reject(e)
              }
            } else {
              this.$message.error('未能获取服务包数据')
              reject(new Error('未能获取服务包数据'))
            }

            this.uploadServiceLoading = false
            this.agentIsRunning = false
          },
          onComplete: () => {
            this.uploadServiceLoading = false
            this.agentIsRunning = false
          },
          onDataProcessError: (e, line) => {
            console.error('解析数据失败:', e, line)
            this.agentError = '解析数据失败: ' + e.message
            this.uploadServiceLoading = false
            this.agentIsRunning = false
            reject(e)
          }
        })
      })
    },

    // 下载服务包
    downloadServicePackage(servicePackage) {
      try {
        // 将base64内容转换为二进制数据
        const binaryData = atob(servicePackage.content)
        const bytes = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i)
        }

        // 创建Blob对象
        const blob = new Blob([bytes], { type: 'application/zip' })

        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = servicePackage.filename || 'service_package.zip'

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 释放URL对象
        window.URL.revokeObjectURL(url)

        this.$message.success('服务包下载完成')
      } catch (error) {
        console.error('下载服务包失败:', error)
        this.$message.error('下载服务包失败')
      }
    },

    // 点击节点处理
    handleNodeClick(params) {
      // 检查是否有节点ID
      if (params.data && params.data.id) {
        const nodeId = params.data.id

        // 如果是多选模式
        if (this.isMultiSelectMode) {
          this.handleMultiSelectNode(params)
          return
        }

        // 单选模式的原有逻辑
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

    // 处理多选节点
    handleMultiSelectNode(params) {
      const nodeId = params.data.id
      const nodeName = params.data.name

      // 从原始数据中查找节点详细信息
      const nodeDetail = this.programJson.nodes.find(n => n.id === nodeId)
      if (!nodeDetail) {
        this.$message.warning('无法找到节点详细信息')
        return
      }

      // 检查节点是否已被选择
      const existingIndex = this.selectedNodes.findIndex(node => node.id === nodeId)

      if (existingIndex >= 0) {
        // 如果已选择，则取消选择
        this.selectedNodes.splice(existingIndex, 1)

        // 重置节点样式
        if (this.options && this.options.series && this.options.series[0]) {
          const nodeData = this.options.series[0].data.find(node => node.id === nodeId)
          if (nodeData) {
            nodeData.itemStyle = {
              color: '#5470c6'
            }
          }
        }

        this.$message.info(`已取消选择节点: ${nodeName}`)
      } else {
        // 如果未选择，则添加到选择列表
        this.selectedNodes.push({
          id: nodeId,
          name: nodeName,
          apiName: nodeDetail.label,
          input: nodeDetail.input,
          output: nodeDetail.output,
          environment: nodeDetail.environment,
          process: nodeDetail.process,
          apiType: nodeDetail.apiType,
          methodType: nodeDetail.methodType,
          description: `${nodeDetail.label} - ${nodeDetail.input} -> ${nodeDetail.output}`
        })

        // 高亮选中的节点
        if (this.options && this.options.series && this.options.series[0]) {
          const nodeData = this.options.series[0].data.find(node => node.id === nodeId)
          if (nodeData) {
            nodeData.itemStyle = {
              color: '#52c41a'
            }
          }
        }

        this.$message.success(`已选择节点: ${nodeName}`)
      }

      // 触发图表更新
      this.options = { ...this.options }
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
      if (!this.form.serviceName) {
        this.$message.error('请填写微服务名称！')
        return
      }
      if (this.submitType === 'algorithm' && !this.form.apiName) {
        this.$message.error('请填写必要的服务信息！')
        return
      }

      if (this.uploadFiles.length === 0) {
        this.$message.error('请选择程序文件！')
        return
      }

      this.uploadServiceLoading = true

      try {
        // 如果有缓存的文件，先进行服务封装
        if (this.cachedFile) {
          await this.realServicePackageAgent(this.cachedFile)
        }

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
          number: 0,
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
          this.$message.success('预发布成功！部署完成后可进行技术评测')
          this.uploadServiceLoading = false
          this.resetForm()
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
      this.cachedFile = null
      this.code = ''
      this.options = null
    },
    handleSubmitTypeChange() {
      this.resetForm()
      this.cancelMultiSelect()
    },
    enableMultiSelect() {
      this.isMultiSelectMode = true
      this.selectedNodes = []
      this.$message.info('已进入多选模式，点击节点进行选择')
    },
    cancelMultiSelect() {
      this.isMultiSelectMode = false
      this.selectedNodes = []
      // 重置图表节点样式
      this.resetNodeStyles()
    },
    resetNodeStyles() {
      if (this.options && this.options.series && this.options.series[0]) {
        const series = this.options.series[0]
        if (series.data) {
          series.data.forEach(node => {
            node.itemStyle = {
              color: '#5470c6'
            }
          })
          // 触发图表更新
          this.options = { ...this.options }
        }
      }
    },
    packageSelectedNodes() {
      if (this.selectedNodes.length === 0) {
        this.$message.warning('请先选择要封装的节点')
        return
      }

      // 重置表单
      this.packageForm = {
        serviceName: `sse_service_${Date.now()}`,
        description: `封装了${this.selectedNodes.length}个算法节点的SSE服务`,
        pushInterval: 1000,
        maxConnections: 100
      }

      this.showPackageModal = true
    },
    // 确认封装SSE服务
    async confirmPackage() {
      if (!this.packageForm.serviceName) {
        this.$message.error('请输入服务名称')
        return
      }

      this.packageLoading = true
      try {
        // 构建SSE服务配置
        const sseServiceConfig = {
          serviceName: this.packageForm.serviceName,
          description: this.packageForm.description,
          type: 'sse',
          domain: this.verticalType,
          industry: this.programInfo.industry,
          scenario: this.programInfo.scenario,
          technology: this.programInfo.technology,
          nodes: this.selectedNodes.map(node => ({
            id: node.id,
            name: node.name,
            apiName: node.apiName || node.name,
            input: node.input,
            output: node.output,
            environment: node.environment,
            process: node.process
          })),
          sseConfig: {
            pushInterval: this.packageForm.pushInterval,
            maxConnections: this.packageForm.maxConnections,
            endpoint: `/sse/${this.packageForm.serviceName}`
          },
          status: 'packaging'
        }

        // 调用API创建SSE服务
        const response = await createService(sseServiceConfig)

        if (response && response.status === 'success') {
          this.$message.success('SSE服务封装成功！正在部署中...')
          this.showPackageModal = false
          this.cancelMultiSelect()

          // 可以在这里添加跳转到服务管理页面的逻辑
          // this.$router.push('/service/management')
        } else {
          this.$message.error(response?.message || 'SSE服务封装失败')
        }
      } catch (error) {
        console.error('封装SSE服务失败:', error)
        this.$message.error('封装过程出现异常，请稍后重试')
      } finally {
        this.packageLoading = false
      }
    },
    cancelPackage() {
      this.showPackageModal = false
      this.packageForm = {
        serviceName: '',
        description: '',
        pushInterval: 1000,
        maxConnections: 100
      }
    },
    removeSelectedNode(nodeId) {
      this.selectedNodes = this.selectedNodes.filter(node => node.id !== nodeId)

      // 更新图表中对应节点的样式
      if (this.options && this.options.series && this.options.series[0]) {
        const series = this.options.series[0]
        if (series.data) {
          const nodeData = series.data.find(node => node.id === nodeId)
          if (nodeData) {
            nodeData.itemStyle = {
              color: '#5470c6'
            }
          }
          // 触发图表更新
          this.options = { ...this.options }
        }
      }

      if (this.selectedNodes.length === 0) {
        this.$message.info('已清空选择，可以重新选择节点')
      }
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
