const amlServices = [
  {
    name: '课题一风险识别模型推理微服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 1,
    technology: 1,
    netWork: 'bridge',
    port: '0.0.0.0:8000/TCP → 0.0.0.0:80000',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 4,
    number: '512',
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 2,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学课题组',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '课题一',
      msIntroduce: '基于智能体的风险识别算法',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: 'predict',
        url: '/api/project1/predict',
        method: 'POST',
        des: '模型推理接口，基于数据集和参数配置得到风险识别结果',
        parameterType: 2,
        parameters: [{
          name: 'file',
          type: 'zip file',
          des: '数据集和参数配置文件的zip压缩包'
        }],
        responseType: 1
      },
      {
        name: 'healthCheck',
        url: '/api/project1/health',
        method: 'GET',
        des: '判断微服务状态是否正常可用',
        parameterType: 0
      }
    ]
  },
  {
    name: '技术评测微服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 1,
    scenario: 2,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8001/TCP → 0.0.0.0:80001',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 3,
    number: '8192',
    norm: [
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '课题五',
      msIntroduce: '课题五样例服务',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: 'train',
        isFake: true,
        url: 'https://myApiServer.com/technical-assessment/train',
        method: 'POST',
        parameterType: 2,
        responseType: 1,
        response: {
          code: 200,
          message: '训练完成!',
          data: {
            modelId: '2',
            modelName: 'model2',
            modelVersion: '1.0',
            modelPath: '/appdata/aml/model/model2.pkl'
          }
        }
      },
      {
        name: 'predict',
        isFake: true,
        url: 'https://myApiServer.com/technical-assessment/predict',
        method: 'POST',
        parameterType: 2,
        responseType: 1,
        response: {
          code: 200,
          message: '预测成功！',
          data: {
            predictResult: 'predict result list'
          }
        }
      }
    ]
  },
  {
    name: '样例报告生成微服务',
    attribute: 0,
    type: 0,
    domain: 0,
    industry: 2,
    scenario: 3,
    technology: 3,
    netWork: 'bridge',
    port: '0.0.0.0:8002/TCP → 0.0.0.0:80002',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 1,
    number: '2330',
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 1,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学课题组',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '课题一',
      msIntroduce: '简易版报告生成',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: 'getReportData',
        isFake: true,
        url: 'https://myApiServer.com/report/get',
        method: 'GET',
        parameterType: 1,
        parameters: [{
          name: 'reportId',
          type: 'int'
        }],
        responseType: 1,
        response: {
          code: 200,
          message: '获取成功!',
          data: {
            result: '基于图神经网络的跨境贸易支付监测模型的推理结果已经产生。模型在数据集上的表现如下：\n\n在100个节点中，有93个节点被判定为类别0，7个节点被判定为类别2。具体结果如下：\n\n- 类别0：节点1，节点2，节点3，节点4，节点9，节点10，节点11，节点12，节点13，节点14，节点15，节点16，节点17，节点\n18，节点19，节点20，节点21，节点22，节点23，节点24，节点25，节点26，节点27，节点28，节点29，节点30，节点31，节点\n32，节点33，节点34，节点35，节点36，节点37，节点38，节点39，节点40，节点41，节点42，节点43，节点44，节点45，节点\n46，节点47，节点48，节点49，节点50，节点51，节点52，节点53，节点54，节点55，节点56，节点57，节点58，节点59，节点\n60，节点61，节点62，节点63，节点65，节点66，节点67，节点68，节点69，节点70，节点71，节点72，节点73，节点74，节点\n75，节点76，节点77，节点78，节点79，节点80，节点81，节点82，节点83，节点84，节点85，节点86，节点87，节点88，节点\n89，节点90，节点91，节点92，节点93，节点94，节点95，节点96。\n\n- 类别2：节点0，节点5，节点6，节点7，节点8，节点64，节点97，节点98，节点99。\n\n总结，大多数节点（93%）被分类为类别0，而较小的部分（7%）被分类为类别2。这可能反映了在训练集中类别0的样本数量更多\n，模型在识别类别0的能力上表现得更好。同时，模型对于类别2的识别也有一定的能力。'
          }
        }
      },
      {
        name: 'sendReport',
        isFake: true,
        url: 'https://myApiServer.com/report/send',
        method: 'GET',
        parameterType: 1,
        parameters: [{
          name: 'reportId',
          type: 'int'
        }],
        responseType: 1,
        response: {
          code: 200,
          message: '发送成功！',
          data: {
            reportId: '1'
          }
        }
      },
      {
        name: 'generateReport',
        isFake: true,
        url: 'https://myApiServer.com/report-generation/generate',
        method: 'POST',
        des: '报告生成接口样例',
        parameterType: 3,
        parameters: [{
          name: 'reportData',
          type: 'string',
          des: '用于生成报告的数据'
        }],
        responseType: 1,
        response: {
          code: 200,
          message: '生成成功！',
          data: {
            reportPath: '/appdata/aml/report/report1.pdf'
          }
        }
      }
    ]
  },
  {
    name: '信用评估微服务',
    attribute: 2,
    type: 0,
    domain: 0,
    industry: 3,
    scenario: 4,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:8003/TCP → 0.0.0.0:80003',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 2,
    number: '2342',
    norm: [
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学课题组',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '课题五',
      msIntroduce: '课题五样例服务',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: 'train',
        isFake: true,
        url: 'https://myApiServer.com/credit-assessment/train',
        method: 'POST',
        parameterType: 2,
        responseType: 1,
        response: {
          code: 200,
          message: '训练完成!',
          data: {
            modelId: '4',
            modelName: 'model4',
            modelVersion: '1.0',
            modelPath: '/appdata/aml/model/model3.pkl'
          }
        }
      },
      {
        name: 'predict',
        isFake: true,
        url: 'https://myApiServer.com/credit-assessment/predict',
        method: 'POST',
        parameterType: 2,
        responseType: 1,
        response: {
          code: 200,
          message: '预测成功！',
          data: {
            predictResult: 'predict result list'
          }
        }
      }
    ]
  },
  {
    name: '异常识别微服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 0,
    technology: 0,
    netWork: 'bridge',
    port: '0.0.0.0:8004/TCP → 0.0.0.0:80004',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 0,
    number: '0',
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学课题组',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '课题五',
      msIntroduce: '课题五AI技术中台上传、发布算法样例服务',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: 'preprocess',
        isFake: true,
        url: 'https://myApiServer.com/anomaly-detection/preprocess',
        method: 'POST',
        parameterType: 2,
        responseType: 1,
        response: {
          code: 200,
          message: '预处理成功!',
          data: {
            modelId: '4',
            modelName: 'model4',
            modelVersion: '1.0',
            modelPath: '/appdata/aml/data/data4.pkl'
          }
        }
      },
      {
        name: 'train',
        isFake: true,
        url: 'https://myApiServer.com/anomaly-detection/train',
        method: 'POST',
        parameterType: 2,
        responseType: 1,
        response: {
          code: 200,
          message: '训练完成!',
          data: {
            modelId: '4',
            modelName: 'model4',
            modelVersion: '1.0',
            modelPath: '/appdata/aml/model/model4.pkl'
          }
        }
      },
      {
        name: 'predict',
        isFake: true,
        url: 'https://myApiServer.com/anomaly-detection/predict',
        method: 'POST',
        parameterType: 2,
        responseType: 1,
        response: {
          code: 200,
          message: '预测成功！',
          data: {
            predictResult: 'predict result list'
          }
        }
      },
      {
        name: 'evaluate',
        isFake: true,
        url: 'https://myApiServer.com/anomaly-detection/evaluate',
        method: 'POST',
        parameterType: 2,
        responseType: 1,
        response: {
          code: 200,
          message: '评估成功！',
          data: {
            evaluateResult: 'evaluate result list'
          }
        }
      },
      {
        name: 'visualize',
        isFake: true,
        url: 'https://myApiServer.com/anomaly-detection/visualize',
        method: 'POST',
        parameterType: 2,
        responseType: 1,
        response: {
          code: 200,
          message: '可视化成功！',
          data: {
            visualizeResult: 'visualize result list'
          }
        }
      }
    ]
  },
  {
    name: '课题三金融风险报告生成微服务',
    attribute: 2,
    type: 0,
    domain: 0,
    industry: 3,
    scenario: 4,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:8005/TCP → 0.0.0.0:80005',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 4,
    number: '2342',
    norm: [
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学课题组',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '课题三',
      msIntroduce: '金融风险报告生成',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: 'generate-report',
        url: '/api/project3/generate-report',
        method: 'GET',
        des: '根据自然语言需求生成风险评估报告',
        parameterType: 1,
        parameters: [{
          name: 'query',
          type: 'string',
          des: '用自然语言描述想要生成的报告'
        }],
        responseType: 2,
        responseFileName: 'financial_report.pdf'
      },
      {
        name: 'nl2gql',
        url: '/api/project3/nl2gql',
        method: 'GET',
        des: '根据自然语言需求生成gql语句并得到查询结果',
        parameterType: 1,
        parameters: [{
          name: 'query',
          type: 'string',
          des: '用自然语言描述查询需求'
        }],
        responseType: 1
      },
      {
        name: 'healthCheck',
        url: '/api/project3/health',
        method: 'GET',
        des: '判断微服务状态是否正常可用',
        parameterType: 0
      }
    ]
  },
  {
    name: '课题四模型评测-安全性指纹微服务',
    attribute: 2,
    type: 0,
    domain: 0,
    industry: 3,
    scenario: 4,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:8006/TCP → 0.0.0.0:80006',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/data',
    status: 4,
    number: '2342',
    norm: [
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学课题组',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '课题四',
      msIntroduce: '安全性指纹测评算法',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: 'safety-fingerprint',
        url: '/api/project4/safety/safety-fingerprint',
        method: 'POST',
        parameterType: 2,
        parameters: [
          {
            name: 'file',
            type: 'file',
            des: '数据集和配置文件的zip压缩包'
          },
          {
            name: 'model_name',
            type: 'string',
            des: '模型名称，目前只支持HattenGCN'
          }
        ],
        responseType: 1
      },
      {
        name: 'healthCheck',
        url: '/api/project4/safety/health',
        method: 'GET',
        parameterType: 0
      }
    ]
  }
]

