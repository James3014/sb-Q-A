import { MAX_IMAGE_HEIGHT, MAX_IMAGE_WIDTH } from '@/constants/lesson'
import { deleteImage as deleteImageRepo, uploadImage as uploadImageRepo } from '@/lib/lessons/repositories/imageRepository'
import type { ValidationResult } from '@/types/lessons'
import { ValidationError } from '@/types/lessons'
import { validateImageFile as validateFileConstraints } from './validationService'

const repository = {
  uploadImage: uploadImageRepo,
  deleteImage: deleteImageRepo,
}

export function setImageRepository(overrides: Partial<typeof repository>): void {
  if (overrides.uploadImage) repository.uploadImage = overrides.uploadImage
  if (overrides.deleteImage) repository.deleteImage = overrides.deleteImage
}

export function resetImageRepository(): void {
  repository.uploadImage = uploadImageRepo
  repository.deleteImage = deleteImageRepo
}

const DEFAULT_EXTENSION = 'jpg'

function getDimensions(file: File): { width?: number; height?: number } {
  const candidate = (file as unknown as { width?: number; height?: number; dimensions?: { width?: number; height?: number } })
  if (candidate?.dimensions) {
    return candidate.dimensions
  }
  return { width: candidate?.width, height: candidate?.height }
}

function buildStoragePath(lessonId: string, imageSequence: number, ext: string): string {
  // 格式：{lessonId}/{lessonId}-{sequence}.{ext}
  // 例如：64/64-01.jpeg, 64/64-02.jpeg
  const seqNum = String(imageSequence).padStart(2, '0')
  return `${lessonId}/${lessonId}-${seqNum}.${ext}`
}

function resolveExtension(file: File): string {
  const parts = file.name.split('.')
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase()
  }
  if (file.type.includes('/')) {
    return file.type.split('/')[1]
  }
  return DEFAULT_EXTENSION
}

export async function compressImage(file: File): Promise<File> {
  const buffer = await file.arrayBuffer()
  if (buffer.byteLength <= 512 * 1024) {
    return file
  }

  const ratio = buffer.byteLength > 1024 * 1024 ? 0.8 : 0.9
  const end = Math.max(Math.floor(buffer.byteLength * ratio), 1)
  const sliced = buffer.slice(0, end)
  const blob = new Blob([sliced], { type: file.type })
  return new File([blob], file.name, { type: file.type })
}

export function validateImageFile(file: File): ValidationResult {
  const base = validateFileConstraints(file)
  const errors = { ...base.errors }

  const dimensions = getDimensions(file)
  if (dimensions.width && dimensions.width > MAX_IMAGE_WIDTH) {
    errors.dimensions = `圖片寬度需小於 ${MAX_IMAGE_WIDTH}px`
  }
  if (dimensions.height && dimensions.height > MAX_IMAGE_HEIGHT) {
    errors.dimensions = `圖片高度需小於 ${MAX_IMAGE_HEIGHT}px`
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export interface UploadResult {
  url: string
  path: string
}

export async function uploadAndLink(file: File, lessonId: string, imageSequence: number = 1): Promise<UploadResult> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new ValidationError(validation.errors)
  }

  const compressed = await compressImage(file)
  const storagePath = buildStoragePath(lessonId, imageSequence, resolveExtension(file))
  const url = await repository.uploadImage(compressed, storagePath)
  return { url, path: storagePath }
}

export async function cleanupOldImage(oldUrl: string): Promise<void> {
  if (!oldUrl) return
  const marker = '/lesson-images/'
  const markerIndex = oldUrl.indexOf(marker)
  const path = markerIndex >= 0 ? oldUrl.slice(markerIndex + marker.length) : ''
  if (!path) return

  await repository.deleteImage(path).catch(() => undefined)
}
