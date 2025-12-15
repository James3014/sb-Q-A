import { describe, expect, it, beforeEach, jest } from '@jest/globals'
import {
  createLesson,
  getAllLessons,
  getLessonById,
  setSupabaseGetter,
  resetSupabaseGetter,
} from '@/lib/lessons/repositories/lessonRepository'
import { NotFoundError } from '@/types/lessons'

const baseLesson = {
  id: 'lesson-1',
  title: 'Lesson Title',
  what: 'Focus on balance',
  why: ['Gain confidence'],
  how: [{ text: 'Bend knees' }],
  signals: { correct: ['Relaxed shoulders'], wrong: ['Locked knees'] },
  level_tags: ['beginner'],
  slope_tags: ['green'],
  is_premium: false,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

let supabaseClientStub: any = null

describe('lessonRepository', () => {
  beforeAll(() => {
    setSupabaseGetter(() => supabaseClientStub)
  })

  afterAll(() => {
    resetSupabaseGetter()
  })

  beforeEach(() => {
    supabaseClientStub = null
  })

  it('getLessonById returns lesson', async () => {
    const builder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: baseLesson, error: null }),
    }
    supabaseClientStub = { from: jest.fn().mockReturnValue(builder) }
    const result = await getLessonById('lesson-1')
    expect(result).toEqual(baseLesson)
  })

  it('getLessonById throws NotFoundError when missing', async () => {
    const builder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
    }
    supabaseClientStub = { from: jest.fn().mockReturnValue(builder) }
    await expect(getLessonById('missing')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('getAllLessons returns lesson array', async () => {
    const response = Promise.resolve({ data: [baseLesson], error: null })
    const builder: any = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
    }
    builder.then = response.then.bind(response)
    builder.catch = response.catch.bind(response)
    supabaseClientStub = { from: jest.fn().mockReturnValue(builder) }

    const lessons = await getAllLessons({ isPublished: true })
    expect(Array.isArray(lessons)).toBe(true)
    expect(lessons[0].id).toBe('lesson-1')
  })

  it('createLesson inserts and returns row', async () => {
    const insertBuilder = {
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: baseLesson, error: null }),
    }
    const from = jest.fn().mockReturnValue({ insert: jest.fn().mockReturnValue(insertBuilder) })
    supabaseClientStub = { from } as any

    const created = await createLesson({
      title: baseLesson.title,
      what: baseLesson.what,
      why: baseLesson.why,
      how: baseLesson.how,
      signals: baseLesson.signals,
      level_tags: baseLesson.level_tags,
      slope_tags: baseLesson.slope_tags,
      is_premium: baseLesson.is_premium,
    })

    expect(created.id).toBe(baseLesson.id)
  })
})
