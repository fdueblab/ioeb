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
        <a-button icon="sync" @click="handleRefresh" :loading="isRefreshing">更新</a-button>
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
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { getServiceStatusMap } from '@/mock/data/map_data'
import { getMetaAppData, getServiceData } from '@/mock/data/services_data'

export default {
  data () {
    return {
      dataLoading: false,
      isRefreshing: false,
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' },
          width: 80
        },
        {
          title: '容器ID',
          dataIndex: 'id'
        },
        {
          title: '服务名称',
          dataIndex: 'name'
        },
        {
          title: '部署节点',
          dataIndex: 'node'
        },
        {
          title: '创建时间',
          dataIndex: 'created'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '资源使用',
          dataIndex: 'resource'
        }
      ],
      statusMap: getServiceStatusMap(),
      queryParam: {
        name: '',
        status: '-1'
      },
      dataSource: [],
      originalDataSource: []
    }
  },
  computed: {
    filteredDataSource () {
      const { name, status } = this.queryParam
      let result = [...this.dataSource]
      if (name) {
        result = result.filter(item => item.name.includes(name))
      }
      if (status !== '-1') {
        result = result.filter(item => item.status === parseInt(status))
      }
      return result
    }
  },
  filters: {
    statusFilter (status) {
      const statusMap = getServiceStatusMap()
      return statusMap[status].text
    },
    statusTypeFilter (status) {
      const statusMap = getServiceStatusMap()
      return statusMap[status].status
    }
  },
  async mounted() {
    await this.fetchData()
  },
  methods: {
    async fetchData() {
      this.dataLoading = true
      try {
        // 从API获取服务和元应用数据
        const [serviceData, metaData] = await Promise.all([
          getServiceData('agriculture'),
          getMetaAppData('agriculture')
        ])

        // 合并数据
        const allServices = [...serviceData, ...metaData]

        // 转换为容器数据格式
        this.originalDataSource = allServices
        this.dataSource = allServices.map((service, index) => {
          // 随机分配节点
          const nodeTypes = ['边缘节点-A01', '边缘节点-A02', '边缘节点-A03', '云端节点-C01', '云端节点-C03']
          const node = nodeTypes[Math.floor(Math.random() * nodeTypes.length)]

          // 计算资源使用
          const cpuCore = service.type === 0 ? (0.3 + Math.random() * 1.2).toFixed(1) : (1 + Math.random() * 2).toFixed(1)
          const memory = service.type === 0 ? (128 + Math.floor(Math.random() * 8) * 64) : (512 + Math.floor(Math.random() * 8) * 128)

          return {
            id: `agr-cnt-${(index + 1).toString().padStart(3, '0')}`,
            name: service.name,
            node: node,
            created: service.createTime || '2023-05-' + (15 + Math.floor(Math.random() * 10)).toString().padStart(2, '0') + ' ' +
                   Math.floor(Math.random() * 24).toString().padStart(2, '0') + ':' +
                   Math.floor(Math.random() * 60).toString().padStart(2, '0') + ':' +
                   Math.floor(Math.random() * 60).toString().padStart(2, '0'),
            status: service.status || 4,
            resource: `CPU: ${cpuCore}核 内存: ${memory}MB`
          }
        })
      } catch (error) {
        console.error('获取服务数据失败', error)
        this.$message.error('获取服务数据失败')
      } finally {
        this.dataLoading = false
      }
    },
    handleSearch () {
      this.dataLoading = true
      setTimeout(() => {
        this.dataLoading = false
      }, 500)
    },
    handleReset () {
      this.queryParam = {
        name: '',
        status: '-1'
      }
    },
    handleRefresh () {
      this.isRefreshing = true
      this.fetchData().then(() => {
        this.isRefreshing = false
        this.$message.success('数据已更新')
      }).catch(() => {
        this.isRefreshing = false
        this.$message.error('更新失败')
      })
    }
  }
}
</script>
