<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false" size="small" title="想定式开发配置">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <!-- 第一行：领域 / 算法模型名称 / 行业 / 场景 / 技术 -->
          <a-row :gutter="20">
            <a-col :span="4">
              <a-form-item label="领域">
                <span style="margin-left: 5px; font-size: 14px">{{ domainTitle }}</span>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="算法模型名称" required>
                <a-input v-model="form.serviceName" placeholder="请输入算法模型名称"/>
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="行业">
                <a-select v-model="programInfo.industry" placeholder="请选择行业" allow-clear>
                  <a-select-option v-for="(item, index) in industryOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="场景">
                <a-select v-model="programInfo.scenario" placeholder="请选择场景" allow-clear>
                  <a-select-option v-for="(item, index) in scenarioOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item label="技术">
                <a-select v-model="programInfo.technology" placeholder="请选择技术" allow-clear>
                  <a-select-option v-for="(item, index) in technologyOptions" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <!-- 第二行：数据集文件 / 算法类别 -->
          <a-row :gutter="20">
            <a-col :span="12">
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
            <a-col :span="8">
              <a-form-item label="算法类别">
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
            style="margin-top: 4px;"
          >
            <a-collapse-panel key="params" :header="currentCategoryConfig.label + '（选填）'">
              <a-row :gutter="20">
                <template v-for="field in currentCategoryConfig.fields">
                  <a-col :span="field.type === 'constraint_group' ? 24 : 8" :key="field.key">

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
                            :span="6"
                            v-for="opt in (categoryDictCache[field.dictCategory] || [])"
                            :key="opt.code"
                          >
                            <a-checkbox :value="opt.code">{{ opt.text }}</a-checkbox>
                          </a-col>
                          <a-col :span="12">
                            <a-checkbox value="custom_constraint">其他约束：</a-checkbox>
                            <a-input
                              v-if="(getCategoryFieldValue(field.key, []) || []).includes('custom_constraint')"
                              v-model="customConstraintText"
                              size="small"
                              style="width: 280px; margin-left: 8px;"
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

          <!-- 相关资料（算法优化参考） -->
          <a-row :gutter="20" style="margin-top: 8px;">
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

          <a-row :gutter="20" style="margin-top: 8px;">
            <a-col :span="24">
              <div class="narrative-block">
                <div class="narrative-title">
                  进一步需求和要求请在下面自由叙述<span class="label-required-tip">（必填）</span>
                </div>
                <a-alert
                  type="info"
                  show-icon
                  class="narrative-hint"
                  message="请具体描述您希望生成的算法模型具备哪些功能、输入与输出形式、以及主要使用场景。"
                >
                  <template slot="description">
                    <div class="example-title">正确、完整的描述示例：</div>
                    <div class="example-text">
                      创建一个可以处理图像识别的算法服务：接收图像 URL 或 Base64 图像数据作为输入，返回图像中的主要物体类别标签及置信度列表；服务需支持批量请求，单次最多 32 张图；适用于电商商品图审核场景。
                    </div>
                  </template>
                </a-alert>
                <a-textarea
                  v-model="freeNarrative"
                  :rows="8"
                  class="narrative-textarea"
                  placeholder="请详细描述您希望生成的算法服务功能，例如：创建一个可以处理图像识别的算法服务，它可以接收图像URL并返回识别结果..."
                />
              </div>
            </a-col>
          </a-row>

          <a-row :gutter="20" style="margin-top: 8px;">
            <a-col :span="24">
              <a-form-item label="操作">
                <a-button
                  type="primary"
                  icon="thunderbolt"
                  @click="onGenerateClick"
                  :disabled="generateDisabled"
                  :loading="generateLoading"
                >
                  生成算法模型
                </a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-card>

    <!-- 生成进度 -->
    <a-card v-if="generateProgress.show" :bordered="false" style="margin-top: 10px;">
      <div slot="title">
        <a-icon type="loading" v-if="generateProgress.status === 'process'" />
        <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" v-else-if="generateProgress.status === 'finish'" />
        <a-icon type="close-circle" theme="twoTone" two-tone-color="#f5222d" v-else-if="generateProgress.status === 'error'" />
        <span style="margin-left: 8px;">生成进度</span>
      </div>

      <div class="publish-steps">
        <div
          :class="['step-item', {
            'active': generateProgress.status === 'process',
            'completed': generateProgress.status === 'finish',
            'error': generateProgress.status === 'error'
          }]"
        >
          <div class="step-header" @click="toggleMainStep">
            <div class="step-indicator">
              <a-icon v-if="generateProgress.status === 'finish'" type="check-circle" class="icon-completed" />
              <a-icon v-else-if="generateProgress.status === 'error'" type="close-circle" class="icon-error" />
              <a-icon v-else type="loading" class="icon-loading" />
            </div>
            <div class="step-content">
              <div class="step-title">智能体执行</div>
              <div class="step-description">{{ generateProgress.description }}</div>
            </div>
            <a-icon
              v-if="generateProgress.agentSteps.length > 0"
              :type="generateProgress.expanded ? 'up' : 'down'"
              class="expand-icon"
            />
          </div>

          <div v-if="generateProgress.expanded && generateProgress.agentSteps.length > 0" class="agent-steps">
            <div
              v-for="(agentStep, agentIndex) in generateProgress.agentSteps"
              :key="agentIndex"
              class="agent-step-item"
            >
              <div class="agent-step-header" @click="toggleAgentStepDetail(agentIndex)">
                <span class="agent-step-number">步骤 {{ agentStep.step }}</span>
                <span class="agent-step-summary">{{ getAgentStepSummary(agentStep) }}</span>
                <a-icon
                  :type="agentStep.expanded ? 'up' : 'down'"
                  class="expand-icon-small"
                />
              </div>

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
        </div>
      </div>
    </a-card>

    <!-- 生成结果 -->
    <a-card v-if="generateResult.show" :bordered="false" style="margin-top: 10px;">
      <div slot="title">
        <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
        <span style="margin-left: 8px;">算法模型生成完成</span>
      </div>

      <a-tabs default-active-key="code">
        <!-- 下载与资源库（不展示源码全文） -->
        <a-tab-pane key="code" tab="下载与资源库">
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
            message="可在「垂域应用AI资源检索」模块查看并下载"
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
import { streamAgent } from '@/utils/request'
import dictionaryCache from '@/utils/dictionaryCache'
import { uploadScenarioGeneratedAlgorithm } from '@/api/service'

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