const airCraftServices = [
  {
    name: '无人机虚拟仿真微服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 0,
    technology: 1,
    netWork: 'bridge',
    port: '0.0.0.0:8080/TCP → 0.0.0.0:80080',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 4,
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '复旦大学校名取自《尚书大传》之"日月光华，旦复旦兮"，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部"长江学者"特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，"中国大学智库论坛"秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
      msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
      companyScore: 5,
      msScore: 5
    },
    number: '2342'
  },
  {
    name: '无人机低空测绘微服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 1,
    scenario: 3,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8081/TCP → 0.0.0.0:80081',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 0,
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 2,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '复旦大学校名取自《尚书大传》之"日月光华，旦复旦兮"，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部"长江学者"特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，"中国大学智库论坛"秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
      msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
      companyScore: 5,
      msScore: 5
    },
    number: '2342'
  },
  {
    name: '无人机目标识别微服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 2,
    scenario: 4,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8082/TCP → 0.0.0.0:80082',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 3,
    norm: [
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '复旦大学校名取自《尚书大传》之"日月光华，旦复旦兮"，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部"长江学者"特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，"中国大学智库论坛"秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
      msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
      companyScore: 5,
      msScore: 5
    },
    number: '2342'
  },
  {
    name: '无人机远程控制微服务',
    attribute: 0,
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 1,
    technology: 3,
    netWork: 'bridge',
    port: '0.0.0.0:8083/TCP → 0.0.0.0:80083',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 2,
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 1,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '复旦大学校名取自《尚书大传》之"日月光华，旦复旦兮"，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部"长江学者"特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，"中国大学智库论坛"秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
      msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
      companyScore: 5,
      msScore: 5
    },
    number: '2342'
  },
  {
    name: '无人机视频分析微服务',
    attribute: 2,
    type: 0,
    domain: 0,
    industry: 1,
    scenario: 2,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:8084/TCP → 0.0.0.0:80084',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 1,
    norm: [
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '复旦大学校名取自《尚书大传》之"日月光华，旦复旦兮"，始创于1905年，原名复旦公学，1917年定名为复旦大学，是中国人自主创办的第一所高等院校。上海医科大学前身是1927年创办的国立第四中山大学医学院。2000年，复旦大学与上海医科大学合并。目前，学校拥有哲学、经济学、法学、教育学、文学、历史学、理学、工学、医学、管理学、艺术学等11个学科门类，是一所世界知名、国内顶尖的综合性研究型大学。目前，复旦大学有直属院（系）32个，附属医院17家（其中4家筹建）。学校设有本科专业74个，拥有一级学科博士学位授权点37个，一级学科硕士学位授权点43个，博士专业学位授权点2个，硕士专业学位授权点27个，博士后科研流动站35个。在校普通本、专科生13361人，研究生19903人，留学生3486人。在校教学科研人员2948人。两院院士（含双聘）46人，文科杰出教授1人，文科资深教授13人，教育部"长江学者"特聘教授（本校申报入选）99人，国家杰出青年基金获得者（本校申报入选）136人。复旦大学学术影响力进入ESI世界前1%的学科领域数17个，位列国内高校第3名，其中，化学、材料科学、临床医学、药理学与毒理学进入全球1‰。U.S.News世界学科排名中，有4个学科跻身世界前20，数量在国内并列第二。在QS世界学科排名中，复旦有20个学科位列世界前100，总量在国内排名第三。学校有国家重点实验室5个，教育部工程研究中心5个，教育部重点实验室13个，卫生部重点实验室9个，军委后勤保障部卫生局重点实验室1个，上海市重点实验室15个，上海市工程研究中心7个；有教育部人文社会科学重点研究基地9个，中国研究院入选首批国家高端智库建设试点单位，马克思主义学院入选首批全国重点马克思主义学院，"中国大学智库论坛"秘书处落户复旦。在QS 世界大学排名中列全球第40位，在U.S.News全球大学排行榜中，位居第121位，均列国内高校第3位。',
      msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
      companyScore: 5,
      msScore: 5
    },
    number: '2342'
  }
]

