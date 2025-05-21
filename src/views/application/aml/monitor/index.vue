<template>
  <div class="application-aml-monitor">
    <a-card :bordered="false">
      <!-- 页面工具栏 -->
      <a-row :gutter="16" style="margin-bottom: 16px" v-if="isEditing">
        <a-col :span="24">
          <div class="page-toolbar">
            <div class="page-title">
              <span>当前模块：{{ currentPageConfig.name }}</span>
            </div>
            <div class="page-actions">
              <a-button
                type="link"
                @click="toggleEditMode"
                style="margin-right: 8px"
              >
                <a-icon :type="isEditing ? 'save' : 'edit'" /> {{ isEditing ? '保存并退出编辑' : '编辑页面' }}
              </a-button>
              <!-- 暂时隐藏页面管理功能
              <a-button @click="showPageList">
                <a-icon type="appstore" /> 页面管理
              </a-button>
              -->
            </div>
          </div>
        </a-col>
      </a-row>

      <!-- 编辑模式：左侧编辑器，右侧预览 -->
      <a-row :gutter="16" v-if="isEditing">
        <a-col :span="8">
          <!-- 模块编辑器 -->
          <ModuleEditor
            :initialConfig="currentPageConfig"
            @save-config="handleSaveModuleConfig"
            @config-change="handleConfigChange"
          />
        </a-col>
        <a-col :span="16">
          <!-- 预览内容 -->
          <div class="preview-container">
            <div class="preview-title">预览</div>
            <DataInputModule
              :moduleConfig="currentPageConfig.dataInput"
              :isEditing="isEditing"
            />
            <StatisticsModule
              :moduleConfig="currentPageConfig.statistics"
              :monitoringState="monitoringState"
              :isEditing="isEditing"
            />
            <ReportModule
              :moduleConfig="currentPageConfig.report"
              :monitoringState="monitoringState"
              :isEditing="isEditing"
              @reset-monitoring="handleResetMonitoring"
            />
          </div>
        </a-col>
      </a-row>

      <!-- 查看模式：全屏展示 -->
      <a-row v-else>
        <a-col :span="24">
          <div class="page-header">
            <h2>{{ currentPageConfig.name }}</h2>
            <div class="page-actions">
              <a-button type="link" @click="toggleEditMode">
                <a-icon type="edit" /> 编辑页面
              </a-button>
              <!-- 暂时隐藏页面管理功能
              <a-button @click="showPageList" style="margin-left: 8px">
                <a-icon type="appstore" /> 页面管理
              </a-button>
              -->
            </div>
          </div>

          <!-- 数据接入模块 -->
          <DataInputModule
            :moduleConfig="currentPageConfig.dataInput"
            :isEditing="isEditing"
            @monitoring-updated="updateMonitoringState"
          />

          <!-- 统计分析模块 -->
          <StatisticsModule
            :moduleConfig="currentPageConfig.statistics"
            :monitoringState="monitoringState"
            :isEditing="isEditing"
          />

          <!-- 报告生成模块 -->
          <ReportModule
            :moduleConfig="currentPageConfig.report"
            :monitoringState="monitoringState"
            :isEditing="isEditing"
            @reset-monitoring="handleResetMonitoring"
          />
        </a-col>
      </a-row>
    </a-card>

    <!-- 页面管理抽屉 -- 暂时隐藏
    <a-drawer
      title="监测页面管理"
      placement="right"
      :closable="true"
      :visible="pageListVisible"
      @close="pageListVisible = false"
      width="400"
    >
      <PageSelector
        :currentPageId="currentPageId"
        :pageList="pageList"
        @select-page="handleSelectPage"
        @create-page="handleCreatePage"
        @delete-page="handleDeletePage"
      />
    </a-drawer>
    -->
  </div>
</template>

<script>
import DataInputModule from '@/components/monitor/DataInputModule'
import StatisticsModule from '@/components/monitor/StatisticsModule'
import ReportModule from '@/components/monitor/ReportModule'
import ModuleEditor from '@/components/monitor/ModuleEditor'
import PageSelector from '@/components/monitor/PageSelector'
import { getPageConfigs, getPageConfig, savePageConfig, createNewPage, deletePage } from '@/mock/data/monitor_data'

