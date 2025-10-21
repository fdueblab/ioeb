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
                <a-textarea
                  v-show="apiList[0].parameterType === 1 || apiList[0].parameterType === 3"
                  v-model="code"
                  class="input-box"
                  placeholder="您想让应用做什么？"
                  :rows="4"
                />
                <div v-show="apiList[0].parameterType === 2 || apiList[0].parameterType === 3" class="file-upload-section">
                  <a-upload
                    :file-list="fileList"
                    :remove="removeFile"
                    :customRequest="customFileChose"
                    :multiple="false">
                    <a-button class="file-button"> <a-icon type="upload" /> 选择数据文件 </a-button>
                  </a-upload>
                </div>
                <div class="submit-section">
                  <a-button
                    class="submit-button"
                    type="primary"
                    @click="onSubmitClick"
                    :loading="isStreaming && !isCompleted"
                    :disabled="!isCompleted && isSendDisabled"
                    :class="{ 'is-streaming': isStreaming && !isCompleted, 'is-completed': isCompleted }"
                    :style="{ '--progress': progressPercent + '%' }"
                    @mouseenter="isHoveringSubmit = true"
                    @mouseleave="isHoveringSubmit = false"
                  >
                    <template v-if="isCompleted && !isHoveringSubmit">
                      <a-icon type="check" style="margin-right: 6px;" />
                    </template>
                    {{ submitButtonLabel }}
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
                  <div class="markdown-box" v-html="responseHtml" />
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
          <div style="display: flex; justify-content: flex-end; align-items: center; height: 32px; margin-bottom: 8px;">
            <a-switch size="small" v-model="showLogs" />
            <span style="margin-left: 8px; color: #666">显示智能体的执行过程</span>
          </div>
          <div style="display: flex;height: calc(100% - 47px);">
            <div class="log-box" ref="logBox" v-show="showLogs">
              <div class="log-timeline">
                <div v-for="(item, idx) in sseItems" :key="idx" class="log-item" v-if="item.type === 'step' && item.thought">
                  <div class="thought-bubble">
                    <pre class="thought-text">{{ item.thought }}</pre>
                  </div>
                </div>
              </div>
            </div>
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
              v-show="!showLogs"
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
import { streamAgent } from '@/utils/request'
import PanelEnhanced from '@/components/ef/panel_enhanced'
import { batchGetServices } from '@/api/service'
import { buildImportedFlowData } from '@/components/ef/utils'

