import { describe, expect, it, beforeEach, jest } from '@jest/globals'
import {
  createLessonWithValidation,
  updateLessonWithValidation,
  publishLesson,
  unpublishLesson,
  setLessonRepository,
  resetLessonRepository,
} from '@/lib/lessons/services/lessonService'
import { ValidationError } from '@/types/lessons'

const createLessonMock = jest.fn()
const updateLessonMock = jest.fn()
const getLessonByIdMock = jest.fn()

const baseLesson = {
  id: 'lesson-1',
  title: '穩定換刃技巧',
  what: '保持穩定重心',
  why: ['建立下肢穩定性'],
  how: [{ text: '微彎膝蓋，連續換刃' }],
  signals: { correct: ['重心落在板中'], wrong: ['上半身扭轉'] },
  level_tags: ['beginner'],
  slope_tags: ['green'],
  is_premium: false,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('lessonService', () => {
  beforeAll(() => {
    setLessonRepository({
      createLesson: createLessonMock as any,
      updateLesson: updateLessonMock as any,
      getLessonById: getLessonByIdMock as any,
    })
  })

  afterAll(() => {
    resetLessonRepository()
  })

  beforeEach(() => {
    createLessonMock.mockReset()
    updateLessonMock.mockReset()
    getLessonByIdMock.mockReset()
    getLessonByIdMock.mockResolvedValue(baseLesson as any)
  })

  it('createLessonWithValidation delegates to repository when payload is valid', async () => {
    createLessonMock.mockResolvedValue(baseLesson as any)
    const result = await createLessonWithValidation({
      title: baseLesson.title,
      what: baseLesson.what,
      why: baseLesson.why,
      how: baseLesson.how,
      signals: baseLesson.signals,
      level_tags: baseLesson.level_tags,
      slope_tags: baseLesson.slope_tags,
      is_premium: baseLesson.is_premium,
    })
    expect(result).toEqual(baseLesson)
    expect(createLessonMock).toHaveBeenCalled()
  })

  it('createLessonWithValidation throws ValidationError for invalid payload', async () => {
    await expect(
      createLessonWithValidation({
        title: '短',
        what: '',
        why: [],
        how: [],
        signals: { correct: [], wrong: [] },
        level_tags: [],
        slope_tags: [],
        is_premium: true,
      } as any)
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('updateLessonWithValidation validates merged payload before updating', async () => {
    updateLessonMock.mockResolvedValue({ ...baseLesson, title: '全新課程標題' } as any)
    const result = await updateLessonWithValidation('lesson-1', { title: '全新課程標題' })
    expect(result.title).toBe('全新課程標題')
    expect(getLessonByIdMock).toHaveBeenCalledWith('lesson-1')
    expect(updateLessonMock).toHaveBeenCalledWith('lesson-1', { title: '全新課程標題' })
  })

  it('publishLesson toggles published flag via repository', async () => {
    await publishLesson('lesson-1')
    expect(updateLessonMock).toHaveBeenCalledWith('lesson-1', { is_published: true })
    await unpublishLesson('lesson-1')
    expect(updateLessonMock).toHaveBeenCalledWith('lesson-1', { is_published: false })
  })
})
