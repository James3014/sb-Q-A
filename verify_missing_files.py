#!/usr/bin/env python3
"""
精確比對原始逐字稿與已整理檔案
找出真正缺失的檔案
"""

import json
import glob
import re
from pathlib import Path
from difflib import SequenceMatcher

def get_title_keywords(title):
    """提取標題中的關鍵詞"""
    # 移除標點符號和空格
    keywords = re.findall(r'[\u4e00-\u9fff]+', title)
    return set(keywords)

def title_similarity(title1, title2):
    """計算兩個標題的相似度"""
    keywords1 = get_title_keywords(title1)
    keywords2 = get_title_keywords(title2)

    if not keywords1 or not keywords2:
        return 0

    # 計算關鍵詞交集比例
    intersection = keywords1 & keywords2
    union = keywords1 | keywords2
    jaccard = len(intersection) / len(union) if union else 0

    # 同時計算文字相似度
    text_sim = SequenceMatcher(None, title1, title2).ratio()

    # 綜合評分
    return max(jaccard, text_sim)

def main():
    # 讀取所有原始逐字稿
    sam_files = sorted(glob.glob('sam/*.txt'))

    # 分為有編號和無編號
    numbered_sam = {}
    unnumbered_sam = []

    for f in sam_files:
        filename = Path(f).stem
        match = re.match(r'^(\d+)\s+(.+)$', filename)
        if match:
            file_id = int(match.group(1))
            title = match.group(2)
            numbered_sam[file_id] = {
                'file': filename + '.txt',
                'title': title,
                'path': f
            }
        else:
            unnumbered_sam.append({
                'file': filename + '.txt',
                'title': filename,
                'path': f
            })

    # 讀取所有已整理檔案
    cleaned_files = sorted(glob.glob('sam_cleaned/*.md'))
    cleaned_by_id = {}

    for f in cleaned_files:
        filename = Path(f).stem
        match = re.match(r'^(\d+)_(.+)__L-.+__S-.+$', filename)
        if match:
            file_id = int(match.group(1))
            title = match.group(2)
            cleaned_by_id[file_id] = {
                'file': Path(f).name,
                'title': title,
                'path': f
            }

    print("="*70)
    print("檔案總覽")
    print("="*70)
    print(f"原始逐字稿總數: {len(sam_files)}")
    print(f"  - 有編號 (1-95): {len(numbered_sam)}")
    print(f"  - 無編號: {len(unnumbered_sam)}")
    print(f"已整理檔案總數: {len(cleaned_files)}")
    print()

    # === 1. 檢查有編號的對應關係 ===
    print("="*70)
    print("1. 有編號原始稿 (1-95) 的對應情況")
    print("="*70)

    missing_numbered = []
    for sam_id, sam_info in sorted(numbered_sam.items()):
        if sam_id not in cleaned_by_id:
            missing_numbered.append({
                'id': sam_id,
                'file': sam_info['file'],
                'title': sam_info['title']
            })
            print(f"缺失 #{sam_id:3d}: {sam_info['title']}")

    if not missing_numbered:
        print("✓ 所有有編號的原始稿都已整理")
    else:
        print(f"\n共 {len(missing_numbered)} 個有編號的原始稿未整理")

    # === 2. 檢查無編號的對應關係 ===
    print("\n" + "="*70)
    print("2. 無編號原始稿的對應情況")
    print("="*70)

    # 收集96-211範圍的已整理檔案
    cleaned_96_211 = {k: v for k, v in cleaned_by_id.items() if 96 <= k <= 211}

    print(f"無編號原始稿數量: {len(unnumbered_sam)}")
    print(f"96-211範圍已整理檔案數量: {len(cleaned_96_211)}")

    # 為每個無編號原始稿找最佳匹配
    matched = []
    unmatched = []

    for sam_info in unnumbered_sam:
        sam_title = sam_info['title']
        best_match = None
        best_score = 0

        for cleaned_id, cleaned_info in cleaned_96_211.items():
            score = title_similarity(sam_title, cleaned_info['title'])
            if score > best_score:
                best_score = score
                best_match = (cleaned_id, cleaned_info)

        if best_score >= 0.5:  # 50%以上相似度視為匹配
            matched.append({
                'sam_file': sam_info['file'],
                'sam_title': sam_title,
                'cleaned_id': best_match[0],
                'cleaned_title': best_match[1]['title'],
                'similarity': round(best_score, 3)
            })
        else:
            unmatched.append({
                'sam_file': sam_info['file'],
                'sam_title': sam_title,
                'best_match': best_match[1]['title'] if best_match else None,
                'similarity': round(best_score, 3)
            })

    print(f"\n成功匹配: {len(matched)} 個")
    print(f"未匹配: {len(unmatched)} 個")

    # === 3. 輸出結果 ===
    result = {
        'summary': {
            'total_sam': len(sam_files),
            'numbered_sam': len(numbered_sam),
            'unnumbered_sam': len(unnumbered_sam),
            'total_cleaned': len(cleaned_files),
            'missing_numbered_count': len(missing_numbered),
            'unmatched_unnumbered_count': len(unmatched)
        },
        'missing_numbered': missing_numbered,
        'unmatched_unnumbered': unmatched,
        'matched_unnumbered': matched
    }

    output_path = 'final_missing_analysis.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print("\n" + "="*70)
    print("總結")
    print("="*70)
    print(f"有編號原始稿缺失: {len(missing_numbered)} 個")
    print(f"無編號原始稿未匹配: {len(unmatched)} 個")
    print(f"**真正需要整理的檔案總數: {len(missing_numbered) + len(unmatched)} 個**")
    print(f"\n詳細結果已儲存至: {output_path}")

    if unmatched:
        print("\n未匹配的無編號原始稿（前10個）:")
        for item in unmatched[:10]:
            print(f"  - {item['sam_file']}")
            print(f"    最佳匹配: {item['best_match']} (相似度: {item['similarity']:.1%})")

if __name__ == '__main__':
    main()
