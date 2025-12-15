'use client'

import { ChangeEvent, useCallback, useState, DragEvent as ReactDragEvent } from 'react'
import type { UseImageUploadReturn } from '@/hooks/lessons/useImageUpload'

interface ImageUploadZoneProps {
  uploader: UseImageUploadReturn
  previewUrl?: string | null
  helperText?: string
  onRemove?: () => Promise<void> | void
}

export function ImageUploadZone({ uploader, previewUrl, helperText, onRemove }: ImageUploadZoneProps) {
  const [isDragging, setDragging] = useState(false)
  const activePreview = uploader.currentImage ?? previewUrl ?? null

  const handleFileInput = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await uploader.handleFileSelect(file)
    }
    event.target.value = ''
  }, [uploader])

  const handleDrop = useCallback(async (event: ReactDragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    await uploader.handleDrop(event.nativeEvent)
  }, [uploader])

  const handleDelete = useCallback(async () => {
    await uploader.handleDelete()
    await onRemove?.()
  }, [onRemove, uploader])

  return (
    <div className="space-y-2">
      {activePreview ? (
        <div className="relative overflow-hidden rounded border border-zinc-700 bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activePreview} alt="課程示範圖片" className="w-full object-cover" />
          <button
            type="button"
            onClick={handleDelete}
            className="absolute right-2 top-2 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-400"
          >
            刪除
          </button>
        </div>
      ) : (
        <label
          className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded border border-dashed ${isDragging ? 'border-blue-400 bg-blue-500/5' : 'border-zinc-600 bg-zinc-900'} px-4 py-8 text-sm text-zinc-400`}
          onDragOver={event => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={event => {
            event.preventDefault()
            setDragging(false)
          }}
          onDrop={handleDrop}
        >
          <span className="font-semibold">拖曳或點擊上傳圖片</span>
          <span className="text-xs text-zinc-500 mt-1">{helperText ?? '支援 JPG / PNG / WebP，5MB 以下'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        </label>
      )}

      {uploader.error && <p className="text-sm text-red-400">{uploader.error}</p>}
      {uploader.uploading && (
        <p className="text-sm text-blue-300">
          上傳中... {uploader.progress}%
        </p>
      )}
    </div>
  )
}
