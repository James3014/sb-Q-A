#!/usr/bin/env node

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY';

async function executeFix() {
  console.log('🔧 正在直接修復 SQL 函數...');
  
  // 使用 pg_stat_statements 或直接執行 SQL
  const response = await fetch('https://nbstwggxfwvfruwgfcqd.supabase.co/rest/v1/rpc/exec', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      sql: `
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
  SELECT * INTO v_coupon FROM public.coupons 
  WHERE code = v_code AND is_active FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'coupon_not_found';
  END IF;

  SELECT * INTO v_user FROM public.users WHERE id = p_user_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  v_trial_source := coalesce(v_coupon.partner_name, v_code);
  v_expires_at := v_now + make_interval(days => v_days);

  UPDATE public.users
     SET subscription_type = v_coupon.plan_id,
         subscription_expires_at = v_expires_at,
         trial_used = true,
         trial_source = v_trial_source,
         trial_activated_at = v_now
   WHERE id = p_user_id;

  INSERT INTO public.coupon_usages (coupon_id, user_id, redeemed_at, ip_address, user_agent)
  VALUES (v_coupon.id, p_user_id, v_now, p_ip, p_user_agent);

  UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;

  RETURN QUERY
  SELECT
    v_coupon.plan_id,
    coalesce(v_coupon.plan_label, v_coupon.plan_id),
    v_expires_at,
    v_trial_source,
    v_now;
END;
$$;`
    })
  });

  if (response.ok) {
    console.log('✅ SQL 函數修復成功！');
    
    // 創建測試折扣碼
    const testResponse = await fetch('https://nbstwggxfwvfruwgfcqd.supabase.co/rest/v1/coupons', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        code: 'TEST2025',
        plan_id: 'trial_7d',
        plan_label: '7天免費試用',
        max_uses: 100,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      })
    });
    
    if (testResponse.ok || testResponse.status === 409) {
      console.log('✅ 測試折扣碼已準備好');
    }
    
    console.log('🎉 修復完成！現在可以測試 /api/coupons/redeem');
  } else {
    const error = await response.text();
    console.log('❌ 修復失敗:', error);
  }
}

executeFix().catch(console.error);
