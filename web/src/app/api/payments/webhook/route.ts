import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { calculateExpiryDate } from '@/lib/subscription'
import { queueEventSync } from '@/lib/userCoreSync'

type ProviderStatus = 'success' | 'paid' | 'failed' | 'canceled' | 'refunded'
type PaymentStatus = 'none' | 'pending' | 'active' | 'failed' | 'canceled' | 'refunded'

interface WebhookPayload {
  paymentId?: string
  providerPaymentId?: string
  planId?: string
  status?: ProviderStatus
  amount?: number
  currency?: string
  reason?: string
  payload?: Record<string, unknown>
}

interface OenTechWebhookPayload {
  merchantId: string
  id: string
  success?: boolean
  charged?: boolean
  failed?: boolean
  status?: string
  message?: string
  customId?: string
  [key: string]: unknown
}

const STATUS_MAP: Record<ProviderStatus, PaymentStatus> = {
  success: 'active',
  paid: 'active',
  failed: 'failed',
  canceled: 'canceled',
  refunded: 'refunded',
}

/**
 * 解析 ŌEN Tech webhook 格式
 */
function parseOenTechWebhook(rawBody: OenTechWebhookPayload): WebhookPayload {
  const customId = rawBody.customId as string | undefined // 這是我們存的 paymentId
  const oentechStatus = rawBody.status as string | undefined

  // ŌEN Tech 狀態對應
  let status: ProviderStatus = 'failed'
  if (rawBody.success === true || oentechStatus === 'charged' || rawBody.charged === true) {
    status = 'success'
  } else if (oentechStatus === 'failed' || rawBody.failed === true) {
    status = 'failed'
  }

  return {
    paymentId: customId,
    providerPaymentId: rawBody.id,
    status,
    reason: rawBody.message as string | undefined,
    payload: rawBody,
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceRole()
  if (!supabase) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }

  const provider = process.env.PAYMENT_PROVIDER || 'mock'

  let webhookPayload: WebhookPayload | null = null
  const rawBody = (await req.json().catch(() => null)) as Record<string, unknown> | null

  if (!rawBody) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // 判斷是哪個供應商的 webhook
  if (provider === 'oentech' && 'merchantId' in rawBody) {
    // ŌEN Tech webhook
    webhookPayload = parseOenTechWebhook(rawBody as OenTechWebhookPayload)
  } else {
    // Generic webhook
    webhookPayload = rawBody as WebhookPayload
  }

  if (!webhookPayload) {
    return NextResponse.json({ error: 'Failed to parse webhook' }, { status: 400 })
  }

  const providerPaymentId = webhookPayload.providerPaymentId
  const paymentId = webhookPayload.paymentId
  if (!providerPaymentId && !paymentId) {
    return NextResponse.json({ error: 'Missing payment identifiers' }, { status: 400 })
  }

  const statusKey = webhookPayload.status || 'success'
  const mappedStatus: PaymentStatus = STATUS_MAP[statusKey] || 'pending'

  let query = supabase.from('payments').select('*').limit(1)

  if (providerPaymentId) {
    query = query.eq('provider_payment_id', providerPaymentId)
  } else if (paymentId) {
    query = query.eq('id', paymentId)
  }

  const { data: paymentRecords, error: paymentLookupError } = await query

  if (paymentLookupError || !paymentRecords || paymentRecords.length === 0) {
    console.error('[Webhook] Payment not found', paymentLookupError?.message)
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const payment = paymentRecords[0]
  const planId = webhookPayload.planId || payment.plan_id
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)

  if (!plan) {
    console.error('[Webhook] Plan not found for payment', planId)
    return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
  }

  if (webhookPayload.planId && webhookPayload.planId !== payment.plan_id) {
    return NextResponse.json({ error: 'Plan mismatch' }, { status: 400 })
  }
  if (
    typeof webhookPayload.amount === 'number' &&
    Number(webhookPayload.amount) !== Number(payment.amount)
  ) {
    return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
  }
  if (webhookPayload.currency && webhookPayload.currency !== payment.currency) {
    return NextResponse.json({ error: 'Currency mismatch' }, { status: 400 })
  }

  const rawPayload = {
    ...(webhookPayload.payload || {}),
    provider,
    received_at: new Date().toISOString(),
  }

  const duplicateSuccess =
    payment.status === 'active' && mappedStatus === 'active'
  const finalizedNoChange =
    (payment.status === 'active' && mappedStatus !== 'refunded') ||
    payment.status === 'refunded'
  const duplicateFailure =
    (payment.status === 'failed' || payment.status === 'canceled') &&
    (mappedStatus === 'failed' || mappedStatus === 'canceled')

  if (duplicateSuccess || finalizedNoChange || duplicateFailure) {
    await supabase
      .from('payments')
      .update({
        raw_payload: rawPayload,
        error_message:
          statusKey === 'failed' ? webhookPayload.reason || null : payment.error_message,
      })
      .eq('id', payment.id)
    return NextResponse.json({ ok: true, detail: 'Payment already processed' })
  }

  const paymentUpdate: Record<string, unknown> = {
    raw_payload: rawPayload,
    error_message: mappedStatus === 'failed' ? webhookPayload.reason || null : null,
  }

  if (mappedStatus !== payment.status) {
    paymentUpdate.status = mappedStatus
  }
  if (!payment.provider_payment_id && providerPaymentId) {
    paymentUpdate.provider_payment_id = providerPaymentId
  }

  await supabase.from('payments').update(paymentUpdate).eq('id', payment.id)

  const metadata = {
    plan_id: plan.id,
    amount: payment.amount,
    currency: payment.currency,
    payment_id: payment.id,
    provider,
    provider_payment_id: payment.provider_payment_id,
    status: mappedStatus,
    reason: webhookPayload.reason,
  }

  const eventType =
    mappedStatus === 'active'
      ? 'purchase_success'
      : mappedStatus === 'refunded'
        ? 'purchase_refunded'
        : 'purchase_failed'

  if (payment.status !== mappedStatus) {
    await supabase.from('event_log').insert({
      user_id: payment.user_id,
      event_type: eventType,
      lesson_id: null,
      metadata,
    })

    queueEventSync(
      payment.user_id,
      eventType === 'purchase_success'
        ? 'snowboard.purchase.completed'
        : eventType === 'purchase_refunded'
          ? 'snowboard.purchase.refunded'
          : 'snowboard.purchase.failed',
      metadata
    )
  }

  const referenceId = providerPaymentId || payment.provider_payment_id

  if (mappedStatus === 'active' && payment.status !== 'active') {
    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_type, subscription_expires_at')
      .eq('id', payment.user_id)
      .single()

    const now = new Date()
    const currentExpiry = userProfile?.subscription_expires_at
      ? new Date(userProfile.subscription_expires_at)
      : null
    const baseDate =
      currentExpiry && currentExpiry > now ? currentExpiry : now
    const extendedExpiry =
      baseDate > now
        ? new Date(
            baseDate.getTime() + plan.days * 24 * 60 * 60 * 1000
          ).toISOString()
        : calculateExpiryDate(plan.id).toISOString()

    await supabase
      .from('users')
      .update({
        subscription_type: plan.id,
        subscription_expires_at: extendedExpiry,
        payment_status: 'active',
        last_payment_provider: provider,
        last_payment_reference: referenceId,
      })
      .eq('id', payment.user_id)
  } else if (mappedStatus === 'refunded') {
    await supabase
      .from('users')
      .update({
        payment_status: 'refunded',
        last_payment_provider: provider,
        last_payment_reference: referenceId,
      })
      .eq('id', payment.user_id)
  } else if (mappedStatus === 'failed' || mappedStatus === 'canceled') {
    await supabase
      .from('users')
      .update({
        payment_status: mappedStatus,
        last_payment_provider: provider,
        last_payment_reference: referenceId,
      })
      .eq('id', payment.user_id)
  }

  return NextResponse.json({ ok: true })
}
