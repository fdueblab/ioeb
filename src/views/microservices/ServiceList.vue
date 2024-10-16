<template>
  <div style="background-color: #ececec; padding: 20px;">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card title="设备端微服务" :bordered="true">
          <p style="font-size: 15px;font-weight: bolder">设备状态</p>
          <a-button type="primary" block @click="()=>(modalVisible1=true)">
            <p>无人机状态采集微服务</p>
          </a-button>
          <a-modal
            title="无人机飞行信息"
            :visible="modalVisible1"
            centered
            @ok="() => modalVisible1=false"
            @cancel="() => modalVisible1=false"
          >
            <a-descriptions title="飞行信息" layout="vertical">
              <a-descriptions-item label="经度">
                {{ Latitude }}
              </a-descriptions-item>
              <a-descriptions-item label="纬度">
                {{ Longitude }}
              </a-descriptions-item>
              <a-descriptions-item label="时间">
                {{ time }}
              </a-descriptions-item>
              <a-descriptions-item label="地面坐标X">
                {{ WorldX }}
              </a-descriptions-item>
              <a-descriptions-item label="地面坐标Y">
                {{ WorldY }}
              </a-descriptions-item>
              <a-descriptions-item label="地面坐标Z">
                {{ WorldZ }}
              </a-descriptions-item>
              <a-descriptions-item label="机身坐标X">
                {{ VelocityX }}
              </a-descriptions-item>
              <a-descriptions-item label="机身坐标Y">
                {{ VelocityY }}
              </a-descriptions-item>
              <a-descriptions-item label="机身坐标Z">
                {{ VelocityZ }}
              </a-descriptions-item>
              <a-descriptions-item label="飞行状态" :span="3">
                <a-badge status="processing" text="Running"/>
              </a-descriptions-item>
              <a-descriptions-item label="配置信息">
                X轴: 0.0000
                <br/>
                Y轴: 0.0000
                <br/>
                Z轴: 0.0000
                <br/>
                横轴接收: 0.0000
                <br/>
                Y轴接收: 0.0000
                <br/>
                Z轴接收: 0.0000<br/>
              </a-descriptions-item>
            </a-descriptions>
          </a-modal>
          <a-divider/>
          <p style="font-size: 15px;font-weight: bolder">设备控制</p>
          <a-button type="primary" block @click="modalVisible2=true">
            无人机控制微服务
          </a-button>
          <a-modal
            title="无人机控制"
            :visible="modalVisible2"
            centered
            @ok="() => modalVisible2=false"
            @cancel="() => modalVisible2=false"
          >
            <a-button type="primary">启用虚拟摇杆</a-button>
            &nbsp
            <a-button type="primary">禁用虚拟摇杆</a-button>
            <a-divider/>
            <a-button type="primary">起飞</a-button>
            &nbsp
            <a-button type="primary">落地</a-button>
            <a-divider/>
            <el-button
              :disabled=upflag
              icon="el-icon-top"
              circle
            ></el-button>
            <el-button icon="el-icon-back" circle></el-button>
            <el-button icon="el-icon-right" circle></el-button>
            <el-button icon="el-icon-bottom" circle></el-button>
          </a-modal>
          <a-divider/>
          <p style="font-size: 15px;font-weight: bolder">现场视频</p>
          <a-button type="primary" block @click="modalVisible3=true">
            <p>无人机视频采集微服务</p>
          </a-button>
          <br/><br/>
          <a-modal
            title="视频采集"
            :visible="modalVisible3"
            centered
            @ok="() => modalVisible3=false"
            @cancel="() => modalVisible3=false"
          >
            <a-input placeholder="输入直播源" v-model="videoUrlFLV"></a-input>
            <a-button type="primary" @click="$alert('Connect Success')">连接直播源</a-button>
            &nbsp
            <a-button type="primary" @click="$alert('Disconnect Success')">断开直播源</a-button>
          </a-modal>
          <a-button type="primary" block @click="modalVisible4=true">
            <p>无人机视频通信微服务</p>
          </a-button>
          <br/><br/>
          <a-modal
            title="无人机视频通信"
            :visible="modalVisible4"
            centered
            @ok="()=>modalVisible4=false"
            @cancel="()=>modalVisible4=false"
          >
            <EasyPlayer
              :videoUrl="videoUrlFLV"
              videoTitle="无人机第一人称视角直播"
              :fluent="fluent"
              :autoplay="autoplay"
            ></EasyPlayer>
            <a-divider></a-divider>
            <a-button type="primary">开始直播</a-button>
            &nbsp
            <a-button type="primary">停止直播</a-button>
            &nbsp
            <a-button type="primary">直播源信息</a-button>
            <a-button type="primary"></a-button>
          </a-modal>
          <a-button type="primary" block>
            <p>无人机视频分析微服务</p>
          </a-button>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="体验端微服务" :bordered="false">
          <a-button type="primary" block>
            <p>视频分析评价微服务</p>
          </a-button>
          <br/><br/>
          <a-button type="primary" block>
            <p>操作分析评价微服务</p>
          </a-button>
          <br/>
          <br/>
          <a-button type="primary" block>
            <p>设备操作管理微服务</p>
          </a-button>
          <br/>
          <br/>
          <a-button type="primary" block>
            <p>设备操纵模拟微服务</p>
          </a-button>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="其他管理运维中介微服务" :bordered="false">
          <a-button type="primary" block @click="modalVisible5=true">
            <p>双向通信微服务</p>
          </a-button><br/><br/>
          <a-button type="primary" block @click="modalVisible5=true">
            <p>服务管理</p>
          </a-button><br/><br/>
          <a-button type="primary" block @click="modalVisible5=true">
            <p>服务间数据传递</p>
          </a-button><br/><br/>
          <a-modal
            title="模拟器设置"
            :visible="modalVisible5"
            centered
            @ok="()=>modalVisible5=false"
            @cancel="()=>modalVisible5=false"
          >
            纬度：<input></input> 度<Br/>
            经度：<input></input> 度<Br/>
            <a-button type="primary">开始仿真</a-button>
            &nbsp
            <a-button type="primary">停止仿真</a-button>
            <h3>风速</h3><Br/>
            正北方向分量: <input placeholder="0"></input> m/s<Br/>
            正东方向分量: <input placeholder="0"></input> m/s<Br/>
            垂直方向分量: <input placeholder="0"></input> m/s<Br/>
            配置模式:
            <a-select default-value="1" style="width: 120px" @change="handleChange">
              <a-select-option value="1">
                实时风速
              </a-select-option>
              <a-select-option value="2">
                初始化风速
              </a-select-option>
            </a-select>
            <Br/>
            <a-button type="primary">设置</a-button>
          </a-modal>
          <a-divider/>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
import EasyPlayer from '@easydarwin/easyplayer'
<script>
import EasyPlayer from '@easydarwin/easyplayer'

export default {
  components: {
    EasyPlayer
  },
  data() {
    return {
      modalVisible1: false,
      modalVisible2: false,
      modalVisible3: false,
      modalVisible4: false,
      modalVisible5: false,
      videoUrlFLV: '',
      fluent: true,
      autoplay: true,
      WorldX: 0.0000,
      WorldY: 0.0000,
      WorldZ: 0.0000,
      Latitude: 22.5428,
      Longitude: 113.9589,
      VelocityX: 0.0000,
      VelocityY: 0.0000,
      VelocityZ: 0.0000,
      time: 45646
    }
  },
  methods: {}
}
</script>

<style>

.amap-wrapper {
  width: 500px;
  height: 500px;
}
</style>
