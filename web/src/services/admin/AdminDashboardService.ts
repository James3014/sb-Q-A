/**
 * Admin Dashboard Service
 * 處理儀表盤相關的 API 請求
 */

import { BaseService } from '../BaseService'

export interface DashboardStats {
  dau: number
  wau: number
  subscriptions: {
    free: number
    pro_7: number
    pro_30: number
    pro_yearly: number
  }
  insights: string[]
}

export interface TopLesson {
  id: string
  title: string
  views: number
  practices: number
  favorites: number
}

export interface SearchKeyword {
  keyword: string
  count: number
}

export interface ContentGap {
  keyword: string
  count: number
  suggested_content?: string
}

export interface SourceAnalysis {
  source: string
  count: number
  percentage: number
}

export interface FeedbackItem {
  id: string
  type: 'bug' | 'feature' | 'lesson'
  title: string
  description: string
  created_at: string
  user_email?: string
}

export interface DashboardData {
  stats: DashboardStats
  topLessons: TopLesson[]
  topSearches: SearchKeyword[]
  contentGaps: ContentGap[]
  sourceAnalysis: SourceAnalysis[]
  recentFeedback: FeedbackItem[]
}

export class AdminDashboardService extends BaseService {
  private static readonly BASE_PATH = '/api/admin/dashboard'

  /**
   * 獲取儀表盤完整數據
   */
  static async getDashboardData(): Promise<DashboardData> {
    return this.get<DashboardData>(this.BASE_PATH)
  }

  /**
   * 獲取統計數據
   */
  static async getStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>(`${this.BASE_PATH}/stats`)
  }

  /**
   * 獲取熱門課程
   */
  static async getTopLessons(limit = 10): Promise<TopLesson[]> {
    return this.get<TopLesson[]>(`${this.BASE_PATH}/top-lessons?limit=${limit}`)
  }

  /**
   * 獲取熱門搜尋
   */
  static async getTopSearches(limit = 20): Promise<SearchKeyword[]> {
    return this.get<SearchKeyword[]>(`${this.BASE_PATH}/top-searches?limit=${limit}`)
  }

  /**
   * 獲取內容缺口
   */
  static async getContentGaps(limit = 10): Promise<ContentGap[]> {
    return this.get<ContentGap[]>(`${this.BASE_PATH}/content-gaps?limit=${limit}`)
  }

  /**
   * 獲取來源分析
   */
  static async getSourceAnalysis(): Promise<SourceAnalysis[]> {
    return this.get<SourceAnalysis[]>(`${this.BASE_PATH}/source-analysis`)
  }

  /**
   * 獲取最近回報
   */
  static async getRecentFeedback(limit = 10): Promise<FeedbackItem[]> {
    return this.get<FeedbackItem[]>(`${this.BASE_PATH}/feedback?limit=${limit}`)
  }
}
