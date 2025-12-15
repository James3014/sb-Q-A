/**
 * useAdminLessons Hook
 * 課程管理數據加載和操作
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { fetchAdminLessons, LessonStat, LessonEffectiveness, LessonHealth } from '@/lib/adminData'
import { adminDelete } from '@/lib/adminApi'
import { Lesson } from '@/lib/lessons'
import { LESSON_API_ENDPOINTS } from '@/constants/lesson'
import { logger } from '@/lib/logging'

export interface AdminLessonsData {
  lessonStats: LessonStat[]
  lessons: Lesson[]
  effectiveness: LessonEffectiveness[]
  health: LessonHealth[]
}

export interface UseAdminLessonsReturn {
  // 數據
  data: AdminLessonsData
  loading: boolean
  error: string | null

  // 派生數據
  visibleLessons: Lesson[]

  // 操作
  actions: {
    refresh: () => Promise<void>
    deleteLesson: (id: string) => Promise<void>
  }

  // 操作狀態
  actionLoading: boolean
  actionError: string | null
}

/**
 * 課程管理 Hook
 */
export function useAdminLessons(): UseAdminLessonsReturn {
  const { isReady } = useAdminAuth()

  // 數據狀態
  const [data, setData] = useState<AdminLessonsData>({
    lessonStats: [],
    lessons: [],
    effectiveness: [],
    health: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 操作狀態
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  /**
   * 載入課程數據
   */
  const loadData = useCallback(async () => {
    if (!isReady) return

    try {
      setLoading(true)
      setError(null)

      logger.info('useAdminLessons: Loading lessons data')

      const body = await fetchAdminLessons()

      if (body) {
        setData({
          lessonStats: body.lessonStats || [],
          lessons: body.lessons || [],
          effectiveness: body.effectiveness || [],
          health: body.lessonHealth || []
        })
        logger.info('useAdminLessons: Lessons loaded successfully', {
          stats: body.lessonStats?.length,
          lessons: body.lessons?.length
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load lessons'
      setError(message)
      logger.error('useAdminLessons: Failed to load lessons', err as Error)
    } finally {
      setLoading(false)
    }
  }, [isReady])

  /**
   * 刪除課程
   */
  const deleteLesson = useCallback(
    async (id: string): Promise<void> => {
      if (!window.confirm('確定要刪除此課程嗎？此動作不可逆。')) {
        return
      }

      try {
        setActionError(null)
        setActionLoading(true)

        logger.info('useAdminLessons: Deleting lesson', { id })

        const result = await adminDelete<{ ok: boolean }>(
          `${LESSON_API_ENDPOINTS.lessons}/${id}`
        )

        if (!result?.ok) {
          throw new Error('Delete failed')
        }

        // 樂觀更新
        setData(prev => ({
          ...prev,
          lessons: prev.lessons.filter(lesson => lesson.id !== id)
        }))

        // 重新載入統計數據
        await loadData()

        logger.info('useAdminLessons: Lesson deleted successfully', { id })
      } catch (err) {
        const message = '刪除失敗，請稍後再試。'
        setActionError(message)
        logger.error('useAdminLessons: Failed to delete lesson', err as Error, {
          id
        })
      } finally {
        setActionLoading(false)
      }
    },
    [loadData]
  )

  /**
   * 派生數據: 可見課程 (排除已刪除)
   */
  const visibleLessons = useMemo(
    () => data.lessons.filter(lesson => !lesson.deleted_at),
    [data.lessons]
  )

  /**
   * 自動載入
   */
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    visibleLessons,
    actions: {
      refresh: loadData,
      deleteLesson
    },
    actionLoading,
    actionError
  }
}
