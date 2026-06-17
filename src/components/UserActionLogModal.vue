<template>
  <a-modal
    :visible="visible"
    :title="modalTitle"
    width="980px"
    :footer="null"
    @cancel="handleClose"
  >
    <div class="action-log-toolbar">
      <a-select
        v-model="queryParam.actionType"
        allowClear
        placeholder="行为类型"
        style="width: 180px"
        @change="handleFilterChange"
      >
        <a-select-option
          v-for="option in actionTypeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </a-select-option>
      </a-select>
      <a-button icon="reload" :loading="loading" @click="loadLogs">
        刷新
      </a-button>
    </div>

    <a-table
      size="small"
      rowKey="id"
      :columns="columns"
      :dataSource="logs"
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <span slot="actionType" slot-scope="text">
        {{ getActionTypeLabel(text) }}
      </span>
      <span slot="request" slot-scope="text, record">
        <a-tag color="blue">{{ record.method }}</a-tag>
        <span class="request-path">{{ record.path }}</span>
      </span>
      <span slot="statusCode" slot-scope="text">
        <a-badge :status="getStatusBadge(text)" :text="String(text)" />
      </span>
      <span slot="userAgent" slot-scope="text">
        <a-tooltip :title="text || '-'">
          <span class="user-agent">{{ text || '-' }}</span>
        </a-tooltip>
      </span>
      <span slot="createdAt" slot-scope="text">
        {{ formatTime(text) }}
      </span>
    </a-table>
  </a-modal>
</template>

<script>
import { getUserActionLogs } from '@/api/audit'

const ACTION_TYPE_OPTIONS = [
  { value: 'auth.login', label: '登录' },
  { value: 'auth.logout', label: '登出' },
  { value: 'auth.register', label: '注册' },
  { value: 'auth.info', label: '获取用户信息' },
  { value: 'users.list', label: '查看用户列表' },
  { value: 'users.create', label: '创建用户' },
  { value: 'users.update', label: '更新用户' },
  { value: 'users.delete', label: '删除用户' },
  { value: 'users.status', label: '切换用户状态' },
  { value: 'users.role', label: '切换用户角色' },
  { value: 'users.password', label: '修改用户密码' },
  { value: 'services.request', label: '服务操作' },
  { value: 'services.publish', label: '服务发布' },
  { value: 'services.deploy', label: '服务部署' },
  { value: 'services.stop', label: '服务停止' },
  { value: 'services.delete', label: '服务删除' },
  { value: 'datasets.request', label: '数据集操作' }
]

export default {
  name: 'UserActionLogModal',
  data () {
    return {
      visible: false,
      loading: false,
      currentUser: null,
      logs: [],
      queryParam: {
        actionType: undefined
      },
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条记录`
      },
      actionTypeOptions: ACTION_TYPE_OPTIONS,
      columns: [
        {
          title: '行为类型',
          dataIndex: 'actionType',
          width: '130px',
          scopedSlots: { customRender: 'actionType' }
        },
        {
          title: '请求',
          dataIndex: 'path',
          scopedSlots: { customRender: 'request' }
        },
        {
          title: '状态',
          dataIndex: 'statusCode',
          width: '80px',
          scopedSlots: { customRender: 'statusCode' }
        },
        {
          title: '客户端IP',
          dataIndex: 'clientIp',
          width: '140px'
        },
        {
          title: 'User-Agent',
          dataIndex: 'userAgent',
          width: '180px',
          scopedSlots: { customRender: 'userAgent' }
        },
        {
          title: '时间',
          dataIndex: 'createdAt',
          width: '180px',
          scopedSlots: { customRender: 'createdAt' }
        }
      ]
    }
  },
  computed: {
    modalTitle () {
      if (!this.currentUser) {
        return '用户行为记录'
      }
      return `${this.currentUser.name} 的行为记录`
    }
  },
  methods: {
    show (user) {
      this.currentUser = user
      this.visible = true
      this.logs = []
      this.queryParam = {
        actionType: undefined
      }
      this.pagination = {
        ...this.pagination,
        current: 1,
        total: 0
      }
      this.loadLogs()
    },
    async loadLogs () {
      if (!this.currentUser) {
        return
      }
      this.loading = true
      try {
        const response = await getUserActionLogs({
          userId: this.currentUser.id,
          actionType: this.queryParam.actionType,
          page: this.pagination.current,
          pageSize: this.pagination.pageSize
        })
        if (response.status === 'success') {
          this.logs = response.logs || []
          const pagination = response.pagination || {}
          this.pagination = {
            ...this.pagination,
            current: pagination.page || this.pagination.current,
            pageSize: pagination.pageSize || this.pagination.pageSize,
            total: pagination.total || 0
          }
        } else {
          this.$message.error('获取行为记录失败')
        }
      } catch (error) {
        console.error('获取行为记录出错:', error)
        this.$message.error('获取行为记录失败')
      } finally {
        this.loading = false
      }
    },
    handleFilterChange () {
      this.pagination = {
        ...this.pagination,
        current: 1
      }
      this.loadLogs()
    },
    handleTableChange (pagination) {
      this.pagination = {
        ...this.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize
      }
      this.loadLogs()
    },
    handleClose () {
      this.visible = false
    },
    formatTime (timestamp) {
      if (!timestamp) {
        return '-'
      }
      return new Date(timestamp).toLocaleString('zh-CN')
    },
    getStatusBadge (statusCode) {
      if (statusCode >= 500) {
        return 'error'
      }
      if (statusCode >= 400) {
        return 'warning'
      }
      if (statusCode >= 300) {
        return 'processing'
      }
      return 'success'
    },
    getActionTypeLabel (actionType) {
      const option = ACTION_TYPE_OPTIONS.find(item => item.value === actionType)
      return option ? option.label : actionType
    }
  }
}
</script>

<style lang="less" scoped>
.action-log-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.request-path,
.user-agent {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
}

.request-path {
  max-width: 420px;
}

.user-agent {
  max-width: 160px;
}
</style>
