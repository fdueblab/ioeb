<template>
  <a-modal
    :visible="visible"
    :confirm-loading="loading"
    :width="520"
    title="发布对外销售"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" layout="vertical">
        <a-alert
          type="info"
          show-icon
          style="margin-bottom: 16px"
        >
          <template slot="message">
            <span>成果名称：<strong>{{ currentService ? currentService.name : '' }}</strong></span>
          </template>
        </a-alert>

        <a-form-item label="销售价格（元）">
          <a-input-number
            v-decorator="[
              'price',
              {
                rules: [
                  { required: true, message: '请输入销售价格' },
                  { type: 'number', min: 0, message: '价格不能小于0' }
                ],
                initialValue: initialPrice
              }
            ]"
            :min="0"
            :precision="2"
            placeholder="请输入销售价格"
            style="width: 100%"
          />
        </a-form-item>

        <a-form-item label="销售说明">
          <a-textarea
            v-decorator="[
              'description',
              {
                rules: [{ max: 500, message: '销售说明最多500个字符' }],
                initialValue: initialDescription
              }
            ]"
            placeholder="请输入销售说明（选填）"
            :rows="4"
            :max-length="500"
          />
        </a-form-item>

        <a-alert
          type="warning"
          show-icon
        >
          <template slot="message">
            <span style="font-size: 13px">
              <a-icon type="exclamation-circle" style="margin-right: 4px" />
              发布后，其他用户将能看到此成果并购买使用
            </span>
          </template>
        </a-alert>
      </a-form>
    </a-spin>

    <template slot="footer">
      <a-button
        v-if="isPublished"
        type="danger"
        :loading="stopLoading"
        @click="handleStopSale"
      >
        停止销售
      </a-button>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="loading" @click="handleOk">
        {{ isPublished ? '保存修改' : '确认发布' }}
      </a-button>
    </template>
  </a-modal>
</template>

<script>
import { publishSale, unpublishSale } from '@/api/service'

export default {
  name: 'SalePublishModal',
  data() {
    return {
      visible: false,
      loading: false,
      stopLoading: false,
      form: this.$form.createForm(this),
      currentService: null,
      initialPrice: null,
      initialDescription: '',
      isPublished: false
    }
  },
  methods: {
    open(service) {
      this.currentService = service
      this.visible = true
      this.form.resetFields()

      // 设置初始值
      this.initialPrice = service.salePrice || null
      this.initialDescription = service.saleDescription || ''
      this.isPublished = service.isForSale || false

      // 等待下一个 DOM 更新后设置表单值
      this.$nextTick(() => {
        this.form.setFieldsValue({
          price: this.initialPrice,
          description: this.initialDescription
        })
      })
    },

    handleOk() {
      this.form.validateFields(async (err, values) => {
        if (err) {
          return
        }

        this.loading = true
        try {
          const payload = {
            price: values.price,
            description: values.description || ''
          }

          const res = await publishSale(this.currentService.id, payload)
          if (res && res.status === 'success') {
            this.$emit('published', this.currentService.id, 'publish')
            this.handleCancel()
          } else {
            this.$message.error((res && res.message) || '发布失败')
          }
        } catch (e) {
          this.$message.error('发布失败：' + ((e && e.message) || e))
        } finally {
          this.loading = false
        }
      })
    },

    async handleStopSale() {
      this.stopLoading = true
      try {
        const res = await unpublishSale(this.currentService.id)
        if (res && res.status === 'success') {
          this.$emit('published', this.currentService.id, 'unpublish')
          this.handleCancel()
        } else {
          this.$message.error((res && res.message) || '停止销售失败')
        }
      } catch (e) {
        this.$message.error('停止销售失败：' + ((e && e.message) || e))
      } finally {
        this.stopLoading = false
      }
    },

    handleCancel() {
      this.visible = false
      this.form.resetFields()
      this.currentService = null
      this.initialPrice = null
      this.initialDescription = ''
      this.isPublished = false
    }
  }
}
</script>
