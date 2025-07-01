<template>
  <page-header-wrapper :title="false">
    <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
      <div style="display: flex; justify-content: space-between">
        <div style="width: 30%">
          <div class="app-preview" v-if="apiList[0]">
            <div class="app-header">
              <span class="app-title">{{ apiList[0].name }}</span>
              <span v-if="apiList[0].subtitle" class="app-subtitle">{{ apiList[0].subtitle }}</span>
            </div>
            <div class="input-output-container">
              <!-- 输入区域 -->
              <div class="section-container">
                <div v-show="apiList[0].parameterType !== 0" class="section-header">
                  <span class="section-title">{{ apiList[0].inputName }}</span>
                </div>
                <div v-show="apiList[0].parameterType === 2" class="file-upload-section">
                  <a-upload
                    :file-list="fileList"
                    :remove="removeFile"
                    :customRequest="customFileChose"
                    :multiple="false">
                    <a-button class="file-button"> <a-icon type="upload" /> 选择数据文件 </a-button>
                  </a-upload>
                </div>
                <a-textarea
                  v-show="apiList[0].parameterType === 1 || apiList[0].parameterType === 3"
                  v-model="code"
                  class="input-box"
                  placeholder="请输入内容"
                  :rows="4"
                />
                <div class="submit-section">
                  <a-button class="submit-button" type="primary" @click="onRequestSend" :loading="sending">
                    {{ apiList[0].submitButtonText }}
                  </a-button>
                </div>
              </div>
              <!-- 输出区域 -->
              <div class="section-container">
                <div class="section-header">
                  <span class="section-title">{{ apiList[0].outputName }}</span>
                </div>
                <div v-if="apiList[0].responseType === 2" class="file-download-section">
                  <a-button class="file-button" :disabled="!fileUrl" icon="download" @click="downloadFile">下载结果文件</a-button>
                </div>
                <div v-else class="output-box">
                  <codemirror v-model="response" @ready="onCmReady" :style="codemirrorStyle" :options="cmOptions" />
                </div>
                <div v-show="apiList[0].outputVisualization" class="visualization-box">
                  <div class="viz-placeholder">
                    <a-icon type="bar-chart" style="font-size: 24px; color: #409eff; margin-bottom: 8px;" />
                    <div>{{ apiList[0].outputName }}可视化区域</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="error-box" v-else>
            <a-icon type="exclamation-circle" style="font-size: 24px; margin-bottom: 8px; color: #ff4d4f;" />
            <div>数据缺失</div>
          </div>
        </div>
        <div style="width: 65%">
          <div style="display: flex;height: calc(100% - 47px);">
            <panel-enhanced
              ref="flowPanel"
              :initial-flow="flowData"
              :initial-services="services"
              :loading-services="loadingServices"
              :loading-flow="loadingFlow"
              :vertical-type="verticalType"
              :show-toolbar="false"
              :show-sidebar="false"
              style="flex: 1; position: relative; background-color: #f0f2f7"
            />
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
/* eslint-disable */
import PanelEnhanced from '@/components/ef/panel_enhanced'
import { getMetaAppNodes } from '@/mock/data/meta_apps_data'

