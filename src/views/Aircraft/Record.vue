/* eslint-disable */
<template>
  <div v-show="cardDataLoading">
    <a-row :gutter="20">

      <a-col :span="8" v-for="item in cardData.value" :key="item.test_id">
        <a-card :title="`教学场地：`+ item.exam_room" :bordered="false">

          <a-descriptions :column="1">
            <a-descriptions-item label="学生姓名">
              {{ item.student_name }}
            </a-descriptions-item>
            <a-descriptions-item label="教学科目">
              {{ item.exam_course }}
            </a-descriptions-item>
            <a-descriptions-item label="教学时间">
              {{ item.start_time }}
            </a-descriptions-item>
            <a-descriptions-item label="成绩">
              {{ item.result }}
            </a-descriptions-item>
            <a-descriptions-item label="查看详细信息">
              <a-button @click="jumpToTrace(item)" type="primary">跳转</a-button>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>

    </a-row>
  </div>
</template>

<script>
/* eslint-disable */

import { getAllRecord } from '@/api/aircraft'

export default {
  name: 'History',
  data() {
    return {
      cardData: [],
      cardDataLoading: false
    }
  },
  mounted() {
    getAllRecord().then(resp => {
      this.cardData = resp['result']
      this.cardDataLoading = true
    })
  },
  methods: {
    jumpToTrace(item) {
      console.log(item, '被点击了')
      this.$router.push({path: '/aircraft/history', query: { test_id: item.test_id}})
    }
  }
}
</script>

<style>

.amap-wrapper {
  width: 500px;
  height: 500px;
}
</style>
