const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nbstwggxfwvfruwgfcqd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDQzNTAsImV4cCI6MjA3OTcyMDM1MH0.El_8nfyiJ7ORf0I21Kb1GhBAHk6k8F-ux4rYLhZo0kY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testImprovedErrors() {
  try {
    // 1. 登入
    console.log('登入測試帳號...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'bpfunhouse@gmail.com',
      password: '5232523'
    })

    if (authError) {
      console.error('登入失敗:', authError.message)
      return
    }

    const token = authData.session?.access_token
    console.log('✅ 登入成功')

    // 2. 測試無效 plan_id 的錯誤訊息
    console.log('\n測試無效 plan_id 錯誤訊息...')
    
    const response = await fetch('https://www.snowskill.app/api/coupons/redeem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ code: 'ERRORTEST' }),
    })

    const result = await response.json()
    
    console.log('HTTP Status:', response.status)
    console.log('錯誤訊息:', result.error)
    
    if (result.error?.includes('折扣碼方案') || result.error?.includes('資料驗證失敗')) {
      console.log('✅ 錯誤訊息已改善，提供具體資訊')
    } else {
      console.log('❌ 錯誤訊息仍需改善')
    }

  } catch (err) {
    console.error('測試失敗:', err.message)
  }
}

testImprovedErrors()
