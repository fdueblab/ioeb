<template>
  <div>
    <!-- 网络安全防护类 服务模块 -->
    <div style="background-color: #ececec; padding: 20px;">
      <a-divider>网络防护与检测</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card hoverable title="入侵检测" :bordered="false" @click="jumpCyberSecurity">
            <p>实时检测并阻止恶意入侵，保障系统安全</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="防火墙配置" :bordered="false" @click="jumpCyberSecurity">
            <p>通过防火墙规则配置，控制网络访问权限</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="安全审计" :bordered="false" @click="jumpCyberSecurity">
            <p>记录并审计系统活动，保障安全合规</p>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <div style="background-color: #ececec; padding: 20px; margin-top: 20px">
      <a-divider>数据保护与加密</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card title="数据加密" :bordered="false" @click="jumpCyberSecurity">
            <p>提供数据加密存储与传输服务，确保数据安全</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="访问控制" :bordered="false" @click="jumpCyberSecurity">
            <p>设置严格的权限管理机制，保障数据访问安全</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="数据备份与恢复" :bordered="false" @click="jumpCyberSecurity">
            <p>定期备份数据并提供故障后的数据恢复服务</p>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CyberSecurityService',
  methods: {
    jumpCyberSecurity() {
      this.$router.push({ name: '网络安全防护服务规范' })
    }
  }
}
</script>

<style scoped>

</style>
