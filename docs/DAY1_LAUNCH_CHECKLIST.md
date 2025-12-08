# Day 1 調整① 上線檢查清單

**日期**：2025-12-08
**版本**：調整① - 付費牆位置
**狀態**：✅ 代碼完成，待 SQL 遷移 & 生產環境驗證

---

## ✅ 代碼修改完成（已提交）

### Git Commit
```
912d998 feat: 調整① 付費牆位置 - 免費版與 PRO 版課程分離 (Day 1 上線準備)
```

### 修改檔案清單

| 檔案 | 狀態 | 說明 |
|------|------|------|
| `docs/migration_premium_simple.sql` | 🆕 新建 | SQL 遷移腳本（28 免費 + 154 PRO） |
| `web/src/components/LessonCard.tsx` | ✏️ 修改 | 鎖定樣式 + 徽章 + 遮罩 |
| `web/src/lib/constants.ts` | ✏️ 修改 | PROBLEM_CATEGORIES 添加 `isPro` 字段 + 進階技巧分類 |
| `web/src/components/home/ProblemCategories.tsx` | ✏️ 修改 | PRO 邏輯 + 導向 /pricing |
| `web/src/components/home/LessonList.tsx` | ✏️ 修改 | showLock prop 判斷邏輯 |

### 編譯檢查
```
✅ npm run build - 成功（0 errors）
✅ TypeScript - 通過（no issues）
✅ 代碼格式 - 符合 Alpine Velocity 風格
```

---

## 🚀 即將進行：SQL 遷移（生產環境）

### 步驟 1：Supabase Dashboard 執行 SQL

