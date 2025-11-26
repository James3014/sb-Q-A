#!/usr/bin/env python3
"""
精確找出哪些原始稿還沒有對應的整理檔案
"""

import json
import glob
import re
from pathlib import Path

# 讀取之前生成的對應表
with open('source_mapping.json', 'r', encoding='utf-8') as f:
    mapping_data = json.load(f)

# 獲取所有原始稿
sam_files = sorted(glob.glob('sam/*.txt'))
sam_file_names = set(Path(f).name for f in sam_files)

# 從對應表中提取已匹配的原始稿
matched_sources = set()
for file_id, info in mapping_data['mapping'].items():
    if info['source_file'] and info['confidence'] >= 0.3:  # 30%以上信心度
        matched_sources.add(info['source_file'])

# 找出未匹配的
unmatched = sam_file_names - matched_sources

# 排除已知的重複檔案
# 65號原始稿與30號重複，檔名是"65 如何滑下午的冰面.txt"
known_duplicates = ['65 如何滑下午的冰面.txt', '65 如何滑下午的冰面_Sam.txt']
unmatched = unmatched - set(known_duplicates)

print(f"="*70)
print(f"未匹配的原始稿分析")
print(f"="*70)
print(f"原始稿總數: {len(sam_files)}")
print(f"已匹配(≥30%信心): {len(matched_sources)}")
print(f"未匹配: {len(unmatched)}")
print(f"已知重複: {len(set(known_duplicates) & sam_file_names)}")
print(f"\n真正需要處理: {len(unmatched)} 個")

if unmatched:
    print(f"\n未匹配的原始稿清單:")
    for i, filename in enumerate(sorted(unmatched), 1):
        print(f"  {i:2d}. {filename}")

# 儲存結果
output = {
    'total_sam': len(sam_files),
    'matched': len(matched_sources),
    'unmatched_count': len(unmatched),
    'unmatched_files': sorted(list(unmatched))
}

with open('unprocessed_files.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n結果已儲存至: unprocessed_files.json")
