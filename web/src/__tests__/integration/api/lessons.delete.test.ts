import { NextResponse } from 'next/server'
import { DELETE } from '@/app/api/admin/lessons/[id]/route'
import { authorizeAdmin } from '@/lib/adminGuard'
import { softDeleteLesson } from '@/lib/lessons/repositories/lessonRepository'
import { NotFoundError } from '@/types/lessons'

jest.mock('@/lib/adminGuard', () => ({ authorizeAdmin: jest.fn() }))
jest.mock('@/lib/lessons/repositories/lessonRepository', () => {
  const actual = jest.requireActual('@/lib/lessons/repositories/lessonRepository')
  return {
    ...actual,
    softDeleteLesson: jest.fn(),
  }
})

const mockAuthorize = authorizeAdmin as jest.MockedFunction<typeof authorizeAdmin>
const mockSoftDelete = softDeleteLesson as jest.MockedFunction<typeof softDeleteLesson>

const createRequest = () => ({
  headers: new Headers({ authorization: 'Bearer token' }),
}) as unknown as Request

describe('DELETE /api/admin/lessons/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('soft deletes lesson', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockSoftDelete.mockResolvedValue()

    const res = await DELETE(createRequest() as any, { params: { id: 'lesson-1' } })
    const json = await (res as NextResponse).json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(mockSoftDelete).toHaveBeenCalledWith('lesson-1')
  })

  it('returns 404 when lesson missing', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockSoftDelete.mockRejectedValue(new NotFoundError('Lesson'))

    const res = await DELETE(createRequest() as any, { params: { id: 'missing' } })
    expect(res.status).toBe(404)
  })
})
