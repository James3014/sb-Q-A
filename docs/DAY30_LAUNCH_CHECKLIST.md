# Day 30 調整③ 上線檢查清單

**日期**: 2025-12-30
**版本**: 調整③ - 儀表板強化
**狀態**: 🚀 準備上線

---

## ✅ 預上線檢查（Day 30 10:00 AM）

### 代碼層面

- [ ] **GitHub 代碼狀態**
  - [ ] 最新代碼已提交（commit fcb0a56）
  - [ ] 所有代碼已推送至 main 分支
  - [ ] CI/CD 檢查通過（GitHub Actions）
  - [ ] Zeabur 預準備完畢（待部署）

- [ ] **構建驗證**
  - [ ] 本地 `npm run build` 成功（0 errors）
  - [ ] TypeScript 編譯無警告
  - [ ] 靜態資源大小合理

### 數據庫層面

- [ ] **Supabase 準備**
  - [ ] 登入 https://app.supabase.com（非生產環境）
  - [ ] 選擇「單板教學」項目
  - [ ] SQL Editor 已打開
  - [ ] `migration_practice_analytics.sql` 已準備複製

- [ ] **數據備份**
  - [ ] 最新備份已確認（< 1 小時）
  - [ ] 備份大小正常
  - [ ] 備份可恢復性已驗證（非生產環境測試）

### 監控準備

- [ ] **Sentry/DataDog 已啟用**
  - [ ] 儀表板已打開
  - [ ] 告警規則已生效
  - [ ] 通知管道已測試

- [ ] **Supabase 日誌監控**
  - [ ] 日誌查看頁面已打開
  - [ ] 可實時監控 SQL 函數執行

- [ ] **應急聯繫清單已備妥**
  - [ ] 技術團隊可聯繫
  - [ ] Supabase 支持聯繫方式已記錄
  - [ ] 回滾流程已確認

---

## 🚀 上線執行流程（Day 30 10:30 AM）

### 步驟 1：Supabase SQL 遷移（預計 10 分鐘）

#### 1.1 執行 SQL 遷移腳本

**位置**: Supabase SQL Editor

**代碼**:
```sql
-- 🆕 Day 30 上線：新增 SQL 分析函數和索引
-- 執行此腳本後，儀表板將具備完整的分析功能

-- ========================================
-- 1️⃣ 練習頻率分析函數
-- ========================================
CREATE OR REPLACE FUNCTION get_practice_frequency_by_skill(
  p_user_id UUID,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  skill TEXT,
  practice_count BIGINT,
  avg_rating NUMERIC,
  last_practice_date TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(l.casi->>'Primary_Skill', l.casi->>'Core_Competency', '未分類') AS skill,
    COUNT(*) AS practice_count,
    ROUND(AVG(CAST(pl.rating AS NUMERIC)), 1) AS avg_rating,
    MAX(pl.created_at) AS last_practice_date
  FROM practice_logs pl
  JOIN lessons l ON pl.lesson_id = l.id
  WHERE pl.user_id = p_user_id
    AND pl.created_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY COALESCE(l.casi->>'Primary_Skill', l.casi->>'Core_Competency', '未分類')
  ORDER BY practice_count DESC
  LIMIT 10;
END;
$$;

-- ========================================
-- 2️⃣ 技能進步曲線函數
-- ========================================
CREATE OR REPLACE FUNCTION get_skill_improvement_curve(
  p_user_id UUID,
  p_skill TEXT,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  avg_rating NUMERIC,
  practice_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pl.created_at::DATE AS date,
    ROUND(AVG(CAST(pl.rating AS NUMERIC)), 1) AS avg_rating,
    COUNT(*) AS practice_count
  FROM practice_logs pl
  JOIN lessons l ON pl.lesson_id = l.id
  WHERE pl.user_id = p_user_id
    AND (
      l.casi->>'Primary_Skill' = p_skill
      OR l.casi->>'Core_Competency' = p_skill
    )
    AND pl.created_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY pl.created_at::DATE
  ORDER BY date ASC;
END;
$$;

-- ========================================
-- 3️⃣ 創建索引加速查詢
-- ========================================
CREATE INDEX IF NOT EXISTS idx_practice_logs_user_created
ON practice_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_practice_logs_lesson
ON practice_logs(lesson_id);

-- ✅ 上線完成
-- 執行此腳本後，可使用以下查詢驗證：
-- SELECT * FROM get_practice_frequency_by_skill('user-uuid', 30);
-- SELECT * FROM get_skill_improvement_curve('user-uuid', '用刃', 30);
```

