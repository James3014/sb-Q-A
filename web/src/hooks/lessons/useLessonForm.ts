import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CreateLessonInput, Lesson, LessonSignals, LessonStep } from '@/types/lessons'
import { createLessonWithValidation, updateLessonWithValidation } from '@/lib/lessons/services/lessonService'

export interface UseLessonFormState extends CreateLessonInput {
  signals: LessonSignals
  how: LessonStep[]
}

export interface UseLessonFormOptions {
  lessonId?: string
  initialState?: Partial<UseLessonFormState>
  onSuccess?: (lesson: Lesson) => void
}

export interface UseLessonFormReturn {
  state: UseLessonFormState
  isSubmitting: boolean
  setTitle: (title: string) => void
  setWhat: (value: string) => void
  setWhy: (value: string[]) => void
  setHow: (value: LessonStep[]) => void
  setSignals: (value: LessonSignals) => void
  setLevelTags: (value: string[]) => void
  setSlopeTags: (value: string[]) => void
  setIsPremium: (value: boolean) => void
  updateStep: (index: number, step: Partial<LessonStep>) => void
  addStep: () => void
  removeStep: (index: number) => void
  reset: () => void
  submit: () => Promise<Lesson>
}

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
  if (!initial) {
    return base
  }
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

export function useLessonForm(options: UseLessonFormOptions = {}): UseLessonFormReturn {
  const { lessonId, initialState, onSuccess } = options
  const computedInitial = useMemo(() => mergeInitialState(initialState), [initialState])
  const initialRef = useRef(computedInitial)
  const [state, setState] = useState<UseLessonFormState>(computedInitial)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 使用 ref 來避免 stale closure 問題
  const stateRef = useRef(state)
  const onSuccessRef = useRef(onSuccess)

  // 保持 refs 同步
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    console.log('useLessonForm: initialState changed:', initialState)
    initialRef.current = computedInitial
    setState(computedInitial)
    console.log('useLessonForm: state updated:', computedInitial)
  }, [computedInitial])

  const setTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, title }))
  }, [])

  const setWhat = useCallback((value: string) => {
    setState(prev => ({ ...prev, what: value }))
  }, [])

  const setWhy = useCallback((value: string[]) => {
    setState(prev => ({ ...prev, why: value }))
  }, [])

  const setHow = useCallback((value: LessonStep[]) => {
    setState(prev => ({ ...prev, how: value }))
  }, [])

  const setSignals = useCallback((value: LessonSignals) => {
    setState(prev => ({ ...prev, signals: value }))
  }, [])

  const setLevelTags = useCallback((value: string[]) => {
    setState(prev => ({ ...prev, level_tags: value }))
  }, [])

  const setSlopeTags = useCallback((value: string[]) => {
    setState(prev => ({ ...prev, slope_tags: value }))
  }, [])

  const setIsPremium = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, is_premium: value }))
  }, [])

  const updateStep = useCallback((index: number, step: Partial<LessonStep>) => {
    setState(prev => {
      const next = [...prev.how]
      if (next[index]) {
        next[index] = { ...next[index], ...step }
      }
      return { ...prev, how: next }
    })
  }, [])

  const addStep = useCallback(() => {
    setState(prev => ({ ...prev, how: [...prev.how, { text: '' }] }))
  }, [])

  const removeStep = useCallback((index: number) => {
    setState(prev => {
      if (prev.how.length <= 1) {
        return prev
      }
      const next = prev.how.filter((_, i) => i !== index)
      return { ...prev, how: next }
    })
  }, [])

  const reset = useCallback(() => {
    setState(initialRef.current)
  }, [])

  const buildPayload = useCallback((current: UseLessonFormState): CreateLessonInput => ({
    title: current.title,
    what: current.what,
    why: current.why,
    how: current.how,
    signals: current.signals,
    level_tags: current.level_tags,
    slope_tags: current.slope_tags,
    is_premium: current.is_premium,
  }), [])

  const submit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      // 使用 stateRef.current 避免 stale closure
      const payload = buildPayload(stateRef.current)
      const lesson = lessonId
        ? await updateLessonWithValidation(lessonId, payload)
        : await createLessonWithValidation(payload)
      onSuccessRef.current?.(lesson)
      return lesson
    } finally {
      setIsSubmitting(false)
    }
  }, [lessonId, buildPayload])

  return {
    state,
    isSubmitting,
    setTitle,
    setWhat,
    setWhy,
    setHow,
    setSignals,
    setLevelTags,
    setSlopeTags,
    setIsPremium,
    updateStep,
    addStep,
    removeStep,
    reset,
    submit,
  }
}
