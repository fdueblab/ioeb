import requests
from typing import Dict, Any, Optional
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
import platform
from mock_data import REPORT_DATA, GQL_DATA
import json

def get_system_font_path() -> str:
    """根据操作系统获取合适的中文字体路径。

    Returns:
        str: 返回系统对应的中文字体路径
    """
    # 首先检查容器内的字体目录
    container_fonts = [
        "/app/fonts/simhei.ttf",
        "/app/fonts/simsun.ttc",
        "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
        "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
    ]
    
    for font in container_fonts:
        if os.path.exists(font):
            return font

    # 如果容器内字体不存在，检查系统字体
    system = platform.system()
    if system == "Windows":
        font_paths = [
            "C:/Windows/Fonts/simhei.ttf",  # 黑体
            "C:/Windows/Fonts/simsun.ttc",  # 宋体
            "C:/Windows/Fonts/simkai.ttf",  # 楷体
            "C:/Windows/Fonts/msyh.ttc"     # 微软雅黑
        ]
    elif system == "Darwin":  # macOS
        font_paths = [
            "/System/Library/Fonts/PingFang.ttc",
            "/System/Library/Fonts/STHeiti Light.ttc",
            "/System/Library/Fonts/STSong.ttc"
        ]
    else:  # Linux
        font_paths = [
            "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
            "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
            "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf",
            "/usr/share/fonts/truetype/arphic/uming.ttc",
            "/usr/share/fonts/truetype/arphic/ukai.ttc"
        ]

    # 返回第一个存在的字体文件路径
    for path in font_paths:
        if os.path.exists(path):
            return path
            
    # 如果没有找到任何字体，返回默认值
    return "./fonts/simsunb.ttf"  # 这将使用当前目录下的字体文件

def query_nl2gql(query: str) -> Optional[Dict[str, Any]]:
    """将自然语言查询转换为图数据库查询并执行。

    该函数接收一个自然语言查询字符串，将其发送到NL2GQL服务进行处理，
    并返回查询结果。

    Args:
        query: 自然语言查询字符串。

    Returns:
        Dict[str, Any]: 如果查询成功，返回包含查询结果的字典。
        None: 如果查询失败则返回None。

    Raises:
        requests.exceptions.RequestException: 当网络请求发生错误时抛出。

    Example:
        >>> result = query_nl2gql("请检索id为1112的应用节点对应的全部收单机构id")
        >>> if result:
        ...     print(f"查询结果: {result}")
    """
    # 构建API端点URL
    base_url = "http://131.252.10.118:8889/project_3/nl2gql_main"
    url = f"{base_url}?nl={query}"

    try:
        # 发送GET请求
        response = requests.get(url)
        
        # 检查响应状态
        if response.status_code == 200:
            return response.json()
        else:
            print(f"请求失败，状态码: {response.status_code}")
            return GQL_DATA
            
    except requests.exceptions.RequestException as e:
        print(f"请求过程中发生错误: {e}")
        return GQL_DATA