**執行步驟**:
1. [ ] 複製上述 SQL 代碼
2. [ ] 在 Supabase SQL Editor 中貼上
3. [ ] 點擊「▶️ Run」或「⌘ Enter」
4. [ ] 等待執行完成（通常 < 30 秒）

**預期結果**:
```
✅ Database changes committed
   - Table: public.practice_logs
   - Function: get_practice_frequency_by_skill created
   - Function: get_skill_improvement_curve created
   - Index: idx_practice_logs_user_created created
   - Index: idx_practice_logs_lesson created
```

#### 1.2 驗證 SQL 遷移成功

**驗證查詢 1**：檢查函數是否已創建
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'get_%'
ORDER BY routine_name;
```

**預期結果**（3 行）:
```
| routine_name                    | routine_type |
|---------------------------------|--------------|
| get_practice_frequency_by_skill | FUNCTION     |
| get_skill_improvement_curve     | FUNCTION     |
| is_subscription_active          | FUNCTION     |  (現有)
```

**驗證查詢 2**：檢查索引是否已創建
```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'practice_logs'
ORDER BY indexname;
```

**預期結果**（至少 2 個新索引）:
```
| indexname                       | tablename     |
|---------------------------------|---------------|
| idx_practice_logs_created       | practice_logs | (現有)
| idx_practice_logs_lesson        | practice_logs | 🆕
| idx_practice_logs_lesson_id     | practice_logs | (現有)
| idx_practice_logs_user_created  | practice_logs | 🆕
| idx_practice_logs_user_id       | practice_logs | (現有)
```

**驗證查詢 3**：測試函數返回結果
```sql
-- 選擇一個有練習記錄的用戶 UUID
-- 替換 'actual-user-uuid' 為真實用戶
SELECT * FROM get_practice_frequency_by_skill('actual-user-uuid', 30)
LIMIT 5;
```

**預期結果**（示例）:
```
| skill  | practice_count | avg_rating | last_practice_date      |
|--------|----------------|------------|------------------------|
| 用刃   | 15             | 4.3        | 2025-12-30 10:30:00+08 |
| 轉彎   | 12             | 3.8        | 2025-12-30 09:15:00+08 |
| 停止   | 10             | 4.1        | 2025-12-29 14:20:00+08 |
```

- [ ] 所有驗證查詢通過 ✅

### 步驟 2：代碼部署（預計 10 分鐘）

#### 2.1 GitHub 代碼推送（如需要）

```bash
# 檢查本地狀態
git status

# 如有未提交代碼，提交並推送
git add .
git commit -m "feat: Day 30 最終部署準備"
git push origin main
```

- [ ] 代碼已提交或確認無新改動

#### 2.2 Zeabur 自動部署監控

**位置**: https://zeabur.com (或您的部署平台)

**監控項目**:
1. [ ] GitHub Actions CI/CD 開始執行
2. [ ] 構建進度：Compiling → Building → Testing
3. [ ] 預期耗時：5-8 分鐘
4. [ ] 構建完成後自動部署到生產環境
5. [ ] 部署完成信號收到

**部署成功信號**:
```
✅ Build: SUCCESS
✅ Test: PASSED
✅ Deploy: COMPLETED
✅ Live URL: https://diyski.zeabur.app
```

- [ ] 部署完成，無錯誤

### 步驟 3：生產環境驗證（預計 10 分鐘）

#### 3.1 前端功能驗證

**測試帳號準備**:
- [ ] 免費用戶帳號：`user_free@test.com`
- [ ] PRO 用戶帳號：`user_pro@test.com`
- [ ] 管理員帳號：`admin_user@test.com`

#### 3.2 免費用戶測試路徑

```
1. 訪問 https://diyski.zeabur.app/practice
2. 以免費用戶身份登入
3. 驗證儀表板標籤
   ✓ 顯示 LockedDashboardPreview 組件
   ✓ 顯示鎖定遮罩 + 解鎖訊息
   ✓ 訊息包含 4 項功能列表
   ✓ 升級按鈕可點擊 → 導向 /pricing
