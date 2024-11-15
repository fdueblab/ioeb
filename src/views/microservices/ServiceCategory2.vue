<template>
  <div>
    <!-- 数据隐私保护类 服务模块 -->
    <div style="background-color: #ececec; padding: 20px;">
      <a-divider>数据安全服务</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card hoverable title="加密存储服务" :bordered="false" @click="jumpDataPrivacy">
            <p>提供数据的加密存储，确保数据在存储过程中的安全性</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="访问控制服务" :bordered="false" @click="jumpDataPrivacy">
            <p>管理和限制对敏感数据的访问权限，确保隐私安全</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="数据泄露防护" :bordered="false" @click="jumpDataPrivacy">
            <p>检测并阻止潜在的数据泄露风险</p>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <div style="background-color: #ececec; padding: 20px; margin-top: 20px">
      <a-divider>隐私合规与审查</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card title="合规审查服务" :bordered="false" @click="jumpDataPrivacy">
            <p>检查并确保数据处理流程符合各项隐私保护法规</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="隐私条款管理" :bordered="false" @click="jumpDataPrivacy">
            <p>生成和管理隐私条款，确保用户知情权与同意</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="审计追踪" :bordered="false" @click="jumpDataPrivacy">
            <p>提供数据操作的审计追踪，确保操作合规和透明</p>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataPrivacyService',
  methods: {
    jumpDataPrivacy () {
      this.$router.push({ name: '数据隐私保护服务规范' })
    }
  }
}
</script>

<style scoped>

</style>
