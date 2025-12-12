const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nbstwggxfwvfruwgfcqd.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY'

const supabase = createClient(supabaseUrl, serviceKey)

async function createAffiliateTables() {
  console.log('🏗️ 建立聯盟行銷資料表...')

  // 1. 建立 affiliate_partners 表
  const { error: partnersError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS affiliate_partners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        partner_name TEXT NOT NULL,
        contact_email TEXT UNIQUE NOT NULL,
        coupon_code TEXT UNIQUE NOT NULL,
        commission_rate DECIMAL(5,4) DEFAULT 0.15,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })

  if (partnersError) {
    console.error('❌ 建立 affiliate_partners 表失敗:', partnersError)
  } else {
    console.log('✅ affiliate_partners 表建立成功')
  }

  // 2. 建立 affiliate_commissions 表
  const { error: commissionsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS affiliate_commissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        partner_id UUID REFERENCES affiliate_partners(id),
        user_id UUID REFERENCES users(id),
        coupon_code TEXT NOT NULL,
        paid_amount DECIMAL(10,2) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        settlement_quarter TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        settled_at TIMESTAMPTZ,
        paid_at TIMESTAMPTZ
      );
    `
  })

  if (commissionsError) {
    console.error('❌ 建立 affiliate_commissions 表失敗:', commissionsError)
  } else {
    console.log('✅ affiliate_commissions 表建立成功')
  }

  // 3. 建立測試資料
  console.log('📊 建立測試資料...')
  
  const { data: partners, error: insertError } = await supabase
    .from('affiliate_partners')
    .upsert([
      {
        partner_name: '滑雪教練 A',
        contact_email: 'coach-a@example.com',
        coupon_code: 'COACH-A',
        commission_rate: 0.15,
        is_active: true
      },
      {
        partner_name: '滑雪教練 B', 
        contact_email: 'coach-b@example.com',
        coupon_code: 'COACH-B',
        commission_rate: 0.20,
        is_active: true
      }
    ], { onConflict: 'coupon_code' })
    .select()

  if (insertError) {
    console.error('❌ 建立測試資料失敗:', insertError)
  } else {
    console.log('✅ 測試資料建立成功:', partners)
  }

  console.log('🎉 聯盟行銷系統資料表建立完成！')
}

createAffiliateTables().catch(console.error)
