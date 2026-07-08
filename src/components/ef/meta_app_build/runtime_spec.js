export const META_APP_NETWORK = 'ioeb_app-network'
export const META_APP_PORT = '0.0.0.0:1021/TCP → 0.0.0.0:10021'
export const META_APP_VOLUME = '/var/opt/gitlab/mnt/user → /appdata/aml/metaApp'

export function createMetaAppRuntimeSpec() {
  return {
    mode: 'shared_agent',
    docker: {
      image: 'fdueblab/meta-app-agent:latest',
      containerName: 'meta-app-{serviceId}',
      restartPolicy: 'unless-stopped'
    },
    network: META_APP_NETWORK,
    ports: [{
      protocol: 'tcp',
      containerPort: 1021,
      hostIp: '0.0.0.0',
      hostPort: 10021
    }],
    volumes: [{
      source: '/var/opt/gitlab/mnt/user',
      target: '/appdata/aml/metaApp',
      mode: 'rw'
    }]
  }
}

export function metaAppRuntimeDisplay() {
  return [
    { label: '运行方式', value: '共享 MA Runtime' },
    { label: 'Docker 镜像', value: 'fdueblab/meta-app-agent:latest' },
    { label: 'Network', value: META_APP_NETWORK },
    { label: 'Port', value: META_APP_PORT },
    { label: 'Volume', value: META_APP_VOLUME }
  ]
}
