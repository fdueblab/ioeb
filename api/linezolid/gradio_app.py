import gradio as gr
import requests
import time
import os
import json
from datetime import datetime

# API URL配置
API_URL = os.environ.get("API_URL", "http://localhost:5000")


def calculate_dose(sex, age, height, weight, scr, tb, auc_range):
    """调用API计算剂量并返回结果"""
    try:
        # 验证输入
        error_messages = []
        
        if not age or not age.isdigit():
            error_messages.append("年龄必须是整数")
        
        if not height or not height.isdigit():
            error_messages.append("身高必须是整数")
        
        if not weight or not weight.isdigit():
            error_messages.append("体重必须是整数")
        
        # 验证血清肌酐和总胆红素只有一位小数
        try:
            scr_float = float(scr)
            if str(scr_float).split('.')[-1] != str(scr).split('.')[-1] or len(str(scr).split('.')[-1]) != 1:
                error_messages.append("血清肌酐必须有1位小数")
        except:
            error_messages.append("血清肌酐必须是有效数字")
            
        try:
            tb_float = float(tb)
            if str(tb_float).split('.')[-1] != str(tb).split('.')[-1] or len(str(tb).split('.')[-1]) != 1:
                error_messages.append("总胆红素必须有1位小数")
        except:
            error_messages.append("总胆红素必须是有效数字")
        
        if error_messages:
            return "\n".join(error_messages), None
        
        # 处理滑块值 - 可能是单一数值或列表
        if isinstance(auc_range, list):
            # 是列表，直接解包
            auc_min, auc_max = auc_range
        else:
            # 是单一值，将其设为最小值和最大值
            auc_min = auc_max = float(auc_range)
            
        # 准备API请求数据
        data = {
            "sex": 1 if sex == "男性" else 0,
            "age": int(age),
            "height": int(height),
            "weight": int(weight),
            "scr": float(scr),
            "tb": float(tb),
            "auc_range": [float(auc_min), float(auc_max)]
        }
        
        # 发送API请求
        response = requests.post(f"{API_URL}/api/linezolid/calculate", json=data)
        
        if response.status_code != 200:
            return f"API错误: {response.status_code} - {response.text}", None
            
        result = response.json()
        
        # 格式化结果
        result_text = f"""
        ✅ 推荐剂量为: {result['dose']} mg, {result['interval']} 小时一次
        
        (每日总量: {result['daily_dose']} mg/天)
        
        使用此剂量，预测的AUC₂₄ₕ为: {result['auc_24']} mg·h/L
        
        患者数据:
        - 体表面积: {result['bsa']} m²
        - 估算肾小球滤过率: {result['egfr']} mL/min/1.73m²
        """
        
        # 复制到剪贴板的信息
        clipboard_text = f"""利奈唑胺剂量计算器 - 肝移植患者
计算时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
年龄: {age} 岁
性别: {sex}
身高: {height} cm
体重: {weight} kg
体表面积: {result['bsa']} m²
血清肌酐: {scr} μmol/L
估算肾小球滤过率: {result['egfr']} mL/min/1.73m²
总胆红素: {tb} μmol/L
目标AUC范围: {auc_min} - {auc_max} mg·h/L
--------------------------------------------------
推荐剂量: {result['dose']} mg, {result['interval']} 小时一次 ({result['daily_dose']} mg/天)
预测AUC₂₄ₕ: {result['auc_24']} mg·h/L
"""
        
        return result_text, clipboard_text
        
    except Exception as e:
        return f"计算过程中发生错误: {str(e)}", None


