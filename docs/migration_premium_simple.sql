-- 簡單付費牆遷移腳本
-- 前 28 堂課程：免費版
-- 後 154 堂課程：PRO 版
-- 執行時間：2025-12-08
-- 作者：Claude Code

-- ========================================
-- 備份原始數據（安全起見）
-- ========================================
-- SELECT * FROM lessons INTO lessons_backup;
-- 或手動在 Supabase Dashboard 複製 lessons 表

-- ========================================
-- 1️⃣ 標記免費課程（前 28 堂）
-- ========================================
UPDATE lessons
SET is_premium = false
WHERE CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER) <= 28;

-- ========================================
-- 2️⃣ 標記 PRO 課程（後 154 堂）
-- ========================================
UPDATE lessons
SET is_premium = true
WHERE CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER) > 28;

-- ========================================
-- 3️⃣ 驗證結果
-- ========================================
SELECT
  is_premium,
  COUNT(*) as count
FROM lessons
GROUP BY is_premium
ORDER BY is_premium;

-- 預期結果：
-- is_premium | count
-- -----------|-------
-- f          |   28
-- t          |  154

-- ========================================
-- 4️⃣ 驗證課程 ID 分佈（可選）
-- ========================================
-- SELECT
--   CASE
--     WHEN CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER) <= 28 THEN '免費課程'
--     ELSE 'PRO 課程'
--   END as category,
--   COUNT(*) as count,
--   MIN(id) as first_id,
--   MAX(id) as last_id
-- FROM lessons
-- GROUP BY category
-- ORDER BY category;

-- ========================================
-- 5️⃣ 驗證 RLS 策略是否生效（可選）
-- ========================================
-- 確保以下 RLS 策略已啟用：
-- - lessons_free: 允許所有人查看免費課程
-- - lessons_premium_active_or_admin: 只允許 PRO 用戶或管理員查看付費課程

-- ========================================
-- ✅ 遷移完成
-- ========================================
-- 執行此腳本後，課程付費牆將激活：
-- - 免費用戶：只能查看 28 堂初級課程
-- - PRO 用戶：可查看全部 182 堂課程