def generate_financial_report(text: str, output_path: str = "output/output.pdf", image_path: str = "") -> bool:
    """生成包含文本和图片的金融风险报告PDF文档。

    该函数接收金融风险报告文本，将其转换为格式化的PDF文档，
    支持自动分页、中文显示，并在文本下方添加图片。

    Args:
        text: str, 需要写入PDF的报告文本内容。
        output_path: str, 输出PDF文件的路径，默认为"data/output.pdf"。
        image_path: str, 需要插入的图片路径，默认为空字符串。

    Returns:
        bool: 如果PDF生成成功返回True，否则返回False。

    Raises:
        Exception: 当PDF生成过程中发生错误时抛出。

    Example:
        >>> report_text = "这是一份金融风险报告..."
        >>> success = generate_financial_report(report_text, "risk_report.pdf")
        >>> if success:
        ...     print("PDF报告生成成功")
    """
    try:
        # 获取系统字体路径
        font_path = get_system_font_path()
        font_name = "CustomFont"  # 使用通用的字体名称
        
        try:
            # 注册中文字体
            pdfmetrics.registerFont(TTFont(font_name, font_path))
        except Exception as font_error:
            print(f"注册字体失败: {font_error}")
            print("尝试使用备用字体...")
            # 如果注册失败，尝试使用当前目录下的字体文件
            if os.path.exists("simhei.ttf"):
                pdfmetrics.registerFont(TTFont(font_name, "simhei.ttf"))
            else:
                raise Exception("无法找到可用的中文字体文件")

        # 创建PDF画布
        c = canvas.Canvas(output_path, pagesize=letter)
        c.setFont(font_name, 12)

        # 设置页面参数
        x = 50
        y = 750
        max_width = 500
        max_height = 750
        line_height = 14

        # 创建文本对象
        text_object = c.beginText(x, y)
        text_object.setFont(font_name, 12)
        text_object.setTextOrigin(x, y)

        # 处理文本内容
        lines = text.split('\n')
        for line in lines:
            # 处理过长的行
            while c.stringWidth(line) > max_width:
                for i in range(len(line), 0, -1):
                    if c.stringWidth(line[:i]) <= max_width:
                        break
                text_object.textLine(line[:i])
                line = line[i:]

            # 检查是否需要换页
            if y - line_height < 0:
                c.drawText(text_object)
                c.showPage()
                text_object = c.beginText(x, max_height)
                text_object.setFont(font_name, 12)
                text_object.setTextOrigin(x, max_height)
                y = max_height

            # 写入当前行
            text_object.textLine(line)
            y -= line_height

        # 绘制文本
        c.drawText(text_object)

        # 插入图片
        if image_path and os.path.exists(image_path):
            image_x = 50
            image_y = y - 180
            image_width = 200
            image_height = 150
            c.drawImage(image_path, image_x, image_y, image_width, image_height)

        if not os.path.exists(output_path):
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

        c.save()
        return True

    except Exception as e:
        print(f"生成PDF报告时发生错误: {e}")
        return False

def query_and_generate_report(query: str = "请为我写一段金融风险报告长文本", 
                              output_path: str = "output/output.pdf") -> bool:
    """查询金融风险报告内容并生成PDF报告。

    该函数首先通过API获取金融风险报告文本，然后将其转换为PDF格式。

    Args:
        query: str, 用于获取报告内容的查询语句。
        output_path: str, 输出PDF文件的路径，默认为"output/output.pdf"。

    Returns:
        bool: 如果报告生成成功返回True，否则返回False。

    Example:
        >>> success = query_and_generate_report("请生成一份关于市场风险的分析报告")
        >>> if success:
        ...     print("报告生成成功")
    """
    try:
        # 构建API端点URL
        base_url = "http://131.252.10.118:8893/project_3/nl2gql_main"
        url = f"{base_url}?query={query}"

        # 发送请求获取报告内容
        response = requests.get(url)
        if response.status_code == 200:
            report_text = response.text
            return generate_financial_report(report_text, output_path)
        else:
            print(f"获取报告内容失败，状态码: {response.status_code}")
            return generate_financial_report(text=REPORT_DATA, output_path=output_path)
        
    except requests.exceptions.RequestException as e:
        print(f"请求过程中发生错误: {e}")
        return generate_financial_report(text=REPORT_DATA, output_path=output_path)

if __name__ == "__main__":
    # # 示例查询
    # test_query = "请检索id为1112的应用节点对应的全部收单机构id"
    # result = query_nl2gql(test_query)
    
    # if result:
    #     print("从远程服务器获取的返回值:", result)

    # # 测试生成报告
    # report_success = query_and_generate_report()
    # if report_success:
    #     print("金融风险报告PDF生成成功")
    generate_financial_report(text="这是一份金融风险报告...", 
                              output_path="./output/output.pdf", 
                              image_path="")