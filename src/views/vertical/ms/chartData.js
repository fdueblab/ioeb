// 各垂直领域的模拟图表数据
export const domainMockData = {
  'aml': {
    checkFile: 'abnormal_recognition.py',
    nodes: [
      { id: '9001', x: 0, y: 150, label: 'datasets', size: 50, input: 'rawData', output: 'processedData', environment: '', process: '', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'formdata' },
      { id: '9002', x: 150, y: 150, label: 'preprocess', size: 50, input: 'processedData', output: 'cleanedData', environment: '', process: '', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'formdata' },
      { id: '9003', x: 300, y: 150, label: 'train', size: 50, input: 'cleanedData', output: 'trainedModel', environment: '', process: '', apiType: 'graphql', methodType: 'post', inputType: 'formdata', outputType: 'formdata' },
      { id: '9004', x: 450, y: 50, label: 'predict', size: 50, input: 'trainedModel', output: 'predictionResult', environment: '', process: '', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'string' },
      { id: '9005', x: 450, y: 150, label: 'evaluate', size: 50, input: 'trainedModel', output: 'evaluationMetrics', environment: '', process: '', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'string' },
      { id: '9006', x: 450, y: 250, label: 'visualize', size: 50, input: 'trainedModel', output: 'visualization', environment: '', process: '', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'json' },
      { id: '9007', x: 300, y: 250, label: 'models', size: 50, input: 'trainedModel', output: 'modelMetadata', environment: '', process: '', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'string' }
    ],
    edges: [
      { sourceID: '9001', targetID: '9002' }, // datasets → preprocess
      { sourceID: '9002', targetID: '9003' }, // preprocess → train
      { sourceID: '9003', targetID: '9004' }, // train → predict
      { sourceID: '9003', targetID: '9005' }, // train → evaluate
      { sourceID: '9003', targetID: '9006' }, // train → visualize
      { sourceID: '9003', targetID: '9007' }, // train → models
      { sourceID: '9007', targetID: '9004' }, // models → predict
      { sourceID: '9007', targetID: '9005' }, // models → evaluate
      { sourceID: '9007', targetID: '9006' } // models → visualize
    ]
  },
  'aircraft': {
    checkFile: null,
    nodes: [
      { id: '1000', x: 200, y: 50, label: 'getTargetFeature', size: 50, color: '#F6BD16', input: 'imageData', output: 'targetFeature', environment: '', process: '', apiType: 'graphql', methodType: 'get', inputType: 'formdata', outputType: 'string' },
      { id: '1001', x: 50, y: 200, label: 'getTargetLocation', size: 50, color: '#5B8FF9', input: 'gpsCoordinates', output: 'targetLocation', environment: '', process: '', apiType: 'graphql', methodType: 'get', inputType: 'formdata', outputType: 'string' },
      { id: '1002', x: 200, y: 150, label: 'getTargetInfo', size: 50, color: '#5AD8A6', input: 'targetFeature, targetLocation', output: 'targetInfo', environment: '', process: '', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'string' },
      { id: '1003', x: 350, y: 200, label: 'getTargetType', size: 50, color: '#5D7092', input: 'targetInfo', output: 'targetType', environment: '', process: '', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'string' }
    ],
    edges: [
      { sourceID: '1000', targetID: '1002' },
      { sourceID: '1001', targetID: '1002' },
      { sourceID: '1002', targetID: '1003' }
    ]
  },
  'health': {
    checkFile: 'rural_health.py',
    nodes: [
      { id: '9001', x: 0, y: 150, label: 'medical_images', size: 50, input: 'rawImages', output: 'processedImages', environment: '离线推理环境', process: '轻量化模型处理', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'formdata' },
      { id: '9002', x: 150, y: 150, label: 'preprocess', size: 50, input: 'processedImages', output: 'cleanedData', environment: '低算力环境', process: '数据清洗与预处理', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'formdata' },
      { id: '9003', x: 300, y: 150, label: 'diagnose', size: 50, input: 'cleanedData', output: 'diagnosisResult', environment: '保护患者隐私', process: '联邦学习诊断', apiType: 'graphql', methodType: 'post', inputType: 'formdata', outputType: 'formdata' },
      { id: '9004', x: 450, y: 50, label: 'telemedicine', size: 50, input: 'diagnosisResult', output: 'consultationRecommendation', environment: '适应网络不稳定', process: '远程会诊支持', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'string' },
      { id: '9005', x: 450, y: 150, label: 'monitor', size: 50, input: 'patientData', output: 'healthAlerts', environment: '多设备协同', process: '慢性病管理监测', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'string' },
      { id: '9006', x: 450, y: 250, label: 'visualize', size: 50, input: 'medicalData', output: 'visualization', environment: '适应低算力设备', process: '医疗数据可视化', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'json' },
      { id: '9007', x: 300, y: 250, label: 'dialect_recognition', size: 50, input: 'audioData', output: 'transcription', environment: '方言区环境', process: '方言语音识别', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'string' }
    ],
    edges: [
      { sourceID: '9001', targetID: '9002' }, // medical_images → preprocess
      { sourceID: '9002', targetID: '9003' }, // preprocess → diagnose
      { sourceID: '9003', targetID: '9004' }, // diagnose → telemedicine
      { sourceID: '9003', targetID: '9005' }, // diagnose → monitor
      { sourceID: '9003', targetID: '9006' }, // diagnose → visualize
      { sourceID: '9007', targetID: '9003' }, // dialect_recognition → diagnose
      { sourceID: '9007', targetID: '9004' }, // dialect_recognition → telemedicine
      { sourceID: '9005', targetID: '9006' } // monitor → visualize
    ]
  },
  'agriculture': {
    checkFile: null,
    nodes: [
      { id: '9001', x: 0, y: 150, label: 'soil_analysis', size: 50, input: 'soilData', output: 'soilQuality', environment: '田间环境', process: '土壤质量检测', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'formdata' },
      { id: '9002', x: 150, y: 150, label: 'crop_monitoring', size: 50, input: 'cropImages', output: 'cropHealth', environment: '低带宽环境', process: '作物生长监测', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'formdata' },
      { id: '9003', x: 300, y: 150, label: 'pest_detection', size: 50, input: 'cropHealth', output: 'pestThreat', environment: '边缘设备', process: '病虫害检测', apiType: 'graphql', methodType: 'post', inputType: 'formdata', outputType: 'formdata' },
      { id: '9004', x: 450, y: 50, label: 'irrigation_control', size: 50, input: 'soilQuality', output: 'irrigationPlan', environment: '节能环境', process: '智能灌溉控制', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'string' }
    ],
    edges: [
      { sourceID: '9001', targetID: '9004' },
      { sourceID: '9002', targetID: '9003' },
      { sourceID: '9001', targetID: '9002' }
    ]
  },
  'evtol': {
    checkFile: null,
    nodes: [
      { id: '9001', x: 0, y: 150, label: 'flight_path', size: 50, input: 'locationData', output: 'flightRoute', environment: '低空飞行环境', process: '飞行路径规划', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'formdata' },
      { id: '9002', x: 150, y: 150, label: 'obstacle_detection', size: 50, input: 'sensorData', output: 'obstacleMap', environment: '实时处理环境', process: '障碍物检测', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'formdata' },
      { id: '9003', x: 300, y: 150, label: 'collision_avoidance', size: 50, input: 'obstacleMap', output: 'avoidanceCommand', environment: '紧急响应环境', process: '防碰撞处理', apiType: 'graphql', methodType: 'post', inputType: 'formdata', outputType: 'formdata' }
    ],
    edges: [
      { sourceID: '9001', targetID: '9003' },
      { sourceID: '9002', targetID: '9003' }
    ]
  },
  'ecommerce': {
    checkFile: null,
    nodes: [
      { id: '9001', x: 0, y: 150, label: 'market_trends', size: 50, input: 'marketData', output: 'trendAnalysis', environment: '跨境环境', process: '市场趋势分析', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'formdata' },
      { id: '9002', x: 150, y: 150, label: 'product_recommendation', size: 50, input: 'userBehavior', output: 'recommendations', environment: '多语言环境', process: '产品推荐', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'formdata' },
      { id: '9003', x: 300, y: 150, label: 'pricing_strategy', size: 50, input: 'trendAnalysis', output: 'priceSuggestions', environment: '实时更新环境', process: '价格策略生成', apiType: 'graphql', methodType: 'post', inputType: 'formdata', outputType: 'formdata' }
    ],
    edges: [
      { sourceID: '9001', targetID: '9003' },
      { sourceID: '9002', targetID: '9003' }
    ]
  },
  'homeAI': {
    checkFile: null,
    nodes: [
      { id: '9001', x: 0, y: 150, label: 'voice_recognition', size: 50, input: 'audioInput', output: 'commandText', environment: '家庭环境', process: '语音识别', apiType: 'restful', methodType: 'get', inputType: 'formdata', outputType: 'formdata' },
      { id: '9002', x: 150, y: 150, label: 'emotion_analysis', size: 50, input: 'userInput', output: 'emotionState', environment: '隐私保护环境', process: '情感分析', apiType: 'restful', methodType: 'post', inputType: 'formdata', outputType: 'formdata' },
      { id: '9003', x: 300, y: 150, label: 'conversation', size: 50, input: 'commandText,emotionState', output: 'response', environment: '低延迟环境', process: '对话生成', apiType: 'graphql', methodType: 'post', inputType: 'formdata', outputType: 'formdata' }
    ],
    edges: [
      { sourceID: '9001', targetID: '9003' },
      { sourceID: '9002', targetID: '9003' }
    ]
  }
}

