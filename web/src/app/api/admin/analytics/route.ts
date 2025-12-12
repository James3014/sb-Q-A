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
    const range = searchParams.get('range') || '30d'
    const days = range === '7d' ? 7 : 30

    // 計算時間範圍
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    try {
      // 1. 獲取所有合作方數據
      const { data: affiliates, error: affiliatesError } = await supabase
        .from('affiliate_partners')
        .select(`
          id,
          partner_name,
          coupon_code,
          commission_rate
        `)

      if (affiliatesError) throw affiliatesError

      // 2. 計算每個合作方的統計數據
      const performersData = await Promise.all(
        (affiliates || []).map(async (affiliate) => {
          // 點擊數
          const { count: clicks } = await supabase
            .from('affiliate_clicks')
            .select('*', { count: 'exact', head: true })
            .eq('coupon_code', affiliate.coupon_code)
            .gte('clicked_at', startDate.toISOString())

          // 試用數
          const { count: trials } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('trial_coupon_code', affiliate.coupon_code)
            .gte('created_at', startDate.toISOString())

          // 轉換數
          const { count: conversions } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('trial_coupon_code', affiliate.coupon_code)
            .not('subscription_type', 'is', null)
            .gte('created_at', startDate.toISOString())

          // 分潤金額
          const { data: commissions } = await supabase
            .from('affiliate_commissions')
            .select('commission_amount')
            .eq('partner_id', affiliate.id)
            .gte('created_at', startDate.toISOString())

          const totalCommissions = commissions?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0
          const clicksCount = clicks || 0
          const trialsCount = trials || 0
          const conversionsCount = conversions || 0

          return {
            partner_name: affiliate.partner_name,
            coupon_code: affiliate.coupon_code,
            clicks: clicksCount,
            trials: trialsCount,
            conversions: conversionsCount,
            commissions: totalCommissions,
            clickToTrialRate: clicksCount > 0 ? (trialsCount / clicksCount) * 100 : 0,
            trialToConversionRate: trialsCount > 0 ? (conversionsCount / trialsCount) * 100 : 0,
            roi: totalCommissions > 0 ? ((totalCommissions - (clicksCount * 10)) / (clicksCount * 10)) * 100 : 0 // 假設每點擊成本 NT$10
          }
        })
      )

      // 3. 計算總覽數據
      const totalClicks = performersData.reduce((sum, p) => sum + p.clicks, 0)
      const totalTrials = performersData.reduce((sum, p) => sum + p.trials, 0)
      const totalConversions = performersData.reduce((sum, p) => sum + p.conversions, 0)
      const totalCommissions = performersData.reduce((sum, p) => sum + p.commissions, 0)

      const overview = {
        totalClicks,
        totalTrials,
        totalConversions,
        totalCommissions,
        clickToTrialRate: totalClicks > 0 ? (totalTrials / totalClicks) * 100 : 0,
        trialToConversionRate: totalTrials > 0 ? (totalConversions / totalTrials) * 100 : 0,
        overallConversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
      }

      // 4. 排序合作方（按轉換數）
      const topPerformers = performersData
        .filter(p => p.conversions > 0)
        .sort((a, b) => b.conversions - a.conversions)
        .slice(0, 5)

      // 5. 生成智能洞察
      const insights: string[] = []
      
      if (overview.overallConversionRate > 5) {
        insights.push(`整體轉換率 ${overview.overallConversionRate.toFixed(1)}% 表現優秀，高於行業平均`)
      } else if (overview.overallConversionRate < 2) {
        insights.push(`整體轉換率 ${overview.overallConversionRate.toFixed(1)}% 偏低，建議優化推廣內容`)
      }

      if (topPerformers.length > 0) {
        const bestPerformer = topPerformers[0]
        insights.push(`${bestPerformer.partner_name} 表現最佳，轉換率 ${bestPerformer.trialToConversionRate.toFixed(1)}%`)
      }

      if (overview.clickToTrialRate < 30) {
        insights.push(`點擊到試用轉換率 ${overview.clickToTrialRate.toFixed(1)}% 偏低，建議優化落地頁`)
      }

      if (totalCommissions > 10000) {
        insights.push(`本期分潤總額 NT$${Math.round(totalCommissions)}，推廣效果良好`)
      }

      // 6. 趨勢數據（簡化版）
      const trends = {
        daily: [] // 可以後續擴展
      }

      return NextResponse.json({
        overview,
        topPerformers,
        trends,
        insights
      })

    } catch (error) {
      console.error('[Analytics] 查詢錯誤:', error)
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 })
    }

  } catch (error) {
    console.error('[Analytics] 系統錯誤:', error)
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 })
  }
}
