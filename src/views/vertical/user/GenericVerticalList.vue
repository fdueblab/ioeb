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
                <a-checkbox v-for="item in attributeArr" :key="item.code" :value="item.code">
                  {{ item.text }}
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
                <a-select-option v-for="item in typeArr" :key="item.code" :value="item.code">
                  {{ item.text }}
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
                <a-select-option v-for="item in industryArr" :key="item.code" :value="item.code">
                  {{ item.text }}
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
                <a-select-option v-for="item in scenarioArr" :key="item.code" :value="item.code">
                  {{ item.text }}
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
                <a-select-option v-for="item in technologyArr" :key="item.code" :value="item.code">
                  {{ item.text }}
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
        size="small"
        :columns="columns"
        :dataSource="filteredDataSource"
        :loading="dataLoading"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="statusTypeFilter(text)" :text="statusFilter(text)" />
        </span>
        <span slot="norm" slot-scope="text">
          <template v-if="text && text.length">
            <a-popover v-for="(item, index) in text" :key="index" title="可信云技术服务溯源">
              <template slot="content">
                <p>{{ normFilter(item.key) }}</p>
                <el-rate :value="item.score" disabled show-score text-color="#ff9900" />
              </template>
              <a-tag color="green" style="margin-bottom: 5px;">
                <a-icon type="check-circle" /> {{ normFilter(item.key) }}
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
              <a-tag color="blue" style="margin-bottom: 5px;" @change="handleSource(text)">知识产权</a-tag>
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
              <a-tag color="cyan" style="margin-bottom: 5px;" @change="handleSource(text)">应用案例</a-tag>
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
              <a-tag color="orange" style="margin-bottom: 5px;" @change="handleSource(text)">舆情信息</a-tag>
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
              <a-tag color="pink" style="margin-bottom: 5px;" @change="handleSource(text)">链上存证</a-tag>
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
import { filterServices, getServicesByVerticalType } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'
import {
  getDictionaryByCategory
} from '@/api/dictionary'

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
      agentSearchApiHeaderText: JSON.stringify({ 'Content-Type': 'application/json;charset=UTF-8' }, undefined, 4),
      agentSearchApiResult: { answer: '' },
      agentSearchData: [],
      statusMap: [],
      normMap: [],
      // 查询参数
      queryParam: {
        attribute: [],
        type: undefined,
        domain: undefined,
        industry: undefined,
        scenario: undefined,
        technology: undefined
      },
      // 表格列配置
      columns: [
        {
          title: '#',
          width: '80px',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '服务名称',
          dataIndex: 'name',
          align: 'center'
        },
        {
          title: '服务类型',
          dataIndex: 'type',
          width: '120px',
          customRender: (text) => {
            const typeItem = this.typeArr.find(item => item.code === text)
            return typeItem ? typeItem.text : '未知类型'
          }
        },
        {
          title: '技术类型',
          dataIndex: 'technology',
          customRender: (text) => {
            const techItem = this.technologyArr.find(item => item.code === text)
            return techItem ? techItem.text : '未知技术'
          }
        },
        {
          title: '服务状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '技术指标',
          dataIndex: 'norm',
          width: '90px',
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
          width: '90px',
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
  },
  // 开发测试模式下的计算属性
  computed: {
    agentSearchApiResultText() {
      return JSON.stringify(this.agentSearchApiResult, undefined, 4)
    },
    agentSearchFormText() {
      return JSON.stringify(this.agentSearchForm, undefined, 4)
    }
  },
  created() {
    this.initStaticData()
    this.loadDictionaryData()
    this.initData()
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
        }
      },
      immediate: false
    }
  },
  methods: {
    statusFilter(type) {
      if (type === undefined) {
        return '未知状态'
      }
      if (!this.statusMap || !Array.isArray(this.statusMap)) {
        return '未知状态'
      }
      const statusItem = this.statusMap.find(item => item && item.code === type)
      return statusItem ? statusItem.text : '未知状态'
    },
    statusTypeFilter(type) {
      if (type === undefined) {
        return 'default'
      }
      if (!this.statusMap || !Array.isArray(this.statusMap)) {
        return 'default'
      }
      const statusItem = this.statusMap.find(item => item && item.code === type)
      return statusItem ? statusItem.code : 'default'
    },
    normFilter(type) {
      if (type === undefined) {
        return '未知指标'
      }
      if (!this.normMap || !Array.isArray(this.normMap)) {
        return '未知指标'
      }
      const normItem = this.normMap.find(item => item && item.code === type)
      return normItem ? normItem.text : '未知指标'
    },
    initStaticData() {
      // 重置筛选条件
      this.queryParam = {
        attribute: [],
        type: undefined,
        domain: undefined,
        industry: undefined,
        scenario: undefined,
        technology: undefined
      }
      // 初始化为空数组
      this.statusMap = []
      this.normMap = []
      this.attributeArr = []
      this.typeArr = []
      this.methodTypeOptions = []
      this.industryArr = []
      this.scenarioArr = []
      this.technologyArr = []
    },
    // 从API获取字典数据
    async loadDictionaryData() {
      try {
        // 加载字典缓存
        this.statusMap = await dictionaryCache.loadDict('status') || []
        this.normMap = await dictionaryCache.loadDict('norm') || []
        this.attributeArr = await dictionaryCache.loadDict('attribute') || []
        this.typeArr = await dictionaryCache.loadDict('service_type') || []
        this.methodTypeOptions = await dictionaryCache.loadDict('method_type') || []
        this.industryArr = await dictionaryCache.loadDict(`${this.verticalType}_industry`) || []
        this.scenarioArr = await dictionaryCache.loadDict(`${this.verticalType}_scenario`) || []
        this.technologyArr = await dictionaryCache.loadDict(`${this.verticalType}_technology`) || []
      } catch (error) {
        console.error('加载字典数据失败:', error)
        this.$message.error('加载数据字典失败，请刷新重试')
        // 确保所有数组初始化，防止undefined错误
        this.statusMap = this.statusMap || []
        this.normMap = this.normMap || []
        this.attributeArr = this.attributeArr || []
        this.typeArr = this.typeArr || []
        this.methodTypeOptions = this.methodTypeOptions || []
        this.industryArr = this.industryArr || []
        this.scenarioArr = this.scenarioArr || []
        this.technologyArr = this.technologyArr || []
      }
    },

    // 筛选标签变化处理
    handleTagChange(field, value) {
      this.queryParam[field] = value
      this.filterDataSource()
    },

    // 根据筛选条件过滤数据
    async filterDataSource() {
      // 收集所有筛选条件
      const filters = {}

      // 只添加有值的筛选条件
      if (this.queryParam.attribute.length > 0) {
        filters.attribute = this.queryParam.attribute.join(',')
      }

      if (typeof this.queryParam.type !== 'undefined') {
        filters.type = this.queryParam.type
      }

      if (typeof this.queryParam.industry !== 'undefined') {
        filters.industry = this.queryParam.industry
      }

      if (typeof this.queryParam.scenario !== 'undefined') {
        filters.scenario = this.queryParam.scenario
      }

      if (typeof this.queryParam.technology !== 'undefined') {
        filters.technology = this.queryParam.technology
      }
      // 添加领域过滤条件
      filters.domain = this.verticalType
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
              (this.queryParam.type
                ? item.type === this.queryParam.type
                : true) &&
              (this.queryParam.industry
                ? item.industry === this.queryParam.industry
                : true) &&
              (this.queryParam.scenario
                ? item.scenario === this.queryParam.scenario
                : true) &&
              (this.queryParam.technology
                ? item.technology === this.queryParam.technology
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
            (this.queryParam.type
              ? item.type === this.queryParam.type
              : true) &&
            (this.queryParam.industry
              ? item.industry === this.queryParam.industry
              : true) &&
            (this.queryParam.scenario
              ? item.scenario === this.queryParam.scenario
              : true) &&
            (this.queryParam.technology
              ? item.technology === this.queryParam.technology
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
        return undefined
      }
    },

    // 标准化API返回的数据，确保格式统一
    standardizeServiceData(services) {
      return services.map(service => {
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
          console.log(response)
          this.$message.success('response message: ', response?.message)
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
