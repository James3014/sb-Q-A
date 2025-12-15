import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, REQUIRED_LESSON_FIELDS } from '@/constants/lesson'
import type { CreateLessonInput, LessonSignals, LessonStep, ValidationResult } from '@/types/lessons'

const MIN_TITLE_LENGTH = 5

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function collectErrors(errors: Record<string, string>, field: string, message: string): void {
  errors[field] = message
}

function hasValidSteps(steps?: LessonStep[]): boolean {
  if (!Array.isArray(steps) || steps.length === 0) return false
  return steps.every(step => !!step && isNonEmptyString(step.text))
}

function hasValidSignals(signals?: LessonSignals): boolean {
  if (!signals) return false
  return validateArrayField(signals.correct) && validateArrayField(signals.wrong)
}

export function validateLessonTitle(title: string): boolean {
  return isNonEmptyString(title) && title.trim().length >= MIN_TITLE_LENGTH
}

export function validateArrayField(items: unknown): boolean {
  if (!Array.isArray(items) || items.length === 0) {
    return false
  }

  return items.every(item => {
    if (typeof item === 'string') {
      return item.trim().length > 0
    }
    if (typeof item === 'object' && item !== null) {
      return true
    }
    return Boolean(item)
  })
}

export function validateImageFile(file: File): ValidationResult {
  const errors: Record<string, string> = {}

  if (!file) {
    collectErrors(errors, 'file', '必須提供圖片檔案')
    return { valid: false, errors }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    collectErrors(errors, 'type', '僅支援 JPG/PNG/WEBP 圖片')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    collectErrors(errors, 'size', `圖片大小不得超過 ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`)
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateLessonInput(data: Partial<CreateLessonInput> | null | undefined): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data || typeof data !== 'object') {
    collectErrors(errors, 'base', '課程資料格式錯誤')
    return { valid: false, errors }
  }

  REQUIRED_LESSON_FIELDS.forEach(field => {
    const value = (data as Record<string, unknown>)[field]
    if (field === 'title' && !validateLessonTitle(value as string)) {
      collectErrors(errors, 'title', '課程標題至少 5 個字元')
    } else if (field === 'what' && !isNonEmptyString(value)) {
      collectErrors(errors, 'what', '請填寫課程目標描述')
    } else if (field === 'why' && !validateArrayField(value)) {
      collectErrors(errors, 'why', '請提供至少一個學習目的')
    } else if (field === 'how' && !hasValidSteps(value as LessonStep[])) {
      collectErrors(errors, 'how', '請提供至少一個步驟並填寫內容')
    } else if ((field === 'level_tags' || field === 'slope_tags') && !validateArrayField(value)) {
      collectErrors(errors, field, '請至少選擇一個標籤')
    }
  })

  if (!hasValidSignals(data.signals)) {
    collectErrors(errors, 'signals', '請填寫正確與錯誤訊號')
  }

  if (typeof data.is_premium !== 'boolean') {
    collectErrors(errors, 'is_premium', '請指定課程是否為 Premium')
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