const healthServices = [
  {
    name: '基层医疗影像辅助诊断微服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 0,
    scenario: 1,
    technology: 0,
    netWork: 'bridge',
    port: '0.0.0.0:8100/TCP → 0.0.0.0:81000',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/health/data',
    status: 4,
    number: '256',
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 2,
        score: 4
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '乡村医疗科技有限公司',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642111',
      companyIntroduce: '农村AI医疗解决方案提供商',
      msIntroduce: '基于轻量化模型的医疗影像辅助诊断服务',
      companyScore: 5,
      msScore: 4
    },
    apiList: [
      {
        name: 'diagnose',
        isFake: true,
        url: 'https://myApiServer.com/health/diagnose',
        method: 'POST',
        des: '模型推理接口，基于医学影像数据进行辅助诊断',
        parameterType: 2,
        parameters: [{
          name: 'file',
          type: 'image file',
          des: '医学影像文件（支持CT、X光、超声等图像）'
        }],
        responseType: 1,
        response: {
          code: 200,
          message: '诊断完成！',
          data: {
            diagnosisResult: '高度疑似肺部感染，建议进一步检查',
            confidence: 0.89,
            annotations: {
              regions: [
                { x: 120, y: 150, width: 50, height: 40 },
                { x: 200, y: 180, width: 30, height: 25 }
              ],
              type: '异常区域'
            }
          }
        }
      },
      {
        name: 'healthCheck',
        isFake: true,
        url: 'https://myApiServer.com/health/health',
        method: 'GET',
        des: '判断微服务状态是否正常可用',
        parameterType: 0,
        responseType: 1,
        response: {
          code: 200,
          message: '服务运行正常',
          data: {
            status: 'healthy',
            uptime: '72h 15m'
          }
        }
      }
    ]
  },
  {
    name: '慢性病管理监测微服务',
    attribute: 1,
    type: 0,
    domain: 2,
    industry: 0,
    scenario: 2,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8101/TCP → 0.0.0.0:81001',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/health/data',
    status: 4,
    number: '128',
    norm: [
      {
        key: 1,
        score: 4
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '健康云科技有限公司',
      companyAddress: '上海市浦东新区张江高科技园区',
      companyContact: '021-58885555',
      companyIntroduce: '专注于慢性病管理和健康监测',
      msIntroduce: '基于物联网和AI的慢性病监测服务',
      companyScore: 4,
      msScore: 5
    },
    apiList: [
      {
        name: 'analyze',
        isFake: true,
        url: 'https://myApiServer.com/health/monitor/analyze',
        method: 'POST',
        des: '分析健康数据并提供管理建议',
        parameterType: 2,
        parameters: [{
          name: 'data',
          type: 'json',
          des: '来自可穿戴设备和家用医疗设备的健康数据'
        }],
        responseType: 1,
        response: {
          code: 200,
          message: '分析完成！',
          data: {
            patientStatus: '血糖水平波动较大',
            riskLevel: '中等',
            recommendations: [
              '增加餐后30分钟测量频率',
              '调整胰岛素用量',
              '每日30分钟低强度运动'
            ],
            nextCheckupDate: '2023-06-15'
          }
        }
      },
      {
        name: 'alert',
        isFake: true,
        url: 'https://myApiServer.com/health/monitor/alert',
        method: 'POST',
        des: '设置健康预警阈值和通知',
        parameterType: 2,
        responseType: 0,
        response: {
          code: 200,
          message: '预警设置成功！',
          data: {
            alertId: '12345',
            thresholds: {
              bloodPressureHigh: '140/90',
              bloodPressureLow: '90/60',
              bloodSugarHigh: '11.1',
              bloodSugarLow: '3.9'
            },
            notificationChannels: ['SMS', 'App', 'Family']
          }
        }
      }
    ]
  },
  {
    name: '方言语音识别转写微服务',
    attribute: 2,
    type: 0,
    domain: 1,
    industry: 0,
    scenario: 0,
    technology: 1,
    netWork: 'bridge',
    port: '0.0.0.0:8102/TCP → 0.0.0.0:81002',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/health/data',
    status: 4,
    number: '384',
    norm: [
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 4
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '智语科技有限公司',
      companyAddress: '北京市海淀区中关村科技园',
      companyContact: '010-62345678',
      companyIntroduce: '专注于多方言语音识别技术',
      msIntroduce: '农村方言语音识别转写服务',
      companyScore: 4,
      msScore: 5
    },
    apiList: [
      {
        name: 'transcribe',
        isFake: true,
        url: 'https://myApiServer.com/health/voice/transcribe',
        method: 'POST',
        des: '将方言语音转写为标准文字',
        parameterType: 2,
        parameters: [{
          name: 'audio',
          type: 'audio file',
          des: '语音文件（支持方言）'
        }],
        responseType: 1,
        response: {
          code: 200,
          message: '转写成功！',
          data: {
            originalDialect: '四川方言',
            standardText: '我最近感觉身体不太舒服，头晕头痛，想挂号看医生',
            confidence: 0.92,
            duration: '15秒',
            medicalTerms: [
              { term: '头晕', standard: true },
              { term: '头痛', standard: true }
            ]
          }
        }
      }
    ]
  },
  {
    name: '乡村医疗资源调度微服务',
    attribute: 0,
    type: 0,
    domain: 2,
    industry: 1,
    scenario: 3,
    technology: 3,
    netWork: 'bridge',
    port: '0.0.0.0:8103/TCP → 0.0.0.0:81003',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/health/data',
    status: 3,
    number: '192',
    norm: [
      {
        key: 0,
        score: 4
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '医卫智能科技有限公司',
      companyAddress: '武汉市光谷科技园',
      companyContact: '027-87654321',
      companyIntroduce: '专注于医疗资源智能调度',
      msIntroduce: '基于强化学习的医疗资源优化调度服务',
      companyScore: 5,
      msScore: 4
    },
    apiList: [
      {
        name: 'allocate',
        isFake: true,
        url: 'https://myApiServer.com/health/resource/allocate',
        method: 'POST',
        des: '根据急诊情况优化医疗资源调度',
        parameterType: 2,
        parameters: [{
          name: 'data',
          type: 'json',
          des: '急诊信息和可用资源数据'
        }],
        responseType: 1,
        response: {
          code: 200,
          message: '资源调度完成！',
          data: {
            emergencyLevel: '中度紧急',
            allocatedResources: [
              { type: '救护车', eta: '15分钟', distance: '8.5公里' },
              { type: '急诊医师', status: '待命', specialty: '内科' }
            ],
            nearestHospital: {
              name: '县人民医院',
              distance: '12公里',
              availableBeds: 3,
              specialtyAvailable: ['内科', '外科', '急诊']
            },
            alternativeFacilities: [
              { name: '镇卫生院', distance: '3公里', capabilities: '基础处理' }
            ]
          }
        }
      }
    ]
  },
  {
    name: '流行病预测分析微服务',
    attribute: 2,
    type: 0,
    domain: 3,
    industry: 1,
    scenario: 4,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8104/TCP → 0.0.0.0:81004',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/health/data',
    status: 4,
    number: '512',
    norm: [
      {
        key: 1,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '公共卫生数据科技公司',
      companyAddress: '广州市天河区科技园',
      companyContact: '020-38889999',
      companyIntroduce: '专注于流行病学数据分析',
      msIntroduce: '基于时序数据分析的流行病预测服务',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: 'predict',
        isFake: true,
        url: 'https://myApiServer.com/health/epidemic/predict',
        method: 'POST',
        des: '分析历史数据预测流行病发展趋势',
        parameterType: 2,
        parameters: [{
          name: 'data',
          type: 'json',
          des: '历史疫情数据和环境因素'
        }],
        responseType: 1,
        response: {
          code: 200,
          message: '预测分析完成！',
          data: {
            diseaseName: '季节性流感',
            riskLevel: '高',
            predictedPeakTime: '2023年12月上旬',
            affectedAreas: [
              { name: '晓庄村', riskLevel: '极高', population: 1200 },
              { name: '河西镇', riskLevel: '高', population: 5000 },
              { name: '东林县', riskLevel: '中', population: 32000 }
            ],
            preventionRecommendations: [
              '提前两周开始疫苗接种',
              '加强学校和公共场所消毒',
              '准备充足医疗物资'
            ],
            predictionAccuracy: '85%'
          }
        }
      }
    ]
  }
]

const amlMetaApps = [
  {
    name: '技术评测元应用',
    attribute: 3,
    type: 1,
    domain: 0,
    industry: 1,
    scenario: 2,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:1020/TCP → 0.0.0.0:10020',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aml/metaApp',
    status: 1,
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      companyIntroduce: '复旦大学课题组',
      msIntroduce: '用于跨境支付的风险评估和报告生成的元应用样例',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: '技术评测元应用',
        isFake: true,
        inputName: '技术评测数据',
        outputName: '技术评测报告',
        outputVisualization: true,
        submitButtonText: '开始评测',
        url: 'https://myApiServer.com/metaApp',
        method: 'POST',
        parameterType: 3,
        responseType: 1,
        response: {
          code: 200,
          message: '评测完毕！',
          data: {
            securityResult: '5.0',
            robustnessResult: '5.0',
            privacyResult: '5.0',
            credibilityResult: '5.0'
          }
        }
      }
    ],
    number: '2342'
  }
]

