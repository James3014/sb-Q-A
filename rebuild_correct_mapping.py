#!/usr/bin/env python3
"""
重新建立正確的對應關係
使用內容相似度而非標題相似度
"""

import json
import glob
import re
from pathlib import Path
from difflib import SequenceMatcher

def read_file_content(file_path):
    """讀取檔案內容"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except:
        return ""

def extract_main_content(md_content):
    """從markdown提取主要教學內容（去除JSON）"""
    # 移除JSON區塊
    content = re.sub(r'```json.*?```', '', md_content, flags=re.DOTALL)
    # 移除標題符號
    content = re.sub(r'^#+\s+', '', content, flags=re.MULTILINE)
    return content.strip()

print("="*70)
print("重新建立正確對應 - 基於內容相似度")
print("="*70)
print()

# 1. 確定的對應（numbered + newly_processed）
print("【階段1】收集確定的對應")

certain_mappings = []

# 1.1 讀取有編號的對應（83個）
with open('sam_cleaned_mapping.json', 'r') as f:
    numbered_data = json.load(f)

for file_id, data in numbered_data['mapping'].items():
    certain_mappings.append({
        'source_file': data['sam_file'],
        'cleaned_file': data['cleaned_file'],
        'cleaned_id': int(file_id),
        'match_type': 'numbered',
        'confidence': 1.0
    })

print(f"  - 有編號對應: {len(certain_mappings)}")

# 1.2 新處理的13個
newly_processed_sources = {
    222: "转弯时候的\"转\"先转还是后转？.txt",
    215: "基础：转弯别\"掰\"弯.txt",
    219: "进阶： 被动倾倒.txt",
    212: "21一个练习：改你肩带转.txt",
    218: "试试让你的膝盖这么\"转\".txt",
    213: "如果让我选5种板型.txt",
    224: "第一出道外：试试练习这三个阶段.txt",
    214: "弯末压力释放（late pressure release）.txt",
    223: "浅聊：你其实转的不是你的膝盖，而是….txt",
    216: "15水泥粉里不摔跤小技巧.txt",
    220: "进阶：视线别再看两侧了.txt",
    221: "基础到进阶： \"起降\"概念.txt",
    217: "进阶： 背部夹紧增加旋转.txt"
}

for cleaned_id, source_file in newly_processed_sources.items():
    files = glob.glob(f"sam_cleaned/{cleaned_id:03d}_*.md")
    if files:
        certain_mappings.append({
            'source_file': source_file,
            'cleaned_file': Path(files[0]).name,
            'cleaned_id': cleaned_id,
            'match_type': 'newly_processed',
            'confidence': 1.0
        })

print(f"  - 新處理對應: {len(certain_mappings) - 83}")
print(f"  - 確定對應總數: {len(certain_mappings)}")
print()

# 2. 找出未對應的cleaned檔案和sam檔案
print("【階段2】找出未對應的檔案")

# 已對應的cleaned_id和source_file
mapped_cleaned_ids = set(item['cleaned_id'] for item in certain_mappings)
mapped_sources = set(item['source_file'] for item in certain_mappings)

# 所有cleaned檔案
all_cleaned = glob.glob('sam_cleaned/[0-9]*.md')
unmapped_cleaned = []
for cf in all_cleaned:
    match = re.search(r'/(\d+)_', cf)
    if match:
        cid = int(match.group(1))
        if cid not in mapped_cleaned_ids:
            unmapped_cleaned.append((cid, Path(cf).name, cf))

# 所有sam檔案
all_sam = glob.glob('sam/*.txt')
unmapped_sam = []
for sf in all_sam:
    fname = Path(sf).name
    if fname not in mapped_sources:
        unmapped_sam.append((fname, sf))

print(f"  - 未對應的cleaned檔案: {len(unmapped_cleaned)}")
print(f"  - 未對應的sam檔案: {len(unmapped_sam)}")
print()

# 3. 對未對應的進行內容匹配
print("【階段3】內容相似度匹配（閾值≥70%）")
print(f"  處理中...")

content_mappings = []
matched_count = 0

for i, (cleaned_id, cleaned_name, cleaned_path) in enumerate(unmapped_cleaned):
    if (i + 1) % 20 == 0:
        print(f"    已處理: {i+1}/{len(unmapped_cleaned)}")

    # 讀取cleaned內容
    cleaned_content = read_file_content(cleaned_path)
    cleaned_main = extract_main_content(cleaned_content)

    best_match = None
    best_similarity = 0

    # 與所有未對應的sam比較
    for source_name, source_path in unmapped_sam:
        sam_content = read_file_content(source_path)

        # 計算內容相似度
        similarity = SequenceMatcher(None, cleaned_main, sam_content).ratio()

        if similarity > best_similarity:
            best_similarity = similarity
            best_match = source_name

    # 只保留高信心度的匹配（≥70%）
    if best_similarity >= 0.70:
        content_mappings.append({
            'source_file': best_match,
            'cleaned_file': cleaned_name,
            'cleaned_id': cleaned_id,
            'match_type': 'content_verified',
            'confidence': round(best_similarity, 3)
        })
        matched_count += 1
        if matched_count <= 5:
            print(f"    ✓ [{cleaned_id:03d}] {best_match[:40]:40s} ({best_similarity:.1%})")

print(f"  - 內容匹配成功: {len(content_mappings)}")
print()

# 4. 合併所有對應
all_mappings = certain_mappings + content_mappings
all_mappings.sort(key=lambda x: x['cleaned_id'])

print("="*70)
print("結果總結")
print("="*70)
print(f"  確定對應: {len(certain_mappings)}")
print(f"  內容驗證: {len(content_mappings)}")
print(f"  總對應數: {len(all_mappings)}")
print()

# 統計
by_type = {}
for item in all_mappings:
    mt = item['match_type']
    by_type[mt] = by_type.get(mt, 0) + 1

print("  按類型:")
for mt, count in sorted(by_type.items()):
    print(f"    {mt}: {count}")
print()

# 5. 儲存
output = {
    'total_mappings': len(all_mappings),
    'by_type': by_type,
    'mappings': all_mappings,
    'statistics': {
        'certain': len(certain_mappings),
        'content_verified': len(content_mappings),
        'unmapped_cleaned': len(unmapped_cleaned) - len(content_mappings),
        'unmapped_sam': len(unmapped_sam) - len(content_mappings)
    }
}

with open('correct_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"正確對應表已儲存至: correct_mapping.json")

# CSV
import csv
with open('correct_mapping.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=['cleaned_id', 'cleaned_file', 'source_file', 'match_type', 'confidence'])
    writer.writeheader()
    writer.writerows(all_mappings)

print(f"CSV對應表已儲存至: correct_mapping.csv")

print()
print("="*70)
print("還有多少檔案未能對應？")
print("="*70)
print(f"  未對應的cleaned: {len(unmapped_cleaned) - len(content_mappings)}")
print(f"  未對應的sam: {len(unmapped_sam) - len(content_mappings)}")
print()
print("這些未對應的可能是：")
print("  1. 內容相似度<70%的檔案")
print("  2. 真正缺失的原始稿")
print("  3. sam_cleaned中的測試檔案")
