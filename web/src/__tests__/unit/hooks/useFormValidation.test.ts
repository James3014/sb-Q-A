import { act, renderHook } from '@testing-library/react'
import { useFormValidation } from '@/hooks/lessons/useFormValidation'
import type { CreateLessonInput } from '@/types/lessons'

const buildValidInput = (): CreateLessonInput => ({
  title: 'Lesson Title',
  what: 'Focus on stability',
  why: ['Build basics'],
  how: [{ text: 'Bend knees' }],
  signals: { correct: ['Relax shoulders'], wrong: ['Locked hips'] },
  level_tags: ['beginner'],
  slope_tags: ['green'],
  is_premium: false,
})

describe('useFormValidation', () => {
  it('starts with empty errors', () => {
    const { result } = renderHook(() => useFormValidation())
    expect(result.current.errors).toEqual({})
  })

  it('validates individual fields', () => {
    const { result } = renderHook(() => useFormValidation())
    act(() => {
      result.current.validateField('title', '')
    })
    expect(result.current.errors.title).toBeDefined()

    act(() => {
      result.current.clearError('title')
    })
    expect(result.current.errors.title).toBeUndefined()
  })

  it('validates entire form data', () => {
    const { result } = renderHook(() => useFormValidation())
    const payload = buildValidInput()
    let isValid = false
    act(() => {
      isValid = result.current.validateForm(payload)
    })
    expect(isValid).toBe(true)
    expect(result.current.errors).toEqual({})
  })

  it('tracks touched fields', () => {
    const { result } = renderHook(() => useFormValidation())
    act(() => {
      result.current.touchField('title')
    })
    expect(result.current.touchedFields.has('title')).toBe(true)
  })
})
