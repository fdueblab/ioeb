<template>
  <div>
    <component
      @onGoBack="handleGoBack"
      @onGoUse="handleGoUse"
      :is="currentComponent"
      :apiList="apiList"
    >
    </component>
  </div>
</template>
<script>
import list from './list'
import UseService from '../useService'
import UseMetaApp from '../useMetaApp'

export default {
  name: 'Template',
  components: { list, UseService, UseMetaApp },
  data () {
    return {
      currentComponent: 'list',
      apiList: []
    }
  },
  methods: {
    handleGoBack () {
      this.currentComponent = 'list'
    },
    handleGoUse (record) {
      this.apiList = record.apiList
      if (record.type === 0) {
        this.currentComponent = 'UseService'
      } else if (record.type === 1) {
        this.currentComponent = 'UseMetaApp'
      } else {
        this.$message.error('未知错误')
      }
    }
  }
}
</script>
