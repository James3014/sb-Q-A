#!/usr/bin/env python3
"""
為重複ID的源檔案創建變體命名
例如: 024_標題.txt, 024_b_標題.txt, 024_c_標題.txt
"""

import json
import shutil
import os
from pathlib import Path
import re
from collections import defaultdict

# 讀取對應表
with open('complete_sam_cleaned_mapping.json', 'r') as f:
    mapping_data = json.load(f)

# 提取標題
def extract_title_from_cleaned(cleaned_file):
    match = re.match(r'^\d+_(.+?)__L-.+__S-.+\.md$', cleaned_file)
    if match:
        return match.group(1)
    return None

# 按cleaned_id分組
id_groups = defaultdict(list)
for item in mapping_data['mappings']:
    id_groups[item['cleaned_id']].append(item)

print("="*70)
print("為重複ID創建變體命名")
print("="*70)

success = 0
skip = 0
errors = []

for cleaned_id, items in sorted(id_groups.items()):
    title = extract_title_from_cleaned(items[0]['cleaned_file'])
    if not title:
        continue

    # 如果只有一個，使用正常命名
    if len(items) == 1:
        item = items[0]
        new_filename = f"{cleaned_id:03d}_{title}.txt"
        new_path = f"sam_renamed/{new_filename}"

        if os.path.exists(new_path):
            skip += 1
            continue

        source_path = f"sam/{item['source_file']}"
        if not os.path.exists(source_path):
            continue

        try:
            shutil.copy2(source_path, new_path)
            success += 1
        except Exception as e:
            errors.append(f"{item['source_file']}: {e}")

    # 如果有多個，使用變體命名
    else:
        for idx, item in enumerate(items):
            if idx == 0:
                # 第一個用正常命名
                new_filename = f"{cleaned_id:03d}_{title}.txt"
            else:
                # 後續用變體 _b, _c, _d...
                variant = chr(ord('b') + idx - 1)
                new_filename = f"{cleaned_id:03d}_{variant}_{title}.txt"

            new_path = f"sam_renamed/{new_filename}"

            if os.path.exists(new_path):
                skip += 1
                continue

            source_path = f"sam/{item['source_file']}"
            if not os.path.exists(source_path):
                continue

            try:
                shutil.copy2(source_path, new_path)
                success += 1
                if len(items) > 1:  # 只顯示多源的
                    print(f"  [{cleaned_id:03d}{'_'+chr(ord('b')+idx-1) if idx>0 else '':4s}] {item['source_file'][:50]}")
            except Exception as e:
                errors.append(f"{item['source_file']}: {e}")

print(f"\n" + "="*70)
print("完成")
print("="*70)
print(f"新增: {success}")
print(f"跳過: {skip}")
print(f"錯誤: {len(errors)}")

# 最終統計
import glob
total = len(glob.glob('sam_renamed/*.txt'))
print(f"\nsam_renamed 總檔案數: {total}")
print(f"應有: 210個 (174個主檔 + 36個變體)")

if errors:
    print(f"\n錯誤 (前5個):")
    for err in errors[:5]:
        print(f"  {err}")
EOF
