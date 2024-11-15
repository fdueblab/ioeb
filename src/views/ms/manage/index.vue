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
import serviceAdd from './service-add.vue'

export default {
  name: 'Template',
  components: { list, serviceAdd },
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
      this.currentComponent = 'serviceAdd'
    }
  }
}
</script>
