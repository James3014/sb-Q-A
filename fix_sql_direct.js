#!/usr/bin/env node

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY';

// 修復的 SQL - 移除 FOR UPDATE 在 outer join 上的問題
const fixedSQL = `
CREATE OR REPLACE FUNCTION public.redeem_trial_coupon(
  p_user_id uuid,
  p_coupon_code text,
  p_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS TABLE (
  plan_id text,
  plan_label text,
  expires_at timestamptz,
  trial_source text,
  trial_activated_at timestamptz
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_code text := upper(trim(p_coupon_code));
  v_coupon record;
  v_user record;
  v_now timestamptz := now();
  v_days integer := 7;
  v_trial_source text;
  v_expires_at timestamptz;
BEGIN
  IF v_code IS NULL OR length(v_code) < 3 THEN
    RAISE EXCEPTION 'invalid_coupon_code';
  END IF;

  -- 修復：分開查詢，避免 FOR UPDATE 在 outer join 上
  SELECT * INTO v_coupon FROM public.coupons c 
  WHERE c.code = v_code AND c.is_active FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'coupon_not_found';
  END IF;

  -- 檢查時間限制
  IF v_coupon.valid_from > v_now THEN
    RAISE EXCEPTION 'coupon_not_started';
  END IF;
  
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < v_now THEN
    RAISE EXCEPTION 'coupon_expired';
  END IF;
  
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RAISE EXCEPTION 'coupon_limit_reached';
  END IF;

  -- 檢查用戶
  SELECT * INTO v_user FROM public.users WHERE id = p_user_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  IF coalesce(v_user.trial_used, false) THEN
    RAISE EXCEPTION 'trial_already_used';
  END IF;

  -- 檢查是否已使用此折扣碼
  IF EXISTS (
    SELECT 1 FROM public.coupon_usages 
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'coupon_already_used';
  END IF;

  -- 計算試用參數
  v_days := 7; -- 預設 7 天
  v_trial_source := coalesce(v_coupon.partner_name, v_code);
  v_expires_at := v_now + make_interval(days => v_days);

  -- 更新用戶訂閱
  UPDATE public.users
     SET subscription_type = v_coupon.plan_id,
         subscription_expires_at = v_expires_at,
         trial_used = true,
         trial_source = v_trial_source,
         trial_activated_at = v_now
   WHERE id = p_user_id;

  -- 記錄使用
  INSERT INTO public.coupon_usages (coupon_id, user_id, redeemed_at, ip_address, user_agent)
  VALUES (v_coupon.id, p_user_id, v_now, p_ip, p_user_agent);

  -- 更新折扣碼使用次數
  UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;

  -- 返回結果
  RETURN QUERY
  SELECT
    v_coupon.plan_id,
    coalesce(v_coupon.plan_label, v_coupon.plan_id),
    v_expires_at,
    v_trial_source,
    v_now;
END;
$$;
`;

console.log('🔧 正在修復 SQL 函數...');
console.log('請在 Supabase SQL Editor 中執行以下 SQL:');
console.log('=====================================');
console.log(fixedSQL);
console.log('=====================================');
console.log('✅ 修復完成後，折扣碼 API 應該可以正常運作');
