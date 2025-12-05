export type PaymentProvider = 'mock' | 'oentech'

export interface CheckoutSessionInput {
  paymentId: string
  planId: string
  amount: number
  currency: string
  userId: string
  userEmail?: string | null
  origin?: string | null
}

export interface CheckoutSessionResult {
  providerPaymentId: string
  checkoutUrl: string
  payload?: Record<string, unknown>
}

export type ProviderStatus = 'success' | 'paid' | 'failed' | 'canceled' | 'refunded'
export type PaymentStatus = 'none' | 'pending' | 'active' | 'failed' | 'canceled' | 'refunded'

export interface WebhookPayload {
  paymentId?: string
  providerPaymentId?: string
  planId?: string
  status?: ProviderStatus
  amount?: number
  currency?: string
  reason?: string
  payload?: Record<string, unknown>
}
