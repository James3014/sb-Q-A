export interface LessonStep {
  text: string
  image?: string | null
}

export interface LessonSignals {
  correct: string[]
  wrong: string[]
}

export interface Lesson {
  id: string
  title: string
  what: string
  why: string[]
  how: LessonStep[]
  signals: LessonSignals
  level_tags: string[]
  slope_tags: string[]
  casi?: Record<string, unknown> | null
  is_premium: boolean
  is_published: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateLessonInput {
  title: string
  what: string
  why: string[]
  how: LessonStep[]
  signals: LessonSignals
  level_tags: string[]
  slope_tags: string[]
  is_premium: boolean
}

export type UpdateLessonInput = Partial<CreateLessonInput> & {
  is_published?: boolean
}

export interface LessonFormData extends CreateLessonInput {
  id?: string
  is_published: boolean
  casi?: Record<string, unknown> | null
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export interface ImageUploadResult {
  url: string
  path: string
}

export class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Validation failed')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}
