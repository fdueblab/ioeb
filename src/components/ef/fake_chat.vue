<template>
  <div class="preview-container">
    <!-- 应用预览区域 -->
    <div class="app-preview" ref="appPreview">
      <!-- 初始状态：显示提示文字 -->
      <div v-if="!showPreviewImage" class="preview-placeholder">
        元应用预览区域
      </div>
      <!-- 构建后：显示图片 -->
      <img
        v-if="showPreviewImage"
        src="@/assets/app-preview.png"
        alt="应用预览"
        class="preview-image"
      />
    </div>
    <!-- 输入框区域 -->
    <div class="chat-input">
      <a-input-search
        style="width: 100%"
        v-model="userInput"
        @search="handleUserInput"
        placeholder="请输入您对应用的需求"
        :disabled="!isInputEnabled"
      >
        <template #enterButton>
          <a-button type="primary" icon="deployment-unit" :loading="isInputLoading">智能构建</a-button>
        </template>
      </a-input-search>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FakeChat',
  props: {
    serviceType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      userInput: '',
      isInputEnabled: true,
      isInputLoading: false,
      showPreviewImage: false // 控制是否显示图片
    }
  },
  methods: {
    handleUserInput() {
      this.isInputLoading = true
      this.isInputEnabled = false
      this.$emit('update-services', this.getUpdatedServices())
      this.$emit('update-flow', this.getUpdatedFlow())
      this.$message.info('正在构建中，请稍候...')
      // 模拟处理用户输入的逻辑
      setTimeout(() => {
        this.isInputLoading = false
        this.isInputEnabled = true
        this.showPreviewImage = true
        this.$message.success('构建完成！')
      }, 1600) // 模拟异步操作
    },
    getUpdatedServices() {
      if (this.serviceType === 'aircraft') {
        return [
          {
            id: '3',
            type: 'group',
            name: '低空飞行AI监控服务',
            open: true,
            children: [
              {
                id: '100',
                type: 'group',
                name: '目标识别微服务',
                open: true,
                children: [{
                  id: '1001',
                  type: 'getTargetLocation',
                  name: 'getTargetLocation',
                  ico: 'el-icon-location-information',
                  style: {}
                }, {
                  id: '1002',
                  type: 'getTargetInfo',
                  name: 'getTargetInfo',
                  ico: 'el-icon-user',
                  style: {}
                }]
              },
              {
                id: '101',
                type: 'group',
                name: '远程控制微服务',
                open: true,
                children: [{
                  id: '1101',
                  type: 'setTargetLocation',
                  name: 'setTargetLocation',
                  ico: 'el-icon-add-location',
                  style: {}
                }, {
                  id: '1102',
                  type: 'setMotionMode',
                  name: 'setMotionMode',
                  ico: 'el-icon-rank',
                  style: {}
                }]
              }
            ]
          }
        ]
      } else {
        return [
          {
            id: '9',
            type: 'group',
            name: '跨境支付AI监测服务',
            open: true,
            children: [
              {
                id: '90',
                type: 'group',
                name: '异常识别微服务',
                open: true,
                children: [
                  {
                    id: '9002',
                    type: 'preprocess',
                    name: 'preprocess',
                    ico: 'el-icon-c-scale-to-original',
                    style: {}
                  },
                  {
                    id: '9005',
                    type: 'predict',
                    name: 'predict',
                    ico: 'el-icon-data-line',
                    style: {}
                  },
                  {
                    id: '9006',
                    type: 'visualize',
                    name: 'visualize',
                    ico: 'el-icon-pie-chart',
                    style: {}
                  }
                ]
              },
              {
                id: '94',
                type: 'group',
                name: '报告生成微服务',
                open: true,
                children: [{
                  id: '9401',
                  type: 'generateReport',
                  name: 'generateReport',
                  ico: 'el-icon-document-add',
                  style: {}
                }, {
                  id: '9402',
                  type: 'sendReport',
                  name: 'sendReport',
                  ico: 'el-icon-upload',
                  style: {}
                }]
              }
            ]
          }
        ]
      }
    },
    getUpdatedFlow() {
      if (this.serviceType === 'aircraft') {
        return {
          name: 'AI监控流程',
          nodeList: [
            {
              id: '10000',
              name: 'metaAppAgent',
              type: 'start',
              url: 'ms.kxyun.net/agent',
              left: '200px',
              top: '0',
              ico: 'el-icon-cpu',
              input: 'csv File',
              output: 'json',
              version: '1.0',
              state: 'success'
            },
            {
              id: '10001',
              name: 'getTargetLocation',
              type: 'process',
              url: 'ms.kxyun.net/getTargetLocation',
              left: '0',
              top: '140px',
              ico: 'el-icon-location-information',
              state: 'success',
              input: 'csv File',
              output: 'json',
              version: '1.0'
            },
            {
              id: '10002',
              name: 'getTargetInfo',
              type: 'process',
              url: 'ms.kxyun.net/getTargetInfo',
              left: '200px',
              top: '300px',
              ico: 'el-icon-user',
              state: 'success',
              input: 'json',
              output: 'json',
              version: '1.0'
            },
            {
              id: '10101',
              name: 'setMotionMode',
              type: 'end',
              url: 'ms.kxyun.net/setMotionMode',
              left: '400px',
              top: '160px',
              ico: 'el-icon-rank',
              state: 'warning',
              input: 'json',
              output: 'json',
              version: '1.0'
            }
          ],
          lineList: [
            { from: '10000', to: '10001' },
            { from: '10001', to: '10000' },
            { from: '10000', to: '10002' },
            { from: '10002', to: '10000' },
            { from: '10000', to: '10101' }
          ]
        }
      }
      return {
        name: 'AI推荐流程',
        nodeList: [
          {
            id: '10000',
            name: 'metaAppAgent',
            type: 'start',
            url: 'ms.kxyun.net/agent',
            left: '200px',
            top: '0',
            ico: 'el-icon-cpu',
            input: 'csv File',
            output: 'json',
            version: '1.0',
            state: 'success'
          },
          {
            id: '9000',
            name: 'preprocess',
            type: 'process',
            url: 'ms.kxyun.net/preprocess',
            left: '0',
            top: '140px',
            ico: 'el-icon-c-scale-to-original',
            input: 'csv File',
            output: 'json',
            version: '1.0',
            state: 'success'
          },
          {
            id: '9001',
            name: 'predict',
            type: 'process',
            url: 'ms.kxyun.net/evaluate',
            left: '0',
            top: '380px',
            ico: 'el-icon-s-data',
            state: 'success',
            input: 'json',
            output: 'vector',
            version: '1.1'
          },
          {
            id: '9002',
            name: 'visualize',
            type: 'process',
            url: 'ms.kxyun.net/visualize',
            left: '200px',
            top: '250px',
            ico: 'el-icon-pie-chart',
            state: 'warning',
            input: 'vector',
            output: 'image',
            version: '1.2'
          },
          {
            id: '9101',
            name: 'generateReport',
            type: 'process',
            url: 'ms.kxyun.net/generateReport',
            left: '420px',
            top: '140px',
            ico: 'el-icon-document-add',
            state: 'success',
            input: 'image',
            output: 'pdf',
            version: '1.0'
          },
          {
            id: '9102',
            name: 'sendReport',
            type: 'end',
            url: 'ms.kxyun.net/sendReport',
            left: '400px',
            top: '360px',
            ico: 'el-icon-upload',
            state: 'error',
            input: 'pdf',
            output: '',
            version: '0.8'
          }
        ],
        lineList: [
          { from: '10000', to: '9000' },
          { from: '9000', to: '9001' },
          { from: '9001', to: '10000' },
          { from: '10000', to: '9002' },
          { from: '9002', to: '10000' },
          { from: '10000', to: '9101' },
          { from: '9101', to: '9102' }
        ]
      }
    }
  }
}
</script>

<style scoped>
.preview-container {
  display: flex;
  flex-direction: column;
  width: 35vw;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.app-preview {
  flex: 1;
  background-color: #f9f9f9;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  aspect-ratio: 9 / 16; /* 设置宽高比为 9:16 */
}

/* 初始状态：提示文字样式 */
.preview-placeholder {
  font-size: 1.2em;
  color: #666;
  text-align: center;
  user-select: none;
}

/* 构建后：图片样式 */
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片占满整个区域 */
  border-radius: 8px;
}

.chat-input {
  display: flex;
  padding: 16px;
  background-color: #fff;
  border-top: 1px solid #ccc;
}
</style>
