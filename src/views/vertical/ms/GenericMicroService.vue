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

    <!-- 想定模板快速选择 -->
    <a-card v-if="submitType === 'algorithm'" :bordered="false" size="small" style="margin-top: 10px;">
      <div slot="title"><a-icon type="appstore" style="margin-right: 8px;" />场景模板（可选）</div>
      <div class="template-grid">
        <div
          v-for="tpl in packagingTemplates"
          :key="tpl.key"
          :class="['template-card', { active: selectedTemplate === tpl.key }]"
          :style="{ '--tpl-color': tpl.color }"
          @click="selectTemplate(tpl)"
        >
          <a-icon :type="tpl.icon" class="template-icon" />
          <div class="template-label">{{ tpl.label }}</div>
          <div class="template-desc">{{ tpl.desc }}</div>
        </div>
      </div>
    </a-card>

    <!-- MCP服务配置 -->
    <a-card v-if="submitType === 'algorithm'" :bordered="false" size="small" title="想定式封装配置">
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
            <a-col :span="10">
              <a-form-item label="服务描述">
                <a-input v-model="form.serviceDesc" placeholder="描述服务的核心功能和用途" />
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="目标用户">
                <a-select v-model="form.targetUser" placeholder="请选择" allow-clear>
                  <a-select-option v-for="item in targetUserOptions" :key="item.code" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="5">
              <a-form-item label="部署规格">
                <a-select v-model="form.deploySpec" placeholder="请选择">
                  <a-select-option v-for="item in deploySpecOptions" :key="item.code" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
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
                  icon="eye"
                  @click="showIntentPreview = true"
                  :disabled="autoPublishDisabled"
                >
                  预览封装意图
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
    <!-- 封装意图预览 -->
    <a-card v-if="showIntentPreview && !publishProgress.show" :bordered="false" style="margin-top: 10px;" class="intent-preview-card">
      <div slot="title">
        <a-icon type="bulb" theme="twoTone" two-tone-color="#faad14" />
        <span style="margin-left: 8px;">封装意图确认</span>
      </div>
      <div class="intent-body">
        <div class="intent-text">{{ intentPreviewText }}</div>
        <a-divider style="margin: 16px 0;" />
        <div style="text-align: center;">
          <a-button style="margin-right: 12px;" @click="showIntentPreview = false">
            <a-icon type="edit" /> 返回修改
          </a-button>
          <a-button
            type="primary"
            icon="rocket"
            :loading="uploadProgramLoading"
            @click="confirmAndPublish"
          >
            确认并开始封装
          </a-button>
        </div>
      </div>
    </a-card>

    <!-- 发布进度 -->
    <a-card v-if="publishProgress.show" :bordered="false" style="margin-top: 10px;">
      <div slot="title">
        <a-icon type="loading" v-if="publishProgress.status !== 'finish' && publishProgress.status !== 'error'" />
        <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" v-else-if="publishProgress.status === 'finish'" />
        <a-icon type="close-circle" theme="twoTone" two-tone-color="#f5222d" v-else />
        <span style="margin-left: 8px;">发布进度</span>
        <span v-if="publishProgress.status !== 'finish' && publishProgress.status !== 'error'" style="margin-left: 12px; font-size: 13px; color: #999; font-weight: normal;">
          {{ publishProgress.current + 1 }} / {{ publishProgress.steps.length }}
        </span>
      </div>
      <template slot="extra">
        <a-button
          v-if="publishProgress.status !== 'finish' && publishProgress.status !== 'error'"
          size="small"
          @click="cancelPublish"
          style="color: #f5222d; border-color: #f5222d;"
        >
          <a-icon type="stop" /> 取消
        </a-button>
        <a-button
          v-if="publishProgress.status === 'error'"
          type="primary"
          size="small"
          @click="onAutoPublish"
        >
          <a-icon type="redo" /> 重新发布
        </a-button>
      </template>

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
                  <div class="detail-label">💭 AI 思考</div>
                  <div class="detail-content">{{ agentStep.thought }}</div>
                </div>
                <div v-if="agentStep.toolName" class="detail-section action">
                  <div class="detail-label">⚙️ 执行操作</div>
                  <div class="detail-content">
                    <a-tag color="purple">{{ agentStep.toolName }}</a-tag>
                    <span v-if="agentStep.toolArgs.command" class="tool-args-code">{{ agentStep.toolArgs.command }}</span>
                    <span v-else-if="agentStep.toolArgs.file_path" class="tool-args-file">
                      <a-icon type="file" /> {{ agentStep.toolArgs.file_path.split('/').pop() }}
                    </span>
                  </div>
                </div>
                <div v-else-if="agentStep.action && agentStep.action !== '没有工具调用'" class="detail-section action">
                  <div class="detail-label">⚙️ 行动</div>
                  <div class="detail-content">{{ agentStep.action }}</div>
                </div>
                <div v-if="agentStep.action_result" class="detail-section observation">
                  <div class="detail-label">📋 执行结果</div>
                  <div class="detail-content detail-content-code">{{ truncateResult(agentStep.action_result, 500) }}</div>
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
    <a-card v-if="options" :bordered="false" style="margin-top: 10px;" :class="{ 'chart-fullscreen': isChartFullscreen }">
      <div slot="title">
        <a-icon type="apartment" style="margin-right: 8px; color: #722ed1;" />
        MCP能力依赖图
        <a-tag color="purple" style="margin-left: 12px; font-weight: normal;">
          {{ programJson ? programJson.nodes.length : 0 }} 节点 · {{ programJson ? programJson.edges.length : 0 }} 连接
        </a-tag>
      </div>
      <template slot="extra">
        <a-tooltip :title="isChartFullscreen ? '退出全屏' : '全屏查看'">
          <a-button type="link" size="large" @click="toggleChartFullscreen">
            <a-icon :type="isChartFullscreen ? 'fullscreen-exit' : 'fullscreen'" style="font-size: 18px;" />
          </a-button>
        </a-tooltip>
      </template>
      <div class="chart-container">
        <v-chart
          ref="mcpChart"
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

      <div class="mcp-stats-row">
        <div class="mcp-stat-item" style="--accent: #722ed1;">
          <div class="mcp-stat-value">{{ mcpServerInfo.tools.length }}</div>
          <div class="mcp-stat-label"><a-icon type="api" /> Tools</div>
        </div>
        <div class="mcp-stat-item" style="--accent: #52c41a;">
          <div class="mcp-stat-value">{{ mcpServerInfo.resources.length }}</div>
          <div class="mcp-stat-label"><a-icon type="database" /> Resources</div>
        </div>
        <div class="mcp-stat-item" style="--accent: #1890ff;">
          <div class="mcp-stat-value">{{ mcpServerInfo.prompts.length }}</div>
          <div class="mcp-stat-label"><a-icon type="message" /> Prompts</div>
        </div>
      </div>

      <a-tabs default-active-key="tools">
        <a-tab-pane key="tools" tab="Tools">
          <template slot="tab">
            <a-badge :count="mcpServerInfo.tools.length" :overflow-count="99">
              <span><a-icon type="api" /> Tools</span>
            </a-badge>
          </template>
          <a-row :gutter="[16, 16]">
            <a-col :span="8" v-for="item in mcpServerInfo.tools" :key="item.name">
              <div class="mcp-tool-card">
                <div class="mcp-tool-card-header">
                  <span class="mcp-tool-card-icon"><a-icon type="api" /></span>
                  <span class="mcp-tool-card-name">{{ item.name }}</span>
                </div>
                <div class="mcp-tool-card-desc">{{ item.description || '无描述' }}</div>
                <div class="mcp-tool-card-tags">
                  <a-tag color="green"><a-icon type="login" /> {{ item.input }}</a-tag>
                  <a-tag color="blue"><a-icon type="logout" /> {{ item.output }}</a-tag>
                </div>
              </div>
            </a-col>
          </a-row>
          <a-empty v-if="mcpServerInfo.tools.length === 0" description="未识别到Tools" />
        </a-tab-pane>

        <a-tab-pane key="resources" tab="Resources">
          <template slot="tab">
            <a-badge :count="mcpServerInfo.resources.length" :overflow-count="99">
              <span><a-icon type="database" /> Resources</span>
            </a-badge>
          </template>
          <a-row :gutter="[16, 16]">
            <a-col :span="12" v-for="item in mcpServerInfo.resources" :key="item.name">
              <div class="mcp-resource-card">
                <a-icon type="database" class="mcp-resource-icon" />
                <div>
                  <div style="font-weight: 600;">{{ item.name }}</div>
                  <div style="color: #888; font-size: 13px;">{{ item.description || '无描述' }}</div>
                </div>
              </div>
            </a-col>
          </a-row>
          <a-empty v-if="mcpServerInfo.resources.length === 0" description="未识别到Resources" />
        </a-tab-pane>

        <a-tab-pane key="prompts" tab="Prompts">
          <template slot="tab">
            <a-badge :count="mcpServerInfo.prompts.length" :overflow-count="99">
              <span><a-icon type="message" /> Prompts</span>
            </a-badge>
          </template>
          <a-row :gutter="[16, 16]">
            <a-col :span="12" v-for="item in mcpServerInfo.prompts" :key="item.name">
              <div class="mcp-resource-card">
                <a-icon type="message" class="mcp-prompt-icon" />
                <div>
                  <div style="font-weight: 600;">{{ item.name }}</div>
                  <div style="color: #888; font-size: 13px;">{{ item.description || '无描述' }}</div>
                </div>
              </div>
            </a-col>
          </a-row>
          <a-empty v-if="mcpServerInfo.prompts.length === 0" description="未识别到Prompts" />
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
        serviceName: undefined,
        serviceDesc: '',
        targetUser: undefined,
        deploySpec: 'standard'
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
      programJson: null,
      isChartFullscreen: false,
      targetUserOptions: [
        { code: 'analyst', text: '业务分析师' },
        { code: 'developer', text: '开发工程师' },
        { code: 'ops', text: '运维人员' },
        { code: 'researcher', text: '科研人员' },
        { code: 'manager', text: '管理决策者' }
      ],
      deploySpecOptions: [
        { code: 'lightweight', text: '轻量级（适合测试）' },
        { code: 'standard', text: '标准容器（推荐）' },
        { code: 'ha', text: '高可用集群' }
      ],
      packagingTemplates: [
        { key: 'data_analysis', icon: 'bar-chart', label: '数据分析服务', color: '#1890ff', desc: '数据分析与可视化', serviceName: '数据分析服务', serviceDesc: '提供数据分析、统计计算和可视化能力', targetUser: 'analyst', deploySpec: 'standard' },
        { key: 'model_inference', icon: 'robot', label: '模型推理服务', color: '#722ed1', desc: '模型在线推理', serviceName: '模型推理服务', serviceDesc: '封装训练好的模型为在线推理服务', targetUser: 'developer', deploySpec: 'standard' },
        { key: 'report_gen', icon: 'file-text', label: '报告生成服务', color: '#52c41a', desc: '自动生成报告', serviceName: '报告生成服务', serviceDesc: '自动生成业务分析报告与文档', targetUser: 'analyst', deploySpec: 'lightweight' },
        { key: 'data_pipeline', icon: 'swap', label: '数据处理管道', color: '#fa8c16', desc: '数据 ETL 处理', serviceName: '数据处理管道', serviceDesc: '构建自动化数据清洗、转换和加载流水线', targetUser: 'developer', deploySpec: 'standard' }
      ],
      selectedTemplate: null,
      showIntentPreview: false,
      editingTools: []
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
    },
    intentPreviewText() {
      const fileName = this.uploadFiles.length > 0 ? this.uploadFiles[0].name : '未选择文件'
      const industry = this.getIndustryText(this.programInfo.industry)
      const scenario = this.getScenarioText(this.programInfo.scenario)
      const technology = this.getTechnologyText(this.programInfo.technology)
      const targetUser = (this.targetUserOptions.find(o => o.code === this.form.targetUser) || {}).text || '未指定'
      const deploySpec = (this.deploySpecOptions.find(o => o.code === this.form.deploySpec) || {}).text || '未指定'

      let parts = []
      parts.push(`将上传的代码「${fileName}」封装为`)
      let scopeParts = []
      if (industry !== '未设置') scopeParts.push(`${industry}行业`)
      if (scenario !== '未设置') scopeParts.push(`${scenario}场景`)
      if (scopeParts.length > 0) parts.push(`面向${scopeParts.join('、')}的`)
      parts.push('MCP 微服务。')

      let info = parts.join('')
      info += `\n\n• 服务名称：${this.form.serviceName || '未填写'}`
      if (this.form.serviceDesc) info += `\n• 服务描述：${this.form.serviceDesc}`
      info += `\n• 目标用户：${targetUser}`
      if (technology !== '未设置') info += `\n• 技术路线：${technology}`
      info += `\n• 部署规格：${deploySpec}`
      info += '\n\nAgent 将基于以上想定信息，自动完成代码解析、MCP 能力识别、Server 代码生成与 Docker 容器化封装。'
      return info
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

        this.publishProgress.status = 'finish'
        this.$message.success('服务发布成功！')
        this.showMCPServerInfo()
      } catch (error) {
        console.error('自动发布失败:', error)
        this.publishProgress.status = 'error'
        this.$message.error('发布失败：' + (error.message || error))
      } finally {
        this.uploadProgramLoading = false
      }
    },

    updatePublishProgress(step, status, description) {
      this.publishProgress.current = step
      this.publishProgress.status = status
      this.publishProgress.steps[step].description = description
      this.publishProgress.steps.forEach((s, i) => {
        s.expanded = (i === step)
      })
    },

    toggleChartFullscreen() {
      this.isChartFullscreen = !this.isChartFullscreen
      this.$nextTick(() => {
        if (this.$refs.mcpChart) {
          this.$refs.mcpChart.resize()
        }
      })
    },

    cancelPublish() {
      this.publishProgress.status = 'error'
      this.publishProgress.steps[this.publishProgress.current].description = '已取消'
      this.uploadProgramLoading = false
      this.agentIsRunning = false
      this.$message.warning('发布已取消')
    },

    selectTemplate(tpl) {
      if (this.selectedTemplate === tpl.key) {
        this.selectedTemplate = null
        return
      }
      this.selectedTemplate = tpl.key
      this.form.serviceName = tpl.serviceName
      this.form.serviceDesc = tpl.serviceDesc
      this.form.targetUser = tpl.targetUser
      this.form.deploySpec = tpl.deploySpec
    },

    confirmAndPublish() {
      this.showIntentPreview = false
      this.onAutoPublish()
    },


    addAgentStep(stepIndex, agentData) {
      if (!this.publishProgress.steps[stepIndex]) {
        console.error('步骤索引无效:', stepIndex)
        return
      }

      if (!this.publishProgress.steps[stepIndex].agentSteps) {
        this.$set(this.publishProgress.steps[stepIndex], 'agentSteps', [])
      }

      const parsed = this.parseToolCall(agentData.action)
      const agentStep = {
        step: agentData.step || (this.publishProgress.steps[stepIndex].agentSteps.length + 1),
        thought: agentData.thought || '',
        action: agentData.action || '',
        action_result: agentData.action_result || '',
        toolName: parsed ? parsed.toolName : '',
        toolArgs: parsed ? parsed.args : {},
        friendlyAction: parsed ? this.getToolFriendlyDescription(parsed.toolName, parsed.args) : '',
        expanded: false
      }
      this.publishProgress.steps[stepIndex].agentSteps.push(agentStep)
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

    getAgentStepSummary(agentStep) {
      if (agentStep.friendlyAction) {
        return agentStep.friendlyAction
      }
      if (agentStep.thought && agentStep.thought.length > 0) {
        const firstLine = agentStep.thought.split('\n')[0].trim()
        const preview = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
        return `💭 ${preview}`
      }
      if (agentStep.action_result) {
        return '查看执行结果'
      }
      return '处理中...'
    },

    parseToolCall(action) {
      if (!action || !action.startsWith('调用工具')) return null
      const nameMatch = action.match(/name='(\w+)'/)
      if (!nameMatch) return null
      const rawName = nameMatch[1]
      const knownSuffixes = ['bash', 'cmd', 'terminate', 'file_saver', 'json_saver']
      let toolName = rawName
      for (const suffix of knownSuffixes) {
        if (rawName.endsWith(suffix)) { toolName = suffix; break }
      }
      const argsMatch = action.match(/arguments='(\{[^']*\})'/)
      let args = {}
      if (argsMatch) {
        try { args = JSON.parse(argsMatch[1]) } catch (e) { /* ignore */ }
      }
      return { toolName, args }
    },

    getToolFriendlyDescription(toolName, args) {
      const t = toolName || ''
      if (t.endsWith('bash') || t.endsWith('cmd')) {
        const cmd = args.command || ''
        if (cmd.match(/\b(ls|find|tree|dir)\b/)) return '📂 浏览项目文件结构'
        if (cmd.match(/\b(cat|head|tail|more|less)\b/)) return '📄 读取文件内容'
        if (cmd.includes('pip install') || cmd.includes('npm install')) return '📦 安装依赖包'
        if (cmd.includes('python') && cmd.includes('test')) return '🧪 运行测试'
        if (cmd.includes('python')) return '🐍 运行 Python 脚本'
        if (cmd.match(/\bmkdir\b/)) return '📁 创建目录'
        if (cmd.match(/\b(cp|mv)\b/)) return '📋 整理文件'
        if (cmd.includes('docker')) return '🐳 配置 Docker 环境'
        if (cmd.match(/\b(grep|rg|awk|sed)\b/)) return '🔍 搜索代码内容'
        if (cmd.match(/\b(cd|pwd)\b/)) return '📂 切换工作目录'
        if (cmd.match(/\b(wc|stat|file)\b/)) return '📄 查看文件信息'
        return '⌨️ 执行终端命令'
      }
      if (t.endsWith('file_saver')) {
        const f = (args.file_path || '').split('/').pop()
        if (f === 'server.py') return '🔧 生成 MCP Server 入口文件'
        if (f === 'Dockerfile') return '🐳 生成 Dockerfile 容器配置'
        if (f.includes('docker-compose')) return '🐳 生成 Docker Compose 编排文件'
        if (f === 'requirements.txt') return '📦 生成 Python 依赖清单'
        if (f === 'README.md') return '📝 生成项目说明文档'
        if (f.endsWith('.py')) return `🐍 生成 Python 文件: ${f}`
        return `💾 生成文件: ${f}`
      }
      if (t.endsWith('json_saver')) {
        const f = (args.file_path || '').split('/').pop()
        if (f === 'function.json') return '📊 保存函数依赖分析结果'
        return `📊 保存分析数据: ${f}`
      }
      if (t.endsWith('terminate')) {
        return '✅ 任务完成'
      }
      return '⚙️ 正在处理...'
    },

    truncateResult(text, maxLen) {
      if (!text || text.length <= maxLen) return text
      return text.substring(0, maxLen) + '\n... (已截断)'
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
      this.editingTools = JSON.parse(JSON.stringify(this.mcpServerInfo.tools))
    },

    setMCPChart() {
      if (!this.programJson || !this.programJson.nodes || !this.programJson.edges) {
        console.error('程序Json数据不完整，无法渲染图表', this.programJson)
        return
      }

      const json = this.programJson
      const nodeMap = {}
      json.nodes.forEach(node => { nodeMap[node.id] = node })

      const typeColors = {
        tool: { main: '#722ed1', light: 'rgba(114, 46, 209, 0.12)' },
        resource: { main: '#52c41a', light: 'rgba(82, 196, 26, 0.12)' },
        prompt: { main: '#1890ff', light: 'rgba(24, 144, 255, 0.12)' }
      }
      const categoryMap = { tool: 0, resource: 1, prompt: 2 }

      const processedNodes = json.nodes.map(node => {
        const mcpType = node.mcpType || 'tool'
        const colors = typeColors[mcpType] || typeColors.tool
        return {
          id: node.id,
          name: node.label,
          symbolSize: 60,
          category: categoryMap[mcpType] ?? 0,
          label: {
            show: true,
            position: 'inside',
            fontSize: 11,
            fontWeight: 'bold',
            color: '#fff',
            overflow: 'truncate',
            ellipsis: '...',
            width: 52
          },
          itemStyle: {
            color: colors.main,
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 12,
            shadowColor: colors.light
          }
        }
      })

      const processedEdges = json.edges.map(edge => ({
        source: edge.sourceID,
        target: edge.targetID,
        lineStyle: { color: '#c0c0c0', curveness: 0.3, width: 1.5 },
        symbol: ['none', 'arrow'],
        symbolSize: [0, 12]
      }))

      const categories = [
        { name: 'Tool', itemStyle: { color: '#722ed1' } },
        { name: 'Resource', itemStyle: { color: '#52c41a' } },
        { name: 'Prompt', itemStyle: { color: '#1890ff' } }
      ]

      this.options = {
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        legend: {
          data: categories.map(c => c.name),
          top: 8,
          left: 'center',
          textStyle: { fontSize: 13, color: '#666' },
          icon: 'circle',
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 32
        },
        series: [{
          type: 'graph',
          layout: 'force',
          categories: categories,
          data: processedNodes,
          edges: processedEdges,
          force: {
            repulsion: 350,
            edgeLength: [100, 200],
            gravity: 0.08,
            layoutAnimation: true
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: { width: 3, color: '#722ed1' }
          },
          roam: true,
          draggable: true,
          lineStyle: { width: 1.5, curveness: 0.3, opacity: 0.6 }
        }],
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: '#e8e8e8',
          borderWidth: 1,
          padding: [12, 16],
          textStyle: { color: '#333', fontSize: 13 },
          extraCssText: 'box-shadow: 0 4px 16px rgba(0,0,0,0.12); border-radius: 8px;',
          formatter: function (params) {
            if (params.dataType === 'edge') return null
            const node = nodeMap[params.data.id]
            if (!node) return params.name
            const mcpType = node.mcpType || 'tool'
            const colors = typeColors[mcpType] || typeColors.tool
            const typeText = mcpType === 'resource' ? 'Resource' : mcpType === 'prompt' ? 'Prompt' : 'Tool'
            return `<div style="min-width: 180px;">
              <div style="display:flex;align-items:center;margin-bottom:8px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors.main};margin-right:8px;"></span>
                <strong style="font-size:15px;">${node.label}</strong>
                <span style="margin-left:8px;padding:2px 10px;border-radius:10px;font-size:11px;background:${colors.light};color:${colors.main};font-weight:600;">${typeText}</span>
              </div>
              <div style="color:#666;font-size:12px;line-height:2;">
                <div><b>输入:</b> ${node.input}</div>
                <div><b>输出:</b> ${node.output}</div>
                ${node.description ? '<div><b>描述:</b> ' + node.description + '</div>' : ''}
              </div>
            </div>`
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
        serviceName: undefined,
        serviceDesc: '',
        targetUser: undefined,
        deploySpec: 'standard'
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
      this.selectedTemplate = null
      this.showIntentPreview = false
      this.editingTools = []
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

// 图表容器
.chart-container {
  width: 100%;
  height: 500px;
  transition: height 0.3s ease;
}
.chart-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  margin: 0 !important;
  border-radius: 0 !important;
  .chart-container {
    height: calc(100vh - 80px);
  }
}

// MCP 统计行
.mcp-stats-row {
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 20px 0;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #f9f0ff 0%, #e6f7ff 50%, #f6ffed 100%);
  border-radius: 8px;
  .mcp-stat-item {
    text-align: center;
    .mcp-stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--accent, #333);
      line-height: 1.2;
    }
    .mcp-stat-label {
      font-size: 14px;
      color: #888;
      margin-top: 4px;
    }
  }
}

// MCP Tool 卡片
.mcp-tool-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  transition: all 0.3s ease;
  background: #fff;
  &:hover {
    border-color: #722ed1;
    box-shadow: 0 4px 12px rgba(114, 46, 209, 0.1);
    transform: translateY(-2px);
  }
  .mcp-tool-card-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    .mcp-tool-card-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: linear-gradient(135deg, #722ed1, #9254de);
      color: #fff;
      font-size: 14px;
      margin-right: 10px;
      flex-shrink: 0;
    }
    .mcp-tool-card-name {
      font-weight: 600;
      font-size: 14px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .mcp-tool-card-desc {
    font-size: 13px;
    color: #888;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
  }
  .mcp-tool-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}

// 场景模板网格
.template-grid {
  display: flex;
  gap: 16px;
  .template-card {
    flex: 1;
    padding: 16px;
    border: 2px solid #f0f0f0;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fafafa;
    &:hover {
      border-color: var(--tpl-color, #1890ff);
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }
    &.active {
      border-color: var(--tpl-color, #1890ff);
      background: linear-gradient(135deg, fade(#1890ff, 5%) 0%, fade(#722ed1, 5%) 100%);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .template-icon {
      font-size: 28px;
      color: var(--tpl-color, #1890ff);
      margin-bottom: 8px;
    }
    .template-label {
      font-weight: 600;
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
    }
    .template-desc {
      font-size: 12px;
      color: #999;
    }
  }
}

// 封装意图预览
.intent-preview-card {
  .intent-body {
    .intent-text {
      padding: 20px 24px;
      background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
      border: 1px solid #ffe58f;
      border-radius: 8px;
      font-size: 14px;
      line-height: 2;
      color: #333;
      white-space: pre-line;
    }
  }
}

// 服务预览
// MCP Resource / Prompt 卡片
.mcp-resource-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s ease;
  &:hover {
    border-color: #52c41a;
    box-shadow: 0 2px 8px rgba(82, 196, 26, 0.1);
  }
  .mcp-resource-icon {
    font-size: 22px;
    color: #52c41a;
  }
  .mcp-prompt-icon {
    font-size: 22px;
    color: #1890ff;
  }
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
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 8px;
              .tool-args-code {
                font-family: 'Consolas', 'Monaco', 'SF Mono', monospace;
                font-size: 12px;
                background: rgba(0, 0, 0, 0.06);
                padding: 2px 8px;
                border-radius: 4px;
                color: #333;
                word-break: break-all;
              }
              .tool-args-file {
                font-size: 13px;
                color: #555;
              }
            }

            .detail-content-code {
              font-family: 'Consolas', 'Monaco', 'SF Mono', monospace;
              font-size: 12px;
              background: #1e1e1e !important;
              color: #d4d4d4 !important;
              border-left: 3px solid #52c41a !important;
              border-radius: 4px;
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
