# Phase 2 測試指南：事件同步

## 概述

Phase 2 實現了單板教學事件到 user-core 的自動同步。本文檔提供完整的測試步驟。

## 測試前準備

### 1. 確認環境配置

```bash
# 檢查 .env.local
cat 單板教學/web/.env.local | grep USER_CORE

# 應該看到：
# NEXT_PUBLIC_USER_CORE_API_URL=https://user-core.zeabur.app
```

### 2. 啟動應用

```bash
cd 單板教學/web
npm run dev
```

### 3. 打開瀏覽器控制台

- 訪問 http://localhost:3000
- 按 F12 打開開發者工具
- 切換到 Console 標籤

## 測試場景

### 場景 1：課程瀏覽事件

**步驟**：
1. 在首頁點擊任意課程
2. 查看課程詳情頁

**預期結果**：
- 控制台顯示：`[UserCoreSync] Event synced: snowboard.lesson.viewed`
- 或在 5 秒後看到：`[UserCoreSync] Flushing X events...`

**驗證**：
```bash
# 獲取你的 user_id（從控制台或註冊時紀錄）
USER_ID="your-user-id"

# 查詢 user-core 事件
curl -s "https://user-core.zeabur.app/events?user_id=$USER_ID&limit=10" | \
  python3 -m json.tool | \
  grep -A 5 "snowboard.lesson.viewed"
```

---

### 場景 2：搜尋事件

**步驟**：
1. 在首頁搜尋欄輸入關鍵字（如「後刃」）
2. 按 Enter 或點擊搜尋

**預期結果**：
- 控制台顯示：`[UserCoreSync] Event synced: snowboard.search.performed`

**驗證**：
```bash
curl -s "https://user-core.zeabur.app/events?user_id=$USER_ID&limit=10" | \
  python3 -m json.tool | \
  grep -A 10 "snowboard.search.performed"
```

**檢查 payload**：
```json
{
  "event_type": "snowboard.search.performed",
  "payload": {
    "keyword": "後刃",
    "results_count": 5,
    "original_event_type": "search_keyword"
  }
}
```

---

### 場景 3：收藏事件

**步驟**：
1. 登入（如果還沒登入）
2. 進入課程詳情頁
3. 點擊「收藏」按鈕

**預期結果**：
- 控制台顯示：`[UserCoreSync] Event synced: snowboard.favorite.added`

**驗證**：
```bash
curl -s "https://user-core.zeabur.app/events?user_id=$USER_ID&limit=10" | \
  python3 -m json.tool | \
  grep -A 10 "snowboard.favorite.added"
```

**取消收藏**：
- 再次點擊收藏按鈕
- 應該看到：`[UserCoreSync] Event synced: snowboard.favorite.removed`

---

### 場景 4：練習完成事件

**步驟**：
1. 登入（如果還沒登入）
2. 進入課程詳情頁
3. 滾動到底部
4. 點擊「完成練習」
5. 填寫評分和心得
6. 提交

**預期結果**：
- 控制台顯示：`[UserCoreSync] Event synced: snowboard.practice.completed`

**驗證**：
```bash
curl -s "https://user-core.zeabur.app/events?user_id=$USER_ID&limit=10" | \
  python3 -m json.tool | \
  grep -A 15 "snowboard.practice.completed"
```

**檢查 payload**：
```json
{
  "event_type": "snowboard.practice.completed",
  "payload": {
    "lesson_id": "01",
    "rating": 4,
    "note": "今天練習很順利",
    "original_event_type": "practice_complete"
  }
}
```

---

### 場景 5：批次處理測試

**目的**：驗證事件批次發送機制

**步驟**：
1. 快速瀏覽 10 個不同的課程
2. 觀察控制台

**預期結果**：
- 前 9 個課程：事件加入隊列，沒有立即發送
- 第 10 個課程：觸發批次發送
- 控制台顯示：`[UserCoreSync] Flushing 10 events...`
- 然後顯示 10 次：`[UserCoreSync] Event synced: snowboard.lesson.viewed`

**驗證**：
```bash
# 應該看到 10 個課程瀏覽事件
curl -s "https://user-core.zeabur.app/events?user_id=$USER_ID&limit=20" | \
  python3 -m json.tool | \
  grep "snowboard.lesson.viewed" | wc -l
```

---

### 場景 6：5 秒自動刷新測試

**目的**：驗證隊列自動刷新機制

**步驟**：
1. 瀏覽 1-2 個課程
2. 等待 5 秒
3. 觀察控制台

**預期結果**：
- 5 秒後自動顯示：`[UserCoreSync] Flushing X events...`
- 事件被發送到 user-core

---

## 錯誤場景測試

### 場景 7：網絡錯誤處理

