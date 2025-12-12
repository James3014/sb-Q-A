#!/usr/bin/env node

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY';

async function createTestCodeCoupon() {
  console.log('🎫 創建 TESTCODE 折扣碼...');
  
  const coupon = {
    code: 'TESTCODE',
    type: 'free_trial',
    plan_id: 'trial_7d',
    plan_label: '7天免費試用',
    max_uses: 100,
    used_count: 0,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    partner_name: 'Test Partner',
    is_active: true
  };

  try {
    const response = await fetch('https://nbstwggxfwvfruwgfcqd.supabase.co/rest/v1/coupons', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(coupon)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ TESTCODE 折扣碼創建成功:', result[0]?.code);
      console.log('📅 有效期至:', new Date(result[0]?.valid_until).toLocaleDateString());
      console.log('🔗 測試連結: https://www.snowskill.app/pricing?coupon=TESTCODE');
    } else if (response.status === 409) {
      console.log('✅ TESTCODE 折扣碼已存在');
    } else {
      const error = await response.text();
      console.log('❌ 創建失敗:', error);
    }
  } catch (error) {
    console.log('❌ 錯誤:', error.message);
  }
}

createTestCodeCoupon();