export default {
  name: 'GenericScenarioDev',
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
      form: {
        serviceName: undefined
      },
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
      generateProgress: {
        show: false,
        status: 'process',
        description: '',
        expanded: true,
        agentSteps: []
      },
      generateResult: {
        show: false,
        generatedCode: '',
        codeFilename: '',
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
    testPassedCount() {
      return this.generateResult.testResults.filter(t => t.status === 'passed').length
    },
    currentCategoryConfig() {
      if (!this.algorithmCategory) return null
      return CATEGORY_PARAMS_CONFIG[this.algorithmCategory] || null
    },
    diff() {
      return this.generateResult.differentiationSummary || {}
    }
  },
  created() {
    this.initData()
  },
  methods: {
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

    async onCategoryChange(category) {
      this.categoryParams = {}
      this.customConstraintText = ''
      this.labelInputVisible = false
      this.labelInputValue = ''
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
      this.startGenerate(name, narrative)
    },

    startGenerate(modelName, narrative) {
      this.generateLoading = true
      this.generateProgress = {
        show: true,
        status: 'process',
        description: '正在初始化智能体...',
        expanded: true,
        agentSteps: []
      }
      this.generateResult.show = false

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
        onStart: () => {
          this.generateProgress.description = '智能体已启动，正在生成算法模型...'
        },
        onStep: (data) => {
          this.generateProgress.agentSteps.push({
            step: data.step || this.generateProgress.agentSteps.length + 1,
            thought: data.thought || '',
            action: data.action || '',
            action_result: data.action_result || '',
            expanded: false
          })
          this.generateProgress.description = this.getAgentStepSummary(data)
        },
        onError: (error) => {
          this.generateProgress.status = 'error'
          this.generateProgress.description = '生成失败: ' + error
          this.generateLoading = false
          this.$message.error('算法模型生成失败：' + error)
        },
        onWarning: (warning) => {
          this.generateProgress.status = 'error'
          this.generateProgress.description = '生成警告: ' + warning
          this.generateLoading = false
          this.$message.warning('算法模型生成警告：' + warning)
        },
        onFinalResult: (results) => {
          this.generateProgress.status = 'finish'
          this.generateProgress.description = '算法模型生成完成'
          this.generateLoading = false
          this.processFinalResult(results)
          this.$message.success('算法模型生成成功！')
          this.$nextTick(() => {
            this.registerGeneratedToPlatform()
          })
        },
        onComplete: () => {
          this.generateLoading = false
          if (this.generateProgress.status === 'process') {
            this.generateProgress.status = 'finish'
            this.generateProgress.description = '执行完成'
          }
        },
        onDataProcessError: (e, line) => {
          console.error('解析智能体数据失败:', e, line)
        }
      })
    },

    processFinalResult(results) {
      const data = results.aml_generate_result
      if (!data) {
        this.generateResult = {
          show: false,
          generatedCode: '',
          codeFilename: '',
          testResults: [],
          references: [],
          differentiationSummary: null
        }
        this.$message.warning('未获取到生成结果文件')
        return
      }

      let parsed = data
      if (typeof data === 'string') {
        try {
          parsed = JSON.parse(data)
        } catch (e) {
          this.generateResult = {
            show: true,
            generatedCode: data,
            codeFilename: 'generated_code.py',
            testResults: [],
            references: [],
            differentiationSummary: null
          }
          return
        }
      }

      this.generateResult = {
        show: true,
        generatedCode: parsed.generated_code || '',
        codeFilename: parsed.code_filename || `${parsed.model_name || 'algorithm'}.py`,
        testResults: Array.isArray(parsed.test_results) ? parsed.test_results : [],
        references: Array.isArray(parsed.references) ? parsed.references : [],
        differentiationSummary: parsed.differentiation_summary || null
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
      handler(newVal) {
        if (newVal) {
          this.initData()
          this.form.serviceName = undefined
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
          this.generateProgress = {
            show: false,
            status: 'process',
            description: '',
            expanded: true,
            agentSteps: []
          }
          this.generateResult = {
            show: false,
            generatedCode: '',
            codeFilename: '',
            testResults: [],
            references: []
          }
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.ant-form-item {
  margin-bottom: 0;
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
.reference-upload-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
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
.narrative-textarea {
  width: 100%;
  max-width: 960px;
}

.dataset-upload-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.upload-hint {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 32px;
  white-space: nowrap;
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
</style>
