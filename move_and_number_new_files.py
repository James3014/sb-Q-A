#!/usr/bin/env python3
"""
將sam_cleaned_new中的13個檔案移動到sam_cleaned並編號
從212開始編號到224
"""

import shutil
import glob
import re
import json
from pathlib import Path

# 獲取新檔案
new_files = sorted(glob.glob('sam_cleaned_new/*.md'))

print("="*70)
print("移動並編號新檔案")
print("="*70)
print(f"檔案數: {len(new_files)}")
print()

# 從JSON提取資訊來生成檔名
def extract_metadata(file_path):
    """提取JSON metadata"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 提取標題
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else Path(file_path).stem

        # 提取JSON
        json_match = re.search(r'```json\s*\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(1))
            return title, data
        return title, {}
    except Exception as e:
        print(f"錯誤: {file_path}: {e}")
        return Path(file_path).stem, {}

# 根據CASI_Skill推斷難度
def infer_level(json_data):
    """根據JSON數據推斷難度等級"""
    # 簡單推斷：看Core_Competency和Advanced_Competency
    if 'Advanced_Competency' in json_data and json_data.get('Advanced_Competency'):
        return 'adv'
    return 'int'  # 預設中級

# 推斷坡度
def infer_slope(title, json_data):
    """根據標題和內容推斷坡度"""
    title_lower = title.lower()
    drill = json_data.get('Drill_How', '').lower()
    combined = title + drill

    if '黑' in combined or 'black' in combined or '陡' in combined:
        return 'blue-black'
    elif '藍' in combined or 'blue' in combined:
        return 'blue'
    elif '綠' in combined or 'green' in combined:
        return 'green-blue'
    elif '公園' in combined or 'park' in combined or '跳' in combined:
        return 'park'
    elif '蘑菇' in combined or 'mogul' in combined:
        return 'mogul'
    elif '粉' in combined or 'powder' in combined:
        return 'powder'
    elif '樹' in combined or 'tree' in combined:
        return 'tree'
    return 'all'

# 處理每個檔案
moved_files = []
start_id = 212

for i, new_file in enumerate(new_files):
    file_id = start_id + i
    title, json_data = extract_metadata(new_file)

    # 推斷難度和坡度
    level = infer_level(json_data)
    slope = infer_slope(title, json_data)

    # 生成新檔名
    new_filename = f"{file_id:03d}_{title}__L-{level}__S-{slope}.md"
    new_path = f"sam_cleaned/{new_filename}"

    # 移動檔案
    try:
        shutil.copy2(new_file, new_path)
        moved_files.append({
            'old': Path(new_file).name,
            'new': new_filename,
            'id': file_id
        })
        print(f"[{file_id}] {Path(new_file).name[:40]:40s} → {new_filename[:50]}")
    except Exception as e:
        print(f"錯誤移動 {new_file}: {e}")

print("\n" + "="*70)
print("完成")
print("="*70)
print(f"成功移動: {len(moved_files)}/{len(new_files)}")

# 儲存移動記錄
with open('moved_files_log.json', 'w', encoding='utf-8') as f:
    json.dump(moved_files, f, ensure_ascii=False, indent=2)

print(f"移動記錄已儲存至: moved_files_log.json")

# 驗證
import glob
total_cleaned = len(glob.glob('sam_cleaned/[0-9]*.md'))
print(f"\n驗證: sam_cleaned 現有 {total_cleaned} 個編號檔案")
