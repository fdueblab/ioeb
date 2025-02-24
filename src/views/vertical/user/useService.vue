<template>
  <page-header-wrapper :title="false">
    <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
      <a-form>
        <a-form-item label="接口选择">
          <div style="width: 100%; display: flex;">
            <a-select v-model="selectedApi" @change="handleApiChange" style="width: 200px; margin-right: 20px">
              <a-select-option v-for="(item, index) in apiList" :key="index" :value="index">
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-input-search
              v-model="serviceUrl"
              style="width: 100%"
              placeholder="请选择接口"
              @search="onRequestSend"
            >
              <span slot="addonBefore" style="width: 60px; text-align: center; display: inline-block;">
                {{ method }}
              </span>
              <template #enterButton>
                <a-button type="primary" icon="api" :loading="sending" :disabled="!serviceUrl">调用</a-button>
              </template>
            </a-input-search>
          </div>
        </a-form-item>
        <a-form-item label="接口参数" v-if="parameterType !== 0">
          <div style="width: 50%">
            <a-table
              :columns="parameterColumns"
              :data-source="parameterData"
              :pagination="false"
              size="middle"
              bordered
            >
              <template slot="parameterVal" slot-scope="text, record">
                <a-upload
                  v-if="record.name === 'file'"
                  :file-list="fileList"
                  :remove="removeFile"
                  :customRequest="customFileChose"
                  :multiple="false">
                  <a-button> <a-icon type="upload" /> 选择文件 </a-button>
                </a-upload>
                <a-input v-else v-model="record.value" :placeholder="`请输入${record.name}`" />
              </template>
            </a-table>
          </div>
        </a-form-item>
        <a-form-item label="响应结果">
          <codemirror v-model="response" @ready="onCmReady" :style="codemirrorStyle" :options="cmOptions" />
        </a-form-item>
        <a-form-item
          :wrapperCol="{ span: 24 }"
          style="text-align: center"
        >
          <a-button type="primary" @click="handleGoBack">返回</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import request from '@/utils/request'
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
  name: 'UseService',
  components: {
    codemirror
  },
  props: {
    apiList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      form: this.$form.createForm(this),
      selectedApi: undefined, // 默认选择的接口
      serviceUrl: '', // 服务地址
      method: '未选择', // 请求方法
      parameterType: 0, // 参数类型
      fileList: [], // 文件列表
      uploadFiles: [], // 上传的文件对象列表
      parameterNames: [], // 参数名列表
      parameterData: [], // 参数表格数据
      sending: false,
      response: '',
      cmOptions: {
        mode: 'application/json',
        gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        tabSize: 4, // 制表符
        indentUnit: 2, // 缩进位数
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
        readOnly: true,
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
      parameterColumns: [
        {
          title: '参数名',
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: '参数值',
          dataIndex: 'value',
          key: 'value',
          scopedSlots: { customRender: 'parameterVal' }
        }
      ]
    }
  },
  methods: {
    // 处理接口选择变化
    handleApiChange(value) {
      this.selectedApi = value
      const api = this.apiList[value]
      this.serviceUrl = api.url
      this.method = api.method
      this.parameterType = api.parameterType
      this.parameterNames = api.parameterNames || []
      this.parameterData = this.parameterNames.map(name => ({ name, value: '' })) // 初始化参数表格
      this.response = ''
    },
    onCmReady(cm) {
      cm.on('inputRead', (cm, obj) => {
        if (obj.text && obj.text.length > 0) {
          const c = obj.text[0].charAt(obj.text[0].length - 1)
          if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
            cm.showHint({ completeSingle: false }) // 自动填充关闭了它
          }
        }
      })
    },
    handleGoBack() {
      this.$emit('onGoBack')
    },
    async customFileChose (options) {
      const { file } = options
      if (!file) {
        return false
      }
      this.uploadFiles = [file]
      const url = URL.createObjectURL(file)
      this.fileList = [{
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url // url 是展示在页面上的绝对链接
      }]
    },
    removeFile () {
      this.fileList = []
      this.uploadFiles = []
    },
    // 发送请求
    async onRequestSend() {
      const api = this.apiList[this.selectedApi]
      const isFakeApi = api && api.isFake
      // 假结果部分
      if (isFakeApi) {
        this.sending = true
        setTimeout(() => {
          this.response = JSON.stringify(api.response, null, 2)
          this.sending = false
        }, 1000)
        return
      }
      try {
        this.sending = true
        let requestData = null
        const headers = {}
        // 根据参数类型构建请求数据和请求头
        switch (this.parameterType) {
          case 1: // URL参数
            const queryParams = this.parameterData
              .filter(param => param.value) // 过滤掉空值
              .map(param => `${param.name}=${encodeURIComponent(param.value)}`)
              .join('&')
            this.serviceUrl = `${api.url}?${queryParams}`
            requestData = {}
            break
          case 2:
            // todo: 目前假定文件的参数名为file，后续需要进一步修改
            const formData = new FormData()
            this.parameterData.forEach(param => {
              if (param.name === 'file') {
                this.uploadFiles.forEach(file => {
                  formData.append('file', file)
                })
              } else if (param.value) {
                formData.append(param.name, param.value)
              }
            })
            requestData = formData
            headers['Content-Type'] = 'multipart/form-data'
            break
          case 3: // JSON 格式
            requestData = this.parameterData.reduce((acc, param) => {
              if (param.value) {
                acc[param.name] = param.value
              }
              return acc
            }, {})
            headers['Content-Type'] = 'application/json;charset=UTF-8'
            break
          // todo: path variable
          default: // 无参数
            requestData = {}
            break
        }
        // 发送请求
        const response = await request({
          url: this.serviceUrl,
          method: api.method,
          data: requestData,
          headers: headers
        })
        // 处理响应
        this.response = JSON.stringify(response, null, 2)
        this.$message.success('请求成功！')
      } catch (error) {
        this.response = JSON.stringify(error, null, 2)
        this.$message.error('请求失败，请检查网络或参数')
      } finally {
        this.sending = false
      }
    }
  }
}
</script>

<style scoped lang="less">
.CodeMirror-hints {
  z-index: 30000 !important;
}
</style>
