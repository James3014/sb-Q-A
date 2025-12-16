import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'
import type { UseFormActionsReturn } from '@/hooks/form/useFormActions'
import type { UseFormStateReturn } from '@/hooks/form/useFormState'

describe('Form Types', () => {
  it('should enforce strict typing', () => {
    // Test that UseLessonFormState has all required fields
    const validState: UseLessonFormState = {
      title: 'Test',
      what: 'Test',
      why: [],
      how: [{ text: 'Test' }],
      signals: { correct: [], wrong: [] },
      level_tags: [],
      slope_tags: [],
      is_premium: false,
    }

    // TypeScript should enforce these types at compile time
    expect(typeof validState.title).toBe('string')
    expect(Array.isArray(validState.why)).toBe(true)
    expect(Array.isArray(validState.how)).toBe(true)
    expect(typeof validState.is_premium).toBe('boolean')
  })

  it('should validate runtime types', () => {
    const validateLessonFormState = (state: unknown): state is UseLessonFormState => {
      if (typeof state !== 'object' || state === null) return false
      
      const s = state as Record<string, unknown>
      
      return (
        typeof s.title === 'string' &&
        typeof s.what === 'string' &&
        Array.isArray(s.why) &&
        Array.isArray(s.how) &&
        typeof s.signals === 'object' &&
        s.signals !== null &&
        Array.isArray(s.level_tags) &&
        Array.isArray(s.slope_tags) &&
        typeof s.is_premium === 'boolean'
      )
    }

    const validState = {
      title: 'Test',
      what: 'Test',
      why: ['Goal'],
      how: [{ text: 'Step' }],
      signals: { correct: ['Signal'], wrong: [] },
      level_tags: ['intermediate'],
      slope_tags: ['blue'],
      is_premium: false,
    }

    const invalidState = {
      title: 123, // Should be string
      what: 'Test',
      why: 'Not array', // Should be array
    }

    expect(validateLessonFormState(validState)).toBe(true)
    expect(validateLessonFormState(invalidState)).toBe(false)
  })

  it('should ensure action function types', () => {
    const mockActions: UseFormActionsReturn = {
      setTitle: (title: string) => {},
      setWhat: (value: string) => {},
      setWhy: (value: string[]) => {},
      setHow: (value: any[]) => {},
      setSignals: (value: any) => {},
      setLevelTags: (value: string[]) => {},
      setSlopeTags: (value: string[]) => {},
      setIsPremium: (value: boolean) => {},
      updateStep: (index: number, step: any) => {},
      addStep: () => {},
      removeStep: (index: number) => {},
    }

    // TypeScript should enforce parameter types
    expect(typeof mockActions.setTitle).toBe('function')
    expect(typeof mockActions.setIsPremium).toBe('function')
    expect(typeof mockActions.updateStep).toBe('function')
  })

  it('should ensure form state return types', () => {
    const mockFormState: UseFormStateReturn = {
      state: {
        title: '',
        what: '',
        why: [],
        how: [{ text: '' }],
        signals: { correct: [], wrong: [] },
        level_tags: [],
        slope_tags: [],
        is_premium: false,
      },
      setState: (updates: any) => {},
      reset: () => {},
    }

    expect(typeof mockFormState.setState).toBe('function')
    expect(typeof mockFormState.reset).toBe('function')
    expect(typeof mockFormState.state).toBe('object')
  })

  it('should handle optional and required fields correctly', () => {
    // Test that optional fields can be undefined in partial state
    const partialState: Partial<UseLessonFormState> = {
      title: 'Test Title',
      // Other fields are optional in Partial<T>
    }

    expect(partialState.title).toBe('Test Title')
    expect(partialState.what).toBeUndefined()
  })
})
