-- 標記免費課程（前 28 堂）
UPDATE lessons
SET is_premium = false
WHERE CAST(SUBSTRING(id FROM '[0-9]+') AS INTEGER) <= 28;

-- 標記 PRO 課程（後 154 堂）
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
