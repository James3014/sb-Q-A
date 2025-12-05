import { CheckoutSessionInput, CheckoutSessionResult } from '@/lib/payments/types'

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
