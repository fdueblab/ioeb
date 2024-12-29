<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" size="small" title="程序上传">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="20">
            <a-col :span="6">
              <a-form-item label="领域">
                <a-select placeholder="请选择" default-value="0">
                  <a-select-option value="0">低空飞行AI监控服务</a-select-option>
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
                  accept=".py,.jar"
                  :file-list="programFiles"
                  :remove="removeProgramFile"
                  :customRequest="customProgramFilesChose"
                  :multiple="true">
                  <a-button> <a-icon type="upload" /> 选择程序 </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                :wrapperCol="{ span: 24 }"
                style="text-align: center">
                <a-button type="primary" @click="onUpload" :loading="uploadProgramLoading">
                  开始上传
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    <a-card v-show="options" :bordered="false" style="margin-top: 10px;">
      <div class="g6-x">
        <v-chart style="height: 100%; width: 100%;" :options="options" autoresize @click="handleNodeClick"/>
      </div>
    </a-card>
    <a-card :bordered="false" style="margin-top: 10px; height: 490px;">
      <a-row :gutter="20">
        <a-col :span="12">
          <a-card :bodyStyle="{ padding: 0 }" style="height: 440px;">
            <codemirror v-model="code" :style="codemirrorStyle" :options="cmOptions" />
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card style="height: 440px;">
            <a-form>
              <a-row :gutter="20">
                <a-col :span="12">
                  <a-form-item label="输入参数">
                    <a-input v-model="form.input" placeholder="请输入Input"/>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="输出参数">
                    <a-input v-model="form.output" placeholder="请输入Output"/>
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
              <a-row :gutter="20">
                <a-col :span="12">
                  <a-form-item label="API类型">
                    <a-select v-model="form.apiType" placeholder="请选择">
                      <a-select-option v-for="(item, index) in apiTypeOptions" :key="index" :value="index">
                        {{ item }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="微服务名称">
                    <a-input v-model="form.serviceName" placeholder="请输入微服务名称"/>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="20">
                <a-col :span="12">
                  <a-form-item label="接口配置文件">
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
                <a-col :span="12">
                  <a-form-item tooltip="value*category">
                    <span slot="label">预发布
                      <a-tooltip title="预发布后服务及应用运维管理中将出现未分配容器的该服务，可以将其部署在容器中，部署后可以对其进行验证与测评">
                        <a-icon type="question-circle-o" />
                      </a-tooltip>
                    </span>
                    <a-button type="primary" @click="uploadService" :disabled="uploadServiceDisabled" :loading="uploadServiceLoading">
                      预发布
                    </a-button>
                  </a-form-item>
                </a-col>
              </a-row>
              <!--              <a-row :gutter="20" style="margin-top: 30px;">-->
              <!--                <a-form-item>-->
              <!--                  <div style="text-align: center;">-->
              <!--                    <a-button type="primary" @click="uploadService" :disabled="programFiles.length === 0" :loading="uploadServiceLoading">-->
              <!--                      预发布-->
              <!--                    </a-button>-->
              <!--                  </div>-->
              <!--                </a-form-item>-->
              <!--              </a-row>-->
            </a-form>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
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
import { getApiTypeMap, getIndustryMap, getScenarioMap, getTechnologyMap } from '@/mock/data/map_data'

export default {
  name: 'TableList',
  components: {
    vChart,
    codemirror,
    Ellipsis,
    TagSelect,
    StandardFormRow,
    ArticleListContent
  },
  data () {
    return {
      options: null,
      industryOptions: getIndustryMap('aircraft'),
      scenarioOptions: getScenarioMap('aircraft'),
      technologyOptions: getTechnologyMap('aircraft'),
      programInfo: {
        industry: undefined,
        scenario: undefined,
        technology: undefined
      },
      form: {
        serviceName: '',
        name: '',
        input: '',
        output: '',
        environment: '',
        process: '',
        apiType: 0
      },
      code: '',
      codeTemplate: `# 微服务名称: {{serviceName}}
# 条件: {{environment}}
def {{name}}({{input}}):
  try:
    # 处理: {{process}}
    return {{output}}
  except Exception:
    print('{{name}}执行出错，错误信息: ', Exception)
    exit(1);
`,
      programFiles: [],
      configFiles: [],
      uploadProgramLoading: false,
      uploadServiceLoading: false,
      uploadServiceDisabled: true,
      programJson: null,
      apiTypeOptions: getApiTypeMap(),
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
      }
    }
  },
  watch: {
    'form.input': function () {
      this.updateCode()
    },
    'form.output': function () {
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
  mounted () {},
  methods: {
    onUpload () {
      this.uploadProgramLoading = true
      setTimeout(() => {
        // const file = this.programFiles
        this.$message.success('解析成功，发现以下可用API及调用关系')
        this.programJson = {
          nodes: [
            { id: '1000', x: 200, y: 50, label: 'getTargetFeature', size: 50, color: '#F6BD16', input: 'imageData', output: 'targetFeature', environment: 'environment1', process: 'process1', apiType: 2 },
            { id: '1001', x: 50, y: 200, label: 'getTargetLocation', size: 50, color: '#5B8FF9', input: 'gpsCoordinates', output: 'targetLocation', environment: 'environment2', process: 'process2', apiType: 2 },
            { id: '1002', x: 200, y: 150, label: 'getTargetInfo', size: 50, color: '#5AD8A6', input: 'targetFeature, targetLocation', output: 'targetInfo', environment: 'environment3', process: 'process3', apiType: 0 },
            { id: '1003', x: 350, y: 200, label: 'getTargetType', size: 50, color: '#5D7092', input: 'targetInfo', output: 'targetType', environment: 'environment4', process: 'process4', apiType: 0 }
          ],
          edges: [
            { sourceID: '1000', targetID: '1002' },
            { sourceID: '1001', targetID: '1002' },
            { sourceID: '1002', targetID: '1003' }
          ]
        }
        this.setChart()
        this.uploadProgramLoading = false
      }, 1000)
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
            const node = json.nodes.find(n => n.id === params.data.id)
            if (node) {
              return `
        <div style="font-size: 14px; line-height: 1.5; color: #333;">
          <strong>${node.label}</strong><br/>
          <span style="color: #888;">Input:</span> ${node.input}<br/>
          <span style="color: #888;">Output:</span> ${node.output}<br/>
          <span style="color: #888;">Environment:</span> ${node.environment}<br/>
          <span style="color: #888;">Process:</span> ${node.process}<br/>
          <span style="color: #888;">Interface Type:</span> ${getApiTypeMap()[node.apiType]}
        </div>
      `
            }
            return params.value
          }
        }
      }
    },
    uploadService () {
      if (this.form.serviceName.length === 0) {
        this.$message.error('请输入微服务名称！')
        return
      }
      this.uploadServiceLoading = true
      setTimeout(() => {
        this.$message.success('预发布成功！可以进行部署与测试')
        this.uploadServiceLoading = false
      }, 1000)
    },
    async customProgramFilesChose (options) {
      const { file } = options
      if (!file) {
        return false
      }
      const url = URL.createObjectURL(file)
      this.programFiles.push({
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url // url 是展示在页面上的绝对链接
      })
    },
    removeProgramFile (file) {
      this.programFiles = this.programFiles.filter(item => item.uid !== file.uid)
    },
    // 配置文件只支持单个文件
    async customConfigFileChose (options) {
      const { file } = options
      if (!file) {
        return false
      }
      const url = URL.createObjectURL(file)
      this.configFiles = {
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url // url 是展示在页面上的绝对链接
      }
    },
    removeConfigFile () {
      this.configFiles = []
    },
    updateCode() {
      const { serviceName, environment, process, input, output, name } = this.form
      // 动态生成代码
      this.code = this.codeTemplate
        .replace('{{name}}', name)
        .replace('{{input}}', input)
        .replace('{{output}}', output)
        .replace('{{serviceName}}', serviceName)
        .replace('{{environment}}', environment)
        .replace('{{process}}', process)
    },
    handleNodeClick(params) {
      const node = this.programJson.nodes.find(n => n.id === params.data.id)
      this.uploadServiceDisabled = false
      if (node) {
        this.form = {
          serviceName: '',
          name: node.label,
          input: node.input,
          output: node.output,
          environment: node.environment,
          process: node.process,
          apiType: node.apiType
        }
        this.updateCode()
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
.ant-form-item{
  margin-bottom: 0;
}
.list-articles-trigger {
  margin-left: 12px;
}
.g6-x {
  width: 100%;
  height: 300px;
}
/deep/ .CodeMirror{
  height: 438px;
}
</style>
