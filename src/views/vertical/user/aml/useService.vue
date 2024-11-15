<template>
  <page-header-wrapper :title="false">
    <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
      <a-form @submit="handleSubmit" :form="form">
        <a-form-item label="服务地址">
          <a-input-search v-model="serviceUrl" name="name" placeholder="请输入服务URL" enter-button="发送" @search="onSearch">
            <a-select slot="addonBefore" default-value="POST" style="width: 90px">
              <a-select-option value="GET">
                GET
              </a-select-option>
              <a-select-option value="POST">
                POST
              </a-select-option>
            </a-select>
          </a-input-search>
        </a-form-item>
        <a-form-item label="服务参数">
          <a-radio-group v-decorator="['target', { initialValue: 1 }]">
            <a-radio :value="1">无</a-radio>
            <a-radio :value="2">文件</a-radio>
            <a-radio :value="3">JSON</a-radio>
          </a-radio-group>
          <a-form-item v-show="form.getFieldValue('target') === 2">
            <a-upload
              name="file"
              :multiple="true"
              action=""
              :headers="headers"
              @change="handleSelcetFile"
            >
              <a-button> <a-icon type="upload" /> 选择文件... </a-button>
            </a-upload>
          </a-form-item>
          <a-form-item v-show="form.getFieldValue('target') === 3">
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
  data () {
    return {
      form: this.$form.createForm(this),
      serviceUrl: 'https://ms.kxyun.net/vertical-user/aml',
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
        fontSize: '18px',
        lineHeight: '150%',
        height: '250px',
        border: '1px solid #EBEEF5'
      }
    }
  },
  methods: {
    // handler
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
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
    handleSelcetFile(info) {
      console.log(info)
    },
    onSearch () {
      const obj = {
        code: 200,
        message: '使用成功！'
      }
      const newObj = JSON.stringify(obj, null, 4)
      this.response = newObj
    }
  }
}
</script>
<style scoped lang="less">
.CodeMirror-hints {
  z-index: 30000 !important;
}
</style>
