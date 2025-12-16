import { useEffect, useState } from 'react'
import { adminGet } from '@/lib/adminApi'
import { LESSON_API_ENDPOINTS } from '@/constants/lesson'
import type { Lesson } from '@/types/lessons'

export interface UseLessonLoaderReturn {
  lesson: Lesson | null
  loading: boolean
  error: string | null
  reload: () => void
}

export function useLessonLoader(lessonId?: string): UseLessonLoaderReturn {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(Boolean(lessonId))
  const [error, setError] = useState<string | null>(null)

  const loadLesson = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await adminGet<{ ok: boolean; lesson: Lesson }>(`${LESSON_API_ENDPOINTS.lessons}/${id}`)
      
      if (!data || !data.ok) {
        setError('無法載入課程資料')
        setLesson(null)
      } else {
        setLesson(data.lesson)
        setError(null)
      }
    } catch (err) {
      setError('載入課程時發生錯誤')
      setLesson(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!lessonId) {
      setLesson(null)
      setLoading(false)
      setError(null)
      return
    }

    let canceled = false
    
    loadLesson(lessonId).then(() => {
      if (canceled) return
    })

    return () => {
      canceled = true
    }
  }, [lessonId])

  const reload = () => {
    if (lessonId) {
      loadLesson(lessonId)
    }
  }

  return {
    lesson,
    loading,
    error,
    reload,
  }
}
