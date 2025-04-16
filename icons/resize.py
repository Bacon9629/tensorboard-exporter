import matplotlib.pyplot as plt
from PIL import Image
import numpy as np
import io
import os
from pathlib import Path

# 創建輸出目錄
output_dir = Path('./')
output_dir.mkdir(exist_ok=True)

# 讀取上傳的圖片
img = Image.open('icon_src.png')
print(f"原始圖片尺寸: {img.size}")
print(f"圖片模式: {img.mode}")

# 調整圖片大小
sizes = [16, 48, 128]
resized_images = {}

for size in sizes:
    # 使用高質量的縮放方法
    resized = img.resize((size, size), Image.LANCZOS)
    resized_images[size] = resized

    # 保存圖片
    output_path = output_dir / f"icon{size}.png"
    resized.save(output_path)
    print(f"已保存 {size}x{size} 圖標到 {output_path}")

# 顯示所有調整後的圖標
fig, axes = plt.subplots(1, len(sizes), figsize=(12, 4))

for i, size in enumerate(sizes):
    axes[i].imshow(np.array(resized_images[size]))
    axes[i].set_title(f"{size}x{size}")
    axes[i].axis('off')

plt.tight_layout()
plt.show()

# 確認所有文件都已創建
print("\n創建的文件列表:")
for file in output_dir.glob("*.png"):
    file_info = os.stat(file)
    print(f"{file.name} - {file_info.st_size} bytes")
