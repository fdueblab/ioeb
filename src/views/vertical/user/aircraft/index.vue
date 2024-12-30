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

export default {
  name: 'Template',
  components: { list, UseService },
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
    handleGoUse (apiList) {
      this.apiList = apiList
      this.currentComponent = 'UseService'
    }
  }
}
</script>
