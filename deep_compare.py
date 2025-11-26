#!/usr/bin/env python3
"""
深度比對：檢查新檔案與現有檔案的Drill_How欄位相似度
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

        json_match = re.search(r'```json\s*\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
            return json.loads(json_str)
        return None
    except Exception as e:
        return None

# 獲取檔案
new_files = glob.glob('sam_cleaned_new/*.md')
existing_files = [f for f in glob.glob('sam_cleaned/*.md')
                 if re.match(r'.*/\d+_.*\.md$', f)]  # 只要編號開頭的檔案

print("="*70)
print("深度比對 - Drill_How 欄位相似度")
print("="*70)
print(f"新檔案: {len(new_files)} 個")
print(f"現有檔案: {len(existing_files)} 個")
print()

# 提取數據
new_data = {}
for nf in new_files:
    json_data = extract_json_from_md(nf)
    if json_data and 'Drill_How' in json_data:
        new_data[nf] = json_data

existing_data = {}
for ef in existing_files:
    json_data = extract_json_from_md(ef)
    if json_data and 'Drill_How' in json_data:
        existing_data[ef] = json_data

# 深度比對
high_similarity = []  # >70%
medium_similarity = []  # 50-70%
low_similarity = []  # <50%

for new_file, new_json in new_data.items():
    new_drill = new_json.get('Drill_How', '')
    new_fault = new_json.get('Fault_What', '')
    new_goal = new_json.get('Goal_Why', '')

    best_match = None
    best_similarity = 0
    best_match_data = None

    for existing_file, existing_json in existing_data.items():
        existing_drill = existing_json.get('Drill_How', '')
        existing_fault = existing_json.get('Fault_What', '')
        existing_goal = existing_json.get('Goal_Why', '')

        # 比較Drill_How
        drill_sim = SequenceMatcher(None, new_drill, existing_drill).ratio()
        fault_sim = SequenceMatcher(None, new_fault, existing_fault).ratio()
        goal_sim = SequenceMatcher(None, new_goal, existing_goal).ratio()

        # 綜合相似度（Drill_How權重最高）
        combined_sim = drill_sim * 0.5 + fault_sim * 0.3 + goal_sim * 0.2

        if combined_sim > best_similarity:
            best_similarity = combined_sim
            best_match = existing_file
            best_match_data = {
                'drill_sim': drill_sim,
                'fault_sim': fault_sim,
                'goal_sim': goal_sim
            }

    result = {
        'new_file': Path(new_file).name,
        'best_match': Path(best_match).name if best_match else None,
        'similarity': round(best_similarity, 3),
        'details': best_match_data
    }

    if best_similarity >= 0.7:
        high_similarity.append(result)
    elif best_similarity >= 0.5:
        medium_similarity.append(result)
    else:
        low_similarity.append(result)

print("結果分類:")
print(f"  高相似度 (≥70%): {len(high_similarity)} 個 - 可能是重複")
print(f"  中相似度 (50-69%): {len(medium_similarity)} 個 - 需要檢查")
print(f"  低相似度 (<50%): {len(low_similarity)} 個 - 應該是獨特內容")
print()

if high_similarity:
    print("高相似度檔案 (可能重複):")
    for item in sorted(high_similarity, key=lambda x: x['similarity'], reverse=True):
        print(f"  {item['new_file'][:45]:45s} ? {item['best_match'][:45]:45s} ({item['similarity']:.1%})")
        print(f"     Drill:{item['details']['drill_sim']:.1%} Fault:{item['details']['fault_sim']:.1%} Goal:{item['details']['goal_sim']:.1%}")

if medium_similarity:
    print(f"\n中相似度檔案 (需要檢查):")
    for item in sorted(medium_similarity, key=lambda x: x['similarity'], reverse=True):
        print(f"  {item['new_file'][:45]:45s} ? {item['best_match'][:45]:45s} ({item['similarity']:.1%})")

if low_similarity:
    print(f"\n低相似度檔案 (應該是獨特內容): {len(low_similarity)}個")

# 儲存結果
output = {
    'high_similarity': high_similarity,
    'medium_similarity': medium_similarity,
    'low_similarity': low_similarity
}

with open('deep_compare_result.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n詳細結果已儲存至: deep_compare_result.json")
print(f"\n如果高相似度有3個檔案，刪除它們後就能達到210個目標")
