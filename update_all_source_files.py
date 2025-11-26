#!/usr/bin/env python3
"""
更新所有sam_cleaned中md檔案的source_file欄位
根據complete_sam_cleaned_mapping.json對應表
"""

import json
import re
import glob
import hashlib
from pathlib import Path

# 讀取對應表
with open('complete_sam_cleaned_mapping.json', 'r') as f:
    mapping_data = json.load(f)

# 建立cleaned_id → source_file的映射
id_to_source = {}
for item in mapping_data['mappings']:
    id_to_source[item['cleaned_id']] = {
        'source_file': item['source_file'],
        'confidence': item['confidence'],
        'match_type': item['match_type']
    }

print("="*70)
print("更新所有md檔案的source_file欄位")
print("="*70)
print(f"對應表映射數: {len(id_to_source)}")
print()

# 獲取所有md檔案
md_files = glob.glob('sam_cleaned/[0-9]*.md')
print(f"掃描到的md檔案: {len(md_files)}")
print()

updated_count = 0
already_has = 0
no_mapping = 0
errors = []

for md_path in sorted(md_files):
    # 提取ID
    filename = Path(md_path).name
    match = re.match(r'^(\d+)_', filename)
    if not match:
        continue

    cleaned_id = int(match.group(1))

    # 檢查是否有對應
    if cleaned_id not in id_to_source:
        no_mapping += 1
        if no_mapping <= 5:
            print(f"⚠ 無對應: {filename[:50]}")
        continue

    source_info = id_to_source[cleaned_id]

    try:
        # 讀取md檔案
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 找JSON區塊
        json_match = re.search(r'```json\s*\n(.*?)\n```', content, re.DOTALL)
        if not json_match:
            errors.append(f"找不到JSON: {filename}")
            continue

        json_start = json_match.start(1)
        json_end = json_match.end(1)
        json_str = json_match.group(1)

        # 解析JSON
        json_data = json.loads(json_str)

        # 檢查是否已有source_file
        if 'source_file' in json_data and json_data['source_file']:
            already_has += 1
            continue

        # 添加source_file欄位
        json_data['source_file'] = source_info['source_file']
        json_data['match_type'] = source_info['match_type']
        json_data['match_confidence'] = source_info['confidence']

        # 計算checksum (如果源檔案存在)
        source_path = f"sam/{source_info['source_file']}"
        try:
            with open(source_path, 'rb') as sf:
                checksum = hashlib.md5(sf.read()).hexdigest()[:12]
                json_data['source_checksum'] = checksum
        except:
            pass  # 源檔案不存在，跳過checksum

        # 重新生成JSON
        new_json = json.dumps(json_data, ensure_ascii=False, indent=2)

        # 替換JSON區塊
        new_content = content[:json_start] + new_json + content[json_end:]

        # 寫回檔案
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        updated_count += 1

        if updated_count <= 10 or updated_count % 50 == 0:
            print(f"[{cleaned_id:03d}] {filename[:40]:40s} ← {source_info['source_file'][:35]}")

    except Exception as e:
        errors.append(f"{filename}: {str(e)}")

print("\n" + "="*70)
print("完成")
print("="*70)
print(f"已更新: {updated_count}")
print(f"已有source_file: {already_has}")
print(f"無對應: {no_mapping}")
print(f"錯誤: {len(errors)}")

if errors:
    print(f"\n錯誤詳情 (前5個):")
    for err in errors[:5]:
        print(f"  - {err}")

print(f"\n總計處理: {updated_count + already_has + no_mapping}")

# 儲存更新記錄
with open('source_file_update_log.json', 'w', encoding='utf-8') as f:
    json.dump({
        'updated': updated_count,
        'already_has': already_has,
        'no_mapping': no_mapping,
        'errors': errors
    }, f, ensure_ascii=False, indent=2)

print(f"更新記錄已儲存至: source_file_update_log.json")
