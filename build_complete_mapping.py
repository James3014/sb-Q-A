#!/usr/bin/env python3
"""
建立完整的 sam → sam_cleaned 對應表
整合所有對應關係
"""

import json
import glob
import re
from pathlib import Path

# 1. 讀取現有對應數據
with open('sam_cleaned_mapping.json', 'r') as f:
    numbered_mapping = json.load(f)

with open('truly_missing_final.json', 'r') as f:
    title_matching = json.load(f)

with open('moved_files_log.json', 'r') as f:
    new_files = json.load(f)

print("="*70)
print("建立完整對應表")
print("="*70)
print(f"有編號對應: {len(numbered_mapping['mapping'])} 個")
print(f"標題匹配: {len(title_matching['matched_pairs'])} 個")
print(f"新處理: {len(new_files)} 個")
print()

# 2. 建立完整對應表
complete_mapping = []

# 2.1 有編號的對應
for file_id, data in numbered_mapping['mapping'].items():
    complete_mapping.append({
        'source_file': data['sam_file'],
        'cleaned_file': data['cleaned_file'],
        'cleaned_id': int(file_id),
        'match_type': 'numbered',
        'confidence': 1.0
    })

# 2.2 標題匹配的對應
for pair in title_matching['matched_pairs']:
    complete_mapping.append({
        'source_file': pair['sam_file'],
        'cleaned_file': pair['cleaned_file'],
        'cleaned_id': int(re.match(r'^(\d+)_', pair['cleaned_file']).group(1)),
        'match_type': 'title_match',
        'confidence': pair['similarity']
    })

# 2.3 新處理的對應
for item in new_files:
    # 找對應的source_file
    # 從truly_missing_final.json找出對應的sam檔案
    source_file = None
    for missing in title_matching['truly_missing']:
        # 簡化比對：去掉.txt和.md比較
        if Path(missing['sam_file']).stem in item['old'] or item['old'] in Path(missing['sam_file']).stem:
            source_file = missing['sam_file']
            break

    if source_file:
        complete_mapping.append({
            'source_file': source_file,
            'cleaned_file': item['new'],
            'cleaned_id': item['id'],
            'match_type': 'newly_processed',
            'confidence': 1.0
        })

# 3. 排序並統計
complete_mapping.sort(key=lambda x: x['cleaned_id'])

# 統計
by_type = {}
for item in complete_mapping:
    mt = item['match_type']
    by_type[mt] = by_type.get(mt, 0) + 1

print("對應類型統計:")
for mt, count in sorted(by_type.items()):
    print(f"  {mt}: {count} 個")

print(f"\n總對應數: {len(complete_mapping)}")

# 4. 檢查完整性
all_cleaned_ids = set(item['cleaned_id'] for item in complete_mapping)
expected_ids = set(range(1, 225)) - {65, 167, 168, 169, 170, 171, 172, 173, 174, 175, 205}  # 減去已刪除的

missing_ids = expected_ids - all_cleaned_ids
extra_ids = all_cleaned_ids - expected_ids

if missing_ids:
    print(f"\n⚠ 缺失的cleaned_id: {sorted(missing_ids)[:10]}... (共{len(missing_ids)}個)")
else:
    print(f"\n✓ 所有預期的cleaned_id都有對應")

if extra_ids:
    print(f"\n⚠ 多餘的cleaned_id: {sorted(extra_ids)}")

# 5. 檢查source_file重複
from collections import Counter
source_counter = Counter([item['source_file'] for item in complete_mapping])
duplicates = {sf: count for sf, count in source_counter.items() if count > 1}

if duplicates:
    print(f"\n⚠ 重複的source_file:")
    for sf, count in list(duplicates.items())[:5]:
        print(f"  {sf}: {count}次")
else:
    print(f"\n✓ 沒有重複的source_file")

# 6. 儲存完整對應表
output = {
    'total_mappings': len(complete_mapping),
    'by_type': by_type,
    'missing_cleaned_ids': sorted(missing_ids) if missing_ids else [],
    'mappings': complete_mapping
}

with open('complete_sam_cleaned_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n完整對應表已儲存至: complete_sam_cleaned_mapping.json")

# 7. 生成可讀的對應表
print(f"\n生成CSV格式對應表...")
import csv

with open('sam_cleaned_mapping.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=['cleaned_id', 'cleaned_file', 'source_file', 'match_type', 'confidence'])
    writer.writeheader()
    writer.writerows(complete_mapping)

print(f"CSV對應表已儲存至: sam_cleaned_mapping.csv")
