<template>
  <div class="clinical-demo">
    <div class="demo-heading">
      <div>
        <div class="demo-eyebrow">临床医疗算法模型众智工场</div>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <a-tag color="orange">界面演示 · 示例数据</a-tag>
    </div>
    <a-alert
      show-icon
      type="info"
      message="此页用于展示模块布局；示例记录和状态并非真实业务数据。服务发布、仿真、评测和运维操作需要正式后端。"
      class="demo-notice"
    />

    <template v-if="module === 'overview'">
      <a-row :gutter="16">
        <a-col v-for="metric in metrics" :key="metric.label" :xs="24" :sm="12" :lg="6">
          <a-card :bordered="false" class="metric-card">
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-note">{{ metric.note }}</div>
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16" class="demo-row">
        <a-col :xs="24" :lg="15">
          <a-card title="临床算法工作流" :bordered="false">
            <a-steps :current="2" size="small" class="workflow-steps">
              <a-step title="描述临床需求" description="任务、人群、输入与终点" />
              <a-step title="生成算法模型" description="规范、源码与依据" />
              <a-step title="验证与使用" description="输入检查和结果说明" />
              <a-step title="服务化集成" description="MCP 与元应用" />
            </a-steps>
            <a-divider />
            <a-button type="primary" @click="go('/vertical-scenario-dev/clinical')">进入想定式开发</a-button>
            <a-button class="button-gap" @click="go('/clinical-algorithm-use')">查看模型使用</a-button>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="9">
          <a-card title="待办事项（示例）" :bordered="false">
            <a-list :data-source="todos" size="small">
              <a-list-item slot="renderItem" slot-scope="item"><a-icon type="clock-circle" class="todo-icon" />{{ item }}</a-list-item>
            </a-list>
          </a-card>
        </a-col>
      </a-row>
    </template>

    <template v-else-if="module === 'resources'">
      <a-card :bordered="false">
        <div class="toolbar">
          <a-input-search v-model="search" placeholder="搜索算法模型名称" allow-clear class="search-field" />
          <a-select v-model="resourceType" class="select-field">
            <a-select-option value="all">全部类型</a-select-option>
            <a-select-option value="generated">想定式生成</a-select-option>
            <a-select-option value="sample">演示样例</a-select-option>
          </a-select>
          <a-button type="primary" @click="go('/vertical-scenario-dev/clinical')">生成新模型</a-button>
        </div>
        <a-table :columns="resourceColumns" :data-source="visibleResources" row-key="id" :pagination="{ pageSize: 6 }">
          <template slot="status" slot-scope="status"><a-tag :color="status === '浏览器本地' ? 'blue' : 'gold'">{{ status }}</a-tag></template>
          <template slot="action" slot-scope="text, record">
            <a-button v-if="record.kind === 'generated'" type="link" @click="go(`/clinical-algorithm-use?id=${record.id}`)">查看模型</a-button>
            <span v-else class="muted">仅供界面演示</span>
          </template>
        </a-table>
      </a-card>
    </template>

    <template v-else-if="module === 'publish'">
      <a-row :gutter="16">
        <a-col :xs="24" :lg="16">
          <a-card title="原子微服务发布配置（演示）" :bordered="false">
            <a-form layout="vertical">
              <a-form-item label="提交类型"><a-radio-group v-model="publishType"><a-radio-button value="algorithm">算法模型</a-radio-button><a-radio-button value="microservice">微服务</a-radio-button></a-radio-group></a-form-item>
              <a-row :gutter="16">
                <a-col :xs="24" :md="12"><a-form-item label="服务名称"><a-input v-model="serviceName" placeholder="例如：肾功能评估服务" /></a-form-item></a-col>
                <a-col :xs="24" :md="12"><a-form-item label="临床专科"><a-select v-model="specialty"><a-select-option value="nephrology">肾脏内科</a-select-option><a-select-option value="cardiology">心血管内科</a-select-option><a-select-option value="emergency">急诊医学</a-select-option></a-select></a-form-item></a-col>
              </a-row>
              <a-form-item label="服务说明"><a-textarea v-model="serviceDescription" :rows="3" placeholder="说明输入、输出和适用范围" /></a-form-item>
              <a-form-item label="算法来源"><a-radio-group v-model="algorithmSource"><a-radio value="local">本地上传</a-radio><a-radio value="platform">平台算法模型</a-radio></a-radio-group></a-form-item>
              <a-form-item v-if="algorithmSource === 'platform'" label="选择浏览器本地模型">
                <a-select v-model="selectedModelId" placeholder="选择已生成的模型" allow-clear>
                  <a-select-option v-for="model in localModels" :key="model.id" :value="model.id">{{ model.name }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item v-else label="程序文件"><a-button icon="upload" disabled>正式部署后上传</a-button></a-form-item>
              <a-button type="primary" disabled>验证并发布服务</a-button>
            </a-form>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="8">
          <a-card title="发布流程" :bordered="false">
            <a-steps direction="vertical" size="small" :current="1">
              <a-step title="提交算法" description="选择源码和输入输出规范" />
              <a-step title="封装 MCP 服务" description="映射工具参数与返回值" />
              <a-step title="验证与发布" description="部署、测试和登记" />
            </a-steps>
          </a-card>
        </a-col>
      </a-row>
    </template>

    <template v-else-if="module === 'meta-app'">
      <a-row :gutter="16">
        <a-col :xs="24" :lg="7"><a-card title="可用能力（示例）" :bordered="false"><a-list :data-source="capabilities" size="small"><a-list-item slot="renderItem" slot-scope="item"><a-icon type="api" class="capability-icon" />{{ item }}</a-list-item></a-list></a-card></a-col>
        <a-col :xs="24" :lg="17"><a-card title="临床随访元应用 · 仿真画布（示例）" :bordered="false">
          <div class="demo-canvas"><div class="canvas-node">患者指标输入</div><a-icon type="arrow-right" /><div class="canvas-node primary">评估智能体</div><a-icon type="arrow-right" /><div class="canvas-node">风险分层服务</div><a-icon type="arrow-right" /><div class="canvas-node">随访建议</div></div>
          <a-divider />
          <a-steps size="small" :current="1"><a-step title="服务选择" /><a-step title="智能体编排" /><a-step title="仿真验证" /><a-step title="应用交付" /></a-steps>
        </a-card></a-col>
      </a-row>
    </template>

    <template v-else-if="module === 'evaluation'">
      <a-card :bordered="false">
        <a-tabs v-model="evaluationTab">
          <a-tab-pane key="technical" tab="原子微服务技术评测">
            <a-row :gutter="16"><a-col :xs="24" :lg="12"><h3>待评测服务（示例）</h3><a-table :columns="evaluationColumns" :data-source="evaluationRows" row-key="id" :pagination="false" /></a-col><a-col :xs="24" :lg="12"><h3>评测指标</h3><a-checkbox-group :options="['输入规范完整性', '运行稳定性', '结果可解释性', '响应时间']" :default-value="['输入规范完整性', '结果可解释性']" /><a-divider /><a-alert type="warning" show-icon message="演示数据不能生成真实评测报告" /></a-col></a-row>
          </a-tab-pane>
          <a-tab-pane key="business" tab="元应用业务数据验证"><a-row :gutter="16"><a-col :xs="24" :lg="12"><h3>验证配置（示例）</h3><a-form layout="vertical"><a-form-item label="元应用"><a-input value="临床随访元应用" disabled /></a-form-item><a-form-item label="数据集"><a-select default-value="sample"><a-select-option value="sample">去标识化演示样本</a-select-option></a-select></a-form-item></a-form></a-col><a-col :xs="24" :lg="12"><h3>验证维度</h3><a-tag color="blue">任务完成率</a-tag><a-tag color="blue">规则一致性</a-tag><a-tag color="blue">结果可解释性</a-tag><a-empty description="正式部署后展示验证结果" /></a-col></a-row></a-tab-pane>
        </a-tabs>
      </a-card>
    </template>

    <template v-else-if="module === 'operation'">
      <a-row :gutter="16"><a-col :xs="24" :lg="8"><a-card title="运行概览（示例）" :bordered="false"><a-statistic title="演示服务" :value="3" /><a-divider /><a-badge status="success" text="示例状态：正常" /></a-card></a-col><a-col :xs="24" :lg="16"><a-card title="容器化服务状态（示例）" :bordered="false"><a-table :columns="operationColumns" :data-source="operationRows" row-key="id" :pagination="false"><template slot="state" slot-scope="state"><a-badge :status="state === '运行中' ? 'success' : 'default'" :text="state" /></template></a-table></a-card></a-col></a-row>
    </template>

    <template v-else-if="module === 'account'">
      <a-row :gutter="16"><a-col :xs="24" :lg="8"><a-card :bordered="false"><a-avatar size="large" icon="user" /><h3 class="account-title">演示访客</h3><p class="muted">当前预览版无需登录。正式部署后可管理个人资料、权限和消息。</p></a-card></a-col><a-col :xs="24" :lg="16"><a-card title="我的工作（当前浏览器）" :bordered="false"><a-descriptions bordered :column="1"><a-descriptions-item label="已生成模型">{{ localModels.length }} 个</a-descriptions-item><a-descriptions-item label="保存位置">当前浏览器本地存储</a-descriptions-item><a-descriptions-item label="共享与同步">需正式后端</a-descriptions-item></a-descriptions><a-button class="account-button" @click="go('/clinical-preview/resources')">查看我的模型</a-button></a-card></a-col></a-row>
    </template>
  </div>
</template>

<script>
import { listPreviewModels } from '@/utils/clinicalPreviewStore'

const sampleResources = [
  { id: 'sample-egfr', name: '成人肾小球滤过率评估', specialty: '肾脏内科', type: '公式模型', status: '演示样例', kind: 'sample' },
  { id: 'sample-score', name: '住院患者风险分层', specialty: '综合内科', type: '评分规则', status: '演示样例', kind: 'sample' },
  { id: 'sample-followup', name: '慢病随访分级建议', specialty: '全科医学', type: '临床规则', status: '演示样例', kind: 'sample' }
]

export default {
  name: 'ClinicalDemoModule',
  props: { module: { type: String, required: true } },
  data() {
    return {
      search: '',
resourceType: 'all',
publishType: 'algorithm',
specialty: 'nephrology',
      serviceName: '',
serviceDescription: '',
algorithmSource: 'platform',
selectedModelId: undefined,
      evaluationTab: 'technical',
localModels: [],
      todos: ['核对算法输入单位与适用人群', '检查生成源码和资料来源', '设计服务封装与仿真场景'],
      capabilities: ['肾功能计算服务', '风险分层服务', '随访规则服务', '结果解释智能体'],
      resourceColumns: [
        { title: '模型名称', dataIndex: 'name' }, { title: '临床专科', dataIndex: 'specialty' },
        { title: '类型', dataIndex: 'type' }, { title: '来源', dataIndex: 'status', scopedSlots: { customRender: 'status' } },
        { title: '操作', scopedSlots: { customRender: 'action' } }
      ],
      evaluationColumns: [
        { title: '服务名称', dataIndex: 'name' }, { title: '评测阶段', dataIndex: 'phase' }
      ],
      evaluationRows: [
        { id: 'ev-1', name: '肾功能计算服务', phase: '待配置' },
        { id: 'ev-2', name: '风险分层服务', phase: '待配置' }
      ],
      operationColumns: [
        { title: '服务名称', dataIndex: 'name' }, { title: '类型', dataIndex: 'type' },
        { title: '状态', dataIndex: 'state', scopedSlots: { customRender: 'state' } }
      ],
      operationRows: [
        { id: 'op-1', name: '肾功能计算服务', type: 'MCP 服务', state: '运行中' },
        { id: 'op-2', name: '随访建议智能体', type: '智能体', state: '运行中' },
        { id: 'op-3', name: '临床随访元应用', type: '元应用', state: '未部署' }
      ]
    }
  },
  computed: {
    title() {
      return {
        overview: '工作台与数据统计',
resources: '算法模型组件列表',
publish: '原子微服务发布',
        'meta-app': '元应用仿真构建',
evaluation: '技术评测与业务验证',
        operation: '运维管理',
account: '个人中心'
      }[this.module] || '临床演示'
    },
    description() {
      return {
        overview: '从临床需求到算法生成、服务化和应用验证的工作全貌。',
        resources: '统一查看生成的模型和临床算法资产。',
        publish: '将算法模型封装为可调用的原子微服务。',
        'meta-app': '将多个服务与智能体组合为临床场景应用。',
        evaluation: '展示服务技术评测与业务数据验证的配置界面。',
        operation: '查看服务状态与容器化运维布局。',
        account: '个人资料、工作成果和消息的入口。'
      }[this.module]
    },
    metrics() {
      return [
        { label: '浏览器已生成模型', value: this.localModels.length, note: '当前浏览器真实记录' },
        { label: '演示算法资产', value: 3, note: '示例数据' },
        { label: '演示服务', value: 3, note: '示例数据' },
        { label: '演示元应用', value: 1, note: '示例数据' }
      ]
    },
    visibleResources() {
      const local = this.localModels.map(model => ({
        id: model.id, name: model.name, specialty: '临床医疗', type: '想定式生成', status: '浏览器本地', kind: 'generated'
      }))
      return [...local, ...sampleResources].filter(item =>
        (this.resourceType === 'all' || item.kind === this.resourceType) &&
        item.name.includes(this.search.trim())
      )
    }
  },
  created() { this.refreshModels() },
  watch: { module() { this.refreshModels() } },
  methods: {
    refreshModels() { this.localModels = listPreviewModels() },
    go(path) { this.$router.push(path) }
  }
}
</script>

<style scoped>
.clinical-demo { max-width: 1500px; margin: 0 auto; }
.demo-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin: 4px 0 20px; }
.demo-heading h1 { font-size: 25px; font-weight: 600; margin: 4px 0 6px; }
.demo-heading p { color: #6b7280; margin: 0; }
.demo-eyebrow { color: #2f6fc2; font-size: 12px; letter-spacing: 1px; }
.demo-notice { margin-bottom: 18px; }
.metric-card { margin-bottom: 16px; }
.metric-label, .metric-note, .muted { color: #8c8c8c; }
.metric-value { font-size: 30px; color: #193a66; font-weight: 600; margin: 7px 0; }
.demo-row { margin-top: 4px; }
.workflow-steps { margin: 16px 0; }
.button-gap { margin-left: 8px; }
.todo-icon, .capability-icon { color: #2f6fc2; margin-right: 8px; }
.toolbar { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.search-field { width: 270px; }
.select-field { width: 145px; }
.demo-canvas { min-height: 250px; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; background: #f6f9fc; border: 1px dashed #aec9e6; border-radius: 8px; padding: 20px; }
.canvas-node { padding: 18px 14px; background: white; border: 1px solid #bdd0e2; border-radius: 6px; box-shadow: 0 2px 8px #18324d12; }
.canvas-node.primary { background: #e6f1ff; border-color: #69a7f0; color: #165aab; font-weight: 600; }
.account-title { margin-top: 12px; }
.account-button { margin-top: 16px; }
@media (max-width: 768px) { .demo-heading { flex-direction: column; } .search-field { width: 100%; } }
</style>
