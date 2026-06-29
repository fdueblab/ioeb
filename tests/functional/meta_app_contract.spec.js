import { buildMetaAppPrepublishPayload } from '@/components/ef/meta_app_build/prepublish_payload'
import {
  META_APP_NETWORK,
  META_APP_PORT,
  META_APP_VOLUME
} from '@/components/ef/meta_app_build/runtime_spec'
import UseMetaApp from '@/views/vertical/user/useMetaApp.vue'
import { streamAgent } from '@/utils/request'
import {
  GOLDEN_ARTIFACT_HASH,
  GOLDEN_ARTIFACT_ID,
  goldenArtifact as artifact
} from './fixtures/golden'

jest.mock('@/utils/request', () => ({
  streamAgent: jest.fn(() => Promise.resolve())
}))

test('prepublish payload carries artifact, runtime contract and stable display fields', () => {
  const payload = buildMetaAppPrepublishPayload({
    values: {
      name: 'Functional App',
      subtitle: '',
      des: 'test',
      inputName: 'input',
      outputName: 'output',
      visualization: false,
      submitButtonText: 'run'
    },
    verticalType: 'health',
    serviceIds: ['mcp-1'],
    inputType: 1,
    outputType: 1,
    buildProduct: {
      build: {
        buildId: 'build-functional',
        artifactId: GOLDEN_ARTIFACT_ID,
        artifactHash: GOLDEN_ARTIFACT_HASH
      },
      artifact
    },
    nickname: 'tester'
  })

  expect(payload.network).toBe(META_APP_NETWORK)
  expect(payload.port).toBe(META_APP_PORT)
  expect(payload.volume).toBe(META_APP_VOLUME)
  expect(payload.status).toBeUndefined()
  expect(payload.apiList[0]).toMatchObject({
    simulationBuildId: 'build-functional',
    metaAppArtifactId: GOLDEN_ARTIFACT_ID,
    metaAppArtifactHash: GOLDEN_ARTIFACT_HASH,
    metaAppArtifact: artifact,
    runMode: 'agent'
  })
  expect(payload.apiList[0].runtimeSpec.docker.image).toBe('fdueblab/meta-app-agent:latest')
})

test('business run sends only message and meta_app_id', async () => {
  const context = {
    apiList: [{ parameterType: 1 }],
    code: 'hello',
    metaAppId: 'meta-1',
    isStreaming: false,
    isCompleted: false,
    progressSteps: 0,
    sseLogs: '',
    showLogs: false,
    appendSseEvent: jest.fn(),
    renderMarkdown: jest.fn((value) => value),
    $message: { error: jest.fn() }
  }

  await UseMetaApp.methods.onRequestSend.call(context)

  expect(context.$message.error).not.toHaveBeenCalled()
  expect(streamAgent).toHaveBeenCalledTimes(1)
  const formData = streamAgent.mock.calls[0][1]
  expect(formData.get('message')).toBe('hello')
  expect(formData.get('meta_app_id')).toBe('meta-1')
  expect(formData.get('app_config')).toBeNull()
})
