import numpy as np
import math
from scipy.integrate import solve_ivp
from api.linezolid_models import PatientData, DoseResult


# 人群参数
POP_PARAMS = {
    'TVCLNR': 3.27,  # 非肾清除率群体典型值
    'TVCLR': 1.71,   # 肾清除率群体典型值
    'TVV': 43.3,     # 分布容积群体典型值
    'TVKA': 1.34,    # 吸收速率常数群体典型值
    'TVF1': 1.0      # 生物利用度群体典型值
}


def calculate_bsa(height, weight):
    """
    使用Mosteller公式计算体表面积
    
    Args:
        height: 身高(cm)
        weight: 体重(kg)
        
    Returns:
        float: 体表面积(m²)
    """
    return round(math.sqrt(height * weight / 3600), 2)


def calculate_egfr(scr, sex, age):
    """
    使用CKD-EPI公式计算估算肾小球滤过率
    
    Args:
        scr: 血清肌酐(μmol/L)
        sex: 性别(1=男性, 0=女性)
        age: 年龄(岁)
        
    Returns:
        float: 估算肾小球滤过率(mL/min/1.73m²)
    """
    k = 80 if sex == 1 else 62  # 男性k=80, 女性k=62
    a = -0.411 if sex == 1 else -0.329
    c = 1 if sex == 1 else 1.018
    b = a if scr <= k else -1.209
    result = 141 * c * (scr / k) ** b * 0.993 ** age
    return round(result, 2)


def linezolid_ode_system(t, y, cl, v, ka, f1):
    """
    利奈唑胺的微分方程系统
    
    Args:
        t: 时间点
        y: 状态变量 [depot, centr, auc]
        cl: 清除率
        v: 分布容积
        ka: 吸收速率常数
        f1: 生物利用度
        
    Returns:
        list: 导数 [d(depot)/dt, d(centr)/dt, d(auc)/dt]
    """
    depot, centr, auc = y
    c1 = centr / v
    
    d_depot = -ka * depot
    d_centr = f1 * ka * depot - cl * c1
    d_auc = c1
    
    return [d_depot, d_centr, d_auc]


def simulate_linezolid_pk(dose, interval, duration, parameters, simulation_time):
    """
    模拟利奈唑胺的药代动力学
    
    Args:
        dose: 剂量(mg)
        interval: 给药间隔(h)
        duration: 输注持续时间(h)
        parameters: 参数字典 {'indCLNR', 'indCLR', 'indV', 'indKA', 'indF1'}
        simulation_time: 模拟时间(h)
        
    Returns:
        dict: 包含模拟结果的字典
    """
    # 提取参数
    cl = parameters['indCLNR'] + parameters['indCLR']
    v = parameters['indV']
    ka = parameters['indKA']
    f1 = parameters['indF1']
    
    # 初始状态
    y0 = [0, 0, 0]  # [depot, centr, auc]
    
    # 模拟结果
    time_points = []
    states = []
    
    # 模拟多次给药
    for dose_time in range(0, simulation_time, interval):
        # 加入剂量到中央室
        if len(states) > 0:
            y0 = states[-1].copy()
            y0[1] += dose  # 加入剂量到中央室
        else:
            y0[1] = dose  # 初始剂量
        
        # 解微分方程
        t_span = [dose_time, dose_time + min(interval, simulation_time - dose_time)]
        t_eval = np.linspace(t_span[0], t_span[1], 100)
        
        sol = solve_ivp(
            linezolid_ode_system, 
            t_span, 
            y0, 
            args=(cl, v, ka, f1), 
            method='RK45', 
            t_eval=t_eval
        )
        
        time_points.extend(sol.t)
        for i in range(len(sol.t)):
            states.append(sol.y[:, i])
    
    # 将结果转换为数组
    times = np.array(time_points)
    results = np.array(states)
    
    # 计算最后24小时的AUC
    auc_24h = results[-1][2] - results[np.searchsorted(times, times[-1] - 24)][2]
    
    return {
        'times': times,
        'states': results,
        'auc_24h': auc_24h
    }


