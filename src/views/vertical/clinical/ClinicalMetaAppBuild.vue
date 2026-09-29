<template>
  <div class="clinical-build">
    <h1>元应用智能体构建</h1>
    <p class="intro">填写临床任务并连接可调用的 MCP 服务，智能体会执行构建与验证，生成可查看的元应用产物。</p>
    <a-alert type="warning" show-icon message="请仅使用去标识化的测试资料。MCP 地址必须能从 Agent 容器访问，且服务需实际运行。" class="notice" />
    <a-row :gutter="16">
      <a-col :xs="24" :lg="10">
        <a-card title="临床场景" :bordered="false">
          <a-form layout="vertical">
            <a-form-item label="元应用名称" required><a-input v-model="appName" placeholder="例如：慢病随访辅助评估" /></a-form-item>
            <a-form-item label="临床专科"><a-select v-model="specialty"><a-select-option value="general">全科医学</a-select-option><a-select-option value="nephrology">肾脏内科</a-select-option><a-select-option value="cardiology">心血管内科</a-select-option><a-select-option value="emergency">急诊医学</a-select-option></a-select></a-form-item>
            <a-form-item label="任务、目标人群、输入与预期输出" required><a-textarea v-model="scenario" :rows="5" placeholder="请描述适用人群、输入指标与单位、需要调用的服务，以及预期输出；不得输入患者身份信息" /></a-form-item>
          </a-form>
        </a-card>
        <a-card title="MCP 服务" :bordered="false" class="second-card">
          <div v-for="(service, index) in services" :key="service.key" class="service-editor">
            <div class="service-editor-title">服务 {{ index + 1 }} <a-button type="link" size="small" :disabled="running" @click="removeService(index)">移除</a-button></div>
            <a-input v-model="service.name" placeholder="服务名称，例如：肾功能计算" class="field" />
            <a-input v-model="service.mcpUrl" placeholder="MCP 服务地址，例如：http://host:port/sse" class="field" />
            <a-radio-group v-model="service.mcpMethod" size="small"><a-radio-button value="sse">SSE</a-radio-button><a-radio-button value="http">Streamable HTTP</a-radio-button></a-radio-group>
          </div>
          <a-button icon="plus" :disabled="running" @click="addService">添加 MCP 服务</a-button>
          <div class="hint">封装服务包后需先运行该服务，再填写它的 MCP 地址。</div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="14">
        <a-card title="智能体构建过程" :bordered="false">
          <div class="actions">
            <a-button type="primary" :loading="running" :disabled="running" @click="build">开始构建</a-button>
            <a-button v-if="running" @click="cancel">停止构建</a-button>
            <a-tag v-if="status === 'success'" color="green">构建成功</a-tag>
            <a-tag v-if="status === 'failed'" color="red">构建失败</a-tag>
          </div>
          <a-alert v-if="error" type="error" show-icon :message="error" class="result-alert" />
          <a-alert v-if="result && result.publishable === false" type="warning" show-icon message="构建结束，但产物未达到可发布条件；请核对验证结果与服务绑定。" class="result-alert" />
          <a-steps size="small" :current="currentStep" class="build-steps"><a-step title="连接服务" /><a-step title="智能体规划" /><a-step title="构建验证" /><a-step title="产物生成" /></a-steps>
          <div class="event-list">
            <a-empty v-if="!events.length" description="填写临床场景和 MCP 地址后开始构建" />
            <div v-for="(event, index) in events.slice(-30)" :key="index" class="event-row"><a-icon type="check-circle" />{{ event }}</div>
          </div>
          <a-collapse v-if="artifact" class="artifact-panel"><a-collapse-panel key="artifact" header="查看元应用构建产物"><pre>{{ formattedArtifact }}</pre></a-collapse-panel></a-collapse>
        </a-card>
        <a-card v-if="artifact" title="试运行元应用" :bordered="false" class="second-card">
          <a-alert type="info" show-icon message="请使用去标识化的测试输入，结果需结合服务和临床适用范围人工核对。" class="result-alert" />
          <a-textarea v-model="runMessage" :rows="3" placeholder="输入一条临床测试任务" />
          <a-button type="primary" :loading="testing" :disabled="!runMessage.trim()" class="run-button" @click="runArtifact">调用已构建产物</a-button>
          <pre v-if="runResult" class="run-result">{{ runResult }}</pre>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { startSimulation, cancelSimulation, subscribeSimulationStream, fetchSimulationArtifact } from '@/api/simulation_builder'
import { AGENT_BASE_URL } from '@/utils/baseUrl'

let nextServiceKey = 1
const newService = () => ({ key: nextServiceKey++, name: '', mcpUrl: '', mcpMethod: 'sse' })

