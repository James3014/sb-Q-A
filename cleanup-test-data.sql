-- 清理測試合作方數據
-- 請在 Supabase SQL Editor 中執行

-- 1. 清理點擊記錄
DELETE FROM affiliate_clicks;

-- 2. 清理分潤記錄  
DELETE FROM affiliate_commissions;

-- 3. 清理合作方
DELETE FROM affiliate_partners;

-- 4. 重置用戶試用來源
UPDATE users 
SET trial_coupon_code = NULL, trial_source = NULL 
WHERE trial_coupon_code IS NOT NULL;

-- 5. 清理相關事件日誌（可選）
DELETE FROM event_log 
WHERE event_type IN ('referral_click', 'trial_activated') 
AND metadata->>'referral_code' IS NOT NULL;

-- 查看清理結果
SELECT 'affiliate_partners' as table_name, COUNT(*) as remaining_records FROM affiliate_partners
UNION ALL
SELECT 'affiliate_commissions', COUNT(*) FROM affiliate_commissions  
UNION ALL
SELECT 'affiliate_clicks', COUNT(*) FROM affiliate_clicks
UNION ALL
SELECT 'users_with_trial_source', COUNT(*) FROM users WHERE trial_coupon_code IS NOT NULL;
