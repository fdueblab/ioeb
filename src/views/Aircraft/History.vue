/* eslint-disable */
<template>
  <div id="amap">
    <a-card :title="titleStr" style="width: 80%">
      <a-row>
        <a-col :span="10">
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="用户姓名">
              {{ resp.student_name }}
            </a-descriptions-item>
            <a-descriptions-item label="体验性质">
<!--              {{ resp.exam_course }}-->

              <a-radio-group name="radioGroup" :default-value="0" @change="onChange">
                <a-radio :value="1">
                  远程操作
                </a-radio>
                <a-radio :value="2">
                  教学实训
                </a-radio>
              </a-radio-group>


            </a-descriptions-item>
            <a-descriptions-item label="操作计划">
              {{ resp.exam_requirement }}
            </a-descriptions-item>
            <a-descriptions-item label="启动时间">
              {{ resp.start_time }}
            </a-descriptions-item>
            <a-descriptions-item label="持续时间">
              {{ resp.duration }}秒
            </a-descriptions-item>
          </a-descriptions>

          <a-result status="success" v-if="passStatus" title="成功通过教学">

          </a-result>
          <a-result status="error" v-else="passStatus" title="没有通过">

          </a-result>
<!--          <a-tag color="#87d068" v-if="passStatus">-->
<!--            通过-->
<!--          </a-tag>-->
<!--          <a-tag color="#f50" v-else>-->
<!--            不通过-->
<!--          </a-tag>-->
        </a-col>
        <a-col :span="2">
          <a-divider type="vertical"></a-divider>
        </a-col>
        <a-col :span="12" :v-if="mapLoading"
        >
          <div class="amap-wrapper">
            <el-amap
              vid="amapTrack"
              :center="initAddr"
              :zoom="zoom"
              class="amap-demo"
              :zoomEnable="true"
              ref="map"
            >
              <el-amap-polygon v-for="(polygon, index) in polygons"
                               :vid="index" :ref="`polygon_${index}`" :path="polygon.path"
                               :draggable="polygon.draggable"
                               :events="polygon.events"></el-amap-polygon>

            </el-amap>
          </div>
        </a-col>
      </a-row>
    </a-card>

  </div>
</template>

<script>
/* eslint-disable */

import { getTrace } from '@/api/aircraft'

export default {
  name: 'History',
  data() {
    return {
      buttonvalue: 0,
      titleStr: '教学信息',
      zoom: 100,
      msg: 'vue-amap向你问好！',
      initAddr: [121.502891, 31.290807],
      center: [121.5273285, 31.21515044],

      examRoom: 1, // 考场
      userName: '宋杰',  // 学生姓名
      grade: '通过', // 是否通过
      plugin: [{
        pName: 'Scale',
        events: {
          init(instance) {
            console.log(instance)
          }
        }
      }],
      polygons: [{
        draggable: false,
        events: {
          click: () => {
            alert('click polygon')
            console.log(this.$refs.map.$$getCenter())
            console.log(this.$refs.polygon_0[0].$$getPath())
          }
        }
      }
      ],

      resp: {},
      mapLoading: false,

      passStatus: false

    }
  },
  created() {
    console.log(this.$route.query.test_id)
    getTrace({ test_id: this.$route.query.test_id }).then(r => {
      this.resp = r['result']
      this.polygons[0]['path'] = this.resp['trace']
      this.passStatus = this.resp['result'] === '通过'
      this.mapLoading = true

    })
  },
  methods: {
    onChange(e) {
      console.log('radio checked', e.target.value);
      this.buttonvalue = e.target.value;
      console.log('bvalue', this.buttonvalue);
    },
  }
}
</script>

<style>

.amap-wrapper {
  width: 500px;
  height: 500px;
}
</style>