/**
 * 将Agent返回的函数数据转换为图表格式
 */
export function convertToGraphFormat(functionData) {
  // 检查数据结构，确保存在necessary.nodes和relations
  if (!functionData || !Array.isArray(functionData)) {
    console.error('函数数据格式不正确:', functionData)
    return null
  }

  try {
    // 构建节点
    const nodes = functionData.map((func, index) => {
      return {
        id: `${index + 1000}`,
        x: 100 + (index % 3) * 150, // 简单布局：每行3个节点
        y: 100 + Math.floor(index / 3) * 100,
        label: func.name || `func_${index}`,
        size: 50,
        input: func.params?.join(', ') || 'None',
        output: func.returns || 'None',
        environment: func.description || '',
        process: func.logic || '',
        apiType: 'restful',
        methodType: 'post',
        inputType: 'formdata',
        outputType: 'json',
        color: '#1890ff'
      }
    })

    // 构建边
    const edges = []
    functionData.forEach((func, sourceIndex) => {
      // 如果函数有调用其他函数
      if (func.calls && Array.isArray(func.calls)) {
        func.calls.forEach((calledFuncName) => {
          // 查找被调用函数的索引
          const targetIndex = functionData.findIndex((f) => f.name === calledFuncName)
          if (targetIndex !== -1) {
            edges.push({
              sourceID: `${sourceIndex + 1000}`,
              targetID: `${targetIndex + 1000}`
            })
          }
        })
      }
    })

    return { nodes, edges }
  } catch (e) {
    console.error('转换函数数据出错:', e)
    return null
  }
}
