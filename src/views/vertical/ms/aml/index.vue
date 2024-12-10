<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" size="small" title="程序上传">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="20">
            <a-col :span="6">
              <a-form-item label="领域">
                <a-select placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">跨境支付AI监测服务</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="行业">
                <a-select placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">金融风控</a-select-option>
                  <a-select-option value="2">自贸监管</a-select-option>
                  <a-select-option value="3">跨境贸易</a-select-option>
                  <a-select-option value="4">跨境电商</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="场景">
                <a-select placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">反洗钱</a-select-option>
                  <a-select-option value="2">合规监测</a-select-option>
                  <a-select-option value="3">税务稽查</a-select-option>
                  <a-select-option value="4">业务统计</a-select-option>
                  <a-select-option value="5">信用评估</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="技术">
                <a-select placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">异常识别</a-select-option>
                  <a-select-option value="2">安全计算</a-select-option>
                  <a-select-option value="3">技术评测</a-select-option>
                  <a-select-option value="4">报告生成</a-select-option>
                  <a-select-option value="5">配套技术</a-select-option>
                  <a-select-option value="6">关联技术</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col :span="6">
              <a-form-item label="微服务名称">
                <a-input placeholder="请输入">
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="服务调用选项">
                <a-select placeholder="请选择" default-value="0">
                  <a-select-option value="0">RestFul接口</a-select-option>
                  <a-select-option value="1">Websocket连接</a-select-option>
                  <a-select-option value="2">其他</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col :span="6">
              <a-form-item label="程序">
                <a-upload
                  name="file"
                  :multiple="true"
                  action="">
                  <a-button> <a-icon type="upload" /> 选择程序 </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item
                :wrapperCol="{ span: 24 }"
                style="text-align: center">
                <a-button type="primary" @click="onUpload">开始上传</a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    <a-card v-show="options" :bordered="false" style="margin-top: 10px;">
      <div class="g6-x">
        <v-chart style="height: 100%; width: 100%;" :options="options" autoresize/>
      </div>
    </a-card>
    <a-card :bordered="false" style="margin-top: 10px; height: 530px;">
      <a-row :gutter="20">
        <a-col :span="12">
          <a-card :bodyStyle="{ padding: 0 }" style="height: 480px;">
            <codemirror v-model="code" :style="codemirrorStyle" :options="cmOptions"></codemirror>
          </a-card>
        </a-col>
        <a-col :span="12">
          <a-card style="height: 480px;">
            <a-form>
              <a-form-item label="输入参数">
                <a-input placeholder=""/>
              </a-form-item>
              <a-form-item label="输出参数">
                <a-input placeholder=""/>
              </a-form-item>
              <a-form-item label="条件参数">
                <a-input placeholder=""/>
              </a-form-item>
              <a-form-item label="效果参数">
                <a-input placeholder=""/>
              </a-form-item>
              <a-form-item label="接口/配置文件" label-width="100px">
                <a-upload
                  name="file"
                  :multiple="false"
                  action="">
                  <a-button> <a-icon type="upload" /> 选择文件 </a-button>
                </a-upload>
              </a-form-item>
              <a-form-item>
                <div style="text-align: center;"> <a-button type="primary" @click="uploadService">发布</a-button> </div>
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </page-header-wrapper>
</template>
<script>
import { Ellipsis, TagSelect, StandardFormRow, ArticleListContent } from '@/components'
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
      // create model
      graph: null,
      form: this.$form.createForm(this),
      response: '',
      code: '',
      cmOptions: {
        mode: 'application/json',
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
        lineHeight: '120%',
        height: '478px'
      }
    }
  },
  mounted () {},
  methods: {
    onUpload () {
      const json = {
        nodes: [
          { id: '9001', x: 0, y: 150, label: 'datasets', size: 50, color: '#6F9654', value: 'RestFul API' },
          { id: '9002', x: 150, y: 150, label: 'preprocess', size: 50, color: '#E76F51', value: 'RestFul API' },
          { id: '9003', x: 300, y: 150, label: 'train', size: 50, color: '#2A9D8F', value: 'RestFul API' },
          { id: '9004', x: 450, y: 50, label: 'predict', size: 50, color: '#F4A261', value: 'RestFul API' },
          { id: '9005', x: 450, y: 150, label: 'evaluate', size: 50, color: '#264653', value: 'RestFul API' },
          { id: '9006', x: 450, y: 250, label: 'visualize', size: 50, color: '#E9C46A', value: 'RestFul API' },
          { id: '9007', x: 300, y: 250, label: 'models', size: 50, color: '#A8DADC', value: 'RestFul API' }
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
                value: node.value
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
            return params.value
          }
        }
      }
    },
    onTest () {
      const obj = {
        code: 200,
        message: '测试通过！'
      }
      const newObj = JSON.stringify(obj, null, 4)
      this.response = newObj
    },
    uploadService () {
      this.$message.success('发布成功，请等待审核！')
      sessionStorage.setItem('upload_exception_service', '0')
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
  height: 478px;
}
</style>
