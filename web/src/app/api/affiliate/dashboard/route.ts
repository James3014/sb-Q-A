import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServiceRole()
    
    // 1. 驗證合作方身份
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: '需要登入' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: '登入已過期' }, { status: 401 })
    }

    // 2. 獲取合作方資料
    const { data: partner, error: partnerError } = await supabase
      .from('affiliate_partners')
      .select('id, partner_name, commission_rate, is_active')
      .eq('supabase_user_id', user.id)
      .single()

    if (partnerError || !partner) {
      return NextResponse.json({ error: '合作方帳號不存在' }, { status: 404 })
    }

    if (!partner.is_active) {
      return NextResponse.json({ error: '帳號已被停用' }, { status: 403 })
    }

    // 3. 獲取合作方的折扣碼
    const { data: coupons } = await supabase
      .from('coupons')
      .select('id, code, used_count, max_uses, is_active')
      .eq('partner_id', partner.id)

    const couponIds = coupons?.map(c => c.id) || []

    // 4. 計算試用啟用次數
    let totalTrials = 0
    if (couponIds.length > 0) {
      const { count } = await supabase
        .from('coupon_usages')
        .select('*', { count: 'exact', head: true })
        .in('coupon_id', couponIds)
      
      totalTrials = count || 0
    }

    // 5. 計算轉付費次數和分潤
    const { data: commissions } = await supabase
      .from('affiliate_commissions')
      .select('commission_amount, status, created_at')
      .eq('partner_id', partner.id)

    const totalConversions = commissions?.length || 0
    const totalCommissions = commissions?.reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0
    const pendingCommissions = commissions?.filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0
    const settledCommissions = commissions?.filter(c => c.status === 'settled')
      .reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0
    const paidCommissions = commissions?.filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0

    // 6. 計算轉換率
    const conversionRate = totalTrials > 0 ? (totalConversions / totalTrials * 100) : 0

    // 7. 獲取時間序列資料（最近 30 天）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // 每日試用數據
    const { data: dailyTrials } = await supabase
      .from('coupon_usages')
      .select('redeemed_at')
      .in('coupon_id', couponIds)
      .gte('redeemed_at', thirtyDaysAgo.toISOString())

    // 每日轉換數據
    const { data: dailyConversions } = await supabase
      .from('affiliate_commissions')
      .select('created_at')
      .eq('partner_id', partner.id)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // 8. 處理時間序列數據
    const timeSeriesData = generateTimeSeriesData(dailyTrials, dailyConversions)

    // 9. 獲取季結統計
    const currentQuarter = getCurrentQuarter()
    const { data: quarterlyStats } = await supabase
      .from('affiliate_commissions')
      .select('settlement_quarter, commission_amount, status')
      .eq('partner_id', partner.id)
      .order('settlement_quarter', { ascending: false })

    const quarterlyData = processQuarterlyData(quarterlyStats)

    return NextResponse.json({
      ok: true,
      partner: {
        name: partner.partner_name,
        commission_rate: partner.commission_rate
      },
      coupons: coupons?.map(c => ({
        code: c.code,
        used_count: c.used_count,
        max_uses: c.max_uses,
        is_active: c.is_active,
        link: `https://www.snowskill.app/pricing?coupon=${c.code}`
      })) || [],
      stats: {
        total_trials: totalTrials,
        total_conversions: totalConversions,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        total_commissions: Math.round(totalCommissions * 100) / 100,
        pending_commissions: Math.round(pendingCommissions * 100) / 100,
        settled_commissions: Math.round(settledCommissions * 100) / 100,
        paid_commissions: Math.round(paidCommissions * 100) / 100
      },
      time_series: timeSeriesData,
      quarterly: quarterlyData
    })

  } catch (error: any) {
    console.error('[Affiliate Dashboard] 錯誤:', error.message)
    return NextResponse.json({ 
      error: '系統錯誤，請稍後再試' 
    }, { status: 500 })
  }
}

// 生成時間序列數據
function generateTimeSeriesData(trials: any[], conversions: any[]) {
  const data = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayTrials = trials?.filter(t => 
      t.redeemed_at.startsWith(dateStr)
    ).length || 0
    
    const dayConversions = conversions?.filter(c => 
      c.created_at.startsWith(dateStr)
    ).length || 0
    
    data.push({
      date: dateStr,
      trials: dayTrials,
      conversions: dayConversions
    })
  }
  
  return data
}

// 處理季度數據
function processQuarterlyData(quarterlyStats: any[]) {
  const quarters: { [key: string]: any } = {}
  
  quarterlyStats?.forEach(stat => {
    const quarter = stat.settlement_quarter
    if (!quarters[quarter]) {
      quarters[quarter] = {
        quarter,
        total_amount: 0,
        pending_amount: 0,
        settled_amount: 0,
        paid_amount: 0
      }
    }
    
    const amount = parseFloat(stat.commission_amount.toString())
    quarters[quarter].total_amount += amount
    
    if (stat.status === 'pending') quarters[quarter].pending_amount += amount
    else if (stat.status === 'settled') quarters[quarter].settled_amount += amount
    else if (stat.status === 'paid') quarters[quarter].paid_amount += amount
  })
  
  return Object.values(quarters).map((q: any) => ({
    ...q,
    total_amount: Math.round(q.total_amount * 100) / 100,
    pending_amount: Math.round(q.pending_amount * 100) / 100,
    settled_amount: Math.round(q.settled_amount * 100) / 100,
    paid_amount: Math.round(q.paid_amount * 100) / 100
  }))
}

// 獲取當前季度
function getCurrentQuarter() {
  const now = new Date()
  const year = now.getFullYear()
  const quarter = Math.ceil((now.getMonth() + 1) / 3)
  return `${year}-Q${quarter}`
}
