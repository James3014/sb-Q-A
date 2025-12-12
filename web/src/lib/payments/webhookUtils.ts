import { PaymentStatus, ProviderStatus, WebhookPayload } from '@/lib/payments/types'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { calculateExpiryDate } from '@/lib/subscription'
import { SupabaseClient } from '@supabase/supabase-js'
import { recordPurchaseEvent } from '@/lib/analyticsServer'

const STATUS_MAP: Record<ProviderStatus, PaymentStatus> = {
  success: 'active',
  paid: 'active',
  failed: 'failed',
  canceled: 'canceled',
  refunded: 'refunded',
}

export function mapStatus(status?: ProviderStatus): PaymentStatus {
  if (!status) return 'pending'
  return STATUS_MAP[status] || 'pending'
}

export function buildRawPayload(payload: WebhookPayload, provider: string) {
  return {
    ...(payload.payload || {}),
    provider,
    received_at: new Date().toISOString(),
  }
}

export function validatePaymentPayload(payload: WebhookPayload, payment: any): string | null {
  if (payload.planId && payload.planId !== payment.plan_id) {
    return 'Plan mismatch'
  }
  if (typeof payload.amount === 'number' && Number(payload.amount) !== Number(payment.amount)) {
    return 'Amount mismatch'
  }
  if (payload.currency && payload.currency !== payment.currency) {
    return 'Currency mismatch'
  }
  return null
}

export function shouldSkipStatusUpdate(
  current: PaymentStatus,
  incoming: PaymentStatus
): boolean {
  const duplicateSuccess = current === 'active' && incoming === 'active'
  const finalizedNoChange =
    (current === 'active' && incoming !== 'refunded') || current === 'refunded'
  const duplicateFailure =
    (current === 'failed' || current === 'canceled') &&
    (incoming === 'failed' || incoming === 'canceled')

  return duplicateSuccess || finalizedNoChange || duplicateFailure
}

export function computeExtendedExpiry(planId: string, currentExpiry?: string | null): string {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`)
  }
  const now = new Date()
  const current = currentExpiry ? new Date(currentExpiry) : null
  const baseDate = current && current > now ? current : now
  const extended =
    baseDate > now
      ? new Date(baseDate.getTime() + plan.days * 24 * 60 * 60 * 1000)
      : calculateExpiryDate(plan.id)
  return extended.toISOString()
}

export async function updateUserForStatus(
  supabase: SupabaseClient,
  userId: string,
  planId: string,
  mappedStatus: PaymentStatus,
  referenceId: string | null,
  provider: string,
  referralCode?: string
) {
  if (mappedStatus === 'active') {
    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_type, subscription_expires_at')
      .eq('id', userId)
      .single()

    const extendedExpiry = computeExtendedExpiry(planId, userProfile?.subscription_expires_at)

    const updateData: any = {
      subscription_type: planId,
      subscription_expires_at: extendedExpiry,
      payment_status: 'active',
      last_payment_provider: provider,
      last_payment_reference: referenceId,
    }

    // 如果有推廣來源，記錄到 trial_coupon_code
    if (referralCode) {
      updateData.trial_coupon_code = referralCode
    }

    await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
    return
  }

  const paymentStatus = mappedStatus === 'refunded' ? 'refunded' : mappedStatus
  await supabase
    .from('users')
    .update({
      payment_status: paymentStatus,
      last_payment_provider: provider,
      last_payment_reference: referenceId,
    })
    .eq('id', userId)
}

export async function logPaymentEvent(
  supabase: SupabaseClient,
  userId: string,
  eventType: 'purchase_success' | 'purchase_failed' | 'purchase_refunded',
  metadata: Record<string, unknown>
) {
  await recordPurchaseEvent(supabase, userId, eventType, metadata)
}
