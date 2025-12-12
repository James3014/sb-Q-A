#!/usr/bin/env node

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY';
const SUPABASE_URL = 'https://nbstwggxfwvfruwgfcqd.supabase.co';

async function fixCouponFunction() {
  const fixSQL = `
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
  SELECT c.*, sp.days as plan_days, coalesce(c.plan_label, sp.label) as resolved_label
    INTO v_coupon
  FROM public.coupons c
  LEFT JOIN public.subscription_plans sp ON sp.id = c.plan_id
  WHERE c.code = v_code AND c.is_active;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'coupon_not_found';
  END IF;

  SELECT u.* INTO v_user FROM public.users u WHERE u.id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  v_days := coalesce(v_coupon.plan_days, 7);
  v_trial_source := coalesce(v_coupon.partner_name, v_code);
  v_expires_at := v_now + make_interval(days => v_days);

  RETURN QUERY
  SELECT
    v_coupon.plan_id,
    v_coupon.resolved_label,
    v_expires_at,
    v_trial_source,
    v_now;
END;
$$;`;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({ query: fixSQL })
    });

    if (response.ok) {
      console.log('✅ 折扣碼函數修復成功');
    } else {
      console.log('❌ 修復失敗:', await response.text());
    }
  } catch (error) {
    console.log('❌ 連線錯誤:', error.message);
  }
}

fixCouponFunction();
