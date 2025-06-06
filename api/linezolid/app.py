import logging
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api.linezolid_models import PatientData, DoseResult
from api.calculator import calculate_linezolid_dose
from typing import Dict, Any

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("linezolid_app")

# 创建FastAPI应用
app = FastAPI(
    title="利奈唑胺剂量计算器 API",
    description="""
    # 利奈唑胺剂量计算器 API 文档
    
    此API用于肝移植患者利奈唑胺个体化给药剂量的计算。
    
    ## 功能特点
    
    * 根据患者的人口统计学特征（年龄、性别、身高、体重）计算体表面积
    * 根据血清肌酐计算估算肾小球滤过率(eGFR)
    * 根据患者的肝肾功能参数调整剂量
    * 预测给药方案下的AUC24h值
    * 推荐最佳给药间隔和剂量
    
    ## 使用说明
    
    1. 通过`/api/linezolid/calculate`端点提交患者数据
    2. 系统将返回推荐剂量、给药间隔和预测的AUC24h
    
    ## 免责声明
    
    此计算器仅用于研究目的，仅应用于肝移植患者。计算结果不应替代专业医疗判断。
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "linezolid",
            "description": "利奈唑胺剂量计算相关端点",
        },
        {
            "name": "system",
            "description": "系统相关端点"
        }
    ]
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 示例患者数据
example_patient = {
    "sex": 1,
    "age": 59,
    "height": 169,
    "weight": 65,
    "scr": 127.0,
    "tb": 126.0,
    "auc_range": [160, 291.7]
}

# 示例响应数据
example_response = {
    "bsa": 1.75,
    "egfr": 55.3,
    "dose": 600,
    "interval": 12,
    "daily_dose": 1200,
    "auc_24": 223,
    "target_auc": 216
}

@app.post(
    "/api/calculate", 
    response_model=DoseResult, 
    tags=["linezolid"],
    summary="计算利奈唑胺推荐剂量",
    description="""
    根据患者的基本信息计算推荐的利奈唑胺剂量。
    
    计算考虑因素:
    * 体表面积 (使用Mosteller公式)
    * 估算肾小球滤过率 (使用CKD-EPI公式)
    * 肝功能 (通过总胆红素)
    * 目标AUC24h范围
    
    计算基于群体药代动力学模型。
    """,
    responses={
        200: {
            "description": "剂量计算成功",
            "content": {
                "application/json": {
                    "example": example_response
                }
            }
        },
        422: {
            "description": "输入验证错误",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "scr"],
                                "msg": "必须有1位小数",
                                "type": "value_error"
                            }
                        ]
                    }
                }
            }
        },
        500: {
            "description": "服务器内部错误",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "计算剂量时出错: 除以零错误"
                    }
                }
            }
        }
    }
)
async def calculate_dose(patient_data: PatientData):
    """
    计算利奈唑胺推荐剂量
    
    此API根据输入的患者数据，计算推荐的利奈唑胺剂量，
    以达到目标AUC24h范围。
    """
    try:
        logger.info(f"接收到剂量计算请求: {patient_data}")
        result = calculate_linezolid_dose(patient_data)
        logger.info(f"计算结果: {result}")
        return result
    except Exception as e:
        logger.error(f"计算剂量时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"计算剂量时出错: {str(e)}")

@app.get(
    "/", 
    tags=["system"],
    summary="API根端点",
    description="返回API的基本信息",
    response_model=Dict[str, Any]
)
async def root():
    """API根端点，返回基本信息"""
    return {
        "name": "利奈唑胺剂量计算器 API",
        "version": "1.0.0",
        "description": "肝移植患者利奈唑胺剂量计算API"
    }

@app.get(
    "/api/health", 
    tags=["system"],
    summary="健康检查",
    description="用于监控和负载均衡器的健康检查端点",
    response_model=Dict[str, str]
)
async def health_check():
    """健康检查端点"""
    return {"status": "healthy"} 

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
