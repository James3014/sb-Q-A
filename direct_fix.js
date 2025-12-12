#!/usr/bin/env node

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY';
const SUPABASE_URL = 'https://nbstwggxfwvfruwgfcqd.supabase.co';

async function checkAndFix() {
  console.log('🔍 檢查資料庫連線...');
  
  // 1. 檢查連線
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY
      }
    });
    
    if (response.ok) {
      console.log('✅ 資料庫連線成功');
    } else {
      console.log('❌ 連線失敗:', response.status);
      return;
    }
  } catch (error) {
    console.log('❌ 連線錯誤:', error.message);
    return;
  }

  // 2. 檢查現有函數
  console.log('🔍 檢查現有函數...');
  try {
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/redeem_trial_coupon`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY
      },
      body: JSON.stringify({
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_coupon_code: 'TEST'
      })
    });
    
    const result = await checkResponse.text();
    console.log('函數測試結果:', result);
    
  } catch (error) {
    console.log('函數測試錯誤:', error.message);
  }

  // 3. 檢查表格
  console.log('🔍 檢查必要表格...');
  const tables = ['coupons', 'users', 'subscription_plans'];
  
  for (const table of tables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
        headers: {
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'apikey': SERVICE_KEY
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${table} 表格存在`);
      } else {
        console.log(`❌ ${table} 表格問題:`, response.status);
      }
    } catch (error) {
      console.log(`❌ ${table} 檢查錯誤:`, error.message);
    }
  }

  console.log('\n📋 修復建議:');
  console.log('1. 在 Supabase Dashboard > SQL Editor 中執行 fix_coupon_function.sql');
  console.log('2. 或者直接複製貼上修復的 SQL 函數');
  console.log('3. 檢查 RLS 政策是否阻擋函數執行');
}

checkAndFix();
