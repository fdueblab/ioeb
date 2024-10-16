<template>
  <a-card :title="getTitle()">
    <json-view :data="json" :deep="2"></json-view>
  </a-card>
</template>

<script>
  import jsonView from 'vue-json-views'
  import { inspectContainer } from '@/api/docker'

  export default {
    name: 'JsonContainer',
    components: {
      jsonView
    },
    data() {
      return {
        titlePostfix: '容器详细信息',
        json: [],
        // id: 'b30ef660423bd05543fb3df8f44fb351ad690eab00c761936190d17e1bb14f40'
        id: '',
        containerName: ''
      }
    },
    methods: {
      loadData() {
        this.id = this.$route.query.id
        this.containerName = this.$route.query.name.substring(1)
        console.log('In loadData():id=' + this.id + 'containerName=' + this.containerName)
        inspectContainer({ 'id': this.id }).then(res => {
          this.json = res.result
        }).catch(err => {
          console.error('load json container err:' + err)
        })
      },
      getTitle() {
        return this.containerName + this.titlePostfix
      }
    },
    created() {
      this.loadData()
    }
  }
</script>

<style scoped>

</style>
