const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nbstwggxfwvfruwgfcqd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDQzNTAsImV4cCI6MjA3OTcyMDM1MH0.El_8nfyiJ7ORf0I21Kb1GhBAHk6k8F-ux4rYLhZo0kY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRedeem() {
  try {
    // 1. 登入獲取 token
    console.log('正在登入...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'bpfunhouse@gmail.com',
      password: '5232523'
    })

    if (authError) {
      console.error('登入失敗:', authError.message)
      return
    }

    const token = authData.session?.access_token
    if (!token) {
      console.error('無法取得 access token')
      return
    }

    console.log('✅ 登入成功，token 長度:', token.length)

    // 2. 測試 coupon redeem API
    console.log('\n正在測試折扣碼兌換...')
    
    const response = await fetch('https://www.snowskill.app/api/coupons/redeem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ code: 'TESTCODE' }),
    })

    console.log('HTTP Status:', response.status)
    
    const result = await response.json()
    console.log('API Response:', JSON.stringify(result, null, 2))

    if (!response.ok) {
      console.error('❌ API 調用失敗')
    } else {
      console.log('✅ API 調用成功')
    }

  } catch (err) {
    console.error('測試過程發生錯誤:', err.message)
  }
}

testRedeem()
