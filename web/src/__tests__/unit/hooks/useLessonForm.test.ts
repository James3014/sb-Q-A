import { act, renderHook } from '@testing-library/react'
import { useLessonForm } from '@/hooks/lessons/useLessonForm'
import type { Lesson } from '@/types/lessons'
import {
  createLessonWithValidation,
  updateLessonWithValidation,
} from '@/lib/lessons/services/lessonService'

jest.mock('@/lib/lessons/services/lessonService', () => ({
  createLessonWithValidation: jest.fn(),
  updateLessonWithValidation: jest.fn(),
}))

const mockedCreate = createLessonWithValidation as jest.MockedFunction<typeof createLessonWithValidation>
const mockedUpdate = updateLessonWithValidation as jest.MockedFunction<typeof updateLessonWithValidation>

const sampleLesson: Lesson = {
  id: 'lesson-1',
  title: 'Lesson Title',
  what: 'Focus on edge control',
  why: ['Build fundamentals'],
  how: [{ text: 'Bend knees' }],
  signals: { correct: ['Stable core'], wrong: ['Locked ankles'] },
  level_tags: ['beginner'],
  slope_tags: ['green'],
  is_premium: false,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('useLessonForm', () => {
  beforeEach(() => {
    mockedCreate.mockReset()
    mockedUpdate.mockReset()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useLessonForm())
    expect(result.current.state.title).toBe('')
    expect(result.current.state.how).toHaveLength(1)
  })

  it('updates title via setTitle', () => {
    const { result } = renderHook(() => useLessonForm())
    act(() => {
      result.current.setTitle('New Lesson')
    })
    expect(result.current.state.title).toBe('New Lesson')
  })

  it('adds and removes steps', () => {
    const { result } = renderHook(() => useLessonForm())
    act(() => {
      result.current.addStep()
    })
    expect(result.current.state.how).toHaveLength(2)

    act(() => {
      result.current.removeStep(1)
    })
    expect(result.current.state.how).toHaveLength(1)
  })

  it('submits new lesson data via createLessonWithValidation', async () => {
    mockedCreate.mockResolvedValue(sampleLesson)
    const { result } = renderHook(() => useLessonForm())

    act(() => {
      result.current.setTitle(sampleLesson.title)
      result.current.setWhat(sampleLesson.what)
      result.current.setWhy(sampleLesson.why)
      result.current.setSignals(sampleLesson.signals)
      result.current.updateStep(0, { text: sampleLesson.how[0].text })
      result.current.setLevelTags(sampleLesson.level_tags)
      result.current.setSlopeTags(sampleLesson.slope_tags)
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(mockedCreate).toHaveBeenCalledTimes(1)
    expect(mockedCreate.mock.calls[0][0].title).toBe(sampleLesson.title)
  })

  it('submits update when lessonId provided', async () => {
    mockedUpdate.mockResolvedValue(sampleLesson)
    const { result } = renderHook(() => useLessonForm({ lessonId: sampleLesson.id, initialState: sampleLesson }))

    act(() => {
      result.current.setTitle('Updated Title')
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(mockedUpdate).toHaveBeenCalledWith(sampleLesson.id, expect.objectContaining({ title: 'Updated Title' }))
  })

  it('resets to initial state', () => {
    const { result } = renderHook(() => useLessonForm({ initialState: sampleLesson }))

    act(() => {
      result.current.setTitle('Temp Change')
    })
    expect(result.current.state.title).toBe('Temp Change')

    act(() => {
      result.current.reset()
    })

    expect(result.current.state.title).toBe(sampleLesson.title)
  })
})
