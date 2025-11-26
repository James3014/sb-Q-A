#!/usr/bin/env python3
import os
import re
import json

SAM_DIR = "/Users/jameschen/Downloads/單板教學/sam"
CLEANED_DIR = "/Users/jameschen/Downloads/單板教學/sam_cleaned"

def extract_keywords(title):
    """提取標題關鍵字（移除數字、標點）"""
    # 移除編號
    title = re.sub(r'^\d+\s*', '', title)
    # 移除特殊符號
    title = re.sub(r'[_\-｜：:？?！!。、，,\s]+', '', title)
    return title.lower()

def find_match(cleaned_title, sam_files):
    """根據標題關鍵字找匹配的 sam 檔案"""
    cleaned_key = extract_keywords(cleaned_title)
    
    best_match = None
    best_score = 0
    
    for sam_file in sam_files:
        sam_key = extract_keywords(sam_file.replace('.txt', ''))
        
        # 計算重疊字數
        overlap = sum(1 for c in cleaned_key if c in sam_key)
        score = overlap / max(len(cleaned_key), len(sam_key))
        
        if score > best_score and score > 0.3:
            best_score = score
            best_match = sam_file
    
    return best_match, best_score

# 讀取檔案
sam_files = [f for f in os.listdir(SAM_DIR) if f.endswith('.txt') and not f.startswith('.')]
cleaned_files = [f for f in os.listdir(CLEANED_DIR) if re.match(r'^\d+_.*\.md$', f)]

print(f"Sam 檔案: {len(sam_files)}")
print(f"Cleaned 檔案: {len(cleaned_files)}")

# 建立對應
mapping = {}
used_sam = set()

for cleaned_file in sorted(cleaned_files):
    # 提取編號和標題
    match = re.match(r'^(\d+)_(.+?)__L-.*\.md$', cleaned_file)
    if not match:
        continue
    
    num = match.group(1)
    title = match.group(2)
    
    # 先找有編號的
    sam_match = None
    for sam_file in sam_files:
        if sam_file.startswith(f"{int(num)} ") or sam_file.startswith(f"{num} "):
            sam_match = sam_file
            break
    
    # 沒找到就用標題匹配
    if not sam_match:
        available_sam = [f for f in sam_files if f not in used_sam]
        sam_match, score = find_match(title, available_sam)
    
    if sam_match:
        mapping[cleaned_file] = sam_match
        used_sam.add(sam_match)
        print(f"✅ {num} {title[:20]}... → {sam_match[:40]}...")
    else:
        print(f"❌ {num} {title[:20]}... → 找不到")

# 儲存
with open('/Users/jameschen/Downloads/單板教學/file_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(mapping, f, ensure_ascii=False, indent=2)

print(f"\n成功配對: {len(mapping)}/{len(cleaned_files)}")
print(f"未配對 sam: {len(sam_files) - len(used_sam)}")
