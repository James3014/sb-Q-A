/**
 * Admin Lesson Service
 * 處理課程管理相關的 API 請求
 */

import { BaseService } from '../BaseService'

// 簡化的 Lesson 類型定義（避免循環依賴）
interface Lesson {
  id: string
  title: string
  what: string
  why: string[]
  how: Array<{ text: string; image?: string }>
  signals: { correct: string[]; wrong: string[] }
  level_tags: string[]
  slope_tags: string[]
  is_premium: boolean
}

export interface LessonStats {
  id: string
  title: string
  views: number
  practices: number
  favorites: number
  completion_rate: number
  practice_rate: number
  avg_rating: number
}

export interface EffectivenessScore {
  lesson_id: string
  score: number
  count: number
}

export interface HealthScore {
  lesson_id: string
  score: number
  completion: number
  practice: number
}

export interface AdminLessonsResponse {
  lessons: Lesson[]
  stats: LessonStats[]
  effectiveness: EffectivenessScore[]
  health: HealthScore[]
}

export class AdminLessonService extends BaseService {
  private static readonly BASE_PATH = '/api/admin/lessons'

  /**
   * 獲取所有課程及統計
   */
  static async getAll(): Promise<AdminLessonsResponse> {
    return this.get<AdminLessonsResponse>(this.BASE_PATH)
  }

  /**
   * 獲取單個課程
   */
  static async getById(id: string): Promise<Lesson> {
    return this.get<Lesson>(`/api/lessons/${id}`)
  }

  /**
   * 創建課程
   */
  static async create(data: Partial<Lesson>): Promise<Lesson> {
    return this.post<Lesson>('/api/lessons', data)
  }

  /**
   * 更新課程
   */
  static async update(id: string, data: Partial<Lesson>): Promise<Lesson> {
    return this.patch<Lesson>(`/api/lessons/${id}`, data)
  }

  /**
   * 刪除課程
   */
  static async deleteLesson(id: string): Promise<{ success: boolean }> {
    return super.delete<{ success: boolean }>(`/api/lessons/${id}`)
  }
}
