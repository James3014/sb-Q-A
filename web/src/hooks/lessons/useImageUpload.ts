import { useCallback, useEffect, useState } from 'react'
import { cleanupOldImage, compressImage, validateImageFile } from '@/lib/lessons/services/imageService'
import { LESSON_API_ENDPOINTS } from '@/constants/lesson'

export interface UseImageUploadOptions {
  lessonId?: string
  stepIndex?: number
  onUploaded?: (url: string) => void
  initialUrl?: string | null
}

export interface UseImageUploadReturn {
  uploading: boolean
  progress: number
  error: string | null
  currentImage: string | null
  handleFileSelect: (file: File) => Promise<void>
  handleDrop: (event: DragEvent) => Promise<void>
  handleDelete: () => Promise<void>
}

const extractErrorMessage = (errors: Record<string, string>): string => {
  const [, message] = Object.entries(errors)[0] ?? []
  return message || '圖片上傳失敗，請稍後再試'
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { lessonId, stepIndex = 0, onUploaded, initialUrl } = options
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentImage, setCurrentImage] = useState<string | null>(initialUrl ?? null)

  useEffect(() => {
    if (typeof initialUrl !== 'undefined') {
      setCurrentImage(initialUrl)
    }
  }, [initialUrl])

  const handleFileSelect = useCallback(async (file: File) => {
    setUploading(true)
    setError(null)
    setProgress(0)
    try {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        throw new Error(extractErrorMessage(validation.errors))
      }
      setProgress(30)
      const compressed = await compressImage(file)
      setProgress(60)
      const resolvedLessonId = lessonId ?? 'temp'
      const formData = new FormData()
      formData.append('file', compressed)
      formData.append('lessonId', resolvedLessonId)
      formData.append('stepIndex', String(stepIndex))

      const response = await fetch(LESSON_API_ENDPOINTS.upload, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('圖片上傳失敗')
      }

      const data = await response.json().catch(() => ({ ok: false }))
      if (!data?.ok || !data.url) {
        throw new Error(data?.error || '圖片上傳失敗')
      }

      setCurrentImage(data.url)
      setProgress(100)
      onUploaded?.(data.url)
    } catch (err) {
      const message = err instanceof Error ? err.message : '圖片上傳失敗'
      setError(message)
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }, [lessonId, onUploaded, stepIndex])

  const handleDrop = useCallback(async (event: DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      await handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDelete = useCallback(async () => {
    if (!currentImage) return
    try {
      await cleanupOldImage(currentImage)
    } finally {
      setCurrentImage(null)
      setProgress(0)
    }
  }, [currentImage])

  return {
    uploading,
    progress,
    error,
    currentImage,
    handleFileSelect,
    handleDrop,
    handleDelete,
  }
}
