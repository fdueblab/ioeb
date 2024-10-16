<template>
  <a-row :gutter="24" :style="{marginBottom:'12px'}">
    <a-col :span="12">
      <a-card :span="12" v-for="item in items">
        <a-card-meta :title="item.title" :description="item.description">
          <!--          <a-avatar slot="avatar" :src="imgSrc"/>-->
          <a-avatar slot="avatar" :src="item.imgSrc"></a-avatar>
        </a-card-meta>
      </a-card>
    </a-col>

  </a-row>
</template>

<script>
  export default {
    name: 'Definition',
    data() {
      return {
        items: [
          {
            title: '教育实训场景',
            description: '为教育实训沙盘提供更仿真的消费者模型',
            imgSrc: require('@/assets/chenniao.jpg')
          }
        ]
      }
    }
  }
</script>

<style scoped>

</style>
