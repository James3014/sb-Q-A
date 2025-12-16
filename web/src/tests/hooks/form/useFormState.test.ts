import { renderHook, act } from '@testing-library/react'
import { useFormState } from '@/hooks/form/useFormState'
import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'

describe('useFormState', () => {
  const defaultState: UseLessonFormState = {
    title: '',
    what: '',
    why: [],
    how: [{ text: '' }],
    signals: { correct: [], wrong: [] },
    level_tags: [],
    slope_tags: [],
    is_premium: false,
  }

  const initialState: Partial<UseLessonFormState> = {
    title: 'Test Title',
    what: 'Test Problem',
    level_tags: ['intermediate'],
  }

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFormState())
    
    expect(result.current.state).toEqual(defaultState)
  })

  it('should initialize with provided initial state', () => {
    const { result } = renderHook(() => useFormState(initialState))
    
    expect(result.current.state.title).toBe('Test Title')
    expect(result.current.state.what).toBe('Test Problem')
    expect(result.current.state.level_tags).toEqual(['intermediate'])
  })

  it('should update state correctly', () => {
    const { result } = renderHook(() => useFormState())
    
    act(() => {
      result.current.setState({ title: 'Updated Title' })
    })
    
    expect(result.current.state.title).toBe('Updated Title')
  })

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useFormState(initialState))
    
    act(() => {
      result.current.setState({ title: 'Changed Title' })
    })
    
    expect(result.current.state.title).toBe('Changed Title')
    
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.state.title).toBe('Test Title')
  })

  it('should update initial state when provided', () => {
    const { result, rerender } = renderHook(
      ({ initial }) => useFormState(initial),
      { initialProps: { initial: initialState } }
    )
    
    expect(result.current.state.title).toBe('Test Title')
    
    const newInitial = { title: 'New Title', what: 'New Problem' }
    rerender({ initial: newInitial })
    
    expect(result.current.state.title).toBe('New Title')
  })
})
