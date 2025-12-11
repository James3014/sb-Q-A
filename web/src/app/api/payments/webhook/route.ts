import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import {
  buildRawPayload,
  mapStatus,
  shouldSkipStatusUpdate,
  updateUserForStatus,
  validatePaymentPayload,
  logPaymentEvent,
} from '@/lib/payments/webhookUtils'
import { PaymentStatus } from '@/lib/payments/types'
import { parseWebhookPayload, getProviderName } from '@/lib/payments/providers'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceRole()
  if (!supabase) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }

  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET
  const signature = req.headers.get('x-webhook-signature')
  const rawBodyText = webhookSecret ? await req.text() : null

  let rawBody: Record<string, unknown> | null = null
  try {
    rawBody = (rawBodyText ? JSON.parse(rawBodyText || '{}') : await req.json()) as Record<string, unknown> | null
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (webhookSecret) {
    if (!signature || !rawBodyText) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    const expected = createHmac('sha256', webhookSecret).update(rawBodyText).digest('hex')
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  if (!rawBody) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // 使用策略模式解析 webhook（自動判斷供應商）
  const webhookPayload = parseWebhookPayload(rawBody)
  const provider = getProviderName(rawBody)

  if (!webhookPayload) {
    return NextResponse.json({ error: 'Failed to parse webhook' }, { status: 400 })
  }

  const providerPaymentId = webhookPayload.providerPaymentId
  const paymentId = webhookPayload.paymentId
  if (!providerPaymentId && !paymentId) {
    return NextResponse.json({ error: 'Missing payment identifiers' }, { status: 400 })
  }

  const mappedStatus: PaymentStatus = mapStatus(webhookPayload.status)

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

  const validationError = validatePaymentPayload(webhookPayload, payment)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const rawPayload = buildRawPayload(webhookPayload, provider)

  if (shouldSkipStatusUpdate(payment.status, mappedStatus)) {
    await supabase
      .from('payments')
      .update({
        raw_payload: rawPayload,
        error_message:
          mappedStatus === 'failed' ? webhookPayload.reason || null : payment.error_message,
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
    await logPaymentEvent(supabase, payment.user_id, eventType, metadata)
  }

  const referenceId = providerPaymentId || payment.provider_payment_id

  if (mappedStatus === 'active' && payment.status !== 'active') {
    await updateUserForStatus(
      supabase,
      payment.user_id,
      plan.id,
      mappedStatus,
      referenceId,
      provider
    )
  } else if (mappedStatus === 'refunded' || mappedStatus === 'failed' || mappedStatus === 'canceled') {
    await updateUserForStatus(
      supabase,
      payment.user_id,
      plan.id,
      mappedStatus,
      referenceId,
      provider
    )
  }

  return NextResponse.json({ ok: true })
}
