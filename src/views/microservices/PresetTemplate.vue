<template>
  <div>
    <a-divider>资源类型</a-divider>
    <a-row :gutter="16" style="margin-bottom: 20px;">
      <a-col :span="8">
        <a-card hoverable @click="jumpAircraft">
          <img
            slot="cover"
            alt="example"
            src="@/assets/aircraft1.jpg"
          />
          <template slot="actions" class="ant-card-actions">
          </template>
          <a-card-meta title="前沿装备类">
            <template slot="description">
              将该类资源虚拟化为设备端与用户端服务实现共享
            </template>
          </a-card-meta>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card hoverable @click="jumpAntiMoney">
          <img
            slot="cover"
            alt="example"
            src="@/assets/money.jpg"
          />
          <template slot="actions" class="ant-card-actions">
          </template>
          <a-card-meta title="反洗钱服务">
            <template slot="description">
              提供全面的反洗钱服务，确保金融交易的合规性与安全性
            </template>
          </a-card-meta>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card hoverable @click="jumpDataPrivacy">
          <img
            slot="cover"
            alt="example"
            src="@/assets/privacy.jpeg"
          />
          <template slot="actions" class="ant-card-actions">
          </template>
          <a-card-meta title="数据隐私保护类">
            <template slot="description">
              提供全面的数据安全与隐私保护服务，确保数据的安全与合规性。
            </template>
          </a-card-meta>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="8">
        <a-card hoverable @click="jumpOpsManagement">
          <img
            slot="cover"
            alt="example"
            src="@/assets/ops_management.jpeg"
          />
          <template slot="actions" class="ant-card-actions">
          </template>
          <a-card-meta title="智能运维管理类">
            <template slot="description">
              提供系统监控、日志管理、性能优化等智能化运维服务，确保系统的高效运行与稳定性 。
            </template>
          </a-card-meta>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card hoverable @click="jumpDataAnalytics">
          <img
            slot="cover"
            alt="example"
            src="@/assets/data_analytics.jpg"
          />
          <template slot="actions" class="ant-card-actions">
          </template>
          <a-card-meta title="数据分析与决策类">
            <template slot="description">
              提供数据挖掘、分析与决策支持服务，帮助企业从数据中提取洞察，提升业务决策的准确性。
            </template>
          </a-card-meta>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card hoverable @click="jumpCyberSecurity">
          <img
            slot="cover"
            alt="example"
            src="@/assets/cyber_security.jpg"
          />
          <template slot="actions" class="ant-card-actions">
          </template>
          <a-card-meta title="网络安全防护类">
            <template slot="description">
              提供多层次的网络安全防护服务，涵盖入侵检测、防火墙配置、安全审计等，确保系统与数据的安全。
            </template>
          </a-card-meta>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
export default {
  name: 'List',
  methods: {
    jumpAircraft () {
      this.$router.push({ name: 'ServiceCategory' })
    },
    jumpAntiMoney () {
      this.$router.push({ name: 'ServiceCategory1' })
    },
    jumpDataPrivacy () {
      this.$router.push({ name: 'ServiceCategory2' })
    },
    jumpOpsManagement () {
      this.$router.push({ name: 'ServiceCategory3' })
    },
    jumpDataAnalytics () {
      this.$router.push({ name: 'ServiceCategory4' })
    },
    jumpCyberSecurity () {
      this.$router.push({ name: 'ServiceCategory5' })
    }
  }
}
</script>

<style scoped>

</style>
