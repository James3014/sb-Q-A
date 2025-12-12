import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'

export async function GET(req: NextRequest) {
  try {
    const { supabase, error: authError } = await authorizeAdmin(req)
    if (authError) return authError

    if (!supabase) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    // 獲取篩選參數
    const { searchParams } = new URL(req.url)
    const quarter = searchParams.get('quarter')
    const status = searchParams.get('status')
    const partner = searchParams.get('partner')

    // 查詢分潤記錄
    let query = supabase
      .from('affiliate_commissions')
      .select(`
        id,
        coupon_code,
        paid_amount,
        commission_amount,
        settlement_quarter,
        status,
        created_at,
        settled_at,
        paid_at,
        affiliate_partners!inner(partner_name),
        users!inner(email)
      `)

    if (quarter) query = query.eq('settlement_quarter', quarter)
    if (status) query = query.eq('status', status)
    if (partner) query = query.ilike('affiliate_partners.partner_name', `%${partner}%`)

    const { data: commissions, error } = await query
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[Admin Commissions] 查詢錯誤:', error)
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 })
    }

    const formattedCommissions = commissions?.map((c: any) => ({
      id: c.id,
      partner_name: c.affiliate_partners?.partner_name || 'Unknown',
      coupon_code: c.coupon_code,
      user_email: c.users?.email || 'Unknown',
      paid_amount: c.paid_amount,
      commission_amount: c.commission_amount,
      settlement_quarter: c.settlement_quarter,
      status: c.status,
      created_at: c.created_at,
      settled_at: c.settled_at,
      paid_at: c.paid_at
    })) || []

    return NextResponse.json({
      ok: true,
      commissions: formattedCommissions
    })

  } catch (error: any) {
    console.error('[Admin Commissions] 錯誤:', error.message)
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { supabase, error: authError } = await authorizeAdmin(req)
    if (authError) return authError

    if (!supabase) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    const { ids, status } = await req.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '無效的 ID 列表' }, { status: 400 })
    }

    if (status !== 'paid') {
      return NextResponse.json({ error: '無效的狀態' }, { status: 400 })
    }

    // 批次更新狀態
    const { error } = await supabase
      .from('affiliate_commissions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .in('id', ids)
      .eq('status', 'settled') // 只能將已結算的標記為已支付

    if (error) {
      console.error('[Admin Commissions] 更新錯誤:', error)
      return NextResponse.json({ error: '更新失敗' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: `已標記 ${ids.length} 筆分潤為已支付`
    })

  } catch (error: any) {
    console.error('[Admin Commissions] 錯誤:', error.message)
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 })
  }
}
