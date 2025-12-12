import { SubscriptionPlanId } from '@/lib/constants'

export const COUPON_CODE_REGEX = /^[A-Z0-9][A-Z0-9_-]{3,31}$/

export const DEFAULT_TRIAL_PLAN_ID: SubscriptionPlanId =
  (process.env.NEXT_PUBLIC_TRIAL_PLAN_ID as SubscriptionPlanId) || 'pass_7'

export const DEFAULT_TRIAL_PLAN_LABEL =
  process.env.NEXT_PUBLIC_TRIAL_PLAN_LABEL || '7天 PASS'

export const TRIAL_DURATION_DAYS = parseInt(
  process.env.NEXT_PUBLIC_TRIAL_DURATION_DAYS || '7',
  10
)

export const TRIAL_PROVIDER = 'trial_coupon'

export const IP_REDEEM_WINDOW_MS =
  parseInt(process.env.NEXT_PUBLIC_TRIAL_IP_WINDOW_HOURS || '24', 10) *
  60 *
  60 *
  1000

export const IP_REDEEM_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_TRIAL_IP_LIMIT || '3',
  10
)

export const EMAIL_DOMAIN_BLACKLIST = (process.env.TRIAL_EMAIL_DOMAIN_BLACKLIST || '')
  .split(',')
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean)

export const COUPON_ERROR_MESSAGES = {
  invalid_format: '折扣碼格式不正確',
  invalid_code: '折扣碼不存在或已停用',
  expired: '折扣碼已過期',
  not_started: '折扣碼尚未生效',
  max_uses_reached: '折扣碼已達使用上限',
  already_used: '此折扣碼已使用過',
  trial_used_before: '您已使用過免費試用',
  already_subscribed: '目前已有有效方案，無法啟用試用',
  abuse_detected: '系統偵測異常，請稍後再試',
  validation_failed: '折扣碼驗證失敗，請稍後再試',
  server_error: '系統繁忙，請稍後再試',
} as const

export function normalizeCouponCode(input: string) {
  return input.trim().toUpperCase()
}

export function getEmailDomain(email?: string | null) {
  if (!email) return null
  const [, domain] = email.split('@')
  return domain?.toLowerCase() || null
}
