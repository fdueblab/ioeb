<template>
  <meta-app-artifact-panel variant="workbench" :artifact="artifact" />
</template>

<script>
import MetaAppArtifactPanel from './MetaAppArtifactPanel.vue'

export default {
  name: 'MetaAppConfigDetail',
  components: { MetaAppArtifactPanel },
  props: {
    artifact: {
      type: Object,
      default: null
    }
  }
}
</script>
