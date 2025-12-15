'use client'

import { useCallback, useEffect, useState } from 'react'
import { LessonFormContent } from './LessonFormContent'
import { useLessonForm } from '@/hooks/lessons/useLessonForm'
import { useFormValidation } from '@/hooks/lessons/useFormValidation'
import { useImageUpload } from '@/hooks/lessons/useImageUpload'
import type { Lesson } from '@/types/lessons'
import { adminGet } from '@/lib/adminApi'
import { LESSON_API_ENDPOINTS } from '@/constants/lesson'

export interface LessonFormProps {
  lessonId?: string
  onSuccess?: () => void
}

export function LessonForm({ lessonId, onSuccess }: LessonFormProps) {
  const [initialLesson, setInitialLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(Boolean(lessonId))
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const form = useLessonForm({
    lessonId,
    initialState: initialLesson ? {
      title: initialLesson.title,
      what: initialLesson.what,
      why: initialLesson.why,
      how: initialLesson.how,
      signals: initialLesson.signals,
      level_tags: initialLesson.level_tags,
      slope_tags: initialLesson.slope_tags,
      is_premium: initialLesson.is_premium,
    } : undefined,
    onSuccess: () => {
      setStatusMessage(lessonId ? '課程已更新' : '課程建立成功')
      onSuccess?.()
    },
  })
  const validation = useFormValidation()
  const imageUpload = useImageUpload({
    lessonId,
    stepIndex: 0,
    onUploaded: url => form.updateStep(0, { image: url }),
    initialUrl: form.state.how[0]?.image ?? null,
  })

  useEffect(() => {
    if (!lessonId) return
    let canceled = false

    async function loadLesson() {
      setLoading(true)
      setError(null)
      console.log('Loading lesson:', lessonId) // 調試信息
      const data = await adminGet<{ ok: boolean; lesson: Lesson }>(`${LESSON_API_ENDPOINTS.lessons}/${lessonId}`)
      console.log('API response:', data) // 調試信息
      if (canceled) return
      if (!data || !data.ok) {
        setError('無法載入課程資料')
        console.error('Failed to load lesson:', data) // 調試信息
      } else {
        console.log('Setting initial lesson:', data.lesson) // 調試信息
        setInitialLesson(data.lesson)
      }
      setLoading(false)
    }

    loadLesson()
    return () => {
      canceled = true
    }
  }, [lessonId])

  const handleSubmit = useCallback(async () => {
    setError(null)
    setStatusMessage(null)
    const isValid = validation.validateForm({
      title: form.state.title,
      what: form.state.what,
      why: form.state.why,
      how: form.state.how,
      signals: form.state.signals,
      level_tags: form.state.level_tags,
      slope_tags: form.state.slope_tags,
      is_premium: form.state.is_premium,
    })
    if (!isValid) {
      setError('請先修正表單錯誤')
      return
    }
    try {
      await form.submit()
    } catch (err) {
      const message = err instanceof Error ? err.message : '儲存失敗'
      setError(message)
    }
  }, [form, validation])

  if (loading) {
    return <p className="text-sm text-zinc-400">載入課程資料中...</p>
  }

  return (
    <LessonFormContent
      form={form}
      validation={validation}
      image={imageUpload}
      onSubmit={handleSubmit}
      isSubmitting={form.isSubmitting}
      serverError={error}
      successMessage={statusMessage}
    />
  )
}
