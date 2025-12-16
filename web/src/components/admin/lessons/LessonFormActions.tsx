'use client'

import { useState } from 'react'

interface LessonFormActionsProps {
  isSubmitting: boolean
  isEditMode?: boolean
  onSubmit: () => Promise<void>
  onReset: () => void
  onCancel?: () => void
  submitText?: string
  submitingText?: string
}

export function LessonFormActions({
  isSubmitting,
  isEditMode = false,
  onSubmit,
  onReset,
  onCancel,
  submitText,
  submitingText,
}: LessonFormActionsProps) {
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false)

  const handleSubmit = async () => {
    if (isSubmitting || isSubmittingInternal) return
    
    setIsSubmittingInternal(true)
    try {
      await onSubmit()
    } finally {
      setIsSubmittingInternal(false)
    }
  }

  const loading = isSubmitting || isSubmittingInternal
  const defaultSubmitText = isEditMode ? '更新' : '儲存'
  const defaultSubmittingText = isEditMode ? '更新中...' : '儲存中...'

  return (
    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          取消
        </button>
      )}
      
      <button
        type="button"
        onClick={onReset}
        disabled={loading}
        className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        重置
      </button>
      
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading 
          ? (submitingText || defaultSubmittingText)
          : (submitText || defaultSubmitText)
        }
      </button>
    </div>
  )
}
