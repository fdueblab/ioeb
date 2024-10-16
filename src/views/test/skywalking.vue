<template>
  <div>
    <div style="height:auto;">
      <iframe
        id="show-skywalking"
        frameborder="0"
        scrolling="yes"
        style="background-color:transparent; position：absolute;width: 100%;
         height:100%; top: 0;left:0;bottom:0;"
        :src="url"></iframe>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Skywalking',
    data() {
      return {
        url: 'http://47.98.138.190:8080'
      }
    },
    mounted() {
      /**
       * iframe-宽高自适应显示
       */
      const oIframe = document.getElementById('show-skywalking')
      const deviceWidth = document.documentElement.clientWidth
      const deviceHeight = document.documentElement.clientHeight
      oIframe.style.height = (Number(deviceHeight) + 100) + 'px' // 数字是页面布局高度差，其中的100可以根据自己的界面进行调整
    }
  }
</script>

<style scoped>

</style>
