<template>
  <div>
    <!-- 新建用户弹窗 -->
    <a-modal
      title="新建用户"
      :visible="addUserVisible"
      @ok="handleAddUserSubmit"
      @cancel="handleAddUserCancel"
      :confirmLoading="addUserLoading"
      width="500px"
    >
      <a-form :form="addUserForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="用户名">
          <a-input
            v-decorator="['username', { rules: [{ required: true, message: '请输入用户名' }] }]"
            placeholder="请输入用户名"
          />
        </a-form-item>
        <a-form-item label="用户姓名">
          <a-input
            v-decorator="['name', { rules: [{ required: true, message: '请输入用户姓名' }] }]"
            placeholder="请输入用户姓名"
          />
        </a-form-item>
        <a-form-item label="密码">
          <a-input-password
            v-decorator="['password', { rules: [{ required: true, message: '请输入密码' }] }]"
            placeholder="请输入密码"
          />
        </a-form-item>
        <a-form-item label="联系方式">
          <a-input
            v-decorator="['telephone']"
            placeholder="请输入联系方式"
          />
        </a-form-item>
        <a-form-item label="商户代码">
          <a-input
            v-decorator="['merchantCode']"
            placeholder="请输入商户代码（可选）"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 角色选择弹窗 -->
    <a-modal
      title="选择角色"
      :visible="roleSelectVisible"
      @ok="handleRoleSelectSubmit"
      @cancel="handleRoleSelectCancel"
      :confirmLoading="roleSelectLoading"
      width="600px"
    >
      <a-form :form="roleSelectForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-item label="用户">
          <span>{{ currentUser.name }} ({{ currentUser.username }})</span>
        </a-form-item>
        <a-form-item label="角色">
          <a-select
            v-decorator="['roleId', { rules: [{ required: true, message: '请选择角色' }] }]"
            placeholder="请选择角色"
            :loading="roleListLoading"
            :disabled="roleListLoading"
          >
            <a-select-option
              v-for="role in roleList"
              :key="role.id"
              :value="role.id"
            >
              {{ role.name }} - {{ role.describe }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { createUser, updateUserRole, getAllRoles } from '@/api/users'

export default {
  name: 'UserManageModal',
  data() {
    return {
      // 新建用户弹窗
      addUserVisible: false,
      addUserLoading: false,
      addUserForm: null,

      // 角色选择弹窗
      roleSelectVisible: false,
      roleSelectLoading: false,
      roleSelectForm: null,
      currentUser: {},

      // 角色列表 - 从API获取
      roleList: [],
      roleListLoading: false
    }
  },
  created() {
    this.addUserForm = this.$form.createForm(this)
    this.roleSelectForm = this.$form.createForm(this)
    this.loadRoleList()
  },
  methods: {
    // 加载角色列表
    async loadRoleList() {
      this.roleListLoading = true
      try {
        const response = await getAllRoles()
        if (response.status === 'success' && response.roles) {
          this.roleList = response.roles.filter(role => role.status === 1 && role.deleted === 0)
        } else {
          this.$message.error('获取角色列表失败')
        }
      } catch (error) {
        console.error('获取角色列表出错:', error)
        this.$message.error('获取角色列表失败')
      } finally {
        this.roleListLoading = false
      }
    },

    // 角色显示名称映射
    getRoleName(roleId) {
      const role = this.roleList.find(r => r.id === roleId)
      return role ? role.name : roleId
    },

    // 显示新建用户弹窗
    showAddUserModal() {
      this.addUserVisible = true
    },

    // 新建用户提交
    handleAddUserSubmit(e) {
      e.preventDefault()
      this.addUserForm.validateFields(async (err, values) => {
        if (!err) {
          this.addUserLoading = true
          try {
            const response = await createUser(values)
            if (response.status === 'success') {
              this.$message.success('用户创建成功')
              this.addUserVisible = false
              this.addUserForm.resetFields()
              this.$emit('refresh')
            } else {
              this.$message.error('创建用户失败')
            }
          } catch (error) {
            console.error('创建用户出错:', error)
            this.$message.error('创建用户失败，请重试')
          } finally {
            this.addUserLoading = false
          }
        }
      })
    },

    // 取消新建用户
    handleAddUserCancel() {
      this.addUserVisible = false
      this.addUserForm.resetFields()
    },

    // 显示角色选择弹窗
    showRoleSelectModal(user) {
      this.currentUser = user
      this.roleSelectVisible = true
      
      // 如果角色列表为空，重新加载
      if (this.roleList.length === 0) {
        this.loadRoleList()
      }
      
      this.$nextTick(() => {
        this.roleSelectForm.setFieldsValue({
          roleId: user.roleId
        })
      })
    },

    // 角色选择提交
    handleRoleSelectSubmit(e) {
      e.preventDefault()
      this.roleSelectForm.validateFields(async (err, values) => {
        if (!err) {
          this.roleSelectLoading = true
          try {
            const response = await updateUserRole(this.currentUser.id, values.roleId)
            if (response.status === 'success') {
              this.$message.success('角色更新成功')
              this.roleSelectVisible = false
              this.roleSelectForm.resetFields()
              this.$emit('refresh')
            } else {
              this.$message.error('角色更新失败')
            }
          } catch (error) {
            console.error('更新角色出错:', error)
            this.$message.error('角色更新失败，请重试')
          } finally {
            this.roleSelectLoading = false
          }
        }
      })
    },

    // 取消角色选择
    handleRoleSelectCancel() {
      this.roleSelectVisible = false
      this.roleSelectForm.resetFields()
    }
  }
}
</script>
