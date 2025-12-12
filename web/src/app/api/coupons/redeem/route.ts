import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'
import { validateCoupon } from '@/lib/coupons/validation'
import { runAntiAbuseChecks } from '@/lib/coupons/antiAbuse'
import { COUPON_ERROR_MESSAGES } from '@/lib/coupons/constants'
import { CouponRedeemResult } from '@/types/coupon'
import { recordTrialActivation } from '@/lib/analyticsServer'

const DB_ERROR_MAP: Record<string, CouponRedeemResult['reason']> = {
  coupon_not_found: 'invalid_code',
  coupon_expired: 'validation_failed',
  coupon_not_started: 'validation_failed',
  coupon_limit_reached: 'validation_failed',
  coupon_already_used: 'validation_failed',
  trial_already_used: 'validation_failed',
  subscription_active: 'validation_failed',
  user_not_found: 'validation_failed',
}

const DB_ERROR_MESSAGE_MAP: Record<string, string> = {
  coupon_not_found: COUPON_ERROR_MESSAGES.invalid_code,
  coupon_expired: COUPON_ERROR_MESSAGES.expired,
  coupon_not_started: COUPON_ERROR_MESSAGES.not_started,
  coupon_limit_reached: COUPON_ERROR_MESSAGES.max_uses_reached,
  coupon_already_used: COUPON_ERROR_MESSAGES.already_used,
  trial_already_used: COUPON_ERROR_MESSAGES.trial_used_before,
  subscription_active: COUPON_ERROR_MESSAGES.already_subscribed,
}

function getClientIp(req: NextRequest) {
  const header = req.headers.get('x-forwarded-for')
  if (header) {
    return header.split(',')[0]?.trim() || null
  }
  return req.ip || null
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

  const { data, error } = await supabase.rpc('redeem_trial_coupon', {
    p_user_id: user.id,
    p_coupon_code: couponRow.code,
    p_ip: ipAddress,
    p_user_agent: userAgent,
  })

  if (error) {
    const reason = DB_ERROR_MAP[error.message] || 'transaction_failed'
    const message =
      DB_ERROR_MESSAGE_MAP[error.message] ||
      (reason === 'invalid_code'
        ? COUPON_ERROR_MESSAGES.invalid_code
        : COUPON_ERROR_MESSAGES.validation_failed)
    return NextResponse.json(
      {
        ok: false,
        reason,
        error: message,
      } satisfies CouponRedeemResult,
      { status: reason === 'invalid_code' ? 400 : 500 }
    )
  }

  const payload = Array.isArray(data) ? data[0] : data
  if (!payload) {
    return NextResponse.json(
      { ok: false, reason: 'server_error', error: COUPON_ERROR_MESSAGES.server_error },
      { status: 500 }
    )
  }

  await recordTrialActivation(supabase, user.id, {
    coupon_id: couponRow.id,
    coupon_code: couponRow.code,
    partner_name: couponRow.partner_name,
    plan_id: payload.plan_id,
    plan_label: payload.plan_label,
  })

  return NextResponse.json({
    ok: true,
    subscription: {
      plan: payload.plan_id,
      plan_label: payload.plan_label || couponRow.plan_label || couponRow.plan_id,
      expires_at: payload.expires_at,
      trial_activated_at: payload.trial_activated_at,
      trial_source: payload.trial_source,
    },
  } satisfies CouponRedeemResult)
}
