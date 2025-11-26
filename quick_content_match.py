#!/usr/bin/env python3
"""
快速內容比對：
檢查119個「未引用」的原始稿中，有多少其實已經被整理過了
通過比對檔案內容的前200字
"""

import json
import glob
import re
from pathlib import Path
from difflib import SequenceMatcher

def get_content_fingerprint(file_path, length=200):
    """取得檔案內容指紋（前N個字元）"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # 移除空白和標點，只保留中文和英文
        content = re.sub(r'[^\u4e00-\u9fffa-zA-Z0-9]', '', content)
        return content[:length]
    except:
        return ""

def extract_drill_from_md(md_path):
    """從md中提取Drill_How內容作為指紋"""
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 提取JSON中的Drill_How
        match = re.search(r'"Drill_How":\s*"([^"]+)"', content)
        if match:
            drill = match.group(1)
            # 清理
            drill = re.sub(r'[^\u4e00-\u9fffa-zA-Z0-9]', '', drill)
            return drill[:200]
    except:
        pass
    return ""

# 讀取未引用清單
with open('unreferenced_sources.json', 'r') as f:
    unreferenced = json.load(f)['unreferenced_files']

print(f"="*70)
print("快速內容比對")
print(f"="*70)

# 建立所有已整理檔案的內容指紋
cleaned_fingerprints = {}
for md_file in glob.glob('sam_cleaned/[0-9]*.md'):
    fp = extract_drill_from_md(md_file)
    if fp:
        cleaned_fingerprints[Path(md_file).name] = fp

print(f"已整理檔案指紋: {len(cleaned_fingerprints)} 個")
print(f"未引用原始稿: {len(unreferenced)} 個")
print("\n開始比對...")

# 比對每個未引用的原始稿
truly_new = []
likely_duplicate = []

for i, sam_filename in enumerate(unreferenced, 1):
    sam_path = f"sam/{sam_filename}"
    sam_fp = get_content_fingerprint(sam_path)

    if not sam_fp:
        print(f"[{i:3d}/{len(unreferenced)}] ✗ 無法讀取: {sam_filename}")
        continue

    # 找最佳匹配
    best_match = None
    best_score = 0

    for md_name, md_fp in cleaned_fingerprints.items():
        score = SequenceMatcher(None, sam_fp, md_fp).ratio()
        if score > best_score:
            best_score = score
            best_match = md_name

    if best_score >= 0.5:  # 50%以上相似視為已整理
        likely_duplicate.append({
            'sam_file': sam_filename,
            'matched_md': best_match,
            'similarity': round(best_score, 3)
        })
        print(f"[{i:3d}] ≈ {best_score:.1%} → {best_match[:40]}")
    else:
        truly_new.append({
            'sam_file': sam_filename,
            'best_match': best_match,
            'similarity': round(best_score, 3)
        })
        print(f"[{i:3d}] ✓ 新檔案 (最高相似度: {best_score:.1%})")

print("\n" + "="*70)
print("分析結果")
print("="*70)
print(f"可能已整理（≥50%相似）: {len(likely_duplicate)} 個")
print(f"真正需要整理: {len(truly_new)} 個")
print()

# 儲存結果
result = {
    'likely_duplicate_count': len(likely_duplicate),
    'truly_new_count': len(truly_new),
    'likely_duplicate': likely_duplicate,
    'truly_new': truly_new
}

with open('content_match_result.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"詳細結果已儲存至: content_match_result.json")

if len(truly_new) <= 20:
    print(f"\n✓ 只需整理 {len(truly_new)} 個檔案！")
    print("\n需要整理的檔案:")
    for item in truly_new[:10]:
        print(f"  - {item['sam_file']}")
    if len(truly_new) > 10:
        print(f"  ... 還有 {len(truly_new) - 10} 個")
