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
        :loading="dataLoading"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">配置</a>
            <a-divider type="vertical" />
            <a @click="handleStop(record)" v-if="record.status === 4 || record.status === 1">停止</a>
            <a @click="handleStart(record)" v-else-if="record.status === 2">启动</a>
            <a @click="handleRestart(record)" v-else>重启</a>
            <a-divider type="vertical" />
            <a @click="handleDelete(record)">删除</a>
          </template>
        </span>
      </a-table>
    </a-card>

    <a-modal
      title="容器配置"
      :visible="visible"
      :confirmLoading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form :form="form">
        <a-form-item label="服务名称" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
          <a-input
            v-decorator="['name', { rules: [{ required: true, message: '请输入服务名称' }] }]"
            placeholder="请输入服务名称"
          />
        </a-form-item>
        <a-form-item label="部署节点" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
          <a-select
            v-decorator="['node', { rules: [{ required: true, message: '请选择部署节点' }] }]"
            placeholder="请选择"
          >
            <a-select-option value="边缘节点-A01">边缘节点-A01 (农田边缘设备集群)</a-select-option>
            <a-select-option value="边缘节点-A02">边缘节点-A02 (大棚边缘设备集群)</a-select-option>
            <a-select-option value="边缘节点-A03">边缘节点-A03 (灌溉系统边缘设备集群)</a-select-option>
            <a-select-option value="云端节点-C01">云端节点-C01 (高性能计算集群)</a-select-option>
            <a-select-option value="云端节点-C02">云端节点-C02 (存储优化集群)</a-select-option>
            <a-select-option value="云端节点-C03">云端节点-C03 (AI推理优化集群)</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="CPU分配" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
          <a-input-number
            v-decorator="['cpu', { initialValue: 1, rules: [{ required: true, message: '请输入CPU配额' }] }]"
            :min="0.1"
            :max="8"
            :step="0.1"
          />
          <span class="ant-form-text"> 核</span>
        </a-form-item>
        <a-form-item label="内存分配" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
          <a-input-number
            v-decorator="['memory', { initialValue: 512, rules: [{ required: true, message: '请输入内存配额' }] }]"
            :min="64"
            :max="8192"
            :step="64"
          />
          <span class="ant-form-text"> MB</span>
        </a-form-item>
        <a-form-item label="容器镜像" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
          <a-select
            v-decorator="['image', { rules: [{ required: true, message: '请选择容器镜像' }] }]"
            placeholder="请选择"
          >
            <a-select-option value="agricultural-ai:v1.0">agricultural-ai:v1.0 (基础农业AI服务)</a-select-option>
            <a-select-option value="crop-image-analyzer:v2.1">crop-image-analyzer:v2.1 (作物图像分析)</a-select-option>
            <a-select-option value="crop-disease-detector:v1.5">crop-disease-detector:v1.5 (病虫害识别)</a-select-option>
            <a-select-option value="smart-irrigation:v1.2">smart-irrigation:v1.2 (智能灌溉控制)</a-select-option>
            <a-select-option value="crop-yield-predictor:v1.3">crop-yield-predictor:v1.3 (产量预测)</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="环境变量" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
          <a-textarea
            v-decorator="['env']"
            placeholder="请输入环境变量，每行一个，格式为KEY=VALUE"
            :rows="4"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </page-header-wrapper>
</template>

<script>
import { getServiceStatusMap } from '@/mock/data/map_data'
import { getServiceData, getMetaAppData } from '@/mock/data/services_data'