1. 登入 [https://app.supabase.com](https://app.supabase.com)
2. 選擇「單板教學」項目
3. 進入 **SQL Editor**
4. 新增查詢，複製以下代碼並執行：

```sql
-- 簡單付費牆遷移腳本
-- 前 28 堂課程：免費版
-- 後 154 堂課程：PRO 版

UPDATE lessons
SET is_premium = false
WHERE CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER) <= 28;

UPDATE lessons
SET is_premium = true
WHERE CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER) > 28;

-- 驗證結果
SELECT
  is_premium,
  COUNT(*) as count
FROM lessons
GROUP BY is_premium
ORDER BY is_premium;
```

### 步驟 2：驗證執行結果

預期輸出：
```
is_premium | count
-----------|-------
f (false)  |   28
t (true)   |  154
```

### 步驟 3：確認 RLS 策略已啟用

檢查以下 RLS 策略：
- `lessons_free`：允許所有人查看免費課程
- `lessons_premium_active_or_admin`：只允許 PRO 用戶或管理員查看付費課程

```sql
-- 檢查 RLS 狀態
SELECT * FROM pg_policies
WHERE tablename = 'lessons';
```

---

## 📋 生產環境部署清單

### 代碼部署（已完成）
- ✅ 代碼提交到 GitHub (commit 912d998)
- ⏳ Zeabur 自動部署（監控狀態）

### Supabase 配置（待執行）
- [ ] 執行 SQL 遷移腳本
- [ ] 驗證課程標記（28 免費 + 154 PRO）
- [ ] 驗證 RLS 策略正確啟用

### 生產環境驗證（待驗證）

#### 免費用戶路徑
```
1. 以免費用戶身份登入
2. 進入首頁
3. 驗證：
   ✓ 能看到所有 182 堂課程
   ✓ ID 1-28 的課程正常顯示
   ✓ ID 29-182 的課程顯示灰階 + 鎖定徽章
   ✓ 點擊任何 ID > 28 的課程 → 跳轉到 /pricing
4. 驗證快速入口：
   ✓ 「進階技巧 🏔️」分類顯示 PRO 標籤
   ✓ 點擊「進階技巧」→ 跳轉到 /pricing
```

#### PRO 用戶路徑
```
1. 以 PRO 用戶身份登入
2. 進入首頁
3. 驗證：
   ✓ 能看到所有 182 堂課程
   ✓ 所有課程正常顯示（無鎖定狀態）
   ✓ 點擊任何課程 → 進入課程詳情頁
4. 驗證快速入口：
   ✓ 「進階技巧 🏔️」分類正常顯示（無 PRO 標籤）
   ✓ 點擊「進階技巧」→ 過濾課程結果
```

#### 課程詳情頁驗證
```
1. 免費用戶點擊 PRO 課程（ID > 28）
   ✓ 應顯示 LessonUnlockPRO 組件（鎖定提示）
   ✓ 無法查看課程內容（what/why/how/signals）

2. PRO 用戶點擊任何課程
   ✓ 能查看完整課程內容
```

---

## 📊 監控指標（Day 1 上線後）

### 轉化率指標
```
1. Free → PRO 轉化率
   - 追蹤「查看方案」按鈕點擊
   - 預期：首週 5-10% 新增訂閱

2. 課程互動率
   - 追蹤課程卡片點擊
   - 對比：免費課程 vs PRO 課程

3. 付費頁面訪問
   - 來自「進階技巧」分類
   - 來自鎖定課程卡片
   - 來自課程詳情頁
```

### 用戶反饋監控
```
1. 檢查 /feedback 意見回報
   - 確認無「課程被鎖定」的負面反饋
   - 確認沒有 Bug 報告

2. 檢查 Console 錯誤
   - Supabase 日誌
   - Next.js 錯誤日誌
   - Network 錯誤

3. 性能指標
   - 首頁加載時間
   - 課程列表渲染時間
   - 付費頁面響應時間
```

---

## ⚠️ 可能的問題 & 解決方案

### 問題 1：課程不顯示鎖定狀態
**原因**：SQL 遷移未執行 / RLS 策略未啟用
**解決**：
1. 驗證 SQL 遷移執行結果（應有 28 免費 + 154 PRO）
2. 檢查 RLS 策略是否啟用
3. 清除瀏覽器緩存並重新登入

### 問題 2：PRO 用戶看不到課程
**原因**：RLS 策略限制過度 / 用戶訂閱狀態不正確
**解決**：
1. 檢查用戶的 `subscription_type` 和 `subscription_expires_at`
2. 驗證 `is_subscription_active()` 函數邏輯
3. 檢查 Supabase 日誌中的 RLS 錯誤

### 問題 3：免費課程也被鎖定
**原因**：SQL 遷移邏輯錯誤 / ID 提取失敗
**解決**：
```sql
-- 檢查課程標記是否正確
SELECT id, is_premium,
       CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER) as id_number
FROM lessons
ORDER BY CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER)
LIMIT 50;

-- 應該看到：ID 1-28 的 is_premium = false，ID 29+ 的 is_premium = true
```

---

## 🔄 回滾計畫（如需緊急回滾）

### 快速回滾 SQL
```sql
-- 選項 1：恢復所有課程為免費
UPDATE lessons SET is_premium = false;

-- 選項 2：從備份恢復（如已備份）
-- ALTER TABLE lessons RENAME TO lessons_broken;
-- ALTER TABLE lessons_backup RENAME TO lessons;
```

### 回滾代碼
```bash
# 回滾到上一個 commit
git revert 912d998

# 或強制重置（危險）
git reset --hard HEAD~1
git push -f origin main
```

---

## ✨ Day 1 成功標準

上線視為**成功** = 以下全部✅通過：

- ✅ SQL 遷移執行成功（28 免費 + 154 PRO）
- ✅ RLS 策略正確限制查詢結果
- ✅ 免費用戶可看到所有課程標題
- ✅ 免費用戶點擊 PRO 課程 → /pricing
- ✅ PRO 用戶無任何限制（可查看所有課程）
- ✅ 課程詳情頁正確顯示鎖定狀態
- ✅ 快速入口「進階技巧」正確表現
- ✅ 生產環境無報錯、無 Bug

---

## 📞 下一步（Day 30 準備）

1. **監控 Day 1-30 的轉化率和反饋**
2. **開始 Week 2-4 的調整③ 開發**（儀表板強化，靜默開發）
3. **準備 Day 30 的儀表板上線**

---

**檢查清單更新於**：2025-12-08
**狀態**：代碼完成 ✅ | 待 SQL 遷移 ⏳ | 待生產驗證 ⏳
