/**
 * 假数据响应处理工具
 * 用于MCP服务的假数据模拟和响应生成
 */

/**
 * 通用假回复模板
 */
const COMMON_RESPONSE_TEMPLATES = {
  'MCP Server 介绍': {
    getSteps: (serviceName) => [
      {
        step: '连接MCP服务器',
        status: 'completed',
        message: `成功连接到${serviceName}`
      },
      {
        step: '获取服务信息',
        status: 'completed',
        message: '正在获取服务功能和接口信息'
      }
    ],
    getFinalResult: (serviceInfo) => {
      const courseName = extractCourseFromName(serviceInfo.name)
      const mainFunction = getMainFunctionFromName(serviceInfo.name)

      return {
        response: `这是${serviceInfo.name}，${courseName}算法开发。主要功能包括${mainFunction}。服务通过SSE协议提供实时响应，支持多种数据格式输入，具有高可用性和稳定性。`
      }
    }
  },

  '服务状态检查': {
    getSteps: (serviceName) => [
      {
        step: '连接状态检测',
        status: 'completed',
        message: `正在检测${serviceName}连接状态`
      },
      {
        step: '功能完整性验证',
        status: 'completed',
        message: '正在验证各项功能模块的完整性'
      }
    ],
    getFinalResult: (serviceInfo) => ({
      response: `服务状态检查完成。${serviceInfo.name}运行正常，所有核心功能模块完整可用，响应时间正常，系统资源使用率合理。服务可以正常接收和处理用户请求。`
    })
  },

  '功能测试': {
    getSteps: (serviceName) => [
      {
        step: '初始化测试环境',
        status: 'completed',
        message: `正在初始化${serviceName}测试环境`
      },
      {
        step: '执行功能测试',
        status: 'completed',
        message: '正在逐一测试各项核心功能'
      },
      {
        step: '验证工具可用性',
        status: 'completed',
        message: '正在验证所有工具的可用性和响应'
      }
    ],
    getFinalResult: (serviceInfo) => ({
      response: `功能测试完成。${serviceInfo.name}的所有核心功能均正常工作，各项工具响应及时，测试通过率100%。服务具备完整的业务处理能力。`
    })
  }
}

/**
 * 从服务名称中提取课题信息
 */
function extractCourseFromName(serviceName) {
  if (serviceName.includes('课题一')) return '基于课题一'
  if (serviceName.includes('课题二')) return '基于课题二'
  if (serviceName.includes('课题三')) return '基于课题三'
  if (serviceName.includes('课题四')) return '基于课题四'
  if (serviceName.includes('课题五')) return '基于课题五'
  if (serviceName.includes('样例')) return '基于课题五'
  return '基于先进'
}

/**
 * 从服务名称中提取主要功能
 */
function getMainFunctionFromName(serviceName) {
  if (serviceName.includes('报告生成')) return '自动化报告生成和文档处理'
  if (serviceName.includes('风险识别')) return '金融风险识别和模型推理'
  if (serviceName.includes('风险报告')) return '金融风险报告自动化生成'
  if (serviceName.includes('安全性指纹')) return '模型安全性评测和指纹识别'
  if (serviceName.includes('欺诈检测')) return '多智能体协作的金融欺诈检测'
  if (serviceName.includes('利奈唑胺')) return '利奈唑胺给药方案优化'
  if (serviceName.includes('围标检测')) return '投标围标风险检测'
  if (serviceName.includes('技术评测')) return '全面技术评测和分析'
  return '智能分析和处理'
}

/**
 * 生成默认假数据响应
 */
function getDefaultFakeResponse(serviceInfo) {
  return {
    steps: [
      {
        step: '连接MCP服务器',
        status: 'completed',
        message: `成功连接到${serviceInfo.name}`
      },
      {
        step: '模拟测试执行',
        status: 'completed',
        message: '正在执行模拟测试'
      }
    ],
    final_result: {
      response: `当前服务处于模拟模式，但尚未配置具体的假数据响应。请在数据库中为该服务配置相应的假数据响应内容。服务名称：${serviceInfo.name}`
    }
  }
}

/**
 * 根据用户消息内容生成对应的通用假回复
 */
function generateCommonFakeResponse(userMessage, serviceInfo) {
  // 检查用户消息是否匹配通用模板
  for (const [templateKey, template] of Object.entries(COMMON_RESPONSE_TEMPLATES)) {
    if (userMessage.includes(templateKey) ||
        userMessage.includes(templateKey.replace('MCP Server ', '')) ||
        (templateKey === 'MCP Server 介绍' && (userMessage.includes('介绍') || userMessage.includes('功能'))) ||
        (templateKey === '服务状态检查' && (userMessage.includes('状态') || userMessage.includes('检查'))) ||
        (templateKey === '功能测试' && (userMessage.includes('测试') || userMessage.includes('验证')))) {
      return {
        steps: template.getSteps(serviceInfo.name),
        final_result: template.getFinalResult(serviceInfo)
      }
    }
  }

  return null
}

/**
 * 主要的假数据处理函数
 */
export function handleFakeResponse(serviceInfo, userMessage, callbacks) {
  const { onStart, onStep, onError, onFinalResult, onComplete } = callbacks

  try {
    console.log('使用假数据响应')
    onStart && onStart()

    let fakeData = null

    // 1. 优先检查是否为通用消息模板
    fakeData = generateCommonFakeResponse(userMessage, serviceInfo)

    // 2. 如果不是通用模板，尝试解析数据库中的假数据
    if (!fakeData && serviceInfo.response) {
      try {
        fakeData = serviceInfo.response
      } catch (parseError) {
        console.error('解析数据库假数据失败:', parseError)
      }
    }

    // 3. 如果都没有，使用默认响应
    if (!fakeData) {
      fakeData = getDefaultFakeResponse(serviceInfo)
    }

    // 模拟步骤执行过程
    if (fakeData.steps && Array.isArray(fakeData.steps)) {
      let stepIndex = 0
      const executeSteps = () => {
        if (stepIndex < fakeData.steps.length) {
          const step = fakeData.steps[stepIndex]
          onStep && onStep({
            step: step.step,
            status: step.status || 'completed',
            message: step.message,
            timestamp: new Date().toISOString()
          })
          stepIndex++

          // 模拟异步执行，每个步骤间隔500ms
          setTimeout(executeSteps, 500)
        } else {
          // 所有步骤完成后，返回最终结果
          setTimeout(() => {
            onFinalResult && onFinalResult(fakeData.final_result || { response: '假数据响应完成' })
            onComplete && onComplete()
          }, 200)
        }
      }

      // 开始执行步骤
      setTimeout(executeSteps, 300)
    } else {
      // 如果没有步骤，直接返回结果
      setTimeout(() => {
        onFinalResult && onFinalResult(fakeData.final_result || { response: '假数据测试完成' })
        onComplete && onComplete()
      }, 1000)
    }
  } catch (error) {
    console.error('处理假数据时出错:', error)
    onError && onError(`处理假数据时出错: ${error.message}`)
  }
}

/**
 * 获取响应内容文本
 */
export function extractResponseContent(fakeData) {
  if (fakeData.final_result && fakeData.final_result.response) {
    return fakeData.final_result.response
  } else if (fakeData.response) {
    return fakeData.response
  } else {
    return '假数据测试完成'
  }
}
