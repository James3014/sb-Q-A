import { getSupabase } from './supabase'

type EventType = 
  | 'view_lesson'
  | 'search_keyword'
  | 'search_no_result'    // 新增：搜尋無結果
  | 'pricing_view'
  | 'plan_selected'
  | 'purchase_success'
  | 'favorite_add'
  | 'favorite_remove'
  | 'practice_complete'
  | 'practice_start'      // 新增：開始練習
  | 'scroll_depth'        // 新增：滾動深度

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
