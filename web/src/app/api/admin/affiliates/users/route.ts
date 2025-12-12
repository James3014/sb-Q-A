import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'

export async function GET(req: NextRequest) {
  try {
    const { supabase, error: authError } = await authorizeAdmin(req)
    if (authError) return authError

    if (!supabase) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const partnerId = searchParams.get('partner_id')

    if (!partnerId) {
      return NextResponse.json({ error: '缺少 partner_id 參數' }, { status: 400 })
    }

    // 查詢該合作方的折扣碼
    const { data: partner } = await supabase
      .from('affiliate_partners')
      .select('coupon_code')
      .eq('id', partnerId)
      .single()

    if (!partner) {
      return NextResponse.json({ error: '找不到合作方' }, { status: 404 })
    }

    // 查詢使用該折扣碼的用戶
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        subscription_type,
        subscription_expires_at,
        trial_used,
        created_at
      `)
      .eq('trial_coupon_code', partner.coupon_code)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin Affiliate Users] 查詢錯誤:', error)
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      users: users || []
    })

  } catch (error) {
    console.error('[Admin Affiliate Users] 系統錯誤:', error)
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 })
  }
}
