const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nbstwggxfwvfruwgfcqd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixTestCode() {
  try {
    console.log('修復 TESTCODE 折扣碼的 plan_id...')
    
    // 更新 TESTCODE 的 plan_id 為有效值
    const { data, error } = await supabase
      .from('coupons')
      .update({
        plan_id: 'pass_7'  // 改為 7 天方案
      })
      .eq('code', 'TESTCODE')
      .select()

    if (error) {
      console.error('更新失敗:', error.message)
      return
    }

    console.log('✅ TESTCODE 已更新:')
    console.log('- 新的 plan_id:', data[0]?.plan_id)
    console.log('- plan_label:', data[0]?.plan_label)

    // 驗證更新結果
    const { data: updated } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', 'TESTCODE')
      .single()

    console.log('\n驗證結果:')
    console.log('- code:', updated.code)
    console.log('- plan_id:', updated.plan_id)
    console.log('- plan_label:', updated.plan_label)
    console.log('- is_active:', updated.is_active)

  } catch (err) {
    console.error('修復失敗:', err.message)
  }
}

fixTestCode()
