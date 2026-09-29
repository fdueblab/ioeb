<template>
  <div class="clinical-workflow">
    <h1>MCP 服务封装</h1>
    <p class="intro">将临床算法源码交给智能体分析并封装为 MCP 服务包。请先核对适用人群、单位、输入输出和资料来源。</p>
    <a-alert type="warning" show-icon message="请勿上传包含患者身份信息的文件。生成的服务包需检查和验证后再运行。" class="notice" />
    <a-row :gutter="16">
      <a-col :xs="24" :lg="15">
        <a-card title="算法来源" :bordered="false">
          <a-radio-group v-model="source" class="source-choice">
            <a-radio-button value="generated">浏览器中生成的模型</a-radio-button>
            <a-radio-button value="upload">上传 Python 源码或 ZIP</a-radio-button>
          </a-radio-group>
          <a-form layout="vertical">
            <a-form-item v-if="source === 'generated'" label="选择临床算法模型">
              <a-select v-model="selectedModelId" placeholder="请选择模型" @change="onModelChange">
                <a-select-option v-for="model in models" :key="model.id" :value="model.id">{{ model.name }}</a-select-option>
              </a-select>
              <div v-if="!models.length" class="hint">当前浏览器还没有模型。请先使用“算法模型想定式开发”生成源码。</div>
            </a-form-item>
            <a-form-item v-else label="选择源码文件">
              <a-upload :before-upload="selectFile" :file-list="fileList" :remove="removeFile" accept=".py,.zip">
                <a-button icon="upload">选择文件</a-button>
              </a-upload>
            </a-form-item>
            <a-form-item label="临床任务与适用范围">
              <a-textarea v-model="clinicalScope" :rows="3" placeholder="例如：成人门诊肾功能评估；输入肌酐及其单位；输出仅作辅助判断" />
            </a-form-item>
            <a-form-item label="封装边界">
              <a-input v-model="inputSummary" placeholder="说明必填输入、单位、输出及限制，供人工核对" />
            </a-form-item>
          </a-form>
          <a-button type="primary" :loading="running" :disabled="!canPackage || running" @click="packageCode">分析源码并封装</a-button>
          <a-button v-if="running" class="button-gap" @click="cancel">停止</a-button>
          <a-button v-if="servicePackage" class="button-gap" icon="download" @click="downloadPackage">下载 MCP 服务包</a-button>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="9">
        <a-card title="智能体执行过程" :bordered="false">
          <a-steps direction="vertical" size="small" :current="currentStep" :status="error ? 'error' : 'process'">
            <a-step title="准备临床算法源码" description="检查文件与任务范围" />
            <a-step title="代码能力分析" description="识别函数及输入输出" />
            <a-step title="生成 MCP 服务包" description="生成可下载的封装产物" />
          </a-steps>
          <a-alert v-if="error" type="error" show-icon :message="error" />
          <a-alert v-else-if="servicePackage" type="success" show-icon message="封装完成，请下载并核对服务包" />
          <div v-if="agentSteps.length" class="agent-log">
            <div v-for="(step, index) in agentSteps.slice(-12)" :key="index">{{ formatStep(step) }}</div>
          </div>
          <a-collapse v-if="analysisResult" class="analysis-result"><a-collapse-panel key="analysis" header="查看代码分析结果"><pre>{{ analysisResult }}</pre></a-collapse-panel></a-collapse>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { streamAgent } from '@/utils/request'
import { listPreviewModels, getPreviewModel } from '@/utils/clinicalPreviewStore'

