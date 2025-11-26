#!/usr/bin/env python3
"""
重建 sam 逐字稿與 sam_cleaned 的正確對應關係
使用內容相似度比對，而非檔名
"""
import os
import json
import re
from difflib import SequenceMatcher

SAM_DIR = "/Users/jameschen/Downloads/單板教學/sam"
CLEANED_DIR = "/Users/jameschen/Downloads/單板教學/sam_cleaned"
OUTPUT_FILE = "/Users/jameschen/Downloads/單板教學/correct_mapping.json"

def clean_text(text):
    """清理文字用於比對（移除標點、空白、轉簡體）"""
    # 移除 markdown 標記
    text = re.sub(r'[#*_\-\[\]()]', '', text)
    # 移除空白
    text = re.sub(r'\s+', '', text)
    return text.lower()

def extract_key_phrases(text):
    """提取關鍵詞組（用於快速篩選）"""
    # 提取中文詞組（3-8字）
    phrases = re.findall(r'[\u4e00-\u9fff]{3,8}', text)
    return set(phrases[:50])  # 取前50個

def similarity_score(text1, text2):
    """計算兩段文字的相似度"""
    clean1 = clean_text(text1)
    clean2 = clean_text(text2)
    
    # 使用 SequenceMatcher
    return SequenceMatcher(None, clean1, clean2).ratio()

def find_best_match(sam_content, cleaned_files_content):
    """找出最佳匹配的 cleaned 檔案"""
    best_match = None
    best_score = 0
    
    sam_phrases = extract_key_phrases(sam_content)
    
    for cleaned_file, cleaned_content in cleaned_files_content.items():
        # 快速篩選：關鍵詞重疊度
        cleaned_phrases = extract_key_phrases(cleaned_content)
        overlap = len(sam_phrases & cleaned_phrases)
        
        if overlap < 3:  # 至少3個關鍵詞重疊
            continue
            
        # 詳細比對
        score = similarity_score(sam_content, cleaned_content)
        
        if score > best_score:
            best_score = score
            best_match = cleaned_file
    
    return best_match, best_score

def main():
    print("🔍 開始重建對應關係...")
    
    # 讀取所有 sam 檔案
    sam_files = {}
    for filename in os.listdir(SAM_DIR):
        if filename.endswith('.txt') and not filename.startswith('.'):
            filepath = os.path.join(SAM_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                sam_files[filename] = f.read()
    
    print(f"✅ 讀取 {len(sam_files)} 個 sam 檔案")
    
    # 讀取所有 cleaned 檔案
    cleaned_files = {}
    for filename in os.listdir(CLEANED_DIR):
        if filename.endswith('.md') and re.match(r'^\d+_', filename):
            filepath = os.path.join(CLEANED_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                cleaned_files[filename] = f.read()
    
    print(f"✅ 讀取 {len(cleaned_files)} 個 cleaned 檔案")
    
    # 建立對應關係
    mapping = {}
    used_cleaned = set()
    
    for i, (sam_file, sam_content) in enumerate(sam_files.items(), 1):
        print(f"[{i}/{len(sam_files)}] 比對 {sam_file}...", end=' ')
        
        # 排除已使用的檔案
        available_cleaned = {k: v for k, v in cleaned_files.items() if k not in used_cleaned}
        
        best_match, score = find_best_match(sam_content, available_cleaned)
        
        if best_match and score > 0.3:  # 相似度閾值
            mapping[sam_file] = {
                "cleaned_file": best_match,
                "similarity": round(score, 3)
            }
            used_cleaned.add(best_match)
            print(f"✅ {best_match} (相似度: {score:.2%})")
        else:
            mapping[sam_file] = {
                "cleaned_file": None,
                "similarity": 0
            }
            print(f"❌ 找不到匹配")
    
    # 找出未匹配的 cleaned 檔案
    unmatched_cleaned = set(cleaned_files.keys()) - used_cleaned
    
    # 儲存結果
    result = {
        "mapping": mapping,
        "unmatched_cleaned": sorted(list(unmatched_cleaned)),
        "stats": {
            "total_sam": len(sam_files),
            "total_cleaned": len(cleaned_files),
            "matched": len(used_cleaned),
            "unmatched_sam": len([v for v in mapping.values() if v["cleaned_file"] is None]),
            "unmatched_cleaned": len(unmatched_cleaned)
        }
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 統計：")
    print(f"  - Sam 檔案總數: {result['stats']['total_sam']}")
    print(f"  - Cleaned 檔案總數: {result['stats']['total_cleaned']}")
    print(f"  - 成功配對: {result['stats']['matched']}")
    print(f"  - 未配對 Sam: {result['stats']['unmatched_sam']}")
    print(f"  - 未配對 Cleaned: {result['stats']['unmatched_cleaned']}")
    print(f"\n✅ 對應關係已儲存至: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
