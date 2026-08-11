<template>
  <page-header-wrapper :title="false">
    <!-- 智能搜索部分 -->
    <search-form
      :is-dev="isDev"
      :method-type-options="methodTypeOptions"
      :services="dataSource"
      :attribute-arr="attributeArr"
      :type-arr="typeArr"
      :industry-arr="industryArr"
      :scenario-arr="scenarioArr"
      :technology-arr="technologyArr"
      :vertical-type="verticalType"
      @search-completed="handleSearchCompleted"
      @search-reset="handleSearchReset"
    />

    <!-- 筛选标签部分 -->
    <filter-card
      :attribute-arr="attributeArr"
      :type-arr="typeArr"
      :industry-arr="industryArr"
      :scenario-arr="scenarioArr"
      :technology-arr="technologyArr"
      @filter-change="handleFilterChange"
      ref="filterCard"
    />

    <!-- 检索结果表格部分 -->
    <a-card :bordered="false" :title="agentSearchData.length > 0 ? 'AI智能检索为您推荐以下微服务' : false">
      <service-table
        :data-source="filteredDataSource"
        :loading="dataLoading"
        :pagination="tablePagination"
        :status-dict="statusDict"
        :status-style-dict="statusStyleDict"
        :norm-dict="normDict"
        :type-arr="typeArr"
        :technology-arr="technologyArr"
        mode="default"
        @edit="handleEdit"
        @use="handleUse"
        @table-change="handleTableChange"
        @purchase="handlePurchase"
        @add-interested="handleAddInterested"
        ref="serviceTable"
      />
    </a-card>

    <!-- 编辑模态框 -->
    <service-edit-modal
      :status-dict="statusDict"
      :norm-dict="normDict"
      :type-arr="typeArr"
      :technology-arr="technologyArr"
      :industry-arr="industryArr"
      :scenario-arr="scenarioArr"
      :attribute-arr="attributeArr"
      @ok="handleOk"
      ref="serviceEditModal"
    />

    <!-- 消息对话模态框 -->
    <message-modal ref="messageModal" @sent="handleMessageSent" />
  </page-header-wrapper>
</template>

<script>
import { filterServices, getServiceById, getServicesByVerticalType, addServiceRelation } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'
// 导入拆分出的组件
import SearchForm from './components/SearchForm'
import FilterCard from './components/FilterCard'
import ServiceTable from './components/ServiceTable'
import ServiceEditModal from './components/ServiceEditModal'
import MessageModal from '@/views/account/components/MessageModal'
import { standardizeServiceData } from '@/utils/serviceData'

