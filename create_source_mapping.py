#!/usr/bin/env python3
"""
為每個已整理的檔案在metadata中加入原始檔案資訊
這樣未來就能追溯每個整理檔案的來源
"""

import json
import glob
import re
from pathlib import Path

def main():
    # 讀取所有已整理檔案
    cleaned_files = sorted(glob.glob('sam_cleaned/[0-9]*.md'))

    print(f"找到 {len(cleaned_files)} 個教學檔案")

    # 統計
    has_source = 0
    no_source = 0

    for f in cleaned_files:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()

        # 檢查是否已經有 source_file 資訊
        if '"source_file"' in content or '"Source_File"' in content:
            has_source += 1
        else:
            no_source += 1

    print(f"\n已有來源資訊: {has_source} 個")
    print(f"缺少來源資訊: {no_source} 個")

    print("\n建議的解決方案:")
    print("=" * 70)
    print("1. 在 JSON metadata 中加入 'source_file' 欄位")
    print("2. 整理流程改為:")
    print("   - 讀取原始逐字稿: sam/xxx.txt")
    print("   - AI整理後生成 markdown")
    print("   - 在 JSON 中記錄: \"source_file\": \"xxx.txt\"")
    print("   - 這樣未來隨時可以追溯回原始檔案")
    print()
    print("3. 對於現有的200個檔案，可以通過:")
    print("   - 內容特徵比對（關鍵句子）")
    print("   - 建立一次性的對應表")
    print("   - 之後手動加入 source_file 資訊")

if __name__ == '__main__':
    main()