export default {
  name: 'UseMetaApp',
  components: {
    PanelEnhanced
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
      isStreaming: false, // 是否处于流式运行状态
      isCompleted: false, // 是否执行完成（最终结果出现）
      progressSteps: 0, // 已完成的步骤计数（用于按钮填充进度）
      isHoveringSubmit: false,
      sseLogs: '', // SSE 文本日志（保留）
      sseItems: [], // SSE 结构化日志
      code: '',
      response: '',
      responseHtml: '',
      responseVisualization: '',
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
      // 初始化数据
      loadingFlow: false,
      loadingServices: false,
      flowData: {},
      services: [],
      fullServices: [], // 保存完整服务信息供流式运行使用
      showLogs: false // 是否显示日志（除运行中自动显示外可手动开启）
    }
  },
  computed: {
    // 发送按钮禁用逻辑：当显示输入框且输入为空时禁用
    isSendDisabled () {
      const api = this.apiList && this.apiList[0]
      if (!api) return true
      const showInput = api.parameterType === 1 || api.parameterType === 3
      if (!showInput) return false
      return !this.code || this.code.trim().length === 0 || this.isStreaming
    },
    submitButtonLabel () {
      const api = this.apiList && this.apiList[0]
      if (!api) return '提交'
      if (this.isCompleted) return this.isHoveringSubmit ? '重新执行' : '执行完成'
      return this.isStreaming ? '智能体运行中' : api.submitButtonText
    },
    progressPercent () {
      const capped = Math.min(this.progressSteps, 8)
      // 每2步填充20%，8步封顶（80%），最终完成时整体变为100%
      const blocks = Math.floor(capped / 2)
      return Math.min(blocks * 20, 80)
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
    // 发送请求（统一流式逻辑入口；非支持类型返回203）
    async onRequestSend() {
      const api = this.apiList[0]
      const isFakeApi = api && api.isFake
      // 假结果部分
      if (isFakeApi) {
        this.isStreaming = true
        this.isCompleted = false
        setTimeout(() => {
          console.log(api.response)
          this.response = api.response
          const fakeFinalResults = this.response.final_results
          this.responseHtml = fakeFinalResults.text_result ? this.renderMarkdown(fakeFinalResults.text_result) : fakeFinalResults
          this.isStreaming = false
          this.isCompleted = true
        }, 1000)
        return
      }
      try {
        switch (this.apiList[0].parameterType) {
          // 文本输入
          case 1: {
            // 校验输入
            if (!this.code || this.code.trim().length === 0) {
              this.$message.error('请输入内容')
              return
            }
            // 需要用到完整服务信息
            if (!this.fullServices || this.fullServices.length === 0) {
              this.$message.error('服务列表为空，无法运行')
              return
            }
            // 构建表单数据
            const formData = new FormData()
            formData.append('message', this.code.trim())
            const appConfig = {
              info: this.apiList[0],
              services: this.fullServices
            }
            formData.append('app_config', JSON.stringify(appConfig))
            // UI：显示日志视图 + loading
            this.isStreaming = true
            this.isCompleted = false
            this.progressSteps = 0
            this.sseLogs = ''

            await streamAgent('/api/agent/meta_app/run', formData, {
              onStart: () => {
                this.showLogs = true
                this.appendSseEvent({ type: 'start', text: '开始执行' })
              },
              onStep: (event) => {
                const stepNo = event && event.step ? event.step : null
                const thought = event && event.thought ? event.thought : ''
                const action = event && event.action ? event.action : ''
                const result = event && event.action_result ? event.action_result : ''
                this.appendSseEvent({ type: 'step', stepNo, thought, action, result })
                if (this.progressSteps < 8) this.progressSteps += 1
              },
              onError: (error) => {
                this.appendSseEvent({ type: 'error', text: (error?.message || error) })
                this.$message.error('运行失败')
                this.isStreaming = false
              },
              onWarning: (warning) => {
                this.appendSseEvent({ type: 'warning', text: warning })
              },
              onFinalResult: (results) => {
                console.log(results)
                // 结果按 Markdown 渲染
                this.response = results && results.text_result ? results.text_result : ''
                this.responseHtml = this.renderMarkdown(this.response)
                this.appendSseEvent({ type: 'complete', text: '执行结束' })
                this.isStreaming = false
                this.isCompleted = true
              },
              onComplete: () => {
                console.log('智能体执行完成')
              },
              onDataProcessError: (error) => {
                this.appendSseEvent({ type: 'error', text: '数据处理错误: ' + (error?.message || error) })
                this.$message.error('数据处理错误')
                this.isStreaming = false
              }
            })
            return
          }
          // case 2: { // 文件输入
          //   // 校验输入
          //   if (!this.fileList || this.fileList.length === 0) {
          //     this.$message.error('请选择文件')
          //     return
          //   }
          // }
          // 其他参数类型暂不支持，返回203
          default: {
            this.isStreaming = true
            this.isCompleted = false
            setTimeout(() => {
              this.response = { code: 203, message: '计算资源不足，暂时无法处理文件输入！', success: false }
              this.responseHtml = this.response.data ? this.response.data.result : this.response.message
              this.isStreaming = false
              this.isCompleted = true
            }, 1000)
            return
          }
        }
      } catch (error) {
        this.response = error
        this.$message.error('请求失败，请检查网络或参数')
      }
    },
    appendSseStep (text) {
      this.sseLogs += text
      this.$nextTick(() => {
        const box = this.$refs.logBox
        if (box && box.scrollHeight != null) {
          box.scrollTop = box.scrollHeight
        }
      })
    },
    appendSseEvent (evt) {
      // 仅保留思考内容
      const cleaned = { ...evt }
      // 仅当为 step 且存在思考时记录
      if (cleaned.type === 'step' && cleaned.thought) {
        this.sseItems.push({ type: 'step', stepNo: cleaned.step || cleaned.stepNo, thought: cleaned.thought, time: new Date().toLocaleTimeString() })
        // 文本日志也只保留思考
        this.appendSseStep(cleaned.thought + '\n\n')
      }
      // start/complete/warn/error 仅作为时间线标识，不追加到可视文本
    },
    // 简易 Markdown 渲染（兼容常见语法），如需更强可引入 markdown-it
    renderMarkdown (text) {
      if (!text) return ''
      let html = text
      // 转义
      html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      // 代码块 ```
      html = html.replace(/```([\s\S]*?)```/g, (m, p1) => `<pre class="md-code"><code>${p1}</code></pre>`)
      // 标题 # ## ###
      html = html.replace(/^###\s+(.*)$/gm, '<h4>$1</h4>')
                 .replace(/^##\s+(.*)$/gm, '<h3>$1</h3>')
                 .replace(/^#\s+(.*)$/gm, '<h2>$1</h2>')
      // 粗体/斜体
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                 .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 行内代码
      html = html.replace(/`([^`]+)`/g, '<code class="md-inline">$1</code>')
      // 列表
      html = html.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
      html = html.replace(/(<li>.*<\/li>\s*)+/g, (m) => `<ul>${m}</ul>`)
      // 段落
      html = html.replace(/^(?!<h\d|<ul|<pre|<li)(.+)$/gm, '<p>$1</p>')
      return html
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
    onSubmitClick () {
      if (this.isCompleted) {
        this.handleReRun()
        return
      }
      this.onRequestSend()
    },
    handleReRun () {
      if (!this.isCompleted) return
      // 清空输入、输出、日志，并恢复状态
      this.code = ''
      this.response = ''
      this.responseHtml = ''
      this.sseLogs = ''
      this.sseItems = []
      this.isCompleted = false
      this.isStreaming = false
      this.showLogs = false
      this.progressSteps = 0
    },
    async loadFlowData() {
      this.loadingFlow = true
      try {
        // 从apiList[0]中提取元应用配置信息
        const metaAppConfig = this.apiList[0]
        if (!metaAppConfig) {
          throw new Error('元应用配置信息缺失')
        }
        // 检查服务列表是否存在
        if (!metaAppConfig.services || metaAppConfig.services.length === 0) {
          throw new Error('元应用服务列表加载失败')
        }
        // 构建节点数据
        await this.loadFlowFromServices(metaAppConfig)
      } catch (error) {
        this.$message.error(error.message)
        // 清空面板数据
        this.$refs.flowPanel.dataReloadClear()
      } finally {
        this.loadingFlow = false
      }
    },

    // 从服务列表构建节点数据
    async loadFlowFromServices(metaAppConfig) {
      try {
        // 提取服务ID列表
        const serviceIds = metaAppConfig.services || []
        if (serviceIds.length === 0) {
           throw new Error('服务ID列表为空')
         }
        // 通过API查询完整的服务信息
        const fullServices = await this.fetchServicesByIds(serviceIds)
        if (!fullServices || fullServices.length === 0) {
          throw new Error('获取服务信息失败')
        }
        // 保存完整服务信息用于运行
        this.fullServices = fullServices
        // 按照导入数据的格式构建数据
        const importData = {
          metaApp: {
            preName: metaAppConfig.name,
            preDes: metaAppConfig.des,
            preInputName: metaAppConfig.inputName,
            preOutputName: metaAppConfig.outputName,
            inputType: metaAppConfig.inputType,
            outputType: metaAppConfig.outputType
          }
        }
        // 构建完整的流程数据
        const flowData = buildImportedFlowData(importData, fullServices)
        // 更新面板数据
        this.$refs.flowPanel.updateInitialFlow(flowData)
        console.log('成功加载元应用:', metaAppConfig.name, '包含', fullServices.length, '个服务')
      } catch (error) {
        console.error('从服务列表构建节点数据失败:', error)
        throw error
      }
         },

    // 通过服务ID列表查询完整服务信息
    async fetchServicesByIds(serviceIds) {
      try {
        console.log('查询服务信息，ID列表:', serviceIds)
        // 调用批量获取服务API
        const response = await batchGetServices(serviceIds)
        if (response && response.status === 'success') {
          // 处理成功的响应
          const services = response.services || []
          const notFoundIds = response.notFound || []
          // 如果有未找到的服务，显示警告信息
          if (notFoundIds.length > 0) {
            console.warn('以下服务在数据库中不存在:', notFoundIds)
          }
          // 显示获取结果统计
          if (response.message) {
            console.info('批量获取服务结果:', response.message)
          }
          return services
        } else {
          throw new Error(response?.message || '查询服务信息失败')
        }
      } catch (error) {
         console.error('API调用失败:', error.message)
         throw new Error('API调用失败: ' + error.message)
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
  position: relative;
  overflow: hidden;
}
.submit-button.is-streaming::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: var(--progress, 0%);
  background: rgba(82, 220, 26, 0.95); /* 更明亮的绿色填充 */
  transition: width 300ms ease;
}

.submit-button.is-completed {
  background: #2dd36f; /* 更明亮的纯绿色 */
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

/* 覆盖禁用态按钮样式为渐变灰底 + 白字，统一当前风格 */
.submit-button[disabled],
.submit-button.ant-btn[disabled],
.submit-button.ant-btn-primary[disabled],
.submit-button[disabled]:hover,
.submit-button[disabled]:focus {
  background: linear-gradient(135deg, #cfd3dc 0%, #aeb4bf 100%) !important; /* 回退到灰色禁用态 */
  color: #ffffff !important;
  border: none !important;
  box-shadow: none !important;
  opacity: 1 !important;
  cursor: not-allowed;
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
  height: 300px;
  padding: 0;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f5ff 100%);
  border: 1px solid #e6f7ff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.markdown-box {
  padding: 16px;
  color: #1f1f1f;
  overflow: auto; /* 超出滚动 */
  flex: 1;
}
.markdown-box h1, .markdown-box h2, .markdown-box h3 {
  color: #0b6bd3;
  margin: 8px 0;
}
.markdown-box p { margin: 8px 0; }
.markdown-box ul { padding-left: 20px; }
.markdown-box .md-inline {
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0 4px;
}
.markdown-box .md-code {
  background: #0d1117;
  color: #c9d1d9;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
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

/* 日志容器 */
.log-box {
  flex: 1;
  width: 100%;
  min-height: 120px;
  background: linear-gradient(135deg, #f8faff 0%, #eef5ff 100%);
  color: #264362;
  border: 1px solid #d6e4ff;
  border-radius: 12px;
  overflow-y: auto;
  padding: 12px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.03);
}
.log-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.log-item {
  position: relative;
}
.thought-bubble {
  position: relative;
  border: 1px solid #e6f4ff;
  background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,248,255,0.9));
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.12);
}
.thought-bubble::after {
  content: '';
  position: absolute;
  left: 18px;
  bottom: -10px;
  width: 0; height: 0;
  border: 10px solid transparent;
  border-top-color: #e6f4ff;
}
.thought-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #264362;
  line-height: 1.7;
}
</style>
