import { PaymentProvider } from '@/lib/payments/types'

interface OenTechConfig {
  apiUrl: string
  token: string
  merchantId: string
}

export interface PaymentConfig {
  provider: PaymentProvider
  appUrl: string
  oentech?: OenTechConfig
}

function resolveAppUrl(origin?: string | null): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (origin) return origin
  return 'http://localhost:3000'
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`[Payments] Missing required env: ${name}`)
  }
  return value
}

export function getPaymentConfig(origin?: string | null): PaymentConfig {
  const provider = (process.env.PAYMENT_PROVIDER || 'mock') as PaymentProvider
  const appUrl = resolveAppUrl(origin)

  if (provider === 'oentech') {
    return {
      provider,
      appUrl,
      oentech: {
        apiUrl: requireEnv('PAYMENT_OENTECH_API_URL'),
        token: requireEnv('PAYMENT_OENTECH_TOKEN'),
        merchantId: requireEnv('PAYMENT_OENTECH_MERCHANT_ID'),
      },
    }
  }

  return { provider, appUrl }
}
