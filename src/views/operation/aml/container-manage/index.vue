<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="服务名称">
                <a-input v-model="queryParam.id" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="使用状态">
                <a-select v-model="queryParam.status" placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">运行中</a-select-option>
                  <a-select-option value="2">已停止</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd">新建</a-button>
        <a-dropdown v-action:edit v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
            <a-menu-item key="2"><a-icon type="pause-circle" />停止</a-menu-item>
            <a-menu-item key="3"><a-icon type="caret-right"/>启动</a-menu-item>
            <a-menu-item key="4"><a-icon type="sync"/>更新</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <a-table
        ref="table"
        :columns="columns"
        :dataSource="dataSource"
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
            <a v-if="record.status === 2" @click="handleEdit(record)">启动</a>
            <a v-if="record.status === 1" @click="handleEdit(record)">停止</a>
            <a-divider type="vertical" />
            <a @click="handleSub(record)">删除</a>
          </template>
        </span>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { Ellipsis, TagSelect, StandardFormRow, ArticleListContent } from '@/components'
const statusMap = {
  0: {
    status: 'default',
    text: '关闭'
  },
  1: {
    status: 'processing',
    text: '运行中'
  },
  2: {
    status: 'error',
    text: '已停止'
  }
}
const data = []
data.push({
  name: '异常识别微服务',
  netWork: 'bridge',
  port: '0.0.0.0:8081/TCP → 0.0.0.0:8080',
  volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
  status: 1,
  norm: [0, 1, 2],
  number: '2342'
})
data.push({
  name: '安全计算微服务',
  netWork: 'bridge',
  port: '0.0.0.0:8000/TCP → 0.0.0.0:80001',
  volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
  status: 1,
  norm: [0, 2],
  number: '2342'
})
data.push({
  name: '技术评测微服务',
  netWork: 'bridge',
  port: '0.0.0.0:8000/TCP → 0.0.0.0:80001',
  volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
  status: 1,
  norm: [1, 2],
  number: '2342'
})
data.push({
  name: '报告生成微服务',
  netWork: 'bridge',
  port: '0.0.0.0:8000/TCP → 0.0.0.0:80001',
  volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
  status: 1,
  norm: [0, 1, 3],
  number: '2342'
})
data.push({
  name: '信用评估微服务',
  netWork: 'bridge',
  port: '0.0.0.0:8000/TCP → 0.0.0.0:80001',
  volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
  status: 2,
  norm: [1, 2, 3],
  number: '2342'
})

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
      // create model
      form: this.$form.createForm(this),
      visible: false,
      confirmLoading: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
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
      selectedRowKeys: [],
      selectedRows: [],
      response: ''
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    }
  },
  created () {
    this.dataSource = data
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
      this.$emit('onGoAdd')
    },
    handleEdit (record) {
      console.log(record)
    },
    delConfirm() {
      this.$message.success('删除成功！')
    },
    handleCancel () {
      this.visible = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleChange (value) {
      console.log(`selected ${value}`)
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    onTest () {
      const obj = {
        code: 200,
        message: '测试通过！'
      }
      const newObj = JSON.stringify(obj, null, 4)
      this.response = newObj
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
