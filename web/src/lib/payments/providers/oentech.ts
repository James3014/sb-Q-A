import { CheckoutSessionInput, CheckoutSessionResult } from '@/lib/payments/types'
import { PaymentConfig } from '@/lib/config/payments'

export async function createOenTechCheckoutSession(
  input: CheckoutSessionInput,
  config: PaymentConfig
): Promise<CheckoutSessionResult> {
  if (!config.oentech) {
    throw new Error('Missing ŌEN Tech configuration')
  }

  const { apiUrl, token, merchantId } = config.oentech
  const baseUrl = config.appUrl

  const orderId = `ORDER-${input.paymentId}`
  const successUrl = `${baseUrl}/payment-success?payment_id=${input.paymentId}`
  const failureUrl = `${baseUrl}/payment-failure?payment_id=${input.paymentId}`

  const requestBody = {
    merchantId,
    amount: input.amount,
    currency: input.currency,
    orderId,
    successUrl,
    failureUrl,
    userId: input.userId,
    customId: input.paymentId,
  }

  const response = await fetch(`${apiUrl}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`ŌEN Tech API error: ${error.message || response.statusText}`)
  }

  const data = await response.json()

  if (data.code !== 'S0000' || !data.data?.id) {
    throw new Error(`ŌEN Tech checkout failed: ${data.message || 'unknown error'}`)
  }

  const checkoutId = data.data.id
  const isProduction = apiUrl.includes('payment-api.oen.tw') && !apiUrl.includes('testing')
  const checkoutUrl = isProduction
    ? `https://${merchantId}.oen.tw/checkout/${checkoutId}`
    : `https://${merchantId}.testing.oen.tw/checkout/${checkoutId}`

  return {
    providerPaymentId: checkoutId,
    checkoutUrl,
    payload: {
      provider: 'oentech',
      merchantId,
      orderId,
      transactionHid: data.data.transactionHid,
    },
  }
}
