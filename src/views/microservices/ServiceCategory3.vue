<template>
  <div>
    <!-- 智能运维管理类 服务模块 -->
    <div style="background-color: #ececec; padding: 20px;">
      <a-divider>监控与告警</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card hoverable title="实时系统监控" :bordered="false" @click="jumpOpsManagement">
            <p>提供对系统运行状态的实时监控，发现潜在问题</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="告警与通知" :bordered="false" @click="jumpOpsManagement">
            <p>当检测到系统异常时，自动触发告警并通知运维人员</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="自动化恢复" :bordered="false" @click="jumpOpsManagement">
            <p>自动化执行故障恢复操作，降低宕机时间</p>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <div style="background-color: #ececec; padding: 20px; margin-top: 20px">
      <a-divider>日志与性能分析</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card title="日志管理" :bordered="false" @click="jumpOpsManagement">
            <p>集中化日志收集与分析，快速定位系统问题</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="性能监控" :bordered="false" @click="jumpOpsManagement">
            <p>持续监控系统性能，提供优化建议</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="容量规划" :bordered="false" @click="jumpOpsManagement">
            <p>根据系统负载情况进行容量预测与规划</p>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OpsManagementService',
  methods: {
    jumpOpsManagement() {
      this.$router.push({ name: '智能运维管理服务规范' })
    }
  }
}
</script>

<style scoped>

</style>
