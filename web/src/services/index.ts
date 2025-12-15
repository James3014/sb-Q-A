/**
 * Services 統一導出
 */

// Base
export { BaseService } from './BaseService'
export type { RequestOptions } from './BaseService'

// Admin Services
export { AdminDashboardService } from './admin/AdminDashboardService'
export { AdminLessonService } from './admin/AdminLessonService'
export { AdminUserService } from './admin/AdminUserService'

// Types
export type {
  DashboardData,
  DashboardStats,
  TopLesson,
  SearchKeyword,
  ContentGap,
  SourceAnalysis,
  FeedbackItem
} from './admin/AdminDashboardService'

export type {
  LessonStats,
  EffectivenessScore,
  HealthScore,
  AdminLessonsResponse
} from './admin/AdminLessonService'

export type {
  AdminUser,
  ActivateSubscriptionPayload
} from './admin/AdminUserService'
