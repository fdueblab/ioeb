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
        <p v-if="typeof selectedApi !== 'undefined' && apiList[selectedApi].des">
          <b>接口描述：</b> {{ apiList[selectedApi].des }}
        </p>
        <a-form-item label="接口参数" v-if="parameterType !== 0">
          <div style="width: 50%">
            <a-table
              :columns="parameterColumns"
              :data-source="parameterData"
              :pagination="false"
              size="middle"
              bordered
            >
              <template slot="parameterName" slot-scope="text, record" >
                <span>
                  {{ record.name }}
                  <a-tag v-if="record.type" color="blue" size="small">
                    {{ record.type }}
                  </a-tag>
                  <a-tooltip v-if="record.des">
                    <template #title>
                      {{ record.des }}
                    </template>
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
              </template>
              <template slot="parameterVal" slot-scope="text, record">
                <a-upload
                  v-if="record.type.includes('file')"
                  :file-list="fileList"
                  :remove="removeFile"
                  :customRequest="customFileChose"
                  :multiple="false">
                  <a-button> <a-icon type="upload" /> 选择文件 </a-button>
                </a-upload>
                <a-input
                  v-else
                  v-model="record.value"
                  :placeholder="getPlaceholder(record.type, record.name)"
                />
              </template>
            </a-table>
          </div>
        </a-form-item>
        <a-form-item label="响应结果">
          <!-- 返回文件的情况-->
          <div v-if="responseType === 2">
            <a-button :disabled="!fileUrl" icon="download" @click="downloadFile">下载结果文件</a-button>
          </div>
          <codemirror v-else v-model="response" @ready="onCmReady" :style="codemirrorStyle" :options="cmOptions" />
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
      // perhaps todo: 适配字典表中的ioType？
      parameterType: 0, // 参数类型
      responseType: 0, // 返回类型
      fileList: [], // 文件列表
      uploadFiles: [], // 上传的文件对象列表
      parameters: [], // 参数名列表
      parameterData: [], // 参数表格数据
      sending: false,
      response: '',
      fileUrl: '',
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
          key: 'name',
          scopedSlots: { customRender: 'parameterName' }
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
      this.responseType = api.responseType
      this.parameters = api.parameters || []
      this.parameterData = this.parameters.map(item => ({ name: item.name, value: '', des: item.des, type: item.type })) // 初始化参数表格
      this.response = ''
      this.fileUrl = ''
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
            const formData = new FormData()
            this.parameterData.forEach(param => {
              if (param.type.includes('file')) {
                this.uploadFiles.forEach(file => {
                  formData.append(param.name, file)
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
                // 根据参数类型进行转换
                if (param.type === 'int' || param.type === 'integer') {
                  // 转换为整数
                  acc[param.name] = parseInt(param.value, 10)
                } else if (param.type === 'float' || param.type === 'double' || param.type === 'number') {
                  // 转换为浮点数
                  acc[param.name] = parseFloat(param.value)
                } else if (param.type === 'boolean' || param.type === 'bool') {
                  // 转换为布尔值
                  acc[param.name] = param.value.toLowerCase() === 'true'
                } else if (param.type === 'array' || param.type === 'list' || param.type.includes('[]')) {
                  // 尝试解析为数组
                  try {
                    acc[param.name] = JSON.parse(param.value)
                  } catch (e) {
                    // 如果解析失败，提示用户
                    this.$message.warning(`参数 ${param.name} 无法解析为数组，请确保格式正确（如：[1,2,3]）`)
                    acc[param.name] = param.value
                  }
                } else if (param.type === 'object' || param.type === 'json') {
                  // 尝试解析为对象
                  try {
                    acc[param.name] = JSON.parse(param.value)
                  } catch (e) {
                    this.$message.warning(`参数 ${param.name} 无法解析为对象，请确保格式正确（如：{"key":"value"}）`)
                    acc[param.name] = param.value
                  }
                } else {
                  // 默认作为字符串处理
                  acc[param.name] = param.value
                }
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
        // url地址
        let url
        switch (process.env.NODE_ENV) {
          case 'development':
            url = `https://fdueblab.cn${this.serviceUrl}`
            break
          case 'ums':
            // todo: 银联使用需要获取本机ipv4地址和服务对应端口
            // eslint-disable-next-line no-fallthrough
          default:
            url = this.serviceUrl
        }
        // 文件类型
        if (this.responseType === 2) {
          const response = await request({
            url,
            method: api.method,
            data: requestData,
            headers: headers,
            responseType: 'blob'
          })
          this.fileUrl = window.URL.createObjectURL(response)
        } else {
          const response = await request({
            url,
            method: api.method,
            data: requestData,
            headers: headers
          })
          this.response = JSON.stringify(response, null, 2)
        }
        this.$message.success('请求成功！')
      } catch (error) {
        this.response = error
        this.$message.error('请求失败，请检查网络或参数')
      } finally {
        this.sending = false
      }
    },
    downloadFile () {
      const link = document.createElement('a')
      const fileName = this.apiList[this.selectedApi].responseFileName
      link.href = this.fileUrl
      if (fileName) {
        link.setAttribute('download', fileName)
      }
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    getPlaceholder(type, name) {
      if (!type) return `请输入${name}`

      switch (type.toLowerCase()) {
        case 'int':
        case 'integer':
          return `请输入整数，例如：42`
        case 'float':
        case 'double':
        case 'number':
          return `请输入数字，例如：3.14`
        case 'boolean':
        case 'bool':
          return `请输入true或false`
        case 'array':
        case 'list':
          return `请输入数组，例如：[1, 2, 3]`
        case 'object':
        case 'json':
          return `请输入JSON对象，例如：{"key": "value"}`
        default:
          // 处理类型后缀为[]的情况
          if (type.includes('[]')) {
            return `请输入${type.replace('[]', '')}数组，例如：[1, 2, 3]`
          }
          return `请输入${name}`
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
