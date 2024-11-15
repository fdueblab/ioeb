<template>
  <div class="all">
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="远程实时操控">
        <div id="live">
          <EasyPlayer
            :videoUrl="videoUrlFLV"
            videoTitle="远程操纵无人机2"
            :fluent="fluent"
            :autoplay="autoplay"
          ></EasyPlayer>
        </div>
        <div id="control">
          <a-tabs default-active-key="1">
            <a-tab-pane key="1" tab="直播">
              <a-divider>直播控制</a-divider>
              <el-button type="success" @click="sendCommand(&quot;startLiveShow&quot;)">开始直播</el-button>
              <el-button type="danger" @click="sendCommand(&quot;stopLiveShow&quot;)">停止直播</el-button>
              <a-divider>Live Info</a-divider>
              <el-button type="primary">直播状态</el-button>
              <el-button type="primary">声音--开</el-button>
              <br/><br/>
              <el-button type="primary">声音--关</el-button>
              <el-button type="primary">直播参数</el-button>
              <br/><br/>
              <el-button type="primary">开始时间</el-button>
              <a-divider>相机控制</a-divider>
              <el-button type="primary">拍照</el-button>
              <el-button type="primary">内存状态</el-button>
              <br/><br/>
              <el-button type="primary">抓拍</el-button>
              <br/><br/>
              <el-button type="primary">已拍照片数量</el-button>

            </a-tab-pane>
            <a-tab-pane key="2" tab="控制">
              <a-divider>远程服务器</a-divider>
              <a-row>
                <a-col :span="12" align="middle">
                  <el-button type="success" @click="reInit">连接操纵服务器</el-button>
                </a-col>
                <a-col :span="12" align="middle">
                  <el-button type="danger" @click="closeConnection">断开连接</el-button>
                </a-col>
              </a-row>
              <a-divider>操作指令</a-divider>
              <el-button type="success" @click="sendCommand(&quot;startStickControl&quot;)">启动摇杆</el-button>
              <el-button type="danger" @click="sendCommand(&quot;stopStickControl&quot;)">禁用摇杆</el-button>
              <br/><br/>
              <el-button type="primary" @click="sendCommand(&quot;1&quot;)">起飞</el-button>
              <el-button type="primary" @click="sendCommand(&quot;2&quot;)">降落</el-button>
              <el-button type="primary" @click="sendCommand(&quot;3&quot;)">自动降落</el-button>
              <a-divider>操作面板</a-divider>
              <el-button circle style="margin-left: 5%" @click="sendCommand(&quot;w&quot;)">W</el-button>
              &nbsp
              <el-button circle @click="sendCommand(&quot;0&quot;)">重置</el-button>
              <el-button icon="el-icon-top" circle style="margin-left: 18%" @click="sendCommand(&quot;up&quot;)"></el-button>
              <br/><br/>
              <el-button circle @click="sendCommand(&quot;a&quot;)" >A</el-button>
              <el-button circle @click="sendCommand(&quot;s&quot;)">S</el-button>
              <el-button circle @click="sendCommand(&quot;d&quot;)">D</el-button>
              &nbsp
              <el-button icon="el-icon-back" circle style="margin-left: 7%" @click="sendCommand(&quot;left&quot;)"></el-button>
              <el-button icon="el-icon-bottom" circle @click="sendCommand(&quot;down&quot;)"></el-button>
              <el-button icon="el-icon-right" circle @click="sendCommand(&quot;right&quot;)"></el-button>
            </a-tab-pane>
            <a-tab-pane key="3" tab="飞行参数">
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
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="操控评价">
        <a-card :span="12" v-for="item in items" :key="item.title">
          <a-card-meta :title="item.title" :description="item.description">
            <!--          <a-avatar slot="avatar" :src="imgSrc"/>-->
            <a-avatar slot="avatar" :src="item.imgSrc"></a-avatar>
          </a-card-meta>
        </a-card>
      </a-tab-pane>
      <!--      <a-tab-pane key="2" tab="模拟飞行训练" force-render>-->
      <!--        <el-image :src="require('@/assets/simulator.png')" v-show="simulatorStatus"></el-image>-->
      <!--        <div id="simulatorControl">-->
      <!--          <a-tabs default-active-key="1" >-->
      <!--            <a-tab-pane key="1" tab="参数设置">-->
      <!--              <a-divider>经纬度设置</a-divider>-->
      <!--              纬度：<input></input> 度<Br/>-->
      <!--              经度：<input></input> 度<Br/><Br/>-->
      <!--              <a-button type="primary" @click="simulatorStatus=true">开始仿真</a-button>-->
      <!--              &nbsp-->
      <!--              <a-button type="danger" @click="simulatorStatus=false">停止仿真</a-button>-->
      <!--              <a-divider>风速设置</a-divider>-->
      <!--              正北方向分量: <input placeholder="0"></input> m/s<Br/>-->
      <!--              正东方向分量: <input placeholder="0"></input> m/s<Br/>-->
      <!--              垂直方向分量: <input placeholder="0"></input> m/s<Br/>-->
      <!--              配置模式:-->
      <!--              <a-select default-value="1" style="width: 120px">-->
      <!--                <a-select-option value="1">-->
      <!--                  实时风速-->
      <!--                </a-select-option>-->
      <!--                <a-select-option value="2">-->
      <!--                  初始化风速-->
      <!--                </a-select-option>-->
      <!--              </a-select>-->
      <!--              <Br/>-->
      <!--              <a-button type="primary">设置</a-button>-->
      <!--            </a-tab-pane>-->
      <!--            <a-tab-pane key="2" tab="飞行控制" force-render>-->
      <!--              <a-divider>操作指令</a-divider>-->
      <!--              <el-button type="success">开始模拟</el-button>-->
      <!--              <el-button type="danger">停止模拟</el-button>-->
      <!--              <br/><br/>-->
      <!--              <el-button type="success">启用摇杆</el-button>-->
      <!--              <el-button type="danger">禁用摇杆</el-button>-->
      <!--              <a-divider>虚拟飞行控制</a-divider>-->
      <!--              <el-button circle style="margin-left: 10%">W</el-button>-->
      <!--              &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp-->
      <!--              <el-button icon="el-icon-top" circle style="margin-left: 33%"></el-button>-->
      <!--              <br/><br/>-->
      <!--              <el-button circle>A</el-button>-->
      <!--              <el-button circle>S</el-button>-->
      <!--              <el-button circle>D</el-button>-->
      <!--              &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp-->
      <!--              <el-button icon="el-icon-back" circle style="margin-left: 7%"></el-button>-->
      <!--              <el-button icon="el-icon-bottom" circle></el-button>-->
      <!--              <el-button icon="el-icon-right" circle></el-button>-->
      <!--            </a-tab-pane>-->
      <!--            <a-tab-pane key="3" tab="详情">-->
      <!--              <a-descriptions title="飞行信息" layout="vertical">-->
      <!--                <a-descriptions-item label="经度">-->
      <!--                  {{ Latitude }}-->
      <!--                </a-descriptions-item>-->
      <!--                <a-descriptions-item label="纬度">-->
      <!--                  {{ Longitude }}-->
      <!--                </a-descriptions-item>-->
      <!--                <a-descriptions-item label="时间">-->
      <!--                  {{ time }}-->
      <!--                </a-descriptions-item>-->
      <!--                <a-descriptions-item label="地面坐标X">-->
      <!--                  {{ WorldX }}-->
      <!--                </a-descriptions-item>-->
      <!--                <a-descriptions-item label="地面坐标Y">-->
      <!--                  {{ WorldY }}-->
      <!--                </a-descriptions-item>-->
      <!--                <a-descriptions-item label="地面坐标Z">-->
      <!--                  {{ WorldZ }}-->
      <!--                </a-descriptions-item>-->
      <!--                <a-descriptions-item label="机身坐标X">-->
      <!--                  {{ VelocityX }}-->
      <!--                </a-descriptions-item>-->
      <!--                <a-descriptions-item label="机身坐标Y">-->
      <!--                  {{ VelocityY }}-->
      <!--                </a-descriptions-item>-->
      <!--                <a-descriptions-item label="机身坐标Z">-->
      <!--                  {{ VelocityZ }}-->
      <!--                </a-descriptions-item>-->
      <!--                <a-descriptions-item label="飞行状态" :span="3">-->
      <!--                  <a-badge status="processing" text="Running"/>-->
      <!--                </a-descriptions-item>-->
      <!--                <a-descriptions-item label="配置信息">-->
      <!--                  X轴: 0.0000-->
      <!--                  <br/>-->
      <!--                  Y轴: 0.0000-->
      <!--                  <br/>-->
      <!--                  Z轴: 0.0000-->
      <!--                  <br/>-->
      <!--                  横轴接收: 0.0000-->
      <!--                  <br/>-->
      <!--                  Y轴接收: 0.0000-->
      <!--                  <br/>-->
      <!--                  Z轴接收: 0.0000<br/>-->
      <!--                </a-descriptions-item>-->
      <!--              </a-descriptions>-->
      <!--            </a-tab-pane>-->
      <!--          </a-tabs>-->
      <!--        </div>-->
      <!--      </a-tab-pane>-->
      <!--      <a-tab-pane key="3" tab="飞行评价分析">-->
      <!--        <a-card :span="12" v-for="item in items" :key="item.title">-->
      <!--          <a-card-meta :title="item.title" :description="item.description">-->
      <!--            &lt;!&ndash;          <a-avatar slot="avatar" :src="imgSrc"/>&ndash;&gt;-->
      <!--            <a-avatar slot="avatar" :src="item.imgSrc"></a-avatar>-->
      <!--          </a-card-meta>-->
      <!--        </a-card>-->
      <!--      </a-tab-pane>-->
    </a-tabs>
  </div>
