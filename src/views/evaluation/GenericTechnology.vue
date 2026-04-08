<template>
  <page-header-wrapper :title="false">
    <a-row :gutter="24">
      <a-col :span="12">
        <a-card :bordered="false">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="12">
                <a-col :span="12">
                  <a-form-item label="名称">
                    <a-input v-model="queryParam.name" placeholder="输入名称以筛选" @change="handleSearch" allowClear />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="状态">
                    <a-select v-model="queryParam.status" @change="handleSearch">
                      <a-select-option value="all">全部</a-select-option>
                      <a-select-option v-for="(item, index) in statusDict" :key="index" :value="item.code">
                        {{ item.text }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <a-table
            ref="table"
            :columns="columns"
            :dataSource="filteredDataSource"
            :rowKey="record => record.id"
            :row-selection="rowSelection"
            :loading="dataLoading"
            :pagination="tablePagination"
            size="middle"
            @change="onTableChange"
          >
            <span slot="serial" slot-scope="text, record, index">
              {{ (tablePagination.current - 1) * tablePagination.pageSize + index + 1 }}
            </span>
            <span slot="status" slot-scope="text">
              <a-badge :status="statusStyleFilter(text)" :text="statusFilter(text)" />
            </span>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card :bordered="false">
          <!-- 未选择服务提示 -->
          <a-alert
            v-if="!hasSelectedService"
            message="请先选择要评测的MCP服务"
            description="👈 请在左侧服务列表中勾选一个MCP服务，然后即可配置评测参数"
            type="info"
            show-icon
            :closable="false"
            style="margin-bottom: 16px;"
          >
            <template slot="icon">
              <a-icon type="arrow-left" />
            </template>
          </a-alert>

          <a-form>
            <!-- 专业指标评测 -->
            <a-row :gutter="20">
              <a-col :span="16">
                <a-form-item>
                  <span slot="label">
                    专业指标评测
                    <a-tooltip title="平台提供的标准化技术评测指标，基于算法模型的技术特性">
                      <a-icon type="info-circle" style="margin-left: 4px; color: #1890ff;" />
                    </a-tooltip>
                  </span>
                  <a-select
                    ref="professionalMetricsSelect"
                    v-model="selectedProfessionalMetrics"
                    mode="multiple"
                    placeholder="请先选择左侧的MCP服务"
                    style="width: 100%"
                    :dropdownStyle="{ padding: 0 }"
                    :disabled="!hasSelectedService"
                    @change="onProfessionalMetricsChange"
                    @click="checkServiceSelected"
                  >
                    <div slot="dropdownRender" slot-scope="menu">
                      <div style="padding: 8px; cursor: pointer; text-align: center; border-bottom: 1px solid #e8e8e8;">
                        <a @click="selectAllProfessionalMetrics">全选</a>
                      </div>
                      <v-nodes :vnodes="menu" />
                    </div>
                    <a-select-option v-for="(item, index) in professionalMetrics" :key="index" :value="item.code">
                      {{ item.text }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>

              <!-- AI自定义评测开关 -->
              <a-col :span="8">
                <a-form-item label="AI自定义评测">
                  <a-switch
                    v-model="enableAICustomEvaluation"
                    checked-children="启用"
                    un-checked-children="关闭"
                    :disabled="!hasSelectedService"
                    @change="onAICustomToggle"
                    @click="checkServiceSelected"
                  >
                    <template slot="checkedChildren">
                      <a-icon type="robot" /> 启用
                    </template>
                    <template slot="unCheckedChildren">
                      关闭
                    </template>
                  </a-switch>
                  <div style="margin-top: 4px; font-size: 12px; color: #999;">
                    {{ hasSelectedService ? '由AI根据您的需求进行评测' : '请先选择MCP服务' }}
                  </div>
                </a-form-item>
              </a-col>
            </a-row>

            <!-- AI自定义评测配置面板 - 精美设计 -->
            <a-card
              v-if="enableAICustomEvaluation"
              :bordered="false"
              style="margin-top: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;"
              :body-style="{ padding: '24px' }"
            >
              <div slot="title" style="color: white; font-size: 16px; font-weight: 500;">
                <a-icon type="robot" style="margin-right: 8px;" />
                AI智能评测助手
              </div>

              <a-card :bordered="false" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- 步骤指示器 -->
                <a-steps :current="aiConfigStep" size="small" style="margin-bottom: 24px;">
                  <a-step title="评测目标" />
                  <a-step title="评测方法" />
                  <a-step title="高级配置" />
                </a-steps>

                <!-- 步骤1: 评测目标 -->
                <div v-show="aiConfigStep === 0">
                  <a-form-item>
                    <span slot="label" style="font-weight: 500; font-size: 14px;">
                      <a-icon type="target" style="color: #1890ff; margin-right: 4px;" />
                      请描述您的评测目标
                    </span>
                    <a-textarea
                      v-model="customEvaluationPrompt"
                      :placeholder="aiPromptPlaceholder"
                      :rows="5"
                      :maxLength="800"
                      showCount
                      style="font-size: 14px;"
                    />
                  </a-form-item>

                  <!-- 快速示例 -->
                  <a-card title="💡 示例参考" size="small" style="margin-top: 16px; background: #f6ffed; border: 1px solid #b7eb8f;">
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                      <a-tag
                        v-for="(example, idx) in promptExamples"
                        :key="idx"
                        color="green"
                        style="cursor: pointer; margin: 4px;"
                        @click="useExamplePrompt(example.prompt)"
                      >
                        <a-icon type="bulb" /> {{ example.title }}
                      </a-tag>
                    </div>
                  </a-card>

                  <div style="text-align: right; margin-top: 16px;">
                    <a-button type="primary" @click="aiConfigStep = 1" :disabled="!customEvaluationPrompt">
                      下一步 <a-icon type="right" />
                    </a-button>
                  </div>
                </div>

                <!-- 步骤2: 评测方法 -->
                <div v-show="aiConfigStep === 1">
                  <a-form-item>
                    <span slot="label" style="font-weight: 500; font-size: 14px;">
                      <a-icon type="experiment" style="color: #52c41a; margin-right: 4px;" />
                      选择评测方法
                    </span>
                    <a-radio-group v-model="customEvaluationMethod" style="width: 100%;">
                      <a-row :gutter="16">
                        <a-col :span="8">
                          <a-card
                            :hoverable="true"
                            :class="{ 'selected-method': customEvaluationMethod === 'ai-analysis' }"
                            @click="customEvaluationMethod = 'ai-analysis'"
                            style="cursor: pointer; text-align: center; border: 2px solid transparent; transition: all 0.3s;"
                          >
                            <a-radio value="ai-analysis" style="display: none;"></a-radio>
                            <div style="font-size: 32px; margin-bottom: 8px;">
                              <a-icon type="eye" :style="{ color: customEvaluationMethod === 'ai-analysis' ? '#1890ff' : '#999' }" />
                            </div>
                            <div style="font-weight: 500; margin-bottom: 4px;">AI智能分析</div>
                            <div style="font-size: 12px; color: #666;">
                              AI深度分析服务输出和行为模式
                            </div>
                          </a-card>
                        </a-col>
                        <a-col :span="8">
                          <a-card
                            :hoverable="true"
                            :class="{ 'selected-method': customEvaluationMethod === 'ai-generated-test' }"
                            @click="customEvaluationMethod = 'ai-generated-test'"
                            style="cursor: pointer; text-align: center; border: 2px solid transparent; transition: all 0.3s;"
                          >
                            <a-radio value="ai-generated-test" style="display: none;"></a-radio>
                            <div style="font-size: 32px; margin-bottom: 8px;">
                              <a-icon type="experiment" :style="{ color: customEvaluationMethod === 'ai-generated-test' ? '#52c41a' : '#999' }" />
                            </div>
                            <div style="font-weight: 500; margin-bottom: 4px;">AI生成测试</div>
                            <div style="font-size: 12px; color: #666;">
                              AI自动生成测试用例并执行
                            </div>
                          </a-card>
                        </a-col>
                        <a-col :span="8">
                          <a-card
                            :hoverable="true"
                            :class="{ 'selected-method': customEvaluationMethod === 'hybrid' }"
                            @click="customEvaluationMethod = 'hybrid'"
                            style="cursor: pointer; text-align: center; border: 2px solid transparent; transition: all 0.3s;"
                          >
                            <a-radio value="hybrid" style="display: none;"></a-radio>
                            <div style="font-size: 32px; margin-bottom: 8px;">
                              <a-icon type="thunderbolt" :style="{ color: customEvaluationMethod === 'hybrid' ? '#faad14' : '#999' }" />
                            </div>
                            <div style="font-weight: 500; margin-bottom: 4px;">混合模式</div>
                            <div style="font-size: 12px; color: #666;">
                              结合AI分析和规则验证
                            </div>
                          </a-card>
                        </a-col>
                      </a-row>
                    </a-radio-group>
                  </a-form-item>

                  <!-- 方法说明 -->
                  <a-alert
                    :message="evaluationMethodInfo[customEvaluationMethod].title"
                    :description="evaluationMethodInfo[customEvaluationMethod].description"
                    type="info"
                    show-icon
                    style="margin-top: 16px;"
                  />

                  <div style="text-align: right; margin-top: 16px;">
                    <a-button @click="aiConfigStep = 0" style="margin-right: 8px;">
                      <a-icon type="left" /> 上一步
                    </a-button>
                    <a-button type="primary" @click="aiConfigStep = 2">
                      下一步 <a-icon type="right" />
                    </a-button>
                  </div>
                </div>

                <!-- 步骤3: 高级配置 -->
                <div v-show="aiConfigStep === 2">
                  <a-form-item>
                    <span slot="label" style="font-weight: 500; font-size: 14px;">
                      <a-icon type="setting" style="color: #722ed1; margin-right: 4px;" />
                      高级配置 (可选)
                    </span>

                    <a-row :gutter="16">
                      <a-col :span="12">
                        <a-form-item label="评测深度">
                          <a-select v-model="aiEvaluationDepth" placeholder="选择评测深度">
                            <a-select-option value="basic">
                              <a-icon type="thunder" /> 基础评测 (快速)
                            </a-select-option>
                            <a-select-option value="standard">
                              <a-icon type="check-circle" /> 标准评测 (推荐)
                            </a-select-option>
                            <a-select-option value="comprehensive">
                              <a-icon type="fund" /> 全面评测 (详尽)
                            </a-select-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                      <a-col :span="12">
                        <a-form-item label="预期评测时间">
                          <a-select v-model="aiExpectedTime" disabled>
                            <a-select-option value="5-15">5-15秒</a-select-option>
                            <a-select-option value="15-30">15-30秒</a-select-option>
                            <a-select-option value="30-60">30-60秒</a-select-option>
                          </a-select>
                        </a-form-item>
                      </a-col>
                    </a-row>

                    <a-form-item label="期望输出">
                      <a-checkbox-group v-model="aiOutputPreferences">
                        <a-row>
                          <a-col :span="8">
                            <a-checkbox value="detailed_analysis">详细分析报告</a-checkbox>
                          </a-col>
                          <a-col :span="8">
                            <a-checkbox value="suggestions">改进建议</a-checkbox>
                          </a-col>
                          <a-col :span="8">
                            <a-checkbox value="test_cases">测试用例</a-checkbox>
                          </a-col>
                        </a-row>
                      </a-checkbox-group>
                    </a-form-item>
                  </a-form-item>

                  <a-divider />

                  <!-- 配置预览 -->
                  <a-descriptions title="配置预览" bordered size="small" :column="2">
                    <a-descriptions-item label="评测目标">
                      {{ customEvaluationPrompt.substring(0, 50) }}{{ customEvaluationPrompt.length > 50 ? '...' : '' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="评测方法">
                      {{ evaluationMethodInfo[customEvaluationMethod].title }}
                    </a-descriptions-item>
                    <a-descriptions-item label="评测深度">
                      {{ aiEvaluationDepth === 'basic' ? '基础' : aiEvaluationDepth === 'standard' ? '标准' : '全面' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="预计耗时">
                      {{ aiExpectedTime }}秒
                    </a-descriptions-item>
                  </a-descriptions>

                  <div style="text-align: right; margin-top: 16px;">
                    <a-button @click="aiConfigStep = 1" style="margin-right: 8px;">
                      <a-icon type="left" /> 上一步
                    </a-button>
                    <a-button type="primary" @click="confirmAIConfig">
                      <a-icon type="check" /> 确认配置
                    </a-button>
                  </div>
                </div>
              </a-card>
            </a-card>

            <!-- 数据集类型选择 -->
            <a-row :gutter="20" style="margin-top: 16px;">
              <a-col :span="8">
                <a-form-item label="数据集类型">
                  <a-select
                    v-model="dataSetType"
                    placeholder="请选择数据集类型"
                    :disabled="!hasSelectedService"
                    @change="onDatasetTypeChange"
                    @click="checkServiceSelected"
                  >
                    <a-select-option value="0">平台数据集</a-select-option>
                    <a-select-option value="1">上载数据集</a-select-option>
                    <a-select-option value="2">开源数据集</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="dataSetType === '0'" :span="8">
                <a-form-item label="选择数据集">
                  <a-select
                    v-model="selectedPlatformDataset"
                    placeholder="请选择数据集"
                    :disabled="!hasSelectedService"
                    @change="handlePlatformDatasetChange"
                    @click="checkServiceSelected"
                  >
                    <a-select-option v-for="(dataset, index) in domainDatasets" :key="index" :value="index.toString()">
                      {{ dataset }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="dataSetType === '1'" :span="8">
                <a-form-item label="上载数据集">
                  <a-upload
                    accept=".zip,.csv,.json,.xlsx,.xls"
                    :file-list="dataSetFiles"
                    :remove="removeDataSetFile"
                    :customRequest="customDataSetFileChose"
                    :multiple="true"
                    :disabled="!hasSelectedService"
                    @click="checkServiceSelected"
                  >
                    <a-button :disabled="!hasSelectedService">
                      <a-icon type="upload" /> 选择数据集
                    </a-button>
                  </a-upload>
                </a-form-item>
              </a-col>
              <!-- 开源数据集选择 -->
              <a-col v-if="dataSetType === '2'" :span="16">
                <a-form-item label="选择数据集">
                  <a-row :gutter="8">
                    <a-col :span="12">
                      <a-select
                        v-model="openSourceDatasetType"
                        placeholder="选择预配置数据集或输入自定义URL"
                        :disabled="!hasSelectedService"
                        @change="handleOpenSourceDatasetChange"
                        @click="checkServiceSelected"
                        allowClear
                      >
                        <a-select-opt-group label="🔬 机器学习经典数据集">
                          <a-select-option value="iris">Iris - 鸢尾花数据集</a-select-option>
                          <a-select-option value="mnist">MNIST - 手写数字</a-select-option>
                          <a-select-option value="cifar10">CIFAR-10 - 图像分类</a-select-option>
                          <a-select-option value="boston">Boston Housing - 房价预测</a-select-option>
                        </a-select-opt-group>
                        <a-select-opt-group label="📊 Kaggle热门数据集">
                          <a-select-option value="titanic">Titanic - 泰坦尼克号</a-select-option>
                          <a-select-option value="houseprices">House Prices - 房价预测</a-select-option>
                          <a-select-option value="creditcard">Credit Card Fraud - 信用卡欺诈</a-select-option>
                        </a-select-opt-group>
                        <a-select-opt-group label="🤖 NLP数据集">
                          <a-select-option value="imdb">IMDB - 电影评论情感分析</a-select-option>
                          <a-select-option value="squad">SQuAD - 阅读理解</a-select-option>
                          <a-select-option value="glue">GLUE Benchmark</a-select-option>
                        </a-select-opt-group>
                        <a-select-option value="custom">
                          <a-icon type="link" /> 自定义URL...
                        </a-select-option>
                      </a-select>
                    </a-col>

                    <!-- 自定义URL输入 -->
                    <a-col :span="12" v-if="openSourceDatasetType === 'custom'">
                      <a-input
                        v-model="customDatasetUrl"
                        placeholder="输入数据集URL（支持HTTP/HTTPS直链）"
                        :disabled="!hasSelectedService"
                        @pressEnter="handleCustomUrlSubmit"
                      >
                        <a-icon slot="prefix" type="link" />
                        <a-button
                          slot="suffix"
                          type="link"
                          size="small"
                          @click="handleCustomUrlSubmit"
                          :disabled="!customDatasetUrl"
                        >
                          确认
                        </a-button>
                      </a-input>
                    </a-col>

                    <!-- 数据集信息提示 -->
                    <a-col :span="12" v-else-if="openSourceDatasetType && openSourceDatasetType !== 'custom'">
                      <div class="dataset-info">
                        <a-tag color="blue">
                          <a-icon type="database" /> {{ getDatasetInfo().size }}
                        </a-tag>
                        <a-tag color="green">
                          <a-icon type="file-text" /> {{ getDatasetInfo().format }}
                        </a-tag>
                        <a-tooltip :title="getDatasetInfo().description">
                          <a-icon type="info-circle" style="margin-left: 8px; cursor: help; color: #1890ff;" />
                        </a-tooltip>
                      </div>
                    </a-col>
                  </a-row>
                </a-form-item>
              </a-col>
            </a-row>

          </a-form>

          <a-form>
            <a-form-item label="测评结果">
              <div v-if="evaluationResults.length > 0" class="evaluation-results">
                <div
                  v-for="(result, index) in evaluationResults"
                  :key="index"
                  class="evaluation-item"
                  :class="{ 'expanded': result.expanded }"
                >
                  <div class="evaluation-header" @click="toggleExpanded(index)">
                    <div class="evaluation-title">
                      <span class="metric-name">{{ result.name }}</span>
                      <a-tooltip :title="result.description">
                        <a-icon type="question-circle" class="help-icon" />
                      </a-tooltip>
                    </div>
                    <div class="evaluation-score">
                      <span class="score-value">{{ result.score }}</span>
                      <span v-if="result.range" class="score-range">{{ result.range }}</span>
                    </div>
                    <a-icon :type="result.expanded ? 'up' : 'down'" class="expand-icon" />
                  </div>
                  <div v-if="result.expanded" class="evaluation-details">
                    <pre class="json-details">{{ result.details }}</pre>
                  </div>
                </div>
              </div>
              <a-textarea
                v-else
                v-model="response"
                placeholder="选择评测指标并点击开始测评"
                :rows="7"
                :disabled="true"
              />
            </a-form-item>
            <a-form-item
              :wrapperCol="{ span: 24 }"
              style="text-align: center">
              <a-button v-if="tested" disabled icon="check">测评完成</a-button>
              <a-button
                v-if="tested"
                type="default"
                icon="redo"
                @click="resetForRetest"
                style="margin-left: 10px"
              >
                重新测评
              </a-button>
              <a-button
                v-else
                type="primary"
                :loading="testLoading"
                :disabled="!hasSelectedService"
                @click="onTest"
                icon="stock"
              >
                开始测评
              </a-button>
              <div v-if="!hasSelectedService" style="margin-top: 8px; color: #999; font-size: 12px;">
                请先选择左侧的MCP服务
              </div>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
    <agent-execution-panel
      v-if="showAgentPanel"
      :is-running="agentIsRunning"
      :steps="agentSteps"
      :error="agentError"
      :warning="agentWarning"
      :final-results="agentFinalResults"
      @close="showAgentPanel = false"
    />
  </page-header-wrapper>
</template>

<script>
import { ArticleListContent, StandardFormRow, TagSelect } from '@/components'
import { getServiceData } from '@/mock/data/services_data'
import AgentExecutionPanel from '@/components/Agent/AgentExecutionPanel'
import { streamAgent } from '@/utils/request'
import { filterServices, updateService } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'
import store from '@/store'
 import { Modal } from 'ant-design-vue'

// 领域数据集配置
const domainDatasetsMap = {
  homeAI: ['无人机轨迹', '目标识别', '课题组'],
  evtol: ['无人机轨迹', '目标识别', '课题组'],
  ecommerce: ['商品数据', '用户行为', '销售记录'],
  agriculture: ['作物数据', '土壤监测', '气象数据'],
  health: ['患者记录', '医疗图像', '临床数据'],
  aml: ['跨境贸易', '课题一内部数据集'],
  aircraft: ['飞行数据', '航线规划', '维护记录']
}

// 在export default前添加辅助组件
const VNodes = {
  functional: true,
  render: (h, ctx) => ctx.props.vnodes
}

export default {
  name: 'GenericTechnology',
  components: {
    TagSelect,
    StandardFormRow,
    ArticleListContent,
    AgentExecutionPanel,
    VNodes
  },
  props: {
    verticalType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      // create model
      form: this.$form.createForm(this),
      visible: false,
      confirmLoading: false,
      testLoading: false,
      tested: false,
      mdl: null,
      // 查询参数
      queryParam: {
        name: undefined,
        status: 'all'
      },
      statusDict: [],
      columns: [
        {
          title: '#',
          width: '80px',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '服务名称',
          dataIndex: 'name'
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: '160px',
          scopedSlots: { customRender: 'status' }
        }
      ],
      // 专业指标（原norm指标）
      selectedProfessionalMetrics: [],
      professionalMetrics: [],
      // AI自定义评测配置
      enableAICustomEvaluation: false,
      customEvaluationPrompt: '',
      customEvaluationMethod: 'ai-analysis',
      aiConfigStep: 0,
      aiEvaluationDepth: 'standard',
      aiExpectedTime: '15-30',
      aiOutputPreferences: ['detailed_analysis', 'suggestions'],
      // 提示词示例
      promptExamples: [
        { title: '边缘情况处理', prompt: '评测该服务对边缘情况的处理能力，包括空值、超长输入、特殊字符等异常输入的容错性和错误处理机制' },
        { title: '高并发稳定性', prompt: '评估服务在高并发场景下的稳定性和一致性，关注响应时间的波动和错误率' },
        { title: '多语言支持', prompt: '分析服务对不同语言（中文、英文、日文等）输入的处理效果和准确性' },
        { title: '数据质量要求', prompt: '测试服务对输入数据质量的要求和容忍度，包括缺失值、异常值的处理' }
      ],
      // 评测方法说明
      evaluationMethodInfo: {
        'ai-analysis': {
          title: 'AI智能分析',
          description: 'AI将深度分析服务的输出结果、行为模式和性能表现，给出全面的评测报告。适用于需要理解服务整体表现的场景。'
        },
        'ai-generated-test': {
          title: 'AI生成测试用例',
          description: 'AI根据您的评测目标自动生成多个测试用例，并逐一执行评测。适用于需要覆盖多种场景的评测需求。'
        },
        'hybrid': {
          title: '混合模式',
          description: '结合AI智能分析和自动化测试用例，提供最全面的评测结果。推荐用于重要服务的深度评测。'
        }
      },
      // 兼容旧代码
      selectedMetric: [],
      normOptions: [],
      dataSetType: undefined, // 数据集类型，默认为空让用户选择
      selectedPlatformDataset: undefined, // 选中的平台数据集索引，默认为空
      dataSetFiles: [],

      // 开源数据集相关
      openSourceDatasetType: undefined, // 选择的开源数据集类型
      customDatasetUrl: '', // 自定义URL
      openSourceDatasetInfo: null, // 开源数据集元信息

      // 预配置的开源数据集映射
      openSourceDatasets: {
        // 机器学习经典数据集
        'iris': {
          name: 'Iris Dataset',
          url: 'https://archive.ics.uci.edu/ml/machine-learning-databases/iris/iris.data',
          format: 'CSV',
          size: '4.5KB',
          description: '经典的鸢尾花分类数据集，包含150个样本，4个特征',
          source: 'UCI ML Repository'
        },
        'mnist': {
          name: 'MNIST',
          url: 'http://yann.lecun.com/exdb/mnist/',
          format: 'IDX',
          size: '~11MB',
          description: '手写数字识别数据集，60000训练样本+10000测试样本',
          source: 'Yann LeCun'
        },
        'cifar10': {
          name: 'CIFAR-10',
          url: 'https://www.cs.toronto.edu/~kriz/cifar-10-python.tar.gz',
          format: 'Pickle',
          size: '~170MB',
          description: '60000张32x32彩色图像，10个类别',
          source: 'University of Toronto'
        },
        'boston': {
          name: 'Boston Housing',
          url: 'https://raw.githubusercontent.com/selva86/datasets/master/BostonHousing.csv',
          format: 'CSV',
          size: '~50KB',
          description: '波士顿房价预测数据集，506个样本，13个特征',
          source: 'UCI ML Repository'
        },
        // Kaggle热门数据集
        'titanic': {
          name: 'Titanic Dataset',
          url: 'https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv',
          format: 'CSV',
          size: '~60KB',
          description: '泰坦尼克号乘客生存预测，891个训练样本',
          source: 'Kaggle'
        },
        'houseprices': {
          name: 'House Prices Dataset',
          url: 'kaggle:house-prices-advanced-regression-techniques',
          format: 'CSV',
          size: '~450KB',
          description: 'Kaggle房价预测竞赛数据集',
          source: 'Kaggle',
          requiresAuth: true
        },
        'creditcard': {
          name: 'Credit Card Fraud Detection',
          url: 'kaggle:mlg-ulb/creditcardfraud',
          format: 'CSV',
          size: '~150MB',
          description: '信用卡欺诈检测数据集，284,807笔交易',
          source: 'Kaggle',
          requiresAuth: true
        },
        // NLP数据集
        'imdb': {
          name: 'IMDB Reviews',
          url: 'https://ai.stanford.edu/~amaas/data/sentiment/aclImdb_v1.tar.gz',
          format: 'Text',
          size: '~84MB',
          description: 'IMDB电影评论情感分析，50000条评论',
          source: 'Stanford AI Lab'
        },
        'squad': {
          name: 'SQuAD 2.0',
          url: 'https://rajpurkar.github.io/SQuAD-explorer/dataset/train-v2.0.json',
          format: 'JSON',
          size: '~45MB',
          description: '问答系统数据集，包含不可回答的问题',
          source: 'Stanford'
        },
        'glue': {
          name: 'GLUE Benchmark',
          url: 'https://gluebenchmark.com/tasks',
          format: 'Multiple',
          size: '~1GB',
          description: 'NLP模型通用语言理解评估基准',
          source: 'NYU/UW/DeepMind'
        }
      },

      dataLoading: false,
      dataSource: [],
      filteredDataSource: [],
      tablePagination: {
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showTotal: total => `共 ${total} 条`
      },
      selectedRowKeys: [],
      selectedRows: [],
      response: '',
      evaluationResults: [],
      metricDescriptions: {
        'privacy': {
          description: '评估模型在处理敏感信息时的隐私保护能力，分值越高表示隐私保护能力越强',
          range: '[0, 1]'
        },
        'safety-fingerprint': {
          description: '评估模型的安全指纹检测能力，分值越高表示检测能力越强',
          range: '[0, 1]'
        },
        'safety-watermark': {
          description: '评估模型的安全水印验证能力，分值越高表示验证能力越强',
          range: '[0, 1]'
        },
        'fairness': {
          description: '评估模型在不同群体间的公平性表现，数值越大代表越公平',
          range: '[0, +∞)'
        },
        'robustness': {
          description: '评估模型在面对攻击时的鲁棒性，分值越高表示抗攻击能力越强',
          range: '[0, 1]'
        },
        'explainability': {
          description: '评估模型决策过程的可解释性，分值越高表示可解释性越强',
          range: '[0, 1]'
        }
      },
      mockResponse: {
        'score': {
          'privacy': {
            'Precision (Model 1)': {
              'value': 0.4952,
              'description': '模型1的精度'
            },
            'Recall (Model 1)': {
              'value': 0.41,
              'description': '模型1的召回率'
            },
            'Precision (Model 2)': {
              'value': 0.3475,
              'description': '模型2的精度'
            },
            'Recall (Model 2)': {
              'value': 0.4872,
              'description': '模型2的召回率'
            },
            'Kappa ': {
              'value': 0.4527,
              'description': 'Kappa值'
            },
            'Consistency Ratio': {
              'value': 0.7945,
              'description': '一致性比例'
            },
            'score': {
              'value': 0.4527,
              'description': '最终得分'
            }
          },
          'safety-fingerprint': {
            'Results under cln mode': 0,
            'sensi_point_ratio_origin_gt50.0(cln)': {
              'value': 0.0,
              'description': '指纹点敏感度大于50.0%的占比（cln模式）'
            },
            'sensi_point_ratio_origin_gt60.0(cln)': {
              'value': 0.0,
              'description': '指纹点敏感度大于50.0%的占比（cln模式）'
            },
            'num_positive_model(cln)': {
              'value': 4,
              'description': '总篡改模型个数（cln模式）'
            },
            'detection_success_rate_origin(cln)': {
              'value': 25.0,
              'description': '模型篡改检测成功率（cln模式）'
            },
            'fingerprint_score(cln)': {
              'value': 0.25,
              'description': '最终指纹得分（cln模式）'
            },
            'Results under atk mode': 0,
            'sensi_point_ratio_origin_gt50.0(atk)': {
              'value': 0.0,
              'description': '指纹点敏感度大于50.0%的占比（atk模式）'
            },
            'sensi_point_ratio_origin_gt60.0(atk)': {
              'value': 0.0,
              'description': '指纹点敏感度大于50.0%的占比（atk模式）'
            },
            'num_positive_model(atk)': {
              'value': 4,
              'description': '总篡改模型个数（atk模式）'
            },
            'detection_success_rate_origin(atk)': {
              'value': 25.0,
              'description': '模型篡改检测成功率（atk模式）'
            },
            'fingerprint_score(atk)': {
              'value': 0.25,
              'description': '最终指纹得分（atk模式）'
            }
          },
          'safety-watermark': {
            'watermark_score': {
              'value': 0.6,
              'description': '最终水印得分'
            },
            'verification_ratio': {
              'value': 0.1667,
              'description': '生成异常样本的比例'
            },
            'acc': {
              'value': 1.0,
              'description': '对正常样本的识别准确性'
            },
            'positive_val': {
              'value': [
                0.1667,
                0.2667
              ],
              'description': '阳性模型对含有特殊触发器样本的验证准确性'
            },
            'negative_val': {
              'value': [
                0.2,
                0.0,
                0.5,
                0.0333,
                0.0333,
                0.8333,
                0.1,
                0.0,
                0.2,
                0.9667
              ],
              'description': '阴性模型对含有特殊触发器样本的验证准确性'
            }
          },
          'fairness': {
            'attribute': 'total_incoming_amount',
            'fairness_score': 10.6201,
            'description': '关于属性"total_incoming_amount"的公平性评估，数值越大代表越公平'
          },
          'robustness': {
            'Surrogate model predict number before attack': {
              'value': {
                'on class 0': 422,
                'on class 1': 1,
                'on class 2': 31
              },
              'description': 'The result is the number of nodes for each class predicted by the surrogate model on the graph before the attack.'
            },
            'Surrogate model predict accuracy before attack': {
              'value': {
                'on class 0': 1.0,
                'on class 1': 1.0,
                'on class 2': 1.0
              },
              'description': "The result is the accuracy before the attack, with the surrogate model's own predictions used as the ground truth, and thus it is 100%."
            },
            'Surrogate model predict number after attack': {
              'value': {
                'on class 0': 422,
                'on class 1': 0,
                'on class 2': 12
              },
              'description': 'The result is the number of nodes for each class predicted by the surrogate model on the graph after the attack.'
            },
            'Surrogate model predict accuracy after attack': {
              'value': {
                'on class 0': 1.0,
                'on class 1': 0.0,
                'on class 2': 0.3870967741935484
              },
              'description': 'The result is the prediction accuracy of the surrogate model after the attack, with its own predictions used as the ground truth (i.e., the accuracy before the attack is 100%).'
            },
            'White box robustness score': {
              'value': 0.375,
              'description': 'The result is the robustness score under the white-box attack scenario.',
              'Black box robustness score': {
                'value': 0.2,
                'description': 'The result is the robustness score under the white-box attack scenario.'
              }
            }
          },
          'explainability': {
            'subgraphs2': {
              'value': './graph_dataset/delete_edges_outside_subgraph',
              'description': 'Path to subgraph 2'
            },
            'subgraphs1': {
              'value': './graph_dataset/original',
              'description': 'Path to subgraph 1'
            },
            'jaccard_coefficient': {
              'value': 0.3333,
              'description': 'Jaccard Coefficient between subgraph 1 and subgraph 4'
            },
            'num_nodes_combined': {
              'value': 4,
              'description': 'Number of nodes in the combined subgraphs'
            },
            'num_edges_subgraph1': {
              'value': 7,
              'description': 'Number of edges in subgraph 1'
            },
            'num_edges_subgraph2': {
              'value': 7,
              'description': 'Number of edges in subgraph 2'
            },
            'score': {
              'value': 0.3333,
              'description': 'Final score based on Jaccard coefficient'
            },
            'subgraphs3': {
              'value': './graph_dataset/delete_edges_within_subgraph',
              'description': 'Path to subgraph 3'
            },
            'num_edges_subgraph3': {
              'value': 6,
              'description': 'Number of edges in subgraph 3'
            },
            'subgraphs4': {
              'value': './graph_dataset/rerun',
              'description': 'Path to subgraph 4'
            },
            'num_edges_subgraph4': {
              'value': 6,
              'description': 'Number of edges in subgraph 4'
            }
          }
        },
        'details': {
          'privacy': {
            'privacy_score': {
              'value': '0.4527',
              'range': [0, 1]
            }
          },
          'safety-fingerprint': {
            'safety-fingerprint_score(cln mode)': {
              'value': '0.25',
              'range': '[0, 1]'
            },
            'safety-fingerprint_score(atk mode)': {
              'value': '0.25',
              'range': '[0, 1]'
            }
          },
          'safety-watermark': {
            'safety-watermark_score': {
              'value': '0.6',
              'range': [0, 1]
            }
          },
          'fairness': {
            'fairness_score': {
              'value': '10.6201'
            }
          },
          'robustness': {
            'white_box_robustness_score': {
              'value': '0.38',
              'range': '[0, 1]'
            },
            'black_box_robustness_score': {
              'value': '0.20',
              'range': '[0, 1]'
            }
          },
          'explainability': {
            'explainablilty_score_2': {
              'value': '0.6667'
            },
            'explainablilty_score_3': {
              'value': '0.3333'
            },
            'explainablilty_score_4': {
              'value': '0.3333'
            }
          }
        }
      },
      showAgentPanel: false,
      agentIsRunning: false,
      agentSteps: [],
      agentError: '',
      agentWarning: '',
      agentFinalResults: null
    }
  },
  async created() {
    await this.loadDictionaryData()
    await this.initData()
  },
  watch: {
    async verticalType(newDomain, oldDomain) {
      if (newDomain !== oldDomain) {
        await this.initData()
      }
    },
    // 监听评测深度，自动设置预期时间
    aiEvaluationDepth(newDepth) {
      const timeMap = {
        'basic': '5-15',
        'standard': '15-30',
        'comprehensive': '30-60'
      }
      this.aiExpectedTime = timeMap[newDepth] || '15-30'
    }
  },
  computed: {
    // 是否已选择服务
    hasSelectedService() {
      return this.selectedRows && this.selectedRows.length > 0
    },
    // AI提示词占位符
    aiPromptPlaceholder() {
      return `请详细描述您想要评测的内容和标准，例如：\n\n• 评测该服务对边缘情况的处理能力\n• 评估在高并发下的稳定性和响应速度\n• 测试对不同语言输入的支持程度\n• 分析输出结果的准确性和一致性\n\n描述越详细，AI的评测结果就越精准。`
    },
    domainDatasets() {
      return domainDatasetsMap[this.verticalType] || []
    },
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
        type: 'radio'
      }
    }
  },
  methods: {
    // 检查是否选择了服务
    checkServiceSelected() {
      if (!this.hasSelectedService) {
        this.$message.warning({
          content: '请先在左侧选择要评测的MCP服务',
          duration: 2
        })
        return false
      }
      return true
    },
    statusFilter(type) {
      if (type === undefined) {
        return '未知状态'
      }
      if (!this.statusDict || !Array.isArray(this.statusDict)) {
        return '未知状态'
      }
      const statusItem = this.statusDict.find(item => item && item.code === type)
      return statusItem ? statusItem.text : '未知状态'
    },
    statusStyleFilter(type) {
      if (type === undefined) {
        return 'default'
      }
      if (!this.statusStyleDict || !Array.isArray(this.statusStyleDict)) {
        return 'default'
      }
      const statusItem = this.statusStyleDict.find(item => item && item.code === type)
      return statusItem ? statusItem.text : 'default'
    },
    async loadDictionaryData() {
      try {
        // 加载专业指标（原norm指标）
        this.professionalMetrics = await dictionaryCache.loadDict('norm') || []
        this.normOptions = this.professionalMetrics // 保持兼容性

        const allStatus = await dictionaryCache.loadDict('status') || []
        this.statusStyleDict = await dictionaryCache.loadDict('status_style') || []
        const runningStatusCode = this.statusStyleDict.filter(item => ['warning', 'success'].includes(item.text)).map(item => item.code)
        this.statusDict = allStatus.filter(item => runningStatusCode.includes(item.code))
      } catch (error) {
        console.error('加载评测指标字典失败:', error)
        // 专业指标默认值
        this.professionalMetrics = [
          { code: 'privacy', text: '隐私性' },
          { code: 'safety-fingerprint', text: '安全性指纹' },
          { code: 'safety-watermark', text: '安全性水印' },
          { code: 'fairness', text: '公平性' },
          { code: 'robustness', text: '鲁棒性' },
          { code: 'explainability', text: '可解释性' }
        ]
        this.normOptions = this.professionalMetrics

        this.statusDict = ['pre_release_unrated', 'pre_release_pending', 'released']
        this.statusStyleDict = []
      }
    },
    async initData() {
      this.dataLoading = true
      this.filteredDataSource = []

      try {
        console.log(`正在加载${this.verticalType}领域的技术评测服务数据`)
        const response = await this.fetchServicesFromAPI()

        if (response && response.status === 'success') {
          console.log(`成功从API获取到${response.services.length}条服务数据`)
          this.dataSource = response.services
        } else {
          console.log('API获取失败，回退到静态数据')
          this.dataSource = await getServiceData(this.verticalType, true)
        }

        this.filteredDataSource = [...this.dataSource]
      } catch (error) {
        console.error('初始化数据失败:', error)
        try {
          this.dataSource = await getServiceData(this.verticalType, true)
          this.filteredDataSource = [...this.dataSource]
        } catch (innerError) {
          console.error('静态数据加载也失败:', innerError)
          this.$message.error('加载数据失败，请刷新页面重试')
          this.dataSource = []
          this.filteredDataSource = []
        }
      } finally {
        this.dataLoading = false
      }
    },
    async fetchServicesFromAPI() {
      try {
        const runningStatus = this.statusDict.map(item => item.code)
        return await filterServices({ domain: this.verticalType, type: 'atomic,atomic_mcp', status: runningStatus.join(',') })
      } catch (error) {
        console.error('获取服务数据失败:', error)
        return undefined
      }
    },
    handleSearch() {
      this.filteredDataSource = [...this.dataSource]
      if (this.queryParam.name) {
        this.filteredDataSource = this.filteredDataSource.filter(item => {
          return item.name && item.name.includes(this.queryParam.name)
        })
      }
      if (this.queryParam.status && this.queryParam.status !== 'all') {
        this.filteredDataSource = this.filteredDataSource.filter(item => {
          return item.status === this.queryParam.status
        })
      }
      this.tablePagination.current = 1
    },
    onTableChange (pagination) {
      this.tablePagination.current = pagination.current
      this.tablePagination.pageSize = pagination.pageSize
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
      this.tested = false
      this.response = ''
      this.evaluationResults = []

      // 清空右侧所有配置（当切换服务时）
      this.resetRightSideConfigurations()
    },

    // 重置右侧所有配置
    resetRightSideConfigurations() {
      // 1. 清空专业指标选择
      this.selectedProfessionalMetrics = []
      this.selectedMetric = []

      // 2. 清空AI自定义评测配置
      this.enableAICustomEvaluation = false
      this.customEvaluationPrompt = ''
      this.customEvaluationMethod = 'ai-analysis'
      this.aiConfigStep = 0
      this.aiEvaluationDepth = 'standard'
      this.aiExpectedTime = '15-30'
      this.aiOutputPreferences = ['detailed_analysis', 'suggestions']

      // 3. 清空数据集配置
      this.dataSetType = undefined
      this.selectedPlatformDataset = undefined
      this.dataSetFiles = []
      this.openSourceDatasetType = undefined
      this.customDatasetUrl = ''
      this.openSourceDatasetInfo = null

      // 4. 清空评测结果
      this.response = ''
      this.evaluationResults = []
      this.tested = false
    },

    // 重新测评（保持服务选择，清空配置和结果）
    resetForRetest() {
      const serviceName = this.selectedRows[0]?.name || 'MCP服务'

      // 使用友好的确认对话框
      Modal.confirm({
        title: '🔄 重新测评',
        content: `您即将为 "${serviceName}" 进行重新测评。\n\n此操作将清空：\n• 已选择的评测指标\n• AI自定义评测配置\n• 数据集选择\n• 当前评测结果\n\n但会保留您当前选择的MCP服务，方便您使用不同的配置重新评测。`,
        okText: '确认重新测评',
        okType: 'primary',
        cancelText: '取消',
        width: 500,
        icon: () => null,
        onOk: () => {
          // 1. 清空专业指标选择
          this.selectedProfessionalMetrics = []
          this.selectedMetric = []

          // 2. 清空AI自定义评测配置
          this.enableAICustomEvaluation = false
          this.customEvaluationPrompt = ''
          this.customEvaluationMethod = 'ai-analysis'
          this.aiConfigStep = 0
          this.aiEvaluationDepth = 'standard'
          this.aiExpectedTime = '15-30'
          this.aiOutputPreferences = ['detailed_analysis', 'suggestions']

          // 3. 清空数据集配置
          this.dataSetType = undefined
          this.selectedPlatformDataset = undefined
          this.dataSetFiles = []
          this.openSourceDatasetType = undefined
          this.customDatasetUrl = ''
          this.openSourceDatasetInfo = null

          // 4. 清空评测结果
          this.response = ''
          this.evaluationResults = []
          this.tested = false

          // 注意：不清空 selectedRowKeys 和 selectedRows（保持MCP服务选择）

          this.$message.success({
            content: '✨ 配置已清空，请重新选择评测参数',
            duration: 3
          })
        },
        onCancel: () => {
          this.$message.info('已取消重新测评')
        }
      })
    },
    // 数据集类型切换
    onDatasetTypeChange(value) {
      // 清空之前选择的数据集
      if (value === '0') {
        // 切换到平台数据集，清空平台数据集选择
        this.selectedPlatformDataset = undefined
      } else if (value === '1') {
        // 切换到上载数据集，清空上传的文件
        this.dataSetFiles = []
      } else if (value === '2') {
        // 切换到开源数据集，清空开源数据集相关
        this.openSourceDatasetType = undefined
        this.customDatasetUrl = ''
        this.openSourceDatasetInfo = null
      }
    },

    // 平台数据集选择变化（只在用户明确选择后触发）
    async handlePlatformDatasetChange(value) {
      // 如果是undefined（初始状态或清空），不触发检查
      if (value === undefined || value === null || value === '') {
        return
      }

      this.selectedPlatformDataset = value
    },

    // 开源数据集选择变化
    async handleOpenSourceDatasetChange(value) {
      if (!value || value === 'custom') {
        this.customDatasetUrl = ''
        this.openSourceDatasetInfo = null
        return
      }

      // 获取数据集信息
      this.openSourceDatasetInfo = this.openSourceDatasets[value]

      // 如果需要认证（如Kaggle）
      if (this.openSourceDatasetInfo?.requiresAuth) {
        Modal.warning({
          title: '需要身份认证',
          content: `该数据集来自 ${this.openSourceDatasetInfo.source}，需要配置API密钥才能下载。请联系管理员配置相关凭证。`,
          okText: '我知道了',
          width: 450
        })
        // 注意：即使需要认证，也保留选择，后端可能已配置
      }
    },

    // 自定义URL提交
    async handleCustomUrlSubmit() {
      if (!this.customDatasetUrl) {
        this.$message.warning('请输入数据集URL')
        return
      }

      // 验证URL格式
      const urlPattern = /^https?:\/\/.+/
      if (!urlPattern.test(this.customDatasetUrl)) {
        this.$message.error('请输入有效的URL（支持HTTP/HTTPS）')
        return
      }

      // 构建自定义数据集信息
      this.openSourceDatasetInfo = {
        name: '自定义数据集',
        url: this.customDatasetUrl,
        format: '未知',
        size: '未知',
        description: '用户自定义的开源数据集',
        source: 'Custom'
      }

      this.$message.success('已添加自定义数据集URL')
    },

    // 获取数据集信息（用于UI显示）
    getDatasetInfo() {
      if (!this.openSourceDatasetInfo) {
        return { size: '-', format: '-', description: '' }
      }
      return this.openSourceDatasetInfo
    },

    // 获取数据集显示名称
    async customDataSetFileChose (options) {
      const { file } = options
      if (!file) {
        return false
      }
      const url = URL.createObjectURL(file)
      // 支持多文件上传
      this.dataSetFiles.push({
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url,
        originFileObj: file
      })
    },
    removeDataSetFile (file) {
      const index = this.dataSetFiles.indexOf(file)
      if (index > -1) {
        this.dataSetFiles.splice(index, 1)
      }
    },
    async onTest () {
      // 1. 基本验证
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择测评服务！')
        return
      }

      // 检查是否至少选择了一项评测指标或AI评测
      const hasProfessionalMetrics = this.selectedProfessionalMetrics.length > 0
      const hasAIEvaluation = this.enableAICustomEvaluation

      if (!hasProfessionalMetrics && !hasAIEvaluation) {
        this.$message.warning('请至少选择一项专业指标或启用AI自定义评测！')
        return
      }

      // 如果启用了AI自定义评测，验证配置完整性
      if (this.enableAICustomEvaluation) {
        if (!this.customEvaluationPrompt || this.customEvaluationPrompt.trim() === '') {
          this.$message.warning('请输入AI自定义评测的目标描述！')
          return
        }
      }

      // 兼容旧代码：同步selectedMetric
      this.selectedMetric = [...this.selectedProfessionalMetrics]

      // 2. 数据集验证
      if (this.dataSetType === '1' && this.dataSetFiles.length === 0) {
        this.$message.warning('请上传数据集文件！')
        return
      }

      this.testLoading = true
      const service = this.selectedRows[0]
      const serviceName = (service.name || service.title || '').trim()

      // 3. 原子微服务技术评测：本页面统一走Agent评测（不再使用Mock）
      this.runAgentEvaluation(serviceName)
    },
    async runAgentEvaluation(serviceName) {
      const formData = new FormData()
      formData.append('model_name', serviceName)
      formData.append('dataset_type', this.dataSetType ?? '0')
      formData.append('enable_adaptation', 'true')

      let metricsToSend = this.normOptions.map(item => item.code).join(',')
      if (this.selectedMetric.length > 0) {
        metricsToSend = this.selectedMetric.join(',')
      }
      formData.append('metrics', metricsToSend)

      // 根据数据集类型处理数据
      if (this.dataSetType === '1') {
        // 用户上载数据集（Agent支持ZIP/CSV/JSON）
        const fileObj = this.dataSetFiles[0].originFileObj || this.dataSetFiles[0]
        const fileName = fileObj.name || ''
        const fileExt = (fileName.split('.').pop() || '').toLowerCase()
        const allowedExts = ['zip', 'csv', 'json']

        if (!allowedExts.includes(fileExt)) {
          this.$message.error('请上传ZIP、CSV或JSON格式的数据集文件')
          this.testLoading = false
          return
        }

        formData.append('data_file', fileObj)
      } else if (this.dataSetType === '0') {
        // 平台数据集
        const datasetUrl = 'https://lhcos-84055-1317429791.cos.ap-shanghai.myqcloud.com/ioeb/test_dataset.zip'
        formData.append('file_url', datasetUrl)
      } else if (this.dataSetType === '2') {
        // 开源数据集
        const datasetInfo = this.openSourceDatasets[this.openSourceDatasetType]
        if (datasetInfo && datasetInfo.url) {
          formData.append('file_url', datasetInfo.url)
        } else {
          this.$message.error('请选择有效的开源数据集')
          this.testLoading = false
          return
        }
      } else {
        // 默认使用平台数据集
        const datasetUrl = 'https://lhcos-84055-1317429791.cos.ap-shanghai.myqcloud.com/ioeb/test_dataset.zip'
        formData.append('file_url', datasetUrl)
      }

      if (!this.showAgentPanel) {
        this.showAgentPanel = true
        this.agentSteps = []
        this.agentError = ''
        this.agentWarning = ''
        this.agentFinalResults = null
        this.agentIsRunning = true
      }

      streamAgent('/api/agent/aml_model_evaluation', formData, {
        onStart: () => {
          this.agentIsRunning = true
        },
        onStep: (data) => {
          this.agentSteps.push(data)
        },
        onError: (error) => {
          this.agentError = error
          this.$message.error(`评测过程出错: ${error}`)
          this.testLoading = false
          this.agentIsRunning = false
        },
        onWarning: (warning) => {
          this.agentWarning = warning
          this.$message.warning(`评测警告: ${warning}`)
          this.testLoading = false
          this.agentIsRunning = false
        },
                        onFinalResult: (results) => {
          this.agentFinalResults = results

          // 处理Agent返回的格式: {evaluation_result: {model_name: ..., evaluation_results: ...}}
          let evaluationData = null
          if (results.evaluation_result && results.evaluation_result.evaluation_results) {
            evaluationData = results.evaluation_result.evaluation_results
          } else if (results.score || results.details) {
            // 兼容旧格式: {score: ..., details: ...}
            evaluationData = results.details || results.score || {}
          }

          if (evaluationData) {
            // 显示完整的Agent返回结果
            this.response = JSON.stringify(results, null, 4)
            this.$message.success(`${serviceName} 测试完成！`)

            // 尝试用新的方法处理结果显示
            try {
              this.processEvaluationResults(evaluationData, null)
              // 只有成功处理后才清空原始response
              if (this.evaluationResults.length > 0) {
                this.response = ''
              }
            } catch (e) {
              console.warn('新格式处理失败，保持原始显示:', e)
            }

            // 更新服务的norm字段
            if (this.selectedRows.length > 0) {
              const normToUpdate = []
              this.selectedMetric.forEach(metric => {
                let score = 'N/A'

                // 从evaluation_results中获取分数
                if (evaluationData[metric]) {
                  const metricData = evaluationData[metric]
                  if (metric === 'privacy' && metricData.privacy_score) {
                    score = metricData.privacy_score.value
                  } else if (metric === 'safety-fingerprint' && metricData['safety-fingerprint_score(cln mode)']) {
                    score = metricData['safety-fingerprint_score(cln mode)'].value
                  } else if (metric === 'safety-watermark' && metricData['safety-watermark_score']) {
                    score = metricData['safety-watermark_score'].value
                  } else if (metric === 'fairness' && metricData.fairness_score) {
                    score = metricData.fairness_score.value
                  } else if (metric === 'robustness') {
                    const whiteBox = metricData.white_box_robustness_score?.value || 0
                    const blackBox = metricData.black_box_robustness_score?.value || 0
                    score = ((parseFloat(whiteBox) + parseFloat(blackBox)) / 2).toFixed(4)
                  } else if (metric === 'explainability') {
                    if (metricData.explainablilty_score_2) {
                      score = metricData.explainablilty_score_2.value
                    } else if (metricData.explainablilty_score_3) {
                      score = metricData.explainablilty_score_3.value
                    } else if (metricData.explainablilty_score_4) {
                      score = metricData.explainablilty_score_4.value
                    }
                  }
                }

                normToUpdate.push({
                  key: metric,
                  score: score
                })
              })
              this.updateServiceNorm(this.selectedRows[0], normToUpdate)
            }
          } else {
            // 若没有找到评测结果，展示整个结果对象
            this.response = JSON.stringify(results, null, 4)
            this.$message.info('测试完成，但未找到标准评测结果')
          }

          this.testLoading = false
          this.agentIsRunning = false
          this.tested = true
        },
        onComplete: () => {
          this.testLoading = false
          this.agentIsRunning = false
        },
        onDataProcessError: (e) => {
          console.error('解析数据失败:', e)
          this.$message.error('解析评测数据失败')
          this.testLoading = false
          this.agentIsRunning = false
        }
      })
    },
    async runMockEvaluation(serviceName) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 根据选择的指标过滤结果
          const filteredScore = {}
          const filteredDetails = {}
          if (this.selectedMetric.length > 0) {
            this.selectedMetric.forEach(metric => {
              if (this.mockResponse.score[metric]) {
                filteredScore[metric] = this.mockResponse.score[metric]
              }
              if (this.mockResponse.details[metric]) {
                filteredDetails[metric] = this.mockResponse.details[metric]
              }
            })
          } else {
            this.testLoading = false
            this.agentIsRunning = false
            resolve()
            return
          }

          this.processEvaluationResults(filteredDetails, filteredScore)

          if (this.selectedRows.length > 0) {
            const normToUpdate = this.evaluationResults.map(result => ({
              key: result.code,
              score: result.score
            }))
            this.updateServiceNorm(this.selectedRows[0], normToUpdate)
          }

          this.testLoading = false
          this.agentIsRunning = false
          this.tested = true
          this.$message.success(`${serviceName} 测试完成！`)
          resolve()
        }, 1000)
      })
    },
    async updateServiceNorm(currentServiceData, normList) {
      const isPlatForm = store.getters.roles?.permissionList?.includes('admin') || false
      try {
        const currentService = { ...currentServiceData }
        if (!currentService.norm) {
          currentService.norm = []
        }
        normList.forEach(normItem => {
          const normData = {
            key: normItem.key,
            score: normItem.score,
            platformChecked: isPlatForm ? 1 : 0
          }
          let normExists = false
          for (let i = 0; i < currentService.norm.length; i++) {
            if (currentService.norm[i].key === normItem.key) {
              currentService.norm[i] = normData
              normExists = true
              break
            }
          }
          if (!normExists) {
            currentService.norm.push(normData)
          }
        })
        currentService.status = isPlatForm ? 'released' : 'pre_release_pending'
        await updateService(currentService.id, currentService)
      } catch (error) {
        console.error('更新服务评测指标失败:', error)
      }
    },
    selectAllMetrics() {
      this.selectedMetric = this.normOptions.map(item => item.code)
      setTimeout(() => {
        document.body.click()
      }, 100)
    },
    // 全选专业指标
    selectAllProfessionalMetrics() {
      this.selectedProfessionalMetrics = this.professionalMetrics.map(item => item.code)
      // 同步到旧的selectedMetric（保持兼容）
      this.selectedMetric = [...this.selectedProfessionalMetrics, ...this.selectedGenericMetrics.filter(m => m !== 'custom')]
      setTimeout(() => {
        document.body.click()
      }, 100)
    },
    // 全选通用指标（不包括custom）
    // 专业指标变化监听
    onProfessionalMetricsChange() {
      // 同步到旧的selectedMetric（保持兼容）
      this.selectedMetric = [...this.selectedProfessionalMetrics, ...this.selectedGenericMetrics.filter(m => m !== 'custom')]
    },
    // AI自定义评测开关切换
    onAICustomToggle(checked) {
      if (checked) {
        // 启用AI评测，重置配置
        this.aiConfigStep = 0
        this.customEvaluationPrompt = ''
        this.customEvaluationMethod = 'ai-analysis'
        this.aiEvaluationDepth = 'standard'
        this.aiOutputPreferences = ['detailed_analysis', 'suggestions']
      } else {
        // 关闭AI评测
        this.customEvaluationPrompt = ''
      }
      // 同步到旧的selectedMetric
      this.selectedMetric = [...this.selectedProfessionalMetrics]
    },
    // 使用示例提示词
    useExamplePrompt(prompt) {
      this.customEvaluationPrompt = prompt
      this.$message.success('已应用示例提示词')
    },
    // 确认AI配置
    confirmAIConfig() {
      this.aiConfigStep = 0
      this.$message.success('AI评测配置已完成！')
    },
    toggleExpanded(index) {
      this.$set(this.evaluationResults[index], 'expanded', !this.evaluationResults[index].expanded)
    },
        processEvaluationResults(detailsData, scoreData) {
      const results = []

      this.selectedMetric.forEach(metricCode => {
        const metricOption = this.normOptions.find(option => option.code === metricCode)
        if (!metricOption) return

        const metricDetails = detailsData[metricCode]
        const metricScore = scoreData?.[metricCode]
        if (!metricDetails && !metricScore) return

        let score = 'N/A'

        // 优先从details中获取分数
        if (metricDetails) {
          if (metricCode === 'privacy' && metricDetails.privacy_score) {
            score = metricDetails.privacy_score.value
          } else if (metricCode === 'safety-fingerprint') {
            if (metricDetails['safety-fingerprint_score(cln mode)']) {
              score = metricDetails['safety-fingerprint_score(cln mode)'].value
            } else if (metricDetails['safety-fingerprint_score(atk mode)']) {
              score = metricDetails['safety-fingerprint_score(atk mode)'].value
            }
          } else if (metricCode === 'safety-watermark' && metricDetails['safety-watermark_score']) {
            score = metricDetails['safety-watermark_score'].value
          } else if (metricCode === 'fairness' && metricDetails.fairness_score) {
            score = metricDetails.fairness_score.value
          } else if (metricCode === 'robustness') {
            const whiteBox = metricDetails.white_box_robustness_score?.value || 0
            const blackBox = metricDetails.black_box_robustness_score?.value || 0
            score = ((parseFloat(whiteBox) + parseFloat(blackBox)) / 2).toFixed(4)
          } else if (metricCode === 'explainability') {
            if (metricDetails.explainablilty_score_2) {
              score = metricDetails.explainablilty_score_2.value
            } else if (metricDetails.explainablilty_score_3) {
              score = metricDetails.explainablilty_score_3.value
            } else if (metricDetails.explainablilty_score_4) {
              score = metricDetails.explainablilty_score_4.value
            }
          }
        }

        // 如果details中没有找到分数，从score中获取
        if (score === 'N/A' && metricScore) {
          if (metricScore.score && metricScore.score.value !== undefined) {
            score = metricScore.score.value
          } else if (metricCode === 'privacy' && metricScore['Kappa ']) {
            score = metricScore['Kappa '].value
          } else if (metricCode === 'safety-fingerprint' && metricScore['fingerprint_score(cln)']) {
            score = metricScore['fingerprint_score(cln)'].value
          } else if (metricCode === 'safety-watermark' && metricScore.watermark_score) {
            score = metricScore.watermark_score.value
          } else if (metricCode === 'fairness' && metricScore.fairness_score !== undefined) {
            score = metricScore.fairness_score
          } else if (metricCode === 'robustness') {
            const whiteBoxData = metricScore['White box robustness score']
            const blackBoxData = whiteBoxData?.['Black box robustness score']
            if (whiteBoxData && blackBoxData) {
              score = ((whiteBoxData.value + blackBoxData.value) / 2).toFixed(4)
            }
          } else if (metricCode === 'explainability' && metricScore.score) {
            score = metricScore.score.value
          }
        }

        const metricInfo = this.metricDescriptions[metricCode] || {}

        // 优先使用score中的详细信息，如果没有则使用details
        const detailsToShow = metricScore || metricDetails

        results.push({
          code: metricCode,
          name: metricOption.text,
          score: score,
          range: metricInfo.range,
          description: metricInfo.description,
          details: JSON.stringify(detailsToShow, null, 2),
          expanded: false
        })
      })

      this.evaluationResults = results
    }
  }
}
</script>

