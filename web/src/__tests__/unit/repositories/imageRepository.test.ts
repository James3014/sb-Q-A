import { describe, expect, it, beforeEach, jest } from '@jest/globals'
import {
  deleteImage,
  getImageUrl,
  uploadImage,
  setSupabaseGetter,
  resetSupabaseGetter,
} from '@/lib/lessons/repositories/imageRepository'

const createBucket = () => ({
  upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
  remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
  getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.local/image.jpg' } }),
})

describe('imageRepository', () => {
  let supabaseClientStub: any

  beforeAll(() => {
    setSupabaseGetter(() => supabaseClientStub)
  })

  afterAll(() => {
    resetSupabaseGetter()
  })

  beforeEach(() => {
    const bucket = createBucket()
    supabaseClientStub = { storage: { from: jest.fn().mockReturnValue(bucket) } }
  })

  it('uploadImage stores file and returns url', async () => {
    const url = await uploadImage(new File(['abc'], 'image.jpg', { type: 'image/jpeg' }), 'lessons/1/0.jpg')
    expect(url).toContain('cdn.local')
  })

  it('uploadImage throws when storage fails', async () => {
    const bucket = createBucket()
    bucket.upload.mockResolvedValue({ data: null, error: new Error('full') })
    supabaseClientStub = { storage: { from: jest.fn().mockReturnValue(bucket) } }

    await expect(uploadImage(new File(['abc'], 'broken.jpg', { type: 'image/jpeg' }), 'lessons/x/0.jpg')).rejects.toThrow('full')
  })

  it('deleteImage removes object from storage', async () => {
    const bucket = createBucket()
    supabaseClientStub = { storage: { from: jest.fn().mockReturnValue(bucket) } }
    await deleteImage('lessons/1/0.jpg')
    expect(bucket.remove).toHaveBeenCalledWith(['lessons/1/0.jpg'])
  })

  it('getImageUrl returns public url', () => {
    const bucket = createBucket()
    supabaseClientStub = { storage: { from: jest.fn().mockReturnValue(bucket) } }
    const url = getImageUrl('lessons/1/0.jpg')
    expect(url).toBe('https://cdn.local/image.jpg')
  })
})
