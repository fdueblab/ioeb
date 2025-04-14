<template>
  <page-header-wrapper :title="false">
    <!-- 智能搜索部分 -->
    <a-card>
      <a-form :form="agentSearchForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="微服务/元应用名称">
              <a-input v-model="agentSearchForm.name" placeholder="请输入微服务/元应用名称" />
            </a-form-item>
            <a-form-item label="通用描述">
              <a-input v-model="agentSearchForm.description" placeholder="请输入通用描述" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form :form="agentSearchForm" layout="vertical">
              <a-form-item label="作用">
                <a-input v-model="agentSearchForm.role" placeholder="请输入作用" />
              </a-form-item>
              <a-form-item label="技术要求">
                <a-input v-model="agentSearchForm.requirement" placeholder="请输入技术要求" />
              </a-form-item>
            </a-form>
          </a-col>
          <a-col :span="8">
            <a-form-item label="功能">
              <a-input v-model="agentSearchForm.function" placeholder="请输入功能" />
            </a-form-item>
            <a-form-item label="检索操作">
              <div style="display: flex; flex-direction: row; justify-content: space-between">
                <a-button icon="sync" @click="handleReset">重置输入</a-button>
                <a-button ref="ragButton" class="rag-input-bubble-button" @click="toggleRAGInput">
                  <a-icon type="dot-chart" v-if="!showRAGInput"/>
                  <a-icon type="close" v-else/>
                  领域增强
                </a-button>
                <a-button type="primary" icon="file-search" @click="handleAgentSearch" :loading="agentSearchLoading">智能检索</a-button>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <!-- 添加开发测试模式下的可编辑接口配置 -->
      <a-card title="用于测试的可编辑接口地址，只会在开发环境出现" v-if="isDev">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="智能检索接口地址（可编辑）">
              <a-input style="width: 100%" v-model="agentSearchApiUrl" placeholder="请输入">
                <span slot="addonBefore" style="text-align: center; display: inline-block;">
                  <a-select v-model="agentSearchApiMethod" style="width: 80px">
                    <a-select-option v-for="(item, index) in methodTypeOptions" :key="index" :value="index">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </span>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="智能检索接口请求头（可编辑）">
              <a-textarea v-model="agentSearchApiHeaderText" :rows="4" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="智能检索接口参数（根据检索条件变化）">
              <a-textarea v-model="agentSearchFormText" :rows="7" :readonly="true" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="智能检索返回结果">
          <a-textarea v-model="agentSearchApiResultText" :rows="5" :readonly="true" />
        </a-form-item>
      </a-card>
    </a-card>

    <!-- 筛选标签部分 -->
    <a-card :bordered="false">
      <a-form layout="vertical">
        <a-row :gutter="16">
          <!-- 属性标签筛选（多选框） -->
          <a-col :span="24">
            <a-form-item label="">
              <a-checkbox-group v-model="queryParam.attribute" @change="handleTagChange('attribute', $event)">
                <a-checkbox v-for="(item, index) in attributeArr" :key="index" :value="index">
                  {{ item }}
                </a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <!-- 类型标签筛选（下拉框） -->
          <a-col :span="4">
            <a-form-item label="类型">
              <a-select
                v-model="queryParam.type"
                placeholder="请选择类型"
                @change="handleTagChange('type', $event)"
                allow-clear
              >
                <a-select-option v-for="(item, index) in typeArr" :key="index" :value="index">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <!-- 领域标签筛选（下拉框） -->
          <a-col :span="4">
            <a-form-item label="领域">
              <a-select
                v-model="queryParam.domain"
                placeholder="请选择领域"
                @change="handleTagChange('domain', $event)"
                allow-clear
              >
                <a-select-option v-for="(item, index) in domainArr" :key="index" :value="index">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <!-- 行业标签筛选（下拉框） -->
          <a-col :span="4">
            <a-form-item label="行业">
              <a-select
                v-model="queryParam.industry"
                placeholder="请选择行业"
                @change="handleTagChange('industry', $event)"
                allow-clear
              >
                <a-select-option v-for="(item, index) in industryArr" :key="index" :value="index">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <!-- 场景标签筛选（下拉框） -->
          <a-col :span="4">
            <a-form-item label="场景">
              <a-select
                v-model="queryParam.scenario"
                placeholder="请选择场景"
                @change="handleTagChange('scenario', $event)"
                allow-clear
              >
                <a-select-option v-for="(item, index) in scenarioArr" :key="index" :value="index">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <!-- 技术标签筛选（下拉框） -->
          <a-col :span="4">
            <a-form-item label="技术">
              <a-select
                v-model="queryParam.technology"
                placeholder="请选择技术"
                @change="handleTagChange('technology', $event)"
                allow-clear
              >
                <a-select-option v-for="(item, index) in technologyArr" :key="index" :value="index">
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 检索结果表格部分 -->
    <a-card :bordered="false" :title="agentSearchData.length > 0 ? 'AI智能检索为您推荐以下微服务' : false">
      <a-table
        ref="table"
        :columns="columns"
        :dataSource="filteredDataSource"
        :loading="dataLoading"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="norm" slot-scope="text">
          <template v-if="text && text.length">
            <a-popover v-for="(item, index) in text" :key="index" title="可信云技术服务溯源">
              <template slot="content">
                <p>{{ item.key | normFilter }}</p>
                <el-rate :value="item.score" disabled show-score text-color="#ff9900" />
              </template>
              <a-tag color="#87d068">
                <a-icon type="check" /> {{ item.key | normFilter }}
              </a-tag>
            </a-popover>
          </template>
          <template v-else>
            <a-tag>无技术指标数据</a-tag>
          </template>
        </span>
        <span slot="source" slot-scope="text">
          <template v-if="text">
            <a-popover :title="text.popoverTitle || '服务溯源'">
              <template slot="content">
                <h1>公司信息</h1>
                <p><strong>公司名称：</strong>{{ text.companyName || '暂无信息' }}</p>
                <p><strong>地址：</strong>{{ text.companyAddress || '暂无信息' }}</p>
                <p><strong>联系方式：</strong>{{ text.companyContact || '暂无信息' }}</p>
                <p><strong>简介：</strong>{{ text.companyIntroduce || '暂无信息' }}</p>
                <p>综合可信度：</p>
                <el-rate :value="text.companyScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.companyScore || 0).toString()"></el-rate>
                <h1>微服务信息</h1>
                <p><strong>微服务描述:</strong> {{ text.msIntroduce || '暂无信息' }}</p>
                <p>综合可信度：
                  <el-rate :value="text.msScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.msScore || 0).toString()"></el-rate>
                </p>
              </template>
              <a-tag color="blue" @change="handleSource(text)">知识产权</a-tag>
            </a-popover>
            <a-popover :title="text.popoverTitle || '服务溯源'">
              <template slot="content">
                <h1>公司信息</h1>
                <p><strong>公司名称：</strong>{{ text.companyName || '暂无信息' }}</p>
                <p><strong>地址：</strong>{{ text.companyAddress || '暂无信息' }}</p>
                <p><strong>联系方式：</strong>{{ text.companyContact || '暂无信息' }}</p>
                <p><strong>简介：</strong>{{ text.companyIntroduce || '暂无信息' }}</p>
                <p>综合可信度：</p>
                <el-rate :value="text.companyScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.companyScore || 0).toString()"></el-rate>
                <h1>微服务信息</h1>
                <p><strong>微服务描述:</strong> {{ text.msIntroduce || '暂无信息' }}</p>
                <p>综合可信度：
                  <el-rate :value="text.msScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.msScore || 0).toString()"></el-rate>
                </p>
              </template>
              <a-tag color="cyan" @change="handleSource(text)">应用案例</a-tag>
            </a-popover>
            <a-popover :title="text.popoverTitle || '服务溯源'">
              <template slot="content">
                <h1>公司信息</h1>
                <p><strong>公司名称：</strong>{{ text.companyName || '暂无信息' }}</p>
                <p><strong>地址：</strong>{{ text.companyAddress || '暂无信息' }}</p>
                <p><strong>联系方式：</strong>{{ text.companyContact || '暂无信息' }}</p>
                <p><strong>简介：</strong>{{ text.companyIntroduce || '暂无信息' }}</p>
                <p>综合可信度：</p>
                <el-rate :value="text.companyScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.companyScore || 0).toString()"></el-rate>
                <h1>微服务信息</h1>
                <p><strong>微服务描述:</strong> {{ text.msIntroduce || '暂无信息' }}</p>
                <p>综合可信度：
                  <el-rate :value="text.msScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.msScore || 0).toString()"></el-rate>
                </p>
              </template>
              <a-tag color="orange" @change="handleSource(text)">舆情信息</a-tag>
            </a-popover>
            <a-popover :title="text.popoverTitle || '服务溯源'">
              <template slot="content">
                <h1>公司信息</h1>
                <p><strong>公司名称：</strong>{{ text.companyName || '暂无信息' }}</p>
                <p><strong>地址：</strong>{{ text.companyAddress || '暂无信息' }}</p>
                <p><strong>联系方式：</strong>{{ text.companyContact || '暂无信息' }}</p>
                <p><strong>简介：</strong>{{ text.companyIntroduce || '暂无信息' }}</p>
                <p>综合可信度：</p>
                <el-rate :value="text.companyScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.companyScore || 0).toString()"></el-rate>
                <h1>微服务信息</h1>
                <p><strong>微服务描述:</strong> {{ text.msIntroduce || '暂无信息' }}</p>
                <p>综合可信度：
                  <el-rate :value="text.msScore || 0" disabled show-score text-color="#ff9900" :score-template="(text.msScore || 0).toString()"></el-rate>
                </p>
              </template>
              <a-tag color="green" @change="handleSource(text)">链上存证</a-tag>
            </a-popover>
          </template>
          <template v-else>
            <a-tag>无溯源数据</a-tag>
          </template>
        </span>
        <span slot="action" slot-scope="text, record">
          <a @click="handleUse(record)">使用</a>
        </span>
      </a-table>
    </a-card>

    <!-- 领域知识增强浮动容器 -->
    <div
      v-if="showRAGInput"
      ref="ragContainer"
      class="rag-input-container"
      :style="containerStyle"
    >
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="上传知识库文档">
            <a-upload
              :file-list="ragFiles"
              :remove="removeRagFile"
              :customRequest="customRagFileChose"
              :multiple="true">
              <a-button> <a-icon type="upload" /> 选择文件 </a-button>
            </a-upload>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item tooltip="value*category">
            <span slot="label">上载知识库
              <a-tooltip title="上载后可以使用该知识库进行领域知识增强检索">
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <a-button type="primary" @click="handleRagUpload" icon="cloud-upload" :loading="ragUploadLoading">
              提交
            </a-button>
          </a-form-item>
        </a-col>
      </a-row>
      <!-- 开发模式下显示可编辑接口配置 -->
      <a-row v-if="isDev">
        <a-form-item label="上载知识库接口地址">
          <a-input style="width: 100%" v-model="ragUploadUrl" placeholder="请输入">
            <span slot="addonBefore" style="text-align: center; display: inline-block;">
              <a-select v-model="ragUploadMethod" style="width: 80px">
                <a-select-option v-for="(item, index) in methodTypeOptions" :key="index" :value="index">
                  {{ item }}
                </a-select-option>
              </a-select>
            </span>
          </a-input>
        </a-form-item>
      </a-row>
    </div>
  </page-header-wrapper>
