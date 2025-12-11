/**
 * Admin 模組 - 後台管理功能
 *
 * 結構：
 * - dashboardStats: 儀表板統計、回饋
 * - lessonStats: 課程分析、有效度、健康度
 * - userManagement: 用戶搜尋、訂閱管理
 * - contentAnalysis: 內容缺口、來源分析
 */

import { getSupabase } from '../supabase'

// 認證檢查（保留在主檔案，因為最常用）
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return data?.is_admin === true
}

// 從子模組重新匯出
export { getDashboardStats, getAllFeedback } from './dashboardStats'
export { getLessonStats, getLessonEffectiveness, getLessonHealth } from './lessonStats'
export { searchUsers, grantSubscription, getUserSubscriptions } from './userManagement'
export { getContentGaps, getLessonSources } from './contentAnalysis'
