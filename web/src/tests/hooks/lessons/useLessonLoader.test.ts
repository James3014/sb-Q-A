import { renderHook, waitFor } from '@testing-library/react'
import { useLessonLoader } from '@/hooks/lessons/useLessonLoader'
import { adminGet } from '@/lib/adminApi'

jest.mock('@/lib/adminApi')
const mockAdminGet = adminGet as jest.MockedFunction<typeof adminGet>

describe('useLessonLoader', () => {
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
  })

  it('should not load when no lessonId provided', () => {
    const { result } = renderHook(() => useLessonLoader())
    
    expect(result.current.loading).toBe(false)
    expect(result.current.lesson).toBe(null)
    expect(result.current.error).toBe(null)
    expect(mockAdminGet).not.toHaveBeenCalled()
  })

  it('should load lesson data correctly', async () => {
    mockAdminGet.mockResolvedValue({ ok: true, lesson: mockLesson })
    
    const { result } = renderHook(() => useLessonLoader('01'))
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.lesson).toEqual(mockLesson)
    expect(result.current.error).toBe(null)
    expect(mockAdminGet).toHaveBeenCalledWith('/api/admin/lessons/01')
  })

  it('should handle loading states', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise(resolve => { resolvePromise = resolve })
    mockAdminGet.mockReturnValue(promise)
    
    const { result } = renderHook(() => useLessonLoader('01'))
    
    expect(result.current.loading).toBe(true)
    expect(result.current.lesson).toBe(null)
    
    resolvePromise!({ ok: true, lesson: mockLesson })
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.lesson).toEqual(mockLesson)
  })

  it('should handle errors gracefully', async () => {
    mockAdminGet.mockResolvedValue({ ok: false })
    
    const { result } = renderHook(() => useLessonLoader('01'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.lesson).toBe(null)
    expect(result.current.error).toBe('無法載入課程資料')
  })

  it('should handle API errors', async () => {
    mockAdminGet.mockRejectedValue(new Error('Network error'))
    
    const { result } = renderHook(() => useLessonLoader('01'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.lesson).toBe(null)
    expect(result.current.error).toBe('載入課程時發生錯誤')
  })

  it('should reload when lessonId changes', async () => {
    mockAdminGet.mockResolvedValue({ ok: true, lesson: mockLesson })
    
    const { result, rerender } = renderHook(
      ({ lessonId }) => useLessonLoader(lessonId),
      { initialProps: { lessonId: '01' } }
    )
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(mockAdminGet).toHaveBeenCalledTimes(1)
    
    rerender({ lessonId: '02' })
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(mockAdminGet).toHaveBeenCalledTimes(2)
    expect(mockAdminGet).toHaveBeenLastCalledWith('/api/admin/lessons/02')
  })
})
