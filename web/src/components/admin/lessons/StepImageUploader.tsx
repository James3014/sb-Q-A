'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { LESSON_API_ENDPOINTS, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/constants/lesson'

export interface StepImageUploaderProps {
  lessonId: string
  currentImageCount: number  // 當前課程總圖片數量（用於計算序號）
  images: string[]  // 此步驟現有圖片 URL 陣列
  onImagesChange: (images: string[]) => void
  disabled?: boolean
}

export function StepImageUploader({
  lessonId,
  currentImageCount,
  images,
  onImagesChange,
  disabled = false,
}: StepImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 檢查檔案類型
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
        setUploadError(`不支援的檔案格式：${file.name}`)
        continue
      }

      // 檢查檔案大小
      if (file.size > MAX_IMAGE_SIZE) {
        setUploadError(`檔案過大（超過 5MB）：${file.name}`)
        continue
      }

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('lessonId', lessonId)
        // 計算新圖片的序號：目前總數 + 這次上傳的順序
        formData.append('imageSequence', String(currentImageCount + newImages.length + 1))

        const response = await fetch(LESSON_API_ENDPOINTS.upload, {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (result.ok && result.url) {
          newImages.push(result.url)
        } else {
          setUploadError(result.error || '上傳失敗')
        }
      } catch (err) {
        console.error('Upload error:', err)
        setUploadError('上傳時發生錯誤')
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages])
    }

    setIsUploading(false)

    // 清空 input 讓同一檔案可以再次選擇
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [lessonId, currentImageCount, images, onImagesChange])

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const newImages = images.filter((_, idx) => idx !== indexToRemove)
    onImagesChange(newImages)
  }, [images, onImagesChange])

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="mt-2">
      {/* 圖片預覽區 */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <div className="w-20 h-20 relative rounded-md overflow-hidden border border-gray-600">
                <Image
                  src={url}
                  alt={`圖片 ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs
                             opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="移除圖片"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 上傳按鈕 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <button
        type="button"
        onClick={triggerFileSelect}
        disabled={disabled || isUploading}
        className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1
          ${disabled || isUploading
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
      >
        {isUploading ? (
          <>
            <span className="animate-spin">⏳</span>
            上傳中...
          </>
        ) : (
          <>
            <span>📷</span>
            新增圖片
          </>
        )}
      </button>

      {/* 錯誤訊息 */}
      {uploadError && (
        <p className="mt-1 text-xs text-red-400">{uploadError}</p>
      )}
    </div>
  )
}