</template>

<script>

import { ArticleListContent, Ellipsis, StandardFormRow, TagSelect } from '@/components'
import request from '@/utils/request'
import { getServiceData, getMetaAppData } from '@/mock/data/services_data'
import {
  getDictionaryByCategory
} from '@/api/dictionary'
import { getServicesByVerticalType, filterServices } from '@/api/service'

export default {
  name: 'GenericVerticalList',
  components: {
    Ellipsis,
    TagSelect,
    StandardFormRow,
    ArticleListContent
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
      // 开发模式标志
      isDev: this.$route.query.isDev === 'true',
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      editForm: this.$form.createForm(this),
      visible: false,
      confirmLoading: false,
      mdl: {
        name: '',
        norm: [],
        source: {}
      },
      // 知识增强
      showRAGInput: false,
      ragFiles: [],
      ragUploadFiles: [],
      ragUploadUrl: 'https://apirag.xyz:8086/api/predict',
      ragUploadMethod: 1,
      methodTypeOptions: [],
      ragUploadLoading: false,
      hasRagData: false,
      agentSearchLoading: false,
      agentSearchForm: {
        name: '',
        description: '',
        role: '',
        function: '',
        requirement: ''
      },
      agentSearchApiUrl: 'https://apirag.xyz:8086/api/predict',
      agentSearchApiMethod: 1,
      agentSearchApiHeader: { 'Content-Type': 'application/json;charset=UTF-8' },
      // 开发测试模式下的数据
      agentSearchApiHeaderText: JSON.stringify({ 'Content-Type': 'application/json;charset=UTF-8' }, null, 4),
      agentSearchApiResult: { answer: '' },
      agentSearchData: [],
      statusMap: {},
      normMap: {},
      // 查询参数
      queryParam: {
        attribute: [],
        type: [],
        domain: [],
        industry: [],
        scenario: [],
        technology: []
      },
      // 表格列配置
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '服务名称',
          dataIndex: 'name'
        },
        {
          title: '服务类型',
          dataIndex: 'type',
          width: '100px',
          customRender: (text) => this.typeArr[text] || '未知类型'
        },
        {
          title: '技术类型',
          dataIndex: 'technology',
          width: '100px',
          customRender: (text) => this.technologyArr[text] || '未知技术'
        },
        {
          title: '服务状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '技术指标',
          dataIndex: 'norm',
          scopedSlots: { customRender: 'norm' }
        },
        {
          title: '调用次数',
          dataIndex: 'number',
          customRender: (text) => text + ' 次'
        },
        {
          title: '服务溯源',
          dataIndex: 'source',
          scopedSlots: { customRender: 'source' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '80px',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ],
      dataLoading: false,
      dataSource: [],
      filteredDataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      // 筛选相关字典数据
      attributeArr: [],
      typeArr: [],
      domainArr: [],
      industryArr: [],
      scenarioArr: [],
      technologyArr: [],
      containerStyle: {
        top: '0',
        left: '0'
      }
    }
  },
  filters: {
    statusFilter(type) {
      if (type === undefined || type === null) {
        return '未知状态'
      }
      // 默认状态映射
      const defaultStatusMap = {
        0: { text: '容器分配失败', status: 'error' },
        1: { text: '运行中(未通过测评)', status: 'warning' },
        2: { text: '未运行', status: 'default' },
        3: { text: '异常', status: 'error' },
        4: { text: '运行中(已通过测评)', status: 'success' },
        5: { text: '部署中', status: 'processing' }
      }
      // 使用默认映射
      return defaultStatusMap[type]?.text || '未知状态'
    },
    statusTypeFilter(type) {
      if (type === undefined || type === null) {
        return 'default'
      }
      // 默认状态映射
      const defaultStatusMap = {
        0: { text: '容器分配失败', status: 'error' },
        1: { text: '运行中(未通过测评)', status: 'warning' },
        2: { text: '未运行', status: 'default' },
        3: { text: '异常', status: 'error' },
        4: { text: '运行中(已通过测评)', status: 'success' },
        5: { text: '部署中', status: 'processing' }
      }
      // 使用默认映射
      return defaultStatusMap[type]?.status || 'default'
    },
    normFilter(type) {
      if (type === undefined || type === null) {
        return '未知指标'
      }
      // 默认技术指标映射
      const defaultNormMap = {
        0: { text: '安全性', status: 'security' },
        1: { text: '鲁棒性', status: 'robustness' },
        2: { text: '隐私性', status: 'privacy' },
        3: { text: '可信性', status: 'trustworthiness' }
      }
      // 使用默认映射
      return defaultNormMap[type]?.text || '未知指标'
    }
  },
  // 开发测试模式下的计算属性
  computed: {
    agentSearchApiResultText() {
      return JSON.stringify(this.agentSearchApiResult, null, 4)
    },
    agentSearchFormText() {
      return JSON.stringify(this.agentSearchForm, null, 4)
    }
  },
  created() {
    // 确保$root.$data存在并初始化共享映射
    if (!this.$root.$data) {
      this.$root.$data = {}
    }

    // 初始化可以来自静态方法或从API加载
    this.initStaticData()
    this.loadDictionaryData()
    this.initData()

    // 将状态映射和技术指标映射存储在根组件数据中以便过滤器使用
    this.$root.$data.statusMap = this.statusMap
    this.$root.$data.normMap = this.normMap
  },
  mounted() {
    // 监听窗口大小变化，动态调整容器位置
    window.addEventListener('resize', this.updateContainerPosition)
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('resize', this.updateContainerPosition)
  },
  watch: {
    // 监听垂直领域类型变化，重新加载数据
    verticalType: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          console.log('垂直领域类型变化:', oldVal, '->', newVal)
          this.initStaticData()
          this.loadDictionaryData()
          this.initData()

          // 更新根组件中的映射数据
          this.$root.$data.statusMap = this.statusMap
          this.$root.$data.normMap = this.normMap
        }
      },
      immediate: false
    }
  },
  methods: {
    // 初始化静态字典数据，后期可替换为API调用
    initStaticData() {
      // 重置筛选条件
      this.queryParam = {
        attribute: [],
        type: [],
        domain: [],
        industry: [],
        scenario: [],
        technology: []
      }

      // 初始化基础状态映射
      this.initStatusMap()

      // 初始化技术指标映射
      this.initNormMap()

      // 设置领域名称
      const verticalTitleMap = {
        'aml': '跨境支付AI监测服务',
        'aircraft': '无人飞机AI监控服务',
        'health': '乡村医疗AI智能服务',
        'agriculture': '数字农业AI智能服务',
        'evtol': '低空飞行AI应用服务',
        'ecommerce': '跨境电商AI应用服务',
        'homeAI': '家庭陪伴AI应用服务'
      }
      this.domainArr = [verticalTitleMap[this.verticalType]]
    },
    // 初始化状态映射
    initStatusMap() {
      // 默认状态映射
      this.statusMap = {
        0: { text: '容器分配失败', status: 'error' },
        1: { text: '运行中(未通过测评)', status: 'warning' },
        2: { text: '未运行', status: 'default' },
        3: { text: '异常', status: 'error' },
        4: { text: '运行中(已通过测评)', status: 'success' },
        5: { text: '部署中', status: 'processing' }
      }
    },

    // 初始化技术指标映射
    initNormMap() {
      // 默认技术指标映射
      this.normMap = {
        0: { text: '安全性', status: 'security' },
        1: { text: '鲁棒性', status: 'robustness' },
        2: { text: '隐私性', status: 'privacy' },
        3: { text: '可信性', status: 'trustworthiness' }
      }
    },

    // 从API获取字典数据
    async loadDictionaryData() {
      try {
        // 加载不同类别的字典数据
        const requests = [
          this.fetchDictionary('status'),
          this.fetchDictionary('norm'),
          this.fetchDictionary('attribute'),
          this.fetchDictionary('service_type'),
          this.fetchDictionary('method_type'),
          this.fetchDictionary(`${this.verticalType}_industry`),
          this.fetchDictionary(`${this.verticalType}_scenario`),
          this.fetchDictionary(`${this.verticalType}_technology`)
        ]

        const [
          statusData,
          normData,
          attributeData,
          serviceTypesData,
          methodTypesData,
          industriesData,
          scenariosData,
          technologiesData
        ] = await Promise.all(requests)

        // 处理状态字典数据
        if (statusData.status === 'success' && statusData.dictionaries.length > 0) {
          this.statusMap = this.convertDictionariesToMap(statusData.dictionaries)
        } else {
          console.warn('使用默认状态映射')
          this.initStatusMap()
        }

        // 处理规范字典数据
        if (normData.status === 'success' && normData.dictionaries.length > 0) {
          this.normMap = this.convertDictionariesToMap(normData.dictionaries)
        } else {
          console.warn('使用默认技术指标映射')
          this.initNormMap()
        }

        // 更新根组件中的映射数据
        this.$root.$data.statusMap = this.statusMap
        this.$root.$data.normMap = this.normMap

        // 处理属性字典数据
        if (attributeData.status === 'success') {
          this.attributeArr = attributeData.dictionaries.map(item => item.text)
        }

        // 处理服务类型字典数据
        if (serviceTypesData.status === 'success') {
          this.typeArr = serviceTypesData.dictionaries.map(item => item.text)
        }

        // 处理方法类型字典数据
        if (methodTypesData.status === 'success') {
          this.methodTypeOptions = methodTypesData.dictionaries.map(item => item.text)
        }

        // 处理行业字典数据
        if (industriesData.status === 'success') {
          this.industryArr = industriesData.dictionaries.map(item => item.text)
        }

        // 处理场景字典数据
        if (scenariosData.status === 'success') {
          this.scenarioArr = scenariosData.dictionaries.map(item => item.text)
        }

        // 处理技术字典数据
        if (technologiesData.status === 'success') {
          this.technologyArr = technologiesData.dictionaries.map(item => item.text)
        }
      } catch (error) {
        console.error('加载字典数据失败:', error)
        this.$message.error('加载数据字典失败，请刷新重试')
      }
    },

    // 将字典数据转换为映射对象
    convertDictionariesToMap(dictionaries) {
      const map = {}
      dictionaries.forEach((item, index) => {
        map[index] = {
          text: item.text,
          status: item.code
        }
      })
      return map
    },

    // 获取特定类别的字典数据
    async fetchDictionary(category) {
      try {
        const response = await getDictionaryByCategory(category)
        return response
      } catch (error) {
        console.error(`获取${category}字典数据失败:`, error)
        return { status: 'error', message: error.message, dictionaries: [] }
      }
    },

    // 筛选标签变化处理
    handleTagChange(field, value) {
      if (Array.isArray(value)) {
        this.queryParam[field] = value
      } else {
        this.queryParam[field] = [value]
      }
      this.filterDataSource()
    },

    // 根据筛选条件过滤数据
    async filterDataSource() {
      // 收集所有筛选条件
      const filters = {}

      // 只添加有值的筛选条件
      if (this.queryParam.attribute.length > 0) {
        filters.attribute = this.queryParam.attribute[0]
      }

      if (this.queryParam.type.length > 0) {
        filters.type = this.queryParam.type[0]
      }

      if (this.queryParam.industry.length > 0) {
        filters.industry = this.queryParam.industry[0]
      }

      if (this.queryParam.scenario.length > 0) {
        filters.scenario = this.queryParam.scenario[0]
      }

      if (this.queryParam.technology.length > 0) {
        filters.technology = this.queryParam.technology[0]
      }

      // 根据垂直领域类型，添加对应的领域ID
      const verticalDomainMap = {
        'aml': 0,
        'aircraft': 1,
        'health': 2,
        'agriculture': 3,
        'evtol': 4,
        'ecommerce': 5,
        'homeAI': 6
      }

      // 添加领域过滤条件
      if (verticalDomainMap[this.verticalType] !== undefined) {
        filters.domain = verticalDomainMap[this.verticalType]
      }

      try {
        // 如果没有筛选条件，则直接使用已有数据
        if (Object.keys(filters).length === 0) {
          this.filteredDataSource = this.dataSource
          return
        }

        // 发送筛选请求
        const response = await filterServices(filters)

        if (response && response.status === 'success') {
          this.filteredDataSource = response.services
        } else {
          // 如果API调用失败，回退到客户端筛选
          this.filteredDataSource = this.dataSource.filter(item => {
            return (
              (this.queryParam.attribute.length > 0
                ? this.queryParam.attribute.includes(item.attribute)
                : true) &&
              (this.queryParam.type.length > 0
                ? this.queryParam.type.includes(item.type)
                : true) &&
              (this.queryParam.industry.length > 0
                ? this.queryParam.industry.includes(item.industry)
                : true) &&
              (this.queryParam.scenario.length > 0
                ? this.queryParam.scenario.includes(item.scenario)
                : true) &&
              (this.queryParam.technology.length > 0
                ? this.queryParam.technology.includes(item.technology)
                : true)
            )
          })
        }
      } catch (error) {
        console.error('筛选服务数据失败:', error)
        this.$message.error('筛选数据失败，使用本地筛选')

        // 发生错误时回退到客户端筛选
        this.filteredDataSource = this.dataSource.filter(item => {
          return (
            (this.queryParam.attribute.length > 0
              ? this.queryParam.attribute.includes(item.attribute)
              : true) &&
            (this.queryParam.type.length > 0
              ? this.queryParam.type.includes(item.type)
              : true) &&
            (this.queryParam.industry.length > 0
              ? this.queryParam.industry.includes(item.industry)
              : true) &&
            (this.queryParam.scenario.length > 0
              ? this.queryParam.scenario.includes(item.scenario)
              : true) &&
            (this.queryParam.technology.length > 0
              ? this.queryParam.technology.includes(item.technology)
              : true)
          )
        })
      }
    },

    // 重置搜索表单
    handleReset() {
      this.agentSearchForm = {
        name: '',
        description: '',
        role: '',
        function: '',
        requirement: ''
      }
    },

    // 智能检索处理
    async handleAgentSearch() {
      const { name, description, role, function: feature, requirement } = this.agentSearchForm
      if (name || description || role || feature || requirement) {
        this.agentSearchLoading = true

        // 知识增强
        if (this.hasRagData) {
          this.$message.info('正在应用领域知识增强进行智能检索...')
        } else {
          this.$message.info('正在进行智能检索...')
        }

        try {
          // 开发测试模式下解析JSON请求头
          if (this.isDev) {
            try {
              this.agentSearchApiHeader = JSON.parse(this.agentSearchApiHeaderText)
            } catch (error) {
              this.$message.error('请求头JSON格式错误，请检查')
              this.agentSearchLoading = false
              return
            }
          }

          // 处理响应
          this.agentSearchApiResult = await request({
            url: this.agentSearchApiUrl,
            method: this.methodTypeOptions[this.agentSearchApiMethod] || 'POST',
            data: this.agentSearchForm,
            headers: this.agentSearchApiHeader
          })

          // 开发测试模式和正常模式的处理
          if (!this.isDev) {
            this.agentSearchData = this.agentSearchApiResult.answer.split('\n')
            this.filteredDataSource = this.dataSource.filter(item =>
              this.agentSearchData.includes(item.name)
            )

            this.$nextTick(() => {
              this.$message.success('检索完毕！')
              // 滚动到表格处
              const table = this.$refs.table.$el
              table.scrollIntoView()
            })
          } else {
            this.$message.success('结果已返回！')
          }
        } catch (error) {
          console.error('智能检索请求失败:', error)
          this.$message.error('请求异常，请稍后重试！')
        } finally {
          this.agentSearchLoading = false
        }
      } else {
        this.$message.error('请先输入您的需求！')
      }
    },

    // 从API获取服务数据
    async fetchServicesFromAPI() {
      try {
        const response = await getServicesByVerticalType(this.verticalType)
        return response
      } catch (error) {
        console.error('获取服务数据失败:', error)
        return null
      }
    },

    // 标准化API返回的数据，确保格式统一
    standardizeServiceData(services) {
      return services.map(service => {
        // 确保status属性存在，默认为正常状态(4)
        if (service.status === undefined || service.status === null) {
          service.status = 4 // 默认为"运行中(已通过测评)"
        }

        // 确保norm属性存在且为数组
        if (!service.norm || !Array.isArray(service.norm)) {
          service.norm = []
        }

        // 确保source属性存在
        if (!service.source) {
          service.source = {
            popoverTitle: '服务溯源',
            companyName: '',
            companyAddress: '',
            companyContact: '',
            companyIntroduce: '',
            msIntroduce: '',
            companyScore: 0,
            msScore: 0
          }
        }

        return service
      })
    },

    // 初始化数据
    async initData() {
      this.dataLoading = true
      this.agentSearchData = []
      this.filteredDataSource = [] // 清空现有数据，避免显示上一个页面的数据

      try {
        console.log('正在加载服务数据，垂直领域类型:', this.verticalType)

        // 优先尝试从API获取数据
        const response = await this.fetchServicesFromAPI()

        if (response && response.status === 'success') {
          console.log(`成功从API获取到${response.services.length}条服务数据`)
          // 标准化数据
          this.dataSource = this.standardizeServiceData(response.services)
        } else {
          console.log('API获取失败，回退到静态数据')
          // 如果API调用失败，回退到静态数据
          const [serviceData, metaData] = await Promise.all([
            getServiceData(this.verticalType),
            getMetaAppData(this.verticalType)
          ])
          // 标准化数据
          this.dataSource = this.standardizeServiceData([...serviceData, ...metaData])
        }

        this.filteredDataSource = this.dataSource
      } catch (error) {
        console.error('初始化数据失败:', error)

        // 出错时回退到静态数据
        try {
          const [serviceData, metaData] = await Promise.all([
            getServiceData(this.verticalType),
            getMetaAppData(this.verticalType)
          ])
          // 标准化数据
          this.dataSource = this.standardizeServiceData([...serviceData, ...metaData])
          this.filteredDataSource = this.dataSource
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

    // 显示/隐藏知识增强输入框
    toggleRAGInput() {
      this.showRAGInput = !this.showRAGInput
      if (this.showRAGInput) {
        this.$nextTick(() => {
          this.updateContainerPosition()
        })
      }
    },

    // 更新容器位置
    updateContainerPosition() {
      const button = this.$refs.ragButton.$el
      const container = this.$refs.ragContainer

      if (button && container) {
        const buttonRect = button.getBoundingClientRect()
        // 设置容器的位置在按钮的下侧
        this.containerStyle = {
          top: `${buttonRect.top + 50}px`,
          left: `${buttonRect.left - 120}px`
        }
      }
    },

    // 知识增强文件选择
    async customRagFileChose(options) {
      const { file } = options
      if (!file) {
        return false
      }
      this.ragUploadFiles = [file]
      const url = URL.createObjectURL(file)
      this.ragFiles = [{
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url // url 是展示在页面上的绝对链接
      }]
    },

    // 移除知识增强文件
    removeRagFile() {
      this.ragFiles = []
      this.ragUploadFiles = []
    },

    // 上传知识增强文件
    async handleRagUpload() {
      if (this.ragUploadFiles.length === 0) {
        this.$message.error('请先选择文件！')
        return
      }

      this.ragUploadLoading = true

      try {
        const formData = new FormData()
        formData.append('file', this.ragUploadFiles[0])
        formData.append('category', this.verticalType)

        const response = await request({
          url: this.ragUploadUrl,
          method: this.methodTypeOptions[this.ragUploadMethod] || 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (this.isDev) {
          this.$message.success('知识库上传成功！')
          this.hasRagData = true
          this.showRAGInput = false
        } else if (response && response.code === 200) {
          this.$message.success('知识库上传成功！')
          this.hasRagData = true
          this.showRAGInput = false
        } else {
          this.$message.error(response?.message || '上传失败')
        }
      } catch (error) {
        console.error('上传知识库文件失败:', error)
        this.$message.error('上传失败，请稍后重试！')
      } finally {
        this.ragUploadLoading = false
      }
    },

    // 使用服务
    handleUse(record) {
      switch (record.status) {
        case 0:
          this.$message.error('服务部署失败，请重新部署后使用！')
          break
        case 2:
          this.$message.info('服务未运行，请启动后使用！')
          break
        case 3:
          this.$message.error('服务异常，暂无法使用！')
          break
        case 5:
          this.$message.warning('服务部署中，暂无法使用！')
          break
        default:
          this.$emit('onGoUse', record)
          break
      }
    }
  }
}
</script>

<style lang="less" scoped>
.rag-input-container {
  position: fixed;
  width: 400px;
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
</style>
