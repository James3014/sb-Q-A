#!/usr/bin/env python3
"""
最終確認：找出真正缺失的10個原始稿

邏輯：
- sam無編號：127個
- sam_cleaned未匹配：117個
- 通過內容/標題比對，找出那10個無法匹配的sam檔案
"""

import json
import glob
import re
from pathlib import Path
from difflib import SequenceMatcher

# 讀取之前的對應表
with open('sam_cleaned_mapping.json', 'r') as f:
    mapping_data = json.load(f)

sam_unnumbered_files = mapping_data['sam_unnumbered_files']
unmatched_cleaned_files = mapping_data['unmatched_cleaned_files']

print("="*70)
print("最終確認：找出真正缺失的檔案")
print("="*70)
print(f"sam 無編號檔案: {len(sam_unnumbered_files)} 個")
print(f"sam_cleaned 未匹配: {len(unmatched_cleaned_files)} 個")
print(f"預期缺失: {len(sam_unnumbered_files) - len(unmatched_cleaned_files)} 個")
print()

# 提取標題進行匹配
def clean_title(title):
    """清理標題用於比對"""
    # 移除標點、空格
    title = re.sub(r'[^\u4e00-\u9fffa-zA-Z0-9]', '', title)
    return title.lower()

# 建立 cleaned 檔案的標題索引
cleaned_titles = {}
for cf in unmatched_cleaned_files:
    # 從檔名提取標題
    match = re.match(r'^\d+_(.+)__L-.+__S-.+\.md$', cf)
    if match:
        title = match.group(1)
        cleaned_title = clean_title(title)
        cleaned_titles[cf] = cleaned_title

# 對每個無編號的 sam 檔案找最佳匹配
matched_pairs = []
truly_missing = []

for sam_file in sam_unnumbered_files:
    # 從檔名提取標題
    sam_title_raw = Path(sam_file).stem  # 移除.txt
    sam_title = clean_title(sam_title_raw)

    # 找最佳匹配
    best_match = None
    best_score = 0

    for cleaned_file, cleaned_title in cleaned_titles.items():
        score = SequenceMatcher(None, sam_title, cleaned_title).ratio()
        if score > best_score:
            best_score = score
            best_match = cleaned_file

    if best_score >= 0.15:  # 15%以上視為匹配（標題改寫幅度大）
        matched_pairs.append({
            'sam_file': sam_file,
            'cleaned_file': best_match,
            'similarity': round(best_score, 3)
        })
        print(f"✓ {sam_file[:45]:45s} → {best_match[:45]:45s} ({best_score:.1%})")
    else:
        truly_missing.append({
            'sam_file': sam_file,
            'best_match': best_match,
            'similarity': round(best_score, 3)
        })
        print(f"✗ {sam_file[:45]:45s} [無匹配，最高{best_score:.1%}]")

print("\n" + "="*70)
print("結果")
print("="*70)
print(f"成功匹配: {len(matched_pairs)}")
print(f"真正缺失: {len(truly_missing)}")

if truly_missing:
    print(f"\n真正需要整理的檔案 ({len(truly_missing)}個):")
    for item in truly_missing:
        print(f"  - {item['sam_file']}")

# 儲存
output = {
    'matched_count': len(matched_pairs),
    'missing_count': len(truly_missing),
    'matched_pairs': matched_pairs,
    'truly_missing': truly_missing
}

with open('truly_missing_final.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n結果已儲存至: truly_missing_final.json")

if len(truly_missing) == 10:
    print(f"\n✓ 完美！找到預期的10個缺失檔案")
elif len(truly_missing) < 20:
    print(f"\n找到 {len(truly_missing)} 個缺失檔案（接近預期）")
