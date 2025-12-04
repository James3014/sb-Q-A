import { SUBSCRIPTION_PLANS } from './constants'

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

function getProvider() {
  return process.env.PAYMENT_PROVIDER || 'mock'
}

function getBaseUrl(origin?: string | null) {
  return process.env.NEXT_PUBLIC_APP_URL || origin || 'http://localhost:3000'
}

async function createMockCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === input.planId)
  const planLabel = plan?.label || input.planId
  const baseUrl = getBaseUrl(input.origin)
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

async function createOenTechCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
  const apiUrl = process.env.PAYMENT_OENTECH_API_URL
  const token = process.env.PAYMENT_OENTECH_TOKEN
  const merchantId = process.env.PAYMENT_OENTECH_MERCHANT_ID
  const baseUrl = getBaseUrl(input.origin)

  if (!apiUrl || !token || !merchantId) {
    throw new Error('Missing ŌEN Tech credentials')
  }

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
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`ŌEN Tech API error: ${error.message || response.statusText}`)
  }

  const data = await response.json()

  if (data.code !== 'S0000' || !data.data?.id) {
    throw new Error(`ŌEN Tech checkout failed: ${data.message}`)
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

export async function createCheckoutSession(
  input: CheckoutSessionInput
): Promise<CheckoutSessionResult> {
  const provider = getProvider()

  if (provider === 'oentech') {
    return createOenTechCheckoutSession(input)
  }

  if (provider === 'mock' || !provider) {
    return createMockCheckoutSession(input)
  }

  throw new Error(`Payment provider "${provider}" 尚未實作`)
}
