#!/bin/bash

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY"
BASE_URL="https://nbstwggxfwvfruwgfcqd.supabase.co/rest/v1/lessons"

# 處理 lesson 10-50
for i in {10..50}; do
  ID=$(printf "%02d" $i)
  echo "Processing Lesson $ID..."
  
  # 查詢課程內容
  RESPONSE=$(curl -s "${BASE_URL}?id=eq.${ID}&select=id,title,how" \
    -H "apikey: ${API_KEY}" \
    -H "Authorization: Bearer ${API_KEY}")
  
  # 檢查是否有資料
  if echo "$RESPONSE" | jq -e '.[0]' > /dev/null 2>&1; then
    TITLE=$(echo "$RESPONSE" | jq -r '.[0].title')
    echo "  Title: $TITLE"
    echo "  ✓ Found"
  else
    echo "  ✗ Not found or error"
  fi
  
  sleep 0.5
done
