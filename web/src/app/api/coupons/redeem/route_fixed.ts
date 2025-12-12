import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'
import { validateCoupon } from '@/lib/coupons/validation'
import { runAntiAbuseChecks } from '@/lib/coupons/antiAbuse'
import { COUPON_ERROR_MESSAGES } from '@/lib/coupons/constants'
import { CouponRedeemResult } from '@/types/coupon'
import { recordTrialActivation } from '@/lib/analyticsServer'

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || null
  }
  
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  
  return req.headers.get('cf-connecting-ip') || '127.0.0.1'
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceRole()
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Service not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  const code = typeof body?.code === 'string' ? body.code : ''
  if (!code) {
    return NextResponse.json({ ok: false, reason: 'validation_failed', error: '缺少折扣碼' }, { status: 400 })
  }

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return NextResponse.json(
      { ok: false, reason: 'not_authenticated', error: '請先登入後再試' },
      { status: 401 }
    )
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userResult?.user) {
    return NextResponse.json(
      { ok: false, reason: 'not_authenticated', error: '登入已過期，請重新登入' },
      { status: 401 }
    )
  }
  const user = userResult.user

  const context = await validateCoupon({ supabase, code, userId: user.id })
  if (!context.result.ok) {
    return NextResponse.json(context.result, { status: 200 })
  }
  const couponRow = context.couponRow
  if (!couponRow) {
    return NextResponse.json(
      { ok: false, reason: 'server_error', error: COUPON_ERROR_MESSAGES.server_error },
      { status: 500 }
    )
  }

  const ipAddress = getClientIp(req)
  const userAgent = req.headers.get('user-agent')

  const abuseCheck = await runAntiAbuseChecks({
    supabase,
    ipAddress,
    email: user.email,
  })
  if (!abuseCheck.allowed) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'abuse_detected',
        error: COUPON_ERROR_MESSAGES.abuse_detected,
      } satisfies CouponRedeemResult,
      { status: 429 }
    )
  }

  // 🔧 修復：直接用 SQL 查詢替代有問題的函數
  try {
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const trialSource = couponRow.partner_name || code

    // 更新用戶訂閱
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_type: couponRow.plan_id,
        subscription_expires_at: expiresAt,
        trial_used: true,
        trial_source: trialSource,
        trial_activated_at: now,
        payment_status: 'active',
        last_payment_provider: 'trial_coupon',
        last_payment_reference: code
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // 記錄折扣碼使用
    const { error: usageError } = await supabase
      .from('coupon_usages')
      .insert({
        coupon_id: couponRow.id,
        user_id: user.id,
        redeemed_at: now,
        ip_address: ipAddress,
        user_agent: userAgent
      })

    if (usageError) {
      throw usageError
    }

    // 更新折扣碼使用次數
    const { error: couponError } = await supabase
      .from('coupons')
      .update({
        used_count: (couponRow.used_count || 0) + 1,
        updated_at: now
      })
      .eq('id', couponRow.id)

    if (couponError) {
      throw couponError
    }

    // 記錄付款
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        plan_id: couponRow.plan_id,
        amount: 0,
        currency: 'TWD',
        provider: 'trial_coupon',
        status: 'active',
        metadata: {
          coupon_id: couponRow.id,
          coupon_code: code,
          trial_days: 7,
          partner_name: couponRow.partner_name
        }
      })

    if (paymentError) {
      console.warn('Payment record failed:', paymentError)
      // 不阻擋主流程
    }

    await recordTrialActivation(supabase, user.id, {
      coupon_id: couponRow.id,
      coupon_code: code,
      partner_name: couponRow.partner_name,
      plan_id: couponRow.plan_id,
      plan_label: couponRow.plan_label || couponRow.plan_id,
    })

    return NextResponse.json({
      ok: true,
      subscription: {
        plan: couponRow.plan_id,
        plan_label: couponRow.plan_label || couponRow.plan_id,
        expires_at: expiresAt,
        trial_activated_at: now,
        trial_source: trialSource,
      },
    } satisfies CouponRedeemResult)

  } catch (error) {
    console.error('Coupon redemption error:', error)
    return NextResponse.json(
      { ok: false, reason: 'transaction_failed', error: COUPON_ERROR_MESSAGES.validation_failed },
      { status: 500 }
    )
  }
}
