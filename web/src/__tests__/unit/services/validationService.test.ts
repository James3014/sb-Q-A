import { describe, expect, it } from '@jest/globals'
import {
  validateLessonInput,
  validateLessonTitle,
  validateImageFile,
  validateArrayField,
} from '@/lib/lessons/services/validationService'

const createValidInput = () => ({
  title: '有效的課程標題',
  what: '教學重點說明',
  why: ['建立穩定站姿'],
  how: [{ text: '維持肩膀平行雪面' }],
  signals: { correct: ['髖部朝向斜坡'], wrong: ['肩膀轉向山頂'] },
  level_tags: ['beginner'],
  slope_tags: ['green'],
  is_premium: false,
})

describe('validationService', () => {
  it('validateLessonInput returns valid for complete payload', () => {
    const result = validateLessonInput(createValidInput())
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('validateLessonInput flags missing title', () => {
    const result = validateLessonInput({ ...createValidInput(), title: 'abc' })
    expect(result.valid).toBe(false)
    expect(result.errors.title).toContain('至少')
  })

  it('validateLessonTitle rejects short titles', () => {
    expect(validateLessonTitle('嘿')).toBe(false)
    expect(validateLessonTitle('充足長度的標題')).toBe(true)
  })

  it('validateImageFile rejects unsupported mime type', () => {
    const file = new File(['abc'], 'anim.gif', { type: 'image/gif' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.errors.type).toContain('僅支援')
  })

  it('validateImageFile rejects oversized files', () => {
    const blob = new Blob([new Uint8Array(6 * 1024 * 1024)])
    const file = new File([blob], 'huge.jpg', { type: 'image/jpeg' })
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.errors.size).toBeDefined()
  })

  it('validateArrayField rejects empty arrays', () => {
    expect(validateArrayField([])).toBe(false)
    expect(validateArrayField(['ok'])).toBe(true)
  })
})
