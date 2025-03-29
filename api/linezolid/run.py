import uvicorn
import argparse
from gradio_app import create_gradio_app
import os
from multiprocessing import Process


def run_fastapi(port=5000):
    """启动FastAPI服务器"""
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)


def run_gradio(port=7860):
    """启动Gradio界面"""
    app = create_gradio_app()
    app.launch(server_name="0.0.0.0", server_port=port, share=False)


def main():
    """程序主入口"""
    parser = argparse.ArgumentParser(description='利奈唑胺剂量计算器')
    parser.add_argument('--api-only', action='store_true', help='仅启动API服务')
    parser.add_argument('--ui-only', action='store_true', help='仅启动UI界面')
    parser.add_argument('--api-port', type=int, default=5000, help='API服务端口')
    parser.add_argument('--ui-port', type=int, default=7860, help='UI界面端口')
    args = parser.parse_args()
    
    # 设置环境变量
    os.environ["API_URL"] = f"http://localhost:{args.api_port}"
    
    if args.api_only:
        # 仅启动API
        run_fastapi(port=args.api_port)
    elif args.ui_only:
        # 仅启动UI
        run_gradio(port=args.ui_port)
    else:
        # 同时启动API和UI
        api_process = Process(target=run_fastapi, args=(args.api_port,))
        ui_process = Process(target=run_gradio, args=(args.ui_port,))
        
        api_process.start()
        ui_process.start()
        
        print(f"API服务运行在 http://localhost:{args.api_port}")
        print(f"UI界面运行在 http://localhost:{args.ui_port}")
        
        try:
            api_process.join()
            ui_process.join()
        except KeyboardInterrupt:
            print("正在关闭服务...")
            api_process.terminate()
            ui_process.terminate()
            api_process.join()
            ui_process.join()
            print("服务已关闭")


if __name__ == "__main__":
    main() 