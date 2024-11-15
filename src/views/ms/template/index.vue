<template>
  <div>
    <component
      @onGoBack="handleGoBack"
      @onGoAdd="handleGoAdd($event)"
      :is="currentComponent">
    </component>
  </div>
</template>
<script>
import list from './list'
import tempAdd from './temp-add.vue'

export default {
  name: 'Template',
  components: { list, tempAdd },
  data () {
    return {
      currentComponent: 'list'
    }
  },
  methods: {
    handleGoBack () {
      this.currentComponent = 'list'
    },
    handleGoAdd () {
      this.currentComponent = 'tempAdd'
    }
  }
}
</script>
