<template>
  <page-header-wrapper :title="false">
    <a-row :gutter="24">
      <a-col :span="10">
        <a-card :bordered="false">
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :span="18">
                  <a-form-item label="元应用名称">
                    <a-input v-model="queryParam.id" placeholder="请输入元应用名称"/>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <div style="text-align: center;">
                    <a-button type="primary" @click="handleSearch">查询</a-button>
                  </div>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <a-table
            ref="table"
            :columns="columns"
            :dataSource="filteredDataSource"
            :row-selection="rowSelection"
            size="middle"
          >
            <span slot="serial" slot-scope="text, record, index">
              {{ index + 1 }}
            </span>
          </a-table>
        </a-card>
      </a-col>
      <a-col :span="14">
        <a-card :bordered="false">
          <a-form>
            <a-row :gutter="20">
              <a-col :span="8">
                <a-form-item label="性能指标">
                  <a-select placeholder="请选择" :default-value="-1">
                    <a-select-option :value="-1">全部</a-select-option>
                    <a-select-option v-for="(item, index) in performanceMetricOptions" :key="index" :value="index">
                      {{ item }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="数据集">
                  <a-select v-model="dataSetType" placeholder="请选择" default-value="0">
                    <a-select-option value="0">平台数据集</a-select-option>
                    <a-select-option value="1">上载数据集</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="dataSetType === '0'" :span="6">
                <a-form-item label="选择数据集">
                  <a-select placeholder="请选择" default-value="0">
                    <a-select-option value="0">跨境电商</a-select-option>
                    <a-select-option value="1">课题一</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col v-if="dataSetType === '1'" :span="8">
                <a-form-item label="上载数据集">
                  <a-upload
                    accept=".csv,.txt,.xls,.xlsx"
                    :file-list="dataSetFiles"
                    :remove="removeDataSetFile"
                    :customRequest="customDataSetFileChose"
                    :multiple="true">
                    <a-button> <a-icon type="upload" /> 选择数据集 </a-button>
                  </a-upload>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
          <a-form>
            <a-form-item label="验证结果">
              <a-textarea v-model="response" placeholder="" :rows="7" />
            </a-form-item>
            <a-form-item
              :wrapperCol="{ span: 24 }"
              style="text-align: center">
              <a-button type="primary" @click="onTest">开始验证</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </page-header-wrapper>
</template>

<script>
import { ArticleListContent, StandardFormRow, TagSelect } from '@/components'
import { getRunningAmlMetaApps } from '@/mock/data/services_data'
import { getNormMap, getPerformanceMetricMap, getServiceStatusMap } from '@/mock/data/map_data'

export default {
  name: 'TableList',
  components: {
    TagSelect,
    StandardFormRow,
    ArticleListContent
  },
  data () {
    return {
      visible: false,
      confirmLoading: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      dataSetType: '0',
      dataSetFiles: [],
      performanceMetricOptions: getPerformanceMetricMap(),
      statusMap: getServiceStatusMap(),
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '元应用名称',
          dataIndex: 'name'
        }
      ],
      dataSource: [],
      filteredDataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      response: ''
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
    },
    normFilter (type) {
      const normMap = getNormMap()
      return normMap[type].text
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
    handleSearch() {
      this.filteredDataSource = this.dataSource.filter(item => {
        // const statusMatch = this.queryParam.status === '-1' || item.status === Number(this.queryParam.status)
        // return nameMatch && statusMatch
        return item.name.includes(this.queryParam.name)
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
    handleChange (value) {
      console.log(`selected ${value}`)
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    async customDataSetFileChose (options) {
      const { file } = options
      if (!file) {
        return false
      }
      const url = URL.createObjectURL(file)
      this.dataSetFiles = {
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url // url 是展示在页面上的绝对链接
      }
    },
    removeDataSetFile () {
      this.dataSetFiles = []
    },
    onTest () {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择应用！')
        return
      }
      this.testLoading = true
      // 模拟异步请求
      setTimeout(() => {
        this.$message.success(`${this.selectedRows[0].name} 验证完成！`)
        const obj = {
          code: 200,
          message: '验证通过！'
        }
        const metaAppInfo = sessionStorage.getItem('metaAppInfo')
        if (metaAppInfo) {
          const serviceData = {
            ...JSON.parse(sessionStorage.getItem('metaAppInfo')),
            status: 4,
            norm: [
              {
                key: 0,
                score: 5
              },
              {
                key: 1,
                score: 5
              },
              {
                key: 2,
                score: 5
              },
              {
                key: 3,
                score: 5
              }
            ]
          }
          sessionStorage.setItem('metaAppInfo', JSON.stringify(serviceData))
        }
        this.response = JSON.stringify(obj, null, 4)
        this.testLoading = false
      }, 1000)
    },
    initData () {
      this.dataSource = getRunningAmlMetaApps()
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
