import { renderHook, act, waitFor } from '@testing-library/react'
import { useLessonEditor } from '@/hooks/lessons/useLessonEditor'
import { adminGet } from '@/lib/adminApi'
import { createLessonWithValidation, updateLessonWithValidation } from '@/lib/lessons/services/lessonService'

jest.mock('@/lib/adminApi')
jest.mock('@/lib/lessons/services/lessonService')

const mockAdminGet = adminGet as jest.MockedFunction<typeof adminGet>
const mockCreate = createLessonWithValidation as jest.MockedFunction<typeof createLessonWithValidation>
const mockUpdate = updateLessonWithValidation as jest.MockedFunction<typeof updateLessonWithValidation>

describe('useLessonEditor', () => {
  const mockLesson = {
    id: '01',
    title: 'Test Lesson',
    what: 'Test problem',
    why: ['Test goal'],
    how: [{ text: 'Test step' }],
    signals: { correct: ['Test correct'], wrong: ['Test wrong'] },
    level_tags: ['intermediate'],
    slope_tags: ['blue'],
    is_premium: false,
  }

  beforeEach(() => {
    mockAdminGet.mockClear()
    mockCreate.mockClear()
    mockUpdate.mockClear()
  })

  it('should compose all form functionality', () => {
    const { result } = renderHook(() => useLessonEditor())
    
    // 檢查所有必要的屬性和方法都存在
    expect(result.current.state).toBeDefined()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.isSubmitting).toBe(false)
    
    expect(typeof result.current.setTitle).toBe('function')
    expect(typeof result.current.setWhat).toBe('function')
    expect(typeof result.current.submit).toBe('function')
    expect(typeof result.current.reset).toBe('function')
  })

  it('should handle edit mode correctly', async () => {
    mockAdminGet.mockResolvedValue({ ok: true, lesson: mockLesson })
    
    const { result } = renderHook(() => useLessonEditor({ lessonId: '01' }))
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.state.title).toBe('Test Lesson')
    expect(result.current.state.level_tags).toEqual(['intermediate'])
  })

  it('should handle create mode correctly', () => {
    const { result } = renderHook(() => useLessonEditor())
    
    expect(result.current.loading).toBe(false)
    expect(result.current.state.title).toBe('')
    expect(result.current.state.level_tags).toEqual([])
  })

  it('should update state through actions', () => {
    const { result } = renderHook(() => useLessonEditor())
    
    act(() => {
      result.current.setTitle('New Title')
    })
    
    expect(result.current.state.title).toBe('New Title')
  })

  it('should submit create correctly', async () => {
    const mockOnSuccess = jest.fn()
    mockCreate.mockResolvedValue(mockLesson)
    
    const { result } = renderHook(() => useLessonEditor({ onSuccess: mockOnSuccess }))
    
    act(() => {
      result.current.setTitle('New Lesson')
    })
    
    await act(async () => {
      await result.current.submit()
    })
    
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New Lesson'
    }))
    expect(mockOnSuccess).toHaveBeenCalledWith(mockLesson)
  })

  it('should submit update correctly', async () => {
    mockAdminGet.mockResolvedValue({ ok: true, lesson: mockLesson })
    mockUpdate.mockResolvedValue({ ...mockLesson, title: 'Updated Title' })
    
    const { result } = renderHook(() => useLessonEditor({ lessonId: '01' }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setTitle('Updated Title')
    })
    
    await act(async () => {
      await result.current.submit()
    })
    
    expect(mockUpdate).toHaveBeenCalledWith('01', expect.objectContaining({
      title: 'Updated Title'
    }))
  })

  it('should reset to loaded lesson data', async () => {
    mockAdminGet.mockResolvedValue({ ok: true, lesson: mockLesson })
    
    const { result } = renderHook(() => useLessonEditor({ lessonId: '01' }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    act(() => {
      result.current.setTitle('Changed Title')
    })
    
    expect(result.current.state.title).toBe('Changed Title')
    
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.state.title).toBe('Test Lesson')
  })
})
