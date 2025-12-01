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

  // 防呆：限制 metadata 大小，避免濫用
  const safeMetadata = (() => {
    if (!metadata) return {}
    try {
      const raw = JSON.stringify(metadata)
      if (raw.length > 4000) {
        return { truncated: true }
      }
      return metadata
    } catch {
      return {}
    }
  })()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('event_log').insert({
      user_id: user?.id || null,
      event_type: eventType,
      lesson_id: lessonId || null,
      metadata: safeMetadata,
    })
  } catch (e) {
    console.error('[trackEvent]', e)
  }
}
