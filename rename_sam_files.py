#!/usr/bin/env python3
"""
重新命名 sam 資料夾的檔案：
1. 提取 sam_cleaned 的編號和標題
2. 根據內容關鍵字匹配 sam 原始檔案
3. 重新命名 sam 檔案為：編號_繁體標題.txt
"""
import os
import re
import json
import shutil
from opencc import OpenCC

SAM_DIR = "/Users/jameschen/Downloads/單板教學/sam"
CLEANED_DIR = "/Users/jameschen/Downloads/單板教學/sam_cleaned"
BACKUP_DIR = "/Users/jameschen/Downloads/單板教學/sam_backup"
OUTPUT_JSON = "/Users/jameschen/Downloads/單板教學/final_mapping.json"

# 簡轉繁
cc = OpenCC('s2t')

def extract_cleaned_info():
    """提取 cleaned 檔案的編號和標題"""
    cleaned_info = {}
    
    for filename in os.listdir(CLEANED_DIR):
        if not filename.endswith('.md'):
            continue
        
        match = re.match(r'^(\d+)_(.+?)__L-.+\.md$', filename)
        if match:
            num = match.group(1)
            title = match.group(2)
            cleaned_info[num] = {
                'filename': filename,
                'title': title,
                'path': os.path.join(CLEANED_DIR, filename)
            }
    
    return cleaned_info

def find_sam_by_number(sam_files, number):
    """在 sam 檔案中找編號開頭的檔案"""
    # 移除前導零
    num_int = int(number)
    
    for sam_file in sam_files:
        # 匹配 "01 xxx" 或 "1 xxx" 格式
        if re.match(rf'^0*{num_int}\s', sam_file) or re.match(rf'^0*{num_int}_', sam_file):
            return sam_file
    
    return None

def main():
    print("🔍 開始重新命名 sam 檔案...")
    
    # 備份
    if not os.path.exists(BACKUP_DIR):
        print(f"📦 建立備份資料夾: {BACKUP_DIR}")
        shutil.copytree(SAM_DIR, BACKUP_DIR)
    
    # 取得 cleaned 資訊
    cleaned_info = extract_cleaned_info()
    print(f"✅ 找到 {len(cleaned_info)} 個 cleaned 檔案")
    
    # 取得 sam 檔案列表
    sam_files = [f for f in os.listdir(SAM_DIR) if f.endswith('.txt') and not f.startswith('.')]
    print(f"✅ 找到 {len(sam_files)} 個 sam 檔案")
    
    # 建立對應關係
    mapping = {}
    renamed_count = 0
    
    for num in sorted(cleaned_info.keys(), key=lambda x: int(x)):
        info = cleaned_info[num]
        
        # 找對應的 sam 檔案
        sam_file = find_sam_by_number(sam_files, num)
        
        if sam_file:
            old_path = os.path.join(SAM_DIR, sam_file)
            new_filename = f"{num}_{info['title']}.txt"
            new_path = os.path.join(SAM_DIR, new_filename)
            
            # 重新命名
            if old_path != new_path:
                os.rename(old_path, new_path)
                print(f"✅ [{num}] {sam_file} → {new_filename}")
                renamed_count += 1
            
            mapping[num] = {
                'sam_original': sam_file,
                'sam_new': new_filename,
                'cleaned': info['filename'],
                'title': info['title']
            }
        else:
            print(f"❌ [{num}] 找不到對應的 sam 檔案")
            mapping[num] = {
                'sam_original': None,
                'sam_new': None,
                'cleaned': info['filename'],
                'title': info['title']
            }
    
    # 儲存對應關係
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 統計：")
    print(f"  - 成功重新命名: {renamed_count} 個檔案")
    print(f"  - 找不到對應: {len([v for v in mapping.values() if v['sam_original'] is None])} 個")
    print(f"\n✅ 對應關係已儲存至: {OUTPUT_JSON}")
    print(f"✅ 原始檔案已備份至: {BACKUP_DIR}")

if __name__ == "__main__":
    main()
