export interface Affiliate {
  id: string
  partner_name: string
  contact_email: string
  coupon_code: string
  commission_rate: number
  is_active: boolean
  total_trials: number
  total_conversions: number
  conversion_rate: number
  total_commissions: number
  created_at: string
}

export interface AffiliateUser {
  id: string
  email: string
  subscription_type: string
  subscription_expires_at: string
  trial_used: boolean
  created_at: string
}

export interface AffiliateFormData {
  partner_name: string
  contact_email: string
  coupon_code: string
  commission_rate: number
}
