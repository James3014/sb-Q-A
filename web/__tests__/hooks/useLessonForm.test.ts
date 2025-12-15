import { renderHook, act } from '@testing-library/react'
import { useLessonForm } from '@/hooks/lessons/useLessonForm'
import * as lessonService from '@/lib/lessons/services/lessonService'

// Mock the lesson service
jest.mock('@/lib/lessons/services/lessonService')

const mockCreateLesson = lessonService.createLessonWithValidation as jest.MockedFunction<typeof lessonService.createLessonWithValidation>
const mockUpdateLesson = lessonService.updateLessonWithValidation as jest.MockedFunction<typeof lessonService.updateLessonWithValidation>

describe('useLessonForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLessonForm({}))

    expect(result.current.state).toEqual({
      title: '',
      what: '',
      why: [],
      how: [{ text: '' }],
      signals: { correct: [], wrong: [] },
      level_tags: [],
      slope_tags: [],
      is_premium: false
    })
    expect(result.current.isSubmitting).toBe(false)
  })

  it('should update title', () => {
    const { result } = renderHook(() => useLessonForm({}))

    act(() => {
      result.current.setTitle('Test Lesson')
    })

    expect(result.current.state.title).toBe('Test Lesson')
  })

  it('should update what field', () => {
    const { result } = renderHook(() => useLessonForm({}))

    act(() => {
      result.current.setWhat('Learn to carve')
    })

    expect(result.current.state.what).toBe('Learn to carve')
  })

  it('should update why array', () => {
    const { result } = renderHook(() => useLessonForm({}))

    act(() => {
      result.current.setWhy(['Reason 1', 'Reason 2'])
    })

    expect(result.current.state.why).toEqual(['Reason 1', 'Reason 2'])
  })

  it('should update level tags', () => {
    const { result } = renderHook(() => useLessonForm({}))

    act(() => {
      result.current.setLevelTags(['beginner', 'intermediate'])
    })

    expect(result.current.state.level_tags).toEqual(['beginner', 'intermediate'])
  })

  it('should update slope tags', () => {
    const { result } = renderHook(() => useLessonForm({}))

    act(() => {
      result.current.setSlopeTags(['green', 'blue'])
    })

    expect(result.current.state.slope_tags).toEqual(['green', 'blue'])
  })

  it('should toggle is_premium', () => {
    const { result } = renderHook(() => useLessonForm({}))

    act(() => {
      result.current.setIsPremium(true)
    })

    expect(result.current.state.is_premium).toBe(true)

    act(() => {
      result.current.setIsPremium(false)
    })

    expect(result.current.state.is_premium).toBe(false)
  })

  it('should update steps', () => {
    const { result } = renderHook(() => useLessonForm({}))

    const newSteps = [
      { text: 'Step 1' },
      { text: 'Step 2' }
    ]

    act(() => {
      result.current.setHow(newSteps)
    })

    expect(result.current.state.how).toEqual(newSteps)
  })

  it('should update a single step', () => {
    const { result } = renderHook(() => useLessonForm({}))

    // Add multiple steps first
    act(() => {
      result.current.setHow([
        { text: 'Step 1' },
        { text: 'Step 2' }
      ])
    })

    // Update second step
    act(() => {
      result.current.updateStep(1, { text: 'Updated Step 2' })
    })

    expect(result.current.state.how[1].text).toBe('Updated Step 2')
    expect(result.current.state.how[0].text).toBe('Step 1')
  })

  it('should update signals', () => {
    const { result } = renderHook(() => useLessonForm({}))

    act(() => {
      result.current.setSignals({
        correct: ['Good posture'],
        wrong: ['Leaning back']
      })
    })

    expect(result.current.state.signals).toEqual({
      correct: ['Good posture'],
      wrong: ['Leaning back']
    })
  })

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useLessonForm({}))

    // Make changes
    act(() => {
      result.current.setTitle('Test')
      result.current.setWhat('Content')
    })

    expect(result.current.state.title).toBe('Test')

    // Reset
    act(() => {
      result.current.reset()
    })

    expect(result.current.state.title).toBe('')
    expect(result.current.state.what).toBe('')
  })

  it('should initialize with custom initial state', () => {
    const initialState = {
      title: 'Initial Title',
      what: 'Initial Content',
      is_premium: true
    }

    const { result } = renderHook(() => useLessonForm({ initialState }))

    expect(result.current.state.title).toBe('Initial Title')
    expect(result.current.state.what).toBe('Initial Content')
    expect(result.current.state.is_premium).toBe(true)
  })

  it('should call createLesson on submit for new lesson', async () => {
    const mockLesson = { id: '123', title: 'Test' }
    mockCreateLesson.mockResolvedValue(mockLesson as any)

    const onSuccess = jest.fn()
    const { result } = renderHook(() => useLessonForm({ onSuccess }))

    act(() => {
      result.current.setTitle('Test Lesson')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(mockCreateLesson).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith(mockLesson)
  })

  it('should call updateLesson on submit for existing lesson', async () => {
    const mockLesson = { id: '123', title: 'Updated' }
    mockUpdateLesson.mockResolvedValue(mockLesson as any)

    const onSuccess = jest.fn()
    const { result } = renderHook(() => useLessonForm({
      lessonId: '123',
      onSuccess
    }))

    act(() => {
      result.current.setTitle('Updated Lesson')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(mockUpdateLesson).toHaveBeenCalledWith('123', expect.any(Object))
    expect(onSuccess).toHaveBeenCalledWith(mockLesson)
  })
})
