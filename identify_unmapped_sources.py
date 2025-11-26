#!/usr/bin/env python3
"""
找出哪些原始稿完全沒有被任何整理檔案匹配到
"""

import json
import glob
from pathlib import Path

# 讀取對應表
with open('source_mapping.json', 'r') as f:
    mapping = json.load(f)['mapping']

# 所有原始稿
all_sam_files = set(Path(f).name for f in glob.glob('sam/*.txt'))

# 從對應表中提取所有被匹配到的原始稿（不論信心度）
matched_sam = set()
for info in mapping.values():
    if info['source_file']:
        matched_sam.add(info['source_file'])

# 找出完全未被匹配的
unmapped = sorted(all_sam_files - matched_sam)

# 排除已知重複
known_duplicates = {
    '65 如何滑下午的冰面.txt',
    '65 如何滑下午的冰面_Sam.txt'
}
unmapped_clean = sorted(set(unmapped) - known_duplicates)

print(f"="*70)
print("原始稿匹配狀況")
print(f"="*70)
print(f"原始稿總數: {len(all_sam_files)}")
print(f"至少被匹配一次: {len(matched_sam)}")
print(f"完全未匹配: {len(unmapped)}")
print(f"扣除已知重複: {len(unmapped_clean)}")
print()

if len(unmapped_clean) == 10:
    print("✓ 恰好10個未匹配，這應該就是需要整理的檔案！")
elif len(unmapped_clean) < 20:
    print(f"找到 {len(unmapped_clean)} 個未匹配檔案")
else:
    print(f"⚠️ 未匹配數量 ({len(unmapped_clean)}) 異常，可能匹配算法有問題")

if unmapped_clean:
    print(f"\n未匹配的原始稿:")
    for i, f in enumerate(unmapped_clean, 1):
        print(f"  {i:2d}. {f}")

# 儲存
output = {
    'count': len(unmapped_clean),
    'files': unmapped_clean
}

with open('truly_unmapped.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n結果已儲存至: truly_unmapped.json")

# 如果是10個，繼續下一步
if len(unmapped_clean) == 10:
    print("\n下一步：整理這10個原始稿")
