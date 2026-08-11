<template>
  <a-modal
    :visible="visible"
    :confirm-loading="loading"
    :width="520"
    title="更新策略配置"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" layout="vertical">
        <!-- 自动测试周期 -->
        <a-card size="small" :bordered="false" style="margin-bottom: 16px">
          <template slot="title">
            <a-icon type="calendar" style="margin-right: 8px" />
            自动测试周期
          </template>
          <a-form-item>
            <a-radio-group
              v-decorator="['autoTestPeriod', { initialValue: defaultPeriod }]"
              @change="handlePeriodChange"
            >
              <a-radio :style="radioStyle" :value="0">关闭自动测试</a-radio>
              <a-radio :style="radioStyle" :value="7">7天（推荐）</a-radio>
              <a-radio :style="radioStyle" :value="15">15天</a-radio>
              <a-radio :style="radioStyle" :value="30">30天</a-radio>
              <a-radio :style="radioStyle" :value="-1">
                自定义：
                <a-input-number
                  v-show="customPeriodVisible"
                  v-model="customPeriod"
                  :min="1"
                  :max="365"
                  style="width: 80px; margin-left: 8px"
                  @change="handleCustomPeriodChange"
                />
                天
              </a-radio>
            </a-radio-group>
          </a-form-item>
        </a-card>

        <!-- 更新策略 -->
        <a-card size="small" :bordered="false">
          <template slot="title">
            <a-icon type="sync" style="margin-right: 8px" />
            更新策略
          </template>
          <a-form-item>
            <a-radio-group
              v-decorator="['updateStrategyType', { initialValue: 'manual' }]"
            >
              <a-radio :style="radioStyle" value="manual">手动更新</a-radio>
              <a-radio :style="radioStyle" value="auto">自动更新（检测到新版本时）</a-radio>
              <a-radio :style="radioStyle" value="scheduled">
                定时更新：
                <a-date-picker
                  v-show="form.getFieldValue('updateStrategyType') === 'scheduled'"
                  v-decorator="['scheduledDate']"
                  style="width: 200px; margin-left: 8px"
                  placeholder="选择日期"
                />
              </a-radio>
            </a-radio-group>
          </a-form-item>
        </a-card>

        <!-- 提示信息 -->
        <a-alert
          type="info"
          show-icon
          style="margin-top: 16px"
        >
          <template slot="message">
            <span style="font-size: 13px">
              <a-icon type="bulb" style="margin-right: 4px" />
              提示：开启自动测试可确保服务持续稳定运行
            </span>
          </template>
        </a-alert>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { getUpdateStrategy, saveUpdateStrategy } from '@/api/updateStrategy'

export default {
  name: 'UpdateStrategyModal',
  data() {
    return {
      visible: false,
      loading: false,
      form: this.$form.createForm(this),
      currentService: null,
      defaultPeriod: 0,
      customPeriodVisible: false,
      customPeriod: 1,
      radioStyle: {
        display: 'block',
        height: '40px',
        lineHeight: '40px'
      }
    }
  },
  methods: {
    async open(service) {
      this.currentService = service
      this.visible = true
      this.loading = true

      try {
        const res = await getUpdateStrategy(service.id)
        if (res && res.status === 'success' && res.data) {
          // 设置表单值
          this.form.setFieldsValue({
            autoTestPeriod: res.data.autoTestPeriod || 0,
            updateStrategyType: res.data.updateStrategyType || 'manual',
            scheduledDate: res.data.scheduledDate ? this.$moment(res.data.scheduledDate) : null
          })
          this.defaultPeriod = res.data.autoTestPeriod || 0
        }
      } catch (e) {
        console.error('获取更新策略失败:', e)
      } finally {
        this.loading = false
      }
    },

    handlePeriodChange(e) {
      this.customPeriodVisible = e.target.value === -1
    },

    handleCustomPeriodChange(value) {
      this.customPeriod = value
    },

    handleOk() {
      this.form.validateFields(async (err, values) => {
        if (err) {
          return
        }

        this.loading = true
        try {
          const payload = {
            autoTestEnabled: values.autoTestPeriod !== 0,
            autoTestPeriod: values.autoTestPeriod === -1 ? this.customPeriod : values.autoTestPeriod,
            updateStrategyType: values.updateStrategyType,
            updateConfig: {}
          }

          if (values.updateStrategyType === 'scheduled' && values.scheduledDate) {
            payload.updateConfig.scheduledDate = values.scheduledDate.format('YYYY-MM-DD')
          }

          const res = await saveUpdateStrategy(this.currentService.id, payload)
          if (res && res.status === 'success') {
            this.$message.success('更新策略配置成功')
            this.$emit('saved', res.data)
            this.handleCancel()
          } else {
            this.$message.error((res && res.message) || '保存失败')
          }
        } catch (e) {
          this.$message.error('保存失败：' + ((e && e.message) || e))
        } finally {
          this.loading = false
        }
      })
    },

    handleCancel() {
      this.visible = false
      this.form.resetFields()
      this.currentService = null
      this.customPeriodVisible = false
      this.customPeriod = 1
    }
  }
}
</script>

<style scoped>
.ant-card {
  background: #fafafa;
}
</style>
