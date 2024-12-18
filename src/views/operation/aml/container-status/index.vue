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
        <a-button icon="sync" @click="handleRefresh" :loading="isRefreshing">更新</a-button>
      </div>

      <a-table
        ref="table"
        :columns="columns"
        :dataSource="filteredDataSource"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { Ellipsis, TagSelect, StandardFormRow, ArticleListContent } from '@/components'
import { getAmlMetaApps, getAmlServices } from '@/mock/data/services_data'
import { getServiceStatusMap } from '@/mock/data/map_data'

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
  methods: {
    handleSearch() {
      this.filteredDataSource = this.dataSource.filter(item => {
        const nameMatch = item.name.includes(this.queryParam.name)
        const statusMatch = this.queryParam.status === '-1' || item.status === Number(this.queryParam.status)
        return nameMatch && statusMatch
      })
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
    handleReset() {
      this.queryParam = { name: '', status: '-1' }
      this.filteredDataSource = this.dataSource
    },
    initData () {
      this.dataSource = [...getAmlServices(), ...getAmlMetaApps()]
      this.filteredDataSource = this.dataSource
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
