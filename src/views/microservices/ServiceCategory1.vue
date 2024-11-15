<template>
  <div>
    <!-- 反洗钱合规类 服务模块 -->
    <div style="background-color: #ececec; padding: 20px;">
      <a-divider>反洗钱合规服务</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card hoverable title="交易监控服务" :bordered="false" @click="jumpAMLCompliance">
            <p>实时监控所有金融交易，检测可疑行为</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="身份验证服务" :bordered="false" @click="jumpAMLCompliance">
            <p>严格验证用户身份，确保交易的合法性与合规性</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="风险评估服务" :bordered="false" @click="jumpAMLCompliance">
            <p>通过大数据分析评估交易的洗钱风险等级</p>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <div style="background-color: #ececec; padding: 20px; margin-top: 20px">
      <a-divider>合规报告与通知</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card title="合规报告生成" :bordered="false" @click="jumpAMLCompliance">
            <p>自动生成反洗钱合规报告，确保合规性审计</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="可疑交易报警" :bordered="false" @click="jumpAMLCompliance">
            <p>当检测到可疑交易时，及时触发报警和发送通知</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="历史数据追溯" :bordered="false" @click="jumpAMLCompliance">
            <p>支持对交易记录的历史追溯，确保透明和可审计性</p>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AMLComplianceService',
  methods: {
    jumpAMLCompliance () {
      this.$router.push({ name: '反洗钱合规服务规范' })
    }
  }
}
</script>

<style scoped>

</style>
