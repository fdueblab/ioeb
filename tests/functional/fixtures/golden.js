// 跨端契约锚点：与 Micro-Agent tests/fixtures/golden_meta_app_artifact.json 同一份。
// MA 为真源，本仓持相同副本作为消费方。勿手改 JSON 或下列常量：
// 任一端改动构建产物契约都会让三端 id/hash 断言失败，从而暴露漂移。
import goldenArtifact from './golden_meta_app_artifact.json'

export const GOLDEN_ARTIFACT_ID = 'app-37e3436d473b4479'
export const GOLDEN_ARTIFACT_HASH =
  '088f717621f73fbaf0d4a3accc661776633c8f5ef3042e2d48ec2e913607ad15'

export { goldenArtifact }
