import { NextResponse } from 'next/server'
import { POST } from '@/app/api/admin/lessons/route'
import { authorizeAdmin } from '@/lib/adminGuard'
import { createLessonWithValidation } from '@/lib/lessons/services/lessonService'
import type { Lesson } from '@/types/lessons'
import { ValidationError } from '@/types/lessons'

jest.mock('@/lib/adminGuard', () => ({
  authorizeAdmin: jest.fn(),
}))

jest.mock('@/lib/lessons/services/lessonService', () => ({
  createLessonWithValidation: jest.fn(),
}))

const mockAuthorize = authorizeAdmin as jest.MockedFunction<typeof authorizeAdmin>
const mockCreateLesson = createLessonWithValidation as jest.MockedFunction<typeof createLessonWithValidation>

const baseLesson: Lesson = {
  id: 'lesson-1',
  title: 'Basic stance',
  what: 'Maintain balance',
  why: ['Foundation'],
  how: [{ text: 'Keep shoulders aligned' }],
  signals: { correct: ['Relaxed shoulders'], wrong: ['Locked knees'] },
  level_tags: ['beginner'],
  slope_tags: ['green'],
  is_premium: false,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const createRequest = (body: unknown, headers: Record<string, string> = {}) => ({
  json: jest.fn().mockResolvedValue(body),
  headers: new Headers({ authorization: 'Bearer token', ...headers }),
}) as unknown as Request

describe('POST /api/admin/lessons', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns lesson when creation succeeds', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockCreateLesson.mockResolvedValue(baseLesson)

    const res = await POST(createRequest(baseLesson) as any)
    const json = await (res as NextResponse).json()

    expect(res.status).toBe(200)
    expect(json.lesson.id).toBe(baseLesson.id)
    expect(mockCreateLesson).toHaveBeenCalledTimes(1)
  })

  it('returns 400 on validation error', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockCreateLesson.mockRejectedValue(new ValidationError({ title: 'required' }))

    const res = await POST(createRequest({}) as any)
    const json = await (res as NextResponse).json()

    expect(res.status).toBe(400)
    expect(json.error.title).toBe('required')
  })

  it('returns 401 when unauthorized', async () => {
    const unauthorized = NextResponse.json({ ok: false }, { status: 401 })
    mockAuthorize.mockResolvedValue({ error: unauthorized })

    const res = await POST(createRequest({}) as any)
    expect(res.status).toBe(401)
  })

  it('returns 500 on unexpected errors', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockCreateLesson.mockRejectedValue(new Error('db failure'))

    const res = await POST(createRequest(baseLesson) as any)
    expect(res.status).toBe(500)
  })
})
