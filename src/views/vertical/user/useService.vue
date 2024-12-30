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
              readOnly
              :loading="sending"
              :value="serviceUrl"
              style="width: 100%"
              placeholder="服务地址"
              enter-button="发送"
              @search="onSearch"
            >
              <span slot="addonBefore" style="width: 60px; text-align: center; display: inline-block;">
                {{ method }}
              </span>
            </a-input-search>
          </div>
        </a-form-item>
        <a-form-item label="服务参数">
          <a-radio-group v-model="parameterType">
            <a-radio :value="0">无</a-radio>
            <a-radio :value="1">path variable</a-radio>
            <a-radio :value="2">文件</a-radio>
            <a-radio :value="3">JSON</a-radio>
          </a-radio-group>
          <a-form-item v-show="parameterType === 2">
            <a-upload
              name="file"
              :multiple="true"
              action=""
              :headers="headers"
              @change="handleSelectFile"
            >
              <a-button> <a-icon type="upload" /> 选择文件... </a-button>
            </a-upload>
          </a-form-item>
          <a-form-item v-show="parameterType === 3">
            <codemirror v-model="code" @ready="onCmReady" :style="codemirrorStyle" :options="cmOptions"></codemirror>
          </a-form-item>
        </a-form-item>
        <a-form-item label="响应结果">
          <a-textarea v-model="response" placeholder="" :rows="8" />
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
      parameterType: 0, // 目标类型
      fileList: [], // 文件列表
      sending: false,
      code: '',
      response: '',
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
        lineHeight: '120%'
      }
    }
  },
  computed: {
    headers () {
      switch (this.form.getFieldValue('target')) {
        case 2:
          return {
            'Content-Type': 'multipart/form-data'
          }
        case 3:
          return {
            'Content-Type': 'application/json;charset=UTF-8'
          }
        default:
          return {}
      }
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
    handleSelectFile(info) {
      console.log(info)
    },
    onSearch () {
      const api = this.apiList[this.selectedApi]
      // 模拟异步请求
      this.sending = true
      setTimeout(() => {
        this.response = JSON.stringify(api.response, null, 4)
        this.sending = false
      }, 1000)
    }
  }
}
</script>
<style scoped lang="less">
.CodeMirror-hints {
  z-index: 30000 !important;
}
</style>
