#!/usr/bin/env python3
import os, re, json

SAM_DIR = "/Users/jameschen/Downloads/單板教學/sam"
CLEANED_DIR = "/Users/jameschen/Downloads/單板教學/sam_cleaned"
MAPPING_FILE = "/Users/jameschen/Downloads/單板教學/file_mapping.json"

with open(MAPPING_FILE, 'r') as f:
    existing = json.load(f)

used_sam = set(existing.values())
all_cleaned = [f for f in os.listdir(CLEANED_DIR) if re.match(r'^\d+_.*\.md$', f)]
unmapped_cleaned = [f for f in all_cleaned if f not in existing]
unmapped_sam = [f for f in os.listdir(SAM_DIR) if f.endswith('.txt') and f not in used_sam and not f.startswith('.')]

def get_real_content(filepath):
    """跳過格式標題，讀取實際內容"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        # 跳過前10行格式，讀取實際描述
        content = ''.join(lines[10:40])
        return content
    except:
        return ""

def extract_phrases(text):
    return re.findall(r'[\u4e00-\u9fff]{3,10}', text)[:40]

new_mapping = {}

for cleaned_file in sorted(unmapped_cleaned):
    cleaned_path = os.path.join(CLEANED_DIR, cleaned_file)
    cleaned_content = get_real_content(cleaned_path)
    cleaned_phrases = extract_phrases(cleaned_content)
    
    num = re.match(r'^(\d+)_', cleaned_file).group(1)
    title = re.match(r'^\d+_(.+?)__', cleaned_file).group(1)
    
    best_file = None
    best_score = 0
    
    for sam_file in unmapped_sam:
        if sam_file in new_mapping.values():
            continue
        
        sam_path = os.path.join(SAM_DIR, sam_file)
        with open(sam_path, 'r', encoding='utf-8') as f:
            sam_content = f.read(1500)
        
        overlap = sum(1 for p in cleaned_phrases if p in sam_content)
        
        if overlap > best_score:
            best_score = overlap
            best_file = sam_file
    
    if best_score >= 5:
        new_mapping[cleaned_file] = best_file
        print(f"✅ {num} {title[:20]}... → {best_file[:40]}... ({best_score})")
    else:
        print(f"❌ {num} {title[:20]}... (最佳:{best_score})")

# 合併
final = {**existing, **new_mapping}
with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
    json.dump(final, f, ensure_ascii=False, indent=2)

print(f"\n新增: {len(new_mapping)}, 總計: {len(final)}/{len(all_cleaned)}")
