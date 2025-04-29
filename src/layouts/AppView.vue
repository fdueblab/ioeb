<template>
  <page-header-wrapper>
    <template v-slot:tags>
      <a-tag color="blue">Running</a-tag>
    </template>
    <template v-slot:extra>
      <a-button key="3" type="link" icon="download" :loading="codeLoading" @click="handleDownloadCode">APP代码下载</a-button>
      <a-button key="2" icon="download" :loading="appLoading" @click="handleDownloadApp">获取可安装APP</a-button>
    </template>
    <router-view />
  </page-header-wrapper>
</template>

<script>
export default {
  name: 'AppView',
  data() {
    return {
      codeLoading: false,
      appLoading: false
    }
  },
  methods: {
    // 模拟数据库查询
    async queryDownloadPath(appCode, type) {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (type === 'code' && appCode === 'amlMonitor') {
            // 模拟amlMonitor的源码下载
            resolve('/fake_code.zip')
          } else {
            resolve(null)
          }
        }, 1000)
      })
    },

    // 下载文件
    downloadFile(url, filename) {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    async handleDownloadCode() {
      const appCode = this.$route.meta.appCode
      if (!appCode) {
        this.$message.warning('未找到应用代码')
        return
      }

      this.codeLoading = true
      try {
        const downloadPath = await this.queryDownloadPath(appCode, 'code')
        if (downloadPath) {
          this.downloadFile(downloadPath, `${appCode}_source_code.zip`)
        } else {
          this.$message.warning('此应用暂未提供可下载源码')
        }
      } finally {
        this.codeLoading = false
      }
    },

    async handleDownloadApp() {
      const appCode = this.$route.meta.appCode
      if (!appCode) {
        this.$message.warning('未找到应用代码')
        return
      }

      this.appLoading = true
      try {
        const downloadPath = await this.queryDownloadPath(appCode, 'app')
        if (downloadPath) {
          this.downloadFile(downloadPath, `${appCode}_app.apk`)
        } else {
          this.$message.warning('此应用暂未提供可安装APP')
        }
      } finally {
        this.appLoading = false
      }
    }
  }
}
</script>
