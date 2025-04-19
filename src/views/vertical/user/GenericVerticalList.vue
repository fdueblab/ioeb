<template>
  <page-header-wrapper :title="false">
    <!-- 智能搜索部分 -->
    <search-form
      :is-dev="isDev"
      :method-type-options="methodTypeOptions"
      :vertical-type="verticalType"
      @search-completed="handleSearchCompleted"
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
        :status-dict="statusDict"
        :status-style-dict="statusStyleDict"
        :norm-dict="normDict"
        :type-arr="typeArr"
        :technology-arr="technologyArr"
        @edit="handleEdit"
        @use="handleUse"
        ref="serviceTable"
      />
    </a-card>

    <!-- 编辑模态框 -->
    <service-edit-modal
      :visible="visible"
      :confirm-loading="confirmLoading"
      :record="mdl"
      :status-dict="statusDict"
      :norm-dict="normDict"
      :type-arr="typeArr"
      :technology-arr="technologyArr"
      :industry-arr="industryArr"
      :scenario-arr="scenarioArr"
      :attribute-arr="attributeArr"
      @ok="handleOk"
      @cancel="handleCancel"
    />
  </page-header-wrapper>
</template>

<script>
import { getMetaAppData, getServiceData } from '@/mock/data/services_data'
import { filterServices, getServicesByVerticalType } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'

// 导入拆分出的组件
import SearchForm from './components/SearchForm'
import FilterCard from './components/FilterCard'
import ServiceTable from './components/ServiceTable'
import ServiceEditModal from './components/ServiceEditModal'

export default {
  name: 'GenericVerticalList',
  components: {
    SearchForm,
    FilterCard,
    ServiceTable,
    ServiceEditModal
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
      visible: false,
      confirmLoading: false,
      mdl: {
        name: '',
        type: undefined,
        technology: undefined,
        status: undefined,
        industry: undefined,
        scenario: undefined,
        attribute: [],
        number: 0,
        norm: [],
        source: {
          companyName: '',
          companyAddress: '',
          companyContact: '',
          companyIntroduce: '',
          msIntroduce: '',
          companyScore: 0,
          msScore: 0
        }
      },
      agentSearchData: [],
      statusDict: [],
      statusStyleDict: [],
      normDict: [],
      // 表格相关数据
      dataLoading: false,
      dataSource: [],
      filteredDataSource: [],
      // 筛选相关字典数据
      attributeArr: [],
      typeArr: [],
      industryArr: [],
      scenarioArr: [],
      technologyArr: [],
      methodTypeOptions: []
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
      this.filterDataSource(filterValues)
    },
    // 处理搜索结果 - 从SearchForm组件接收
    handleSearchCompleted(searchResults) {
      this.agentSearchData = searchResults
      this.filteredDataSource = this.dataSource.filter(item =>
        searchResults.includes(item.name)
      )

      this.$nextTick(() => {
        this.$message.success('检索完毕！')
        // 滚动到表格处
        const table = this.$refs.serviceTable.$el
        if (table) {
          table.scrollIntoView({ behavior: 'smooth' })
        }
      })
    },
    // 根据筛选条件过滤数据
    async filterDataSource(filterValues) {
      // 收集所有筛选条件
      const filters = {}
      // 只添加有值的筛选条件
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
      // 添加领域过滤条件
      filters.domain = this.verticalType

      try {
        // 如果没有筛选条件，则直接使用已有数据
        if (Object.keys(filters).length === 1) { // 只有domain一个条件
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
              (filterValues.attribute && filterValues.attribute.length > 0
                ? filterValues.attribute.some(attr => item.attribute && item.attribute.includes(attr))
                : true) &&
              (filterValues.type
                ? item.type === filterValues.type
                : true) &&
              (filterValues.industry
                ? item.industry === filterValues.industry
                : true) &&
              (filterValues.scenario
                ? item.scenario === filterValues.scenario
                : true) &&
              (filterValues.technology
                ? item.technology === filterValues.technology
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
            (filterValues.attribute && filterValues.attribute.length > 0
              ? filterValues.attribute.some(attr => item.attribute && item.attribute.includes(attr))
              : true) &&
            (filterValues.type
              ? item.type === filterValues.type
              : true) &&
            (filterValues.industry
              ? item.industry === filterValues.industry
              : true) &&
            (filterValues.scenario
              ? item.scenario === filterValues.scenario
              : true) &&
            (filterValues.technology
              ? item.technology === filterValues.technology
              : true)
          )
        })
      }
    },
    // 从API获取服务数据
    async fetchServicesFromAPI() {
      try {
        return await getServicesByVerticalType(this.verticalType)
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
    // 处理编辑
    handleEdit(record) {
      this.visible = true // 显示模态框
      this.mdl = { ...record } // 将选中的记录数据复制到模型中
    },
    // 处理编辑确认
    handleOk(updatedRecord) {
      this.confirmLoading = true

      // 模拟更新数据
      setTimeout(() => {
        const index = this.filteredDataSource.findIndex(item => item.id === updatedRecord.id)
        if (index > -1) {
          this.filteredDataSource.splice(index, 1, updatedRecord)
          this.filteredDataSource = [...this.filteredDataSource] // 触发视图更新
        }
        this.visible = false
        this.confirmLoading = false
        this.$message.success('编辑成功')
      }, 500)
    },
    // 处理编辑取消
    handleCancel() {
      this.visible = false
      this.mdl = {
        name: '',
        type: undefined,
        technology: undefined,
        status: undefined,
        industry: undefined,
        scenario: undefined,
        attribute: [],
        number: 0,
        norm: [],
        source: {
          companyName: '',
          companyAddress: '',
          companyContact: '',
          companyIntroduce: '',
          msIntroduce: '',
          companyScore: 0,
          msScore: 0
        }
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
/* 页面样式在各组件中定义 */
</style>
