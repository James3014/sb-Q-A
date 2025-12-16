'use client'

import { useState } from 'react'
import { useLessonEditor } from '@/hooks/lessons/useLessonEditor'
import { LessonFormFields } from './LessonFormFields'
import { LessonFormActions } from './LessonFormActions'
import type { Lesson } from '@/types/lessons'

export interface LessonFormProps {
  lessonId?: string
  onSuccess?: (lesson: Lesson) => void
  onCancel?: () => void
}

export function LessonForm({ lessonId, onSuccess, onCancel }: LessonFormProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  
  const editor = useLessonEditor({
    lessonId,
    onSuccess: (lesson) => {
      setStatusMessage(lessonId ? '課程已更新' : '課程建立成功')
      onSuccess?.(lesson)
    },
  })

  const handleSubmit = async () => {
    try {
      await editor.submit()
    } catch (error) {
      console.error('Submit error:', error)
      setStatusMessage('儲存失敗，請重試')
    }
  }

  const handleReset = () => {
    editor.reset()
    setStatusMessage(null)
  }

  const handleCancel = () => {
    setStatusMessage(null)
    onCancel?.()
  }

  // 如果是編輯模式且還在載入，顯示載入狀態
  if (lessonId && editor.isSubmitting && !editor.state.title) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">載入課程資料中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          {lessonId ? '編輯課程' : '新增課程'}
        </h1>

        {statusMessage && (
          <div className={`mb-4 p-3 rounded-md ${
            statusMessage.includes('失敗') 
              ? 'bg-red-900 text-red-300 border border-red-700'
              : 'bg-green-900 text-green-300 border border-green-700'
          }`}>
            {statusMessage}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <LessonFormFields
            state={editor.state}
            actions={{
              setTitle: editor.setTitle,
              setWhat: editor.setWhat,
              setWhy: editor.setWhy,
              setHow: editor.setHow,
              setSignals: editor.setSignals,
              setLevelTags: editor.setLevelTags,
              setSlopeTags: editor.setSlopeTags,
              setIsPremium: editor.setIsPremium,
              updateStep: editor.updateStep,
              addStep: editor.addStep,
              removeStep: editor.removeStep,
            }}
          />

          <LessonFormActions
            isSubmitting={editor.isSubmitting}
            isEditMode={Boolean(lessonId)}
            onSubmit={handleSubmit}
            onReset={handleReset}
            onCancel={onCancel ? handleCancel : undefined}
          />
        </form>
      </div>
    </div>
  )
}
