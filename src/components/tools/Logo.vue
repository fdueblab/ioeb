<template>
  <div class="logo">
    <router-link :to="{name:'dashboard'}">
<!--      <LogoSvg alt="logo" />-->
<!--      <image src="logo.png" ></image>-->
<!--      <img :src="logo.png"></img>-->
      <el-image class="logo2" :src="require('@/assets/logo1.png')"></el-image>
      {{ title }}
    </router-link>
  </div>
</template>

<script>

import LogoSvg from '@/assets/logo.svg?inline'


export default {
  name: 'Logo',
  components: {
    LogoSvg
  },
  props: {
    title: {
      type: String,
      default: '网络制造资源微服务工具箱',
      required: false
    },
    showTitle: {
      type: Boolean,
      default: true,
      required: false
    }
  }
}
</script>


<style>
.tt {
  height: 150%;
}
.logo2 {
  height: 90%;
}

</style>

