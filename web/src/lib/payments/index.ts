import { getPaymentConfig } from '@/lib/config/payments'
import { createMockCheckoutSession } from './providers/mock'
import { createOenTechCheckoutSession } from './providers/oentech'
import { CheckoutSessionInput, CheckoutSessionResult } from './types'

export async function createCheckoutSession(
  input: CheckoutSessionInput
): Promise<CheckoutSessionResult> {
  const config = getPaymentConfig(input.origin)

  if (config.provider === 'oentech') {
    return createOenTechCheckoutSession(input, config)
  }

  return createMockCheckoutSession(input, config.appUrl)
}

export * from './types'
