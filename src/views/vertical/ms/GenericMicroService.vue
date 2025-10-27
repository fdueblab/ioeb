<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" size="small" title="提交类型">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="20">
            <a-col :span="24">
              <div style="display: flex">
                <a-form-item label="提交类型" required>
                  <a-radio-group v-model="submitType" @change="handleSubmitTypeChange">
                    <a-radio-button value="algorithm">算法模型</a-radio-button>
                    <a-radio-button value="microservice">微服务</a-radio-button>
                    <a-radio-button disabled>智能体</a-radio-button>
                  </a-radio-group>
                </a-form-item>
                <a-button
                  v-show="submitType === 'algorithm'"
                  type="link"
                  icon="file-text"
                  href="https://fdueblab.cn/docs/guide/code-template"
                  target="_blank"
                >
                  算法代码提交要求文档
                </a-button>
              </div>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>

    <!-- MCP服务配置 -->
    <a-card v-if="submitType === 'algorithm'" :bordered="false" size="small" title="MCP服务配置">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="20">
            <a-col :span="4">
              <a-form-item label="领域">
                <span style="margin-left: 5px; font-size: 14px">{{ domainTitle }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="行业">
                <a-select v-model="programInfo.industry" placeholder="请选择行业" allow-clear>
                  <a-select-option v-for="(item, index) in industryOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="场景">
                <a-select v-model="programInfo.scenario" placeholder="请选择场景" allow-clear>
                  <a-select-option v-for="(item, index) in scenarioOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="技术">
                <a-select v-model="programInfo.technology" placeholder="请选择技术" allow-clear>
                  <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="服务名称" required>
                <a-input v-model="form.serviceName" placeholder="请输入服务名称"/>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col :span="6">
              <a-form-item label="程序文件">
                <a-upload
                  accept=".py,.zip,.jar"
                  :file-list="programFiles"
                  :remove="removeProgramFile"
                  :customRequest="customProgramFilesChose"
                  :multiple="false">
                  <a-button icon="file-add"> 选择文件 </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="操作">
                <a-button
                  type="primary"
                  icon="rocket"
                  @click="onAutoPublish"
                  :disabled="autoPublishDisabled"
                  :loading="uploadProgramLoading"
                >
                  上传并自动发布
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>

    <!-- 微服务直接预发布部分 -->
    <a-card v-if="submitType === 'microservice'" :bordered="false" size="small" title="微服务预发布">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="20">
            <a-col :span="4">
              <a-form-item label="领域">
                <span style="margin-left: 5px; font-size: 14px">{{ domainTitle }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="行业">
                <a-select v-model="programInfo.industry" placeholder="请选择行业" allow-clear>
                  <a-select-option v-for="(item, index) in industryOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="场景">
                <a-select v-model="programInfo.scenario" placeholder="请选择场景" allow-clear>
                  <a-select-option v-for="(item, index) in scenarioOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="技术">
                <a-select v-model="programInfo.technology" placeholder="请选择技术" allow-clear>
                  <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="20">
            <a-col :span="4">
              <a-form-item label="文件">
                <a-upload
                  accept=".zip,.7z,.jar"
                  :file-list="programFiles"
                  :remove="removeProgramFile"
                  :customRequest="customProgramFilesChose"
                  :multiple="false">
                  <a-button> <a-icon type="folder-add" /> 选择文件 </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="类型" required>
                <a-select v-model="form.serverType" placeholder="请选择服务类型" allow-clear>
                  <a-select-option value="restful">Restful Server</a-select-option>
                  <a-select-option value="mcp">MCP Server</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="名称" required>
                <a-input v-model="form.serviceName" placeholder="请输入微服务名称"/>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item tooltip="value*category">
                <span slot="label">预发布
                  <a-tooltip title="预发布后服务及应用运维管理中将出现部署在容器中的该服务，可以管理其部署状态并对其进行验证与测评">
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-button
                  type="primary"
                  icon="play-circle"
                  @click="uploadService"
                  :disabled="uploadServiceDisabled"
                  :loading="uploadServiceLoading"
                >
                  预发布
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>
    <!-- 发布进度 -->
    <a-card v-if="publishProgress.show" :bordered="false" style="margin-top: 10px;">
      <div slot="title">
        <a-icon type="loading" v-if="publishProgress.status !== 'finish' && publishProgress.status !== 'error'" />
        <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" v-else-if="publishProgress.status === 'finish'" />
        <a-icon type="close-circle" theme="twoTone" two-tone-color="#f5222d" v-else />
        <span style="margin-left: 8px;">发布进度</span>
      </div>

      <!-- 步骤展示 -->
      <div class="publish-steps">
        <div
          v-for="(step, index) in publishProgress.steps"
          :key="index"
          :class="['step-item', {
            'active': index === publishProgress.current,
            'completed': index < publishProgress.current,
            'error': publishProgress.status === 'error' && index === publishProgress.current
          }]"
        >
          <div class="step-header" @click="toggleStepDetail(index)">
            <div class="step-indicator">
              <a-icon v-if="index < publishProgress.current" type="check-circle" class="icon-completed" />
              <a-icon v-else-if="index === publishProgress.current && publishProgress.status === 'error'" type="close-circle" class="icon-error" />
              <a-icon v-else-if="index === publishProgress.current && publishProgress.status !== 'finish'" type="loading" class="icon-loading" />
              <span v-else class="step-number">{{ index + 1 }}</span>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
            </div>
            <a-icon
              v-if="step.agentSteps.length > 0"
              :type="step.expanded ? 'up' : 'down'"
              class="expand-icon"
            />
          </div>

          <!-- Agent步骤列表（第二级） -->
          <div v-if="step.expanded && step.agentSteps.length > 0" class="agent-steps">
            <div
              v-for="(agentStep, agentIndex) in step.agentSteps"
              :key="agentIndex"
              class="agent-step-item"
            >
              <div class="agent-step-header" @click="toggleAgentStepDetail(index, agentIndex)">
                <span class="agent-step-number">步骤 {{ agentStep.step }}</span>
                <span class="agent-step-summary">{{ getAgentStepSummary(agentStep) }}</span>
                <a-icon
                  :type="agentStep.expanded ? 'up' : 'down'"
                  class="expand-icon-small"
                />
              </div>

              <!-- 详细内容（第三级） -->
              <div v-if="agentStep.expanded" class="agent-step-details">
                <div v-if="agentStep.thought" class="detail-section thought">
                  <div class="detail-label">💭 思考</div>
                  <div class="detail-content">{{ agentStep.thought }}</div>
                </div>
                <div v-if="agentStep.action" class="detail-section action">
                  <div class="detail-label">⚙️ 行动</div>
                  <div class="detail-content">{{ agentStep.action }}</div>
                </div>
                <div v-if="agentStep.action_result" class="detail-section observation">
                  <div class="detail-label">👁️ 结果</div>
                  <div class="detail-content">{{ agentStep.action_result }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 无Agent的步骤显示简单描述 -->
          <div v-else-if="step.expanded && step.agentSteps.length === 0" class="simple-description">
            {{ step.description || '执行中...' }}
          </div>
        </div>
      </div>
    </a-card>

    <!-- MCP能力依赖图 -->
    <a-card v-if="options" :bordered="false" style="margin-top: 10px;">
      <div slot="title">MCP能力依赖图（只读可视化）</div>
      <div class="g6-x">
        <v-chart
          style="height: 100%; width: 100%;"
          :options="options"
          autoresize
        />
      </div>
    </a-card>

    <!-- MCP Server信息 -->
    <a-card v-if="mcpServerInfo.show" :bordered="false" style="margin-top: 10px;">
      <div slot="title">
        <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
        <span style="margin-left: 8px;">MCP Server 发布成功</span>
      </div>
      <a-descriptions bordered :column="2">
        <a-descriptions-item label="服务名称">
          <a-tag color="blue">{{ mcpServerInfo.serviceName }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="协议版本">
          MCP v1.0
        </a-descriptions-item>
        <a-descriptions-item label="领域">
          {{ domainTitle }}
        </a-descriptions-item>
        <a-descriptions-item label="行业">
          {{ getIndustryText(mcpServerInfo.industry) }}
        </a-descriptions-item>
        <a-descriptions-item label="场景">
          {{ getScenarioText(mcpServerInfo.scenario) }}
        </a-descriptions-item>
        <a-descriptions-item label="技术">
          {{ getTechnologyText(mcpServerInfo.technology) }}
        </a-descriptions-item>
      </a-descriptions>

      <a-divider>识别的MCP能力</a-divider>

      <a-tabs default-active-key="tools">
        <a-tab-pane key="tools" tab="Tools">
          <template slot="tab">
            <a-badge :count="mcpServerInfo.tools.length" :overflow-count="99">
              <span><a-icon type="api" /> Tools</span>
            </a-badge>
          </template>
          <a-list
            :data-source="mcpServerInfo.tools"
            :locale="{ emptyText: '未识别到Tools' }"
          >
            <a-list-item slot="renderItem" slot-scope="item">
              <a-list-item-meta>
                <span slot="title">
                  <a-icon type="tool" />
                  {{ item.name }}
                </span>
                <span slot="description">
                  <div>{{ item.description || '无描述' }}</div>
                  <div style="margin-top: 4px;">
                    <a-tag color="green">输入: {{ item.input }}</a-tag>
                    <a-tag color="blue">输出: {{ item.output }}</a-tag>
                  </div>
                </span>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-tab-pane>

        <a-tab-pane key="resources" tab="Resources">
          <template slot="tab">
            <a-badge :count="mcpServerInfo.resources.length" :overflow-count="99">
              <span><a-icon type="database" /> Resources</span>
            </a-badge>
          </template>
          <a-list
            :data-source="mcpServerInfo.resources"
            :locale="{ emptyText: '未识别到Resources' }"
          >
            <a-list-item slot="renderItem" slot-scope="item">
              <a-list-item-meta>
                <span slot="title">
                  <a-icon type="file-text" />
                  {{ item.name }}
                </span>
                <span slot="description">{{ item.description || '无描述' }}</span>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-tab-pane>

        <a-tab-pane key="prompts" tab="Prompts">
          <template slot="tab">
            <a-badge :count="mcpServerInfo.prompts.length" :overflow-count="99">
              <span><a-icon type="message" /> Prompts</span>
            </a-badge>
          </template>
          <a-list
            :data-source="mcpServerInfo.prompts"
            :locale="{ emptyText: '未识别到Prompts' }"
          >
            <a-list-item slot="renderItem" slot-scope="item">
              <a-list-item-meta>
                <span slot="title">
                  <a-icon type="comment" />
                  {{ item.name }}
                </span>
                <span slot="description">{{ item.description || '无描述' }}</span>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-tab-pane>
      </a-tabs>

      <div style="margin-top: 16px; text-align: center;">
        <a-button type="primary" icon="download" @click="downloadServicePackage" v-if="servicePackageData">
          下载封装代码
        </a-button>
        <a-button type="primary" icon="database" @click="goToVerticalOverview" style="margin-left: 8px;">
          垂域资源总览
        </a-button>
        <a-button type="primary" style="margin-left: 8px;" icon="check-circle" @click="goToTechEvaluation">
          微服务技术评测
        </a-button>
      </div>
    </a-card>
    <!-- <agent-execution-panel
      v-if="showAgentPanel"
      :is-running="agentIsRunning"
      :steps="agentSteps"
      :error="agentError"
      :warning="agentWarning"
      :final-results="agentFinalResults"
      @close="closeAgentPanel"
    /> -->
  </page-header-wrapper>
</template>

<script>
/* eslint-disable */
import { streamAgent } from '@/utils/request'
import { domainMockData, convertToGraphFormat } from './chartData'
// 必须要引用echarts，否则图表无法显示
// eslint-disable-next-line no-unused-vars
import * as echarts from 'echarts'
import vChart from 'vue-echarts'
import AgentExecutionPanel from '@/components/Agent/AgentExecutionPanel'
import dictionaryCache from '@/utils/dictionaryCache'
import { createService } from '@/api/service'
import store from '@/store'

export default {
  name: 'GenericMicroService',
  components: {
    vChart,
    AgentExecutionPanel
  },
  props: {
    // 垂直领域类型，从路由解析
    verticalType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      // 领域标题
      domainTitle: '',
      // 上传文件
      programFiles: [],
      configFiles: [],
      uploadFiles: [],
      uploadConfigFiles: [],
      options: null,
      // 表单数据
      form: {
        serverType: 'mcp',
        serviceName: undefined
      },
      // 程序信息
      programInfo: {
        industry: undefined,
        scenario: undefined,
        technology: undefined
      },
      uploadProgramLoading: false,
      uploadServiceLoading: false,
      // 字典选项
      industryOptions: [],
      scenarioOptions: [],
      technologyOptions: [],
      // Agent调用
      showAgentPanel: false,
      agentIsRunning: false,
      agentSteps: [],
      agentError: '',
      agentWarning: '',
      agentFinalResults: null,
      submitType: 'algorithm',
      // 发布进度
      publishProgress: {
        show: false,
        current: 0,
        status: 'process', // process | finish | error | wait
        steps: [
          { title: '上传文件', description: '', expanded: false, agentSteps: [] },
          { title: '代码分析', description: '', expanded: false, agentSteps: [] },
          { title: 'MCP封装', description: '', expanded: false, agentSteps: [] },
          { title: '服务部署', description: '', expanded: false, agentSteps: [] }
        ]
      },
      // 保存服务包数据
      servicePackageData: null,
      // MCP Server信息
      mcpServerInfo: {
        show: false,
        serviceName: '',
        industry: undefined,
        scenario: undefined,
        technology: undefined,
        tools: [],
        resources: [],
        prompts: []
      },
      // 程序解析结果
      programJson: null
    }
  },
  computed: {
    uploadServiceDisabled() {
      if (this.submitType === 'microservice') {
        return !this.form.serviceName || this.uploadFiles.length === 0
      }
      return !this.form.serviceName || this.uploadFiles.length === 0
    },
    autoPublishDisabled() {
      return !this.form.serviceName || this.uploadFiles.length === 0
    }
  },
  created() {
    // 初始化数据
    this.initData()
  },
  methods: {
    async initData() {
      try {
        // 加载字典缓存
        this.industryOptions = await dictionaryCache.loadDict(`${this.verticalType}_industry`) || []
        this.scenarioOptions = await dictionaryCache.loadDict(`${this.verticalType}_scenario`) || []
        this.technologyOptions = await dictionaryCache.loadDict(`${this.verticalType}_technology`) || []
        // 设置领域标题
        const domains = await dictionaryCache.loadDict('domain') || []
        this.domainTitle = domains.find(domain => domain.code === this.verticalType)?.text || '未知领域'
        // 重置提交类型
        this.submitType = 'algorithm'
      } catch (error) {
        console.error('加载字典数据失败:', error)
        this.$message.error('加载数据字典失败，请刷新重试')
        // 确保所有数组初始化，防止undefined错误
        this.industryOptions = this.industryOptions || []
        this.scenarioOptions = this.scenarioOptions || []
        this.technologyOptions = this.technologyOptions || []
      }
    },
    // 程序文件选择
    async customProgramFilesChose(options) {
      const { file } = options
      if (!file) {
        return false
      }

      this.uploadFiles = [file]
      this.programFiles = [{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      }]
    },

    // 移除程序文件
    removeProgramFile() {
      this.uploadFiles = []
      this.programFiles = []
    },

    // 配置文件选择
    async customConfigFileChose(options) {
      const { file } = options
      if (!file) {
        return false
      }
      this.uploadConfigFiles = [file]
      this.configFiles = [{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      }]
    },

    // 移除配置文件
    removeConfigFile() {
      this.configFiles = []
      this.uploadConfigFiles = []
    },

    // 自动发布MCP服务
    async onAutoPublish() {
      if (this.uploadFiles.length === 0) {
        this.$message.error('请先选择程序文件！')
        return
      }

      if (!this.form.serviceName) {
        this.$message.error('请输入服务名称！')
          return
        }

      // 重置状态
      this.publishProgress = {
        show: true,
        current: 0,
        status: 'process',
        steps: [
          { title: '上传文件', description: '', expanded: false, agentSteps: [] },
          { title: '代码分析', description: '', expanded: false, agentSteps: [] },
          { title: 'MCP封装', description: '', expanded: false, agentSteps: [] },
          { title: '服务部署', description: '', expanded: false, agentSteps: [] }
        ]
      }
      this.mcpServerInfo.show = false
      this.servicePackageData = null

      this.uploadProgramLoading = true
      const file = this.uploadFiles[0]

      try {
        // Step 1: 上传文件
        this.updatePublishProgress(0, 'process', '正在上传文件...')
        await new Promise(resolve => setTimeout(resolve, 500))
        this.updatePublishProgress(0, 'process', '文件上传完成')

        // Step 2: 代码分析（识别MCP能力）
        this.updatePublishProgress(1, 'process', '正在分析代码结构...')
        await this.analyzeMCPCapabilities(file)
        this.updatePublishProgress(1, 'process', '代码分析完成，已识别MCP能力')

        // Step 3: 自动封装为MCP Server
        this.updatePublishProgress(2, 'process', '正在封装MCP服务...')
        await this.autoPackageMCPServer()
        this.updatePublishProgress(2, 'process', '服务封装完成')

        // Step 4: 自动部署
        this.updatePublishProgress(3, 'process', '正在部署服务...')
        await this.autoDeployMCPServer()
        this.updatePublishProgress(3, 'process', '服务部署完成')

        // 完成
        this.publishProgress.status = 'finish'
        this.$message.success('MCP Server 发布成功！')

        // 显示MCP服务信息
        this.showMCPServerInfo()
      } catch (error) {
        console.error('自动发布失败:', error)
        this.publishProgress.status = 'error'
        this.publishProgress.steps[this.publishProgress.current] = '失败: ' + (error.message || error)
        this.$message.error('发布失败：' + (error.message || error))
      } finally {
          this.uploadProgramLoading = false
      }
    },

    // 更新发布进度
    updatePublishProgress(step, status, description) {
      this.publishProgress.current = step
      this.publishProgress.status = status
      this.publishProgress.steps[step].description = description
    },

    // 添加Agent步骤到指定的主步骤
    addAgentStep(stepIndex, agentData) {
      if (!this.publishProgress.steps[stepIndex]) {
        console.error('步骤索引无效:', stepIndex)
          return
        }

      // 确保 agentSteps 数组存在
      if (!this.publishProgress.steps[stepIndex].agentSteps) {
        this.$set(this.publishProgress.steps[stepIndex], 'agentSteps', [])
      }
      
      const agentStep = {
        step: agentData.step || (this.publishProgress.steps[stepIndex].agentSteps.length + 1),
        thought: agentData.thought || '',
        action: agentData.action || '',
        action_result: agentData.action_result || '',
        expanded: false
      }
      this.publishProgress.steps[stepIndex].agentSteps.push(agentStep)
      
      // 自动更新主步骤描述为最新的Agent步骤摘要
      this.publishProgress.steps[stepIndex].description = this.getAgentStepSummary(agentStep)
    },

    // 切换主步骤详情展开/折叠
    toggleStepDetail(index) {
      this.publishProgress.steps[index].expanded = !this.publishProgress.steps[index].expanded
    },

    // 切换Agent步骤详情展开/折叠
    toggleAgentStepDetail(stepIndex, agentIndex) {
      const agentStep = this.publishProgress.steps[stepIndex].agentSteps[agentIndex]
      if (agentStep) {
        agentStep.expanded = !agentStep.expanded
      }
    },

    // 获取Agent步骤的摘要信息
    getAgentStepSummary(agentStep) {
      if (agentStep.thought && agentStep.thought.length > 0) {
        const thoughtPreview = agentStep.thought.length > 40 
          ? agentStep.thought.substring(0, 40) + '...' 
          : agentStep.thought
        return `💭 ${thoughtPreview}`
      } else if (agentStep.action) {
        const actionPreview = agentStep.action.length > 40 
          ? agentStep.action.substring(0, 40) + '...' 
          : agentStep.action
        return `⚙️ ${actionPreview}`
      } else if (agentStep.action_result) {
        return '👁️ 查看执行结果'
      }
      return '处理中...'
    },

    // 分析MCP能力
    async analyzeMCPCapabilities(file) {
      const fileExt = file.name.split('.').pop().toLowerCase()

      // 根据文件类型处理
      if (fileExt === 'zip' || this.verticalType === 'aml') {
        // 真实Agent分析
        return this.realMCPAnalysisAgent(file)
              } else {
        // 模拟分析
        return this.mockMCPAnalysis(file)
      }
    },

    // 真实代码分析
    realMCPAnalysisAgent(file) {
      return new Promise((resolve, reject) => {
      // 重置Agent面板状态
      this.agentSteps = []
      this.agentError = ''
      this.agentWarning = ''
      this.agentFinalResults = null
      this.agentIsRunning = true
      this.showAgentPanel = true

      // 准备FormData
      const formData = new FormData()
      formData.append('file', file.originFileObj || file)

        // 使用封装的streamAgent方法 - 调用 code_analysis 接口
      streamAgent('/api/agent/code_analysis', formData, {
        onStart: () => {
          this.agentIsRunning = true
        },
        onStep: (data) => {
          this.agentSteps.push(data)
            // 将Agent步骤添加到第二级（步骤1：代码分析）
            this.addAgentStep(1, data)
        },
        onError: (error) => {
          this.agentError = error
          this.agentIsRunning = false
            reject(error)
        },
        onWarning: (warning) => {
          this.agentWarning = warning
          this.agentIsRunning = false
            reject(warning)
        },
        onFinalResult: (results) => {
          this.agentFinalResults = results
            this.agentIsRunning = false

          // 从最终结果中提取函数依赖图数据
          if (results && results.function) {
            try {
              const funcData = results.function

              // 如果数据已经包含nodes和edges，直接使用
              if (funcData.nodes && funcData.edges) {
                this.programJson = funcData
              } else {
                // 否则使用转换方法
                this.programJson = convertToGraphFormat(funcData)
                }

                // 将节点转换为MCP能力（Tools）
                if (this.programJson && this.programJson.nodes) {
                  const tools = this.programJson.nodes.map(node => ({
                    id: node.id,
                    name: node.label,
                    description: `${node.label} - ${node.input} -> ${node.output}`,
                    input: node.input,
                    output: node.output,
                    mcpType: 'tool'
                  }))
                  
                  this.mcpServerInfo.tools = tools
                  this.mcpServerInfo.resources = []
                  this.mcpServerInfo.prompts = []
                  
                  this.setMCPChart()
                  resolve(results)
                } else {
                  reject(new Error('函数依赖图数据处理失败'))
              }
            } catch (e) {
              console.error('处理函数依赖数据出错:', e)
                reject(e)
            }
          } else {
              reject(new Error('未能获取函数依赖关系数据'))
          }
        },
        onComplete: () => {
          this.agentIsRunning = false
        },
        onDataProcessError: (e, line) => {
          console.error('解析数据失败:', e, line)
          this.agentError = '解析数据失败: ' + e.message
          this.agentIsRunning = false
            reject(e)
          }
        })
      })
    },

    // 模拟MCP分析
    mockMCPAnalysis(file) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 获取当前领域的模拟数据
          const programData = domainMockData[this.verticalType] || { checkFile: null, nodes: [], edges: [] }

          // 将节点转换为MCP能力
          const tools = programData.nodes.map(node => ({
            id: node.id,
            name: node.label,
            description: `${node.label} - ${node.input} -> ${node.output}`,
            input: node.input,
            output: node.output,
            mcpType: 'tool'
          }))

          this.mcpServerInfo.tools = tools
          this.mcpServerInfo.resources = []
          this.mcpServerInfo.prompts = []

          // 设置分析结果
          this.programJson = {
            nodes: programData.nodes,
            edges: programData.edges
          }
          this.setMCPChart()

          resolve({ tools, resources: [], prompts: [] })
        }, 1000)
      })
    },

    // 自动封装MCP Server
    async autoPackageMCPServer() {
      const file = this.uploadFiles[0]
      
      return new Promise((resolve, reject) => {
        // 准备FormData
        const formData = new FormData()
        formData.append('file', file.originFileObj || file)

        // 使用封装的streamAgent方法 - 调用 service_packaging 接口
        streamAgent('/api/agent/service_packaging', formData, {
          onStart: () => {
            this.agentIsRunning = true
          },
          onStep: (data) => {
            this.agentSteps.push(data)
            // 将Agent步骤添加到第二级（步骤2：MCP封装）
            this.addAgentStep(2, data)
          },
          onError: (error) => {
            this.agentError = error
            this.agentIsRunning = false
            reject(error)
          },
          onWarning: (warning) => {
            this.agentWarning = warning
            this.agentIsRunning = false
            reject(warning)
          },
          onFinalResult: (results) => {
            this.agentFinalResults = results
            this.agentIsRunning = false

            // 从最终结果中提取服务包数据
            if (results && results.service_package) {
              try {
                const servicePackage = results.service_package
                // 保存服务包信息供下载使用
                this.servicePackageData = servicePackage
                console.log('服务封装完成:', servicePackage)
                resolve(servicePackage)
              } catch (e) {
                console.error('处理服务包数据出错:', e)
                reject(e)
              }
            } else {
              // 如果没有返回service_package，也认为成功（向后兼容）
              resolve(results)
            }
          },
          onComplete: () => {
            this.agentIsRunning = false
          },
          onDataProcessError: (e, line) => {
            console.error('解析数据失败:', e, line)
            this.agentError = '解析数据失败: ' + e.message
            this.agentIsRunning = false
            reject(e)
          }
        })
      })
    },

    // 自动部署MCP Server
    async autoDeployMCPServer() {
      if (!this.servicePackageData) {
        throw new Error('服务包数据不存在，无法部署')
      }

      try {
        // 将base64转换为Blob
        const binaryData = atob(this.servicePackageData.content)
        const bytes = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/zip' })

        // 创建File对象
        const filename = this.servicePackageData.filename || `${this.form.serviceName}_mcp_service.zip`
        const file = new File([blob], filename, { type: 'application/zip' })

        // 构建FormData
        const formData = new FormData()
        formData.append('file', file)
        formData.append('name', this.form.serviceName)
        formData.append('type', 'atomic_mcp')
        formData.append('domain', this.verticalType)
        
        // 可选字段
        if (this.programInfo.industry) {
          formData.append('industry', this.programInfo.industry)
        }
        if (this.programInfo.scenario) {
          formData.append('scenario', this.programInfo.scenario)
        }
        if (this.programInfo.technology) {
          formData.append('technology', this.programInfo.technology)
        }
        
        formData.append('number', '0')
        
        // 序列化复杂对象为JSON字符串
        const sourceInfo = {
          popoverTitle: 'MCP服务溯源',
          companyName: '复旦大学课题组',
          companyAddress: '上海市杨浦区邯郸路220号',
          companyContact: '021-65642222',
          companyIntroduce: '课题五',
          msIntroduce: `${store.getters.nickname}发布的MCP服务。`,
          companyScore: 5,
          msScore: 5
        }
        formData.append('source', JSON.stringify(sourceInfo))
        
        // 不传 apiList，让后端自动生成，部署完成后可通过 PATCH 接口更新

        // 调用上传并部署接口
        const response = await this.uploadAndDeployService(formData)
        
        if (response && response.status === 'success') {
          return response
        } else {
          throw new Error(response?.message || '部署失败')
        }
      } catch (error) {
        console.error('部署服务时出错:', error)
        throw error
      }
    },

    // 调用上传并部署服务接口
    async uploadAndDeployService(formData) {
      try {
        const response = await this.$http.post('/services/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000 // 60秒超时
        })
        return response
      } catch (error) {
        console.error('上传服务失败:', error)
        throw new Error(error.response?.data?.message || error.message || '上传服务失败')
      }
    },

    // 显示MCP服务信息
    showMCPServerInfo() {
      this.mcpServerInfo.show = true
      this.mcpServerInfo.serviceName = this.form.serviceName
      this.mcpServerInfo.industry = this.programInfo.industry
      this.mcpServerInfo.scenario = this.programInfo.scenario
      this.mcpServerInfo.technology = this.programInfo.technology
    },

    // 设置MCP能力依赖图
    setMCPChart() {
      // 确保程序Json存在
      if (!this.programJson || !this.programJson.nodes || !this.programJson.edges) {
        console.error('程序Json数据不完整，无法渲染图表', this.programJson)
          return
        }

      const json = this.programJson
      const processedNodes = json.nodes.map(node => ({
        x: node.x,
        y: node.y,
        id: node.id,
        name: node.label,
        symbolSize: node.size,
        label: {
          show: true,
          position: 'inside'
        },
        value: node.id,
        itemStyle: {
          color: node.mcpType === 'resource' ? '#52c41a' : node.mcpType === 'prompt' ? '#1890ff' : '#722ed1'
        }
      }))

      const processedEdges = json.edges.map(edge => ({
        source: edge.sourceID,
        target: edge.targetID,
        lineStyle: {
          curveness: 0.3
        },
        symbol: ['none', 'arrow'],
        symbolSize: [0, 10]
      }))

      // 设置echarts图表配置
      this.options = {
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'none',
            data: processedNodes,
            edges: processedEdges,
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
            const node = json.nodes.find(n => n.id === params.data.id)
          if (node) {
              const mcpTypeText = node.mcpType === 'tool' ? 'Tool'
                                  : node.mcpType === 'resource' ? 'Resource'
                                  : node.mcpType === 'prompt' ? 'Prompt' : 'Tool'

              return `
              <div style="font-size: 14px; line-height: 1.5; color: #333;">
                <strong>${node.label}</strong><br/>
                <span style="color: #888;">MCP类型:</span> ${mcpTypeText}<br/>
                <span style="color: #888;">输入:</span> ${node.input}<br/>
                <span style="color: #888;">输出:</span> ${node.output}<br/>
                <span style="color: #888;">描述:</span> ${node.description || '无'}
              </div>
              `
            }
            return params.value
          }
        }
      }
    },

    // 辅助方法：获取行业文本
    getIndustryText(code) {
      const item = this.industryOptions.find(opt => opt.code === code)
      return item ? item.text : code || '未设置'
    },

    // 辅助方法：获取场景文本
    getScenarioText(code) {
      const item = this.scenarioOptions.find(opt => opt.code === code)
      return item ? item.text : code || '未设置'
    },

    // 辅助方法：获取技术文本
    getTechnologyText(code) {
      const item = this.technologyOptions.find(opt => opt.code === code)
      return item ? item.text : code || '未设置'
    },

    // 跳转到垂域资源总览
    goToVerticalOverview() {
      // 跳转到当前垂域资源总览页面
      this.$router.push(`/vertical-user/${this.verticalType}`)
    },

    // 跳转到微服务技术评测
    goToTechEvaluation() {
      // 跳转到微服务技术评测页面
      this.$router.push(`/evaluation/${this.verticalType}/technology`)
    },

    // 下载封装好的服务代码
    downloadServicePackage() {
      if (!this.servicePackageData) {
        this.$message.warning('暂无可下载的服务包')
        return
      }

      try {
        // 将base64内容转换为二进制数据
        const binaryData = atob(this.servicePackageData.content)
        const bytes = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i)
        }

        // 创建Blob对象
        const blob = new Blob([bytes], { type: 'application/zip' })

        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = this.servicePackageData.filename || `${this.form.serviceName}_mcp_service.zip`

        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 释放URL对象
        window.URL.revokeObjectURL(url)

        this.$message.success('服务包下载成功')
      } catch (error) {
        console.error('下载服务包失败:', error)
        this.$message.error('下载服务包失败')
      }
    },
    // 上传微服务（微服务直接预发布）
    async uploadService() {
      if (!this.form.serviceName) {
        this.$message.error('请填写微服务名称！')
        return
      }

      if (this.uploadFiles.length === 0) {
        this.$message.error('请选择程序文件！')
        return
      }

      this.uploadServiceLoading = true

      try {
        const data = {
          name: this.form.serviceName,
          type: 'atomic',
          serverType: this.form.serverType,
          domain: this.verticalType,
          industry: this.programInfo.industry,
          scenario: this.programInfo.scenario,
          technology: this.programInfo.technology,
          netWork: 'bridge',
          port: '0.0.0.0:8080/TCP → 0.0.0.0:8080',
          volume: '/var/opt/service/data',
          status: 'deploying',
          number: 0,
          norm: [],
          source: {
            popoverTitle: '可信云技术服务溯源',
            companyName: '复旦大学课题组',
            companyAddress: '上海市杨浦区邯郸路220号',
            companyContact: '021-65642222',
            companyIntroduce: '课题五',
            msIntroduce: `${store.getters.nickname}发布的微服务。`,
            companyScore: 5,
            msScore: 5
          }
        }
        const response = await createService(data)
        if (response && response.status === 'success') {
          this.$message.success('预发布成功！部署完成后可进行技术评测')
          this.uploadServiceLoading = false
          this.resetForm()
        } else {
          this.$message.error(response?.message || '预发布失败')
        }
      } catch (error) {
        console.error('预发布微服务失败:', error)
        this.$message.error('预发布异常，请稍后重试！')
      } finally {
        this.uploadServiceLoading = false
      }
    },
    closeAgentPanel() {
      this.showAgentPanel = false
    },

    // 重置表单
    resetForm() {
      this.form = {
        serverType: 'mcp',
        serviceName: undefined
      }
      this.programInfo = {
        industry: undefined,
        scenario: undefined,
        technology: undefined
      }
      this.programFiles = []
      this.configFiles = []
      this.uploadFiles = []
      this.uploadConfigFiles = []
      this.options = null
      this.programJson = null
    },

    handleSubmitTypeChange() {
      this.resetForm()
      this.mcpServerInfo.show = false
      this.publishProgress.show = false
    }
  },
  watch: {
    // 监听垂直领域类型变化，重新加载数据
    verticalType: {
      handler(newVal) {
        if (newVal) {
          this.initData()
          this.resetForm()
        }
      },
      immediate: false
    }
  }
}
</script>

