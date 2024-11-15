<template>
  <div>
    <component
      @onGoBack="handleGoBack"
      @onGoUse="handleGoUse($event)"
      :is="currentComponent">
    </component>
  </div>
</template>
<script>
import list from './list'
import UseService from './useService'

export default {
  name: 'Template',
  components: { list, UseService },
  data () {
    return {
      currentComponent: 'list'
    }
  },
  methods: {
    handleGoBack () {
      this.currentComponent = 'list'
    },
    handleGoUse () {
      this.currentComponent = 'UseService'
    }
  }
}
</script>
