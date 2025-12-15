import { act, renderHook } from '@testing-library/react'
import { useImageUpload } from '@/hooks/lessons/useImageUpload'
import {
  cleanupOldImage,
  validateImageFile,
} from '@/lib/lessons/services/imageService'

jest.mock('@/lib/lessons/services/imageService', () => ({
  cleanupOldImage: jest.fn(),
  validateImageFile: jest.fn(),
  compressImage: jest.fn().mockImplementation((file: File) => Promise.resolve(file)),
}))

const mockedCleanup = cleanupOldImage as jest.MockedFunction<typeof cleanupOldImage>
const mockedValidate = validateImageFile as jest.MockedFunction<typeof validateImageFile>

const createMockFile = (name = 'image.jpg', size = 1024, type = 'image/jpeg'): File =>
  new File([new Uint8Array(size)], name, { type })

const originalFetch = global.fetch
const mockFetch = jest.fn()

describe('useImageUpload', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockedCleanup.mockReset()
    mockedValidate.mockReset()
    mockedValidate.mockReturnValue({ valid: true, errors: {} })
    global.fetch = mockFetch as unknown as typeof fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, url: 'https://cdn.local/image.jpg', path: 'lessons/temp/0.jpg' }),
    })
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useImageUpload())
    expect(result.current.uploading).toBe(false)
    expect(result.current.currentImage).toBeNull()
  })

  it('uploads image via handleFileSelect', async () => {
    const file = createMockFile()
    const { result } = renderHook(() => useImageUpload({ lessonId: 'lesson-1', stepIndex: 1 }))

    await act(async () => {
      await result.current.handleFileSelect(file)
    })

    expect(mockedValidate).toHaveBeenCalledWith(file)
    expect(mockFetch).toHaveBeenCalled()
    expect((mockFetch.mock.calls[0] || [])[0]).toBe('/api/admin/upload')
    expect(result.current.currentImage).toBe('https://cdn.local/image.jpg')
    expect(result.current.progress).toBe(100)
  })

  it('handles drop events', async () => {
    const file = createMockFile()
    const { result } = renderHook(() => useImageUpload())
    const preventDefault = jest.fn()

    await act(async () => {
      await result.current.handleDrop({
        preventDefault,
        dataTransfer: { files: [file] },
      } as unknown as DragEvent)
    })

    expect(preventDefault).toHaveBeenCalled()
    expect(result.current.currentImage).toBe('https://cdn.local/image.jpg')
  })

  it('deletes current image', async () => {
    const file = createMockFile()
    const { result } = renderHook(() => useImageUpload())

    await act(async () => {
      await result.current.handleFileSelect(file)
    })

    await act(async () => {
      await result.current.handleDelete()
    })

    expect(mockedCleanup).toHaveBeenCalledWith('https://cdn.local/image.jpg')
    expect(result.current.currentImage).toBeNull()
  })

  it('respects initialUrl option', () => {
    const { result, rerender } = renderHook(({ url }) => useImageUpload({ initialUrl: url }), {
      initialProps: { url: 'https://cdn.local/existing.jpg' },
    })
    expect(result.current.currentImage).toBe('https://cdn.local/existing.jpg')
    rerender({ url: null })
    expect(result.current.currentImage).toBeNull()
  })
})
