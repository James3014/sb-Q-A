const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nbstwggxfwvfruwgfcqd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testErrorHandling() {
  try {
    // 1. 創建一個有問題的測試折扣碼
    console.log('創建測試折扣碼 ERRORTEST...')
    
    const { error: insertError } = await supabase
      .from('coupons')
      .insert({
        code: 'ERRORTEST',
        plan_id: 'invalid_plan',  // 無效的 plan_id
        plan_label: '錯誤測試',
        is_active: true,
        valid_until: '2025-12-31T23:59:59+00:00'
      })

    if (insertError && !insertError.message.includes('duplicate key')) {
      console.error('創建測試折扣碼失敗:', insertError.message)
      return
    }

    console.log('✅ 測試折扣碼已創建')

    // 2. 重置用戶狀態以便重新測試
    console.log('\n重置用戶狀態...')
    
    await supabase
      .from('users')
      .update({
        trial_used: false,
        subscription_type: 'free',
        subscription_expires_at: null
      })
      .eq('email', 'bpfunhouse@gmail.com')

    // 刪除之前的使用記錄
    await supabase
      .from('coupon_usages')
      .delete()
      .eq('user_id', '9475b55a-07ee-437d-bc7c-0dff6a6578bb')

    console.log('✅ 用戶狀態已重置')

    console.log('\n測試完成，現在可以在本地測試改善的錯誤訊息')

  } catch (err) {
    console.error('測試準備失敗:', err.message)
  }
}

testErrorHandling()
