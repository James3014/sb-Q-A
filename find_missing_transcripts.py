#!/usr/bin/env python3
"""
使用內容比對找出真正缺失的逐字稿檔案
"""

import json
import glob
from pathlib import Path
from difflib import SequenceMatcher

def extract_content_from_cleaned(file_path):
    """從已整理的markdown檔案中提取原始內容摘要"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 提取 Drill_How 部分的內容作為比對依據
        # 因為這部分最接近原始逐字稿的內容
        if '## 🛠️ 怎麼練 Drill_How' in content:
            drill_start = content.find('## 🛠️ 怎麼練 Drill_How')
            drill_end = content.find('## ✅', drill_start)
            if drill_end == -1:
                drill_end = content.find('## 📚', drill_start)
            if drill_end == -1:
                drill_content = content[drill_start:]
            else:
                drill_content = content[drill_start:drill_end]

            # 清理markdown格式，只保留文字
            drill_content = drill_content.replace('## 🛠️ 怎麼練 Drill_How', '')
            drill_content = drill_content.replace('**', '')
            drill_content = drill_content.replace('- ', '')
            drill_content = drill_content.strip()

            # 取前800字元作為比對內容
            return drill_content[:800]

        # 如果沒有找到 Drill_How，就取整個文件的前800字元
        return content[:800]
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""

def extract_content_from_transcript(file_path):
    """從原始逐字稿中提取內容摘要"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # 取前800字元作為比對內容
        return content[:800].strip()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""

def find_best_match(transcript_content, cleaned_contents):
    """找出與逐字稿內容最相似的已整理檔案"""
    best_ratio = 0
    best_file = None

    for cleaned_file, cleaned_content in cleaned_contents.items():
        ratio = SequenceMatcher(None, transcript_content, cleaned_content).ratio()
        if ratio > best_ratio:
            best_ratio = ratio
            best_file = cleaned_file

    return best_file, best_ratio

def main():
    # 讀取疑似未處理的逐字稿清單
    with open('/Users/jameschen/Downloads/單板教學/unmatched_transcripts.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        unmatched_files = data['unmatched_files']

    print(f"疑似未處理的逐字稿數量: {len(unmatched_files)}")

    # 讀取所有已整理的檔案內容
    cleaned_dir = Path('/Users/jameschen/Downloads/單板教學/sam_cleaned')
    cleaned_files = sorted(glob.glob(str(cleaned_dir / '*.md')))

    print(f"已整理的檔案數量: {len(cleaned_files)}")
    print("正在讀取已整理檔案的內容...")

    cleaned_contents = {}
    for cf in cleaned_files:
        content = extract_content_from_cleaned(cf)
        if content:
            cleaned_contents[Path(cf).name] = content

    print(f"成功讀取 {len(cleaned_contents)} 個已整理檔案的內容")

    # 比對每個疑似未處理的逐字稿
    sam_dir = Path('/Users/jameschen/Downloads/單板教學/sam')
    truly_missing = []
    matched_files = []

    print("\n開始內容比對...")
    for i, unmatched_file in enumerate(unmatched_files, 1):
        transcript_path = sam_dir / unmatched_file
        transcript_content = extract_content_from_transcript(transcript_path)

        if not transcript_content:
            print(f"[{i}/{len(unmatched_files)}] 無法讀取: {unmatched_file}")
            continue

        best_file, best_ratio = find_best_match(transcript_content, cleaned_contents)

        print(f"[{i}/{len(unmatched_files)}] {unmatched_file}")
        print(f"  最佳匹配: {best_file} (相似度: {best_ratio:.1%})")

        # 相似度 < 50% 視為真正缺失的檔案
        if best_ratio < 0.50:
            truly_missing.append({
                'file': unmatched_file,
                'best_match': best_file,
                'similarity': round(best_ratio, 3)
            })
        else:
            matched_files.append({
                'file': unmatched_file,
                'matched_to': best_file,
                'similarity': round(best_ratio, 3)
            })

    # 輸出結果
    result = {
        'total_suspected': len(unmatched_files),
        'truly_missing_count': len(truly_missing),
        'actually_matched_count': len(matched_files),
        'truly_missing': truly_missing,
        'actually_matched': matched_files
    }

    output_path = '/Users/jameschen/Downloads/單板教學/truly_missing_transcripts.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"疑似未處理的逐字稿: {len(unmatched_files)} 個")
    print(f"實際上已有對應整理檔案: {len(matched_files)} 個")
    print(f"真正缺失的逐字稿: {len(truly_missing)} 個")
    print(f"\n結果已儲存至: {output_path}")
    print(f"{'='*60}")

    if truly_missing:
        print("\n真正缺失的檔案清單:")
        for item in truly_missing:
            print(f"  - {item['file']} (最高相似度僅 {item['similarity']:.1%})")

if __name__ == '__main__':
    main()
