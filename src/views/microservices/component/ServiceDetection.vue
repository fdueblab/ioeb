<template>
  <div>
    <a-upload
      name="file"
      :multiple="true"
      :customRequest="customRequest"
      :headers="headers"
      @change="handleChange"
    >
      <a-button>
        <a-icon type="upload"/>
        点击上传并检测
      </a-button>
    </a-upload>
    <a-modal
      :visible="modalVisible"
      title="服务检测"
      centered
      @ok="() => (modalVisible = false)">
      <a-spin tip="Loading..." :spinning="spinning">
        <div class="spin-content">
          {{text}}
        </div>
      </a-spin>
      <div v-for="item in urls" v-show="isShow">
        {{ item }}
      </div>
    </a-modal>
  </div>
</template>
<script>
import { serviceDetection } from '@/api/service'

export default {
  name: 'ServiceDetection',
  data() {
    return {
      headers: {
        authorization: 'authorization-text'
      },
      modalVisible: false,
      spinning: false,
      isShow: false,
      urls: [],
      text: '服务url、参数抽取中'
    }
  },
  methods: {
    handleChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        this.$message.success(`${info.file.name} file uploaded successfully`)
      } else if (info.file.status === 'error') {
        this.$message.error(`${info.file.name} file upload failed.`)
      }
    },
    customRequest() {
      this.modalVisible = true
      this.spinning = false
      setTimeout(() => {
        serviceDetection().then(res => {
          console.log(res)
          this.urls = res
          this.spinning = true
          this.isShow = true
        }).catch(err => {
          console.log(err)
        })
      }, 5000)

      setTimeout(() => {
        this.spinning = false
        this.text = '接口检测中'
      }, 2000)
    }
  }
}
</script>
