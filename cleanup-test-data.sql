-- 清理測試合作方數據
-- 請在 Supabase SQL Editor 中執行

-- 先檢查並創建必要的表格（如果不存在）
-- 1. 創建 affiliate_clicks 表（如果不存在）
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID,
  coupon_code TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_ip INET,
  user_agent TEXT,
  referrer TEXT,
  user_id UUID,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 清理數據（安全模式 - 檢查表是否存在）
DO $$
BEGIN
  -- 清理點擊記錄
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'affiliate_clicks') THEN
    DELETE FROM affiliate_clicks;
    RAISE NOTICE '✅ 已清理 affiliate_clicks 表';
  END IF;

  -- 清理分潤記錄  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'affiliate_commissions') THEN
    DELETE FROM affiliate_commissions;
    RAISE NOTICE '✅ 已清理 affiliate_commissions 表';
  END IF;

  -- 清理合作方
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'affiliate_partners') THEN
    DELETE FROM affiliate_partners;
    RAISE NOTICE '✅ 已清理 affiliate_partners 表';
  END IF;

  -- 重置用戶試用來源
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    UPDATE users 
    SET trial_coupon_code = NULL, trial_source = NULL 
    WHERE trial_coupon_code IS NOT NULL;
    RAISE NOTICE '✅ 已重置用戶試用來源';
  END IF;

  -- 清理相關事件日誌
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_log') THEN
    DELETE FROM event_log 
    WHERE event_type IN ('referral_click', 'trial_activated') 
    AND metadata->>'referral_code' IS NOT NULL;
    RAISE NOTICE '✅ 已清理推廣相關事件日誌';
  END IF;

END $$;

-- 查看清理結果
SELECT 
  'affiliate_partners' as table_name, 
  COALESCE((SELECT COUNT(*) FROM affiliate_partners), 0) as remaining_records
UNION ALL
SELECT 
  'affiliate_commissions', 
  COALESCE((SELECT COUNT(*) FROM affiliate_commissions), 0)
UNION ALL
SELECT 
  'affiliate_clicks', 
  COALESCE((SELECT COUNT(*) FROM affiliate_clicks), 0)
UNION ALL
SELECT 
  'users_with_trial_source', 
  COALESCE((SELECT COUNT(*) FROM users WHERE trial_coupon_code IS NOT NULL), 0);