def create_gradio_app():
    """创建Gradio界面"""
    with gr.Blocks(title="利奈唑胺剂量计算器", theme=gr.themes.Soft(primary_hue="teal")) as app:
        gr.Markdown(
            """
            # 利奈唑胺剂量计算器 - 肝移植患者
            
            此计算器用于为肝移植患者提供个体化的利奈唑胺剂量推荐。
            """,
            elem_id="title"
        )
        
        with gr.Row():
            with gr.Column(scale=7):
                with gr.Group():  # 使用Group替代Box
                    with gr.Group():
                        with gr.Row():
                            sex = gr.Radio(
                                ["男性", "女性"], 
                                label="性别", 
                                value="男性"
                            )
                            
                            age = gr.Textbox(
                                label="年龄 (岁)",
                                placeholder="59",
                                info="请输入整数"
                            )
                        
                        with gr.Row():
                            height = gr.Textbox(
                                label="身高 (厘米)",
                                placeholder="169",
                                info="请输入整数"
                            )
                            
                            weight = gr.Textbox(
                                label="体重 (千克)",
                                placeholder="65",
                                info="请输入整数"
                            )
                        
                        with gr.Row():
                            scr = gr.Textbox(
                                label="血清肌酐 (μmol/L)",
                                placeholder="127.0",
                                info="请输入有1位小数的数字"
                            )
                            
                            tb = gr.Textbox(
                                label="总胆红素 (μmol/L)",
                                placeholder="126.0",
                                info="请输入有1位小数的数字"
                            )
                        
                        # 修改滑块配置确保返回列表
                        auc_range = gr.Slider(
                            minimum=80,
                            maximum=400,
                            value=[160, 291.7],
                            label="目标AUC24h范围 (mg·h/L)",
                            info="滑动调整目标范围",
                            step=0.1
                        )
                        
                        with gr.Row():
                            calculate_btn = gr.Button(
                                "计算剂量", 
                                variant="primary",
                                scale=2
                            )
                            
                            clear_btn = gr.Button(
                                "清除", 
                                variant="secondary",
                                scale=1
                            )
            
            # 结果显示区域
            with gr.Column(scale=5):
                with gr.Group():
                    result_text = gr.Textbox(
                        label="计算结果",
                        placeholder="点击'计算剂量'按钮查看结果",
                        lines=10,
                        show_copy_button=True
                    )
                    
                    clipboard_text = gr.Textbox(
                        visible=False
                    )
                    
                    copy_btn = gr.Button("复制完整结果到剪贴板")
        
        # 免责声明
        with gr.Accordion("用途声明与免责声明", open=False):
            gr.Markdown(
                """
                ### 用途声明
                
                "肝移植患者利奈唑胺剂量计算器"是一个为肝移植患者提供个体化利奈唑胺剂量的计算工具。它根据个体的年龄、体表面积、总胆红素和估算肾小球滤过率，推荐达到稳态AUC24在160-291.7 mg/L·h之间所需的剂量。体表面积使用Mosteller公式计算，估算肾小球滤过率使用CKD-EPI公式计算。
                
                此计算器仅用于研究目的，仅应用于肝移植患者。
                
                ### 免责声明
                
                本网络计算器按"原样"提供，不提供任何形式的明示或暗示担保，包括但不限于对适销性、特定用途适用性和非侵权性的担保。在任何情况下，作者或版权持有人均不对因软件或软件的使用或其他交易而产生的任何索赔、损害或其他责任承担责任，无论是合同行为、侵权行为还是其他方面。
                
                用户应注意，尽管信息来源于医学研究和文献，但我们不保证其正确性、全面性或时效性。该信息不旨在替代临床医生的临床判断。本软件的用户对基于系统中包含的信息做出的任何决定或采取的行动承担全部责任。
                """
            )
        
        # 设置事件处理
        calculate_btn.click(
            calculate_dose,
            inputs=[sex, age, height, weight, scr, tb, auc_range],
            outputs=[result_text, clipboard_text]
        )
        
        clear_btn.click(
            lambda: (
                "男性", "", "", "", "", "", 
                [160, 291.7],
                "点击'计算剂量'按钮查看结果", 
                None
            ),
            inputs=None,
            outputs=[
                sex, age, height, weight, scr, tb, 
                auc_range,
                result_text, clipboard_text
            ]
        )
        
        def copy_to_clipboard(text):
            if text:
                return text
            return "没有可复制的结果"
        
        copy_btn.click(
            copy_to_clipboard,
            inputs=[clipboard_text],
            outputs=[result_text]
        )
    
    return app


if __name__ == "__main__":
    app = create_gradio_app()
    app.launch(server_name="0.0.0.0") 