<template>
  <page-header-wrapper :title="false">
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="用户名称">
                <a-input v-model="queryParam.name" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="激活状态">
                <a-select v-model="queryParam.status" placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">已激活</a-select-option>
                  <a-select-option value="2">未激活</a-select-option>
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
        <a-button style="margin-left: 8px" icon="sync" @click="handleRefresh" :loading="refreshing">刷新</a-button>
      </div>

      <a-table
        ref="table"
        :columns="columns"
        :dataSource="dataSource"
        :loading="loading"
        :pagination="pagination"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="avatar" slot-scope="text, record">
          <a-avatar :src="record.avatar" :alt="record.name" size="small">
            {{ record.name.charAt(0) }}
          </a-avatar>
        </span>
        <span slot="role" slot-scope="text, record">
          <span v-if="record.username === 'root'">{{ getRoleName(record.roleId) }}</span>
          <a-button
            v-else
            style="padding: 0"
            type="link"
            size="small"
            @click="handleRoleEdit(record)"
          >
            {{ getRoleName(record.roleId) }}<a-icon type="edit" />
          </a-button>
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a-button style="padding: 0" type="link" v-if="record.status === 0" :disabled="record.username === 'root'" size="small" @click="handleActivate(record)">激活</a-button>
            <a-button style="padding: 0" type="link" v-if="record.status === 1" :disabled="record.username === 'root'" size="small" @click="handleDisable(record)">禁用</a-button>
            <a-divider type="vertical" />
            <a-button v-if="record.username === 'root'" style="padding: 0" type="link" disabled size="small" @click="handleDelete(record)">删除</a-button>
            <a-button v-else style="padding: 0;color: orangered" type="link" size="small" @click="handleDelete(record)">删除</a-button>
          </template>
        </span>
      </a-table>
    </a-card>

    <!-- 用户管理弹窗组件 -->
    <UserManageModal
      ref="userManageModal"
      @refresh="handleModalRefresh"
    />
  </page-header-wrapper>
</template>

<script>
import { getAllUsers, enableUser, disableUser, deleteUser, getAllRoles } from '@/api/users'
import UserManageModal from '@/components/UserManageModal'

const statusMap = {
  0: {
    status: 'default',
    text: '未激活'
  },
  1: {
    status: 'processing',
    text: '已激活'
  }
}

