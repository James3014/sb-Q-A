import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'

interface CreateAffiliateRequest {
  partner_name: string
  contact_email: string
  coupon_code: string
  commission_rate?: number
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 1. 驗證管理員權限
    const { supabase, error: authError } = await authorizeAdmin(req)
    if (authError) return authError

    // 2. 解析請求資料
    const body: CreateAffiliateRequest = await req.json()
    const { partner_name, contact_email, coupon_code, commission_rate = 0.15 } = body

    if (!partner_name || !contact_email || !coupon_code) {
      return NextResponse.json({
        ok: false,
        error: '請提供合作方名稱、聯絡 Email 和折扣碼'
      }, { status: 400 })
    }

    // 3. 檢查折扣碼重複
    const { data: existingCoupon } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', coupon_code.toUpperCase())
      .single()

    if (existingCoupon) {
      return NextResponse.json({
        ok: false,
        error: `折扣碼「${coupon_code}」已存在，請使用其他代碼`
      }, { status: 409 })
    }

    // 4. 檢查 Email 重複
    const { data: existingPartner } = await supabase
      .from('affiliate_partners')
      .select('id')
      .eq('contact_email', contact_email)
      .single()

    if (existingPartner) {
      return NextResponse.json({
        ok: false,
        error: `Email「${contact_email}」已被使用`
      }, { status: 409 })
    }

    // 5. 建立 Supabase 帳號
    console.log(`[Affiliate] 為 ${contact_email} 建立帳號...`)
    
    const tempPassword = generateTempPassword()
    const { data: authUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: contact_email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        partner_name,
        role: 'affiliate'
      }
    })

    if (createUserError) {
      console.error('[Affiliate] 建立 Supabase 帳號失敗:', createUserError)
      return NextResponse.json({
        ok: false,
        error: `建立帳號失敗：${createUserError.message}`
      }, { status: 500 })
    }

    // 6. 開啟 Transaction：建立合作方記錄和折扣碼
    console.log(`[Affiliate] 建立合作方記錄和折扣碼...`)
    
    // 6a. 建立 affiliate_partners 記錄
    const { data: partner, error: partnerError } = await supabase
      .from('affiliate_partners')
      .insert({
        supabase_user_id: authUser.user.id,
        partner_name,
        contact_email,
        commission_rate
      })
      .select()
      .single()

    if (partnerError) {
      // 回滾：刪除已建立的 Supabase 帳號
      await supabase.auth.admin.deleteUser(authUser.user.id)
      console.error('[Affiliate] 建立合作方記錄失敗:', partnerError)
      return NextResponse.json({
        ok: false,
        error: `建立合作方記錄失敗：${partnerError.message}`
      }, { status: 500 })
    }

    // 6b. 建立專屬折扣碼
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .insert({
        code: coupon_code.toUpperCase(),
        plan_id: 'pass_7',
        plan_label: '7天試用',
        partner_id: partner.id,
        is_active: true,
        valid_until: '2025-12-31T23:59:59+00:00',
        max_uses: 1000, // 合作方折扣碼通常有較高使用限制
        used_count: 0
      })
      .select()
      .single()

    if (couponError) {
      // 回滾：刪除合作方記錄和 Supabase 帳號
      await supabase.from('affiliate_partners').delete().eq('id', partner.id)
      await supabase.auth.admin.deleteUser(authUser.user.id)
      console.error('[Affiliate] 建立折扣碼失敗:', couponError)
      return NextResponse.json({
        ok: false,
        error: `建立折扣碼失敗：${couponError.message}`
      }, { status: 500 })
    }

    // 7. 生成密碼重設連結
    const { data: resetData, error: resetError } = await supabase.auth.admin
      .generateLink({
        type: 'recovery',
        email: contact_email
      })

    let resetLink = null
    if (!resetError && resetData.properties?.action_link) {
      resetLink = resetData.properties.action_link
    }

    // 8. 記錄成功日誌
    const duration = Date.now() - startTime
    console.log(`[Affiliate] 合作方帳號建立成功: ${partner_name} (${contact_email}), 折扣碼: ${coupon_code}, 耗時: ${duration}ms`)

    // 9. 返回結果（不包含密碼）
    return NextResponse.json({
      ok: true,
      partner: {
        id: partner.id,
        partner_name,
        contact_email,
        commission_rate,
        coupon_code: coupon.code,
        coupon_link: `https://www.snowskill.app/pricing?coupon=${coupon.code}`,
        reset_link: resetLink,
        created_at: partner.created_at
      },
      message: '合作方帳號建立成功！請將登入資訊發送給合作方。'
    })

  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`[Affiliate] 建立合作方帳號失敗: ${error.message}, 耗時: ${duration}ms`)
    
    return NextResponse.json({
      ok: false,
      error: '系統錯誤，請稍後再試或聯繫技術支援'
    }, { status: 500 })
  }
}

// 生成臨時密碼
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
