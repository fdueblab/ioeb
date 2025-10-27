<template>
  <div>
    <component
      @onGoBack="handleGoBack"
      @onGoUse="handleGoUse"
      :is="currentComponent"
      :apiList="apiList"
      :verticalType="verticalType"
      :key="verticalType"
    >
    </component>
  </div>
</template>

<script>
import GenericVerticalList from './GenericVerticalList'
import UseService from './useService'
import UseMetaApp from './useMetaApp'
import UseMCP from './useMCP'

export default {
  name: 'GenericVerticalDomain',
  components: {
    GenericVerticalList,
    UseService,
    UseMetaApp,
    UseMCP
  },
  props: {
    // 垂直领域类型
    verticalType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentComponent: 'GenericVerticalList',
      apiList: []
    }
  },
  methods: {
    handleGoBack() {
      this.currentComponent = 'GenericVerticalList'
    },
    handleGoUse(record) {
      console.log('record', record)
      console.log('record.apiList', record.apiList)
      
      // 根据服务类型处理数据
      switch (record.type) {
        case 'meta':
          // 元应用类型，期望有 apiList
          if (!record.apiList || record.apiList.length === 0) {
            this.$message.error('数据缺失！')
            return
          }
          this.apiList = record.apiList
          this.currentComponent = 'UseMetaApp'
          break
        case 'atomic_mcp':
          // MCP 类型服务，需要将 record 本身包装成数组
          // MCP 服务的数据结构包含 url, tools, des 等字段
          if (!record.url) {
            this.$message.error('MCP 服务地址缺失！')
            return
          }
          this.apiList = [record]
          this.currentComponent = 'UseMCP'
          break
        case 'atomic':
          // 原子服务类型，期望有 apiList
          if (!record.apiList || record.apiList.length === 0) {
            this.$message.error('数据缺失！')
            return
          }
          this.apiList = record.apiList
          this.currentComponent = 'UseService'
          break
        default:
          this.$message.error('服务类型异常！')
      }
    }
  },
  watch: {
    // 监听垂直领域类型变化，重置组件状态
    verticalType(newVal, oldVal) {
      if (newVal !== oldVal) {
        console.log('GenericVerticalDomain垂直领域类型变化:', oldVal, '->', newVal)
        // 重置为列表组件
        this.currentComponent = 'GenericVerticalList'
        this.apiList = []
      }
    }
  }
}
</script>