export default {
  name: 'UseMetaApp',
  components: {
    codemirror, PanelEnhanced
  },
  props: {
    apiList: {
      type: Array,
      default: () => []
    },
    verticalType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      fileList: [], // 文件列表
      uploadFiles: [], // 上传的文件对象列表
      sending: false,
      code: '',
      response: '',
      fileUrl: '',
      cmOptions: {
        mode: 'application/json',
        gutters: [],
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
        readOnly: true,
        highlightSelectionMatches: {
          minChars: 2,
          trim: true,
          style: 'matchhighlight',
          showToken: false
        }
      },
      codemirrorStyle: {
        width: '100%',
        border: 'none',
        fontSize: '14px',
        lineHeight: '120%',
        borderRadius: '8px'
      },
      // 工作流初始化数据
      loadingFlow: false,
      loadingServices: false,
      flowData: {},
      services: []
    }
  },
  mounted() {
    this.loadFlowData()
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
        // perhaps todo: 适配字典表中的ioType？
        switch (this.apiList[0].parameterType) {
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
        if (this.apiList[0].responseType === 2) {
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
    // 加载工作流数据
    async loadFlowData() {
      this.loadingFlow = true
      // todo: 暂时根据元应用名称加载工作流，后续要存储对应数据并且后端获取
      let metaAppData;
      switch (this.apiList[0]?.name) {
        case '技术评测元应用':
          metaAppData = await getMetaAppNodes(this.verticalType, '课题四')
          this.$refs.flowPanel.updateInitialFlow(metaAppData.flowData)
          break
        case '无人机智能投递':
        case '乡村医疗AI辅助诊断元应用':
        case '智慧农业综合管理元应用':
        case 'eVTOL智能飞行控制元应用':
        case '跨境电商智能营销元应用':
        case '家庭智能助手元应用':
          metaAppData = await getMetaAppNodes(this.verticalType, '')
          this.$refs.flowPanel.updateInitialFlow(metaAppData.flowData)
          break
        default:
          metaAppData = await getMetaAppNodes(this.verticalType, '课题一')
          this.$refs.flowPanel.updateInitialFlow(metaAppData.flowData)
          break
      }
      this.loadingFlow = false
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
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f5ff 100%);
}

/* 应用预览区域 */
.app-preview {
  width: 100%;
  aspect-ratio: 9 / 19; /* 设置宽高比 */
  overflow-y: auto; /* 使高度限制生效 */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  position: relative;
}

.app-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(64, 169, 255, 0.05) 0%, rgba(22, 101, 192, 0.05) 100%);
  border-radius: 12px;
  pointer-events: none;
}

.app-header {
  background: linear-gradient(135deg, #40a9ff 0%, #1665c0 100%);
  border-radius: 10px 10px 0 0;
  padding: 16px;
  text-align: center;
  position: relative;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  display: block;
  line-height: 1.4;
  margin-bottom: 4px;
}

.app-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  line-height: 1.3;
  font-weight: 400;
}

/* 输入输出容器 */
.input-output-container {
  padding: 20px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

.section-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

/* 输入输出标题 */
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(135deg, #40a9ff, #1665c0);
  border-radius: 2px;
  margin-right: 8px;
}

.file-upload-section, .file-download-section {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.file-button {
  border-radius: 6px;
  border: 1px dashed #1890ff;
  color: #1890ff;
  background: rgba(24, 144, 255, 0.05);
  transition: all 0.3s ease;
}

.file-button:hover {
  background: rgba(24, 144, 255, 0.1);
  border-color: #40a9ff;
}

.submit-section {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.submit-button {
  min-width: 120px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #40a9ff 0%, #1665c0 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

.input-box {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  transition: all 0.3s ease;
  padding: 12px;
  font-size: 14px;
}

.input-box:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 输出框 */
.output-box {
  width: 100%;
  min-height: 120px;
  padding: 0;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f5ff 100%);
  border: 1px solid #e6f7ff;
  border-radius: 8px;
  overflow: hidden;
}

/* 可视化区域 */
.visualization-box {
  width: 100%;
  min-height: 120px;
  margin-top: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border: 2px dashed #91d5ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.viz-placeholder {
  text-align: center;
  color: #40a9ff;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.visualization-box:hover {
  border-color: #40a9ff;
  background: linear-gradient(135deg, #ffffff 0%, #e6f7ff 100%);
}

/* 错误状态 */
.error-box {
  width: 100%;
  aspect-ratio: 9 / 19;
  background: linear-gradient(135deg, #fff2f0 0%, #fff1f0 100%);
  border: 1px solid #ffccc7;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ff4d4f;
  font-size: 14px;
  font-weight: 500;
}
</style>
