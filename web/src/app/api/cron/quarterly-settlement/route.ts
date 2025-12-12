// 10.3 季結計算 Cron Job

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'
import { getSettlementPeriod } from '@/lib/affiliate/commission'

export async function POST(req: NextRequest) {
  try {
    // 驗證 CRON_SECRET
    const cronSecret = req.headers.get('authorization')?.replace('Bearer ', '')
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseServiceRole()
    if (!supabase) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }
    
    const lastQuarter = getPreviousQuarter()
    
    console.log(`[Quarterly Settlement] 開始處理 ${lastQuarter} 季結...`)

    // 查詢上季試用轉付費訂單
    const { data: conversions } = await supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('settlement_quarter', lastQuarter)
      .eq('status', 'pending')

    if (!conversions || conversions.length === 0) {
      console.log(`[Quarterly Settlement] ${lastQuarter} 無待結算分潤`)
      return NextResponse.json({ message: '無待結算分潤' })
    }

    // 按合作方分組
    const partnerGroups: { [key: string]: any[] } = {}
    conversions.forEach(c => {
      if (!partnerGroups[c.partner_id]) {
        partnerGroups[c.partner_id] = []
      }
      partnerGroups[c.partner_id].push(c)
    })

    // 批次更新為已結算
    const { error: updateError } = await supabase
      .from('affiliate_commissions')
      .update({ 
        status: 'settled',
        settled_at: new Date().toISOString()
      })
      .eq('settlement_quarter', lastQuarter)
      .eq('status', 'pending')

    if (updateError) {
      console.error('[Quarterly Settlement] 更新狀態失敗:', updateError)
      return NextResponse.json({ error: '結算失敗' }, { status: 500 })
    }

    console.log(`[Quarterly Settlement] ${lastQuarter} 季結完成，共 ${conversions.length} 筆分潤`)

    return NextResponse.json({
      message: '季結完成',
      quarter: lastQuarter,
      commissions_count: conversions.length,
      partners_count: Object.keys(partnerGroups).length
    })

  } catch (error: any) {
    console.error('[Quarterly Settlement] 錯誤:', error.message)
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 })
  }
}

function getPreviousQuarter(): string {
  const now = new Date()
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3)
  
  if (currentQuarter === 1) {
    return `${now.getFullYear() - 1}-Q4`
  } else {
    return `${now.getFullYear()}-Q${currentQuarter - 1}`
  }
}