export default {
  name: 'ApplicationAmlMonitor',
  components: {
    DataInputModule,
    StatisticsModule,
    ReportModule,
    ModuleEditor,
    PageSelector
  },
  data() {
    return {
      // 页面编辑状态
      isEditing: false,

      // 当前页面ID和配置
      currentPageId: 'default',
      currentPageConfig: null,

      // 页面列表
      pageList: [],
      pageListVisible: false,

      // 监测状态，用于组件间通信
      monitoringState: {
        transactionCount: 0,
        anomalyCount: 0,
        monitoringDuration: '00:00:00',
        hasMonitoringData: false,
        isMonitoring: false
      },

      // 页面加载状态
      loading: false
    }
  },
  mounted() {
    // 组件挂载完成后，加载页面配置
    this.$nextTick(() => {
      this.loadPageConfigs()
    })
  },
  methods: {
    // 加载所有页面配置
    loadPageConfigs() {
      this.loading = true
      getPageConfigs().then(pages => {
        this.pageList = pages

        // 加载当前页面配置
        this.loadCurrentPageConfig()
      }).catch(error => {
        console.error('获取页面配置失败:', error)
        this.$message.error('获取页面配置失败')
        this.loading = false
      })
    },

    // 加载当前页面配置
    loadCurrentPageConfig() {
      getPageConfig(this.currentPageId).then(config => {
        this.currentPageConfig = config
        this.loading = false
      }).catch(error => {
        console.error('获取当前页面配置失败:', error)
        this.$message.error('获取当前页面配置失败')
        this.loading = false
      })
    },

    // 切换编辑模式
    toggleEditMode() {
      if (this.isEditing) {
        // 保存配置并退出编辑模式
        this.saveCurrentPageConfig().then(() => {
          this.isEditing = false
        })
      } else {
        // 进入编辑模式
        this.isEditing = true
      }
    },

    // 保存当前页面配置
    saveCurrentPageConfig() {
      this.loading = true
      return savePageConfig(this.currentPageConfig).then(response => {
        if (response.success) {
          this.$message.success('页面配置保存成功')
          // 刷新页面列表
          this.loadPageConfigs()
        } else {
          this.$message.error('保存失败: ' + response.message)
        }
        this.loading = false
      }).catch(error => {
        console.error('保存页面配置失败:', error)
        this.$message.error('保存页面配置失败')
        this.loading = false
      })
    },

    // 处理保存模块配置
    handleSaveModuleConfig(newConfig) {
      this.currentPageConfig = newConfig
      this.saveCurrentPageConfig()
    },

    // 处理实时配置变化
    handleConfigChange(newConfig) {
      this.currentPageConfig = newConfig
    },

    // 显示页面列表
    showPageList() {
      this.pageListVisible = true
    },

    // 处理页面选择
    handleSelectPage(pageId) {
      if (pageId === this.currentPageId) return

      this.currentPageId = pageId
      this.loadCurrentPageConfig()
      this.pageListVisible = false

      // 退出编辑模式
      this.isEditing = false
    },

    // 处理页面创建
    handleCreatePage({ name, templateId }) {
      this.loading = true
      createNewPage(name).then(response => {
        if (response.success) {
          this.$message.success('页面创建成功')
          // 刷新页面列表
          this.loadPageConfigs()
          // 切换到新创建的页面
          this.currentPageId = response.pageId
          this.currentPageConfig = response.config
        } else {
          this.$message.error('创建失败: ' + response.message)
        }
        this.pageListVisible = false
        this.loading = false
      }).catch(error => {
        console.error('创建页面失败:', error)
        this.$message.error('创建页面失败')
        this.loading = false
      })
    },

    // 处理页面删除
    handleDeletePage(pageId) {
      this.loading = true
      deletePage(pageId).then(response => {
        if (response.success) {
          this.$message.success('页面删除成功')

          // 如果删除的是当前页面，切换到默认页面
          if (pageId === this.currentPageId) {
            this.currentPageId = 'default'
            this.loadCurrentPageConfig()
          }

          // 刷新页面列表
          this.loadPageConfigs()
        } else {
          this.$message.error('删除失败: ' + response.message)
        }
        this.loading = false
      }).catch(error => {
        console.error('删除页面失败:', error)
        this.$message.error('删除页面失败: ' + error.message)
        this.loading = false
      })
    },

    // 更新监测状态
    updateMonitoringState(state) {
      this.monitoringState = {
        ...this.monitoringState,
        ...state
      }
    },

    // 处理重置监测
    handleResetMonitoring() {
      this.monitoringState = {
        transactionCount: 0,
        anomalyCount: 0,
        monitoringDuration: '00:00:00',
        hasMonitoringData: false,
        isMonitoring: false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.application-aml-monitor {
  padding: 0;
  margin: 0;
  height: auto;
  min-height: auto;

  // 页面标题和操作按钮
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
  }

  // 页面工具栏
  .page-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    margin-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;

    .page-title {
      font-size: 16px;
      font-weight: bold;
    }
  }

  // 预览容器样式
  .preview-container {
    background-color: #f9f9f9;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    padding: 16px;

    .preview-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e8e8e8;
    }
  }
}
</style>
