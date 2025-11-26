#!/bin/bash
# 批次處理119個未整理的原始稿
# 分批處理以避免超時

cd /Users/jameschen/Downloads/單板教學

echo "開始批次整理原始稿..."
echo "總數: 119個"
echo ""

# 檢查API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "錯誤: ANTHROPIC_API_KEY 未設定"
    exit 1
fi

# 執行處理
python3 process_remaining_transcripts.py

echo ""
echo "批次處理完成！"
echo "檢查輸出目錄: sam_cleaned_new/"
