const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nbstwggxfwvfruwgfcqd.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY'

const supabase = createClient(supabaseUrl, serviceKey)

async function createPartnersData() {
  console.log('🏗️ 建立合作方資料...')

  // 建立測試合作方資料（這會自動建立表）
  const partnersData = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      partner_name: '滑雪教練 A',
      contact_email: 'coach-a@example.com',
      coupon_code: 'COACH-A',
      commission_rate: 0.15,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      partner_name: '滑雪教練 B',
      contact_email: 'coach-b@example.com',
      coupon_code: 'COACH-B',
      commission_rate: 0.20,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const { data, error } = await supabase
    .from('affiliate_partners')
    .upsert(partnersData, { onConflict: 'coupon_code' })
    .select()

  if (error) {
    console.error('❌ 建立合作方失敗:', error)
  } else {
    console.log('✅ 合作方建立成功:', data)
  }

  console.log('🎉 完成！現在可以測試 API 了')
}

createPartnersData().catch(console.error)
