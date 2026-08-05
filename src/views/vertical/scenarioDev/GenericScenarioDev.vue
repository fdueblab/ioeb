<template>
  <page-header-wrapper :title="false">
    <a-row :gutter="16" type="flex" class="scenario-dev-layout">
      <a-col
        :xs="24"
        :sm="24"
        :md="16"
        :lg="16"
        :xl="16"
        class="scenario-dev-main"
      >
        <a-card :bordered="false" size="small" title="想定式开发配置" class="config-main-card">
          <div class="table-page-search-wrapper">
            <div class="config-description">
              在左侧对话详细描述你的想定，右侧对话是AI对想定的理解（可通过左侧对话优化、也可直接编辑），页面下部内容是AI对想定的分类（可由AI基于想定自动调整，也可直接选择），用户编辑和选择内容优先。
            </div>
            <a-form layout="vertical" class="config-form">
              <!-- 相关资料（算法优化参考） -->
              <a-row :gutter="16" class="form-section-row">
                <a-col :span="24">
                  <div class="reference-block">
                    <div class="reference-title">
                      相关资料<span class="label-optional">（选填）</span>
                    </div>
                    <a-alert
                      type="warning"
                      show-icon
                      class="reference-hint"
                      message="可提交论文、专利、程序、开源代码或网址作为算法优化参考。智能体将参考这些资料，并在生成时进行差异化创新以规避知识产权争议。"
                    />
                    <div class="reference-upload-row">
                      <a-upload
                        accept=".pdf,.doc,.docx,.txt,.md,.py,.ipynb,.zip"
                        :file-list="referenceFiles"
                        :remove="removeReferenceFile"
                        :customRequest="customReferenceFileChose"
                        :multiple="true">
                        <a-button icon="paper-clip"> 上传论文/专利/代码 </a-button>
                      </a-upload>
                      <span class="upload-hint">支持 PDF / Word / TXT / 代码(.py/.ipynb) / ZIP，可多选</span>
                    </div>
                  </div>
                </a-col>
              </a-row>

              <a-row :gutter="16" class="form-section-row narrative-pair-row">
                <a-col :xs="24" :md="10" class="narrative-pair-col narrative-pair-col--chat">
                  <div class="narrative-pair">
                    <scenario-intent-chat
                      ref="intentChat"
                      :domain="verticalType"
                      :domain-title="domainTitle"
                      :dictionary-snapshot="intakeDictionarySnapshot"
                      :partial-form="intakePartialForm"
                      :disabled="generateLoading"
                      @form-draft="onIntentFormDraft"
                      @busy="intentChatBusy = $event"
                    />
                  </div>
                </a-col>
                <a-col :xs="24" :md="14" class="narrative-pair-col narrative-pair-col--narrative">
                  <div class="narrative-pair narrative-pair--right">
                    <div class="narrative-block">
                      <div class="narrative-title">
                        下面是基于左侧交互、结合用户画像等关联信息形成的算法模型想定（可直接编辑或通过左侧界面继续交互，完成后点击"生成算法模型"）
                      </div>
                      <a-textarea
                        v-model="freeNarrative"
                        :rows="10"
                        class="narrative-textarea"
                        :class="{ 'field-highlight': highlightFields.freeNarrative }"
                        :placeholder="narrativePlaceholder"
                      />
                    </div>
                  </div>
                  <a-form-item :colon="false" class="action-form-item">
                    <div class="form-actions">
                      <span class="form-actions-label">操作：</span>
                      <a-button
                        type="primary"
                        icon="thunderbolt"
                        @click="onGenerateClick"
                        :disabled="generateDisabled"
                        :loading="generateLoading"
                      >
                        生成算法模型
                      </a-button>
                      <a-button
                        v-if="showRegenerateButton"
                        icon="reload"
                        @click="onRegenerateClick"
                      >
                        重新生成算法模型
                      </a-button>
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>

              <!-- 第一行：领域 / 算法模型名称 -->
              <a-row :gutter="16" class="config-section-gap">
                <a-col :xs="24" :sm="8" :md="8">
                  <a-form-item label="领域">
                    <span class="domain-title-text">{{ domainTitle }}</span>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="16" :md="16">
                  <a-form-item label="算法模型名称" required :class="{ 'field-highlight-wrap': highlightFields.serviceName }">
                    <a-input v-model="form.serviceName" placeholder="请输入算法模型名称" @change="onServiceNameInput"/>
                  </a-form-item>
                </a-col>
              </a-row>

              <!-- 第二行：行业 / 场景 / 技术 -->
              <a-row :gutter="16">
                <a-col :xs="24" :sm="8" :md="8">
                  <a-form-item label="行业" :class="{ 'field-highlight-wrap': highlightFields.industry }">
                    <a-select v-model="programInfo.industry" placeholder="请选择行业" allow-clear>
                      <a-select-option v-for="(item, index) in industryOptions" :key="index" :value="item.code">
                        {{ item.text }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="8" :md="8">
                  <a-form-item label="场景" :class="{ 'field-highlight-wrap': highlightFields.scenario }">
                    <a-select v-model="programInfo.scenario" placeholder="请选择场景" allow-clear>
                      <a-select-option v-for="(item, index) in scenarioOptions" :key="index" :value="item.code">
                        {{ item.text }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="8" :md="8">
                  <a-form-item label="技术" :class="{ 'field-highlight-wrap': highlightFields.technology }">
                    <a-select v-model="programInfo.technology" placeholder="请选择技术" allow-clear>
                      <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="item.code">
                        {{ item.text }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <!-- 第三行：数据集文件 / 算法类别 -->
              <a-row :gutter="16">
                <a-col :xs="24" :sm="12" :md="12">
                  <a-form-item label="数据集文件">
                    <div class="dataset-upload-row">
                      <a-upload
                        accept=".csv,.xlsx,.xls,.json,.txt,.pdf"
                        :file-list="datasetFiles"
                        :remove="removeDatasetFile"
                        :customRequest="customDatasetFileChose"
                        :multiple="false">
                        <a-button icon="database"> 选择数据集 </a-button>
                      </a-upload>
                      <span class="upload-hint">支持 CSV / Excel / JSON / TXT / PDF</span>
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="12">
                  <a-form-item label="算法类别" :class="{ 'field-highlight-wrap': highlightFields.algorithmCategory }">
                    <a-select
                      v-model="algorithmCategory"
                      placeholder="请选择算法类别"
                      allow-clear
                      @change="onCategoryChange"
                    >
                      <a-select-option v-for="(item, index) in algorithmCategoryOptions" :key="index" :value="item.code">
                        {{ item.text }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>

              <!-- 类别特定参数面板 -->
              <a-collapse
                v-if="currentCategoryConfig"
                :bordered="false"
                :activeKey="categoryParamsPanelActive"
                @change="(keys) => categoryParamsPanelActive = keys"
                class="spec-collapse"
                :class="{ 'field-highlight-wrap': highlightFields.categoryParams }"
                style="margin-top: 4px;"
              >
                <a-collapse-panel key="params" :header="currentCategoryConfig.label + '（选填）'">
                  <a-row :gutter="16">
                    <template v-for="field in currentCategoryConfig.fields">
                      <a-col :xs="24" :sm="field.type === 'constraint_group' ? 24 : 12" :md="field.type === 'constraint_group' ? 24 : 12" :key="field.key">

                        <!-- 多选下拉 -->
                        <a-form-item v-if="field.type === 'multi_select'">
                          <span slot="label">{{ field.label }}</span>
                          <a-select
                            :value="getCategoryFieldValue(field.key, [])"
                            @change="(val) => setCategoryFieldValue(field.key, val)"
                            mode="multiple"
                            :placeholder="'请选择' + field.label"
                            allow-clear
                          >
                            <a-select-option
                              v-for="opt in (categoryDictCache[field.dictCategory] || [])"
                              :key="opt.code"
                              :value="opt.code"
                            >
                              {{ opt.text }}
                            </a-select-option>
                          </a-select>
                        </a-form-item>

                        <!-- 单选下拉 -->
                        <a-form-item v-else-if="field.type === 'single_select'">
                          <span slot="label">{{ field.label }}</span>
                          <a-select
                            :value="getCategoryFieldValue(field.key, undefined)"
                            @change="(val) => setCategoryFieldValue(field.key, val)"
                            :placeholder="'请选择' + field.label"
                            allow-clear
                          >
                            <a-select-option
                              v-for="opt in (categoryDictCache[field.dictCategory] || [])"
                              :key="opt.code"
                              :value="opt.code"
                            >
                              {{ opt.text }}
                            </a-select-option>
                          </a-select>
                        </a-form-item>

                        <!-- 标签输入 -->
                        <a-form-item v-else-if="field.type === 'tag_input'">
                          <span slot="label">{{ field.label }}</span>
                          <div class="label-tags-container">
                            <a-tag
                              v-for="(tag, idx) in (categoryParams.labels || [])"
                              :key="idx"
                              closable
                              @close="removeLabel(idx)"
                              color="blue"
                            >
                              {{ tag }}
                            </a-tag>
                            <a-input
                              v-if="labelInputVisible"
                              ref="labelInput"
                              size="small"
                              style="width: 120px;"
                              v-model="labelInputValue"
                              @blur="handleLabelInputConfirm"
                              @keyup.enter="handleLabelInputConfirm"
                              placeholder="输入标签名"
                            />
                            <a-tag v-else style="border-style: dashed; cursor: pointer;" @click="showLabelInput">
                              <a-icon type="plus" /> 添加标签
                            </a-tag>
                          </div>
                        </a-form-item>

                        <!-- 开关 -->
                        <a-form-item v-else-if="field.type === 'switch'">
                          <span slot="label">{{ field.label }}</span>
                          <a-switch
                            :checked="getCategoryFieldValue(field.key, false)"
                            @change="(val) => setCategoryFieldValue(field.key, val)"
                          />
                        </a-form-item>

                        <!-- 文本输入 -->
                        <a-form-item v-else-if="field.type === 'text_input'">
                          <span slot="label">{{ field.label }}</span>
                          <a-input
                            :value="getCategoryFieldValue(field.key, '')"
                            @change="(e) => setCategoryFieldValue(field.key, e.target.value)"
                            :placeholder="field.placeholder || ''"
                          />
                        </a-form-item>

                        <!-- 数字输入 -->
                        <a-form-item v-else-if="field.type === 'number_input'">
                          <span slot="label">{{ field.label }}</span>
                          <a-input-number
                            :value="getCategoryFieldValue(field.key, undefined)"
                            @change="(val) => setCategoryFieldValue(field.key, val)"
                            :min="field.min !== undefined ? field.min : 0"
                            :placeholder="field.placeholder || ''"
                            style="width: 100%;"
                          />
                        </a-form-item>

                        <!-- 技术约束复选框组 -->
                        <a-form-item v-else-if="field.type === 'constraint_group'">
                          <span slot="label">{{ field.label }}</span>
                          <a-checkbox-group
                            :value="getCategoryFieldValue(field.key, [])"
                            @change="(val) => setCategoryFieldValue(field.key, val)"
                            class="constraints-group"
                          >
                            <a-row :gutter="[16, 8]">
                              <a-col
                                :xs="24"
                                :sm="12"
                                :md="12"
                                v-for="opt in (categoryDictCache[field.dictCategory] || [])"
                                :key="opt.code"
                              >
                                <a-checkbox :value="opt.code">{{ opt.text }}</a-checkbox>
                              </a-col>
                              <a-col :xs="24" :sm="24" :md="24">
                                <a-checkbox value="custom_constraint">其他约束：</a-checkbox>
                                <a-input
                                  v-if="(getCategoryFieldValue(field.key, []) || []).includes('custom_constraint')"
                                  v-model="customConstraintText"
                                  size="small"
                                  class="custom-constraint-input"
                                  placeholder="请输入自定义约束"
                                />
                              </a-col>
                            </a-row>
                          </a-checkbox-group>
                        </a-form-item>

                      </a-col>
                    </template>
                  </a-row>
                </a-collapse-panel>
              </a-collapse>

            </a-form>
          </div>
        </a-card>
      </a-col>

      <!-- 右侧：生成进度（始终显示，未生成时占位提示） -->
      <a-col
        :xs="24"
        :sm="24"
        :md="8"
        :lg="8"
        :xl="8"
        class="scenario-dev-sidebar"
      >
        <a-card :bordered="false" size="small" class="progress-sidebar-card">
          <div slot="title" class="progress-card-title">
            <div class="progress-card-title-main">
              <a-icon type="info-circle" v-if="!generateProgress.show" />
              <a-icon type="loading" v-else-if="generateProgress.status === 'process'" />
              <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" v-else-if="generateProgress.status === 'finish'" />
              <a-icon type="close-circle" theme="twoTone" two-tone-color="#f5222d" v-else-if="generateProgress.status === 'error'" />
              <span>生成进度</span>
            </div>
            <span v-if="generateProgress.show && progressStepSummary.total > 0" class="progress-card-subtitle">
              {{ progressStepSummary.current }}/{{ progressStepSummary.total }}
            </span>
          </div>

          <div v-if="!generateProgress.show" class="progress-placeholder">
            <a-empty description="填写左侧配置并点击「生成算法模型」">
              <template slot="image">
                <a-icon type="robot" class="progress-placeholder-icon" />
              </template>
            </a-empty>
            <div class="progress-placeholder-steps">
              <div v-for="step in progressPlaceholderSteps" :key="step.step" class="progress-placeholder-step">
                <span class="progress-placeholder-step-num">{{ step.step }}</span>
                <span class="progress-placeholder-step-title">{{ step.title }}</span>
              </div>
            </div>
          </div>

          <div v-else class="publish-steps sidebar-steps">
            <div
              :class="['step-item', {
                'active': generateProgress.status === 'process',
                'completed': generateProgress.status === 'finish',
                'error': generateProgress.status === 'error'
              }]"
            >
              <div class="step-header sidebar-step-header">
                <div class="step-indicator">
                  <a-icon v-if="generateProgress.status === 'finish'" type="check-circle" class="icon-completed" />
                  <a-icon v-else-if="generateProgress.status === 'error'" type="close-circle" class="icon-error" />
                  <a-icon v-else type="loading" class="icon-loading" />
                </div>
                <div class="step-content">
                  <div class="step-title">算法模型生成进度</div>
                  <div class="step-description sidebar-step-description">{{ generateProgress.description }}</div>
                </div>
              </div>

              <div v-if="generateProgress.friendlySteps.length > 0" class="agent-steps friendly-steps timeline-steps">
                <div
                  v-for="(friendlyStep, agentIndex) in generateProgress.friendlySteps"
                  :key="agentIndex"
                  :class="['timeline-item', {
                    'done': friendlyStep.status === 'done',
                    'active': friendlyStep.status === 'active',
                    'pending': friendlyStep.status === 'pending',
                    'warning': friendlyStep.status === 'warning',
                    'last': agentIndex === generateProgress.friendlySteps.length - 1
                  }]"
                >
                  <div class="timeline-track">
                    <span class="timeline-dot">
                      <a-icon v-if="friendlyStep.status === 'done'" type="check" />
                      <a-icon v-else-if="friendlyStep.status === 'active'" type="loading" />
                      <a-icon v-else-if="friendlyStep.status === 'warning'" type="exclamation" />
                      <span v-else class="timeline-dot-num">{{ friendlyStep.step }}</span>
                    </span>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="timeline-step-label">步骤 {{ friendlyStep.step }}</span>
                      <a-tag :color="friendlyStep.status === 'done' ? 'green' : friendlyStep.status === 'active' ? 'blue' : friendlyStep.status === 'warning' ? 'orange' : 'default'">
                        {{ friendlyStep.statusText }}
                      </a-tag>
                    </div>
                    <div class="timeline-title">{{ friendlyStep.title }}</div>
                    <div class="timeline-desc">{{ friendlyStep.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 生成结果（整行展示） -->
    <a-card v-if="generateResult.show" :bordered="false" class="result-full-card">
      <div slot="title">
        <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
        <span style="margin-left: 8px;">算法模型生成完成</span>
      </div>
      <a-button slot="extra" icon="reload" @click="onRegenerateClick">
        重新生成算法模型
      </a-button>

      <a-tabs default-active-key="code">
        <!-- 算法模型说明及源文件（不展示源码全文） -->
        <a-tab-pane key="code" tab="算法模型说明及源文件">
          <div class="model-summary-block">
            <a-descriptions bordered :column="1" size="small">
              <a-descriptions-item label="模型用途">
                {{ generateResult.modelSummary.purpose }}
              </a-descriptions-item>
              <a-descriptions-item label="需要提供的数据">
                {{ generateResult.modelSummary.inputDescription }}
              </a-descriptions-item>
              <a-descriptions-item label="输出结果">
                {{ generateResult.modelSummary.outputDescription }}
              </a-descriptions-item>
              <a-descriptions-item label="适用场景">
                <a-tag v-for="(scene, idx) in generateResult.modelSummary.usageScenarios" :key="idx" color="blue">
                  {{ scene }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="使用提示">
                {{ generateResult.modelSummary.limitations }}
              </a-descriptions-item>
              <a-descriptions-item v-if="generateResult.modelSummary.nextSteps && generateResult.modelSummary.nextSteps.length" label="后续建议">
                <ul class="summary-list">
                  <li v-for="(step, idx) in generateResult.modelSummary.nextSteps" :key="idx">{{ step }}</li>
                </ul>
              </a-descriptions-item>
            </a-descriptions>
          </div>
          <div class="code-header">
            <span class="code-filename">
              <a-icon type="file-text" style="margin-right: 4px;" />
              {{ generateResult.codeFilename || '生成代码' }}
            </span>
            <div>
              <a-button size="small" icon="download" type="primary" @click="downloadCode">下载代码</a-button>
            </div>
          </div>
          <a-alert
            type="info"
            show-icon
            message="源文件已准备好，可下载后交给技术人员部署，也可在「垂域算法模型组件列表」模块查看并下载。"
            style="margin-top: 12px;"
          />
        </a-tab-pane>

        <!-- 六维测试结果 -->
        <a-tab-pane key="test">
          <template slot="tab">
            <a-badge :count="testPassedCount" :number-style="{ backgroundColor: '#52c41a' }" :overflow-count="99">
              <span>测试结果</span>
            </a-badge>
          </template>
          <a-table
            :columns="testColumns"
            :data-source="generateResult.testResults"
            :pagination="false"
            row-key="name"
            size="middle"
          >
            <template slot="status" slot-scope="text">
              <a-tag :color="text === 'passed' ? 'green' : 'orange'">
                {{ text === 'passed' ? '通过' : '警告' }}
              </a-tag>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- 参考资料 -->
        <a-tab-pane key="references">
          <template slot="tab">
            <a-badge :count="generateResult.references.length" :overflow-count="99">
              <span>参考资料</span>
            </a-badge>
          </template>
          <a-list
            :data-source="generateResult.references"
            :locale="{ emptyText: '暂无参考资料' }"
            item-layout="vertical"
          >
            <a-list-item slot="renderItem" slot-scope="item">
              <a-list-item-meta>
                <span slot="title">
                  <a-tag :color="refTypeColor(item.type)">{{ refTypeLabel(item.type) }}</a-tag>
                  {{ item.title }}
                  <a-tag v-if="item.source" color="default" style="margin-left: 4px;">{{ item.source }}</a-tag>
                </span>
                <span slot="description">{{ item.summary }}</span>
              </a-list-item-meta>
              <div v-if="item.what_referenced || item.what_added || item.what_improved || item.advantages_vs_existing || item.ip_considerations" class="ref-detail">
                <p v-if="item.what_referenced"><b>参考了：</b>{{ item.what_referenced }}</p>
                <p v-if="item.what_added"><b>新增了：</b>{{ item.what_added }}</p>
                <p v-if="item.what_improved"><b>提升了：</b>{{ item.what_improved }}</p>
                <p v-if="item.advantages_vs_existing"><b>对比优势：</b>{{ item.advantages_vs_existing }}</p>
                <p v-if="item.ip_considerations"><b>知识产权规避：</b>{{ item.ip_considerations }}</p>
              </div>
            </a-list-item>
          </a-list>
        </a-tab-pane>

        <!-- 差异化说明 -->
        <a-tab-pane v-if="generateResult.differentiationSummary" key="differentiation" tab="差异化说明">
          <div class="differentiation-block">
            <a-alert
              v-if="diff.overall_strategy"
              type="success"
              show-icon
              :message="'整体策略：' + diff.overall_strategy"
              style="margin-bottom: 16px;"
            />
            <a-descriptions bordered :column="1" size="middle">
              <a-descriptions-item label="关键创新（新增了什么）">
                <ul v-if="diff.key_innovations && diff.key_innovations.length" class="diff-list">
                  <li v-for="(it, i) in diff.key_innovations" :key="'k' + i">{{ it }}</li>
                </ul>
                <span v-else class="diff-empty">—</span>
              </a-descriptions-item>
              <a-descriptions-item label="提升了什么">
                <ul v-if="diff.improvements && diff.improvements.length" class="diff-list">
                  <li v-for="(it, i) in diff.improvements" :key="'i' + i">{{ it }}</li>
                </ul>
                <span v-else class="diff-empty">—</span>
              </a-descriptions-item>
              <a-descriptions-item label="对比现有算法的特点与优势">
                <ul v-if="diff.advantages && diff.advantages.length" class="diff-list">
                  <li v-for="(it, i) in diff.advantages" :key="'a' + i">{{ it }}</li>
                </ul>
                <span v-else class="diff-empty">—</span>
              </a-descriptions-item>
              <a-descriptions-item v-if="diff.ip_risk_notes" label="知识产权风险规避">
                {{ diff.ip_risk_notes }}
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </page-header-wrapper>
</template>

<script>
/* eslint-disable */
import { Modal } from 'ant-design-vue'
import { streamAgent } from '@/utils/request'
import dictionaryCache from '@/utils/dictionaryCache'
import { uploadScenarioGeneratedAlgorithm } from '@/api/service'
import ScenarioIntentChat from './components/ScenarioIntentChat.vue'

const ALGORITHM_CATEGORY_FALLBACK = [
  { code: 'classification', text: '分类算法' },
  { code: 'detection', text: '检测算法' },
  { code: 'regression', text: '回归/预测算法' },
  { code: 'clustering', text: '聚类算法' },
  { code: 'generation', text: '生成算法' },
  { code: 'recommendation', text: '推荐算法' },
]

const ALGO_DICT_FALLBACK = {
  algo_input_type: [
    { code: 'video_url', text: '视频 URL' },
    { code: 'image_url', text: '图像 URL' },
    { code: 'text', text: '文本' },
    { code: 'file_path', text: '文件路径' },
    { code: 'api_response', text: 'API 响应' },
    { code: 'binary_data', text: '二进制数据' },
    { code: 'structured_data', text: '结构化数据' },
    { code: 'time_series', text: '时序数据' },
    { code: 'custom', text: '自定义' },
  ],
  algo_constraint: [
    { code: 'no_llm', text: '不使用 LLM / 大语言模型' },
    { code: 'no_training', text: '不需要训练或微调' },
    { code: 'no_gpu', text: '不需要 GPU' },
    { code: 'pretrained_only', text: '仅使用预训练模型（推理模式）' },
    { code: 'rule_based', text: '纯规则 / 启发式方法' },
    { code: 'single_file', text: '单文件实现' },
  ],
  algo_classification_output_type: [
    { code: 'classification_label', text: '分类标签' },
    { code: 'confidence_list', text: '置信度列表' },
    { code: 'json_structure', text: 'JSON 结构' },
    { code: 'text_report', text: '文本报告' },
  ],
  algo_detection_target_type: [
    { code: 'object', text: '物体检测' },
    { code: 'anomaly', text: '异常值检测' },
    { code: 'event', text: '事件检测' },
    { code: 'defect', text: '缺陷检测' },
    { code: 'face', text: '人脸检测' },
    { code: 'text_region', text: '文本区域检测' },
  ],
  algo_detection_output_format: [
    { code: 'bounding_box', text: '边界框坐标' },
    { code: 'confidence_score', text: '置信度分数' },
    { code: 'anomaly_score', text: '异常分数' },
    { code: 'detection_report', text: '检测报告' },
  ],
  algo_regression_time_granularity: [
    { code: 'second', text: '秒级' },
    { code: 'minute', text: '分钟级' },
    { code: 'hour', text: '小时级' },
    { code: 'day', text: '天级' },
    { code: 'week', text: '周级' },
    { code: 'month', text: '月级' },
    { code: 'none', text: '不涉及时序' },
  ],
  algo_regression_metric: [
    { code: 'mae', text: 'MAE' },
    { code: 'rmse', text: 'RMSE' },
    { code: 'r2', text: 'R²' },
    { code: 'mape', text: 'MAPE' },
  ],
  algo_clustering_method: [
    { code: 'distance_based', text: '基于距离' },
    { code: 'density_based', text: '基于密度' },
    { code: 'hierarchical', text: '基于层次' },
    { code: 'model_based', text: '基于模型' },
  ],
  algo_clustering_output_format: [
    { code: 'cluster_labels', text: '簇标签' },
    { code: 'cluster_centers', text: '聚类中心' },
    { code: 'visualization', text: '可视化图表' },
    { code: 'cluster_report', text: '聚类报告' },
  ],
  algo_generation_target_type: [
    { code: 'text', text: '文本' },
    { code: 'image', text: '图像' },
    { code: 'audio', text: '音频' },
    { code: 'structured_data', text: '结构化数据' },
    { code: 'code', text: '代码' },
  ],
  algo_generation_quality: [
    { code: 'diversity_first', text: '多样性优先' },
    { code: 'quality_first', text: '质量优先' },
    { code: 'speed_first', text: '速度优先' },
  ],
  algo_recommendation_strategy: [
    { code: 'collaborative_filtering', text: '协同过滤' },
    { code: 'content_based', text: '基于内容' },
    { code: 'hybrid', text: '混合推荐' },
    { code: 'knowledge_graph', text: '基于知识图谱' },
  ],
}

const DEFAULT_MODEL_SUMMARY = {
  purpose: '根据您填写的应用场景，生成一个可下载、可交给技术人员进一步部署的算法模型源文件。',
  inputDescription: '可使用您填写的需求描述、数据集文件以及相关资料作为生成依据。',
  outputDescription: '输出算法模型源文件、基础检查结果、参考资料说明和差异化说明。',
  usageScenarios: ['业务初步验证', '算法方案原型', '后续技术开发参考'],
  limitations: '如果场景描述、输入样例或评价标准不够完整，生成结果可能还需要进一步补充和人工校核。',
  nextSteps: ['补充更具体的输入输出样例', '明确业务规则和评价指标', '由技术人员结合真实数据进行测试']
}

const AML_DEMO_VERTICAL_TYPE = 'aml'
const HEALTH_DEMO_VERTICAL_TYPE = 'health'

const HEALTH_LINEZOLID_DEMO = {
  modelName: '利奈唑胺个体化给药剂量预测模型',
  codeFilename: 'linezolid_dose_optimizer.py',
  narrative: '请面向乡村医疗AI应用中的基层医疗卫生和远程会诊支持场景，生成一个利奈唑胺个体化给药剂量预测模型。模型需要参考开源项目 Linezolid_repo 和 Journal of Antimicrobial Chemotherapy 相关研究资料，接收患者性别、年龄、身高、体重、血清肌酐、总胆红素和目标 AUC24h 范围，输出体表面积、eGFR、推荐单次剂量、给药间隔、每日总剂量和预测 AUC24h，辅助基层医生在远程药学会诊中快速形成可解释的给药建议。',
  categoryParams: {
    inputTypes: ['structured_data'],
    predictionTarget: '利奈唑胺单次推荐剂量、每日总剂量和预测 AUC24h',
    timeGranularity: 'none',
    metrics: ['mae', 'rmse'],
    constraints: ['single_file', 'rule_based']
  },
  generatedCode: `import math
import numpy as np
from scipy.integrate import solve_ivp


POP_PARAMS = {
    "TVCLNR": 3.27,
    "TVCLR": 1.71,
    "TVV": 43.3,
    "TVKA": 1.34,
    "TVF1": 1.0,
}


def calculate_bsa(height_cm, weight_kg):
    """使用 Mosteller 公式计算体表面积。"""
    return round(math.sqrt(height_cm * weight_kg / 3600), 2)


def calculate_egfr(scr_umol_l, sex, age):
    """使用 CKD-EPI 公式估算 eGFR。sex: 1=男性, 0=女性。"""
    k = 80 if sex == 1 else 62
    a = -0.411 if sex == 1 else -0.329
    c = 1 if sex == 1 else 1.018
    b = a if scr_umol_l <= k else -1.209
    return round(141 * c * (scr_umol_l / k) ** b * 0.993 ** age, 2)


def linezolid_ode_system(t, y, cl, v, ka, f1):
    depot, centr, auc = y
    concentration = centr / v
    return [-ka * depot, f1 * ka * depot - cl * concentration, concentration]


def simulate_linezolid_pk(dose, interval, parameters, simulation_time=240):
    cl = parameters["indCLNR"] + parameters["indCLR"]
    v = parameters["indV"]
    ka = parameters["indKA"]
    f1 = parameters["indF1"]
    y0 = [0, 0, 0]
    time_points = []
    states = []

    for dose_time in range(0, simulation_time, interval):
        if states:
            y0 = states[-1].copy()
            y0[1] += dose
        else:
            y0[1] = dose

        t_span = [dose_time, dose_time + min(interval, simulation_time - dose_time)]
        t_eval = np.linspace(t_span[0], t_span[1], 100)
        sol = solve_ivp(
            linezolid_ode_system,
            t_span,
            y0,
            args=(cl, v, ka, f1),
            method="RK45",
            t_eval=t_eval,
        )
        time_points.extend(sol.t)
        states.extend(sol.y[:, i] for i in range(len(sol.t)))

    times = np.array(time_points)
    results = np.array(states)
    auc_24h = results[-1][2] - results[np.searchsorted(times, times[-1] - 24)][2]
    return round(float(auc_24h))


def main_process(patient):
    """
    输入示例:
    {
        "sex": 1, "age": 65, "height": 170, "weight": 70,
        "scr": 95.0, "tb": 28.0, "auc_range": [160, 240]
    }
    """
    sex = int(patient["sex"])
    age = int(patient["age"])
    height = int(patient["height"])
    weight = int(patient["weight"])
    scr = float(patient["scr"])
    tb = float(patient["tb"])
    auc_range = patient.get("auc_range", [160, 240])

    bsa = calculate_bsa(height, weight)
    egfr = calculate_egfr(scr, sex, age)
    interval = 12
    target_auc_24h = round(math.sqrt(auc_range[0] * auc_range[1]))
    age_ind = 1 if age > 40 else 0
    tb_ind = 1 if tb > 400 else 0

    cl_nr = POP_PARAMS["TVCLNR"] + 3.43 * (bsa - 1.89) - 0.0225 * (age - 40) * age_ind - 0.00486 * (tb - 400) * tb_ind
    cl_r = POP_PARAMS["TVCLR"] * (egfr / 80) ** 0.41
    cov_dose = round((target_auc_24h / (24 / interval)) * (cl_nr + cl_r))

    parameters = {
        "indCLNR": cl_nr,
        "indCLR": cl_r,
        "indV": POP_PARAMS["TVV"] * math.exp(0.902 * (bsa - 1.89)),
        "indKA": POP_PARAMS["TVKA"],
        "indF1": POP_PARAMS["TVF1"],
    }
    auc_24 = simulate_linezolid_pk(cov_dose, interval, parameters)

    return {
        "bsa": bsa,
        "egfr": egfr,
        "dose": cov_dose,
        "interval": interval,
        "daily_dose": round(cov_dose * (24 / interval)),
        "auc_24": auc_24,
        "target_auc": target_auc_24h,
        "advice": "该结果用于基层医疗远程会诊辅助，不替代医生处方；上线前需结合 TDM 和院内药学规范验证。",
    }
`,
  modelSummary: {
    purpose: '面向乡村医疗AI应用场景，为基层医疗机构提供利奈唑胺个体化给药剂量预测和远程药学会诊辅助。',
    inputDescription: '患者结构化数据：性别、年龄、身高、体重、血清肌酐、总胆红素，以及目标 AUC24h 范围。',
    outputDescription: '输出体表面积、eGFR、推荐单次剂量、给药间隔、每日总剂量、预测 AUC24h 和会诊提示。',
    usageScenarios: ['基层医疗卫生', '远程会诊支持', '抗菌药个体化给药', '乡村医院药学辅助决策'],
    limitations: '该模型用于演示和辅助决策，不替代医生处方；临床使用前需要结合治疗药物监测、医院药学规范和真实病例数据进行验证。',
    nextSteps: [
      '接入基层医院 HIS/LIS 中的患者基础信息和检验结果',
      '补充治疗药物监测数据，校准 AUC24h 预测精度',
      '封装为 MCP 服务，供乡村医疗智能体在远程会诊中调用'
    ]
  },
  testResults: [
    { name: '功能完整性', status: 'passed', description: '通过', details: '已覆盖患者输入校验、BSA/eGFR 计算、PK 仿真、推荐剂量和 AUC24h 输出。' },
    { name: '可解释性', status: 'passed', description: '通过', details: '输出中保留体表面积、eGFR、目标 AUC 与预测 AUC，便于药师和医生复核。' },
    { name: '部署可行性', status: 'passed', description: '通过', details: '单文件 Python 实现，依赖 numpy/scipy，可进一步封装为 FastAPI 或 MCP 工具。' },
    { name: '隐私安全', status: 'passed', description: '通过', details: '仅使用必要的结构化生理指标，未引入姓名、身份证号等直接身份信息。' },
    { name: '临床风险', status: 'warning', description: '需人工复核', details: '模型建议必须由医生或临床药师结合病情、合并用药、TDM 和院内规范确认。' },
    { name: '参考资料一致性', status: 'passed', description: '通过', details: '算法结构参考开源仓库 Linezolid_repo，并结合 JAC 论文中个体化给药与 AUC 目标思路进行展示化整理。' }
  ],
  references: [
    {
      type: 'repo',
      title: 'PolarSnowLeopard/Linezolid_repo',
      source: 'GitHub',
      summary: '利奈唑胺剂量计算与药代动力学仿真示例仓库。',
      what_referenced: '参考了 PatientData/DoseResult 输入输出结构、BSA/eGFR 计算、群体药代参数和 AUC24h 仿真流程。',
      what_added: '补充了平台统一的 main_process 入口、基层医疗会诊提示和隐私合规说明。',
      what_improved: '将多文件示例整理成便于平台下载和后续 MCP 封装的单文件算法模型。',
      advantages_vs_existing: '更适合在智能体平台中作为算法模型生成结果展示，并可直接衔接后续 MCP 服务封装。',
      ip_considerations: '演示结果保留来源说明，并通过接口结构、输出说明和部署形态调整形成差异化表达。'
    },
    {
      type: 'paper',
      title: 'Journal of Antimicrobial Chemotherapy 80(7):1915 相关研究资料',
      source: 'Oxford Academic',
      summary: '围绕利奈唑胺药代动力学、目标暴露和个体化给药优化的参考资料。',
      what_referenced: '参考其以 AUC24h 为核心目标的个体化给药优化思路。',
      what_added: '结合乡村医疗场景增加远程会诊、基层医生复核和临床风险提示。',
      what_improved: '将论文知识转化为可解释、可下载、可封装的算法模型演示资产。',
      advantages_vs_existing: '更强调基层应用可落地性和平台资源库复用。',
      ip_considerations: '不复刻论文全文或数据，仅作为算法需求和临床指标设计参考。'
    }
  ],
  differentiationSummary: {
    overall_strategy: '以开源 Linezolid_repo 为算法基础，围绕乡村医疗远程会诊场景做平台化、单文件化和可解释化改造。',
    key_innovations: [
      '增加面向基层医生的 main_process 统一入口，便于被平台、MCP 服务或智能体调用。',
      '在输出中同时给出剂量、AUC24h、eGFR 和临床复核提示，增强药学会诊可解释性。',
      '将模型定位为乡村医疗场景下的辅助决策工具，明确不替代医生处方。'
    ],
    improvements: [
      '从示例代码整理为可下载的算法模型源文件。',
      '补充隐私最小化、临床人工复核和后续 TDM 校准建议。',
      '更适配平台“生成算法模型 -> MCP服务封装 -> 智能体生成”的演示链路。'
    ],
    advantages: [
      '生成速度稳定，适合现场演示。',
      '业务故事完整，能体现医疗企业家关注的基层落地价值。',
      '结果页包含模型说明、测试结果、参考资料和差异化说明，展示效果完整。'
    ],
    ip_risk_notes: 'Mock 内容已标注参考来源，并通过场景定位、接口封装、输出说明和合规提示形成展示用途的差异化表达；正式商用前仍需完成开源协议和论文引用合规审查。'
  }
}

const AML_TRANSACTION_DEMO = {
  modelName: '跨境支付可疑交易风险识别模型',
  codeFilename: 'cross_border_payment_risk_classifier.py',
  narrative: '请面向跨境支付AI监测中的金融风控和反洗钱场景，生成一个可疑交易风险识别分类模型。模型需要接收跨境支付交易金额、交易频次、国家地区风险、设备风险、收付款方关系、历史拒付记录、制裁名单命中情况等结构化字段，输出风险等级、可疑原因、置信度和处置建议，用于帮助风控人员在大额跨境转账、异常频繁交易和高风险地区交易中快速识别潜在洗钱风险。',
  categoryParams: {
    inputTypes: ['structured_data', 'api_response'],
    outputTypes: ['classification_label', 'confidence_list', 'json_structure'],
    labels: ['低风险', '中风险复核', '高风险拦截'],
    multiLabel: false,
    constraints: ['single_file', 'rule_based']
  },
  generatedCode: `import math


HIGH_RISK_COUNTRIES = {"IR", "KP", "SY", "MM", "AF"}
WATCH_COUNTRIES = {"TR", "AE", "VN", "TH", "NG"}


def _to_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _to_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def score_cross_border_payment(transaction):
    amount = _to_float(transaction.get("amount_usd"))
    daily_count = _to_int(transaction.get("daily_txn_count"))
    monthly_amount = _to_float(transaction.get("monthly_amount_usd"))
    country = str(transaction.get("destination_country", "")).upper()
    device_risk = _to_float(transaction.get("device_risk_score"))
    counterparty_age_days = _to_int(transaction.get("counterparty_age_days"))
    chargeback_count = _to_int(transaction.get("chargeback_count_90d"))
    sanctions_hit = bool(transaction.get("sanctions_hit"))
    same_ip_multi_accounts = bool(transaction.get("same_ip_multi_accounts"))

    score = 0
    reasons = []

    if sanctions_hit:
        score += 45
        reasons.append("命中制裁或重点关注名单")
    if country in HIGH_RISK_COUNTRIES:
        score += 28
        reasons.append("目的地属于高风险国家或地区")
    elif country in WATCH_COUNTRIES:
        score += 12
        reasons.append("目的地属于重点观察国家或地区")
    if amount >= 50000:
        score += 18
        reasons.append("单笔交易金额显著偏高")
    elif amount >= 10000:
        score += 8
        reasons.append("单笔交易金额较高")
    if daily_count >= 8:
        score += 15
        reasons.append("日内交易频次异常")
    if monthly_amount >= 200000:
        score += 12
        reasons.append("月累计跨境交易金额偏高")
    if device_risk >= 0.8:
        score += 12
        reasons.append("设备或登录环境风险较高")
    if counterparty_age_days < 7:
        score += 10
        reasons.append("新收款方建立后短期内发生交易")
    if chargeback_count >= 2:
        score += 8
        reasons.append("近期存在多次拒付或争议记录")
    if same_ip_multi_accounts:
        score += 8
        reasons.append("同一网络环境关联多个账户")

    score = max(0, min(100, score))
    confidence = round(1 / (1 + math.exp(-(score - 50) / 12)), 3)

    if score >= 70:
        label = "高风险拦截"
        recommendation = "建议自动拦截并进入增强尽调流程，必要时提交人工复核。"
    elif score >= 40:
        label = "中风险复核"
        recommendation = "建议补充交易背景、合同发票和收付款方关系材料后人工复核。"
    else:
        label = "低风险"
        recommendation = "可按常规规则放行，并持续监测后续交易行为。"

    return {
        "risk_label": label,
        "risk_score": score,
        "confidence": confidence,
        "reasons": reasons or ["未发现明显异常风险因子"],
        "recommendation": recommendation,
    }


def main_process(transaction):
    """
    输入示例:
    {
        "amount_usd": 68000,
        "daily_txn_count": 9,
        "monthly_amount_usd": 260000,
        "destination_country": "AE",
        "device_risk_score": 0.82,
        "counterparty_age_days": 3,
        "chargeback_count_90d": 1,
        "sanctions_hit": false,
        "same_ip_multi_accounts": true
    }
    """
    if not isinstance(transaction, dict):
        raise ValueError("transaction must be a dict")
    return score_cross_border_payment(transaction)
`,
  modelSummary: {
    purpose: '面向跨境支付AI监测场景，为金融风控和反洗钱团队提供可疑交易风险等级识别、原因解释和处置建议。',
    inputDescription: '跨境支付结构化交易数据：交易金额、交易频次、目的国家地区、设备风险、收付款方关系、拒付记录、制裁名单命中等字段。',
    outputDescription: '输出风险等级、风险分数、置信度、可疑原因列表和业务处置建议。',
    usageScenarios: ['金融风控', '反洗钱监测', '大额跨境转账审核', '高风险地区交易识别'],
    limitations: '该模型用于演示和辅助初筛，正式使用前需要接入真实交易样本、名单服务、机构规则库和人工复核闭环进行校准。',
    nextSteps: [
      '接入真实跨境支付交易流水和黑白名单服务',
      '根据机构历史 SAR/STR 案例校准风险阈值',
      '封装为 MCP 服务，供反洗钱智能体在调查流程中调用'
    ]
  },
  testResults: [
    { name: '功能完整性', status: 'passed', description: '通过', details: '已覆盖交易特征解析、风险打分、等级分类、原因解释和处置建议输出。' },
    { name: '可解释性', status: 'passed', description: '通过', details: '每个风险分数均对应可读原因，便于风控人员复核和展示。' },
    { name: '部署可行性', status: 'passed', description: '通过', details: '单文件 Python 实现，无需模型训练即可作为规则增强型原型部署。' },
    { name: '合规适配', status: 'passed', description: '通过', details: '结果保留人工复核和增强尽调建议，适合演示反洗钱辅助决策流程。' },
    { name: '数据安全', status: 'passed', description: '通过', details: '示例仅使用交易风险字段，不包含银行卡号、身份证号等直接敏感标识。' },
    { name: '模型泛化', status: 'warning', description: '需校准', details: '上线前应使用真实机构样本、名单数据和历史可疑案例调整阈值。' }
  ],
  references: [
    {
      type: 'model',
      title: '跨境支付反洗钱风险规则库',
      source: '平台演示知识库',
      summary: '围绕大额交易、频繁交易、高风险地区、制裁名单和设备异常等因子构建的演示规则集合。',
      what_referenced: '参考了反洗钱场景中常见的交易监测指标和增强尽调触发条件。',
      what_added: '新增了面向平台展示的风险分数、置信度、原因列表和处置建议结构。',
      what_improved: '将分散规则整理为统一 main_process 算法入口，便于后续服务封装和智能体调用。',
      advantages_vs_existing: '既能快速演示生成结果，也能讲清楚风控业务人员关心的“为什么判为可疑”。',
      ip_considerations: '使用通用风险因子构建演示 Mock，不复刻具体机构私有规则或真实客户数据。'
    },
    {
      type: 'url',
      title: '跨境支付交易监测业务流程示例',
      source: '平台业务样例',
      summary: '用于展示从交易数据接入、算法识别、人工复核到处置建议的完整演示链路。',
      what_referenced: '参考了平台中跨境支付AI监测垂域的行业、场景和异常识别技术配置。',
      what_added: '补充了可下载源码、测试结果和差异化说明，便于现场演示。',
      what_improved: '让“算法模型想定式开发”模块可以稳定呈现完整生成成果。',
      advantages_vs_existing: '无需等待真实智能体执行，演示流程更可控。',
      ip_considerations: 'Mock 数据为演示用途，不包含真实交易主体和生产规则。'
    }
  ],
  differentiationSummary: {
    overall_strategy: '围绕跨境支付反洗钱场景，将常见风险因子封装为可解释的分类算法原型，突出平台从需求配置到算法结果展示的能力。',
    key_innovations: [
      '将交易金额、频次、国家地区、设备风险和名单命中统一纳入风险评分。',
      '输出风险等级的同时给出可疑原因和处置建议，便于业务人员理解。',
      '采用单文件 main_process 入口，便于继续封装为 MCP 服务或智能体工具。'
    ],
    improvements: [
      '相比普通规则列表，结果包含置信度、原因解释和后续复核建议。',
      '相比真实生成流程，演示时间和结果更稳定。',
      '更适配“生成算法模型 -> MCP服务封装 -> 智能体生成”的平台展示链路。'
    ],
    advantages: [
      '场景贴近金融科技企业和监管科技企业关注点。',
      '可直接演示跨境支付风控、反洗钱和异常识别能力。',
      '结果页包含模型说明、测试结果、参考资料和差异化说明，展示完整。'
    ],
    ip_risk_notes: '该 Mock 使用通用反洗钱风险因子和虚构字段，不包含真实机构私有规则、客户数据或生产名单；正式商用前仍需完成合规审查和机构规则校准。'
  }
}

const CATEGORY_PARAMS_CONFIG = {
  classification: {
    label: '分类算法参数',
    fields: [
      { key: 'inputTypes', label: '输入数据类型', type: 'multi_select', dictCategory: 'algo_input_type', required: false },
      { key: 'outputTypes', label: '输出数据类型', type: 'multi_select', dictCategory: 'algo_classification_output_type', required: false },
      { key: 'labels', label: '分类标签定义', type: 'tag_input', required: false },
      { key: 'multiLabel', label: '是否多标签分类', type: 'switch', required: false },
      { key: 'constraints', label: '技术约束', type: 'constraint_group', dictCategory: 'algo_constraint', required: false },
    ]
  },
  detection: {
    label: '检测算法参数',
    fields: [
      { key: 'inputTypes', label: '输入数据类型', type: 'multi_select', dictCategory: 'algo_input_type', required: false },
      { key: 'targetTypes', label: '检测目标类型', type: 'multi_select', dictCategory: 'algo_detection_target_type', required: false },
      { key: 'outputFormats', label: '输出格式', type: 'multi_select', dictCategory: 'algo_detection_output_format', required: false },
      { key: 'realtime', label: '是否需要实时检测', type: 'switch', required: false },
      { key: 'constraints', label: '技术约束', type: 'constraint_group', dictCategory: 'algo_constraint', required: false },
    ]
  },
  regression: {
    label: '回归/预测算法参数',
    fields: [
      { key: 'inputTypes', label: '输入数据类型', type: 'multi_select', dictCategory: 'algo_input_type', required: false },
      { key: 'predictionTarget', label: '预测目标', type: 'text_input', placeholder: '请描述预测的目标变量', required: false },
      { key: 'timeGranularity', label: '时间粒度', type: 'single_select', dictCategory: 'algo_regression_time_granularity', required: false },
      { key: 'metrics', label: '评估指标偏好', type: 'multi_select', dictCategory: 'algo_regression_metric', required: false },
      { key: 'constraints', label: '技术约束', type: 'constraint_group', dictCategory: 'algo_constraint', required: false },
    ]
  },
  clustering: {
    label: '聚类算法参数',
    fields: [
      { key: 'inputTypes', label: '输入数据类型', type: 'multi_select', dictCategory: 'algo_input_type', required: false },
      { key: 'clusterCount', label: '期望聚类数', type: 'number_input', placeholder: '0 表示自动确定', min: 0, required: false },
      { key: 'methods', label: '聚类方法偏好', type: 'multi_select', dictCategory: 'algo_clustering_method', required: false },
      { key: 'outputFormats', label: '输出格式', type: 'multi_select', dictCategory: 'algo_clustering_output_format', required: false },
      { key: 'constraints', label: '技术约束', type: 'constraint_group', dictCategory: 'algo_constraint', required: false },
    ]
  },
  generation: {
    label: '生成算法参数',
    fields: [
      { key: 'inputTypes', label: '输入数据类型', type: 'multi_select', dictCategory: 'algo_input_type', required: false },
      { key: 'targetTypes', label: '生成目标类型', type: 'multi_select', dictCategory: 'algo_generation_target_type', required: false },
      { key: 'generateCount', label: '生成数量控制', type: 'number_input', placeholder: '单次生成数量', min: 1, required: false },
      { key: 'qualityPreference', label: '质量控制偏好', type: 'multi_select', dictCategory: 'algo_generation_quality', required: false },
      { key: 'constraints', label: '技术约束', type: 'constraint_group', dictCategory: 'algo_constraint', required: false },
    ]
  },
  recommendation: {
    label: '推荐算法参数',
    fields: [
      { key: 'inputTypes', label: '输入数据类型', type: 'multi_select', dictCategory: 'algo_input_type', required: false },
      { key: 'recommendTarget', label: '推荐目标', type: 'text_input', placeholder: '请描述推荐的目标对象', required: false },
      { key: 'strategies', label: '推荐策略偏好', type: 'multi_select', dictCategory: 'algo_recommendation_strategy', required: false },
      { key: 'topK', label: 'Top-K 推荐数量', type: 'number_input', placeholder: '返回的推荐结果数', min: 1, required: false },
      { key: 'constraints', label: '技术约束', type: 'constraint_group', dictCategory: 'algo_constraint', required: false },
    ]
  }
}

const PROGRESS_PLACEHOLDER_STEPS = [
  { step: 1, title: '理解需求和应用场景' },
  { step: 2, title: '强化算法方案' },
  { step: 3, title: '生成算法模型源文件' },
  { step: 4, title: '检查结果完整性' },
  { step: 5, title: '整理说明与源文件' }
]

export default {
  name: 'GenericScenarioDev',
  components: {
    ScenarioIntentChat
  },
  props: {
    verticalType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      domainTitle: '',
      datasetFiles: [],
      uploadDatasetFiles: [],
      referenceFiles: [],
      uploadReferenceFiles: [],
      freeNarrative: '',
      highlightFields: {
        freeNarrative: false,
        industry: false,
        scenario: false,
        technology: false,
        algorithmCategory: false,
        categoryParams: false,
        serviceName: false
      },
      highlightTimers: {},
      form: {
        serviceName: undefined
      },
      serviceNameAutoValue: '',
      serviceNameTouched: false,
      programInfo: {
        industry: undefined,
        scenario: undefined,
        technology: undefined
      },
      algorithmCategory: undefined,
      algorithmCategoryOptions: [],
      categoryParams: {},
      categoryDictCache: {},
      labelInputVisible: false,
      labelInputValue: '',
      customConstraintText: '',
      categoryParamsPanelActive: ['params'],
      industryOptions: [],
      scenarioOptions: [],
      technologyOptions: [],
      generateLoading: false,
      activeGenerateSessionId: 0,
      activeStreamAbortController: null,
      demoProgressTimerIds: [],
      generateProgress: {
        show: false,
        status: 'process',
        description: '',
        expanded: true,
        agentSteps: [],
        friendlySteps: []
      },
      generateResult: {
        show: false,
        generatedCode: '',
        codeFilename: '',
        modelSummary: { ...DEFAULT_MODEL_SUMMARY },
        testResults: [],
        references: [],
        differentiationSummary: null
      },
      testColumns: [
        { title: '测试维度', dataIndex: 'name', key: 'name', width: 120 },
        { title: '状态', dataIndex: 'status', key: 'status', width: 80, scopedSlots: { customRender: 'status' } },
        { title: '描述', dataIndex: 'description', key: 'description', width: 160 },
        { title: '详情', dataIndex: 'details', key: 'details' }
      ]
    }
  },
  computed: {
    generateDisabled() {
      const name = (this.form.serviceName || '').trim()
      const narrative = (this.freeNarrative || '').trim()
      return !name || !narrative
    },
    narrativePlaceholder() {
      return '请详细描述您希望生成的算法服务功能；也可先在左侧用自然语言描述，由智能体完善到此处。'
    },
    generatedNarrativeContent() {
      const parts = []

      // 第一部分：页面上端各设定选项内容
      const settings = []
      if (this.programInfo.industry) {
        const industryText = this.getTextFromOptions(this.industryOptions, this.programInfo.industry)
        if (industryText) settings.push(`行业：${industryText}`)
      }
      if (this.programInfo.scenario) {
        const scenarioText = this.getTextFromOptions(this.scenarioOptions, this.programInfo.scenario)
        if (scenarioText) settings.push(`场景：${scenarioText}`)
      }
      if (this.programInfo.technology) {
        const technologyText = this.getTextFromOptions(this.technologyOptions, this.programInfo.technology)
        if (technologyText) settings.push(`技术：${technologyText}`)
      }
      if (this.algorithmCategory) {
        const categoryText = this.getTextFromOptions(this.algorithmCategoryOptions, this.algorithmCategory)
        if (categoryText) settings.push(`算法类别：${categoryText}`)
      }

      // 类别参数转换为中文显示
      if (Object.keys(this.categoryParams || {}).length > 0) {
        const categoryParamsText = this.formatCategoryParamsToText(this.categoryParams)
        if (categoryParamsText) {
          settings.push(categoryParamsText)
        }
      }

      if (settings.length > 0) {
        parts.push(settings.join('\n'))
      }

      // 第二部分：AI生成的算法模型想定场景、显式规则、隐式规则、特殊情况处理、功能性能要求、测试反馈
      // 只在非第一次生成时显示
      if (this.generateResult.show && this.generateResult.modelSummary) {
        const aiContent = []

        // 想定场景
        if (this.generateResult.modelSummary.usageScenarios && this.generateResult.modelSummary.usageScenarios.length > 0) {
          aiContent.push(`想定场景：${this.generateResult.modelSummary.usageScenarios.join('、')}`)
        }

        // 功能描述
        if (this.generateResult.modelSummary.purpose) {
          aiContent.push(`功能描述：${this.generateResult.modelSummary.purpose}`)
        }

        // 输入描述
        if (this.generateResult.modelSummary.inputDescription) {
          aiContent.push(`输入数据：${this.generateResult.modelSummary.inputDescription}`)
        }

        // 输出描述
        if (this.generateResult.modelSummary.outputDescription) {
          aiContent.push(`输出结果：${this.generateResult.modelSummary.outputDescription}`)
        }

        // 测试反馈
        if (this.generateResult.testResults && this.generateResult.testResults.length > 0) {
          const testSummary = this.generateResult.testResults.map(t =>
            `${t.name}：${t.description}`
          ).join('；')
          aiContent.push(`测试反馈：${testSummary}`)
        }

        // 使用限制
        if (this.generateResult.modelSummary.limitations) {
          aiContent.push(`使用限制：${this.generateResult.modelSummary.limitations}`)
        }

        // 后续建议
        if (this.generateResult.modelSummary.nextSteps && this.generateResult.modelSummary.nextSteps.length > 0) {
          aiContent.push(`后续建议：${this.generateResult.modelSummary.nextSteps.join('；')}`)
        }

        if (aiContent.length > 0) {
          parts.push('\n' + aiContent.join('\n'))
        }
      }

      return parts.join('\n')
    },
    intakePartialForm() {
      return {
        model_name: this.form.serviceName || '',
        free_narrative: this.freeNarrative || '',
        industry: this.programInfo.industry,
        scenario: this.programInfo.scenario,
        technology: this.programInfo.technology,
        algorithm_category: this.algorithmCategory,
        category_params: { ...(this.categoryParams || {}) }
      }
    },
    intakeDictionarySnapshot() {
      const snap = {
        industry: this.industryOptions || [],
        scenario: this.scenarioOptions || [],
        technology: this.technologyOptions || [],
        algorithm_category: this.algorithmCategoryOptions || []
      }
      Object.keys(this.categoryDictCache || {}).forEach(key => {
        snap[key] = this.categoryDictCache[key] || []
      })
      // 常用约束/输入类型 fallback，便于首轮即可约束 LLM
      if (!snap.algo_input_type || !snap.algo_input_type.length) {
        snap.algo_input_type = ALGO_DICT_FALLBACK.algo_input_type || []
      }
      if (!snap.algo_constraint || !snap.algo_constraint.length) {
        snap.algo_constraint = ALGO_DICT_FALLBACK.algo_constraint || []
      }
      return snap
    },
    testPassedCount() {
      return this.generateResult.testResults.filter(t => t.status === 'passed').length
    },
    currentCategoryConfig() {
      if (!this.algorithmCategory) return null
      return CATEGORY_PARAMS_CONFIG[this.algorithmCategory] || null
    },
    diff() {
      return this.generateResult.differentiationSummary || {}
    },
    progressStepSummary() {
      const steps = this.generateProgress.friendlySteps || []
      const total = steps.length
      if (!total) {
        return { current: 0, total: 0 }
      }
      const doneCount = steps.filter(step => step.status === 'done').length
      const activeIndex = steps.findIndex(step => step.status === 'active')
      if (activeIndex >= 0) {
        return { current: activeIndex + 1, total }
      }
      if (doneCount >= total) {
        return { current: total, total }
      }
      return { current: Math.max(doneCount, 1), total }
    },
    progressPlaceholderSteps() {
      return PROGRESS_PLACEHOLDER_STEPS
    },
    showRegenerateButton() {
      return this.generateProgress.show || this.generateResult.show
    }
  },
  created() {
    this.initData()
  },
  beforeDestroy() {
    Object.keys(this.highlightTimers || {}).forEach(key => {
      if (this.highlightTimers[key]) {
        clearTimeout(this.highlightTimers[key])
      }
    })
    this.clearDemoProgressTimers && this.clearDemoProgressTimers()
    if (this.activeStreamAbortController) {
      this.activeStreamAbortController.abort()
    }
  },
  methods: {
    getTextFromOptions(options, code) {
      if (!options || !code) return ''
      const item = options.find(opt => opt.code === code)
      return item ? item.text : ''
    },

    formatCategoryParamsToText(params) {
      if (!params || typeof params !== 'object') return ''

      const config = this.currentCategoryConfig
      if (!config || !config.fields) return ''

      const lines = []
      config.fields.forEach(field => {
        const value = params[field.key]
        if (value === undefined || value === null || value === '') return

        // 根据字段类型格式化
        if (field.type === 'multi_select' && Array.isArray(value) && value.length > 0) {
          // 多选字段，从字典获取中文
          const dictOptions = this.categoryDictCache[field.dictCategory] || []
          const texts = value.map(v => {
            const item = dictOptions.find(opt => opt.code === v)
            return item ? item.text : v
          })
          lines.push(`${field.label}：${texts.join('、')}`)
        } else if (field.type === 'tag_input' && Array.isArray(value) && value.length > 0) {
          // 标签输入
          lines.push(`${field.label}：${value.join('、')}`)
        } else if (field.type === 'switch') {
          // 开关字段
          lines.push(`${field.label}：${value ? '是' : '否'}`)
        } else if (field.type === 'number_input') {
          // 数字输入
          lines.push(`${field.label}：${value}`)
        } else if (field.type === 'text_input') {
          // 文本输入
          lines.push(`${field.label}：${value}`)
        } else if (field.type === 'single_select') {
          // 单选字段
          const dictOptions = this.categoryDictCache[field.dictCategory] || []
          const item = dictOptions.find(opt => opt.code === value)
          const text = item ? item.text : value
          lines.push(`${field.label}：${text}`)
        } else if (field.type === 'constraint_group' && Array.isArray(value) && value.length > 0) {
          // 约束字段
          const dictOptions = this.categoryDictCache[field.dictCategory] || []
          const texts = value.map(v => {
            const item = dictOptions.find(opt => opt.code === v)
            return item ? item.text : v
          })
          lines.push(`${field.label}：${texts.join('、')}`)
        }
      })

      return lines.join('\n')
    },

    updateNarrativeWithSettings() {
      this.freeNarrative = this.generatedNarrativeContent
    },

    async initData() {
      try {
        this.industryOptions = await dictionaryCache.loadDict(`${this.verticalType}_industry`) || []
        this.scenarioOptions = await dictionaryCache.loadDict(`${this.verticalType}_scenario`) || []
        this.technologyOptions = await dictionaryCache.loadDict(`${this.verticalType}_technology`) || []
        const domains = await dictionaryCache.loadDict('domain') || []
        this.domainTitle = domains.find(d => d.code === this.verticalType)?.text || '未知领域'
      } catch (e) {
        console.error('加载字典失败:', e)
        this.$message.error('加载数据字典失败，请刷新重试')
        this.industryOptions = []
        this.scenarioOptions = []
        this.technologyOptions = []
      }
      const catFromApi = await dictionaryCache.loadDict('algorithm_category').catch(() => [])
      this.algorithmCategoryOptions = (catFromApi && catFromApi.length > 0)
        ? catFromApi
        : ALGORITHM_CATEGORY_FALLBACK
      await this.applyScenarioDefaults()
    },

    async applyScenarioDefaults() {
      if (!this.programInfo.industry && this.industryOptions.length) {
        this.$set(this.programInfo, 'industry', this.industryOptions[0].code)
      }
      if (!this.programInfo.scenario && this.scenarioOptions.length) {
        this.$set(this.programInfo, 'scenario', this.scenarioOptions[0].code)
      }
      if (!this.programInfo.technology && this.technologyOptions.length) {
        this.$set(this.programInfo, 'technology', this.technologyOptions[0].code)
      }

      if (this.isHealthDemoMock()) {
        await this.applyHealthDemoDefaults()
        return
      }

      if (!this.algorithmCategory && this.algorithmCategoryOptions.length) {
        const preferred = this.algorithmCategoryOptions.find(item => item.code === 'classification')
        this.algorithmCategory = (preferred || this.algorithmCategoryOptions[0]).code
      }
      if (this.algorithmCategory) {
        await this.onCategoryChange(this.algorithmCategory, true)
        this.applyCategoryParamDefaults()
      }

      if (!this.freeNarrative) {
        this.freeNarrative = this.buildDefaultNarrative()
      }
      if (!this.serviceNameTouched && (!this.form.serviceName || this.form.serviceName === this.serviceNameAutoValue)) {
        this.serviceNameAutoValue = this.buildDefaultModelName()
        this.form.serviceName = this.serviceNameAutoValue
      }
    },

    isHealthDemoMock() {
      return this.verticalType === HEALTH_DEMO_VERTICAL_TYPE
    },

    isAmlDemoMock(modelName = '') {
      return this.verticalType === AML_DEMO_VERTICAL_TYPE &&
        String(modelName || '').includes(AML_TRANSACTION_DEMO.modelName)
    },

    getOptionCodeByText(options, keyword, fallbackCode) {
      const hit = (options || []).find(item => String(item.text || '').includes(keyword))
      return (hit && hit.code) || fallbackCode
    },

    async applyHealthDemoDefaults() {
      this.$set(this.programInfo, 'industry', this.getOptionCodeByText(this.industryOptions, '基层医疗卫生', this.programInfo.industry))
      this.$set(this.programInfo, 'scenario', this.getOptionCodeByText(this.scenarioOptions, '远程会诊支持', this.programInfo.scenario))
      this.$set(this.programInfo, 'technology', this.getOptionCodeByText(this.technologyOptions, '时序数据分析', this.programInfo.technology))

      const regression = this.algorithmCategoryOptions.find(item => item.code === 'regression')
      this.algorithmCategory = (regression || this.algorithmCategoryOptions[0] || {}).code || 'regression'
      await this.onCategoryChange(this.algorithmCategory, true)
      this.categoryParams = { ...HEALTH_LINEZOLID_DEMO.categoryParams }
      this.customConstraintText = ''

      if (!this.freeNarrative) {
        this.freeNarrative = HEALTH_LINEZOLID_DEMO.narrative
      }
      if (!this.serviceNameTouched && (!this.form.serviceName || this.form.serviceName === this.serviceNameAutoValue)) {
        this.serviceNameAutoValue = HEALTH_LINEZOLID_DEMO.modelName
        this.form.serviceName = HEALTH_LINEZOLID_DEMO.modelName
      }
    },

    async applyAmlDemoDefaults() {
      this.$set(this.programInfo, 'industry', this.getOptionCodeByText(this.industryOptions, '金融风控', this.programInfo.industry))
      this.$set(this.programInfo, 'scenario', this.getOptionCodeByText(this.scenarioOptions, '反洗钱', this.programInfo.scenario))
      this.$set(this.programInfo, 'technology', this.getOptionCodeByText(this.technologyOptions, '异常识别', this.programInfo.technology))

      const classification = this.algorithmCategoryOptions.find(item => item.code === 'classification')
      this.algorithmCategory = (classification || this.algorithmCategoryOptions[0] || {}).code || 'classification'
      await this.onCategoryChange(this.algorithmCategory, true)
      this.categoryParams = { ...AML_TRANSACTION_DEMO.categoryParams }
      this.customConstraintText = ''

      if (!this.freeNarrative) {
        this.freeNarrative = AML_TRANSACTION_DEMO.narrative
      }
      if (!this.serviceNameTouched && (!this.form.serviceName || this.form.serviceName === this.serviceNameAutoValue)) {
        this.serviceNameAutoValue = AML_TRANSACTION_DEMO.modelName
        this.form.serviceName = AML_TRANSACTION_DEMO.modelName
      }
    },

    onServiceNameInput() {
      this.serviceNameTouched = (this.form.serviceName || '') !== this.serviceNameAutoValue
    },

    getOptionText(options, code, fallback = '') {
      const hit = (options || []).find(item => item.code === code)
      return (hit && hit.text) || fallback || code || ''
    },

    getUserPrefix() {
      const raw = this.$store.getters.nickname || localStorage.getItem('username') || 'USR'
      const cleaned = String(raw).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      return (cleaned || 'USR').substring(0, 3).padEnd(3, 'X')
    },

    getDateSegment() {
      const now = new Date()
      const yy = String(now.getFullYear()).slice(-2)
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      return `${yy}${mm}${dd}`
    },

    getNameSequence(dateSegment) {
      const key = `scenario_dev_name_seq_${this.getUserPrefix()}_${dateSegment}`
      const next = Number(localStorage.getItem(key) || '0') + 1
      localStorage.setItem(key, String(next))
      return String(next).padStart(3, '0')
    },

    sanitizeNameSegment(text, fallback = '算法') {
      const value = String(text || fallback).replace(/[\\/:*?"<>|\s]/g, '')
      return value.substring(0, 8) || fallback
    },

    buildDefaultModelName() {
      const dateSegment = this.getDateSegment()
      const domainHint = this.domainTitle || (this.$store.getters.userProfile && this.$store.getters.userProfile.domain) || this.verticalType
      return `${this.getUserPrefix()}-${this.sanitizeNameSegment(domainHint)}-${this.getNameSequence(dateSegment)}-${dateSegment}`
    },

    buildDefaultNarrative() {
      const industry = this.getOptionText(this.industryOptions, this.programInfo.industry, '当前行业')
      const scenario = this.getOptionText(this.scenarioOptions, this.programInfo.scenario, '当前业务场景')
      const technology = this.getOptionText(this.technologyOptions, this.programInfo.technology, '智能分析技术')
      const category = this.getOptionText(this.algorithmCategoryOptions, this.algorithmCategory, '算法模型')
      return `请面向${this.domainTitle || '当前领域'}中的${industry}和${scenario}场景，生成一个${category}。该模型需要结合${technology}方向，能够接收实际业务数据作为输入，输出清晰、可解释、便于业务人员理解的结果，并尽量满足平台提交、后续部署和资源库复用要求。`
    },

    applyCategoryParamDefaults() {
      const config = this.currentCategoryConfig
      if (!config) return
      config.fields.forEach(field => {
        if (this.categoryParams[field.key] !== undefined) return
        const val = this.getDefaultCategoryFieldValue(field)
        if (val !== undefined) {
          this.$set(this.categoryParams, field.key, val)
        }
      })
    },

    getDefaultCategoryFieldValue(field) {
      const options = field.dictCategory ? (this.categoryDictCache[field.dictCategory] || ALGO_DICT_FALLBACK[field.dictCategory] || []) : []
      if (field.type === 'multi_select') return options.slice(0, 2).map(item => item.code)
      if (field.type === 'single_select') return options[0] ? options[0].code : undefined
      if (field.type === 'switch') return false
      if (field.type === 'number_input') return field.min !== undefined ? field.min : 1
      if (field.type === 'text_input') return field.placeholder || `请结合${this.domainTitle || '当前领域'}填写${field.label}`
      if (field.type === 'constraint_group') {
        const preferred = options.find(item => item.code === 'single_file')
        return preferred ? [preferred.code] : (options[0] ? [options[0].code] : [])
      }
      return undefined
    },

    customDatasetFileChose(options) {
      const { file } = options
      if (!file) return false
      this.uploadDatasetFiles = [file]
      this.datasetFiles = [{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: URL.createObjectURL(file)
      }]
    },

    removeDatasetFile() {
      this.uploadDatasetFiles = []
      this.datasetFiles = []
    },

    customReferenceFileChose(options) {
      const { file } = options
      if (!file) return false
      this.uploadReferenceFiles.push(file)
      this.referenceFiles.push({
        uid: file.uid,
        name: file.name,
        status: 'done'
      })
    },

    removeReferenceFile(file) {
      this.referenceFiles = this.referenceFiles.filter(f => f.uid !== file.uid)
      this.uploadReferenceFiles = this.uploadReferenceFiles.filter(f => (f.uid || (f.originFileObj && f.originFileObj.uid)) !== file.uid)
      return true
    },

    refTypeLabel(type) {
      const map = { paper: '论文', patent: '专利', code: '代码', model: '模型', url: '网址', repo: '开源' }
      return map[type] || '资料'
    },

    refTypeColor(type) {
      const map = { paper: 'blue', patent: 'red', code: 'green', model: 'purple', url: 'cyan', repo: 'geekblue' }
      return map[type] || 'default'
    },

    flashFieldHighlight(key) {
      if (!key || !(key in this.highlightFields)) return
      this.$set(this.highlightFields, key, true)
      if (this.highlightTimers[key]) {
        clearTimeout(this.highlightTimers[key])
      }
      this.highlightTimers[key] = setTimeout(() => {
        this.$set(this.highlightFields, key, false)
      }, 1500)
    },

    codeInOptions(options, code) {
      if (code === undefined || code === null || code === '') return false
      return (options || []).some(item => String(item.code) === String(code))
    },

    async onIntentFormDraft(payload) {
      const draft = (payload && payload.formDraft) || {}
      const changedFields = (payload && payload.changedFields) || Object.keys(draft)
      await this.applyFormDraft(draft, changedFields)
    },

    async applyFormDraft(draft, changedFields = []) {
      if (!draft || typeof draft !== 'object') return

      if (draft.industry !== undefined && this.codeInOptions(this.industryOptions, draft.industry)) {
        this.programInfo.industry = draft.industry
        this.flashFieldHighlight('industry')
      }
      if (draft.scenario !== undefined && this.codeInOptions(this.scenarioOptions, draft.scenario)) {
        this.programInfo.scenario = draft.scenario
        this.flashFieldHighlight('scenario')
      }
      if (draft.technology !== undefined && this.codeInOptions(this.technologyOptions, draft.technology)) {
        this.programInfo.technology = draft.technology
        this.flashFieldHighlight('technology')
      }

      if (draft.algorithm_category) {
        const cat = draft.algorithm_category
        if (this.codeInOptions(this.algorithmCategoryOptions, cat) || CATEGORY_PARAMS_CONFIG[cat]) {
          this.algorithmCategory = cat
          await this.onCategoryChange(cat, true)
          this.flashFieldHighlight('algorithmCategory')
        }
      }

      if (draft.category_params && typeof draft.category_params === 'object') {
        const next = { ...(this.categoryParams || {}), ...draft.category_params }
        this.categoryParams = next
        if (Array.isArray(next.constraints)) {
          const custom = next.constraints.find(c => String(c).startsWith('custom:'))
          if (custom) {
            this.customConstraintText = String(custom).replace(/^custom:\s*/, '')
          }
        }
        this.flashFieldHighlight('categoryParams')
        this.categoryParamsPanelActive = ['params']
      }

      if (draft.model_name && !(this.form.serviceName || '').trim()) {
        this.form.serviceName = draft.model_name
        this.flashFieldHighlight('serviceName')
      }
    },

    async onCategoryChange(category, keepParams = false) {
      const shouldKeepParams = keepParams === true
      if (!shouldKeepParams) {
        this.categoryParams = {}
        this.customConstraintText = ''
        this.labelInputVisible = false
        this.labelInputValue = ''
      }
      if (!category) return
      const config = CATEGORY_PARAMS_CONFIG[category]
      if (!config) return
      for (const field of config.fields) {
        if (field.dictCategory && !this.categoryDictCache[field.dictCategory]) {
          let items = []
          try {
            items = await dictionaryCache.loadDict(field.dictCategory) || []
          } catch (e) {
            console.warn(`字典 API 不可用 (${field.dictCategory})，使用本地 fallback`)
          }
          if (!items || items.length === 0) {
            items = ALGO_DICT_FALLBACK[field.dictCategory] || []
          }
          this.categoryDictCache[field.dictCategory] = items
        }
      }
      this.categoryDictCache = { ...this.categoryDictCache }
      if (!shouldKeepParams) {
        this.applyCategoryParamDefaults()
      }
    },

    getCategoryFieldValue(key, defaultVal) {
      return this.categoryParams[key] !== undefined ? this.categoryParams[key] : defaultVal
    },

    setCategoryFieldValue(key, value) {
      this.$set(this.categoryParams, key, value)
    },

    removeLabel(idx) {
      const labels = this.categoryParams.labels || []
      labels.splice(idx, 1)
      this.$set(this.categoryParams, 'labels', [...labels])
    },

    showLabelInput() {
      this.labelInputVisible = true
      this.$nextTick(() => {
        if (this.$refs.labelInput) {
          this.$refs.labelInput.focus()
        }
      })
    },

    handleLabelInputConfirm() {
      const val = (this.labelInputValue || '').trim()
      const labels = this.categoryParams.labels || []
      if (val && !labels.includes(val)) {
        labels.push(val)
        this.$set(this.categoryParams, 'labels', [...labels])
      }
      this.labelInputVisible = false
      this.labelInputValue = ''
    },

    onGenerateClick() {
      const name = (this.form.serviceName || '').trim()
      const narrative = (this.freeNarrative || '').trim()
      if (!name) {
        this.$message.warning('请填写算法模型名称。')
        return
      }
      if (!narrative) {
        this.$message.warning(
          '请在下方的「自由叙述」中具体说明您要生成的算法模型功能。可参考上方蓝色提示中的完整示例进行填写。'
        )
        return
      }
      if (this.isHealthDemoMock()) {
        this.startHealthDemoGenerate(name, narrative)
        return
      }
      if (this.isAmlDemoMock(name, narrative)) {
        this.startAmlDemoGenerate(name, narrative)
        return
      }
      this.startGenerate(name, narrative)
    },

    getInitialGenerateProgress() {
      return {
        show: false,
        status: 'process',
        description: '',
        expanded: true,
        agentSteps: [],
        friendlySteps: []
      }
    },

    getInitialGenerateResult() {
      return {
        show: false,
        generatedCode: '',
        codeFilename: '',
        modelSummary: { ...DEFAULT_MODEL_SUMMARY },
        testResults: [],
        references: [],
        differentiationSummary: null
      }
    },

    resetScenarioDevToInitial() {
      this.activeGenerateSessionId += 1
      this.clearDemoProgressTimers()
      if (this.activeStreamAbortController) {
        this.activeStreamAbortController.abort()
        this.activeStreamAbortController = null
      }
      this.form.serviceName = undefined
      this.serviceNameAutoValue = ''
      this.serviceNameTouched = false
      this.freeNarrative = ''
      this.programInfo = { industry: undefined, scenario: undefined, technology: undefined }
      this.datasetFiles = []
      this.uploadDatasetFiles = []
      this.referenceFiles = []
      this.uploadReferenceFiles = []
      this.algorithmCategory = undefined
      this.categoryParams = {}
      this.customConstraintText = ''
      this.labelInputVisible = false
      this.labelInputValue = ''
      this.categoryParamsPanelActive = ['params']
      this.generateLoading = false
      this.generateProgress = this.getInitialGenerateProgress()
      this.generateResult = this.getInitialGenerateResult()
    },

    async restoreScenarioDevDefaults() {
      this.resetScenarioDevToInitial()
      await this.applyScenarioDefaults()
      this.resetIntentChat()
    },

    resetIntentChat() {
      this.intentChatBusy = false
      this.pendingNarrativeFromChat = ''
      this.narrativeManualEdited = false
      this.$nextTick(() => {
        const chat = this.$refs.intentChat
        if (chat && typeof chat.resetConversation === 'function') {
          chat.resetConversation()
        }
      })
    },

    clearDemoProgressTimers() {
      (this.demoProgressTimerIds || []).forEach((timerId) => {
        clearTimeout(timerId)
      })
      this.demoProgressTimerIds = []
    },

    scrollToConfigPanel() {
      this.$nextTick(() => {
        const configCard = this.$el && this.$el.querySelector('.config-main-card')
        if (configCard && configCard.scrollIntoView) {
          configCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },

    onRegenerateClick() {
      const doReset = async () => {
        await this.restoreScenarioDevDefaults()
        this.$message.success('已恢复默认配置，您可以修改后重新生成')
        this.scrollToConfigPanel()
      }
      if (this.generateLoading) {
        Modal.confirm({
          title: '重新生成',
          content: '算法还在生成中，确定要停止并清空已填内容吗？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => doReset()
        })
      } else {
        doReset()
      }
    },

    startHealthDemoGenerate(modelName) {
      this.activeGenerateSessionId += 1
      const sessionId = this.activeGenerateSessionId
      this.clearDemoProgressTimers()
      this.generateLoading = true
      this.generateProgress = {
        show: true,
        status: 'process',
        description: '正在加载乡村医疗AI应用演示数据，每个步骤约 10 秒，请稍候...',
        expanded: true,
        agentSteps: [],
        friendlySteps: this.buildFriendlySteps(1)
      }
      // 点击生成时不修改显示内容，保持原有内容

      const progressTimers = [
        [10000, 2, '已识别基层医疗远程会诊场景，正在匹配利奈唑胺给药模型。'],
        [20000, 3, '正在整理 Linezolid_repo 模型源码与药代动力学计算逻辑。'],
        [30000, 4, '正在生成测试说明、参考资料和差异化说明。'],
        [40000, 5, '演示算法模型已生成，可查看说明并下载源文件。']
      ]
      progressTimers.forEach(([delay, step, message]) => {
        const timerId = window.setTimeout(() => {
          if (sessionId !== this.activeGenerateSessionId) return
          if (!this.generateProgress.show || !this.isHealthDemoMock()) return
          this.updateFriendlyProgress(step, message)
          if (step === 5) {
            this.generateProgress.status = 'finish'
            this.generateProgress.description = message
            this.generateLoading = false
            this.generateResult = this.buildHealthDemoResult(modelName)
            this.$message.success('演示算法模型生成成功！')
          }
        }, delay)
        this.demoProgressTimerIds.push(timerId)
      })
    },

    buildHealthDemoResult(modelName) {
      return {
        show: true,
        generatedCode: HEALTH_LINEZOLID_DEMO.generatedCode,
        codeFilename: HEALTH_LINEZOLID_DEMO.codeFilename,
        modelSummary: {
          ...HEALTH_LINEZOLID_DEMO.modelSummary,
          outputDescription: `输出名为“${modelName || HEALTH_LINEZOLID_DEMO.modelName}”的算法模型源文件，并提供剂量预测、测试结果、参考资料和差异化说明。`
        },
        testResults: HEALTH_LINEZOLID_DEMO.testResults,
        references: HEALTH_LINEZOLID_DEMO.references,
        differentiationSummary: HEALTH_LINEZOLID_DEMO.differentiationSummary
      }
    },

    startAmlDemoGenerate(modelName) {
      this.activeGenerateSessionId += 1
      const sessionId = this.activeGenerateSessionId
      this.clearDemoProgressTimers()
      this.generateLoading = true
      this.generateProgress = {
        show: true,
        status: 'process',
        description: '正在加载跨境支付AI监测演示数据，每个步骤约 10 秒，请稍候...',
        expanded: true,
        agentSteps: [],
        friendlySteps: this.buildFriendlySteps(1)
      }
      // 点击生成时不修改显示内容，保持原有内容

      const progressTimers = [
        [10000, 2, '已识别金融风控与反洗钱场景，正在匹配可疑交易风险识别模型。'],
        [20000, 3, '正在整理跨境支付交易字段、风险因子和分类逻辑。'],
        [30000, 4, '正在生成测试说明、参考资料和差异化说明。'],
        [40000, 5, '演示算法模型已生成，可查看说明并下载源文件。']
      ]
      progressTimers.forEach(([delay, step, message]) => {
        const timerId = window.setTimeout(() => {
          if (sessionId !== this.activeGenerateSessionId) return
          if (!this.generateProgress.show || this.verticalType !== AML_DEMO_VERTICAL_TYPE) return
          this.updateFriendlyProgress(step, message)
          if (step === 5) {
            this.generateProgress.status = 'finish'
            this.generateProgress.description = message
            this.generateLoading = false
            this.generateResult = this.buildAmlDemoResult(modelName)
            this.$message.success('演示算法模型生成成功！')
          }
        }, delay)
        this.demoProgressTimerIds.push(timerId)
      })
    },

    buildAmlDemoResult(modelName) {
      return {
        show: true,
        generatedCode: AML_TRANSACTION_DEMO.generatedCode,
        codeFilename: AML_TRANSACTION_DEMO.codeFilename,
        modelSummary: {
          ...AML_TRANSACTION_DEMO.modelSummary,
          outputDescription: `输出名为“${modelName || AML_TRANSACTION_DEMO.modelName}”的算法模型源文件，并提供风险分类、测试结果、参考资料和差异化说明。`
        },
        testResults: AML_TRANSACTION_DEMO.testResults,
        references: AML_TRANSACTION_DEMO.references,
        differentiationSummary: AML_TRANSACTION_DEMO.differentiationSummary
      }
    },

    startGenerate(modelName, narrative) {
      this.activeGenerateSessionId += 1
      const sessionId = this.activeGenerateSessionId
      if (this.activeStreamAbortController) {
        this.activeStreamAbortController.abort()
      }
      this.activeStreamAbortController = null
      this.generateLoading = true
      this.generateProgress = {
        show: true,
        status: 'process',
        description: '正在准备生成任务，预计需要 2-5 分钟，请稍候...',
        expanded: true,
        agentSteps: [],
        friendlySteps: this.buildFriendlySteps(1)
      }
      // 点击生成时不修改显示内容，保持原有内容

      const formData = new FormData()
      formData.append('model_name', modelName)
      formData.append('free_narrative', narrative)

      if (this.programInfo.industry) {
        formData.append('industry', this.programInfo.industry)
      }
      if (this.programInfo.scenario) {
        formData.append('scenario', this.programInfo.scenario)
      }
      if (this.programInfo.technology) {
        formData.append('technology', this.programInfo.technology)
      }
      if (this.uploadDatasetFiles.length > 0) {
        const rawDataset = this.uploadDatasetFiles[0]
        formData.append('dataset_file', rawDataset.originFileObj || rawDataset)
      }
      // 相关资料：多文件
      if (this.uploadReferenceFiles.length > 0) {
        this.uploadReferenceFiles.forEach(f => {
          formData.append('reference_files', f.originFileObj || f)
        })
      }
      if (this.algorithmCategory) {
        formData.append('algorithm_category', this.algorithmCategory)
      }
      if (this.algorithmCategory && Object.keys(this.categoryParams).length > 0) {
        const params = { ...this.categoryParams }
        if (Array.isArray(params.constraints) && params.constraints.length > 0) {
          params.constraints = params.constraints.map(c => {
            if (c === 'custom_constraint' && this.customConstraintText) {
              return 'custom: ' + this.customConstraintText
            }
            return c
          })
        }
        formData.append('category_params', JSON.stringify(params))
      }

      streamAgent('/api/agent/aml_auto_generate', formData, {
        onAbortController: (controller) => {
          if (sessionId === this.activeGenerateSessionId) {
            this.activeStreamAbortController = controller
          }
        },
        onStart: () => {
          if (sessionId !== this.activeGenerateSessionId) return
          this.updateFriendlyProgress(1, '已开始理解您的需求和应用场景。')
        },
        onStep: (data) => {
          if (sessionId !== this.activeGenerateSessionId) return
          this.generateProgress.agentSteps.push({
            step: data.step || this.generateProgress.agentSteps.length + 1,
            thought: data.thought || '',
            action: data.action || '',
            action_result: data.action_result || '',
            expanded: false
          })
          const friendly = this.getFriendlyProgressMessage(data)
          this.updateFriendlyProgress(friendly.step, friendly.message)
        },
        onError: (error) => {
          if (sessionId !== this.activeGenerateSessionId) return
          this.activeStreamAbortController = null
          this.generateProgress.status = 'error'
          this.generateProgress.description = '生成过程遇到异常，已为您提供备用说明和后续完善建议。'
          this.generateProgress.friendlySteps = this.buildFriendlySteps(5, 'warning')
          this.generateLoading = false
          this.generateResult = this.buildFallbackResult('生成过程遇到异常：' + error)
          this.$message.warning('生成未完全完成，已展示备用说明。')
        },
        onWarning: (warning) => {
          if (sessionId !== this.activeGenerateSessionId) return
          this.activeStreamAbortController = null
          this.generateProgress.status = 'finish'
          this.generateProgress.description = '生成过程返回警告，已为您提供备用说明和后续完善建议。'
          this.generateProgress.friendlySteps = this.buildFriendlySteps(5, 'warning')
          this.generateLoading = false
          this.generateResult = this.buildFallbackResult('生成过程返回警告：' + warning)
          this.$message.warning('生成返回警告，已展示备用说明。')
        },
        onFinalResult: (results) => {
          if (sessionId !== this.activeGenerateSessionId) return
          this.activeStreamAbortController = null
          this.generateProgress.status = 'finish'
          this.generateProgress.description = '算法模型已顺利生成，可查看说明并下载源文件。'
          this.generateProgress.friendlySteps = this.buildFriendlySteps(5)
          this.generateLoading = false
          this.processFinalResult(results)
          this.$message.success('算法模型生成成功！')
          this.$nextTick(() => {
            this.registerGeneratedToPlatform()
          })
        },
        onComplete: () => {
          if (sessionId !== this.activeGenerateSessionId) return
          this.activeStreamAbortController = null
          this.generateLoading = false
          if (this.generateProgress.status === 'process') {
            this.generateProgress.status = 'finish'
            this.generateProgress.description = '执行完成，正在整理结果展示。'
          }
        },
        onAbort: () => {
          if (sessionId !== this.activeGenerateSessionId) return
          this.activeStreamAbortController = null
          this.generateLoading = false
        },
        onDataProcessError: (e, line) => {
          console.error('解析智能体数据失败:', e, line)
        }
      })
    },

    processFinalResult(results) {
      const data = results.aml_generate_result
      if (!data) {
        this.generateResult = this.buildFallbackResult('未获取到生成结果文件')
        this.$message.warning('未获取到生成结果文件')
        return
      }

      let parsed = data
      if (typeof data === 'string') {
        try {
          parsed = JSON.parse(data)
        } catch (e) {
          this.generateResult = this.buildFallbackResult('生成结果格式不完整，已保留可下载内容。', data)
          return
        }
      }

      const code = parsed.generated_code || ''
      if (!code || !String(code).trim()) {
        this.generateResult = this.buildFallbackResult('生成结果未包含可下载的算法源文件。')
        return
      }

      this.generateResult = {
        show: true,
        generatedCode: code,
        codeFilename: parsed.code_filename || `${parsed.model_name || 'algorithm'}.py`,
        modelSummary: this.normalizeModelSummary(parsed.model_summary, parsed),
        testResults: Array.isArray(parsed.test_results) ? parsed.test_results : [],
        references: Array.isArray(parsed.references) ? parsed.references : [],
        differentiationSummary: parsed.differentiation_summary || null
      }
    },

    buildFriendlySteps(activeStep = 1, overrideStatus = '') {
      const hasDataset = this.uploadDatasetFiles.length > 0
      const hasReferences = this.uploadReferenceFiles.length > 0
      const narrativeShort = (this.freeNarrative || '').trim().length < 60
      const descriptions = [
        '已开始理解您填写的领域、行业、场景和技术方向。',
        hasReferences
          ? '正在结合您提交的相关资料进行强化，并尽量做出差异化设计。'
          : '正在结合平台知识和您填写的信息完善算法方案。',
        hasDataset
          ? '正在参考您上传的数据集，整理输入格式和处理要求。'
          : '正在根据当前描述生成算法模型源文件。',
        narrativeShort
          ? '说明：当前场景描述较简略，结果可能需要后续补充业务规则、输入样例和评价指标。'
          : '正在检查生成结果是否包含源文件、测试说明和参考资料说明。',
        overrideStatus === 'warning'
          ? '生成过程未完全顺利完成，已提供备用说明和后续完善建议。'
          : '已顺利生成，可查看算法模型说明并下载源文件。'
      ]
      const titles = [
        '理解需求和应用场景',
        '强化算法方案',
        '生成算法模型源文件',
        '检查结果完整性',
        '整理说明与源文件'
      ]
      return titles.map((title, index) => {
        const step = index + 1
        let status = 'pending'
        if (overrideStatus === 'warning' && step === 5) {
          status = 'warning'
        } else if (step < activeStep || activeStep >= 5) {
          status = 'done'
        } else if (step === activeStep) {
          status = 'active'
        }
        return {
          step,
          title,
          description: descriptions[index],
          status,
          statusText: status === 'done' ? '已完成' : status === 'active' ? '进行中' : status === 'warning' ? '需完善' : '待处理'
        }
      })
    },

    updateFriendlyProgress(activeStep, message) {
      this.generateProgress.friendlySteps = this.buildFriendlySteps(activeStep)
      this.generateProgress.description = message
    },

    getFriendlyProgressMessage(data) {
      const rawStep = Number(data.step || 1)
      const step = Math.min(5, Math.max(1, rawStep))
      const messages = {
        1: '已完成需求理解，正在梳理应用场景和输入输出要求。',
        2: this.uploadReferenceFiles.length > 0
          ? '正在根据您提交的相关资料进行强化，尽量形成差异化方案。'
          : '正在结合平台知识完善算法思路，预计还需要几分钟。',
        3: '正在生成算法模型源文件，请保持页面打开。',
        4: '正在检查生成结果是否完整、可下载、可继续完善。',
        5: '正在整理算法模型说明、参考资料和源文件。'
      }
      return { step, message: messages[step] || '正在稳步推进生成任务，请稍候。' }
    },

    normalizeModelSummary(summary, parsed = {}) {
      const fallback = this.buildModelSummary(parsed)
      if (!summary || typeof summary !== 'object') return fallback
      return {
        purpose: summary.purpose || fallback.purpose,
        inputDescription: summary.input_description || summary.inputDescription || fallback.inputDescription,
        outputDescription: summary.output_description || summary.outputDescription || fallback.outputDescription,
        usageScenarios: Array.isArray(summary.usage_scenarios)
          ? summary.usage_scenarios
          : Array.isArray(summary.usageScenarios) ? summary.usageScenarios : fallback.usageScenarios,
        limitations: summary.limitations || fallback.limitations,
        nextSteps: Array.isArray(summary.next_steps)
          ? summary.next_steps
          : Array.isArray(summary.nextSteps) ? summary.nextSteps : fallback.nextSteps
      }
    },

    buildModelSummary(parsed = {}) {
      const industry = this.getOptionText(this.industryOptions, this.programInfo.industry, '当前行业')
      const scenario = this.getOptionText(this.scenarioOptions, this.programInfo.scenario, '当前场景')
      const technology = this.getOptionText(this.technologyOptions, this.programInfo.technology, '智能分析')
      const category = this.getOptionText(this.algorithmCategoryOptions, this.algorithmCategory, '算法模型')
      const narrativeShort = (this.freeNarrative || '').trim().length < 60
      return {
        purpose: `该${category}面向${this.domainTitle || '当前领域'}中的${industry}和${scenario}，用于帮助用户完成业务数据的自动分析、识别或辅助判断。`,
        inputDescription: this.uploadDatasetFiles.length > 0
          ? '主要使用您上传的数据集，并结合页面中填写的领域、行业、场景、技术方向和自由描述。'
          : '主要使用页面中填写的领域、行业、场景、技术方向和自由描述；如有真实数据，建议后续补充上传。',
        outputDescription: parsed.model_name
          ? `输出名为“${parsed.model_name}”的算法模型源文件，并提供测试结果、参考资料和差异化说明。`
          : '输出算法模型源文件，并提供测试结果、参考资料和差异化说明。',
        usageScenarios: [scenario, `${technology}辅助分析`, '算法原型验证'],
        limitations: narrativeShort
          ? '鉴于本次想定场景描述较简略，目前生成算法可能还不够完善，建议补充更明确的业务规则、输入样例和评价指标。'
          : '当前结果适合作为算法原型和技术人员二次开发基础，上线前仍建议结合真实数据做进一步测试。',
        nextSteps: [
          '用真实数据样例验证输入输出是否符合预期',
          '补充业务规则、异常情况和评价指标',
          '由技术人员进行部署前安全性和性能检查'
        ]
      }
    },

    buildFallbackResult(reason, generatedCode = '') {
      return {
        show: true,
        generatedCode: generatedCode || '# 本次未获取到完整算法源文件，请补充需求后重新生成。\n',
        codeFilename: `${(this.form.serviceName || 'algorithm')}_draft.py`,
        modelSummary: {
          ...this.buildModelSummary(),
          limitations: `${reason}。鉴于所想定场景或生成过程信息不完整，目前结果仅作为初步说明，建议补充资料后重新生成。`,
          nextSteps: [
            '补充更完整的场景描述、输入数据样例和期望输出',
            '上传相关资料或数据集以帮助智能体强化方案',
            '重新点击“生成算法模型”获取完整源文件'
          ]
        },
        testResults: [
          { name: '需求完整性', status: 'warning', description: '建议补充', details: reason },
          { name: '源文件状态', status: generatedCode ? 'passed' : 'warning', description: generatedCode ? '已保留可下载内容' : '未获取完整源文件', details: '请根据页面提示重新生成或补充资料。' }
        ],
        references: [],
        differentiationSummary: {
          overall_strategy: '当前仅提供备用说明，完整差异化内容需要在补充资料并重新生成后形成。',
          key_innovations: [],
          improvements: ['建议补充业务规则和真实数据后重新生成，以获得更可靠的改进说明。'],
          advantages: [],
          ip_risk_notes: '因参考资料或生成结果不完整，暂不能形成完整的知识产权规避说明。'
        }
      }
    },

    toggleMainStep() {
      this.generateProgress.expanded = !this.generateProgress.expanded
    },

    toggleAgentStepDetail(agentIndex) {
      const step = this.generateProgress.agentSteps[agentIndex]
      if (step) {
        this.$set(this.generateProgress.agentSteps, agentIndex, {
          ...step,
          expanded: !step.expanded
        })
      }
    },

    getAgentStepSummary(agentStep) {
      if (agentStep.thought && agentStep.thought.length > 0) {
        const preview = agentStep.thought.length > 50
          ? agentStep.thought.substring(0, 50) + '...'
          : agentStep.thought
        return `💭 ${preview}`
      } else if (agentStep.action) {
        const preview = agentStep.action.length > 50
          ? agentStep.action.substring(0, 50) + '...'
          : agentStep.action
        return `⚙️ ${preview}`
      } else if (agentStep.action_result) {
        return '👁️ 查看执行结果'
      }
      return '处理中...'
    },

    async registerGeneratedToPlatform() {
      const code = this.generateResult.generatedCode
      if (!code || !String(code).trim()) {
        this.$message.warning('未获取到源码内容，已跳过同步到资源库')
        return
      }
      const name = (this.form.serviceName || '').trim()
      if (!name) {
        return
      }
      const filename = this.generateResult.codeFilename || 'generated_algorithm.py'
      const blob = new Blob([code], { type: 'text/x-python' })
      const fd = new FormData()
      fd.append('file', blob, filename)
      fd.append('name', name)
      fd.append('domain', this.verticalType)
      if (this.programInfo.industry) {
        fd.append('industry', this.programInfo.industry)
      }
      if (this.programInfo.scenario) {
        fd.append('scenario', this.programInfo.scenario)
      }
      if (this.programInfo.technology) {
        fd.append('technology', this.programInfo.technology)
      }
      try {
        const res = await uploadScenarioGeneratedAlgorithm(fd)
        if (res && res.status === 'success') {
          try {
            sessionStorage.setItem(`eb_vertical_list_refresh_${this.verticalType}`, '1')
          } catch (err) {
            /* ignore */
          }
          this.$message.success('已存入资源库，可在「垂域应用 AI 资源检索」同领域中查看并下载')
        } else {
          this.$message.warning((res && res.message) || '同步到资源库未确认成功')
        }
      } catch (e) {
        const msg = (e && e.message) ? e.message : String(e)
        this.$message.warning('生成成功，但同步到资源库失败：' + msg)
      }
    },

    downloadCode() {
      if (!this.generateResult.generatedCode) return
      const blob = new Blob([this.generateResult.generatedCode], { type: 'text/x-python' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = this.generateResult.codeFilename || 'generated_algorithm.py'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      this.$message.success('代码文件下载成功')
    }
  },
  watch: {
    verticalType: {
      async handler(newVal) {
        if (newVal) {
          this.resetScenarioDevToInitial()
          await this.initData()
        }
      }
    },
    'programInfo.industry': {
      handler() {
        this.updateNarrativeWithSettings()
      }
    },
    'programInfo.scenario': {
      handler() {
        this.updateNarrativeWithSettings()
      }
    },
    'programInfo.technology': {
      handler() {
        this.updateNarrativeWithSettings()
      }
    },
    algorithmCategory: {
      handler() {
        this.updateNarrativeWithSettings()
      }
    },
    categoryParams: {
      deep: true,
      handler() {
        this.updateNarrativeWithSettings()
      }
    },
    generateResult: {
      deep: true,
      handler() {
        // 当generateResult变化时（特别是show和modelSummary），更新文本框内容
        this.updateNarrativeWithSettings()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.config-main-card {
  /deep/ .ant-card-head {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
  /deep/ .ant-card-body {
    padding-top: 4px;
  }
}

.config-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  padding: 0 0 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.config-section-gap {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.scenario-dev-layout {
  align-items: stretch;
}

.scenario-dev-main,
.scenario-dev-sidebar {
  margin-bottom: 0;
  display: flex;
}

.config-main-card,
.progress-sidebar-card {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;

  /deep/ .ant-card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.config-form {
  /deep/ .ant-form-item {
    margin-bottom: 12px;
  }

  /deep/ .ant-form-item-label {
    line-height: 1.4;
    padding-bottom: 4px;
  }

  /deep/ .ant-select,
  /deep/ .ant-input,
  /deep/ .ant-input-number {
    width: 100%;
  }
}

.form-section-row {
  margin-top: 4px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.form-actions-label {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 32px;
  color: rgba(0, 0, 0, 0.85);
}

.action-form-item {
  margin-top: 12px;
  margin-bottom: 0;

  /deep/ .ant-form-item-label {
    display: none;
  }
}

.domain-title-text {
  display: inline-block;
  font-size: 14px;
  line-height: 32px;
  color: rgba(0, 0, 0, 0.85);
}

.custom-constraint-input {
  width: 100%;
  max-width: 360px;
  margin-top: 8px;
  margin-left: 24px;
}

.result-full-card {
  margin-top: 16px;
}

.progress-sidebar-card {
  /deep/ .ant-card-head {
    min-height: 42px;
    padding: 0 12px;
  }

  /deep/ .ant-card-head-title {
    padding: 10px 0;
  }

  /deep/ .ant-card-body {
    padding: 12px;
    overflow-y: auto;
  }
}

.progress-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 280px;
  padding: 8px 0;
}

.progress-placeholder-icon {
  font-size: 48px;
  color: #bfbfbf;
}

.progress-placeholder-steps {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #f0f0f0;
}

.progress-placeholder-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
}

.progress-placeholder-step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid #d9d9d9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  background: #fafafa;
}

.progress-placeholder-step-title {
  line-height: 1.4;
}

.progress-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

.progress-card-title-main {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.progress-card-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: #1890ff;
  background: #e6f7ff;
  border-radius: 10px;
  padding: 2px 8px;
  white-space: nowrap;
}

.reference-block {
  width: 100%;
}
.reference-title {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
}
.reference-hint {
  margin-bottom: 6px;
}
.reference-control {
  width: 100%;
  margin-top: 8px;
}
.ref-detail {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 13px;

  p {
    margin-bottom: 4px;
  }
}
.differentiation-block {
  .diff-list {
    margin: 0;
    padding-left: 18px;

    li {
      margin-bottom: 4px;
    }
  }
  .diff-empty {
    color: #bfbfbf;
  }
}
.label-optional {
  color: #8c8c8c;
  font-weight: normal;
  font-size: 12px;
}
.label-required-tip {
  color: #cf1322;
  font-weight: normal;
  font-size: 12px;
}
.narrative-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.narrative-pair-row {
  margin-top: 4px;
  align-items: stretch;
}
.narrative-pair-col--chat,
.narrative-pair-col--narrative {
  display: flex;
  flex-direction: column;
}
.narrative-pair {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 420px;
  padding: 12px;
  background: #fafcff;
  border: 1px solid #e8eef5;
  border-radius: 8px;
}
.narrative-pair--right {
  background: #fff;
  border-color: #f0f0f0;
}
.narrative-pair-col--chat {
  margin-bottom: 12px;
}
.narrative-pair-col--narrative {
  margin-bottom: 12px;
}
@media (min-width: 768px) {
  .narrative-pair-col--chat {
    border-right: none;
    margin-bottom: 0;
  }
  .narrative-pair-col--chat .narrative-pair {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
  }
  .narrative-pair-col--narrative .narrative-pair {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
.narrative-sync-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  padding: 6px 10px;
  background: #f7f9fc;
  border-radius: 6px;
}
.narrative-sync-status {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
.narrative-sync-status.is-auto {
  color: #1890ff;
}
.narrative-sync-status.is-manual {
  color: #d48806;
}
.narrative-sync-status.is-pending {
  color: #389e0d;
}
.narrative-sync-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.narrative-example-collapse {
  margin-bottom: 8px;
  background: transparent;

  /deep/ .ant-collapse-item {
    border-bottom: none;
  }
  /deep/ .ant-collapse-header {
    padding: 4px 0 !important;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
  /deep/ .ant-collapse-content-box {
    padding: 4px 0 8px !important;
  }
}
.field-highlight,
.field-highlight-wrap /deep/ .ant-select-selection,
.field-highlight-wrap /deep/ .ant-input {
  animation: fieldPulse 1.5s ease;
}
@keyframes fieldPulse {
  0% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.45); }
  40% { box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.25); }
  100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0); }
}
.narrative-title {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 6px;
}
.narrative-hint {
  margin-bottom: 8px;
}
.example-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: rgba(0, 0, 0, 0.65);
}
.example-text {
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.65);
  font-size: 13px;
}

.dataset-upload-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.reference-upload-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.5;
  white-space: normal;
}

.narrative-textarea {
  width: 100%;
  max-width: none;
  flex: 1;
  min-height: 380px;
}

.spec-collapse {
  background: transparent;

  /deep/ .ant-collapse-header {
    font-weight: 600;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
    background: transparent;
  }

  /deep/ .ant-collapse-item {
    border-bottom: none;
  }

  /deep/ .ant-collapse-content-box {
    padding-top: 8px;
  }
}

.label-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  min-height: 32px;
}

.constraints-group {
  width: 100%;
}

// 代码预览
.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px 4px 0 0;

  .code-filename {
    font-weight: 600;
    font-size: 14px;
    color: #333;
  }
}
.model-summary-block {
  margin-bottom: 12px;

  /deep/ .ant-descriptions-item-label {
    width: 140px;
    font-weight: 600;
  }

  .summary-list {
    margin: 0;
    padding-left: 18px;

    li {
      margin-bottom: 4px;
    }
  }
}
.code-preview {
  margin: 0;
  padding: 16px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 0 0 4px 4px;
  font-size: 13px;
  line-height: 1.6;
  max-height: 500px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;

  code {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  }
}

// 进度步骤
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

        &.done {
          border-color: #b7eb8f;
          background: #fcfff6;
        }

        &.active {
          border-color: #91d5ff;
          background: #f0f8ff;
        }

        &.warning {
          border-color: #ffd591;
          background: #fffbe6;
        }

        .agent-step-header {
          display: flex;
          align-items: center;
          cursor: default;
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

        .friendly-step-desc {
          margin-top: 6px;
          padding-left: 58px;
          font-size: 13px;
          line-height: 1.6;
          color: rgba(0, 0, 0, 0.65);
        }

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
  }
}

// 右侧进度栏适配
.sidebar-steps {
  flex: 1;
  display: flex;
  flex-direction: column;

  .step-item {
    padding: 12px;
    margin-bottom: 0;
  }

  .sidebar-step-header {
    cursor: default;
    align-items: flex-start;

    &:hover {
      opacity: 1;
    }

    .step-title {
      font-size: 14px;
    }

    .sidebar-step-description {
      white-space: normal;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
    }
  }

  .timeline-steps {
    max-height: none;
    overflow: visible;
    padding-top: 8px;
    margin-top: 8px;
    border-top: 1px dashed #e8e8e8;
  }

  .timeline-item {
    display: flex;
    position: relative;
    padding-bottom: 16px;

    &.last {
      padding-bottom: 0;
    }

    .timeline-track {
      position: relative;
      width: 28px;
      flex-shrink: 0;
      margin-right: 8px;

      &::after {
        content: '';
        position: absolute;
        left: 13px;
        top: 28px;
        bottom: -4px;
        width: 2px;
        background: #e8e8e8;
      }
    }

    &.last .timeline-track::after {
      display: none;
    }

    .timeline-dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #d9d9d9;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: #999;
      position: relative;
      z-index: 1;
    }

    &.done .timeline-dot {
      border-color: #52c41a;
      background: #f6ffed;
      color: #52c41a;
    }

    &.active .timeline-dot {
      border-color: #1890ff;
      background: #e6f7ff;
      color: #1890ff;
    }

    &.warning .timeline-dot {
      border-color: #fa8c16;
      background: #fff7e6;
      color: #fa8c16;
    }

    .timeline-content {
      flex: 1;
      min-width: 0;
      padding: 2px 0;
    }

    .timeline-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-bottom: 4px;
    }

    .timeline-step-label {
      font-size: 12px;
      color: #8c8c8c;
      white-space: nowrap;
    }

    .timeline-title {
      font-size: 13px;
      font-weight: 600;
      color: #333;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .timeline-desc {
      font-size: 12px;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.65);
    }
  }
}

@media (max-width: 768px) {
  .progress-sidebar-card {
    position: static;
    margin-top: 16px;

    /deep/ .ant-card-body {
      max-height: none;
    }
  }

  .scenario-dev-sidebar {
    order: 2;
  }

  .scenario-dev-main {
    order: 1;
  }

  .narrative-pair-col--chat .narrative-pair,
  .narrative-pair-col--narrative .narrative-pair {
    border-radius: 8px !important;
    border: 1px solid #e8eef5 !important;
  }
}
</style>