<style lang="less" scoped>
.ant-form-item {
  margin-bottom: 0;
}
.list-articles-trigger {
  margin-left: 12px;
}
.g6-x {
  width: 100%;
  height: 300px;
}

// 发布步骤样式
.publish-steps {
  .step-item {
    position: relative;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background: #fafafa;
    transition: all 0.3s;

    &.active {
      border-color: #1890ff;
      background: #e6f7ff;
    }

    &.completed {
      border-color: #52c41a;
      background: #f6ffed;
    }

    &.error {
      border-color: #f5222d;
      background: #fff1f0;
    }

    .step-header {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;

      &:hover {
        opacity: 0.8;
      }

      .step-indicator {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid #d9d9d9;
        flex-shrink: 0;

        .step-number {
          font-size: 14px;
          font-weight: 600;
          color: #666;
        }

        .icon-completed {
          font-size: 20px;
          color: #52c41a;
        }

        .icon-loading {
          font-size: 20px;
          color: #1890ff;
        }

        .icon-error {
          font-size: 20px;
          color: #f5222d;
        }
      }

      .step-content {
        flex: 1;
        min-width: 0;

        .step-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .step-description {
          font-size: 14px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .expand-icon {
        font-size: 16px;
        color: #999;
        margin-left: 8px;
        transition: transform 0.3s;
      }
    }

    // Agent步骤列表（第二级）
    .agent-steps {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e8e8e8;
      max-height: 400px;
      overflow-y: auto;

      .agent-step-item {
        padding: 10px 12px;
        margin-bottom: 8px;
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.1);
        }

        .agent-step-header {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;

          .agent-step-number {
            font-weight: 600;
            color: #1890ff;
            margin-right: 8px;
            white-space: nowrap;
          }

          .agent-step-summary {
            flex: 1;
            font-size: 14px;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .expand-icon-small {
            font-size: 14px;
            color: #999;
            margin-left: 8px;
          }
        }

        // Agent步骤详情（第三级）
        .agent-step-details {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;

          .detail-section {
            margin-bottom: 12px;

            &:last-child {
  margin-bottom: 0;
}

            .detail-label {
              font-weight: 600;
              font-size: 13px;
              margin-bottom: 6px;
              color: #333;
            }

            .detail-content {
              padding: 8px 12px;
              border-radius: 4px;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
              word-break: break-all;
              max-height: 200px;
              overflow-y: auto;
            }

            &.thought .detail-content {
              background: #f0f7ff;
              border-left: 3px solid #1890ff;
            }

            &.action .detail-content {
              background: #fff5e6;
              border-left: 3px solid #fa8c16;
            }

            &.observation .detail-content {
              background: #f0fff0;
              border-left: 3px solid #52c41a;
            }
          }
        }
      }
    }

    // 无Agent的简单描述
    .simple-description {
      margin-top: 12px;
      padding: 12px;
      background: #fff;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
  }
}
</style>
