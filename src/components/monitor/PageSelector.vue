<template>
  <div class="page-selector">
    <a-card :bordered="false">
      <template slot="title">
        <div class="card-title">
          <span>监测页面管理</span>
          <a-button type="primary" size="small" @click="showCreateModal">
            <a-icon type="plus" /> 新建页面
          </a-button>
        </div>
      </template>

      <a-spin :spinning="loading">
        <a-list
          class="page-list"
          :dataSource="pageList"
          :rowKey="item => item.id"
        >
          <a-list-item slot="renderItem" slot-scope="item">
            <a-list-item-meta>
              <div slot="title" class="page-item-title">
                <span>{{ item.name }}</span>
                <a-tag v-if="item.id === currentPageId" color="blue">当前</a-tag>
              </div>
            </a-list-item-meta>
            <div class="page-item-actions">
              <a-button type="primary" size="small" @click="selectPage(item)" :disabled="item.id === currentPageId">
                选择
              </a-button>
              <a-button
                type="danger"
                size="small"
                @click="confirmDelete(item)"
                :disabled="item.id === 'default'"
                style="margin-left: 8px;"
              >
                删除
              </a-button>
            </div>
          </a-list-item>
          <div v-if="pageList.length === 0" class="empty-list">
            <a-empty description="暂无监测页面" />
          </div>
        </a-list>
      </a-spin>
    </a-card>

    <!-- 新建页面对话框 -->
    <a-modal
      title="新建监测页面"
      :visible="createModalVisible"
      :confirmLoading="createLoading"
      @ok="handleCreatePage"
      @cancel="createModalVisible = false"
    >
      <a-form-item label="页面名称">
        <a-input v-model="newPageName" placeholder="请输入页面名称" />
      </a-form-item>
      <a-form-item label="模板选择">
        <a-select v-model="templatePageId" placeholder="选择一个模板">
          <a-select-option v-for="page in pageList" :key="page.id" :value="page.id">
            {{ page.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-modal>

    <!-- 删除确认对话框 -->
    <a-modal
      title="确认删除"
      :visible="deleteModalVisible"
      @ok="handleDelete"
      @cancel="deleteModalVisible = false"
      :okText="'确认'"
      :cancelText="'取消'"
      okType="danger"
    >
      <p>确定要删除页面 "{{ pageToDelete ? pageToDelete.name : '' }}" 吗？此操作不可恢复。</p>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'PageSelector',
  props: {
    currentPageId: {
      type: String,
      default: 'default'
    },
    pageList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      createModalVisible: false,
      createLoading: false,
      newPageName: '',
      templatePageId: 'default',
      deleteModalVisible: false,
      pageToDelete: null
    }
  },
  methods: {
    selectPage(page) {
      this.loading = true
      // 触发页面选择事件
      this.$emit('select-page', page.id)
      setTimeout(() => {
        this.loading = false
      }, 500)
    },

    showCreateModal() {
      this.createModalVisible = true
      this.newPageName = `新建页面${this.pageList.length + 1}`
      this.templatePageId = 'default'
    },

    handleCreatePage() {
      if (!this.newPageName.trim()) {
        this.$message.error('页面名称不能为空')
        return
      }

      this.createLoading = true

      // 触发创建页面事件
      this.$emit('create-page', {
        name: this.newPageName.trim(),
        templateId: this.templatePageId
      })

      // 重置状态
      setTimeout(() => {
        this.createLoading = false
        this.createModalVisible = false
        this.newPageName = ''
      }, 600)
    },

    confirmDelete(page) {
      this.pageToDelete = page
      this.deleteModalVisible = true
    },

    handleDelete() {
      if (!this.pageToDelete) return

      if (this.pageToDelete.id === 'default') {
        this.$message.error('默认页面不能删除')
        this.deleteModalVisible = false
        return
      }

      this.loading = true

      // 触发删除页面事件
      this.$emit('delete-page', this.pageToDelete.id)

      // 重置状态
      setTimeout(() => {
        this.loading = false
        this.deleteModalVisible = false
        this.pageToDelete = null
      }, 500)
    }
  }
}
</script>

<style lang="less" scoped>
.page-selector {
  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .page-item-title {
    display: flex;
    align-items: center;

    .ant-tag {
      margin-left: 8px;
    }
  }

  .page-item-actions {
    display: flex;
  }

  .empty-list {
    padding: 24px 0;
  }
}
</style>
