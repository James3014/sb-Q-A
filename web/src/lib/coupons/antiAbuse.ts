import { SupabaseClient } from '@supabase/supabase-js'
import { AbuseCheckResult } from '@/types/coupon'
import {
  EMAIL_DOMAIN_BLACKLIST,
  getEmailDomain,
  IP_REDEEM_LIMIT,
  IP_REDEEM_WINDOW_MS,
} from './constants'

interface AntiAbuseInput {
  supabase: SupabaseClient
  ipAddress?: string | null
  email?: string | null
}

export async function runAntiAbuseChecks({
  supabase,
  ipAddress,
  email,
}: AntiAbuseInput): Promise<AbuseCheckResult> {
  if (email) {
    const domain = getEmailDomain(email)
    if (domain && EMAIL_DOMAIN_BLACKLIST.includes(domain)) {
      return {
        allowed: false,
        reason: 'email_domain_blocked',
      }
    }
  }

  if (ipAddress && IP_REDEEM_LIMIT > 0) {
    const windowStart = new Date(Date.now() - IP_REDEEM_WINDOW_MS).toISOString()
    const { count, error } = await supabase
      .from('coupon_usages')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .gte('redeemed_at', windowStart)

    if (error) {
      console.error('[CouponAntiAbuse] IP lookup failed', error.message)
    } else if ((count ?? 0) >= IP_REDEEM_LIMIT) {
      return {
        allowed: false,
        reason: 'rate_limited',
        blockDuration: IP_REDEEM_WINDOW_MS,
      }
    }
  }

  return { allowed: true }
}
