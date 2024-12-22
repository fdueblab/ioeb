<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="服务名称">
                <a-input v-model="queryParam.name" placeholder="请输入服务名称"/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select v-model="queryParam.status" placeholder="请选择" default-value="-1">
                  <a-select-option value="-1">全部</a-select-option>
                  <a-select-option v-for="(item, index) in statusMap" :key="index" :value="index">{{ item.text }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="handleSearch">查询</a-button>
                <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
        <a-button icon="sync" @click="handleRefresh" :loading="isRefreshing">更新</a-button>
        <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="handleBatchDelete"><a-icon type="delete" />批量删除</a-menu-item>
            <a-menu-item key="2" @click="handleBatchStop"><a-icon type="pause-circle" />批量停止</a-menu-item>
            <a-menu-item key="3" @click="handleBatchDeploy"><a-icon type="caret-right"/>批量部署</a-menu-item>
            <a-menu-item key="3" @click="handleBatchCancelDeploy"><a-icon type="caret-right"/>批量取消部署</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <a-table
        ref="table"
        :columns="columns"
        :dataSource="filteredDataSource"
        :row-selection="rowSelection"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a v-if="record.status === 0 || record.status === 2" @click="handleDeploy(record)">部署</a>
            <a v-if="record.status === 1 || record.status === 3 || record.status === 4" @click="handleStop(record)">停止</a>
            <a v-if="record.status === 5" @click="handleCancelDeploy(record)">取消</a>
            <a-divider type="vertical" />
            <a @click="handleDelete(record)">删除</a>
          </template>
        </span>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { TagSelect, StandardFormRow, ArticleListContent } from '@/components'
import { getAirCraftMetaApps, getAirCraftServices } from '@/mock/data/services_data'
import { getServiceStatusMap } from '@/mock/data/map_data'

export default {
  name: 'TableList',
  components: {
    TagSelect,
    StandardFormRow,
    ArticleListContent
  },
  data () {
    return {
      isRefreshing: false,
      // 查询参数
      queryParam: {
        name: '',
        status: '-1'
      },
      statusMap: getServiceStatusMap(),
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
          title: '网络',
          dataIndex: 'netWork'
        },
        {
          title: '端口映射',
          dataIndex: 'port',
          width: '150px'
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
      filteredDataSource: [],
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    statusFilter (type) {
      const statusMap = getServiceStatusMap()
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      const statusMap = getServiceStatusMap()
      return statusMap[type].status
    }
  },
  created () {
    this.initData()
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    handleAdd () {
      this.$router.push({ path: '#/vertical-ms/aml' })
    },
    // 查询
    handleSearch() {
      this.filteredDataSource = this.dataSource.filter(item => {
        const nameMatch = item.name.includes(this.queryParam.name)
        const statusMatch = this.queryParam.status === '-1' || item.status === Number(this.queryParam.status)
        return nameMatch && statusMatch
      })
    },
    // 重置
    handleReset() {
      this.queryParam = { name: '', status: '-1' }
      this.filteredDataSource = this.dataSource
    },
    // 启动
    handleDeploy(record) {
      record.status = 5
      this.$message.success(`正在部署 ${record.name}`)
    },
    // 停止
    handleStop(record) {
      record.status = 2
      this.$message.success(`${record.name} 已停止`)
    },
    // 通过测评
    handleAccept(record) {
      record.status = 4
      this.$message.success(`${record.name} 已通过`)
    },
    // 取消部署
    handleCancelDeploy(record) {
      record.status = 2
      this.$message.success(`取消部署 ${record.name}`)
    },
    // 删除
    handleDelete(record) {
      this.dataSource = this.dataSource.filter(item => !this.selectedRowKeys.includes(item))
      this.filteredDataSource = this.dataSource
      this.selectedRowKeys = []
      this.selectedRows = []
      this.$message.success(`${record.name} 已删除`)
    },
    // 批量部署
    handleBatchDeploy() {
      this.selectedRows.forEach(row => {
        row.status = 5
      })
      this.$message.success('开始批量部署')
    },
    // 批量取消部署
    handleBatchCancelDeploy() {
      this.selectedRows.forEach(row => {
        row.status = 2
      })
      this.$message.success('批量取消部署成功')
    },
    // 批量停止
    handleBatchStop() {
      this.selectedRows.forEach(row => {
        row.status = 2
      })
      this.$message.success('批量停止成功')
    },
    // 批量删除
    handleBatchDelete() {
      this.dataSource = this.dataSource.filter(item => !this.selectedRowKeys.includes(item))
      this.filteredDataSource = this.dataSource
      this.selectedRowKeys = []
      this.selectedRows = []
      this.$message.success('批量删除成功')
    },
    handleRefresh() {
      if (this.isRefreshing) return
      this.isRefreshing = true
      setTimeout(() => {
        this.initData()
        this.$message.success('刷新成功')
        this.isRefreshing = false
      }, 1000)
    },
    initData () {
      this.dataSource = [...getAirCraftServices(), ...getAirCraftMetaApps()]
      this.filteredDataSource = this.dataSource
    },
    // 选择行
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
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
</style>
