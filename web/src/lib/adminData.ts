import { adminGet, adminPost } from './adminApi'
import type { Lesson } from './lessons'

export interface AdminUser {
  id: string
  email: string
  subscription_type: string
  subscription_expires_at: string | null
  created_at: string
}

export interface DashboardStats {
  dau: number
  wau: number
  topLessons: { lesson_id: string; title: string; view_count: number }[]
  subscriptions: { subscription_type: string; count: number }[]
  recentFeedback: { id: string; type: string; content: string; created_at: string }[]
  topKeywords: { keyword: string; count: number }[]
  contentGaps: { keyword: string; count: number }[]
  lessonSources: { source: string; count: number }[]
}

export interface MonetizationStats {
  subscriptions: { plan: string; active_count: number; total_count: number }[]
  funnel: { pricing_views: number; plan_clicks: number; purchases: number }
  dailySubs: { date: string; count: number }[]
  totalUsers: number
}

export interface LessonStat {
  id: string
  title: string
  is_premium: boolean
  level_tags?: string[]
  views: number
  practices: number
  favorites: number
}

export interface LessonEffectiveness {
  lesson_id: string
  title: string
  avg_score: number
  samples: number
}

export interface LessonHealth {
  lesson_id: string
  scrollRate: number
  practiceRate: number
  healthScore: number
  samples: number
}

export async function fetchAdminUsers() {
  return adminGet<{ users: AdminUser[] }>('/api/admin/users')
}

export async function fetchAdminDashboard() {
  return adminGet<DashboardStats>('/api/admin/dashboard')
}

export async function fetchAdminMonetization() {
  return adminGet<MonetizationStats>('/api/admin/monetization')
}

export async function fetchAdminLessons() {
  return adminGet<{
    lessons: Lesson[]
    lessonStats: LessonStat[]
    effectiveness: LessonEffectiveness[]
    lessonHealth: LessonHealth[]
  }>('/api/admin/lessons')
}

export async function adminActivateSubscription(userId: string, planId: string) {
  return adminPost<{ ok: boolean; expiresAt: string; plan: string }>('/api/admin/subscription', {
    userId,
    planId,
  })
}
