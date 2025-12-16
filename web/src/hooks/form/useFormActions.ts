import { useCallback } from 'react'
import type { LessonSignals, LessonStep, UseLessonFormState } from '@/hooks/lessons/useLessonForm'

export interface UseFormActionsReturn {
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
}

export function useFormActions(
  setState: (updates: Partial<UseLessonFormState> | ((prev: UseLessonFormState) => UseLessonFormState)) => void
): UseFormActionsReturn {
  
  const setTitle = useCallback((title: string) => {
    setState({ title })
  }, [setState])

  const setWhat = useCallback((value: string) => {
    setState({ what: value })
  }, [setState])

  const setWhy = useCallback((value: string[]) => {
    setState({ why: value })
  }, [setState])

  const setHow = useCallback((value: LessonStep[]) => {
    setState({ how: value })
  }, [setState])

  const setSignals = useCallback((value: LessonSignals) => {
    setState({ signals: value })
  }, [setState])

  const setLevelTags = useCallback((value: string[]) => {
    setState({ level_tags: value })
  }, [setState])

  const setSlopeTags = useCallback((value: string[]) => {
    setState({ slope_tags: value })
  }, [setState])

  const setIsPremium = useCallback((value: boolean) => {
    setState({ is_premium: value })
  }, [setState])

  const updateStep = useCallback((index: number, step: Partial<LessonStep>) => {
    setState(prev => {
      const next = [...prev.how]
      if (next[index]) {
        next[index] = { ...next[index], ...step }
      }
      return { ...prev, how: next }
    })
  }, [setState])

  const addStep = useCallback(() => {
    setState(prev => ({ ...prev, how: [...prev.how, { text: '' }] }))
  }, [setState])

  const removeStep = useCallback((index: number) => {
    setState(prev => {
      if (prev.how.length <= 1) return prev
      const next = prev.how.filter((_, i) => i !== index)
      return { ...prev, how: next }
    })
  }, [setState])

  return {
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
  }
}