export default {
  data () {
    return {
      form: this.$form.createForm(this),
      visible: false,
      confirmLoading: false,
      dataLoading: false,
      isRefreshing: false,
      selectedRowKeys: [],
      selectedRows: [],
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
          title: '镜像',
          dataIndex: 'image'
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
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' }
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
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    },
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

          // 分配镜像
          const imageMap = {
            '农作物图像分析服务': 'crop-image-analyzer:v2.1',
            '病虫害识别与防治服务': 'crop-disease-detector:v1.5',
            '智能灌溉决策服务': 'smart-irrigation:v1.2',
            '农作物产量预测服务': 'crop-yield-predictor:v1.3',
            '智慧农业综合管理元应用': 'agricultural-ai:v1.0'
          }
          const image = imageMap[service.name] || 'agricultural-ai:v1.0'

          // 计算资源使用
          const cpuCore = service.type === 0 ? (0.3 + Math.random() * 1.2).toFixed(1) : (1 + Math.random() * 2).toFixed(1)
          const memory = service.type === 0 ? (128 + Math.floor(Math.random() * 8) * 64) : (512 + Math.floor(Math.random() * 8) * 128)

          return {
            id: `agr-cnt-${(index + 1).toString().padStart(3, '0')}`,
            name: service.name,
            node: node,
            image: image,
            created: service.createTime || '2023-05-' + (15 + Math.floor(Math.random() * 10)).toString().padStart(2, '0') + ' ' +
                   Math.floor(Math.random() * 24).toString().padStart(2, '0') + ':' +
                   Math.floor(Math.random() * 60).toString().padStart(2, '0') + ':' +
                   Math.floor(Math.random() * 60).toString().padStart(2, '0'),
            status: service.status || 4,
            resource: `CPU: ${cpuCore}核 内存: ${memory}MB`,
            originalService: service
          }
        })
      } catch (error) {
        console.error('获取服务数据失败', error)
        this.$message.error('获取服务数据失败')
      } finally {
        this.dataLoading = false
      }
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
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
    },
    handleAdd () {
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.$nextTick(() => {
        // 提取CPU和内存值
        const cpuMatch = record.resource.match(/CPU: ([\d.]+)/)
        const memoryMatch = record.resource.match(/内存: ([\d]+)/)
        const cpu = cpuMatch ? parseFloat(cpuMatch[1]) : 1
        const memory = memoryMatch ? parseInt(memoryMatch[1]) : 512

        this.form.setFieldsValue({
          name: record.name,
          node: record.node,
          cpu: cpu,
          memory: memory,
          image: record.image,
          env: 'MODEL_PATH=/models/agriculture\nLOG_LEVEL=info\nTIMEOUT=30'
        })
      })
    },
    handleOk () {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          setTimeout(() => {
            this.visible = false
            this.confirmLoading = false
            this.$message.success('操作成功')
          }, 1500)
        }
      })
    },
    handleCancel () {
      this.visible = false
      this.form.resetFields()
    },
    handleDelete (record) {
      this.$confirm({
        title: '确定要删除此服务吗?',
        content: `服务名称: ${record.name}`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          this.$message.success('删除成功')
        }
      })
    },
    handleStop (record) {
      this.$message.success(`服务 ${record.name} 已停止`)
    },
    handleStart (record) {
      this.$message.success(`服务 ${record.name} 已启动`)
    },
    handleRestart (record) {
      this.$message.success(`服务 ${record.name} 已重启`)
    },
    handleBatchDelete () {
      this.$confirm({
        title: '确定要删除选中的服务吗?',
        content: `已选择 ${this.selectedRowKeys.length} 个服务`,
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          this.$message.success('批量删除成功')
          this.selectedRowKeys = []
        }
      })
    },
    handleBatchStop () {
      this.$message.success(`已停止 ${this.selectedRowKeys.length} 个服务`)
      this.selectedRowKeys = []
    },
    handleBatchDeploy () {
      this.$message.success(`已部署 ${this.selectedRowKeys.length} 个服务`)
      this.selectedRowKeys = []
    },
    handleBatchCancelDeploy () {
      this.$message.success(`已取消部署 ${this.selectedRowKeys.length} 个服务`)
      this.selectedRowKeys = []
    }
  }
}
</script>
