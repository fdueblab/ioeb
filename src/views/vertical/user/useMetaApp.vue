<template>
  <page-header-wrapper :title="false">
    <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
      <div style="display: flex; justify-content: space-between">
        <div style="width: 30%">
          <div class="app-preview" v-if="apiList[0]">
            <span class="app-title">{{ apiList[0].name }}</span>
            <div class="input-output-container">
              <!-- 输入区域 -->
              <div>
                <span class="section-title">{{ apiList[0].inputName }}</span>
                <a-upload
                  v-show="apiList[0].parameterType === 2"
                  :file-list="fileList"
                  :remove="removeFile"
                  :customRequest="customFileChose"
                  :multiple="false">
                  <a-button> <a-icon type="upload" /> 选择数据文件 </a-button>
                </a-upload>
                <codemirror v-show="apiList[0].parameterType === 3" v-model="code" @ready="onCmReady" :style="codemirrorStyle" :options="cmOptions"></codemirror>
                <a-button class="submit-button" type="primary" @click="onRequestSend">
                  {{ apiList[0].submitButtonText }}
                </a-button>
              </div>
              <!-- 输出区域 -->
              <div>
                <span class="section-title">{{ apiList[0].outputName }}</span>
                <a-textarea v-model="response" class="output-box" placeholder="" :rows="8" readOnly />
                <div class="image-box">
                  {{ apiList[0].outputName }}可视化区域
                </div>
              </div>
            </div>
          </div>
          <div class="image-box" v-else>
            数据缺失
          </div>
        </div>
        <div style="width: 65%">
          <div class="image-box">
            元应用工作流
          </div>
        </div>
      </div>
      <div style="width: 100%; text-align: center; margin-top: 20px">
        <a-button type="primary" @click="handleGoBack">返回</a-button>
      </div>
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
  name: 'UseMetaApp',
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
      fileList: [], // 文件列表
      uploadFiles: [], // 上传的文件对象列表
      sending: false,
      code: '',
      response: '',
      cmOptions: {
        mode: 'application/json',
        gutters: [],
        tabSize: 4, // 制表符
        indentUnit: 2, // 缩进位数
        lineNumbers: false,
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
        width: '100%',
        border: '1px solid #d9d9d9',
        fontSize: '14px',
        lineHeight: '120%'
      },
      // 工作流部分
      initFlow: {},
      initServices: [
        {
          id: '9',
          type: 'group',
          name: '跨境支付AI监测服务',
          open: true,
          children: []
        }
      ],
      loadingServices: false,
      loadingFlow: false
    }
  },
  methods: {
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
      const api = this.apiList[0]
      const isFakeApi = api && api.isFake
      // 假结果部分
      if (isFakeApi) {
        this.sending = true
        setTimeout(() => {
          this.response = JSON.stringify(api.response, null, 4)
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
          case 2: // 文件上传
            const formData = new FormData()
            this.uploadFiles.forEach(file => {
              formData.append('file', file)
            })
            requestData = formData
            headers['Content-Type'] = 'multipart/form-data'
            break
          case 3: // JSON 格式
            try {
              requestData = JSON.parse(this.code)
            } catch (error) {
              this.$message.error('JSON 格式错误，请检查输入')
              return
            }
            headers['Content-Type'] = 'application/json;charset=UTF-8'
            break
          default: // 其他情况（无参数或 path variable）
            requestData = {}
            break
        }
        // 发送请求
        const response = await request({
          url: api.url,
          method: api.method,
          data: requestData,
          headers: headers
        })
        // 处理响应
        this.response = JSON.stringify(response, null, 4)
        this.$message.success('请求成功！')
      } catch (error) {
        this.response = error
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
/deep/ .CodeMirror{
  height: 120px;
}

.app-preview {
  width: 100%;
  aspect-ratio: 9 / 19; /* 设置宽高比 */
  overflow-y: auto; /* 使高度限制生效 */
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 16px;
  font-weight: bold;
  background-color: #1890ff;
  color: #fff;
  text-align: center;
  display: block;
  line-height: 35px;
  border-radius: 6px 6px 0 0;
}

/* 输入输出容器 */
.input-output-container {
  margin: 16px;
}

/* 输入输出标题 */
.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 8px;
  line-height: 30px;
}

.submit-button {
  width: 50%;
  margin: 8px 0;
  left: 25%;
}

/* 输出框 */
.output-box {
  width: 100%;
  min-height: 100px;
  padding: 8px;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

/* 图片框 */
.image-box {
  width: 100%;
  min-height: 150px;
  margin-top: 16px;
  padding: 16px;
  background-color: #e8e8e8;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  font-style: italic;
}
</style>
