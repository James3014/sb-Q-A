import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'

export async function GET(req: NextRequest) {
  try {
    const { supabase, error: authError } = await authorizeAdmin(req)
    if (authError) return authError

    if (!supabase) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    // 查詢合作方列表及統計
    const { data: affiliates, error } = await supabase
      .from('affiliate_partners')
      .select(`
        id,
        partner_name,
        contact_email,
        coupon_code,
        commission_rate,
        is_active,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin Affiliates] 查詢錯誤:', error)
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 })
    }

    // 為每個合作方計算統計數據
    const affiliatesWithStats = await Promise.all(
      (affiliates || []).map(async (affiliate) => {
        // 查詢試用數（使用該折扣碼的用戶）
        const { count: totalTrials } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('trial_coupon_code', affiliate.coupon_code || '')

        // 查詢轉換數（有付費訂閱的用戶）
        const { count: totalConversions } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('trial_coupon_code', affiliate.coupon_code || '')
          .not('subscription_type', 'is', null)

        // 查詢總分潤
        const { data: commissions } = await supabase
          .from('affiliate_commissions')
          .select('commission_amount')
          .eq('partner_id', affiliate.id)

        const totalCommissions = commissions?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0
        const trialsCount = totalTrials || 0
        const conversionsCount = totalConversions || 0
        const conversionRate = trialsCount > 0 ? Math.round((conversionsCount / trialsCount) * 100) : 0

        return {
          ...affiliate,
          total_trials: trialsCount,
          total_conversions: conversionsCount,
          conversion_rate: conversionRate,
          total_commissions: totalCommissions
        }
      })
    )

    return NextResponse.json({
      ok: true,
      affiliates: affiliatesWithStats
    })

  } catch (error) {
    console.error('[Admin Affiliates] 系統錯誤:', error)
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

    const { id, is_active } = await req.json()

    const { error } = await supabase
      .from('affiliate_partners')
      .update({ is_active })
      .eq('id', id)

    if (error) {
      console.error('[Admin Affiliates] 更新錯誤:', error)
      return NextResponse.json({ error: '更新失敗' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('[Admin Affiliates] 系統錯誤:', error)
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 })
  }
}
