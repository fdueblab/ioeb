<template>
  <div class="clearfix">
    <a-form :form="form">
      <a-form-item label="kind">
        <a-input
          placeholder="输入所上传系统文字标识"
          v-decorator="['kind', {rules: [ { required: true, message: '不能为空'}]}]"/>
      </a-form-item>
      <a-form-item label="文件选择：">
        <a-upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload" directory>
          <a-button>
            <a-icon type="upload"/>
            Select File
          </a-button>
        </a-upload>
      </a-form-item>
      <a-button
        type="primary"
        :disabled="fileList.length === 0"
        :loading="uploading"
        style="margin-top: 16px"
        @click="handleUpload"
      >
        {{ uploading ? 'Uploading' : 'Start Upload' }}
      </a-button>
    </a-form>
    <a-button circle @click="conn.send('勾引陈坤')">发送信息</a-button>
  </div>
</template>
<script>

import { saveFile } from '@/api/schedule'

export default {
  name: 'DivideSystem',
  data () {
    return {
      fileList: [],
      uploading: false,
      form: this.$form.createForm(this),
      conn: null
    }
  },
  created () {
    if ('WebSocket' in window) {
      this.conn = new WebSocket('ws://localhost:8080/test')
      this.conn.onopen = function () {
        console.log('连接成功')
      }
      this.conn.onclose = function () {
        console.log('推出连接')
      }
      this.conn.onmessage = function (event) {
        console.log('收到消息' + event.data)
      }
      this.conn.onerror = function () {
        console.log('连接出错')
      }
    }
  },
  methods: {
    handleRemove (file) {
      console.log(this.form.getFieldValue('kind'))
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUpload (file) {
      // 过滤掉不是class的文件
      if (!(file.name.indexOf('.class') === -1) && file.name[0] !== '.') {
        this.fileList = [...this.fileList, file]
      }
      return false
    },
    handleUpload () {
      this.form.validateFields(err => {
        if (!err) {
          const { fileList } = this
          const formData = new FormData()
          formData.append('kind', this.form.getFieldValue('kind'))
          fileList.forEach(file => {
            formData.append('files[]', file)
          })
          console.log(formData.get('kind'))
          this.saveData(formData)
        }
      })
    },
    saveData (formData) {
      saveFile(formData).then(res => {
        this.$router.push({
            path: '/schedule/micserviceChart',
            query: {
              kind: this.form.getFieldValue('kind')
            }
          }
        )
      })
    }
  }
}
</script>

<style scoped>

</style>
