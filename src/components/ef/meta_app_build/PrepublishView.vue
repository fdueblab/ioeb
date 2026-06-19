<template>
  <div class="wb-prepublish">
    <div class="wb-section-top">
      <div class="wb-left-title">
        <div class="wb-mark"><span></span><span></span><span></span><span></span></div>
        <span>{{ appName }}</span>
      </div>
    </div>
    <meta-app-publish-form
      :vertical-type="verticalType"
      :pre-name="appName"
      :pre-des="preDes"
      :pre-input-name="preInputName"
      :pre-output-name="preOutputName"
      :input-type="inputType"
      :output-type="outputType"
      :service-ids="serviceIds"
      @published="$emit('published')"
      @back="$emit('back')"
    />
  </div>
</template>

<script>
import MetaAppPublishForm from './MetaAppPublishForm.vue'

export default {
  name: 'PrepublishView',
  components: { MetaAppPublishForm },
  props: {
    appName: { type: String, default: '' },
    preDes: { type: String, default: '' },
    preInputName: { type: String, default: '输入内容' },
    preOutputName: { type: String, default: '输出内容' },
    inputType: { type: Number, default: 1 },
    outputType: { type: Number, default: 1 },
    verticalType: { type: String, required: true },
    serviceIds: { type: Array, default: () => [] }
  }
}
</script>

<style lang="less" scoped>
@import './simulation-workbench.less';

.wb-left-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 17px;
}

.wb-section-actions {
  display: flex;
  gap: 10px;
}
</style>
