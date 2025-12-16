import { renderHook, act } from '@testing-library/react'
import { useLessonForm } from '@/hooks/lessons/useLessonForm'
import type { Lesson } from '@/types/lessons'

// Mock the lesson service
jest.mock('@/lib/lessons/services/lessonService', () => ({
  createLessonWithValidation: jest.fn(),
  updateLessonWithValidation: jest.fn(),
}))

describe('useLessonForm useCallback dependencies', () => {
  const mockLesson: Lesson = {
    id: '01',
    title: 'Test Lesson',
    what: 'Test problem',
    why: ['Test goal'],
    how: [{ text: 'Test step' }],
    signals: { correct: ['Test correct'], wrong: ['Test wrong'] },
    level_tags: ['intermediate'],
    slope_tags: ['blue'],
    is_premium: false,
    casi: {
      Primary_Skill: 'Test skill',
      Core_Competency: 'Test competency'
    }
  }

  it('should not throw React Error #310 on state updates', () => {
    // 這個測試會失敗，因為當前的 useCallback 依賴有問題
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    const { result } = renderHook(() => useLessonForm({
      lessonId: '01',
      initialState: {
        title: mockLesson.title,
        what: mockLesson.what,
        why: mockLesson.why,
        how: mockLesson.how,
        signals: mockLesson.signals,
        level_tags: mockLesson.level_tags,
        slope_tags: mockLesson.slope_tags,
        is_premium: mockLesson.is_premium,
      }
    }))

    // 模擬狀態更新，這應該不會觸發 React Error #310
    act(() => {
      result.current.setTitle('Updated Title')
    })

    // 檢查是否有 React Error #310
    const reactErrors = consoleSpy.mock.calls.filter(call => 
      call[0]?.includes?.('Minified React error #310') ||
      call[0]?.includes?.('useCallback')
    )

    expect(reactErrors).toHaveLength(0)
    
    consoleSpy.mockRestore()
  })

  it('should maintain latest state in submit function', () => {
    const { result } = renderHook(() => useLessonForm({
      lessonId: '01'
    }))

    // 更新狀態
    act(() => {
      result.current.setTitle('Latest Title')
      result.current.setWhat('Latest Problem')
    })

    // submit 函數應該能夠存取到最新的狀態
    // 這個測試會失敗，因為當前有 stale closure 問題
    expect(result.current.state.title).toBe('Latest Title')
    expect(result.current.state.what).toBe('Latest Problem')
  })

  it('should have stable callback references', () => {
    const { result, rerender } = renderHook(() => useLessonForm())

    const initialCallbacks = {
      setTitle: result.current.setTitle,
      setWhat: result.current.setWhat,
      submit: result.current.submit,
    }

    // 重新渲染不應該改變 callback 引用
    rerender()

    expect(result.current.setTitle).toBe(initialCallbacks.setTitle)
    expect(result.current.setWhat).toBe(initialCallbacks.setWhat)
    expect(result.current.submit).toBe(initialCallbacks.submit)
  })
})
