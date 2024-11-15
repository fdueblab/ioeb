<template>
  <div>
    <!-- 数据分析与决策类 服务模块 -->
    <div style="background-color: #ececec; padding: 20px;">
      <a-divider>数据处理与分析</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card hoverable title="数据预处理" :bordered="false" @click="jumpDataAnalytics">
            <p>提供清洗、归一化等数据预处理功能，提升数据质量</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="统计分析" :bordered="false" @click="jumpDataAnalytics">
            <p>进行统计分析与趋势预测，助力业务决策</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="可视化分析" :bordered="false" @click="jumpDataAnalytics">
            <p>通过图表展示数据分析结果，直观展示数据洞察</p>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <div style="background-color: #ececec; padding: 20px; margin-top: 20px">
      <a-divider>决策支持</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card title="智能推荐" :bordered="false" @click="jumpDataAnalytics">
            <p>基于数据分析，提供智能推荐服务，优化决策过程</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="风险评估" :bordered="false" @click="jumpDataAnalytics">
            <p>评估业务流程中的潜在风险，提升应对能力</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="策略优化" :bordered="false" @click="jumpDataAnalytics">
            <p>根据数据分析结果，提供业务策略优化建议</p>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataAnalyticsService',
  methods: {
    jumpDataAnalytics () {
      this.$router.push({ name: '数据分析与决策服务规范' })
    }
  }
}
</script>

<style scoped>

</style>
