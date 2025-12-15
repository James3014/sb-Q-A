/**
 * Admin Types
 * 後台管理相關的類型定義
 *
 * 這個文件統一了後台相關的類型定義，避免分散在各個文件中
 */

/**
 * ==================
 * 用戶相關
 * ==================
 */

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  subscription_type: 'free' | 'pro'
  subscription_expires_at: string | null
  created_at: string
}

/**
 * ==================
 * 儀表板統計
 * ==================
 */

export interface DashboardStats {
  totalUsers: number
  proUsers: number
  freeUsers: number
  totalLessons: number
  totalViews: number
  totalPractices: number
  totalFavorites: number
  recentActivity: ActivityLog[]
}

export interface ActivityLog {
  type: 'view' | 'practice' | 'favorite' | 'signup'
  lesson_title?: string
  user_email?: string
  timestamp: string
}

/**
 * ==================
 * 課程統計
 * ==================
 */

export interface LessonStat {
  lesson_id: string
  title: string
  level_tags: string[]
  is_premium: boolean
  views: number
  practices: number
  favorites: number
  avg_score: number | null
}

export interface LessonEffectiveness {
  lesson_id: string
  title: string
  avg_score: number
  samples: number
}

export interface LessonHealth {
  lesson_id: string
  healthScore: number
  scrollRate: number
  practiceRate: number
  samples: number
}

export interface AdminLessonsData {
  lessons: any[] // Lesson 類型
  lessonStats: LessonStat[]
  effectiveness: LessonEffectiveness[]
  health: LessonHealth[]
}

/**
 * ==================
 * 計算相關
 * ==================
 */

export interface EffectivenessScore {
  score: number
  count: number
  reason?: string
}

export interface HealthScore {
  healthScore: number
  scrollRate: number
  practiceRate: number
}

/**
 * ==================
 * 營收統計
 * ==================
 */

export interface MonetizationStats {
  // 付款記錄
  payments: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }

  // 訂閱統計
  subscriptions: {
    active: number
    trial: number
    expired: number
    conversionRate: number
  }

  // 優惠券使用
  coupons: {
    used: number
    active: number
    totalDiscount: number
  }

  // 收入分析
  revenue: {
    total: number
    thisMonth: number
    avgOrderValue: number
    topCoupons: Array<{
      code: string
      usage: number
      revenue: number
    }>
  }
}

/**
 * ==================
 * 分潤相關
 * ==================
 */

export interface Commission {
  id: string
  affiliate_id: string
  partner_name: string
  user_id: string
  user_email: string
  order_amount: number
  commission_amount: number
  commission_rate: number
  status: 'pending' | 'paid' | 'cancelled'
  created_at: string
  paid_at: string | null
}

/**
 * ==================
 * 工具類型
 * ==================
 */

/**
 * 分頁配置
 */
export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
}

/**
 * 排序配置
 */
export interface SortConfig {
  field: string
  order: 'asc' | 'desc'
}

/**
 * 篩選配置 (泛型)
 */
export type FilterConfig = Record<string, any>

/**
 * API 響應基礎類型
 */
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  ok: boolean
}

/**
 * ==================
 * Hook 返回類型標準
 * ==================
 */

/**
 * 標準 Hook 返回格式
 * 所有自定義 Hook 應遵循此格式
 *
 * @see docs/HOOK_STANDARDS.md
 */
export interface StandardHookReturn<T, State = any, Actions = any, Stats = any> {
  /**
   * 主要數據
   */
  data: T

  /**
   * 加載狀態
   */
  loading: boolean

  /**
   * 錯誤信息
   */
  error: string | Error | null

  /**
   * UI 狀態（可選）
   */
  state?: State

  /**
   * 操作方法
   */
  actions: Actions

  /**
   * 派生統計（可選）
   */
  stats?: Stats
}

/**
 * ==================
 * 表單相關
 * ==================
 */

/**
 * 表單驗證錯誤
 */
export interface AdminValidationError {
  field: string
  message: string
}

/**
 * 表單提交狀態
 */
export interface FormSubmitState {
  isSubmitting: boolean
  isSuccess: boolean
  error: string | null
}
