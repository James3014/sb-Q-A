#!/usr/bin/env python3
import os
import re

SAM_DIR = "/Users/jameschen/Downloads/單板教學/sam"
CLEANED_DIR = "/Users/jameschen/Downloads/單板教學/sam_cleaned"

# 手動對應表（根據編號）
mapping = {}

# 自動找 01-95 有編號的
for i in range(1, 96):
    num_str = f"{i:02d}"
    
    # 找 sam 檔案
    sam_files = [f for f in os.listdir(SAM_DIR) if f.startswith(f"{num_str} ") or f.startswith(f"{i} ")]
    if sam_files:
        sam_file = sam_files[0]
        
        # 找對應的 cleaned 檔案
        cleaned_files = [f for f in os.listdir(CLEANED_DIR) if f.startswith(f"{num_str}_") and f.endswith('.md')]
        if cleaned_files:
            mapping[cleaned_files[0]] = sam_file

print(f"找到 {len(mapping)} 個對應關係")
print("\n前10個對應：")
for i, (cleaned, sam) in enumerate(list(mapping.items())[:10], 1):
    print(f"{i}. {cleaned[:40]}... → {sam[:40]}...")

# 詢問是否繼續
response = input("\n是否在 sam_cleaned 檔案底部加入來源標記？(y/n): ")
if response.lower() != 'y':
    print("取消操作")
    exit()

# 加入來源標記
updated = 0
for cleaned_file, sam_file in mapping.items():
    cleaned_path = os.path.join(CLEANED_DIR, cleaned_file)
    
    with open(cleaned_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 檢查是否已有來源標記
    if '**原始逐字稿**' in content:
        continue
    
    # 在最後加入
    source_tag = f"\n\n---\n**原始逐字稿**: `sam/{sam_file}`\n"
    
    with open(cleaned_path, 'w', encoding='utf-8') as f:
        f.write(content.rstrip() + source_tag)
    
    updated += 1

print(f"\n✅ 已更新 {updated} 個檔案")