export default {
  name: 'GenericVerticalList',
  components: {
    SearchForm,
    FilterCard,
    ServiceTable,
    ServiceEditModal,
    MessageModal
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
      agentSearchData: [],
      statusDict: [],
      statusStyleDict: [],
      normDict: [],
      // 表格相关数据
      dataLoading: false,
      dataSource: [],
      filteredDataSource: [],
      activeFilters: {},
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true
      },
      // 筛选相关字典数据
      attributeArr: [],
      typeArr: [],
      industryArr: [],
      scenarioArr: [],
      technologyArr: [],
      methodTypeOptions: []
    }
  },
  computed: {
    tablePagination() {
      if (this.agentSearchData.length > 0) {
        return false
      }
      return this.pagination
    }
  },
  created() {
    this.initStaticData()
    this.loadDictionaryData()
    this.initData()
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
  activated() {
    // keep-alive 返回本页时：若想定式开发刚登记过同领域资源，则重新拉列表
    try {
      const flag = sessionStorage.getItem(`eb_vertical_list_refresh_${this.verticalType}`)
      if (flag === '1') {
        sessionStorage.removeItem(`eb_vertical_list_refresh_${this.verticalType}`)
        this.initData()
      }
    } catch (e) {
      /* ignore */
    }
  },
  methods: {
    initStaticData() {
      // 重置筛选条件和数据
      this.agentSearchData = []
      if (this.$refs.filterCard) {
        this.$refs.filterCard.reset()
      }
      // 初始化为空数组
      this.statusDict = []
      this.statusStyleDict = []
      this.normDict = []
      this.attributeArr = []
      this.typeArr = []
      this.methodTypeOptions = []
      this.industryArr = []
      this.scenarioArr = []
      this.technologyArr = []
    },
    async loadDictionaryData() {
      try {
        // 加载字典缓存
        this.statusDict = await dictionaryCache.loadDict('status') || []
        this.statusStyleDict = await dictionaryCache.loadDict('status_style') || []
        // 微服务和元应用评分
        this.normDict = [...(await dictionaryCache.loadDict('norm') || []), ...(await dictionaryCache.loadDict('performance_metric') || [])]
        this.attributeArr = await dictionaryCache.loadDict('attribute') || []
        this.typeArr = await dictionaryCache.loadDict('service_type') || []
        this.methodTypeOptions = await dictionaryCache.loadDict('method_type') || []
        this.industryArr = await dictionaryCache.loadDict(`${this.verticalType}_industry`) || []
        this.scenarioArr = await dictionaryCache.loadDict(`${this.verticalType}_scenario`) || []
        this.technologyArr = await dictionaryCache.loadDict(`${this.verticalType}_technology`) || []
        // 想定式生成资源类型：若字典未同步，补一条以便筛选与表格展示
        const genAlgo = { code: 'generated_algorithm', text: '想定式生成算法' }
        if (!this.typeArr.some((t) => t.code === genAlgo.code)) {
          this.typeArr = [...this.typeArr, genAlgo]
        }
      } catch (error) {
        console.error('加载字典数据失败:', error)
        this.$message.error('加载数据字典失败，请刷新重试')
        // 确保所有数组初始化，防止undefined错误
        this.statusDict = this.statusDict || []
        this.statusStyleDict = this.statusStyleDict || []
        this.normDict = this.normDict || []
        this.attributeArr = this.attributeArr || []
        this.typeArr = this.typeArr || []
        this.methodTypeOptions = this.methodTypeOptions || []
        this.industryArr = this.industryArr || []
        this.scenarioArr = this.scenarioArr || []
        this.technologyArr = this.technologyArr || []
      }
    },
    // 筛选变化处理 - 从FilterCard组件接收
    handleFilterChange(filterValues) {
      this.agentSearchData = []
      this.filterDataSource(filterValues)
    },
    // 处理搜索结果 - 从SearchForm组件接收
    handleSearchCompleted(searchResults) {
      this.agentSearchData = this.standardizeServiceData(searchResults || [])
      this.filteredDataSource = this.agentSearchData

      this.$nextTick(() => {
        this.$message.success('检索完毕！')
        // 滚动到表格处
        const table = this.$refs.serviceTable.$el
        if (table) {
          table.scrollIntoView({ behavior: 'smooth' })
        }
      })
    },
    handleSearchReset() {
      this.agentSearchData = []
      this.activeFilters = { domain: this.verticalType }
      this.loadServices(1, this.pagination.pageSize)
    },
    buildFiltersFromValues(filterValues) {
      const filters = { domain: this.verticalType }
      if (filterValues.attribute && filterValues.attribute.length > 0) {
        filters.attribute = filterValues.attribute.join(',')
      }
      if (typeof filterValues.type !== 'undefined') {
        filters.type = filterValues.type
      }
      if (typeof filterValues.industry !== 'undefined') {
        filters.industry = filterValues.industry
      }
      if (typeof filterValues.scenario !== 'undefined') {
        filters.scenario = filterValues.scenario
      }
      if (typeof filterValues.technology !== 'undefined') {
        filters.technology = filterValues.technology
      }
      return filters
    },
    async loadServices(page = 1, pageSize = this.pagination.pageSize) {
      const filters = {
        ...this.activeFilters,
        page,
        pageSize
      }
      const response = await filterServices(filters)
      if (response && response.status === 'success') {
        this.dataSource = this.standardizeServiceData(response.services || [])
        this.filteredDataSource = this.dataSource
        this.pagination = {
          ...this.pagination,
          current: response.page || page,
          pageSize: response.pageSize || pageSize,
          total: response.total || 0
        }
        return true
      }
      return false
    },
    handleTableChange(pagination) {
      this.loadServices(pagination.current, pagination.pageSize)
    },
    // 根据筛选条件过滤数据
    async filterDataSource(filterValues) {
      this.activeFilters = this.buildFiltersFromValues(filterValues)

      try {
        const ok = await this.loadServices(1, this.pagination.pageSize)
        if (!ok) {
          this.$message.error('筛选数据失败')
        }
      } catch (error) {
        console.error('筛选服务数据失败:', error)
        this.$message.error('筛选数据失败')
      }
    },
    // 从API获取服务数据
    async fetchServicesFromAPI(page = 1, pageSize = this.pagination.pageSize) {
      try {
        return await getServicesByVerticalType(this.verticalType, { page, pageSize })
      } catch (error) {
        console.error('获取服务数据失败:', error)
        return undefined
      }
    },
    // 标准化API返回的数据，确保格式统一
    standardizeServiceData(services) {
      return standardizeServiceData(services)
    },
    // 初始化数据
    async initData() {
      this.dataLoading = true
      this.agentSearchData = []
      this.filteredDataSource = []
      this.activeFilters = { domain: this.verticalType }
      this.pagination = {
        ...this.pagination,
        current: 1,
        total: 0
      }

      try {
        console.log('正在加载服务数据，垂直领域类型:', this.verticalType)
        const ok = await this.loadServices(1, this.pagination.pageSize)
        if (!ok) {
          this.dataSource = []
          this.filteredDataSource = []
        } else {
          console.log(`成功从API获取到${this.dataSource.length}条服务数据，共${this.pagination.total}条`)
        }
      } catch (error) {
        console.error('初始化数据失败:', error)
        this.dataSource = []
        this.filteredDataSource = []
      } finally {
        this.dataLoading = false
      }
    },
    // 处理编辑
    handleEdit(record) {
      this.$nextTick(() => {
        this.$refs.serviceEditModal.init(record)
      })
    },
    // 处理编辑确认
    handleOk(updatedRecord) {
      // 模拟更新数据 todo: 更新数据库
      setTimeout(() => {
        const index = this.filteredDataSource.findIndex(item => item.id === updatedRecord.id)
        if (index > -1) {
          this.filteredDataSource.splice(index, 1, updatedRecord)
          this.filteredDataSource = [...this.filteredDataSource] // 触发视图更新
        }
        this.$refs.serviceEditModal.visible = false
        this.$refs.serviceEditModal.confirmLoading = false
        this.$message.success('编辑成功')
      }, 500)
    },
    // 使用服务：列表为精简字段，进入使用前拉取详情
    async handleUse(record) {
      if (record && record.type === 'generated_algorithm') {
        this.$emit('onGoUse', record)
        return
      }
      const statusType = this.statusStyleDict.find(item => item.code === record.status)?.text || 'default'
      switch (statusType) {
        case 'default':
        case 'error':
          this.$message.info('服务异常，暂时无法使用！')
          break
        case 'processing':
          this.$message.info('该服务正在部署，暂时无法使用！')
          break
        default: {
          try {
            const res = await getServiceById(record.id)
            if (res && res.status === 'success' && res.service) {
              this.$emit('onGoUse', res.service)
            } else {
              this.$message.error((res && res.message) || '获取服务详情失败')
            }
          } catch (error) {
            console.error('获取服务详情失败:', error)
            this.$message.error('获取服务详情失败')
          }
          break
        }
      }
    },
    // 购买服务：打开对话模态框联系销售方
    handlePurchase(record) {
      this.$refs.messageModal.open(record, {
        messageType: 'contact_purchase'
      })
    },
    // 添加到感兴趣列表
    async handleAddInterested(record) {
      try {
        const res = await addServiceRelation(record.id, 'interested')
        if (res && res.status === 'success') {
          this.$message.success('已添加到感兴趣列表')
        } else {
          this.$message.error((res && res.message) || '添加失败')
        }
      } catch (e) {
        this.$message.error('添加失败：' + ((e && e.message) || e))
      }
    },
    // 消息发送成功回调
    handleMessageSent() {
      // 可以在这里刷新未读消息数等
    }
  }
}
</script>
