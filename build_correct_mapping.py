#!/usr/bin/env python3
"""
建立正確的 sam → sam_cleaned 對應關係

策略：
1. sam 中有編號的檔案（1-95）應該對應 sam_cleaned 中的同編號
2. sam 中無編號的檔案對應 sam_cleaned 96-211
3. 通過內容比對驗證對應的正確性
"""

import glob
import re
import json
from pathlib import Path
from difflib import SequenceMatcher

# 1. 獲取 sam 中有編號的檔案
sam_numbered = {}
for f in glob.glob('sam/*.txt'):
    filename = Path(f).name
    match = re.match(r'^(\d+)\s+(.+)\.txt$', filename)
    if match:
        file_id = int(match.group(1))
        title = match.group(2)
        sam_numbered[file_id] = {
            'filename': filename,
            'title': title,
            'path': f
        }

# 2. 獲取 sam 中無編號的檔案
sam_unnumbered = []
for f in glob.glob('sam/*.txt'):
    filename = Path(f).name
    if not re.match(r'^\d+\s+', filename):
        sam_unnumbered.append({
            'filename': filename,
            'path': f
        })

# 3. 獲取所有 sam_cleaned 檔案
cleaned_files = {}
for f in glob.glob('sam_cleaned/[0-9]*.md'):
    filename = Path(f).name
    match = re.match(r'^(\d+)_(.+)__L-.+__S-.+\.md$', filename)
    if match:
        file_id = int(match.group(1))
        title = match.group(2)
        cleaned_files[file_id] = {
            'filename': filename,
            'title': title,
            'path': f
        }

print("="*70)
print("建立 sam → sam_cleaned 對應關係")
print("="*70)
print(f"sam 有編號: {len(sam_numbered)} 個")
print(f"sam 無編號: {len(sam_unnumbered)} 個")
print(f"sam_cleaned: {len(cleaned_files)} 個")
print()

# 4. 建立對應關係
mapping = {}

# 4.1 有編號的直接對應
print("檢查有編號檔案的對應...")
for file_id, sam_info in sorted(sam_numbered.items()):
    if file_id in cleaned_files:
        mapping[file_id] = {
            'sam_file': sam_info['filename'],
            'cleaned_file': cleaned_files[file_id]['filename'],
            'match_type': 'numbered',
            'confidence': 1.0
        }
        print(f"  {file_id:3d}: {sam_info['filename'][:40]:40s} → {cleaned_files[file_id]['filename'][:40]}")
    else:
        print(f"  {file_id:3d}: {sam_info['filename'][:40]:40s} → [缺失]")

matched_count = len(mapping)
print(f"\n有編號檔案匹配: {matched_count}/{len(sam_numbered)}")

# 4.2 找出 sam_cleaned 中未被匹配的編號
matched_cleaned_ids = set(mapping.keys())
unmatched_cleaned_ids = sorted(set(cleaned_files.keys()) - matched_cleaned_ids)

print(f"\nsam_cleaned 中未匹配的編號: {len(unmatched_cleaned_ids)} 個")
print(f"範圍: {min(unmatched_cleaned_ids) if unmatched_cleaned_ids else 'N/A'} - {max(unmatched_cleaned_ids) if unmatched_cleaned_ids else 'N/A'}")

# 4.3 統計缺失
print(f"\nsam 無編號檔案: {len(sam_unnumbered)} 個")
print(f"應對應到 cleaned 編號: {unmatched_cleaned_ids[:10]}...")

# 5. 儲存對應表
output = {
    'summary': {
        'sam_numbered': len(sam_numbered),
        'sam_unnumbered': len(sam_unnumbered),
        'sam_cleaned_total': len(cleaned_files),
        'matched_by_number': matched_count,
        'unmatched_cleaned_ids': unmatched_cleaned_ids
    },
    'mapping': mapping,
    'sam_unnumbered_files': [s['filename'] for s in sam_unnumbered],
    'unmatched_cleaned_files': [cleaned_files[cid]['filename'] for cid in unmatched_cleaned_ids]
}

with open('sam_cleaned_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n對應表已儲存至: sam_cleaned_mapping.json")

# 6. 分析缺失情況
print(f"\n" + "="*70)
print("缺失分析")
print(f"="*70)

# sam 中 1-95 範圍缺失的編號
expected_1_95 = set(range(1, 96))
actual_1_95 = set(k for k in sam_numbered.keys() if k <= 95)
missing_in_sam = sorted(expected_1_95 - actual_1_95)

print(f"sam 原始稿 1-95 範圍缺失: {len(missing_in_sam)} 個")
if missing_in_sam:
    print(f"缺失編號: {missing_in_sam}")

# 這些缺失的編號在 sam_cleaned 中是否存在？
missing_but_in_cleaned = [mid for mid in missing_in_sam if mid in cleaned_files]
print(f"其中在 sam_cleaned 中存在: {len(missing_but_in_cleaned)} 個")
if missing_but_in_cleaned:
    print(f"編號: {missing_but_in_cleaned}")
    print("\n這些檔案的來源可能是 sam 中的無編號檔案")
