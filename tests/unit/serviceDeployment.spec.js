import { waitForServiceDeployment } from '@/utils/serviceDeployment'

const noWait = () => Promise.resolve()

describe('waitForServiceDeployment', () => {
  test('waits until the backend reports a deploy success state', async () => {
    const fetchService = jest.fn()
      .mockResolvedValueOnce({ service: { id: 'service-1', status: 'deploying' } })
      .mockResolvedValueOnce({ service: { id: 'service-1', status: 'pre_release_unrated' } })
    const statuses = []

    const service = await waitForServiceDeployment(fetchService, {
      sleep: noWait,
      onStatus: status => statuses.push(status)
    })

    expect(service.status).toBe('pre_release_unrated')
    expect(fetchService).toHaveBeenCalledTimes(2)
    expect(statuses).toEqual(['deploying', 'pre_release_unrated'])
  })

  test('rejects when the backend reports deployment error', async () => {
    await expect(waitForServiceDeployment(
      () => Promise.resolve({ service: { id: 'service-1', status: 'error' } }),
      { sleep: noWait }
    )).rejects.toThrow('MCP 端点启动失败')
  })

  test('tolerates a transient status request failure', async () => {
    const fetchService = jest.fn()
      .mockRejectedValueOnce(new Error('temporary network error'))
      .mockResolvedValueOnce({ service: { id: 'service-1', status: 'released' } })

    const service = await waitForServiceDeployment(fetchService, { sleep: noWait })

    expect(service.status).toBe('released')
  })
})
