<template>
  <a-card>
    <p>It works!</p>
    <a-button type="primary" @click="main('123')">点击试试看</a-button>
    <a-button type="danger" @click="showbase()">查看baseUrl</a-button>
  </a-card>
</template>

<script>
  export default {
    comments: {},
    name: 'Grammar',

    methods: {
      main(val) {
        (function(up, fn) {
          for (let i = 0; i < up; i++) {
            console.log(i)
          }
          fn()
        }(5, function() {
          alert('warning')
        }))
      },
      callback() {
        console.log('你在看什么')
        return 'yqz'
      },
      fn() {
        var a = 789
        return function() {
          console.log(a)
          return 'yqz'
        }
      },
      showbase() {
        console.log(process.env.VUE_APP_API_BASE_URL)
      }
    }
  }
</script>

<style scoped>

</style>
