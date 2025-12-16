import { renderHook, act } from '@testing-library/react'
import { useFormActions } from '@/hooks/form/useFormActions'
import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'

describe('useFormActions', () => {
  const mockSetState = jest.fn()
  
  beforeEach(() => {
    mockSetState.mockClear()
  })

  it('should provide stable action functions', () => {
    const { result, rerender } = renderHook(() => useFormActions(mockSetState))
    
    const initialActions = {
      setTitle: result.current.setTitle,
      setWhat: result.current.setWhat,
      updateStep: result.current.updateStep,
    }
    
    rerender()
    
    expect(result.current.setTitle).toBe(initialActions.setTitle)
    expect(result.current.setWhat).toBe(initialActions.setWhat)
    expect(result.current.updateStep).toBe(initialActions.updateStep)
  })

  it('should update state through actions', () => {
    const { result } = renderHook(() => useFormActions(mockSetState))
    
    act(() => {
      result.current.setTitle('New Title')
    })
    
    expect(mockSetState).toHaveBeenCalledWith({ title: 'New Title' })
  })

  it('should handle step operations correctly', () => {
    const { result } = renderHook(() => useFormActions(mockSetState))
    
    // Test updateStep
    act(() => {
      result.current.updateStep(0, { text: 'Updated step' })
    })
    
    expect(mockSetState).toHaveBeenCalledWith(expect.any(Function))
    
    // Test addStep
    act(() => {
      result.current.addStep()
    })
    
    expect(mockSetState).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should handle array updates correctly', () => {
    const { result } = renderHook(() => useFormActions(mockSetState))
    
    act(() => {
      result.current.setWhy(['Goal 1', 'Goal 2'])
    })
    
    expect(mockSetState).toHaveBeenCalledWith({ why: ['Goal 1', 'Goal 2'] })
    
    act(() => {
      result.current.setLevelTags(['intermediate'])
    })
    
    expect(mockSetState).toHaveBeenCalledWith({ level_tags: ['intermediate'] })
  })
})
