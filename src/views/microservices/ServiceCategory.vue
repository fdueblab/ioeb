<template>
  <div>
    <div style="background-color: #ececec; padding: 20px;">
      <a-divider>设备端服务</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card hoverable title="设备控制" :bordered="false" @click="jumpAircraft">
            <p>用于接收指令从而操作设备的服务</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="设备状态" :bordered="false" @click="jumpAircraft">
            <p>用于获取设备状态信息的服务</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="视频直播" :bordered="false" @click="jumpAircraft">
            <p>通过摄像头捕获设备活动时的视频流并实现直播服务</p>
          </a-card>
        </a-col>
      </a-row>
    </div>
    <div style="background-color: #ececec; padding: 20px; margin-top: 20px">
      <a-divider>用户端服务</a-divider>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card title="视频分析" :bordered="false" @click="jumpAircraft">
            <p>通过对操作过程所捕获视频流进行分析给出得分的服务</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="设备操作" :bordered="false" @click="jumpAircraft">
            <p>实现可编辑、可预设的设备操作的用户端服务</p>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card title="操作评价" :bordered="false" @click="jumpAircraft">
            <p>对此次用户对设备的操作进行评价打分的服务</p>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServiceCategory',
  methods: {
    jumpAircraft () {
      this.$router.push({ name: 'ServiceDetail' })
    }
  }
}
</script>
