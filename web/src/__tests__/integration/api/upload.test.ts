import { NextResponse } from 'next/server'
import { POST } from '@/app/api/admin/upload/route'
import { authorizeAdmin } from '@/lib/adminGuard'
import { uploadAndLink } from '@/lib/lessons/services/imageService'
import { ValidationError } from '@/types/lessons'

jest.mock('@/lib/adminGuard', () => ({
  authorizeAdmin: jest.fn(),
}))

jest.mock('@/lib/lessons/services/imageService', () => ({
  uploadAndLink: jest.fn(),
}))

jest.mock('@/lib/lessons/repositories/imageRepository', () => ({
  setSupabaseGetter: jest.fn(),
  resetSupabaseGetter: jest.fn(),
}))

const mockAuthorize = authorizeAdmin as jest.MockedFunction<typeof authorizeAdmin>
const mockUploadAndLink = uploadAndLink as jest.MockedFunction<typeof uploadAndLink>

const createRequest = (form: FormData) =>
  ({
    formData: jest.fn().mockResolvedValue(form),
    headers: new Headers({ authorization: 'Bearer token' }),
  }) as any

describe('POST /api/admin/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns uploaded url/path', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockUploadAndLink.mockResolvedValue({
      url: 'https://cdn.local/lessons/lesson-1/0.jpg',
      path: 'lessons/lesson-1/0.jpg',
    })

    const form = new FormData()
    form.append('file', new File([new Uint8Array([1, 2, 3])], 'step.jpg', { type: 'image/jpeg' }))
    form.append('lessonId', 'lesson-1')
    form.append('stepIndex', '0')

    const res = await POST(createRequest(form))
    const body = await (res as NextResponse).json()

    expect(res.status).toBe(200)
    expect(body.url).toContain('lesson-1')
    expect(body.path).toBe('lessons/lesson-1/0.jpg')
  })

  it('returns 400 when missing file', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })

    const form = new FormData()
    const res = await POST(createRequest(form))
    expect(res.status).toBe(400)
  })

  it('handles validation error', async () => {
    mockAuthorize.mockResolvedValue({ supabase: {} as any })
    mockUploadAndLink.mockRejectedValue(new ValidationError({ file: 'invalid' }))

    const form = new FormData()
    form.append('file', new File([new Uint8Array([1])], 'bad.jpg', { type: 'image/jpeg' }))
    const res = await POST(createRequest(form))
    const body = await (res as NextResponse).json()
    expect(res.status).toBe(400)
    expect(body.error.file).toBe('invalid')
  })

  it('returns 401 when unauthorized', async () => {
    const unauthorized = new Response(null, { status: 401 })
    mockAuthorize.mockResolvedValue({ error: unauthorized as any })

    const form = new FormData()
    form.append('file', new File([new Uint8Array([1])], 'step.jpg', { type: 'image/jpeg' }))
    const res = await POST(createRequest(form))
    expect(res.status).toBe(401)
  })
})
