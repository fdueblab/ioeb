<template>
  <div>
    <a-input v-model="msg"> </a-input>
    <a-button type="primary" @click="sendMessage">点击</a-button>
  </div>
</template>

<script>
export default {
  name: 'Tenant',
  data() {
    return {
      msg: '',
      conn: null,
    }
  },
  methods: {
    isOpen(ws) {
      return ws.readyState === ws.OPEN
    },

    sendMessage() {
      if (!this.isOpen(this.conn)) {
        console.log('重新建立连接')
        this.reInit()
        this.$message.warning('服务器断开了连接，请重新发送指令！')
        return
      }

      this.conn.send(this.msg)
    },
    reInit() {
      if (window['WebSocket']) {
        var localAddr = 'ws://localhost:7676/conn?targetDeviceId=1&type=browser'
        var remoteAddr = 'ws://49.234.46.215:7676/conn?targetDeviceId=1&type=browser'
        this.conn = new WebSocket(remoteAddr)
        this.conn.onclose = function (evt) {
          const s = '服务器主动断开连接'
          this.msg = s
          this.conn = null
        }
        this.conn.onmessage = function (evt) {
          console.log('收到消息', evt.data)
        }
        this.conn.onopen = function (event) {
          this.msg = 'Successfully connected to the echo websocket server...'
        }
      } else {
        this.$message.warning('浏览器不支持websocket，无法控制远程设备！', 10)
      }
    },
  },
  created() {
    this.reInit()
  },
}
</script>