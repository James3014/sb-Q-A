const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nbstwggxfwvfruwgfcqd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUser() {
  try {
    // 檢查用戶資料（不使用 single()）
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, trial_used, subscription_type, subscription_expires_at, created_at')
      .eq('email', 'bpfunhouse@gmail.com')

    if (error) {
      console.log('用戶查詢錯誤:', error.message)
      return
    }

    if (!users || users.length === 0) {
      console.log('找不到用戶: bpfunhouse@gmail.com')
      console.log('可能需要先註冊帳號')
      return
    }

    console.log(`找到 ${users.length} 個用戶記錄:`)
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      console.log(`\n用戶 ${i + 1}:`)
      console.log('- Email:', user.email)
      console.log('- ID:', user.id)
      console.log('- 已使用試用:', user.trial_used)
      console.log('- 訂閱類型:', user.subscription_type)
      console.log('- 訂閱到期:', user.subscription_expires_at)
      console.log('- 註冊時間:', user.created_at)

      // 檢查是否有有效訂閱
      if (user.subscription_expires_at) {
        const expiresAt = new Date(user.subscription_expires_at)
        const now = new Date()
        console.log('- 訂閱狀態:', expiresAt > now ? '有效' : '已過期')
        console.log('- 距離到期:', Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)), '天')
      }

      // 檢查折扣碼使用記錄
      const { data: usages } = await supabase
        .from('coupon_usages')
        .select('coupon_id, redeemed_at, coupons(code)')
        .eq('user_id', user.id)

      if (usages && usages.length > 0) {
        console.log('已使用的折扣碼:')
        usages.forEach(usage => {
          console.log(`  - ${usage.coupons?.code} (${usage.redeemed_at})`)
        })
      } else {
        console.log('未使用過任何折扣碼')
      }
    }

    // 檢查 TESTCODE 折扣碼狀態
    console.log('\n=== TESTCODE 折扣碼狀態 ===')
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', 'TESTCODE')
      .single()

    if (coupon) {
      console.log('- 折扣碼:', coupon.code)
      console.log('- 是否啟用:', coupon.is_active)
      console.log('- 方案:', coupon.plan_id)
      console.log('- 方案名稱:', coupon.plan_label)
      console.log('- 使用次數:', coupon.used_count)
      console.log('- 最大使用次數:', coupon.max_uses)
      console.log('- 有效期限:', coupon.valid_until)
    } else {
      console.log('找不到 TESTCODE 折扣碼')
    }

  } catch (err) {
    console.error('檢查失敗:', err.message)
  }
}

checkUser()
