<template>
  <div class="status-popover-content">
    <template v-if="currentStatusText">
      <a-steps direction="vertical" :current="getCurrentStep" size="small" progress-dot>
        <a-step v-for="(status, index) in deploymentStatusList"
                :key="'deployment-'+index"
                :title="status" />
      </a-steps>
    </template>
    <template v-else>
      <div class="status-section">
        <div class="status-title">未部署至平台的状态</div>
        <div class="status-list">
          <a-badge v-for="(status, index) in getStatusList('error')"
                   :key="'error-'+index"
                   status="error"
                   :text="status" />
          <a-badge v-for="(status, index) in getStatusList('default')"
                   :key="'default-'+index"
                   status="default"
                   :text="status" />
        </div>
      </div>
      <div class="status-section">
        <div class="status-title">部署至平台的状态</div>
        <div class="status-list">
          <a-badge v-for="(status, index) in getStatusList('processing')"
                   :key="'processing-'+index"
                   status="processing"
                   :text="status" />
          <a-badge v-for="(status, index) in getStatusList('warning')"
                   :key="'warning-'+index"
                   status="warning"
                   :text="status" />
          <a-badge v-for="(status, index) in getStatusList('success')"
                   :key="'success-'+index"
                   status="success"
                   :text="status" />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'StatusPopoverContent',
  props: {
    statusDict: {
      type: Array,
      default: () => []
    },
    statusStyleDict: {
      type: Array,
      default: () => []
    },
    currentStatusText: {
      type: String,
      default: ''
    },
    currentStatusStyle: {
      type: String,
      default: ''
    }
  },
  computed: {
    deploymentStatusList() {
      return [
        ...this.getStatusList('processing'),
        ...this.getStatusList('warning'),
        ...this.getStatusList('success')
      ]
    },
    getCurrentStep() {
      const index = this.deploymentStatusList.indexOf(this.currentStatusText)
      return index >= 0 ? index : -1
    }
  },
  methods: {
    getStatusList(style) {
      // 从statusStyleDict中获取所有匹配的code
      const styleItems = this.statusStyleDict.filter(item => item.text === style)
      if (!styleItems.length) {
        return ['未知状态']
      }

      // 获取所有匹配的状态文本
      return styleItems.map(styleItem => {
        const statusItem = this.statusDict.find(item => item.code === styleItem.code)
        return statusItem ? statusItem.text : '未知状态'
      })
    }
  }
}
</script>

<style scoped>
.status-popover-content {
  min-width: 300px;
  padding: 16px;
}

.status-section {
  margin-bottom: 16px;
}

.status-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.85);
}

.status-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-list .ant-badge {
  margin-right: 8px;
}

:deep(.ant-steps-item-title) {
  font-size: 14px;
}

:deep(.ant-steps-vertical) {
  margin-left: 8px;
}

:deep(.ant-steps-item-description) {
  font-size: 14px;
}
</style>
