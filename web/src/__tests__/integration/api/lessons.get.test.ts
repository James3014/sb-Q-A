import { NextResponse } from 'next/server'
import { GET } from '@/app/api/admin/lessons/[id]/route'
import { authorizeAdmin } from '@/lib/adminGuard'
import { getLessonById } from '@/lib/lessons/repositories/lessonRepository'
import type { Lesson } from '@/types/lessons'
import { NotFoundError } from '@/types/lessons'

jest.mock('@/lib/adminGuard', () => ({ authorizeAdmin: jest.fn() }))
jest.mock('@/lib/lessons/repositories/lessonRepository', () => {
  const actual = jest.requireActual('@/lib/lessons/repositories/lessonRepository')
  return {
    ...actual,
    getLessonById: jest.fn(),
  }
})

const mockAuthorize = authorizeAdmin as jest.MockedFunction<typeof authorizeAdmin>
const mockGetLesson = getLessonById as jest.MockedFunction<typeof getLessonById>

const createRequest = () => ({
  headers: new Headers({ authorization: 'Bearer token' }),
}) as unknown as Request

const lesson: Lesson = {
  id: 'lesson-1',
  title: 'Existing',
  what: 'what',
  why: ['why'],
  how: [{ text: 'how' }],
  signals: { correct: ['correct'], wrong: ['wrong'] },
  level_tags: ['beginner'],
  slope_tags: ['green'],
  is_premium: false,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('GET /api/admin/lessons/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns lesson data', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockGetLesson.mockResolvedValue(lesson as Lesson & { deleted_at?: string | null })

    const res = await GET(createRequest() as any, { params: { id: lesson.id } })
    const json = await (res as NextResponse).json()

    expect(res.status).toBe(200)
    expect(json.lesson.id).toBe(lesson.id)
  })

  it('returns 404 when deleted', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockGetLesson.mockResolvedValue({ ...lesson, deleted_at: new Date().toISOString() } as Lesson & {
      deleted_at: string
    })

    const res = await GET(createRequest() as any, { params: { id: lesson.id } })
    expect(res.status).toBe(404)
  })

  it('returns 404 when missing', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockGetLesson.mockRejectedValue(new NotFoundError('Lesson'))

    const res = await GET(createRequest() as any, { params: { id: 'missing' } })
    expect(res.status).toBe(404)
  })
})
