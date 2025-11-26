#!/usr/bin/env python3
"""
比對 sam_cleaned_new 與 sam_cleaned 的內容
找出並標記重複的檔案
"""

import json
import glob
import re
from pathlib import Path
from difflib import SequenceMatcher

def extract_json_from_md(file_path):
    """從md檔案中提取JSON數據"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 找JSON區塊
        json_match = re.search(r'```json\s*\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
            return json.loads(json_str)
        return None
    except Exception as e:
        print(f"錯誤讀取 {file_path}: {e}")
        return None

def compare_content_similarity(file1, file2):
    """比較兩個檔案的內容相似度"""
    try:
        with open(file1, 'r', encoding='utf-8') as f:
            content1 = f.read()
        with open(file2, 'r', encoding='utf-8') as f:
            content2 = f.read()

        # 移除JSON區塊比較純文字內容
        content1_text = re.sub(r'```json.*?```', '', content1, flags=re.DOTALL)
        content2_text = re.sub(r'```json.*?```', '', content2, flags=re.DOTALL)

        # 計算相似度
        ratio = SequenceMatcher(None, content1_text, content2_text).ratio()
        return ratio
    except Exception as e:
        print(f"錯誤比較: {e}")
        return 0

# 獲取所有檔案
new_files = glob.glob('sam_cleaned_new/*.md')
existing_files = glob.glob('sam_cleaned/*.md')

print("="*70)
print("比對新舊檔案")
print("="*70)
print(f"新檔案: {len(new_files)} 個")
print(f"現有檔案: {len(existing_files)} 個")
print()

# 提取新檔案的JSON數據
new_files_data = {}
for nf in new_files:
    json_data = extract_json_from_md(nf)
    if json_data:
        new_files_data[nf] = json_data

# 提取現有檔案的JSON數據
existing_files_data = {}
for ef in existing_files:
    json_data = extract_json_from_md(ef)
    if json_data:
        existing_files_data[ef] = json_data

# 比對
duplicates = []
unique = []

for new_file, new_json in new_files_data.items():
    best_match = None
    best_similarity = 0

    for existing_file, existing_json in existing_files_data.items():
        # 比較JSON中的核心欄位
        if (new_json.get('Fault_What') == existing_json.get('Fault_What') and
            new_json.get('Goal_Why') == existing_json.get('Goal_Why')):
            # 如果核心欄位完全一樣，認為是重複
            duplicates.append({
                'new_file': Path(new_file).name,
                'new_path': new_file,
                'existing_file': Path(existing_file).name,
                'existing_path': existing_file,
                'match_type': 'exact_json',
                'similarity': 1.0
            })
            best_match = existing_file
            best_similarity = 1.0
            break

        # 比較整體內容相似度
        similarity = compare_content_similarity(new_file, existing_file)
        if similarity > best_similarity:
            best_similarity = similarity
            best_match = existing_file

    if best_similarity >= 0.8 and best_match:  # 80%以上視為重複
        if best_similarity < 1.0:  # 避免重複添加
            duplicates.append({
                'new_file': Path(new_file).name,
                'new_path': new_file,
                'existing_file': Path(best_match).name,
                'existing_path': best_match,
                'match_type': 'high_similarity',
                'similarity': round(best_similarity, 3)
            })
    elif best_similarity < 0.5:  # 50%以下視為獨特
        unique.append({
            'new_file': Path(new_file).name,
            'new_path': new_file,
            'best_match': Path(best_match).name if best_match else None,
            'best_similarity': round(best_similarity, 3)
        })

print("\n" + "="*70)
print("比對結果")
print("="*70)
print(f"重複檔案: {len(duplicates)} 個")
print(f"獨特檔案: {len(unique)} 個")
print(f"需要檢查: {len(new_files) - len(duplicates) - len(unique)} 個 (50%-80%相似度)")

if duplicates:
    print(f"\n重複檔案 (建議刪除):")
    for dup in duplicates:
        print(f"  {dup['new_file'][:40]:40s} = {dup['existing_file'][:40]:40s} ({dup['similarity']:.1%})")

if unique:
    print(f"\n獨特檔案 (保留):")
    for uniq in unique:
        print(f"  {uniq['new_file'][:50]:50s} (最高{uniq['best_similarity']:.1%})")

# 需要手動檢查的
needs_review = []
for new_file, new_json in new_files_data.items():
    nf_name = Path(new_file).name
    is_duplicate = any(d['new_file'] == nf_name for d in duplicates)
    is_unique = any(u['new_file'] == nf_name for u in unique)

    if not is_duplicate and not is_unique:
        # 找最佳匹配
        best_match = None
        best_similarity = 0
        for existing_file in existing_files:
            similarity = compare_content_similarity(new_file, existing_file)
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = existing_file

        needs_review.append({
            'new_file': nf_name,
            'new_path': new_file,
            'best_match': Path(best_match).name if best_match else None,
            'similarity': round(best_similarity, 3)
        })

if needs_review:
    print(f"\n需要手動檢查 (50%-80%相似度):")
    for item in needs_review:
        print(f"  {item['new_file'][:40]:40s} ? {item['best_match'][:40]:40s if item['best_match'] else 'N/A':40s} ({item['similarity']:.1%})")

# 儲存結果
output = {
    'total_new': len(new_files),
    'total_existing': len(existing_files),
    'duplicates': duplicates,
    'unique': unique,
    'needs_review': needs_review,
    'summary': {
        'duplicate_count': len(duplicates),
        'unique_count': len(unique),
        'review_count': len(needs_review)
    }
}

with open('deduplication_result.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n詳細結果已儲存至: deduplication_result.json")

# 預期最終數量
expected_final = 200 + len(unique)
print(f"\n預期最終檔案數: {expected_final} 個 (現有200 + 新增{len(unique)})")
