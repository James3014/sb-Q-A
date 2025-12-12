import { SupabaseClient } from '@supabase/supabase-js'
import { CouponValidationResult, TrialUserExtension } from '@/types/coupon'
import {
  COUPON_CODE_REGEX,
  COUPON_ERROR_MESSAGES,
  normalizeCouponCode,
} from './constants'

type CouponRow = {
  id: string
  code: string
  plan_id: string
  plan_label: string | null
  partner_name: string | null
  max_uses: number | null
  used_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
}

type UserProfile = {
  id: string
  subscription_type: string | null
  subscription_expires_at: string | null
} & TrialUserExtension

export interface CouponValidationContext {
  result: CouponValidationResult
  couponRow?: CouponRow
  userProfile?: UserProfile
}

interface ValidateCouponOptions {
  supabase: SupabaseClient
  code: string
  userId?: string
}

const errorResult = (
  reason: NonNullable<CouponValidationResult['reason']>
): CouponValidationResult => ({
  ok: false,
  valid: false,
  reason,
  error: COUPON_ERROR_MESSAGES[reason] || '折扣碼無法使用',
})

export async function validateCoupon({
  supabase,
  code,
  userId,
}: ValidateCouponOptions): Promise<CouponValidationContext> {
  const normalized = normalizeCouponCode(code || '')
  if (!COUPON_CODE_REGEX.test(normalized)) {
    return { result: errorResult('invalid_format') }
  }

  const { data: coupon, error: couponError } = await supabase
    .from('coupons')
    .select(
      'id, code, plan_id, plan_label, partner_name, max_uses, used_count, valid_from, valid_until, is_active'
    )
    .eq('code', normalized)
    .maybeSingle()

  if (couponError) {
    console.error('[Coupon] failed to query coupon', couponError.message)
    return { result: errorResult('server_error') }
  }
  if (!coupon || !coupon.is_active) {
    return { result: errorResult('invalid_code') }
  }

  const now = Date.now()
  const validFrom = coupon.valid_from ? Date.parse(coupon.valid_from) : 0
  const validUntil = coupon.valid_until ? Date.parse(coupon.valid_until) : null

  if (validFrom > now) {
    return { result: errorResult('not_started') }
  }
  if (validUntil && validUntil < now) {
    return { result: errorResult('expired') }
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { result: errorResult('max_uses_reached') }
  }

  let userProfile: UserProfile | undefined

  if (userId) {
    const [
      { data: profile, error: profileError },
      { count: usageCount, error: usageError },
    ] = await Promise.all([
        supabase
          .from('users')
          .select('id, subscription_type, subscription_expires_at, trial_used')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('coupon_usages')
          .select('id', { count: 'exact', head: true })
          .eq('coupon_id', coupon.id)
          .eq('user_id', userId),
      ])

    if (profileError || usageError) {
      console.error('[Coupon] failed to query user state', profileError || usageError)
      return { result: errorResult('server_error') }
    }

    userProfile = profile ? {
      id: profile.id,
      subscription_type: profile.subscription_type,
      subscription_expires_at: profile.subscription_expires_at,
      trial_used: profile.trial_used,
      trial_activated_at: null,
      trial_source: null
    } : undefined
    const alreadyUsed = (usageCount ?? 0) > 0
    if (alreadyUsed) {
      return { result: errorResult('already_used') }
    }

    if (profile?.trial_used) {
      return { result: errorResult('trial_used_before') }
    }

    const hasActiveSubscription =
      profile &&
      profile.subscription_type &&
      profile.subscription_type !== 'free' &&
      (!profile.subscription_expires_at ||
        new Date(profile.subscription_expires_at).getTime() > now)

    if (hasActiveSubscription) {
      return { result: errorResult('already_subscribed') }
    }
  }

  return {
    result: {
      ok: true,
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        plan_id: coupon.plan_id,
        plan_label: coupon.plan_label || coupon.plan_id,
        partner_name: coupon.partner_name || undefined,
      },
    },
    couponRow: coupon,
    userProfile,
  }
}
