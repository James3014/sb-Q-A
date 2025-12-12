import { getSupabase } from './supabase'
import { queueEventSync } from './userCoreSync'

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
  | 'referral_click'      // 新增：推廣點擊

// 映射單板教學事件到 user-core 事件類型
const EVENT_TYPE_MAPPING: Record<EventType, string> = {
  'view_lesson': 'snowboard.lesson.viewed',
  'search_keyword': 'snowboard.search.performed',
  'search_no_result': 'snowboard.search.no_result',
  'pricing_view': 'snowboard.pricing.viewed',
  'plan_selected': 'snowboard.plan.selected',
  'purchase_success': 'snowboard.purchase.completed',
  'favorite_add': 'snowboard.favorite.added',
  'favorite_remove': 'snowboard.favorite.removed',
  'practice_complete': 'snowboard.practice.completed',
  'practice_start': 'snowboard.practice.started',
  'scroll_depth': 'snowboard.content.scrolled',
  'referral_click': 'snowboard.referral.clicked',
}

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
    
    // 1. 寫入 Supabase（保持現有邏輯）
    await supabase.from('event_log').insert({
      user_id: user?.id || null,
      event_type: eventType,
      lesson_id: lessonId || null,
      metadata: safeMetadata,
    })

    // 2. 同步到 user-core（非阻塞，批次處理）
    if (user?.id) {
      const userCoreEventType = EVENT_TYPE_MAPPING[eventType] || `snowboard.${eventType}`
      
      queueEventSync(user.id, userCoreEventType, {
        lesson_id: lessonId,
        ...safeMetadata,
        original_event_type: eventType, // 保留原始事件類型
      })
    }
  } catch (e) {
    console.error('[trackEvent]', e)
  }
}
