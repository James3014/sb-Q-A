#!/usr/bin/env python3
"""
檢查哪些原始稿沒有被任何md檔案引用
"""

import json
import glob
import re
from pathlib import Path
from collections import Counter

def extract_source_from_md(md_path):
    """從md檔案中提取source_file"""
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 從JSON中提取source_file
        match = re.search(r'"source_file":\s*"([^"]+)"', content)
        if match:
            return match.group(1)
    except:
        pass
    return None

# 1. 從所有md中提取被引用的原始稿
referenced_sources = []
for md_file in glob.glob('sam_cleaned/[0-9]*.md'):
    source = extract_source_from_md(md_file)
    if source:
        referenced_sources.append(source)

# 2. 所有原始稿
all_sources = [Path(f).name for f in glob.glob('sam/*.txt')]

# 3. 找出未被引用的
referenced_set = set(referenced_sources)
unreferenced = sorted(set(all_sources) - referenced_set)

# 4. 檢查重複引用
source_counts = Counter(referenced_sources)
duplicated = {src: count for src, count in source_counts.items() if count > 1}

# 5. 排除已知重複
known_duplicates = {'65 如何滑下午的冰面.txt', '65 如何滑下午的冰面_Sam.txt'}
unreferenced_clean = sorted(set(unreferenced) - known_duplicates)

print("="*70)
print("原始稿引用狀況")
print("="*70)
print(f"原始稿總數: {len(all_sources)}")
print(f"被引用: {len(referenced_set)}")
print(f"未被引用: {len(unreferenced)}")
print(f"扣除已知重複: {len(unreferenced_clean)}")
print()
print(f"重複引用: {len(duplicated)} 個原始稿被多個md引用")

if duplicated:
    print("\n被多次引用的原始稿（top 10）:")
    for src, count in sorted(duplicated.items(), key=lambda x: -x[1])[:10]:
        print(f"  {count}x: {src}")

print("\n" + "="*70)
print(f"未被引用的原始稿 ({len(unreferenced_clean)} 個)")
print("="*70)

if unreferenced_clean:
    for i, src in enumerate(unreferenced_clean, 1):
        print(f"  {i:3d}. {src}")

# 儲存結果
output = {
    'total_sources': len(all_sources),
    'referenced': len(referenced_set),
    'unreferenced_count': len(unreferenced_clean),
    'unreferenced_files': unreferenced_clean,
    'duplicated_count': len(duplicated),
    'duplicated_sources': dict(sorted(duplicated.items(), key=lambda x: -x[1])[:20])
}

with open('unreferenced_sources.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n結果已儲存至: unreferenced_sources.json")

if len(unreferenced_clean) <= 20:
    print(f"\n✓ 找到 {len(unreferenced_clean)} 個未被引用的原始稿")
    print("這些就是需要整理的檔案！")
