import { NextResponse } from 'next/server'
import { PATCH } from '@/app/api/admin/lessons/[id]/route'
import { authorizeAdmin } from '@/lib/adminGuard'
import { updateLessonWithValidation } from '@/lib/lessons/services/lessonService'
import type { Lesson } from '@/types/lessons'
import { ValidationError, NotFoundError } from '@/types/lessons'

jest.mock('@/lib/adminGuard', () => ({ authorizeAdmin: jest.fn() }))
jest.mock('@/lib/lessons/services/lessonService', () => ({
  updateLessonWithValidation: jest.fn(),
}))

const mockAuthorize = authorizeAdmin as jest.MockedFunction<typeof authorizeAdmin>
const mockUpdate = updateLessonWithValidation as jest.MockedFunction<typeof updateLessonWithValidation>

const lesson: Lesson = {
  id: 'lesson-1',
  title: 'Updated',
  what: 'focus',
  why: ['reason'],
  how: [{ text: 'step' }],
  signals: { correct: ['good'], wrong: ['bad'] },
  level_tags: ['beginner'],
  slope_tags: ['green'],
  is_premium: false,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const createRequest = (body: unknown) => ({
  json: jest.fn().mockResolvedValue(body),
  headers: new Headers({ authorization: 'Bearer token' }),
}) as unknown as Request

describe('PATCH /api/admin/lessons/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates lesson successfully', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockUpdate.mockResolvedValue(lesson)

    const res = await PATCH(createRequest({ title: 'Updated' }) as any, { params: { id: lesson.id } })
    const json = await (res as NextResponse).json()

    expect(res.status).toBe(200)
    expect(json.lesson.id).toBe(lesson.id)
    expect(mockUpdate).toHaveBeenCalledWith(lesson.id, { title: 'Updated' })
  })

  it('returns 404 when lesson missing', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockUpdate.mockRejectedValue(new NotFoundError('Lesson'))

    const res = await PATCH(createRequest({ title: 'Updated' }) as any, { params: { id: lesson.id } })
    expect(res.status).toBe(404)
  })

  it('returns 400 on validation error', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockUpdate.mockRejectedValue(new ValidationError({ title: 'required' }))

    const res = await PATCH(createRequest({ title: '' }) as any, { params: { id: lesson.id } })
    const json = await (res as NextResponse).json()

    expect(res.status).toBe(400)
    expect(json.error.title).toBe('required')
  })
})