<style lang="less" scoped>
.ant-pro-components-tag-select {
  :deep(.ant-pro-tag-select .ant-tag) {
    margin-right: 24px;
    padding: 0 8px;
    font-size: 14px;
  }
}

.list-articles-trigger {
  margin-left: 12px;
}

.evaluation-results {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;

  .evaluation-item {
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .evaluation-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #fafafa;
      }

      .evaluation-title {
        flex: 1;
        display: flex;
        align-items: center;

        .metric-name {
          font-weight: 500;
          margin-right: 8px;
        }

        .help-icon {
          color: #8c8c8c;
          cursor: help;

          &:hover {
            color: #1890ff;
          }
        }
      }

      .evaluation-score {
        display: flex;
        align-items: center;
        margin-right: 16px;

        .score-value {
          font-size: 16px;
          font-weight: 600;
          color: #1890ff;
          margin-right: 8px;
        }

        .score-range {
          font-size: 12px;
          color: #8c8c8c;
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
        }
      }

      .expand-icon {
        color: #8c8c8c;
        transition: transform 0.3s;
      }
    }

    &.expanded .evaluation-header .expand-icon {
      transform: rotate(180deg);
    }

    .evaluation-details {
      padding: 16px;
      background-color: #fafafa;
      border-top: 1px solid #f0f0f0;

      .json-details {
        margin: 0;
        padding: 12px;
        background: #fff;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        line-height: 1.4;
        max-height: 300px;
        overflow-y: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }
  }
}

// AI评测方法选中样式
.selected-method {
  border: 2px solid #1890ff !important;
  background: #e6f7ff !important;
}

// 开源数据集相关样式
.dataset-info {
  display: flex;
  align-items: center;
  padding: 4px 11px;
  background: #f5f5f5;
  border-radius: 4px;
  height: 32px;

  .ant-tag {
    margin-right: 8px;
    margin-bottom: 0;
  }
}

// 自定义URL输入框优化
:deep(.ant-input-affix-wrapper .ant-input-suffix .ant-btn) {
  padding: 0 8px;
  height: 22px;
  font-size: 12px;
}
</style>