export default {
  name: 'ClinicalMcpPackaging',
  data() {
    return {
      source: 'generated',
models: [],
selectedModelId: undefined,
fileList: [],
      clinicalScope: '',
inputSummary: '',
running: false,
currentStep: 0,
      error: '',
agentSteps: [],
analysisResult: '',
servicePackage: null,
controller: null
    }
  },
  computed: {
    canPackage() { return this.source === 'generated' ? !!this.selectedModelId : this.fileList.length > 0 }
  },
  created() { this.models = listPreviewModels() },
  beforeDestroy() { if (this.controller) this.controller.abort() },
  methods: {
    onModelChange(id) {
      const model = getPreviewModel(id)
      this.clinicalScope = model && model.artifact && model.artifact.spec
        ? (model.artifact.spec.clinicalScope || '') : ''
    },
    selectFile(file) {
      this.fileList = [file]
      return false
    },
    removeFile() { this.fileList = []; return true },
    getSourceFile() {
      if (this.source === 'upload') return this.fileList[0]
      const model = getPreviewModel(this.selectedModelId)
      if (!model || !model.code) throw new Error('所选模型没有可用源码')
      return new File([model.code], model.codeFilename || 'clinical_algorithm.py', { type: 'text/x-python' })
    },
    runAgent(path, file, extras = {}) {
      return new Promise((resolve, reject) => {
        let finished = false
        const form = new FormData()
        form.append('file', file)
        Object.keys(extras).forEach(key => form.append(key, extras[key]))
        const fail = (reason) => {
          if (finished) return
          finished = true
          reject(new Error(typeof reason === 'string' ? reason : (reason && reason.message) || '智能体调用失败'))
        }
        streamAgent(path, form, {
          onAbortController: controller => { this.controller = controller },
          onStep: step => { this.agentSteps.push(step) },
          onFinalResult: result => { if (!finished) { finished = true; resolve(result) } },
          onError: fail,
          onWarning: fail,
          onDataProcessError: fail,
          onAbort: () => fail('已停止封装'),
          onComplete: () => fail('智能体未返回完整产物')
        }).catch(fail)
      })
    },
    async packageCode() {
      this.error = ''
      this.servicePackage = null
      this.analysisResult = ''
      this.agentSteps = []
      this.currentStep = 0
      this.running = true
      try {
        const file = this.getSourceFile()
        this.currentStep = 1
        const analysis = await this.runAgent('/api/agent/code_analysis', file)
        this.analysisResult = JSON.stringify(analysis.function || analysis, null, 2)
        this.currentStep = 2
        const result = await this.runAgent('/api/agent/service_packaging', file, {
          domain: 'clinical',
clinical_scope: this.clinicalScope.trim(),
          input_summary: this.inputSummary.trim()
        })
        if (!result || !result.service_package || !result.service_package.content) {
          throw new Error('智能体未生成可下载的 MCP 服务包')
        }
        this.servicePackage = result.service_package
        this.currentStep = 3
      } catch (error) {
        this.error = error.message || String(error)
      } finally {
        this.running = false
        this.controller = null
      }
    },
    cancel() { if (this.controller) this.controller.abort() },
    downloadPackage() {
      const pkg = this.servicePackage
      const binary = atob(pkg.content)
      const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }))
      const link = document.createElement('a')
      link.href = url
      link.download = pkg.filename || 'clinical_mcp_service.zip'
      link.click()
      URL.revokeObjectURL(url)
    },
    formatStep(step) {
      return step.message || step.content || step.thought || step.action || `步骤 ${step.step || ''}`
    }
  }
}
</script>

<style scoped>
.clinical-workflow { max-width: 1450px; margin: 0 auto; }
.clinical-workflow h1 { font-size: 24px; margin-bottom: 4px; }
.intro, .hint { color: #6b7280; }
.intro { margin-bottom: 16px; }
.hint { margin-top: 8px; }
.notice { margin-bottom: 18px; }
.source-choice { margin-bottom: 18px; }
.button-gap { margin-left: 8px; }
.agent-log { margin-top: 16px; max-height: 260px; overflow: auto; border-top: 1px solid #eee; color: #555; font-size: 12px; }
.agent-log div { padding: 6px 0; border-bottom: 1px solid #f5f5f5; }
.analysis-result { margin-top: 16px; }
.analysis-result pre { white-space: pre-wrap; word-break: break-word; max-height: 260px; overflow: auto; }
</style>
