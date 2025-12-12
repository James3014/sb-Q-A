/**
 * 折扣碼和試用系統 TypeScript 類型定義
 *
 * 模塊包含：
 * - Coupon（折扣碼）
 * - CouponValidation（驗證結果）
 * - CouponRedeem（兌換結果）
 * - CouponError（錯誤類型）
 */

/** 折扣碼主表 */
export interface Coupon {
  id: string
  code: string
  type: 'free_trial' | 'discount'
  plan_id: string
  plan_label: string // e.g., "7天 PASS"
  discount_amount: number
  max_uses: number | null
  used_count: number
  valid_from: string // ISO 8601 timestamp
  valid_until: string | null
  partner_name?: string
  partner_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/** 折扣碼驗證結果 */
export interface CouponValidationResult {
  ok: boolean
  valid: boolean
  coupon?: {
    id: string
    code: string
    plan_id: string
    plan_label: string
    partner_name?: string
  }
  error?: string
  reason?:
    | 'invalid_code'
    | 'not_started'
    | 'expired'
    | 'max_uses_reached'
    | 'already_used'
    | 'trial_used_before'
    | 'already_subscribed'
    | 'invalid_format'
    | 'server_error'
}

/** 折扣碼兌換結果 */
export interface CouponRedeemResult {
  ok: boolean
  subscription?: {
    plan: string
    plan_label: string
    expires_at: string
    trial_activated_at: string
    trial_source?: string
  }
  error?: string
  reason?:
    | 'not_authenticated'
    | 'invalid_code'
    | 'validation_failed'
    | 'transaction_failed'
    | 'abuse_detected'
    | 'server_error'
}

/** 折扣碼使用記錄 */
export interface CouponUsage {
  id: string
  coupon_id: string
  user_id: string
  redeemed_at: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, unknown>
}

/** 折扣碼相關錯誤類型 */
export type CouponError =
  | 'INVALID_CODE'
  | 'EXPIRED'
  | 'MAX_USES_REACHED'
  | 'ALREADY_USED'
  | 'TRIAL_USED_BEFORE'
  | 'ALREADY_SUBSCRIBED'
  | 'RATE_LIMITED'
  | 'EMAIL_DOMAIN_BLOCKED'
  | 'INVALID_FORMAT'
  | 'DATABASE_ERROR'
  | 'AUTHENTICATION_REQUIRED'

/** 防濫用檢查結果 */
export interface AbuseCheckResult {
  allowed: boolean
  reason?: string
  blockDuration?: number // 毫秒
}

/** 試用系統用戶擴充字段 */
export interface TrialUserExtension {
  trial_activated_at: string | null
  trial_source: string | null // 合作方識別
  trial_used: boolean
}

/** 合作方信息（前端可見） */
export interface AffiliatePartner {
  id: string
  name: string
  email?: string
  coupon_code?: string
  commission_rate: number
  is_active: boolean
  created_at: string
}

/** API 請求類型 */
export namespace CouponAPI {
  export interface ValidateRequest {
    code: string
  }

  export interface RedeemRequest {
    code: string
    turnstileToken?: string // Cloudflare Turnstile token
  }

  export interface CreateAffiliateRequest {
    name: string
    email: string
    coupon_code: string
  }

  export interface CreateAffiliateResponse {
    ok: boolean
    affiliate?: {
      id: string
      name: string
      email: string
      coupon_id: string
      coupon_code: string
      share_link: string
      login_link: string
      password_set_required: boolean
    }
    error?: string
  }
}
