#!/usr/bin/env python3
import json
import os

CLEANED_DIR = "/Users/jameschen/Downloads/單板教學/sam_cleaned"
MAPPING_FILE = "/Users/jameschen/Downloads/單板教學/file_mapping.json"

with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
    mapping = json.load(f)

updated = 0
for cleaned_file, sam_file in mapping.items():
    path = os.path.join(CLEANED_DIR, cleaned_file)
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 檢查是否已有標記
    if '**原始逐字稿**' in content:
        continue
    
    # 加入標記
    source_tag = f"\n\n---\n**原始逐字稿**: `sam/{sam_file}`\n"
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.rstrip() + source_tag)
    
    updated += 1

print(f"✅ 已在 {updated} 個檔案底部加入來源標記")
print(f"📝 未配對的 {213 - len(mapping)} 個檔案需要手動處理")
