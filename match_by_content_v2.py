#!/usr/bin/env python3
import os
import re
import json

SAM_DIR = "/Users/jameschen/Downloads/單板教學/sam"
CLEANED_DIR = "/Users/jameschen/Downloads/單板教學/sam_cleaned"
MAPPING_FILE = "/Users/jameschen/Downloads/單板教學/file_mapping.json"

with open(MAPPING_FILE, 'r') as f:
    existing = json.load(f)

used_sam = set(existing.values())
all_cleaned = [f for f in os.listdir(CLEANED_DIR) if re.match(r'^\d+_.*\.md$', f)]
unmapped_cleaned = [f for f in all_cleaned if f not in existing]
unmapped_sam = [f for f in os.listdir(SAM_DIR) if f.endswith('.txt') and f not in used_sam and not f.startswith('.')]

def get_content(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read(800)
    except:
        return ""

def extract_key_phrases(text):
    """提取3-8字的中文詞組"""
    phrases = re.findall(r'[\u4e00-\u9fff]{3,8}', text)
    return phrases[:30]

new_mapping = {}

for cleaned_file in sorted(unmapped_cleaned)[:20]:  # 先處理前20個
    cleaned_path = os.path.join(CLEANED_DIR, cleaned_file)
    cleaned_content = get_content(cleaned_path)
    cleaned_phrases = extract_key_phrases(cleaned_content)
    
    num = re.match(r'^(\d+)_', cleaned_file).group(1)
    title = re.match(r'^\d+_(.+?)__', cleaned_file).group(1)
    
    scores = []
    for sam_file in unmapped_sam:
        if sam_file in new_mapping.values():
            continue
        
        sam_path = os.path.join(SAM_DIR, sam_file)
        sam_content = get_content(sam_path)
        sam_phrases = extract_key_phrases(sam_content)
        
        # 計算重疊詞組數
        overlap = sum(1 for p in cleaned_phrases if p in sam_content)
        scores.append((sam_file, overlap))
    
    scores.sort(key=lambda x: x[1], reverse=True)
    
    print(f"\n{num} {title}")
    print(f"  關鍵詞: {', '.join(cleaned_phrases[:5])}")
    if scores[0][1] > 0:
        print(f"  最佳: {scores[0][0][:50]} (重疊:{scores[0][1]})")
        if scores[0][1] >= 3:
            new_mapping[cleaned_file] = scores[0][0]
            print(f"  ✅ 自動配對")
    else:
        print(f"  ❌ 無匹配")

print(f"\n新增: {len(new_mapping)}")
