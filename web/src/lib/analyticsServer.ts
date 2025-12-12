import { SupabaseClient } from '@supabase/supabase-js'
import { queueEventSync } from './userCoreSync'

type PurchaseEvent =
  | 'purchase_initiated'
  | 'purchase_success'
  | 'purchase_failed'
  | 'purchase_refunded'

export async function recordPurchaseEvent(
  supabase: SupabaseClient,
  userId: string,
  eventType: PurchaseEvent,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('event_log').insert({
      user_id: userId,
      event_type: eventType,
      lesson_id: null,
      metadata,
    })
  } catch (error) {
    console.error('[Analytics] failed to insert event_log', eventType, error)
  }

  const mapped =
    eventType === 'purchase_initiated'
      ? 'snowboard.purchase.initiated'
      : eventType === 'purchase_success'
        ? 'snowboard.purchase.completed'
        : eventType === 'purchase_refunded'
          ? 'snowboard.purchase.refunded'
          : 'snowboard.purchase.failed'

  queueEventSync(userId, mapped, metadata)
}

export async function recordTrialActivation(
  supabase: SupabaseClient,
  userId: string,
  metadata: Record<string, unknown>
) {
  try {
    await supabase.from('event_log').insert({
      user_id: userId,
      event_type: 'trial_redeemed',
      metadata,
    })
  } catch (error) {
    console.error('[Analytics] failed to record trial event', error)
  }

  queueEventSync(userId, 'snowboard.trial.redeemed', metadata)
}