4. 驗證練習紀錄標籤
   ✓ 顯示練習日誌
   ✓ 功能正常，不受 PRO 限制
```

**驗收標準**:
- [ ] ✅ 免費用戶預覽組件正確顯示
- [ ] ✅ 升級按鈕導向正確
- [ ] ✅ 無錯誤提示

#### 3.3 PRO 用戶測試路徑

```
1. 訪問 https://diyski.zeabur.app/practice
2. 以 PRO 用戶身份登入
3. 驗證儀表板標籤
   ✓ 顯示完整 ImprovementDashboard 組件
   ✓ 顯示練習頻率分析卡片
   ✓ 顯示技能選擇器
   ✓ 顯示技能進步曲線圖
4. 驗證數據正確性
   ✓ 練習頻率按次數排序（降冪）
   ✓ 評分顯示 0-5 範圍內
   ✓ 日期格式正確
5. 驗證交互功能
   ✓ 點擊技能按鈕後曲線圖更新
   ✓ Hover 技能條時進度條發光
   ✓ Hover 柱狀條時 Tooltip 出現
6. 驗證動畫效果
   ✓ 卡片進場動畫流暢
   ✓ 曲線圖柱狀條動畫流暢
   ✓ 無卡頓感（60fps）
```

**驗收標準**:
- [ ] ✅ 儀表板組件完整顯示
- [ ] ✅ 數據加載無誤
- [ ] ✅ 交互流暢無卡頓
- [ ] ✅ 無錯誤或警告

#### 3.4 管理員測試路徑

```
1. 以管理員身份登入
2. 訪問 /admin 面板
3. 驗證沒有新增的管理功能（調整③ 無管理面板修改）
   ✓ 管理功能正常
```

**驗收標準**:
- [ ] ✅ 管理面板無破裂

### 步驟 4：監控驗證（預計 5 分鐘）

#### 4.1 錯誤監控

**Sentry 儀表板**:
- [ ] 無新增的 Critical 錯誤
- [ ] 無大量的 RPC 查詢失敗
- [ ] 前端 JavaScript 錯誤率正常（< 0.5%）

**Supabase 日誌**:
- [ ] SQL 函數執行日誌正常
- [ ] 無 RLS 策略衝突
- [ ] 沒有行鎖定死鎖情況

#### 4.2 性能監控

**性能指標**:
- [ ] RPC 查詢平均響應時間：< 500ms
- [ ] 頁面加載時間：< 2s
- [ ] 動畫幀率：> 50fps

- [ ] ✅ 所有監控指標正常

---

## 🎉 上線成功確認（Day 30 12:00 PM）

### 正式上線條件檢查

- [ ] ✅ SQL 遷移成功執行
- [ ] ✅ 代碼部署成功
- [ ] ✅ 免費用戶路徑驗證通過
- [ ] ✅ PRO 用戶路徑驗證通過
- [ ] ✅ 管理員面板驗證通過
- [ ] ✅ 監控指標正常
- [ ] ✅ 無 Critical 錯誤

### 用戶公告發佈（Day 30 12:00 PM）

**公告內容**（中文）:
```
📣 練習中心升級通知

親愛的單板滑雪愛好者：

我們很高興地宣佈，練習中心正式升級！

🆕 新增功能（PRO 專屬）：
• 練習頻率分析 - 看出您最常練習的技能
• 技能進步曲線圖 - 視覺化 30 天進度
• 個人化統計 - 平均評分、練習次數統計

📊 立即體驗：
進入「練習中心」→「改善儀表板」

這些功能完全包含在您的 PRO 訂閱中，無需額外費用！

如有問題，歡迎透過「回饋」頁面聯繫我們。

