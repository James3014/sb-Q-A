const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nbstwggxfwvfruwgfcqd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function syncUser() {
  try {
    const email = 'bpfunhouseaa@gmail.com'
    
    // 1. 檢查 auth.users 中是否存在
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('無法查詢 auth users:', authError.message)
      return
    }
    
    const authUser = authUsers.users.find(u => u.email === email)
    
    if (!authUser) {
      console.log(`Auth 中找不到用戶: ${email}`)
      console.log('需要先在網站上註冊帳號')
      return
    }
    
    console.log('Auth 用戶資料:')
    console.log('- ID:', authUser.id)
    console.log('- Email:', authUser.email)
    console.log('- 建立時間:', authUser.created_at)
    console.log('- 確認時間:', authUser.email_confirmed_at)
    
    // 2. 檢查 users 表中是否存在
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (dbUser) {
      console.log('\nusers 表中已存在該用戶')
      return
    }
    
    // 3. 創建 users 表記錄
    console.log('\n正在同步用戶到 users 表...')
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email,
        trial_used: false,
        subscription_type: null,
        subscription_expires_at: null,
        created_at: authUser.created_at
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('同步失敗:', insertError.message)
      return
    }
    
    console.log('✅ 用戶同步成功!')
    console.log('現在可以使用折扣碼了')
    
  } catch (err) {
    console.error('同步過程發生錯誤:', err.message)
  }
}

syncUser()
