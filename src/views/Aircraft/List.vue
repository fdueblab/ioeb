<template>
  <div>
    <a-card hoverable style="width: 300px">
      <img
        slot="cover"
        alt="example"
        src="@/assets/aircraft1.jpg"
      />
      <template slot="actions" class="ant-card-actions">
        <a-button type="link" @click="jumpAircraft()">点击进入体验</a-button>
      </template>
      <a-card-meta title="无人机">
        <template slot="description">
          第一视角远程操控无人机飞行
        </template>
      </a-card-meta>
    </a-card>
  </div>
</template>

<script>
export default {
  name: 'List',
  methods: {
    jumpAircraft() {
      this.$router.push('/Aircraft/Live')
    }
  }
}
</script>

<style scoped>

</style>
