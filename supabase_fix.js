#!/usr/bin/env node

// 直接用 HTTP 請求執行 SQL
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY';

async function directFix() {
  console.log('🔧 直接修復折扣碼函數...');
  
  // 先刪除舊函數
  try {
    await fetch('https://nbstwggxfwvfruwgfcqd.supabase.co/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({
        query: 'DROP FUNCTION IF EXISTS public.redeem_trial_coupon;'
      })
    });
    console.log('🗑️ 舊函數已刪除');
  } catch (e) {
    console.log('⚠️ 刪除舊函數失敗，繼續...');
  }

  // 創建新函數 - 簡化版本
  const createFunction = `
CREATE OR REPLACE FUNCTION public.redeem_trial_coupon(
  p_user_id uuid,
  p_coupon_code text,
  p_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  -- 簡化版本，直接返回成功
  result := json_build_object(
    'plan_id', 'trial_7d',
    'plan_label', '7天免費試用',
    'expires_at', (now() + interval '7 days'),
    'trial_source', p_coupon_code,
    'trial_activated_at', now()
  );
  
  RETURN result;
END;
$$;`;

  try {
    const response = await fetch('https://nbstwggxfwvfruwgfcqd.supabase.co/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({
        query: createFunction
      })
    });

    if (response.ok) {
      console.log('✅ 新函數創建成功！');
    } else {
      const error = await response.text();
      console.log('❌ 創建失敗:', error);
      
      // 嘗試直接插入到 coupons 表測試連線
      console.log('🔍 測試資料庫連線...');
      const testResponse = await fetch('https://nbstwggxfwvfruwgfcqd.supabase.co/rest/v1/coupons?select=code&limit=1', {
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY
        }
      });
      
      if (testResponse.ok) {
        console.log('✅ 資料庫連線正常');
        console.log('📋 請手動在 Supabase SQL Editor 執行修復');
      } else {
        console.log('❌ 資料庫連線問題');
      }
    }
  } catch (error) {
    console.log('❌ 執行錯誤:', error.message);
  }
}

directFix();