祝您練習愉快！
🏂 單板教學團隊
```

**發佈管道**:
- [ ] 📧 Email 通知已發送（PRO 用戶）
- [ ] 🔔 App 推送通知已發送（if available）
- [ ] 📱 社交媒體已更新（Facebook/Instagram/等）
- [ ] 📝 官方博客已發布（if available）

---

## 📊 Day 30-37 監控計畫

### Day 30 監控（上線當天）

- [ ] **每小時檢查**：
  - 錯誤率
  - 用戶反饋
  - 服務可用性

- [ ] **用戶反饋監控**：
  - 新增功能滿意度
  - Bug 報告
  - 功能請求

### Day 31-37 監控（上線後 7 天）

- [ ] **每日摘要**：
  - DAU（練習中心）
  - 儀表板訪問率
  - 技能曲線圖查看率
  - 平均評分分佈

- [ ] **性能基準對比**：
  - 上線前 vs 上線後加載時間
  - 錯誤率變化
  - 用戶留存率

---

## ❌ 回滾計畫（如需緊急回滾）

### 回滾觸發條件

以下任一情況應立即考慮回滾：
- [ ] 5 分鐘內 Critical 錯誤 > 10
- [ ] RPC 查詢失敗率 > 10%
- [ ] 頁面完全不可用（無法加載）
- [ ] 大量用戶投訴（> 100 條/分鐘）

### 回滾步驟（預計 10-15 分鐘）

#### 回滾 Step 1：代碼回滾

```bash
# 本地操作
git revert fcb0a56
git push origin main

# Zeabur 自動部署（監控部署進度）
# 預計 5 分鐘完成
```

- [ ] 代碼已回滾
- [ ] Zeabur 部署已完成
- [ ] 舊版本已上線

#### 回滾 Step 2：SQL 回滾（如需要）

**位置**: Supabase SQL Editor

```sql
-- 刪除新增的函數
DROP FUNCTION IF EXISTS get_practice_frequency_by_skill(UUID, INT);
DROP FUNCTION IF EXISTS get_skill_improvement_curve(UUID, TEXT, INT);

-- 刪除新增的索引
DROP INDEX IF EXISTS idx_practice_logs_user_created;
DROP INDEX IF EXISTS idx_practice_logs_lesson;
```

- [ ] SQL 已回滾
- [ ] 驗證函數已刪除

#### 回滾 Step 3：驗證

```
✓ 訪問 /practice - 無錯誤
✓ 免費用戶 - 鎖定狀態正常
✓ PRO 用戶 - 舊儀表板顯示
✓ 監控 - 錯誤率恢復正常
```

- [ ] ✅ 回滾驗證通過

### 回滾後溝通

- [ ] 發送用戶公告（解釋回滾原因）
- [ ] 內部總結會議（root cause analysis）
- [ ] 準備修復計畫（for 次日重新上線）

---

## 📞 應急聯繫清單

| 角色 | 名字 | 電話 | 郵件 | 備註 |
|------|------|------|------|------|
| 技術負責人 | [待填] | [待填] | [待填] | 回滾決定權 |
| 開發人員 | Claude Code | - | - | 代碼支持 |
| Supabase 帳戶管理員 | [待填] | [待填] | [待填] | DB 操作權限 |
| Zeabur 部署管理員 | [待填] | [待填] | [待填] | 部署操作權限 |
| 產品經理 | [待填] | [待填] | [待填] | 公告審核 |
| 客服負責人 | [待填] | [待填] | [待填] | 用戶通知 |

---

## ✍️ 簽核與批准

| 檢查項 | 負責人 | 簽名 | 日期 | 狀態 |
|--------|--------|------|------|------|
| 代碼層準備 | Claude Code | ✅ | 2025-12-08 | ✅ |
| 數據庫層準備 | [待定] | [ ] | [待定] | ⏳ |
| 監控層準備 | [待定] | [ ] | [待定] | ⏳ |
| 備份與回滾 | [待定] | [ ] | [待定] | ⏳ |
| 安全與隱私 | [待定] | [ ] | [待定] | ⏳ |
| 整體上線批准 | [待定] | [ ] | [待定] | ⏳ |

---

**文檔版本**: v1.0
**最後更新**: 2025-12-08
**計畫上線日期**: 2025-12-30 12:00 UTC+8
**預計上線耗時**: 30 分鐘
