from pydantic import BaseModel, Field, validator
from typing import List, Optional, Tuple


class PatientData(BaseModel):
    """患者数据输入模型"""
    sex: int = Field(..., description="性别 (1=男性, 0=女性)")
    age: int = Field(..., description="年龄 (岁)", ge=0, le=100)
    height: int = Field(..., description="身高 (厘米)", ge=0, le=200)
    weight: int = Field(..., description="体重 (千克)", ge=0, le=100)
    scr: float = Field(..., description="血清肌酐 (μmol/L)", ge=1, le=500)
    tb: float = Field(..., description="总胆红素 (μmol/L)", ge=1, le=1000)
    auc_range: Tuple[float, float] = Field(
        default=(160, 291.7), 
        description="目标AUC24h范围 (mg·h/L)"
    )
    
    @validator('age', 'height', 'weight')
    def must_be_integer(cls, v):
        if v != int(v):
            raise ValueError('必须是整数')
        return v
    
    @validator('scr', 'tb')
    def must_have_one_decimal(cls, v):
        # 确保只有一位小数
        str_v = str(float(v))
        if '.' in str_v:
            decimal_places = len(str_v.split('.')[1])
            if decimal_places != 1:
                raise ValueError('必须有1位小数')
        return v


class DoseResult(BaseModel):
    """剂量计算结果模型"""
    bsa: float = Field(..., description="体表面积 (m²)")
    egfr: float = Field(..., description="估算肾小球滤过率 (mL/min/1.73m²)")
    dose: int = Field(..., description="推荐剂量 (mg)")
    interval: int = Field(..., description="给药间隔 (小时)")
    daily_dose: int = Field(..., description="每日总剂量 (mg/天)")
    auc_24: int = Field(..., description="预测AUC24h (mg·h/L)")
    target_auc: int = Field(..., description="目标AUC24h (mg·h/L)") 