<template>
  <meta-app-prepublish-materials-panel :artifact="artifact" :product="product" />
</template>

<script>
import MetaAppPrepublishMaterialsPanel from './MetaAppPrepublishMaterialsPanel.vue'

export default {
  name: 'MetaAppConfigDetail',
  components: { MetaAppPrepublishMaterialsPanel },
  props: {
    artifact: {
      type: Object,
      default: null
    },
    product: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>