const airCraftMetaApps = [
  {
    name: '无人机智能投递',
    attribute: 3,
    type: 1,
    domain: 0,
    industry: 1,
    scenario: 2,
    technology: 4,
    netWork: 'bridge',
    port: '0.0.0.0:8084/TCP → 0.0.0.0:80084',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/aircraft/data',
    status: 1,
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '复旦大学',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642222',
      msIntroduce: '针对跨境贸易支付监管的误检率高、效率低问题，本课题旨在研究新的监管方法和机制，支持新时代的监管体系构建。基于高性能分布式图数据库和FIDO客户认证，通过高性能图分析算法优化规则驱动的跨境支付监管，确保数据真实性并实现高并发事中监管。',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: '无人机智能投递',
        isFake: true,
        inputName: '目标参数',
        outputName: '任务结果',
        submitButtonText: '开始任务',
        url: 'https://myApiServer.com/air/target',
        method: 'POST',
        parameterType: 3,
        responseType: 1,
        response: {
          code: 200,
          message: '任务已开始'
        }
      }
    ],
    number: '2342'
  }
]

const healthMetaApps = [
  {
    name: '乡村医疗AI辅助诊断元应用',
    attribute: 3,
    type: 1,
    domain: 0,
    industry: 0,
    scenario: 1,
    technology: 0,
    netWork: 'bridge',
    port: '0.0.0.0:8120/TCP → 0.0.0.0:81020',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/health/metaApp',
    status: 1,
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 1,
        score: 4
      },
      {
        key: 2,
        score: 5
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '乡村医疗科技有限公司',
      companyAddress: '上海市杨浦区邯郸路220号',
      companyContact: '021-65642111',
      companyIntroduce: '农村AI医疗解决方案提供商',
      msIntroduce: '针对基层医疗机构的AI辅助诊断元应用，整合了医学影像处理和方言语音识别功能',
      companyScore: 5,
      msScore: 4
    },
    apiList: [
      {
        name: '乡村医疗AI辅助诊断元应用',
        isFake: true,
        inputName: '诊断数据',
        outputName: '诊断结果报告',
        outputVisualization: true,
        submitButtonText: '开始诊断',
        url: 'https://myApiServer.com/health/metaApp',
        method: 'POST',
        parameterType: 3,
        responseType: 1,
        response: {
          code: 200,
          message: '诊断完成！',
          data: {
            patientInfo: {
              age: 65,
              gender: '男',
              symptoms: ['胸闷', '咳嗽', '发热'],
              medicalHistory: '高血压，2型糖尿病'
            },
            diagnosisResult: {
              primaryDiagnosis: '肺部感染',
              confidence: 0.92,
              alternativeDiagnosis: ['慢性支气管炎', '肺气肿'],
              riskLevel: '中高风险'
            },
            recommendations: [
              '建议进行抗生素治疗',
              '密切监测血氧水平',
              '一周后复查'
            ],
            referralNeeded: true,
            referToSpecialist: '呼吸科专家'
          }
        }
      }
    ],
    number: '1024'
  },
  {
    name: '农村公共卫生监测元应用',
    attribute: 3,
    type: 1,
    domain: 3,
    industry: 1,
    scenario: 4,
    technology: 2,
    netWork: 'bridge',
    port: '0.0.0.0:8121/TCP → 0.0.0.0:81021',
    volume: '/var/opt/gitlab/mnt/user  →  /appdata/health/metaApp',
    status: 1,
    norm: [
      {
        key: 0,
        score: 4
      },
      {
        key: 1,
        score: 5
      },
      {
        key: 2,
        score: 4
      },
      {
        key: 3,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '公共卫生数据科技公司',
      companyAddress: '广州市天河区科技园',
      companyContact: '020-38889999',
      companyIntroduce: '专注于流行病学数据分析',
      msIntroduce: '农村地区公共卫生监测元应用，整合流行病预测和医疗资源调度功能',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: '农村公共卫生监测元应用',
        isFake: true,
        inputName: '区域卫生数据',
        outputName: '监测与预警报告',
        outputVisualization: true,
        submitButtonText: '开始分析',
        url: 'https://myApiServer.com/health/publicHealth/monitor',
        method: 'POST',
        parameterType: 3,
        responseType: 1,
        response: {
          code: 200,
          message: '分析完成！',
          data: {
            regionOverview: {
              name: '东林县及周边乡镇',
              population: 120000,
              medicalFacilities: 15,
              healthcareWorkers: 230
            },
            epidemicStatus: {
              currentOutbreaks: [
                { disease: '季节性流感', cases: 325, trend: '上升' },
                { disease: '手足口病', cases: 48, trend: '稳定' }
              ],
              predictions: [
                { disease: '季节性流感', peakTime: '2023年12月上旬', estimatedCases: 500 },
                { disease: '腹泻', peakTime: '2023年7月', estimatedCases: 200 }
              ]
            },
            resourceAllocation: {
              criticalShortages: ['儿科医生', '呼吸科专家'],
              recommendedDistribution: [
                { resource: '流感疫苗', allocateTo: ['河西镇', '晓庄村'], quantity: 2000 },
                { resource: '防护口罩', allocateTo: ['所有学校', '养老院'], quantity: 10000 }
              ]
            },
            preventionActions: [
              '加强学校晨检',
              '提前启动疫苗接种计划',
              '农村医生培训'
            ]
          }
        }
      }
    ],
    number: '768'
  }
]

