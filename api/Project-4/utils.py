import os
import shutil
import zipfile

def process_uploaded_dataset(zip_file, save_dir='temp_dataset'):
    """
    处理上传的数据集压缩文件
    Args:
        zip_file: 上传的ZIP文件对象
        save_dir: 保存数据集的目录
    Returns:
        str: 保存的数据集路径
    """
    try:
        # 确保目录为空
        if os.path.exists(save_dir):
            shutil.rmtree(save_dir)
        os.makedirs(save_dir)
        
        # 解压文件
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(save_dir)
        
        # 验证必要的文件是否存在
        required_files = ['meta.yaml']  # 添加其他必要的文件
        for file in required_files:
            if not os.path.exists(os.path.join(save_dir, file)):
                raise Exception(f"缺少必要的文件: {file}")
        
        return save_dir
        
    except zipfile.BadZipFile:
        raise Exception("无效的ZIP文件")
    except Exception as e:
        # 清理临时目录
        if os.path.exists(save_dir):
            shutil.rmtree(save_dir)
        raise Exception(f"处理数据集时出错: {str(e)}")