import { CheckoutSessionInput, CheckoutSessionResult, WebhookPayload } from '@/lib/payments/types'
import { PaymentProvider } from './types'

/**
 * Mock Webhook 解析（策略模式，用於測試）
 */
export const mockProvider: PaymentProvider = {
  name: 'mock',

  canHandle(): boolean {
    // Mock provider 是預設，當其他 provider 都不匹配時使用
    return true
  },

  parseWebhook(rawBody: Record<string, unknown>): WebhookPayload {
    return rawBody as WebhookPayload
  },
}

/**
 * Mock Checkout Session 建立（用於測試）
 */
export function createMockCheckoutSession(input: CheckoutSessionInput, appUrl: string): CheckoutSessionResult {
  const planLabel = input.planId
  const baseUrl = appUrl
  return {
    providerPaymentId: `mock_${input.paymentId}`,
    checkoutUrl: `${baseUrl}/mock-checkout?payment_id=${input.paymentId}&plan=${encodeURIComponent(
      planLabel
    )}`,
    payload: {
      provider: 'mock',
      note: 'Replace with real provider integration',
      amount: input.amount,
      currency: input.currency,
    },
  }
}
