import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'

interface CreateAffiliateRequest {
  partner_name: string
  contact_email: string
  coupon_code: string
  commission_rate?: number
}

export async function POST(req: NextRequest) {
  try {
    // 1. 驗證管理員權限
    const { supabase, error: authError } = await authorizeAdmin(req)
    if (authError) return authError

    if (!supabase) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    // 2. 解析請求資料
    const body: CreateAffiliateRequest = await req.json()
    const { partner_name, contact_email, coupon_code, commission_rate = 0.15 } = body

    if (!partner_name || !contact_email || !coupon_code) {
      return NextResponse.json({
        error: '請提供合作方名稱、聯絡 Email 和折扣碼'
      }, { status: 400 })
    }

    // 3. 檢查 Email 重複
    const { data: existingPartner } = await supabase
      .from('affiliate_partners')
      .select('id')
      .eq('contact_email', contact_email)
      .single()

    if (existingPartner) {
      return NextResponse.json({
        error: `Email「${contact_email}」已被使用`
      }, { status: 409 })
    }

    // 4. 檢查折扣碼重複
    const { data: existingCoupon } = await supabase
      .from('affiliate_partners')
      .select('id')
      .eq('coupon_code', coupon_code.toUpperCase())
      .single()

    if (existingCoupon) {
      return NextResponse.json({
        error: `折扣碼「${coupon_code}」已存在，請使用其他代碼`
      }, { status: 409 })
    }

    // 5. 建立合作方記錄
    const { data: partner, error: partnerError } = await supabase
      .from('affiliate_partners')
      .insert({
        partner_name,
        contact_email,
        coupon_code: coupon_code.toUpperCase(),
        commission_rate,
        is_active: true
      })
      .select()
      .single()

    if (partnerError) {
      console.error('[Affiliate] 建立合作方記錄失敗:', partnerError)
      return NextResponse.json({
        error: `建立合作方記錄失敗：${partnerError.message}`
      }, { status: 500 })
    }

    console.log(`[Affiliate] 合作方建立成功: ${partner_name} (${contact_email}), 折扣碼: ${coupon_code}`)

    // 6. 返回結果
    return NextResponse.json({
      ok: true,
      partner: {
        id: partner.id,
        partner_name: partner.partner_name,
        contact_email: partner.contact_email,
        coupon_code: partner.coupon_code,
        commission_rate: partner.commission_rate
      }
    })

  } catch (error) {
    console.error('[Affiliate] 系統錯誤:', error)
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 })
  }
}
