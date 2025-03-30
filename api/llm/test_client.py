import requests
import json
import sys

def chat_with_model(messages):
    """
    调用流式API并打印结果
    """
    url = "http://localhost:8000/api/chat"
    headers = {"Content-Type": "application/json"}
    data = {
        "messages": messages,
        "model": "gpt-3.5-turbo",  # 指定模型
        "temperature": 0.7         # 可选参数
    }
    
    print("正在发送请求...\n")
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data), stream=True)
        
        # 检查响应状态
        if response.status_code != 200:
            print(f"错误: 服务器返回状态码 {response.status_code}")
            if response.status_code == 404:
                print("提示: 请确保服务已启动并在正确的端口(8000)上运行")
            return
        
        print("模型回复:")
        print("-" * 50)
        
        # 处理流式响应
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    data = line[6:]  # 去掉'data: '前缀
                    if data == "[DONE]":
                        break
                    try:
                        content = json.loads(data)
                        if 'content' in content:
                            print(content['content'], end='', flush=True)
                        elif 'error' in content:
                            print(f"\n错误: {content['error']}")
                    except json.JSONDecodeError:
                        print(f"\n解析错误: {data}")
    except requests.exceptions.ConnectionError:
        print("错误: 连接失败。请确保服务已启动，并检查以下几点:")
        print("1. 服务是否在http://localhost:8000上运行")
        print("2. 是否安装了正确版本的OpenAI SDK (openai>=1.0.0)")
        print("3. 是否设置了有效的OpenAI API密钥")
    except Exception as e:
        print(f"发生错误: {str(e)}")
    finally:
        print("\n" + "-" * 50)

if __name__ == "__main__":
    # 如果命令行有参数，使用参数作为用户输入
    user_input = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "你好，请介绍一下自己"
    
    messages = [
        {"role": "user", "content": user_input}
    ]
    
    print(f"用户输入: {user_input}")
    chat_with_model(messages) 