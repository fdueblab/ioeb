import {
  META_APP_NETWORK,
  META_APP_PORT,
  META_APP_VOLUME,
  createMetaAppRuntimeSpec
} from './runtime_spec'

export function buildMetaAppPrepublishPayload({
  values,
  verticalType,
  serviceIds,
  inputType,
  outputType,
  buildProduct,
  nickname
}) {
  const build = buildProduct && buildProduct.build
  const artifact = buildProduct && buildProduct.artifact
  if (!build || !build.buildId || !build.artifactId || !build.artifactHash || !artifact) {
    throw new Error('构建产物不完整，请返回重新构建')
  }
  const { name, subtitle, des, inputName, outputName, visualization, submitButtonText } = values
  return {
    ...values,
    domain: verticalType,
    type: 'meta',
    status: 'pre_release_unrated',
    network: META_APP_NETWORK,
    port: META_APP_PORT,
    volume: META_APP_VOLUME,
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学课题组',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '课题五',
      msIntroduce: `${nickname}构建的元应用。${des ? '应用描述：' + des : ''}`,
      companyScore: 5,
      msScore: 5
    },
    apiList: [{
      name,
      subtitle,
      des,
      inputName,
      outputName,
      outputVisualization: visualization,
      submitButtonText,
      isFake: false,
      url: '/api/agent/meta_app/run',
      method: 'sse',
      services: serviceIds,
      parameterType: inputType,
      responseType: outputType,
      simulationBuildId: build.buildId,
      metaAppArtifactId: build.artifactId,
      metaAppArtifactHash: build.artifactHash,
      metaAppArtifact: artifact,
      runMode: 'agent',
      runtimeSpec: createMetaAppRuntimeSpec()
    }],
    number: 0
  }
}