def _calculate_linezolid_dose_impl(sex, age, height, weight, scr, tb, auc_range=[160,240]):
    """
    计算利奈唑胺的推荐剂量 - 内部实现函数
    
    Args:
        sex: 性别(1=男性, 0=女性)
        age: 年龄(岁)
        height: 身高(厘米)
        weight: 体重(千克)
        scr: 血清肌酐(μmol/L)
        tb: 总胆红素(μmol/L)
        auc_range: 目标AUC24h范围(min, max)
        
    Returns:
        dict: 包含计算结果的字典
    """
    # 计算BSA和eGFR
    bsa = calculate_bsa(height, weight)
    egfr = calculate_egfr(scr, sex, age)
    
    # 设置固定参数
    interval = 12  # 12小时
    rate = 300  # 输注速率 mg/h
    
    # 计算目标AUC (几何平均值)
    target_auc_24h = round(math.sqrt(auc_range[0] * auc_range[1]))
    
    # 计算个体清除率
    age_ind = 1 if age > 40 else 0
    tb_ind = 1 if tb > 400 else 0
    
    cl_nr = POP_PARAMS['TVCLNR'] + 3.43 * (bsa - 1.89) - 0.0225 * (age - 40) * age_ind - 0.00486 * (tb - 400) * tb_ind
    cl_r = POP_PARAMS['TVCLR'] * (egfr / 80) ** 0.41
    cl = cl_nr + cl_r
    
    # 基于协变量的剂量 = AUCss * CL
    cov_dose = round((target_auc_24h / (24 / interval)) * cl)
    
    # 计算每日剂量
    daily_dose = round(cov_dose * (24 / interval))
    
    # 计算输注持续时间
    infusion_duration = cov_dose / rate
    
    # 定义个体参数
    parameters = {
        'indCLNR': POP_PARAMS['TVCLNR'] + 3.43 * (bsa - 1.89) - 0.0225 * (age - 40) * age_ind - 0.00486 * (tb - 400) * tb_ind,
        'indCLR': POP_PARAMS['TVCLR'] * (egfr / 80) ** 0.41,
        'indV': POP_PARAMS['TVV'] * math.exp(0.902 * (bsa - 1.89)),
        'indKA': POP_PARAMS['TVKA'],
        'indF1': POP_PARAMS['TVF1']
    }
    
    # 模拟PK过程
    sim_results = simulate_linezolid_pk(
        dose=cov_dose,
        interval=interval,
        duration=infusion_duration,
        parameters=parameters,
        simulation_time=240  # 模拟10天
    )
    
    # 计算AUC24h
    auc_24h = round(sim_results['auc_24h'])
    
    # 返回结果字典
    return {
        'bsa': bsa,
        'egfr': egfr,
        'dose': cov_dose,
        'interval': interval,
        'daily_dose': daily_dose,
        'auc_24': auc_24h,
        'target_auc': target_auc_24h
    }


def calculate_linezolid_dose(patient_data: PatientData) -> DoseResult:
    """
    计算利奈唑胺的推荐剂量
    
    Args:
        patient_data: 患者数据
        
    Returns:
        DoseResult: 剂量计算结果
    """
    # 从PatientData对象提取基本数据
    sex = patient_data.sex
    age = patient_data.age
    height = patient_data.height
    weight = patient_data.weight
    scr = patient_data.scr
    tb = patient_data.tb
    auc_range = patient_data.auc_range
    
    # 调用内部实现函数进行计算
    result_dict = _calculate_linezolid_dose_impl(
        sex=sex,
        age=age,
        height=height,
        weight=weight,
        scr=scr,
        tb=tb,
        auc_range=auc_range
    )
    
    # 将结果封装为DoseResult对象并返回
    return DoseResult(**result_dict) 