export default {
  name: 'TableList',
  components: {
    UserManageModal
  },
  data () {
    return {
      // 查询参数
      queryParam: {},
      // 加载状态
      loading: false,
      refreshing: false,
      // 分页参数
      pagination: {
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条数据`
      },
      // 加载数据方法 必须为 Promise 对象
      columns: [
        {
          title: '#',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '头像',
          dataIndex: 'avatar',
          width: '80px',
          align: 'center',
          scopedSlots: { customRender: 'avatar' }
        },
        {
          title: '用户名',
          dataIndex: 'name'
        },
        {
          title: '用户角色',
          dataIndex: 'roleId',
          scopedSlots: { customRender: 'role' }
        },
        {
          title: '联系方式',
          dataIndex: 'telephone'
        },
        {
          title: '最后登录IP',
          dataIndex: 'lastLoginIp'
        },
        {
          title: '最后登录时间',
          dataIndex: 'lastLoginTimeDisplay'
        },
        {
          title: '激活状态',
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
      originalData: [], // 保存原始数据用于搜索过滤
      response: '',
      roleList: [] // 添加roleList数组用于存储从API获取的角色列表
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
    this.loadUserData()
    this.loadRoleList()
  },
  methods: {
    // 加载角色列表
    async loadRoleList() {
      try {
        const response = await getAllRoles()
        if (response.status === 'success' && response.roles) {
          this.roleList = response.roles.filter(role => role.status === 1 && role.deleted === 0)
        } else {
          console.error('获取角色列表失败')
        }
      } catch (error) {
        console.error('获取角色列表出错:', error)
      }
    },

    // 加载用户数据
    async loadUserData() {
      this.loading = true
      try {
        const response = await getAllUsers()
        if (response.status === 'success' && response.users) {
          this.originalData = response.users.map(user => ({
            ...user,
            key: user.id, // 为table添加key
            roleId: user.roleId, // 角色
            avatar: user.avatar || '/avatar2.svg', // 头像，提供默认值
            lastLoginIp: user.lastLoginIp || '-', // 最后登录IP，提供默认值
            lastLoginTimeDisplay: user.lastLoginTime ? this.formatTime(user.lastLoginTime) : '-' // 格式化时间
          }))
          this.dataSource = [...this.originalData]
          this.pagination.total = this.originalData.length
        } else {
          this.$message.error('获取用户数据失败')
        }
      } catch (error) {
        console.error('获取用户数据出错:', error)
        this.$message.error('获取用户数据出错')
      } finally {
        this.loading = false
      }
    },
    // 格式化时间戳
    formatTime(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },
    // 搜索功能
    handleSearch() {
      let filteredData = [...this.originalData]
      // 按用户名搜索
      if (this.queryParam.name) {
        filteredData = filteredData.filter(user =>
          user.name.includes(this.queryParam.name)
        )
      }
      // 按状态过滤
      if (this.queryParam.status && this.queryParam.status !== '0') {
        const statusValue = this.queryParam.status === '1' ? 1 : 0
        filteredData = filteredData.filter(user => user.status === statusValue)
      }
      this.dataSource = filteredData
      this.pagination.total = filteredData.length
      this.pagination.current = 1 // 重置到第一页
    },
    // 重置搜索
    handleReset() {
      this.queryParam = {}
      this.dataSource = [...this.originalData]
      this.pagination.total = this.originalData.length
      this.pagination.current = 1
    },
    handleAdd () {
      this.$refs.userManageModal.showAddUserModal()
    },
    // 激活用户
    handleActivate (record) {
      this.$confirm('确认激活', `确定要激活用户 ${record.name} 吗？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
        closeOnClickModal: false
      }).then(async () => {
        try {
          await enableUser(record.id)
          this.$message.success(`用户 ${record.name} 激活成功！`)
          // 重新加载数据
          await this.loadUserData()
        } catch (error) {
          console.error('激活用户出错:', error)
          this.$message.error('激活用户失败，请重试')
        }
      })
    },
    // 禁用用户
    handleDisable (record) {
      this.$confirm('确认禁用', `确定要禁用用户 ${record.name} 吗？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(async () => {
        try {
          await disableUser(record.id)
          this.$message.success(`用户 ${record.name} 禁用成功！`)
          // 重新加载数据
          await this.loadUserData()
        } catch (error) {
          console.error('禁用用户出错:', error)
          this.$message.error('禁用用户失败，请重试')
        }
      })
    },
    // 删除用户
    handleDelete (record) {
      this.$confirm('确认删除', `确定要删除用户 ${record.name} 吗？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
        closeOnClickModal: false
      }).then(async () => {
        try {
          await deleteUser(record.id)
          this.$message.success(`用户 ${record.name} 删除成功！`)
          // 重新加载数据
          await this.loadUserData()
        } catch (error) {
          console.error('删除用户出错:', error)
          this.$message.error('删除用户失败，请重试')
        }
      })
    },
    handleRefresh() {
      this.refreshing = true
      Promise.all([
        this.loadUserData(),
        this.loadRoleList()
      ]).then(() => {
        this.$message.success('刷新成功')
      }).finally(() => {
        this.refreshing = false
      })
    },
    handleRoleEdit(record) {
      this.$refs.userManageModal.showRoleSelectModal(record)
    },
    getRoleName(roleId) {
      // 如果UserManageModal组件已经加载，使用其getRoleName方法
      if (this.$refs.userManageModal) {
        return this.$refs.userManageModal.getRoleName(roleId)
      }
      // 否则从本地角色列表中查找
      const role = this.roleList.find(r => r.id === roleId)
      return role ? role.name : roleId
    },
    handleModalRefresh() {
      this.loadUserData()
      this.loadRoleList()
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
