<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="服务名称">
                <a-input v-model="queryParam.name" placeholder="输入服务名称以查询" allowClear />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select v-model="queryParam.status" default-value="all">
                  <a-select-option value="all">全部</a-select-option>
                  <a-select-option v-for="(item, index) in statusDict" :key="index" :value="item.code">
                    {{ item.text }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <div style="display: flex">
                <a-button type="primary" @click="handleSearch" icon="search">查询</a-button>
                <a-button style="margin-left: 20px" @click="handleReset" icon="redo">重置</a-button>
              </div>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
        <a-button style="margin-left: 20px" icon="sync" @click="handleRefresh" :loading="isRefreshing">更新</a-button>
      </div>

      <a-table
        ref="table"
        :columns="columns"
        :dataSource="filteredDataSource"
        :loading="dataLoading"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="name" slot-scope="text" style="font-size: 16px">
          {{ text }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="statusStyleFilter(text)" :text="statusFilter(text)" />
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a v-if="deployingStatusCode.includes(record.status)" @click="handleStop(record)">停止</a>
            <a v-else @click="handleDeploy(record)">部署</a>
            <a-divider type="vertical" />
            <a @click="handleDelete(record)">删除</a>
          </template>
        </span>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { getServicesByVerticalType, filterServices, deployService, stopService, deleteService } from '@/api/service'
import dictionaryCache from '@/utils/dictionaryCache'

export default {
  name: 'GenericContainerManage',
  props: {
    // 垂直领域类型
    verticalType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isRefreshing: false,
      dataLoading: false,
      // 查询参数
      queryParam: {
        name: undefined,
        status: 'all'
      },
      statusDict: [],
      statusStyleDict: [],
      deployingStatusCode: [],
      columns: [
        {
          title: '#',
          width: '60px',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '服务名称',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
          customHeaderCell: () => ({ style: { paddingLeft: '25px' } })
        },
        {
          title: '网络',
          dataIndex: 'network',
          width: '120px'
        },
        {
          title: '端口映射',
          dataIndex: 'port',
          width: '170px'
        },
        {
          title: '卷映射',
          dataIndex: 'volume',
          width: '220px'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          align: 'center',
          width: '170px'
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: '110px',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ],
      dataSource: [],
      filteredDataSource: []
    }
  },
  created() {
    this.loadDictionaryData()
    this.initData()
  },
  watch: {
    // 监听垂直领域类型变化，重新加载数据
    verticalType: {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          console.log('垂直领域类型变化:', oldVal, '->', newVal)
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
    handleAdd() {
      this.$router.push({ path: `/vertical-ms/${this.verticalType}` })
    },
    // 查询
    handleSearch() {
      this.filteredDataSource = this.dataSource.filter((item) => {
        const nameMatch = item.name.includes(this.queryParam.name)
        const statusMatch = this.queryParam.status === 'all' || item.status === Number(this.queryParam.status)
        return nameMatch && statusMatch
      })
    },
    // 重置
    handleReset() {
      this.queryParam = { name: undefined, status: 'all' }
      this.filteredDataSource = this.dataSource
    },
    handleRefresh() {
      if (this.isRefreshing) return
      this.isRefreshing = true
      this.initData().then(() => {
        this.$message.success('刷新成功')
        this.isRefreshing = false
      })
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
    async loadDictionaryData() {
      try {
        // 加载字典缓存
        this.statusDict = await dictionaryCache.loadDict('status') || []
        this.statusStyleDict = await dictionaryCache.loadDict('status_style') || []
        this.deployingStatusCode = this.statusStyleDict.filter(item => ['processing', 'warning', 'success'].includes(item.text)).map(item => item.code)
      } catch (error) {
        console.error('加载字典数据失败:', error)
        this.$message.error('加载数据字典失败，请刷新重试')
        // 确保所有数组初始化，防止undefined错误
        this.statusDict = this.statusDict || []
        this.statusStyleDict = this.statusStyleDict || []
      }
    },
    async initData() {
      this.dataLoading = true
      try {
        console.log(`正在加载服务数据，垂直领域类型: ${this.verticalType}`)
        // 优先尝试从API获取数据
        const response = await this.fetchServicesFromAPI()
        if (response && response.status === 'success') {
          console.log(`成功从API获取到${response.services.length}条服务数据`)
          this.dataSource = response.services
        } else {
          console.log('API获取失败')
          this.dataSource = []
        }
        this.filteredDataSource = this.dataSource
      } catch (error) {
        console.error('获取服务数据失败:', error)
        this.$message.error('获取服务数据失败，请稍后重试')
        this.dataSource = []
        this.filteredDataSource = []
      } finally {
        this.dataLoading = false
      }
    },
    // 根据筛选条件过滤数据（后端暂不支持name查询，先用前端搜索，此方法暂时弃用）
    async filterDataSource() {
      const filters = {}
      if (this.queryParam.name) {
        filters.name = this.queryParam.name
      }
      if (this.queryParam.status && this.queryParam.status !== 'all') {
        filters.status = this.queryParam.status
      }
      // 添加领域过滤条件
      filters.domain = this.verticalType
      try {
        // 如果没有筛选条件，则直接使用已有数据
        if (Object.keys(filters).length <= 1) { // 只有domain一个条件
          this.filteredDataSource = this.dataSource
          return
        }
        // 发送筛选请求
        const response = await filterServices(filters)
        if (response && response.status === 'success') {
          this.filteredDataSource = response.services
        } else {
          // 如果API调用失败，回退到客户端筛选
          this.handleSearch()
        }
      } catch (error) {
        console.error('筛选服务数据失败:', error)
        this.$message.error('筛选数据失败，使用本地筛选')
        this.handleSearch()
      }
    },
    // 启动
    handleDeploy(record) {
      this.$confirm('确认部署', `确定要部署服务 ${record.name} 吗？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
        closeOnClickModal: false
      }).then(() => {
        try {
          deployService(record.id)
          this.$message.info(`开始部署${record.name}服务...`)
          // 重新加载数据
          this.initData()
        } catch (error) {
          console.error('部署服务出错:', error)
          this.$message.error('部署服务失败，请重试')
        }
      })
    },
    // 停止
    handleStop(record) {
      this.$confirm('确认停止', `确定要停止服务 ${record.name} 吗？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(async () => {
        try {
          await stopService(record.id)
          this.$message.success(`服务 ${record.name} 停止成功！`)
          // 重新加载数据
          await this.initData()
        } catch (error) {
          console.error('停止服务出错:', error)
          this.$message.error('停止服务失败，请重试')
        }
      })
    },
    // 删除
    handleDelete(record) {
      this.$confirm('确认删除', `确定要删除服务 ${record.name} 吗？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
        closeOnClickModal: false
      }).then(async () => {
        try {
          await deleteService(record.id)
          this.$message.success(`服务 ${record.name} 删除成功！`)
          // 重新加载数据
          await this.initData()
        } catch (error) {
          console.error('删除服务出错:', error)
          this.$message.error('删除服务失败，请重试')
        }
      })
    }
  }
}
</script>
