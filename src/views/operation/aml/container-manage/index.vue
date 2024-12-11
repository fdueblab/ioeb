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
              <a-form-item label="使用状态">
                <a-select v-model="queryParam.status" placeholder="请选择" default-value="-1">
                  <a-select-option value="-1">全部</a-select-option>
                  <a-select-option value="0">未启动</a-select-option>
                  <a-select-option value="1">运行中</a-select-option>
                  <a-select-option value="2">异常</a-select-option>
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
            <a-menu-item key="1" @click="handleBatchDelete"><a-icon type="delete" />删除</a-menu-item>
            <a-menu-item key="2" @click="handleBatchStop"><a-icon type="pause-circle" />停止</a-menu-item>
            <a-menu-item key="3" @click="handleBatchStart"><a-icon type="caret-right"/>启动</a-menu-item>
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
            <a v-if="record.status === 2 || record.status === 0" @click="handleStart(record)">启动</a>
            <a v-if="record.status === 1" @click="handleStop(record)">停止</a>
            <a-divider type="vertical" />
            <a @click="handleDelete(record)">删除</a>
          </template>
        </span>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { Ellipsis, TagSelect, StandardFormRow, ArticleListContent } from '@/components'
import { getAmlServices, getStatusMap } from '@/views/operation/aml/services_data'

export default {
  name: 'TableList',
  components: {
    Ellipsis,
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
      // 加载数据方法 必须为 Promise 对象
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
          dataIndex: 'port'
        },
        {
          title: '卷映射',
          dataIndex: 'volume'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
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
      const statusMap = getStatusMap()
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      const statusMap = getStatusMap()
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
      window.location.href = '/vertical-ms/aml'
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
    handleStart(record) {
      if (record.name === '异常识别微服务') {
        sessionStorage.setItem('upload_exception_service', '1')
      }
      record.status = 1
      this.$message.success(`${record.name} 已启动`)
    },
    // 停止
    handleStop(record) {
      if (record.name === '异常识别微服务') {
        sessionStorage.setItem('upload_exception_service', '0')
      }
      record.status = 0
      this.$message.success(`${record.name} 已停止`)
    },
    // 删除
    handleDelete(record) {
      this.dataSource = this.dataSource.filter(item => !this.selectedRowKeys.includes(item))
      this.filteredDataSource = this.dataSource
      this.selectedRowKeys = []
      this.selectedRows = []
      this.$message.success(`${record.name} 已删除`)
    },
    // 批量启动
    handleBatchStart() {
      this.selectedRows.forEach(row => {
        row.status = 1
      })
      this.$message.success('批量启动成功')
    },
    // 批量停止
    handleBatchStop() {
      this.selectedRows.forEach(row => {
        row.status = 0
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
      this.dataSource = getAmlServices()
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
