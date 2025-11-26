#!/usr/bin/env python3
import os, re, json

SAM_DIR = "/Users/jameschen/Downloads/單板教學/sam"
CLEANED_DIR = "/Users/jameschen/Downloads/單板教學/sam_cleaned"
MAPPING_FILE = "/Users/jameschen/Downloads/單板教學/file_mapping.json"
OUTPUT = "/Users/jameschen/Downloads/單板教學/unmapped.txt"

with open(MAPPING_FILE, 'r') as f:
    existing = json.load(f)

used_sam = set(existing.values())
all_cleaned = [f for f in os.listdir(CLEANED_DIR) if re.match(r'^\d+_.*\.md$', f)]
unmapped_cleaned = sorted([f for f in all_cleaned if f not in existing])
unmapped_sam = sorted([f for f in os.listdir(SAM_DIR) if f.endswith('.txt') and f not in used_sam and not f.startswith('.')])

with open(OUTPUT, 'w', encoding='utf-8') as f:
    f.write("=== 未配對的 CLEANED 檔案 (93個) ===\n\n")
    for cf in unmapped_cleaned:
        num = re.match(r'^(\d+)_', cf).group(1)
        title = re.match(r'^\d+_(.+?)__', cf).group(1)
        f.write(f"{num:>3}. {title}\n")
    
    f.write("\n\n=== 未使用的 SAM 檔案 (92個) ===\n\n")
    for i, sf in enumerate(unmapped_sam, 1):
        f.write(f"{i:>3}. {sf}\n")
    
    f.write("\n\n=== 手動配對格式 ===\n")
    f.write("# 在下方填寫配對（格式：cleaned檔名 → sam檔名）\n\n")
    for cf in unmapped_cleaned[:10]:
        f.write(f"{cf} → \n")

print(f"✅ 已生成清單: {OUTPUT}")
print(f"未配對 cleaned: {len(unmapped_cleaned)}")
print(f"未使用 sam: {len(unmapped_sam)}")
print(f"\n建議：用 grep 搜尋關鍵字來配對")
print(f"例如: grep -l '腳踝' sam/*.txt")
