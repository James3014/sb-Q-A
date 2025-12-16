import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFormState } from '@/hooks/form/useFormState'
import { useFormActions } from '@/hooks/form/useFormActions'
import { useLessonLoader } from '@/hooks/lessons/useLessonLoader'
import { createLessonWithValidation, updateLessonWithValidation } from '@/lib/lessons/services/lessonService'
import { levelTagToDisplay, slopeTagToDisplay, levelTagToDb, slopeTagToDb } from '@/constants/lesson'
import type { Lesson, CreateLessonInput } from '@/types/lessons'
import type { UseLessonFormState, UseLessonFormOptions, UseLessonFormReturn } from '@/hooks/lessons/useLessonForm'

export function useLessonEditor(options: UseLessonFormOptions = {}): UseLessonFormReturn {
  const { lessonId, onSuccess } = options
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 載入課程資料
  const { lesson, loading, error } = useLessonLoader(lessonId)
  
  // 準備初始狀態（將英文 tag 轉換為中文顯示）
  const initialState = useMemo(() => {
    if (!lesson) return undefined

    return {
      title: lesson.title,
      what: lesson.what,
      why: lesson.why || [],
      how: lesson.how || [{ text: '' }],
      signals: lesson.signals || { correct: [], wrong: [] },
      level_tags: (lesson.level_tags || []).map(levelTagToDisplay),
      slope_tags: (lesson.slope_tags || []).map(slopeTagToDisplay),
      is_premium: lesson.is_premium || false,
    }
  }, [lesson])
  
  // 表單狀態管理
  const { state, setState, reset } = useFormState(initialState)
  
  // 表單動作函數
  const actions = useFormActions(setState)
  
  // 使用 ref 避免 stale closure
  const stateRef = useRef(state)
  const onSuccessRef = useRef(onSuccess)
  
  useEffect(() => {
    stateRef.current = state
  }, [state])
  
  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])
  
  // 建立 payload（將中文 tag 轉換為英文儲存）
  const buildPayload = useCallback((current: UseLessonFormState): CreateLessonInput => ({
    title: current.title,
    what: current.what,
    why: current.why,
    how: current.how,
    signals: current.signals,
    level_tags: current.level_tags.map(levelTagToDb),
    slope_tags: current.slope_tags.map(slopeTagToDb),
    is_premium: current.is_premium,
  }), [])
  
  // 提交表單
  const submit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const payload = buildPayload(stateRef.current)
      const result = lessonId
        ? await updateLessonWithValidation(lessonId, payload)
        : await createLessonWithValidation(payload)
      
      onSuccessRef.current?.(result)
      return result
    } finally {
      setIsSubmitting(false)
    }
  }, [lessonId, buildPayload])
  
  return {
    // 狀態
    state,
    isSubmitting: isSubmitting || loading,
    
    // 動作函數
    ...actions,
    reset,
    submit,
  }
}
