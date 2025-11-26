#!/usr/bin/env python3
"""
為現有的200個已整理檔案建立來源對應表
使用內容相似度比對
"""

import json
import glob
import re
import hashlib
from pathlib import Path
from difflib import SequenceMatcher

def calculate_md5(file_path):
    """計算檔案MD5"""
    with open(file_path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

# 滑雪技術關鍵詞庫
TECH_KEYWORDS = [
    '換刃', '收腿', '蘑菇', '後刃', '前刃', '陡坡', '粉雪', '公園',
    '站姿', '旋轉', '壓力', '時機', '平衡', '抓地', '控速', '卡刃',
    '髖', '膝', '腳踝', '板頭', '板尾', '立刃', '轉彎', '切雪',
    '團身', '引申', '跳換', '滾刃', '開肩', '反擰', '蓄力', '傳導',
    '直跳', '抓板', '360', '180', '蹦床', '包頂', '側壁', '軸轉',
    '弯末', '弯型', '喷雪', '驼背', '顶胯', '开胯', '烙饼', '掰弯',
    '树林', '蓝黑', '绿道', '黑道', '冰面', '粘雪', '深粉', '烂雪',
    '重心', '前脚', '后腿', '上半身', '下半身', '视线', '手', '臀',
    '折叠', '起伏', '下蹲', '居中', '灵活', '倾倒', '板底', '刻滑'
]

def extract_keywords(text):
    """提取文本中的技術關鍵詞"""
    keywords = set()
    for kw in TECH_KEYWORDS:
        # 處理簡繁體差異
        kw_variants = [
            kw,
            kw.replace('刃', '刃'),
            kw.replace('髖', '髋'),
            kw.replace('膝', '膝'),
            kw.replace('腳', '脚'),
            kw.replace('後', '后'),
            kw.replace('壓', '压'),
            kw.replace('轉', '转'),
            kw.replace('彎', '弯'),
            kw.replace('開', '开'),
            kw.replace('團', '团'),
            kw.replace('擰', '拧'),
            kw.replace('蹦', '蹦'),
            kw.replace('側', '侧'),
            kw.replace('軸', '轴')
        ]
        if any(v in text for v in kw_variants):
            keywords.add(kw)
    return keywords

def extract_drill_content(md_path):
    """從markdown中提取完整內容"""
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            return f.read()
    except:
        pass
    return ""

def find_best_match(cleaned_file, sam_files):
    """找到最佳匹配的原始稿 - 使用技術關鍵詞"""
    cleaned_content = extract_drill_content(cleaned_file)
    if not cleaned_content or len(cleaned_content) < 20:
        return None, 0

    # 提取整理稿的技術關鍵詞
    cleaned_keywords = extract_keywords(cleaned_content)

    if not cleaned_keywords:
        return None, 0

    best_match = None
    best_score = 0

    for sam_file in sam_files:
        try:
            with open(sam_file, 'r', encoding='utf-8') as f:
                sam_content = f.read()

            # 提取原始稿的技術關鍵詞
            sam_keywords = extract_keywords(sam_content)

            if not sam_keywords:
                continue

            # 計算Jaccard相似度
            intersection = cleaned_keywords & sam_keywords
            union = cleaned_keywords | sam_keywords

            score = len(intersection) / len(union) if union else 0

            if score > best_score:
                best_score = score
                best_match = sam_file
        except Exception as e:
            continue

    return best_match, best_score

def main():
    print("="*70)
    print("建立來源對應表")
    print("="*70)

    # 獲取所有檔案
    cleaned_files = sorted(glob.glob('sam_cleaned/[0-9]*.md'))
    sam_files = sorted(glob.glob('sam/*.txt'))

    print(f"\n已整理檔案: {len(cleaned_files)} 個")
    print(f"原始逐字稿: {len(sam_files)} 個")
    print(f"\n開始比對...")

    # 建立對應表
    mapping = {}
    high_confidence = []
    medium_confidence = []
    low_confidence = []

    for i, cleaned_file in enumerate(cleaned_files, 1):
        filename = Path(cleaned_file).name
        match = re.match(r'^(\d+)_(.+)__L-.+__S-.+\.md$', filename)
        if not match:
            continue

        file_id = int(match.group(1))
        cleaned_title = match.group(2)

        # 找最佳匹配
        best_sam, score = find_best_match(cleaned_file, sam_files)

        result = {
            'id': file_id,
            'cleaned_file': filename,
            'cleaned_title': cleaned_title,
            'source_file': Path(best_sam).name if best_sam else None,
            'confidence': round(score, 3),
            'checksum': calculate_md5(best_sam) if best_sam else None
        }

        mapping[file_id] = result

        # 分類
        if score >= 0.6:
            high_confidence.append(result)
            status = "✓"
        elif score >= 0.3:
            medium_confidence.append(result)
            status = "?"
        else:
            low_confidence.append(result)
            status = "✗"

        print(f"[{i}/{len(cleaned_files)}] {status} #{file_id:3d} - {score:.1%}")

    # 儲存結果
    output = {
        'total': len(mapping),
        'high_confidence': len(high_confidence),
        'medium_confidence': len(medium_confidence),
        'low_confidence': len(low_confidence),
        'mapping': mapping,
        'summary': {
            'high': [m['id'] for m in high_confidence],
            'medium': [m['id'] for m in medium_confidence],
            'low': [m['id'] for m in low_confidence]
        }
    }

    with open('source_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    # 輸出統計
    print("\n" + "="*70)
    print("對應結果統計")
    print("="*70)
    print(f"高信心度 (≥60%): {len(high_confidence)} 個")
    print(f"中信心度 (30-60%): {len(medium_confidence)} 個")
    print(f"低信心度 (<30%): {len(low_confidence)} 個")
    print(f"\n結果已儲存至: source_mapping.json")

    # 顯示需要手動核對的
    if medium_confidence or low_confidence:
        print("\n需要手動核對的檔案:")
        for result in (medium_confidence + low_confidence)[:10]:
            print(f"  #{result['id']:3d}: {result['cleaned_title']}")
            print(f"        → {result['source_file']} ({result['confidence']:.1%})")

if __name__ == '__main__':
    main()
