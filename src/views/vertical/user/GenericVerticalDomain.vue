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

export default {
  name: 'GenericVerticalDomain',
  components: {
    GenericVerticalList,
    UseService,
    UseMetaApp
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
      this.apiList = record.apiList
      if (!record.apiList || record.apiList.length === 0) {
        this.$message.error('数据缺失！')
      } else if (record.type === 'meta') {
        this.currentComponent = 'UseMetaApp'
      } else {
        this.currentComponent = 'UseService'
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
