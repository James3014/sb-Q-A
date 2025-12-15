import type { CreateLessonInput, Lesson, UpdateLessonInput, ValidationResult } from '@/types/lessons'
import { ValidationError } from '@/types/lessons'
import {
  createLesson as createLessonRepo,
  getLessonById as getLessonByIdRepo,
  updateLesson as updateLessonRepo,
} from '@/lib/lessons/repositories/lessonRepository'
import { validateLessonInput } from './validationService'

const repository = {
  createLesson: createLessonRepo,
  updateLesson: updateLessonRepo,
  getLessonById: getLessonByIdRepo,
}

export function setLessonRepository(overrides: Partial<typeof repository>): void {
  if (overrides.createLesson) repository.createLesson = overrides.createLesson
  if (overrides.updateLesson) repository.updateLesson = overrides.updateLesson
  if (overrides.getLessonById) repository.getLessonById = overrides.getLessonById
}

export function resetLessonRepository(): void {
  repository.createLesson = createLessonRepo
  repository.updateLesson = updateLessonRepo
  repository.getLessonById = getLessonByIdRepo
}

export function validateLessonData(data: Partial<CreateLessonInput>): ValidationResult {
  return validateLessonInput(data)
}

export async function createLessonWithValidation(input: CreateLessonInput): Promise<Lesson> {
  const validationResult = validateLessonInput(input)
  if (!validationResult.valid) {
    throw new ValidationError(validationResult.errors)
  }

  return repository.createLesson(input)
}

export async function updateLessonWithValidation(id: string, input: UpdateLessonInput): Promise<Lesson> {
  const current = await repository.getLessonById(id)
  const merged = { ...current, ...input }
  const validationResult = validateLessonInput(merged)
  if (!validationResult.valid) {
    throw new ValidationError(validationResult.errors)
  }

  return repository.updateLesson(id, input)
}

export async function publishLesson(id: string): Promise<void> {
  await repository.updateLesson(id, { is_published: true })
}

export async function unpublishLesson(id: string): Promise<void> {
  await repository.updateLesson(id, { is_published: false })
}
