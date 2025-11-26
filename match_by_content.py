#!/usr/bin/env python3
import os
import re
import json

SAM_DIR = "/Users/jameschen/Downloads/單板教學/sam"
CLEANED_DIR = "/Users/jameschen/Downloads/單板教學/sam_cleaned"
MAPPING_FILE = "/Users/jameschen/Downloads/單板教學/file_mapping.json"

# 讀取已配對
with open(MAPPING_FILE, 'r') as f:
    existing = json.load(f)

used_sam = set(existing.values())

# 找未配對的
all_cleaned = [f for f in os.listdir(CLEANED_DIR) if re.match(r'^\d+_.*\.md$', f)]
unmapped_cleaned = [f for f in all_cleaned if f not in existing]
unmapped_sam = [f for f in os.listdir(SAM_DIR) if f.endswith('.txt') and f not in used_sam and not f.startswith('.')]

print(f"未配對 cleaned: {len(unmapped_cleaned)}")
print(f"未配對 sam: {len(unmapped_sam)}")

def extract_keywords_from_content(filepath, max_chars=500):
    """提取檔案內容的中文關鍵字"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read(max_chars)
        # 提取中文詞（2-6字）
        words = re.findall(r'[\u4e00-\u9fff]{2,6}', content)
        return set(words[:50])  # 取前50個
    except:
        return set()

# 為每個未配對的 cleaned 找最佳匹配
new_mapping = {}

for i, cleaned_file in enumerate(sorted(unmapped_cleaned), 1):
    cleaned_path = os.path.join(CLEANED_DIR, cleaned_file)
    cleaned_keywords = extract_keywords_from_content(cleaned_path)
    
    num = re.match(r'^(\d+)_', cleaned_file).group(1)
    
    best_match = None
    best_score = 0
    
    for sam_file in unmapped_sam:
        if sam_file in new_mapping.values():
            continue
            
        sam_path = os.path.join(SAM_DIR, sam_file)
        sam_keywords = extract_keywords_from_content(sam_path, 1000)
        
        # 計算關鍵字重疊
        overlap = len(cleaned_keywords & sam_keywords)
        score = overlap / max(len(cleaned_keywords), 1)
        
        if score > best_score:
            best_score = score
            best_match = sam_file
    
    if best_match and best_score > 2:  # 至少3個關鍵字重疊
        new_mapping[cleaned_file] = best_match
        title = re.match(r'^\d+_(.+?)__', cleaned_file).group(1)
        print(f"✅ {num} {title[:15]}... → {best_match[:35]}... ({best_score:.1f})")
    else:
        title = re.match(r'^\d+_(.+?)__', cleaned_file).group(1)
        print(f"❌ {num} {title[:15]}...")

# 合併並儲存
final_mapping = {**existing, **new_mapping}
with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
    json.dump(final_mapping, f, ensure_ascii=False, indent=2)

print(f"\n新增配對: {len(new_mapping)}")
print(f"總配對: {len(final_mapping)}/{len(all_cleaned)}")