// 添加农业数智AI服务数据
const agricultureServices = [
  {
    key: 1,
    name: '农作物图像分析服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 4,
    scenario: 0,
    technology: '计算机视觉（智慧种植/精准播种）',
    netWork: 'bridge',
    port: '0.0.0.0:8010/TCP → 0.0.0.0:8010',
    volume: '/var/opt/gitlab/mnt/user → /appdata/agriculture/data',
    status: 4,
    number: '512',
    description: '基于深度学习的农作物图像分析服务，可识别作物生长状态、病虫害等问题，提供精准的农业管理建议。',
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 2,
        score: 4
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '智慧农业研究院',
      companyAddress: '上海市闵行区东川路800号',
      companyContact: '021-54740000',
      companyIntroduce: '专注于农业人工智能技术研发与应用',
      msIntroduce: '基于计算机视觉的农作物生长状态智能分析服务',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: 'analyzeImage',
        isFake: true,
        url: 'https://myApiServer.com/agriculture/image/analyze',
        method: 'POST',
        des: '分析农作物图像，识别生长状态',
        parameterType: 2,
        parameters: [
          {
            name: 'image',
            type: 'file',
            required: true,
            des: '农作物图像文件'
          },
          {
            name: 'cropType',
            type: 'string',
            required: false,
            des: '作物类型，如不提供则自动识别'
          }
        ],
        responseType: 1,
        response: {
          code: 200,
          message: '分析成功',
          data: {
            status: 'healthy',
            growthStage: 'flowering',
            confidence: 0.95,
            estimatedHarvestDate: '2023-09-15',
            recommendations: ['适量浇水', '增加光照', '防治白粉病'],
            nutritionStatus: {
              nitrogen: '适宜',
              phosphorus: '偏低',
              potassium: '适宜'
            }
          }
        }
      },
      {
        name: 'healthCheck',
        isFake: true,
        url: 'https://myApiServer.com/agriculture/health',
        method: 'GET',
        des: '健康检查接口',
        parameterType: 0,
        parameters: [],
        responseType: 1,
        response: {
          code: 200,
          message: '服务正常',
          data: {
            status: 'running',
            uptime: '65d 12h 37m',
            version: '2.3.5',
            memoryUsage: '45%',
            cpuUsage: '12%'
          }
        }
      }
    ]
  },
  {
    key: 2,
    name: '病虫害识别与防治服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 4,
    scenario: 1,
    technology: '计算机视觉（智慧种植/病虫害防治）',
    netWork: 'bridge',
    port: '0.0.0.0:8011/TCP → 0.0.0.0:8011',
    volume: '/var/opt/gitlab/mnt/user → /appdata/agriculture/data',
    status: 4,
    number: '512',
    description: '识别农作物病虫害类型，提供针对性防治建议，减少农药使用，提高防治效果。',
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 2,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '智慧农业研究院',
      companyAddress: '上海市闵行区东川路800号',
      companyContact: '021-54740000',
      companyIntroduce: '专注于农业人工智能技术研发与应用',
      msIntroduce: '基于深度学习的病虫害智能识别与防治系统',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: 'identifyDisease',
        isFake: true,
        url: 'https://myApiServer.com/agriculture/disease/identify',
        method: 'POST',
        des: '识别农作物病虫害',
        parameterType: 2,
        parameters: [
          {
            name: 'image',
            type: 'file',
            required: true,
            des: '病害部位图像'
          },
          {
            name: 'cropType',
            type: 'string',
            required: true,
            des: '作物类型'
          }
        ],
        responseType: 1,
        response: {
          code: 200,
          message: '识别成功',
          data: {
            disease: '稻瘟病',
            confidence: 0.92,
            severity: '中度',
            affectedArea: '30%',
            treatment: ['喷洒杀菌剂', '增加通风'],
            preventionMeasures: ['加强田间管理', '选择抗病品种'],
            spreadRisk: '高',
            economicImpact: '产量可能降低15-20%'
          }
        }
      },
      {
        name: 'healthCheck',
        isFake: true,
        url: 'https://myApiServer.com/agriculture/disease/health',
        method: 'GET',
        des: '健康检查接口',
        parameterType: 0,
        parameters: [],
        responseType: 1,
        response: {
          code: 200,
          message: '服务正常',
          data: {
            status: 'running',
            uptime: '42d 5h 18m',
            version: '1.8.2',
            memoryUsage: '38%',
            cpuUsage: '5%'
          }
        }
      }
    ]
  },
  {
    key: 3,
    name: '智能灌溉决策服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 4,
    scenario: 2,
    technology: '时序分析与预测（智慧种植/智能灌溉）',
    netWork: 'bridge',
    port: '0.0.0.0:8012/TCP → 0.0.0.0:8012',
    volume: '/var/opt/gitlab/mnt/user → /appdata/agriculture/data',
    status: 4,
    number: '512',
    description: '基于土壤湿度、天气预报和作物需水规律，提供精准灌溉决策，节约水资源。',
    norm: [
      {
        key: 0,
        score: 4
      },
      {
        key: 2,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '智慧农业研究院',
      companyAddress: '上海市闵行区东川路800号',
      companyContact: '021-54740000',
      companyIntroduce: '专注于农业人工智能技术研发与应用',
      msIntroduce: '基于时序分析的农田智能灌溉决策系统',
      companyScore: 5,
      msScore: 4
    },
    apiList: [
      {
        name: 'getIrrigationPlan',
        isFake: true,
        url: 'https://myApiServer.com/agriculture/irrigation/plan',
        method: 'POST',
        des: '获取智能灌溉计划',
        parameterType: 1,
        parameters: [
          {
            name: 'soilMoisture',
            type: 'number',
            required: true,
            des: '土壤湿度百分比'
          },
          {
            name: 'cropType',
            type: 'string',
            required: true,
            des: '作物类型'
          },
          {
            name: 'growthStage',
            type: 'string',
            required: true,
            des: '生长阶段'
          },
          {
            name: 'fieldSize',
            type: 'number',
            required: true,
            des: '田地面积(亩)'
          }
        ],
        responseType: 1,
        response: {
          code: 200,
          message: '灌溉计划生成成功',
          data: {
            shouldIrrigate: true,
            recommendedAmount: 30,
            unit: '立方米/亩',
            timing: '今日傍晚',
            reason: '土壤湿度低于作物需求',
            waterSavings: '约25%（与传统灌溉相比）',
            nextAssessment: '3天后',
            weatherForecast: '未来3天无有效降水',
            irrigationZones: [
              { zone: 'A', priority: '高', amount: 35 },
              { zone: 'B', priority: '中', amount: 30 },
              { zone: 'C', priority: '低', amount: 25 }
            ]
          }
        }
      },
      {
        name: 'healthCheck',
        isFake: true,
        url: 'https://myApiServer.com/agriculture/irrigation/health',
        method: 'GET',
        des: '健康检查接口',
        parameterType: 0,
        parameters: [],
        responseType: 1,
        response: {
          code: 200,
          message: '服务正常',
          data: {
            status: 'running',
            uptime: '28d 9h 42m',
            version: '3.1.0',
            memoryUsage: '32%',
            cpuUsage: '8%'
          }
        }
      }
    ]
  },
  {
    key: 4,
    name: '农作物产量预测服务',
    attribute: 1,
    type: 0,
    domain: 0,
    industry: 4,
    scenario: 3,
    technology: '时序分析与预测（智慧种植/产量预测）',
    netWork: 'bridge',
    port: '0.0.0.0:8013/TCP → 0.0.0.0:8013',
    volume: '/var/opt/gitlab/mnt/user → /appdata/agriculture/data',
    status: 4,
    number: '512',
    description: '基于历史数据、生长状况和环境因素，预测农作物产量，辅助农业生产决策。',
    norm: [
      {
        key: 0,
        score: 4
      },
      {
        key: 2,
        score: 4
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '智慧农业研究院',
      companyAddress: '上海市闵行区东川路800号',
      companyContact: '021-54740000',
      companyIntroduce: '专注于农业人工智能技术研发与应用',
      msIntroduce: '基于机器学习的农作物产量预测服务',
      companyScore: 5,
      msScore: 4
    },
    apiList: [
      {
        name: 'predictYield',
        isFake: true,
        url: 'https://myApiServer.com/agriculture/yield/predict',
        method: 'POST',
        des: '预测农作物产量',
        parameterType: 2,
        parameters: [
          {
            name: 'cropType',
            type: 'string',
            required: true,
            des: '作物类型'
          },
          {
            name: 'plantingDate',
            type: 'string',
            required: true,
            des: '播种日期(YYYY-MM-DD)'
          },
          {
            name: 'fieldSize',
            type: 'number',
            required: true,
            des: '田地面积(亩)'
          },
          {
            name: 'historicalData',
            type: 'file',
            required: false,
            des: '历史产量数据(CSV)'
          }
        ],
        responseType: 1,
        response: {
          code: 200,
          message: '产量预测完成',
          data: {
            predictedYield: 550,
            unit: '公斤/亩',
            confidenceInterval: [520, 580],
            harvestDate: '2023-10-05至2023-10-15',
            comparisonWithLastYear: '+5.2%',
            factors: [
              { name: '气候条件', impact: '正面', description: '今年降水量适宜' },
              { name: '土壤状况', impact: '中性', description: '土壤肥力适中' },
              { name: '病虫害风险', impact: '负面', description: '稻飞虱风险增加' }
            ],
            recommendations: [
              '优化施肥方案可能进一步提高产量',
              '注意防治稻飞虱',
              '适当延长灌溉周期'
            ]
          }
        }
      },
      {
        name: 'healthCheck',
        isFake: true,
        url: 'https://myApiServer.com/agriculture/yield/health',
        method: 'GET',
        des: '健康检查接口',
        parameterType: 0,
        parameters: [],
        responseType: 1,
        response: {
          code: 200,
          message: '服务正常',
          data: {
            status: 'running',
            uptime: '15d 22h 55m',
            version: '2.0.4',
            memoryUsage: '41%',
            cpuUsage: '7%'
          }
        }
      }
    ]
  }
]

// 添加农业数智AI元应用数据
const agricultureMetaApps = [
  {
    key: 5,
    name: '智慧农业综合管理元应用',
    attribute: 2,
    type: 1,
    domain: 0,
    industry: 4,
    scenario: 4,
    technology: '计算机视觉、时序分析与预测、多模态融合（智慧种植/精准播种、病虫害防治、智能灌溉、产量预测）',
    netWork: 'host',
    port: '0.0.0.0:9010/TCP → 0.0.0.0:9010',
    volume: '/var/opt/gitlab/mnt/user → /appdata/agriculture/meta',
    status: 4,
    number: '512',
    description: '集成多种农业AI服务的综合管理平台，提供从播种到收获的全程智能决策支持。',
    norm: [
      {
        key: 0,
        score: 5
      },
      {
        key: 2,
        score: 5
      }
    ],
    source: {
      popoverTitle: '可信云技术服务溯源',
      companyName: '智慧农业研究院',
      companyAddress: '上海市闵行区东川路800号',
      companyContact: '021-54740000',
      companyIntroduce: '专注于农业人工智能技术研发与应用',
      msIntroduce: '基于多代理系统的智慧农业综合管理平台',
      companyScore: 5,
      msScore: 5
    },
    apiList: [
      {
        name: '智慧农业综合管理元应用',
        isFake: true,
        inputName: '农业数据输入',
        outputName: '农业智能分析报告',
        outputVisualization: true,
        submitButtonText: '开始诊断',
        url: 'https://myApiServer.com/agriculture/metaApp',
        method: 'POST',
        parameterType: 3,
        responseType: 1,
        response: {
          code: 200,
          message: '分析完成',
          data: {
            predictedYield: 550,
            unit: '公斤/亩',
            confidenceInterval: [520, 580],
            harvestDate: '2023-10-05至2023-10-15',
            comparisonWithLastYear: '+5.2%',
            factors: [
              { name: '气候条件', impact: '正面', description: '今年降水量适宜' },
              { name: '土壤状况', impact: '中性', description: '土壤肥力适中' },
              { name: '病虫害风险', impact: '负面', description: '稻飞虱风险增加' }
            ],
            recommendations: [
              '优化施肥方案可能进一步提高产量',
              '注意防治稻飞虱',
              '适当延长灌溉周期'
            ]
          }
        }
      }
    ]
  }
]

function getAmlServices() {
  if (sessionStorage.getItem('upload_exception_service')) {
    amlServices.find(item => item.name === '异常识别微服务').status = Number(sessionStorage.getItem('upload_exception_service'))
    return amlServices
  } else {
    return amlServices.filter(item => item.name !== '异常识别微服务')
  }
}

function getRunningAmlServices() {
  return getAmlServices().filter(item => item.status === 1 || item.status === 4)
}

function getAirCraftServices() {
  return airCraftServices
}

function getRunningAirCraftServices() {
  return airCraftServices.filter(item => item.status === 1 || item.status === 4)
}

function getAmlMetaApps() {
  if (sessionStorage.getItem('metaAppInfo')) {
    const metaAppInfo = JSON.parse(sessionStorage.getItem('metaAppInfo'))
    return [...amlMetaApps, metaAppInfo]
  } else {
    return amlMetaApps
  }
}

function getRunningAmlMetaApps() {
  return getAmlMetaApps().filter(item => item.status === 1 || item.status === 4)
}

function getAirCraftMetaApps() {
  return airCraftMetaApps
}

function getRunningAirCraftMetaApps() {
  return airCraftMetaApps.filter(item => item.status === 1 || item.status === 4)
}

function getHealthServices() {
  if (sessionStorage.getItem('upload_health_service')) {
    const uploadedService = healthServices.find(item => item.name === '基层医疗影像辅助诊断微服务')
    if (uploadedService) {
      uploadedService.status = Number(sessionStorage.getItem('upload_health_service'))
    }
    return healthServices
  } else {
    return healthServices
  }
}

function getRunningHealthServices() {
  return healthServices.filter(item => item.status === 1 || item.status === 4)
}

function getHealthMetaApps() {
  return healthMetaApps
}

function getRunningHealthMetaApps() {
  return healthMetaApps.filter(item => item.status === 1 || item.status === 4)
}

function getAgricultureServices() {
  return agricultureServices
}

function getRunningAgricultureServices() {
  return agricultureServices.filter(item => item.status === 1 || item.status === 4)
}

function getAgricultureMetaApps() {
  return agricultureMetaApps
}

function getRunningAgricultureMetaApps() {
  return agricultureMetaApps.filter(item => item.status === 1 || item.status === 4)
}

export function getServiceData(serviceType, onlyRunning = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (serviceType) {
        case 'aml':
          resolve(onlyRunning ? getRunningAmlServices() : getAmlServices())
          break
        case 'aircraft':
          resolve(onlyRunning ? getRunningAirCraftServices() : getAirCraftServices())
          break
        case 'health':
          resolve(onlyRunning ? getRunningHealthServices() : getHealthServices())
          break
        case 'agriculture':
          resolve(onlyRunning ? getRunningAgricultureServices() : getAgricultureServices())
          break
        default:
          resolve(onlyRunning ? getRunningAmlServices() : getAmlServices())
      }
    }, 500)
  })
}

export function getMetaAppData(serviceType, onlyRunning = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (serviceType) {
        case 'aml':
          resolve(onlyRunning ? getRunningAmlMetaApps() : getAmlMetaApps())
          break
        case 'aircraft':
          resolve(onlyRunning ? getRunningAirCraftMetaApps() : getAirCraftMetaApps())
          break
        case 'health':
          resolve(onlyRunning ? getRunningHealthMetaApps() : getHealthMetaApps())
          break
        case 'agriculture':
          resolve(onlyRunning ? getRunningAgricultureMetaApps() : getAgricultureMetaApps())
          break
        default:
          resolve(onlyRunning ? getRunningAmlMetaApps() : getAmlMetaApps())
      }
    }, 500)
  })
}
