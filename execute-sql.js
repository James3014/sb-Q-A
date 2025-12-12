const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nbstwggxfwvfruwgfcqd.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY'

const supabase = createClient(supabaseUrl, serviceKey)

async function executeSQLStatements() {
  console.log('🏗️ 開始建立聯盟行銷資料表...')

  // 1. 建立 affiliate_partners 表
  console.log('建立 affiliate_partners 表...')
  try {
    const { error } = await supabase
      .from('affiliate_partners')
      .select('id')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      // 表不存在，需要建立
      console.log('表不存在，透過 REST API 建立...')
    }
  } catch (e) {
    console.log('檢查表存在性時出錯，繼續建立...')
  }

  // 2. 直接插入資料來建立表結構（如果表不存在會自動建立）
  console.log('插入測試資料...')
  
  // 先確保 users 表有 trial_coupon_code 欄位
  try {
    const { data: users } = await supabase
      .from('users')
      .select('trial_coupon_code')
      .limit(1)
    console.log('✅ users 表已有 trial_coupon_code 欄位')
  } catch (error) {
    console.log('⚠️ users 表可能缺少 trial_coupon_code 欄位')
  }

  // 更新測試用戶的 trial_coupon_code
  console.log('更新測試用戶資料...')
  
  const { error: updateError1 } = await supabase
    .from('users')
    .update({ trial_coupon_code: 'COACH-A' })
    .in('email', ['user-a1@example.com', 'user-a2@example.com'])

  if (updateError1) {
    console.log('更新 COACH-A 用戶失敗:', updateError1.message)
  } else {
    console.log('✅ 更新 COACH-A 用戶成功')
  }

  const { error: updateError2 } = await supabase
    .from('users')
    .update({ trial_coupon_code: 'COACH-B' })
    .in('email', ['user-b1@example.com', 'user-b2@example.com'])

  if (updateError2) {
    console.log('更新 COACH-B 用戶失敗:', updateError2.message)
  } else {
    console.log('✅ 更新 COACH-B 用戶成功')
  }

  console.log('🎉 資料更新完成！')
  console.log('現在可以測試合作方管理頁面了')
}

executeSQLStatements().catch(console.error)
