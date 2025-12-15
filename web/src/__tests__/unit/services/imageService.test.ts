import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import {
  cleanupOldImage,
  compressImage,
  uploadAndLink,
  validateImageFile,
  setImageRepository,
  resetImageRepository,
} from '@/lib/lessons/services/imageService'
import { ValidationError } from '@/types/lessons'

const uploadImageMock = jest.fn().mockResolvedValue('https://cdn.local/lessons/lesson-1/0.jpg')
const deleteImageMock = jest.fn().mockResolvedValue(undefined)

beforeAll(() => {
  setImageRepository({ uploadImage: uploadImageMock as any, deleteImage: deleteImageMock as any })
})

afterAll(() => {
  resetImageRepository()
})

const createImageFile = (size = 600 * 1024, type = 'image/jpeg') =>
  ({
    name: 'step.jpg',
    size,
    type,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(size)),
  } as unknown as File)

describe('imageService', () => {
  beforeEach(() => {
    uploadImageMock.mockClear()
    deleteImageMock.mockClear()
  })

  it('compressImage reduces file size for large images', async () => {
    const file = createImageFile(2 * 1024 * 1024)
    const compressed = await compressImage(file)
    expect(compressed.size).toBeLessThan(file.size)
  })

  it('validateImageFile passes for jpeg within limits', () => {
    const file = createImageFile()
    ;(file as any).width = 800
    ;(file as any).height = 600
    const result = validateImageFile(file)
    expect(result.valid).toBe(true)
  })

  it('validateImageFile fails for unsupported gif', () => {
    const file = createImageFile(100 * 1024, 'image/gif')
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.errors.type).toContain('JPG')
  })

  it('uploadAndLink uploads compressed image and returns result', async () => {
    const file = createImageFile()
    const result = await uploadAndLink(file, 'lesson-1', 0)
    expect(result.url).toContain('lessons/lesson-1')
    expect(result.path).toBe('lessons/lesson-1/0.jpg')
    expect(uploadImageMock).toHaveBeenCalled()
  })

  it('uploadAndLink throws ValidationError when validation fails', async () => {
    const file = createImageFile(6 * 1024 * 1024)
    await expect(uploadAndLink(file, 'lesson-1', 0)).rejects.toBeInstanceOf(ValidationError)
  })

  it('cleanupOldImage extracts path and deletes resource', async () => {
    await cleanupOldImage('https://project.supabase.co/storage/v1/object/public/lesson-images/lessons/lesson-1/0.jpg')
    expect(deleteImageMock).toHaveBeenCalledWith('lessons/lesson-1/0.jpg')
  })
})
