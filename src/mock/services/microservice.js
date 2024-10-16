import Mock from 'mockjs2'
import { builder, getBody } from '../util'

const container = () => {
  return builder({
    'data': [
      {
        'key': 1,
        'Command': '/usr/local/bin/docker-entrypoint.sh eswrapper',
        'Created': 1588144319,
        'Id': 'c5e0e69431b92e8f94d0d755f024fe2beb3c8509e59f369ce31d11ce66eea12b',
        'Image': 'elasticsearch:6.5.0',
        'ImageID': 'sha256:ff171d17e77c2ebb566de46188d3eb2dc78deef60e6f58833fc29378011909f6',
        'Names': ['/es'],
        'Ports': [{ 'IP': '0.0.0.0', 'PrivatePort': 9200, 'PublicPort': 9200, 'Type': 'tcp' }, {
          'IP': '0.0.0.0',
          'PrivatePort': 9300,
          'PublicPort': 9300,
          'Type': 'tcp'
        }],
        'Labels': {
          'license': 'Elastic License',
          'org.label-schema.build-date': '20181006',
          'org.label-schema.license': 'GPLv2',
          'org.label-schema.name': 'elasticsearch',
          'org.label-schema.schema-version': '1.0',
          'org.label-schema.url': 'https://www.elastic.co/products/elasticsearch',
          'org.label-schema.vcs-url': 'https://github.com/elastic/elasticsearch-docker',
          'org.label-schema.vendor': 'Elastic',
          'org.label-schema.version': '6.5.0'
        },
        'Status': 'Up 31 hours',
        'HostConfig': { 'NetworkMode': 'default' },
        'NetworkSettings': {
          'Networks': {
            'bridge': {
              'IPAMConfig': null,
              'Links': null,
              'Aliases': null,
              'NetworkID': 'd81631e2c09c94e04f8927310c7332751d2143975ad844354f78b9ae296cfc04',
              'EndpointID': 'c92a8b5f5eb09269116c912268431d173b9d24fc925cb6888cb4bb5e6c80f75f',
              'Gateway': '172.17.0.1',
              'IPAddress': '172.17.0.2',
              'IPPrefixLen': 16,
              'IPv6Gateway': '',
              'GlobalIPv6Address': '',
              'GlobalIPv6PrefixLen': 0,
              'MacAddress': '02:42:ac:11:00:02'
            }
          }
        },
        'Ownership': 'Admin'
      },
      {
        'key': 2,
        'Command': 'java -Djava.security.egd=file:/dev/./urandom -jar /app.jar --spring.profiles.active=prod',
        'Created': 1587535458,
        'Id': '28225d3f1817a763a7f6ce6ed809d73aad33797948e159de06a66ee7a1f50f5d',
        'Image': 'microservice-infrastructure_inf-zuul',
        'ImageID': 'sha256:d769eab5746c99e203da6cce413d9ec984b4c9f6be14586d501d335509899aa7',
        'Names': ['/micro_zuul'],
        'Ports': [{ 'IP': '0.0.0.0', 'PrivatePort': 10001, 'PublicPort': 10001, 'Type': 'tcp' }],
        'Labels': {
          'com.docker.compose.config-hash': 'f677f49adc4ee2f572d6a871f332ad7801126096e03e8e0888b20fb3f6cbee92',
          'com.docker.compose.container-number': '1',
          'com.docker.compose.oneoff': 'False',
          'com.docker.compose.project': 'microservice-infrastructure',
          'com.docker.compose.project.config_files': 'docker-compose.yml',
          'com.docker.compose.project.working_dir': 'D:\\IdeaProjects\\microservice-infrastructure',
          'com.docker.compose.service': 'inf-zuul',
          'com.docker.compose.version': '1.25.4'
        },
        'Status': 'Up 31 hours',
        'HostConfig': { 'NetworkMode': 'microservice-infrastructure_micro_service' },
        'NetworkSettings': {
          'Networks': {
            'microservice-infrastructure_micro_service': {
              'IPAMConfig': null,
              'Links': null,
              'Aliases': null,
              'NetworkID': '4f6323773f24a779fd870c74532ff29cf12fb0df3eb17fc8ad47067c63da2f39',
              'EndpointID': '77a5097a84b0bc123d7de3dc5921228540542ef82fe15611f58fcd638acc901c',
              'Gateway': '172.20.0.1',
              'IPAddress': '172.20.0.3',
              'IPPrefixLen': 16,
              'IPv6Gateway': '',
              'GlobalIPv6Address': '',
              'GlobalIPv6PrefixLen': 0,
              'MacAddress': '02:42:ac:14:00:03'
            }
          }
        },
        'Ownership': 'Admin'
      },
      {
        'key': 3,
        'Command': 'java -Djava.security.egd=file:/dev/./urandom -jar /app.jar --spring.profiles.active=prod',
        'Created': 1587530460,
        'Id': 'e6cd0ab51f94a0c45d72a671caddc2a72178d2f7257c18c09109840ef7c81082',
        'Image': 'microservice-infrastructure_inf-eureka',
        'ImageID': 'sha256:40aa58aee2992829e48fd7e13a702055a106774e346bba7c5f6f48d2e61f8c08',
        'Names': ['/docker-compose-eureka'],
        'Ports': [{ 'IP': '0.0.0.0', 'PrivatePort': 8761, 'PublicPort': 8761, 'Type': 'tcp' }],
        'Labels': {
          'com.docker.compose.config-hash': 'b7335879a3b09e566d85a26530f3482fca28b1f4e5375904251dad25f1bc6e81',
          'com.docker.compose.container-number': '1',
          'com.docker.compose.oneoff': 'False',
          'com.docker.compose.project': 'microservice-infrastructure',
          'com.docker.compose.project.config_files': 'docker-compose.yml',
          'com.docker.compose.project.working_dir': 'D:\\IdeaProjects\\microservice-infrastructure',
          'com.docker.compose.service': 'inf-eureka',
          'com.docker.compose.version': '1.25.4'
        },
        'Status': 'Up 31 hours',
        'HostConfig': { 'NetworkMode': 'microservice-infrastructure_micro_service' },
        'NetworkSettings': {
          'Networks': {
            'microservice-infrastructure_micro_service': {
              'IPAMConfig': null,
              'Links': null,
              'Aliases': null,
              'NetworkID': '4f6323773f24a779fd870c74532ff29cf12fb0df3eb17fc8ad47067c63da2f39',
              'EndpointID': 'cc8653640e2edc949ed08c60d82cd1eff8adf39546aa2c0485c4706deb3acd3f',
              'Gateway': '172.20.0.1',
              'IPAddress': '172.20.0.2',
              'IPPrefixLen': 16,
              'IPv6Gateway': '',
              'GlobalIPv6Address': '',
              'GlobalIPv6PrefixLen': 0,
              'MacAddress': '02:42:ac:14:00:02'
            }
          }
        },
        'Ownership': 'Admin'
      }],
    'pageSize': 10,
    'pageNo': 0,
    'totalPage': 1,
    'totalCount': 5
  })
}