</template>

<script>
import EasyPlayer from '@easydarwin/easyplayer'

export default {
  name: 'Live',
  components: {
    EasyPlayer
  },
  data() {
    return {
      simulatorStatus: true,
      autoplay: true,
      fluent: true, // 流畅模式
      videoUrl: 'rtmp://localhost:1935/live/movie',
      videoUrlFLV: 'http://49.234.46.215:7001/live/dji.flv',
      WorldX: 0.0,
      WorldY: 0.0,
      WorldZ: 0.0,
      Latitude: 22.5428,
      Longitude: 113.9589,
      VelocityX: 0.0,
      VelocityY: 0.0,
      VelocityZ: 0.0,
      time: 45646,
      items: [
        {
          title: '视频分析',
          description: '获取飞行视频数据，分析飞行路线是否达标',
          imgSrc: require('@/assets/aircraft1.jpg')
        },
        {
          title: '操作分析',
          description: '分析飞行过程的操作参数，评价操作分数',
          imgSrc: require('@/assets/aircraft2.jpg')
        },
        {
          title: '查看历史成绩',
          description: '',
          imgSrc: require('@/assets/aircraft3.jpg')
        }
      ],
      // ws 飞行控制相关
      wsUrl: 'ws://localhost:7676/conn?targetDeviceId=1&type=browser',
      conn: null
    }
  },
  methods: {
    isOpen(ws) {
      return ws.readyState === ws.OPEN
    },
    downColor() {
      console.log('我按下了上键')
    },
    sendCommand(command) {
      console.log(command, typeof command)
      this.sendMessage(command)
    },
    sendMessage(command) {
      if (!this.isOpen(this.conn)) {
        console.log('重新建立连接')
        this.reInit()
        this.$message.warning('服务器断开了连接，请重新发送指令！')
        return
      }

      this.conn.send(command)
    },
    reInit() {
      if (window['WebSocket']) {
        // eslint-disable-next-line no-unused-vars
        const localAddr = 'ws://localhost:7676/conn?targetDeviceId=1&type=browser'
        const remoteAddr = 'ws://123.60.55.75:7010/test'
        this.conn = new WebSocket(remoteAddr)
        this.conn.onclose = function (evt) {
          const s = '服务器主动断开连接'
          this.msg = s
          this.conn = null
        }
        this.conn.onmessage = function (evt) {
          console.log('收到消息', evt.data)
        }
        this.conn.onopen = () => {
          this.$message.success('成功连接到控制服务器')
        }
      } else {
        this.$message.warning('浏览器不支持websocket，无法控制远程设备！', 10)
      }
    },

    closeConnection() {
      this.conn.close()
      this.$message.info('成功断开连接！')
    }
  },
  mounted() {},
  created() {
    this.reInit()
  }
}
</script>

<style scoped>
#live {
  margin-right: 20%;
}

#simulatorControl {
  margin-left: 82%;
  float: right;
  position: absolute;
  top: 65px;
}

#handle {
  border-style: solid;
  float: left;
}

#control {
  margin-left: 82%;
  float: right;
  position: absolute;
  top: 65px;
}
</style>