export default {
  name: 'ClinicalMetaAppBuild',
  data() {
    return {
      appName: '',
specialty: 'general',
scenario: '',
services: [newService()],
      running: false,
testing: false,
status: 'idle',
currentStep: 0,
      sessionId: '',
stopStream: null,
events: [],
error: '',
result: null,
      artifact: null,
runMessage: '',
runResult: ''
    }
  },
  computed: {
    formattedArtifact() { return JSON.stringify(this.artifact, null, 2) }
  },
  beforeDestroy() { if (this.stopStream) this.stopStream() },
  methods: {
    addService() { this.services.push(newService()) },
    removeService(index) { this.services.splice(index, 1) },
    addEvent(type, data) {
      const label = data && (data.text || data.message || data.name || data.status || data.phase || data.issue)
      this.events.push(`${type}：${typeof label === 'string' ? label : JSON.stringify(label || data || {})}`)
    },
    async build() {
      this.error = ''
      this.events = []
      this.artifact = null
      this.runResult = ''
      this.result = null
      const name = this.appName.trim()
      const scenario = this.scenario.trim()
      const services = this.services.map((service, index) => ({
        id: `clinical-service-${index + 1}`,
name: service.name.trim(),
        mcpUrl: service.mcpUrl.trim(),
mcpMethod: service.mcpMethod,
tools: [],
isFake: false
      }))
      if (!name || !scenario || !services.length || services.some(service => !service.name || !/^https?:\/\//.test(service.mcpUrl))) {
        this.error = '请填写元应用名称、临床任务和至少一个有效的 MCP 服务地址'
        return
      }
      this.running = true
      this.status = 'running'
      this.currentStep = 0
      try {
        const response = await startSimulation({
          appId: `clinical-${Date.now()}`,
appName: name,
domain: 'clinical',
          servicesMeta: services,
scenarioDescription: `临床专科：${this.specialty}。${scenario}`,
          maxIterations: 5
        })
        if (!response || !response.sessionId || !response.streamUrl) throw new Error('Agent 未返回构建会话')
        this.sessionId = response.sessionId
        this.stopStream = subscribeSimulationStream(response.sessionId, response.streamUrl, {
          step: data => { this.currentStep = Math.min(Number(data.step) || 0, 3); this.addEvent('阶段', data) },
          service: data => this.addEvent('服务', data),
          iteration: data => this.addEvent('迭代', data),
          planner_decision: data => this.addEvent('规划', data),
          verifier_result: data => this.addEvent('验证', data),
          issue: data => this.addEvent('问题', data),
          log: data => this.addEvent('日志', data),
          complete: data => this.finish(data),
          error: error => this.fail(error)
        })
      } catch (error) { this.fail(error) }
    },
    async finish(data) {
      this.result = data
      this.running = false
      this.status = data.success ? 'success' : 'failed'
      this.currentStep = data.success ? 4 : this.currentStep
      this.addEvent('完成', data)
      if (!data.success) {
        this.error = (data.result && data.result.error) || '构建验证未通过，请查看执行记录'
        return
      }
      try { this.artifact = await fetchSimulationArtifact(this.sessionId) } catch (error) {
        this.error = `产物读取失败：${error.message || error}`
      }
    },
    fail(error) {
      if (!this.running) return
      this.running = false
      this.status = 'failed'
      this.error = error.message || String(error)
      if (this.stopStream) { this.stopStream(); this.stopStream = null }
    },
    async cancel() {
      if (this.stopStream) { this.stopStream(); this.stopStream = null }
      if (this.sessionId) await cancelSimulation(this.sessionId).catch(() => {})
      this.running = false
      this.status = 'idle'
      this.addEvent('操作', { message: '已停止构建' })
    },
    async runArtifact() {
      this.testing = true
      this.runResult = ''
      try {
        const response = await fetch(`${AGENT_BASE_URL}/api/agent/simulation/${encodeURIComponent(this.sessionId)}/run`, {
          method: 'POST',
headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: this.runMessage.trim(), preferGoldenPath: true })
        })
        const body = await response.json()
        if (!response.ok) throw new Error(typeof body.detail === 'string' ? body.detail : '试运行失败')
        this.runResult = JSON.stringify(body, null, 2)
      } catch (error) { this.runResult = error.message || String(error) } finally { this.testing = false }
    }
  }
}
</script>

<style scoped>
.clinical-build { max-width: 1500px; margin: 0 auto; }
.clinical-build h1 { font-size: 24px; margin-bottom: 4px; }
.intro, .hint { color: #6b7280; }
.intro { margin-bottom: 16px; }
.notice, .result-alert { margin-bottom: 16px; }
.second-card { margin-top: 16px; }
.service-editor { border: 1px solid #dce8f3; background: #f9fcff; border-radius: 6px; padding: 12px; margin-bottom: 12px; }
.service-editor-title { display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
.field { margin: 7px 0; }
.hint { margin-top: 12px; }
.actions { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; }
.build-steps { margin-bottom: 18px; }
.event-list { min-height: 220px; max-height: 380px; overflow: auto; border: 1px solid #eee; border-radius: 6px; padding: 10px; }
.event-row { padding: 6px 0; border-bottom: 1px solid #f5f5f5; word-break: break-word; }
.event-row .anticon { color: #2973c7; margin-right: 8px; }
.artifact-panel { margin-top: 16px; }
.artifact-panel pre, .run-result { white-space: pre-wrap; word-break: break-word; max-height: 360px; overflow: auto; }
.run-button { margin-top: 12px; }
.run-result { margin-top: 14px; padding: 12px; background: #f7f9fb; }
</style>
