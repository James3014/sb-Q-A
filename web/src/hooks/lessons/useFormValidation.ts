import { useCallback, useRef, useState } from 'react'
import type { CreateLessonInput, LessonSignals, LessonStep, ValidationResult } from '@/types/lessons'
import { validateLessonInput } from '@/lib/lessons/services/validationService'

export interface UseFormValidationReturn {
  errors: Record<string, string>
  touchedFields: Set<string>
  validateField: (fieldName: string, value: unknown) => boolean
  validateForm: (data: CreateLessonInput) => boolean
  clearError: (fieldName: string) => void
  touchField: (fieldName: string) => void
}

const isString = (value: unknown): value is string => typeof value === 'string'
const hasContent = (value: unknown): boolean => isString(value) ? value.trim().length > 0 : Boolean(value)

const validateSteps = (steps: LessonStep[]): boolean =>
  Array.isArray(steps) && steps.length > 0 && steps.every(step => step && hasContent(step.text))

const validateSignalsField = (signals: LessonSignals): boolean =>
  Array.isArray(signals?.correct) && signals.correct.length > 0 &&
  Array.isArray(signals?.wrong) && signals.wrong.length > 0

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const touchedRef = useRef<Set<string>>(new Set())

  const setFieldError = useCallback((field: string, message?: string) => {
    setErrors(prev => {
      const next = { ...prev }
      if (!message) {
        delete next[field]
      } else {
        next[field] = message
      }
      return next
    })
  }, [])

  const touchField = useCallback((fieldName: string) => {
    touchedRef.current.add(fieldName)
  }, [])

  const validateField = useCallback((fieldName: string, value: unknown) => {
    let valid = true
    switch (fieldName) {
      case 'title':
      case 'what':
        valid = hasContent(value)
        break
      case 'why':
      case 'level_tags':
      case 'slope_tags':
        valid = Array.isArray(value) && value.length > 0
        break
      case 'how':
        valid = Array.isArray(value) && validateSteps(value as LessonStep[])
        break
      case 'signals':
        valid = value ? validateSignalsField(value as LessonSignals) : false
        break
      default:
        valid = hasContent(value)
    }

    setFieldError(fieldName, valid ? undefined : '此欄位為必填')
    return valid
  }, [setFieldError])

  const clearError = useCallback((fieldName: string) => {
    setFieldError(fieldName, undefined)
  }, [setFieldError])

  const validateForm = useCallback((data: CreateLessonInput) => {
    const validation: ValidationResult = validateLessonInput(data)
    setErrors(validation.errors)
    return validation.valid
  }, [])

  return {
    errors,
    touchedFields: touchedRef.current,
    validateField,
    validateForm,
    clearError,
    touchField,
  }
}
