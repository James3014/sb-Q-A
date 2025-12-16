import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'

const createDefaultState = (): UseLessonFormState => ({
  title: '',
  what: '',
  why: [],
  how: [{ text: '' }],
  signals: { correct: [], wrong: [] },
  level_tags: [],
  slope_tags: [],
  is_premium: false,
})

const mergeInitialState = (initial?: Partial<UseLessonFormState>): UseLessonFormState => {
  const base = createDefaultState()
  if (!initial) return base
  
  return {
    ...base,
    ...initial,
    how: initial.how && initial.how.length > 0 ? initial.how : base.how,
    signals: initial.signals ?? base.signals,
    why: initial.why ?? base.why,
    level_tags: initial.level_tags ?? base.level_tags,
    slope_tags: initial.slope_tags ?? base.slope_tags,
  }
}

export interface UseFormStateReturn {
  state: UseLessonFormState
  setState: (updates: Partial<UseLessonFormState> | ((prev: UseLessonFormState) => UseLessonFormState)) => void
  reset: () => void
}

export function useFormState(initialState?: Partial<UseLessonFormState>): UseFormStateReturn {
  const computedInitial = useMemo(() => mergeInitialState(initialState), [initialState])
  const initialRef = useRef(computedInitial)
  const [state, setStateInternal] = useState<UseLessonFormState>(computedInitial)

  // 更新初始狀態時重置表單
  useEffect(() => {
    initialRef.current = computedInitial
    setStateInternal(computedInitial)
  }, [computedInitial])

  const setState = useCallback((updates: Partial<UseLessonFormState> | ((prev: UseLessonFormState) => UseLessonFormState)) => {
    if (typeof updates === 'function') {
      setStateInternal(updates)
    } else {
      setStateInternal(prev => ({ ...prev, ...updates }))
    }
  }, [])

  const reset = useCallback(() => {
    setStateInternal(initialRef.current)
  }, [])

  return {
    state,
    setState,
    reset,
  }
}