**模擬方法**：
1. 打開瀏覽器開發者工具
2. 切換到 Network 標籤
3. 啟用「Offline」模式
4. 瀏覽課程

**預期結果**：
- 控制台顯示：`[UserCoreSync] Failed to sync event: ...`
- 用戶仍然可以正常瀏覽課程
- 事件仍然寫入 Supabase

**驗證**：
```bash
# 檢查 Supabase 事件（應該有）
# 檢查 user-core 事件（應該沒有）
```

---

### 場景 8：未登入用戶

**步驟**：
1. 登出（如果已登入）
2. 瀏覽課程

**預期結果**：
- 事件寫入 Supabase（user_id 為 null）
- 不會同步到 user-core（因為沒有 user_id）
- 控制台沒有 UserCoreSync 日誌

---

## 性能測試

### 測試 1：事件同步延遲

**方法**：
```javascript
// 在瀏覽器控制台執行
console.time('event-sync')
// 然後瀏覽課程
// 觀察控制台日誌時間
console.timeEnd('event-sync')
```

**預期**：
- 事件同步不應該阻塞頁面
- 延遲應該 < 100ms

### 測試 2：批次處理性能

**方法**：
1. 快速瀏覽 10 個課程
2. 觀察網絡請求

**預期**：
- 只有 1 次批次發送（10 個事件並行）
- 不是 10 次單獨請求

---

## 驗證清單

完成所有測試後，確認：

- [ ] 課程瀏覽事件正確同步
- [ ] 搜尋事件正確同步
- [ ] 收藏/取消收藏事件正確同步
- [ ] 練習完成事件正確同步
- [ ] 批次處理機制正常工作（10 個事件觸發）
- [ ] 5 秒自動刷新機制正常工作
- [ ] 網絡錯誤不影響用戶體驗
- [ ] 未登入用戶不會同步到 user-core
- [ ] 事件 payload 包含正確的資料
- [ ] 所有事件都有 `original_event_type` 欄位

---

## 查詢所有事件

### 獲取用戶的所有事件

```bash
USER_ID="your-user-id"

curl -s "https://user-core.zeabur.app/events?user_id=$USER_ID&limit=50" | \
  python3 -m json.tool > user_events.json

# 查看事件類型分布
cat user_events.json | \
  python3 -c "import json, sys; events=json.load(sys.stdin); print('\n'.join(set(e['event_type'] for e in events)))"
```

### 按事件類型過濾

```bash
# 只看課程瀏覽事件
curl -s "https://user-core.zeabur.app/events?user_id=$USER_ID&event_type=snowboard.lesson.viewed" | \
  python3 -m json.tool

# 只看練習完成事件
curl -s "https://user-core.zeabur.app/events?user_id=$USER_ID&event_type=snowboard.practice.completed" | \
  python3 -m json.tool
```

### 統計事件數量

```bash
# 總事件數
curl -s "https://user-core.zeabur.app/events?user_id=$USER_ID&limit=1000" | \
  python3 -c "import json, sys; print(len(json.load(sys.stdin)))"

# 各類型事件數量
curl -s "https://user-core.zeabur.app/events?user_id=$USER_ID&limit=1000" | \
  python3 -c "
import json, sys
from collections import Counter
events = json.load(sys.stdin)
counts = Counter(e['event_type'] for e in events)
for event_type, count in counts.most_common():
    print(f'{event_type}: {count}')
"
```

---

## 故障排除

### 問題 1：控制台沒有 UserCoreSync 日誌

**可能原因**：
- 未登入
- 環境變數未配置
- 代碼未正確載入

**解決方案**：
```bash
# 檢查環境變數
echo $NEXT_PUBLIC_USER_CORE_API_URL

# 重啟開發服務器
npm run dev
```

### 問題 2：事件同步失敗

**可能原因**：
- user-core 服務不可用
- 網絡問題
- 請求格式錯誤

**解決方案**：
```bash
# 檢查 user-core 服務
curl https://user-core.zeabur.app/docs

# 查看詳細錯誤
# 在瀏覽器控制台查看完整錯誤訊息
```

### 問題 3：批次處理不工作

**可能原因**：
- 瀏覽器刷新導致隊列清空
- 代碼邏輯錯誤

**解決方案**：
- 在同一個頁面會話中測試
- 檢查 `userCoreSync.ts` 的隊列邏輯

---

## 成功標準

Phase 2 測試通過的標準：

1. ✅ 所有 11 種事件類型都能正確同步
2. ✅ 批次處理機制正常工作
3. ✅ 錯誤處理不影響用戶體驗
4. ✅ 事件 payload 包含完整資料
5. ✅ 性能影響可忽略（< 100ms）

---

*測試完成後，請更新 `USER_CORE_INTEGRATION_SUMMARY.md` 標記 Phase 2 為已測試。*