const jcontainer = () => {
  return builder(
    [
      {
        'Id': '28225d3f1817a763a7f6ce6ed809d73aad33797948e159de06a66ee7a1f50f5d',
        'Created': '2020-04-22T06:04:18.208645809Z',
        'Path': 'java',
        'Args': [
          '-Djava.security.egd=file:/dev/./urandom',
          '-jar',
          '/app.jar',
          '--spring.profiles.active=prod'
        ],
        'State': {
          'Status': 'running',
          'Running': true,
          'Paused': false,
          'Restarting': false,
          'OOMKilled': false,
          'Dead': false,
          'Pid': 1701,
          'ExitCode': 0,
          'Error': '',
          'StartedAt': '2020-05-26T00:52:20.323661865Z',
          'FinishedAt': '2020-05-26T00:52:19.170646865Z'
        },
        'Image': 'sha256:d769eab5746c99e203da6cce413d9ec984b4c9f6be14586d501d335509899aa7',
        'ResolvConfPath': '/var/lib/docker/containers/28225d3f1817a763a7f6ce6ed809d73aad33797948e159de06a66ee7a1f50f5d/resolv.conf',
        'HostnamePath': '/var/lib/docker/containers/28225d3f1817a763a7f6ce6ed809d73aad33797948e159de06a66ee7a1f50f5d/hostname',
        'HostsPath': '/var/lib/docker/containers/28225d3f1817a763a7f6ce6ed809d73aad33797948e159de06a66ee7a1f50f5d/hosts',
        'LogPath': '/var/lib/docker/containers/28225d3f1817a763a7f6ce6ed809d73aad33797948e159de06a66ee7a1f50f5d/28225d3f1817a763a7f6ce6ed809d73aad33797948e159de06a66ee7a1f50f5d-json.log',
        'Name': '/micro_zuul',
        'RestartCount': 0,
        'Driver': 'overlay2',
        'Platform': 'linux',
        'MountLabel': '',
        'ProcessLabel': '',
        'AppArmorProfile': '',
        'ExecIDs': null,
        'HostConfig': {
          'Binds': [
            '88177be219bc247176885ccd5b35db81b9f33f834755f8b803915f561a237c74:/tmp:rw'
          ],
          'ContainerIDFile': '',
          'LogConfig': {
            'Type': 'json-file',
            'Config': {}
          },
          'NetworkMode': 'microservice-infrastructure_micro_service',
          'PortBindings': {
            '10001/tcp': [
              {
                'HostIp': '',
                'HostPort': '10001'
              }
            ]
          },
          'RestartPolicy': {
            'Name': 'on-failure',
            'MaximumRetryCount': 0
          },
          'AutoRemove': false,
          'VolumeDriver': '',
          'VolumesFrom': [],
          'CapAdd': null,
          'CapDrop': null,
          'Capabilities': null,
          'Dns': [],
          'DnsOptions': [],
          'DnsSearch': [],
          'ExtraHosts': null,
          'GroupAdd': null,
          'IpcMode': 'shareable',
          'Cgroup': '',
          'Links': null,
          'OomScoreAdj': 0,
          'PidMode': '',
          'Privileged': false,
          'PublishAllPorts': false,
          'ReadonlyRootfs': false,
          'SecurityOpt': null,
          'UTSMode': '',
          'UsernsMode': '',
          'ShmSize': 67108864,
          'Runtime': 'runc',
          'ConsoleSize': [
            0,
            0
          ],
          'Isolation': '',
          'CpuShares': 0,
          'Memory': 0,
          'NanoCpus': 0,
          'CgroupParent': '',
          'BlkioWeight': 0,
          'BlkioWeightDevice': null,
          'BlkioDeviceReadBps': null,
          'BlkioDeviceWriteBps': null,
          'BlkioDeviceReadIOps': null,
          'BlkioDeviceWriteIOps': null,
          'CpuPeriod': 0,
          'CpuQuota': 0,
          'CpuRealtimePeriod': 0,
          'CpuRealtimeRuntime': 0,
          'CpusetCpus': '',
          'CpusetMems': '',
          'Devices': null,
          'DeviceCgroupRules': null,
          'DeviceRequests': null,
          'KernelMemory': 0,
          'KernelMemoryTCP': 0,
          'MemoryReservation': 0,
          'MemorySwap': 0,
          'MemorySwappiness': null,
          'OomKillDisable': false,
          'PidsLimit': null,
          'Ulimits': null,
          'CpuCount': 0,
          'CpuPercent': 0,
          'IOMaximumIOps': 0,
          'IOMaximumBandwidth': 0,
          'MaskedPaths': [
            '/proc/asound',
            '/proc/acpi',
            '/proc/kcore',
            '/proc/keys',
            '/proc/latency_stats',
            '/proc/timer_list',
            '/proc/timer_stats',
            '/proc/sched_debug',
            '/proc/scsi',
            '/sys/firmware'
          ],
          'ReadonlyPaths': [
            '/proc/bus',
            '/proc/fs',
            '/proc/irq',
            '/proc/sys',
            '/proc/sysrq-trigger'
          ]
        },
        'GraphDriver': {
          'Data': {
            'LowerDir': '/var/lib/docker/overlay2/38149a4475a9def86ed0bc04fd28d87e5599f83f9848596be174c91425dbb33a-init/diff:/var/lib/docker/overlay2/8f5b5d2e9972579b3325aeccf809f90c5511264ecf15a12756332d8cafca0974/diff:/var/lib/docker/overlay2/8a30b08db92e59aa646f9d5a8256fed489967b6c75368476c3278d7dd9f3a659/diff:/var/lib/docker/overlay2/c33fab8746f5afd0a4081f85fab57b7c30c9ff5d631b8f81e5b9016078a762e3/diff:/var/lib/docker/overlay2/01858a484aa51500ff87821dcbcaef9220ea707456edee331f21fe8081099707/diff:/var/lib/docker/overlay2/4664fdcb9fb080d325f89d59247ae74e95108a22cc696b8e98c0b540e11f6b42/diff:/var/lib/docker/overlay2/625d20c6d8425bd2bb7b667695bfafed4f93969f32f1074e05fee1458b75c6a6/diff:/var/lib/docker/overlay2/7e7e04652a0d1069cb01876dceb8427031a78f2bcc80fda619291e56fe6243ff/diff:/var/lib/docker/overlay2/acd3d569a88024bc9f14b5f7572bc11f10c1a6813fc680beeb75abe9aa06b9c8/diff',
            'MergedDir': '/var/lib/docker/overlay2/38149a4475a9def86ed0bc04fd28d87e5599f83f9848596be174c91425dbb33a/merged',
            'UpperDir': '/var/lib/docker/overlay2/38149a4475a9def86ed0bc04fd28d87e5599f83f9848596be174c91425dbb33a/diff',
            'WorkDir': '/var/lib/docker/overlay2/38149a4475a9def86ed0bc04fd28d87e5599f83f9848596be174c91425dbb33a/work'
          },
          'Name': 'overlay2'
        },
        'Mounts': [
          {
            'Type': 'volume',
            'Name': '88177be219bc247176885ccd5b35db81b9f33f834755f8b803915f561a237c74',
            'Source': '/var/lib/docker/volumes/88177be219bc247176885ccd5b35db81b9f33f834755f8b803915f561a237c74/_data',
            'Destination': '/tmp',
            'Driver': 'local',
            'Mode': 'rw',
            'RW': true,
            'Propagation': ''
          }
        ],
        'Config': {
          'Hostname': 'inf-zuul',
          'Domainname': '',
          'User': '',
          'AttachStdin': false,
          'AttachStdout': false,
          'AttachStderr': false,
          'ExposedPorts': {
            '10001/tcp': {}
          },
          'Tty': false,
          'OpenStdin': false,
          'StdinOnce': false,
          'Env': [
            'affinity:container==8ff65f727439e1eb6f8ffeac1fe47c5e1a224488ac0a7d73bded0dc8aebd7db1',
            'PATH=/usr/local/openjdk-8/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            'LANG=C.UTF-8',
            'JAVA_HOME=/usr/local/openjdk-8',
            'JAVA_VERSION=8u252',
            'JAVA_BASE_URL=https://github.com/AdoptOpenJDK/openjdk8-upstream-binaries/releases/download/jdk8u252-b09/OpenJDK8U-jdk_',
            'JAVA_URL_VERSION=8u252b09'
          ],
          'Cmd': null,
          'Image': 'microservice-infrastructure_inf-zuul',
          'Volumes': {
            '/tmp': {}
          },
          'WorkingDir': '',
          'Entrypoint': [
            'java',
            '-Djava.security.egd=file:/dev/./urandom',
            '-jar',
            '/app.jar',
            '--spring.profiles.active=prod'
          ],
          'OnBuild': null,
          'Labels': {
            'com.docker.compose.config-hash': 'f677f49adc4ee2f572d6a871f332ad7801126096e03e8e0888b20fb3f6cbee92',
            'com.docker.compose.container-number': '1',
            'com.docker.compose.oneoff': 'False',
            'com.docker.compose.project': 'microservice-infrastructure',
            'com.docker.compose.project.config_files': 'docker-compose.yml',
            'com.docker.compose.project.working_dir': 'D:\\IdeaProjects\\microservice-infrastructure',
            'com.docker.compose.service': 'inf-zuul',
            'com.docker.compose.version': '1.25.4'
          }
        },
        'NetworkSettings': {
          'Bridge': '',
          'SandboxID': '30dfb9c7ec6da8336a6b4856969d5515c61719320515472334d92f6df412460e',
          'HairpinMode': false,
          'LinkLocalIPv6Address': '',
          'LinkLocalIPv6PrefixLen': 0,
          'Ports': {
            '10001/tcp': [
              {
                'HostIp': '0.0.0.0',
                'HostPort': '10001'
              }
            ]
          },
          'SandboxKey': '/var/run/docker/netns/30dfb9c7ec6d',
          'SecondaryIPAddresses': null,
          'SecondaryIPv6Addresses': null,
          'EndpointID': '',
          'Gateway': '',
          'GlobalIPv6Address': '',
          'GlobalIPv6PrefixLen': 0,
          'IPAddress': '',
          'IPPrefixLen': 0,
          'IPv6Gateway': '',
          'MacAddress': '',
          'Networks': {
            'microservice-infrastructure_micro_service': {
              'IPAMConfig': null,
              'Links': null,
              'Aliases': [
                '28225d3f1817',
                'inf-zuul'
              ],
              'NetworkID': '4f6323773f24a779fd870c74532ff29cf12fb0df3eb17fc8ad47067c63da2f39',
              'EndpointID': '8ef9af1604228868fb4bd1f7e033f7886eea2914c4f468f2860be62b867e67b5',
              'Gateway': '172.20.0.1',
              'IPAddress': '172.20.0.2',
              'IPPrefixLen': 16,
              'IPv6Gateway': '',
              'GlobalIPv6Address': '',
              'GlobalIPv6PrefixLen': 0,
              'MacAddress': '02:42:ac:14:00:02',
              'DriverOpts': null
            }
          }
        }
      }
    ]
  )
}

Mock.mock(/\/docker\/jcontainer/, 'get', jcontainer)
