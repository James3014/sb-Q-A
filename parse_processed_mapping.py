#!/usr/bin/env python3
"""
解析 processed 目錄，建立原始稿編號的對應關係
processed 目錄保留了原始編號，是關鍵的中間資訊
"""

import re
import glob
from pathlib import Path
from collections import defaultdict

def parse_processed_file(file_path):
    """解析 processed 檔案，提取所有教學的編號和標題"""
    lessons = []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 找所有 "# 編號 標題" 格式的行
        pattern = r'^#\s+(\d+)\s+(.+)$'
        matches = re.findall(pattern, content, re.MULTILINE)

        for lesson_id, title in matches:
            lessons.append({
                'id': int(lesson_id),
                'title': title.strip(),
                'source_file': Path(file_path).name
            })

    except Exception as e:
        print(f"錯誤解析 {file_path}: {e}")

    return lessons

# 解析所有 processed 檔案
all_lessons = []
processed_files = glob.glob('processed/*.md')

print(f"="*70)
print("解析 processed 目錄")
print(f"="*70)
print(f"檔案數: {len(processed_files)}")
print()

for pf in sorted(processed_files):
    lessons = parse_processed_file(pf)
    if lessons:
        all_lessons.extend(lessons)
        print(f"{Path(pf).name:30s} → {len(lessons):3d} 個教學")

# 按編號排序
all_lessons.sort(key=lambda x: x['id'])

# 統計
lesson_ids = [l['id'] for l in all_lessons]
unique_ids = sorted(set(lesson_ids))

print(f"\n" + "="*70)
print("統計結果")
print(f"="*70)
print(f"總教學數: {len(all_lessons)}")
print(f"獨特編號數: {len(unique_ids)}")
print(f"編號範圍: {min(unique_ids)} - {max(unique_ids)}")

# 找出缺失的編號
expected = set(range(1, 212))  # 1-211
missing_ids = sorted(expected - set(unique_ids))

print(f"\n缺失的編號 ({len(missing_ids)}個):")
if len(missing_ids) <= 20:
    print(missing_ids)
else:
    print(f"  前10個: {missing_ids[:10]}")
    print(f"  後10個: {missing_ids[-10:]}")

# 找出重複的編號
from collections import Counter
id_counts = Counter(lesson_ids)
duplicates = {lid: count for lid, count in id_counts.items() if count > 1}

if duplicates:
    print(f"\n重複的編號 ({len(duplicates)}個):")
    for lid, count in sorted(duplicates.items())[:10]:
        print(f"  編號 {lid}: 出現 {count} 次")

# 輸出完整對應表
import json

output = {
    'total_lessons': len(all_lessons),
    'unique_ids': len(unique_ids),
    'missing_ids': missing_ids,
    'duplicate_ids': list(duplicates.keys()) if duplicates else [],
    'lessons': all_lessons
}

with open('processed_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n完整對應表已儲存至: processed_mapping.json")

# 現在我們知道 processed 中有哪些編號
# 接下來需要：
# 1. 這些編號對應 sam/ 中的哪些原始稿
# 2. processed 中的每個教學對應 sam_cleaned/ 中的哪個檔案

print(f"\n下一步:")
print(f"1. 建立 sam 原始稿編號對應（1-95範圍）")
print(f"2. 找出 processed → sam_cleaned 的對應")
print(f"3. 確定真正缺失的原始稿")
