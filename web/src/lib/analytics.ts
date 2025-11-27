import { getSupabase } from './supabase'

type EventType = 
  | 'view_lesson'
  | 'search_keyword'
  | 'pricing_view'
  | 'plan_selected'      // 新增：選擇方案
  | 'purchase_success'   // 新增：購買成功
  | 'favorite_add'
  | 'favorite_remove'
  | 'practice_complete'

export async function trackEvent(
  eventType: EventType,
  lessonId?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = getSupabase()
  if (!supabase) return

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('event_log').insert({
      user_id: user?.id || null,
      event_type: eventType,
      lesson_id: lessonId || null,
      metadata: metadata || {},
    })
  } catch (e) {
    console.error('[trackEvent]', e)
  }
}
