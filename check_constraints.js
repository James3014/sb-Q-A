const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nbstwggxfwvfruwgfcqd.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3R3Z2d4Znd2ZnJ1d2dmY3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0NDM1MCwiZXhwIjoyMDc5NzIwMzUwfQ.5T0dau7DrWpr_4gTSu5s67X7H2lTXiSUVfe4KvUfMbY'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkConstraints() {
  try {
    // 檢查 users 表約束
    const { data, error } = await supabase.rpc('sql', {
      query: `
        SELECT 
          conname as constraint_name,
          pg_get_constraintdef(oid) as constraint_definition
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass 
        AND conname LIKE '%subscription_type%';
      `
    })

    if (error) {
      console.log('無法查詢約束，嘗試其他方法...')
      
      // 嘗試直接查詢表結構
      const { data: columns, error: colError } = await supabase.rpc('sql', {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name = 'subscription_type';
        `
      })
      
      if (colError) {
        console.error('查詢失敗:', colError.message)
        return
      }
      
      console.log('subscription_type 欄位資訊:', columns)
    } else {
      console.log('約束資訊:', data)
    }

    // 檢查 TESTCODE 的 plan_id
    const { data: coupon } = await supabase
      .from('coupons')
      .select('code, plan_id, plan_label')
      .eq('code', 'TESTCODE')
      .single()

    console.log('\nTESTCODE 折扣碼:')
    console.log('- plan_id:', coupon?.plan_id)
    console.log('- plan_label:', coupon?.plan_label)

  } catch (err) {
    console.error('檢查失敗:', err.message)
  }
}

checkConstraints()
