-- 清理測試用戶和測試合作方數據
-- 請在 Supabase SQL Editor 中執行

-- 查看要刪除的測試用戶
SELECT 
  'users' as table_name,
  id, 
  email, 
  created_at,
  trial_used,
  subscription_type
FROM users 
WHERE email LIKE '%@test.com' 
   OR email LIKE '%@example.com'
ORDER BY created_at DESC;

-- 查看要刪除的測試合作方
SELECT 
  'affiliate_partners' as table_name,
  id,
  partner_name,
  contact_email,
  coupon_code,
  created_at
FROM affiliate_partners 
WHERE contact_email LIKE '%@test.com' 
   OR contact_email LIKE '%@example.com'
ORDER BY created_at DESC;

-- 清理測試數據
DO $$
DECLARE
  test_user_ids UUID[];
  test_affiliate_ids UUID[];
  deleted_count INTEGER;
BEGIN
  -- 獲取所有測試用戶 ID
  SELECT ARRAY(
    SELECT id FROM users 
    WHERE email LIKE '%@test.com' 
       OR email LIKE '%@example.com'
  ) INTO test_user_ids;

  -- 獲取所有測試合作方 ID
  SELECT ARRAY(
    SELECT id FROM affiliate_partners 
    WHERE contact_email LIKE '%@test.com' 
       OR contact_email LIKE '%@example.com'
  ) INTO test_affiliate_ids;

  RAISE NOTICE '找到 % 個測試用戶', COALESCE(array_length(test_user_ids, 1), 0);
  RAISE NOTICE '找到 % 個測試合作方', COALESCE(array_length(test_affiliate_ids, 1), 0);

  -- === 清理合作方相關數據 ===
  
  -- 1. 刪除測試合作方的分潤記錄
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'affiliate_commissions') THEN
    DELETE FROM affiliate_commissions WHERE partner_id = ANY(test_affiliate_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ 已刪除 % 條測試合作方分潤記錄', deleted_count;
  END IF;

  -- 2. 刪除測試合作方的點擊記錄
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'affiliate_clicks') THEN
    DELETE FROM affiliate_clicks WHERE affiliate_id = ANY(test_affiliate_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ 已刪除 % 條測試合作方點擊記錄', deleted_count;
  END IF;

  -- 3. 刪除測試合作方
  DELETE FROM affiliate_partners 
  WHERE contact_email LIKE '%@test.com' 
     OR contact_email LIKE '%@example.com';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE '✅ 已刪除 % 個測試合作方', deleted_count;

  -- === 清理用戶相關數據 ===

  -- 4. 刪除練習記錄
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'practice_logs') THEN
    DELETE FROM practice_logs WHERE user_id = ANY(test_user_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ 已刪除 % 條練習記錄', deleted_count;
  END IF;

  -- 5. 刪除收藏記錄
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'favorites') THEN
    DELETE FROM favorites WHERE user_id = ANY(test_user_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ 已刪除 % 條收藏記錄', deleted_count;
  END IF;

  -- 6. 刪除事件日誌
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_log') THEN
    DELETE FROM event_log WHERE user_id = ANY(test_user_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ 已刪除 % 條事件日誌', deleted_count;
  END IF;

  -- 7. 刪除意見回報
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feedback') THEN
    DELETE FROM feedback WHERE user_id = ANY(test_user_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ 已刪除 % 條意見回報', deleted_count;
  END IF;

  -- 8. 刪除支付記錄
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
    DELETE FROM payments WHERE user_id = ANY(test_user_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ 已刪除 % 條支付記錄', deleted_count;
  END IF;

  -- 9. 刪除折扣碼使用記錄
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coupon_usages') THEN
    DELETE FROM coupon_usages WHERE user_id = ANY(test_user_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ 已刪除 % 條折扣碼使用記錄', deleted_count;
  END IF;

  -- 10. 清理剩餘點擊記錄中的用戶關聯
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'affiliate_clicks') THEN
    UPDATE affiliate_clicks SET user_id = NULL WHERE user_id = ANY(test_user_ids);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE '✅ 已清理 % 條點擊記錄的用戶關聯', deleted_count;
  END IF;

  -- 11. 最後刪除測試用戶
  DELETE FROM users 
  WHERE email LIKE '%@test.com' 
     OR email LIKE '%@example.com';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE '✅ 已刪除 % 個測試用戶', deleted_count;

END $$;

-- 確認清理結果
SELECT 
  '測試用戶剩餘數量' as description,
  COUNT(*) as count
FROM users 
WHERE email LIKE '%@test.com' 
   OR email LIKE '%@example.com'
UNION ALL
SELECT 
  '測試合作方剩餘數量' as description,
  COUNT(*) as count
FROM affiliate_partners 
WHERE contact_email LIKE '%@test.com' 
   OR contact_email LIKE '%@example.com';
