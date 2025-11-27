import { getSupabase } from './supabase'

type EventType = 
  | 'view_lesson'
  | 'search_keyword'
  | 'pricing_view'
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
    // 靜默失敗，不影響用戶體驗
    console.error('[trackEvent]', e)
  }
}
