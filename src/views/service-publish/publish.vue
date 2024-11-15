<template>
  <div class="clearfix">
    <div>
      <a-steps :current="current">
        <a-step v-for="item in steps" :key="item.title" :title="item.title" />
      </a-steps>
      <div class="steps-content" v-show="current == 0">
        <label style="margin-left: 10%;">选择服务类别: </label>
        <a-cascader
          :options="options"
          v-model="type"
          placeholder="请选择"
          style="margin-left: 10%;"
        />
        <a-form-item label="服务端口" style="width: 300px; margin-left: 10%;">
          <a-input v-model="port" />
        </a-form-item>
        <label style="margin-left: 10%;">选择文件：</label>
        <a-upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload">
          <a-button>
            <a-icon type="upload" />
            文件选择
          </a-button>
        </a-upload>
        <a-button
          type="primary"
          @click="handleUpload"
          :disabled="isUploading"
          style="margin-left: 66%; margin-top: 10px"
        >
          <a-spin v-if="isUploading" size="small" style="margin-right: 5px" />
          开始上传
        </a-button>
        <a-progress style="margin-left: 13%; margin-bottom: 20px" type="circle" :percent="percent" v-show="isShow" />
      </div>
      <div class="steps-content" v-show="current == 1">
        <a-form :form="form" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" @submit="handleSubmit">
          <a-form-item label="公司名称">
            <a-input v-decorator="['note', { rules: [{ required: true, message: '请填写公司名称!' }] }]" />
          </a-form-item>
          <a-form-item label="开发者">
            <a-input v-decorator="['note', { rules: [{ required: true, message: '请填写开发者!' }] }]" />
          </a-form-item>
          <a-form-item label="联系方式">
            <a-input v-decorator="['note', { rules: [{ required: true, message: '请填写联系方式!' }] }]" />
          </a-form-item>
          <a-button @click="test">测试按钮</a-button>
        </a-form>
      </div>
      <div class="steps-action">
        <a-button v-if="current < steps.length - 1" type="primary" @click="next">
          {{ current == 1 ? "点击发布" : "下一步" }}
        </a-button>
        <a-button v-if="current == steps.length - 1" type="primary" @click="$message.success('处理完成!')">
          点击发布
        </a-button>
        <a-button v-if="current > 0" style="margin-left: 8px" @click="prev">
          上一步
        </a-button>
      </div>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { createDockfile, createImage } from '@/api/docker'
// eslint-disable-next-line no-unused-vars
import { serviceDetection } from '@/api/service'
import { Cascader } from 'ant-design-vue'

export default {
  name: 'DivideSystem',
  components: {
    'a-cascader': Cascader
  },
  data () {
    return {
      percent: 0,
      isShow: false,
      isUploading: false, // 上传状态
      type: '',
      port: '',
      options: [
        {
          value: '前沿装备',
          label: '前沿装备',
          children: [
            { value: 'device-control', label: '设备控制' },
            { value: 'video-service', label: '视频直播' },
            { value: 'device-status', label: '设备状态' },
            { value: 'device-operate', label: '设备操作' },
            { value: 'operate-analysis', label: '操作分析' },
            { value: 'video-analysis', label: '视频分析' }
          ]
        }
      ],
      fileList: [],
      current: 0,
      steps: [
        { title: '选择服务类型并上传服务文件' },
        { title: '补充相关信息' }
      ]
    }
  },
  methods: {
    test () {
      // 测试逻辑
    },
    next () {
      this.current++
    },
    prev () {
      this.current--
    },
    handleRemove (file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUpload (file) {
      this.fileList = [...this.fileList, file]
      return false // 阻止自动上传
    },
    handleUpload () {
      const { fileList } = this
      const formData = new FormData()
      fileList.forEach(file => {
        formData.append('file', file)
      })
      this.saveData(formData)
    },
    saveData (formData) {
      formData.append('type', this.type[1])
      formData.append('port', this.port)
      // 等待15秒
      this.isUploading = true
      setTimeout(() => {
        this.isUploading = false
        this.$message.success('上传成功')
      }, 10000) // 模拟2秒的上传时间

      // createDockfile(formData).then(res => {
      //   console.log(res);
      //   createImage().then(res => {
      //     console.log(res);
      //     this.$router.push({ name: '各个微服务的可视化查看' });
      //   }).catch(err => {
      //     console.log(err);
      //   });
      // }).catch(err => {
      //   console.log(err);
      // });
    }
  }
}
</script>

<style scoped>
.steps-content {
  margin-top: 16px;
  border: 1px dashed #e9e9e9;
  border-radius: 6px;
  background-color: #fafafa;
  min-height: 200px;
  padding-top: 40px;
}

.steps-action {
  margin-top: 24px;
}
</style>
