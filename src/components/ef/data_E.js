var data_E = {
    name: '前沿装备远程体验-服务架构推荐示例',
    nodeList: [
      {
        id: 'user',
        name: '人机交互界面',
        type: 'task',
        left: '432px',
        top: '185px',
        ico: 'user',
        state: 'success'
      },
      {
        id: 'device-control',
        name: '设备控制',
        type: 'task',
        left: '163px',
        top: '331px',//365
        ico: 'el-icon-user-solid',
        state: 'success'
      },
      {
        id: 'device-status',
        name: '设备状态',
        type: 'task',
        left: '432px',
        top: '472px',
        ico: 'el-icon-user-solid',
        state: 'success'
      },
      {
        id: 'video-service',
        name: '视频直播',
        type: 'task',
        left: '867px',
        top: '388px',
        ico: 'el-icon-user-solid',
        state: 'success'
      }, {
        id: 'operate-edit',
        name: '操作编辑',
        type: 'task',
        left: '163px',
        top: '180px',
        ico: 'el-icon-user-solid',
        state: 'success'
      }, {
        id: 'performance-evaluation',
        name: '操作评价',
        type: 'task',
        left: '816px',
        top: '180px',
        ico: 'el-icon-user-solid',
        state: 'success'
      },
      {
        id: 'video-analysis',
        type: 'task',
        name: '视频分析',
        left: '532px',
        top: '320px',
        ico: 'el-icon-goods',
        state: 'error'
      },
      {
        id: 'device',
        name: '前沿装备',
        type: 'task',
        left: '316px',
        top: '576px',
        ico: 'el-icon-present',
        state: 'warning'
      }, {
        id: 'camera',
        name: '摄像设备',
        type: 'task',
        left: '728px',
        top: '556px',
        ico: 'el-icon-present',
        state: 'running'
      }
    ],
    lineList: [{
      from: 'device',
      to: 'device-control',
      //label: '条件A'
    }, {
      from: 'device',
      to: 'device-status',
      //label: '条件B'
    }, {
      from: 'camera',
      to: 'video-service'
    }, {
      from: 'device-control',
      to: 'user'
    },
      {
        from: 'video-service',
        to: 'user'
      },
      {
        from: 'device-status',
        to: 'user'
      },
      {
        from: 'video-analysis',
        to: 'user'
      },
      {
        from: 'operate-edit',
        to: 'user'
      },
      {
        from: 'performance-evaluation',
        to: 'user'
      },
      {
        from: 'device-status',
        to: 'video-analysis'
      },
      {
        from: 'video-service',
        to: 'video-analysis'
      },
      {
        from: 'device-control',
        to: 'operate-edit'
      }
    ]
  }
  
  export function getDataE() {
    return data_E
  }
  