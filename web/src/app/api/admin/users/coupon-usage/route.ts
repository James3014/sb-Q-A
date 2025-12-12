import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const supabase = getSupabaseServiceRole()
    
    // 獲取用戶的折扣碼使用記錄
    const { data, error } = await supabase
      .from('coupon_usages')
      .select(`
        redeemed_at,
        coupons (
          code
        )
      `)
      .eq('user_id', userId)
      .order('redeemed_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ 
        coupon_code: null, 
        used_at: null 
      })
    }

    return NextResponse.json({
      coupon_code: data.coupons?.code || null,
      used_at: data.redeemed_at
    })

  } catch (error) {
    console.error('Coupon usage lookup error:', error)
    return NextResponse.json({ 
      coupon_code: null, 
      used_at: null 
    })
  }
}
