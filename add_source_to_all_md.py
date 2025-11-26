#!/usr/bin/env python3
"""
在所有已整理的md檔案中加入source_file欄位
基於當前的匹配結果（雖然可能不完全準確）
"""

import json
import glob
import re
import hashlib
from pathlib import Path

def calculate_md5(file_path):
    """計算檔案MD5"""
    try:
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()[:12]  # 前12碼即可
    except:
        return None

def add_source_to_md(md_path, source_file, confidence):
    """在markdown檔案的JSON中加入source_file欄位"""
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 檢查是否已有source_file
        if '"source_file"' in content or '"Source_File"' in content:
            return 'already_exists'

        # 找到JSON區塊
        json_start = content.find('```json')
        if json_start == -1:
            return 'no_json'

        json_start += 7
        json_end = content.find('```', json_start)
        if json_end == -1:
            return 'invalid_json'

        # 解析JSON
        json_str = content[json_start:json_end].strip()
        json_data = json.loads(json_str)

        # 加入source_file欄位
        if source_file:
            sam_path = f"sam/{source_file}"
            json_data['source_file'] = source_file
            json_data['source_checksum'] = calculate_md5(sam_path) or "unknown"
            json_data['match_confidence'] = round(confidence, 3)

        # 重新生成JSON
        new_json = json.dumps(json_data, ensure_ascii=False, indent=2)

        # 替換原JSON
        new_content = content[:json_start] + new_json + '\n' + content[json_end:]

        # 寫回檔案
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return 'success'
    except Exception as e:
        return f'error: {e}'

def main():
    # 讀取對應表
    with open('source_mapping.json', 'r') as f:
        mapping = json.load(f)['mapping']

    # 處理每個檔案
    stats = {
        'success': 0,
        'already_exists': 0,
        'no_json': 0,
        'invalid_json': 0,
        'error': 0,
        'no_source': 0
    }

    print("="*70)
    print("在md檔案中加入source_file欄位")
    print("="*70)

    for file_id_str, info in sorted(mapping.items(), key=lambda x: int(x[0])):
        file_id = int(file_id_str)
        cleaned_file = info['cleaned_file']
        source_file = info['source_file']
        confidence = info['confidence']

        md_path = f"sam_cleaned/{cleaned_file}"

        if not source_file:
            stats['no_source'] += 1
            print(f"[{file_id:3d}] ⚠ 無來源檔案")
            continue

        result = add_source_to_md(md_path, source_file, confidence)

        if result == 'success':
            stats['success'] += 1
            conf_icon = "✓" if confidence >= 0.6 else ("?" if confidence >= 0.3 else "✗")
            print(f"[{file_id:3d}] {conf_icon} {source_file[:50]}")
        elif result == 'already_exists':
            stats['already_exists'] += 1
        elif result == 'no_json':
            stats['no_json'] += 1
        elif result == 'invalid_json':
            stats['invalid_json'] += 1
        else:
            stats['error'] += 1
            print(f"[{file_id:3d}] ✗ 錯誤: {result}")

    print("\n" + "="*70)
    print("處理結果統計")
    print("="*70)
    print(f"成功加入: {stats['success']}")
    print(f"已存在: {stats['already_exists']}")
    print(f"無來源: {stats['no_source']}")
    print(f"無JSON: {stats['no_json']}")
    print(f"JSON錯誤: {stats['invalid_json']}")
    print(f"其他錯誤: {stats['error']}")
    print(f"\n總計: {stats['success'] + stats['already_exists']}/{len(mapping)}")

if __name__ == '__main__':
    main()
