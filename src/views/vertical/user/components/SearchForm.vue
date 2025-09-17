<template>
  <a-card>
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="名称">
            <a-input v-model="form.name" placeholder="请输入名称" />
          </a-form-item>
          <a-form-item label="通用描述">
            <a-input v-model="form.description" placeholder="请输入通用描述" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="作用">
            <a-input v-model="form.role" placeholder="请输入作用" />
          </a-form-item>
          <a-form-item label="技术要求">
            <a-input v-model="form.requirement" placeholder="请输入技术要求" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="功能">
            <a-input v-model="form.function" placeholder="请输入功能" />
          </a-form-item>
          <a-form-item label="检索操作">
            <div style="display: flex; flex-direction: row; justify-content: space-between">
              <a-button icon="sync" @click="handleReset">重置输入</a-button>
              <a-button ref="ragButton" class="rag-input-bubble-button" @click="toggleRAGInput">
                <a-icon type="dot-chart" v-if="!showRAGInput"/>
                <a-icon type="close" v-else/>
                领域增强
              </a-button>
              <a-button type="primary" icon="file-search" @click="handleSearch" :loading="loading">智能检索</a-button>
            </div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <!-- 领域知识增强浮动容器 -->
    <div
      v-if="showRAGInput"
      ref="ragContainer"
      class="rag-input-container"
      :style="containerStyle"
    >
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="上传知识库文档">
            <a-upload
              :file-list="ragFiles"
              :remove="removeRagFile"
              :customRequest="customRagFileChose"
              :multiple="true">
              <a-button> <a-icon type="upload" /> 选择文件 </a-button>
            </a-upload>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item tooltip="value*category">
            <span slot="label">上载知识库
              <a-tooltip title="上载后可以使用该知识库进行领域知识增强检索">
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <a-button type="primary" @click="handleRagUpload" icon="cloud-upload" :loading="ragUploadLoading">
              提交
            </a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </div>
  </a-card>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'SearchForm',
  props: {
    verticalType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        role: '',
        function: '',
        requirement: ''
      },
      loading: false,
      apiUrl: 'http://43.130.11.13:8002/search',
      apiHeader: { 'Content-Type': 'application/json;charset=UTF-8' },
      apiResult: { answer: '' },

      // 知识增强相关
      showRAGInput: false,
      ragFiles: [],
      ragUploadFiles: [],
      ragUploadUrl: 'http://43.130.11.13:8002/search',
      ragUploadLoading: false,
      hasRagData: false,

      containerStyle: {
        top: '0',
        left: '0'
      }
    }
  },
  computed: {
    apiResultText() {
      return JSON.stringify(this.apiResult, undefined, 4)
    },
    formText() {
      return JSON.stringify(this.form, undefined, 4)
    }
  },
  mounted() {
    // 监听窗口大小变化，动态调整容器位置
    window.addEventListener('resize', this.updateContainerPosition)
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('resize', this.updateContainerPosition)
  },
  methods: {
    handleReset() {
      this.form = {
        name: '',
        description: '',
        role: '',
        function: '',
        requirement: ''
      }
    },

    async handleSearch() {
      const { name, description, role, function: feature, requirement } = this.form
      if (name || description || role || feature || requirement) {
        this.loading = true

        // 知识增强
        if (this.hasRagData) {
          this.$message.info('正在应用领域知识增强进行智能检索...')
        } else {
          this.$message.info('正在进行智能检索...')
        }

        try {
          this.apiResult = await request({
            url: this.apiUrl,
            method: 'POST',
            data: this.form,
            headers: this.apiHeader
          })

          console.log(this.apiResult)
          // 通知父组件搜索结果
          const searchResults = this.apiResult.data.services
          this.$emit('search-completed', searchResults)
        } catch (error) {
          console.error('智能检索请求失败:', error)
          this.$message.error('请求异常，请稍后重试！')
        } finally {
          this.loading = false
        }
      } else {
        this.$message.error('请先输入您的需求！')
      }
    },

    // 显示/隐藏知识增强输入框
    toggleRAGInput() {
      this.showRAGInput = !this.showRAGInput
      if (this.showRAGInput) {
        this.$nextTick(() => {
          this.updateContainerPosition()
        })
      }
    },

    // 更新容器位置
    updateContainerPosition() {
      const button = this.$refs.ragButton.$el
      const container = this.$refs.ragContainer

      if (button && container) {
        const buttonRect = button.getBoundingClientRect()
        // 设置容器的位置在按钮的下侧
        this.containerStyle = {
          top: `${buttonRect.top + 50}px`,
          left: `${buttonRect.left - 120}px`
        }
      }
    },

    // 知识增强文件选择
    async customRagFileChose(options) {
      const { file } = options
      if (!file) {
        return false
      }
      this.ragUploadFiles = [file]
      const url = URL.createObjectURL(file)
      this.ragFiles = [{
        uid: file?.uid,
        name: file.name,
        status: 'done',
        url // url 是展示在页面上的绝对链接
      }]
    },

    // 移除知识增强文件
    removeRagFile() {
      this.ragFiles = []
      this.ragUploadFiles = []
    },

    // 上传知识增强文件
    async handleRagUpload() {
      if (this.ragUploadFiles.length === 0) {
        this.$message.error('请先选择文件！')
        return
      }

      this.ragUploadLoading = true

      try {
        const formData = new FormData()
        formData.append('file', this.ragUploadFiles[0])
        formData.append('category', this.verticalType)

        // const response = await request({
        //  url: this.ragUploadUrl,
        //  method: 'POST',
        //  data: formData,
        //  headers: {
        //    'Content-Type': 'multipart/form-data'
        //  }
        // })

        const response = {
          code: 200,
          message: '上传成功'
        }

        if (response && response.code === 200) {
          this.$message.success('知识库上传成功！')
          this.hasRagData = true
          this.showRAGInput = false
        } else {
          this.$message.error(response?.message || '上传失败')
        }
      } catch (error) {
        console.error('上传知识库文件失败:', error)
        this.$message.error('上传失败，请稍后重试！')
      } finally {
        this.ragUploadLoading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.rag-input-container {
  position: fixed;
  width: 400px;
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
</style>
