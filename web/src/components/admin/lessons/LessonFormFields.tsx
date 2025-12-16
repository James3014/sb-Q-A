'use client'

import { memo, useCallback, useMemo } from 'react'
import { LEVEL_OPTIONS, SLOPE_OPTIONS } from '@/constants/lesson'
import { StepImageUploader } from './StepImageUploader'
import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'
import type { UseFormActionsReturn } from '@/hooks/form/useFormActions'

interface LessonFormFieldsProps {
  state: UseLessonFormState
  actions: UseFormActionsReturn
  errors?: Record<string, string>
  lessonId?: string  // 新增：用於圖片上傳
}

export const LessonFormFields = memo(function LessonFormFields({
  state,
  actions,
  errors,
  lessonId,
}: LessonFormFieldsProps) {
  // 計算所有步驟的圖片總數（用於上傳時計算序號）
  const totalImageCount = useMemo(() => {
    return state.how.reduce((sum, step) => {
      const stepImages = step.images || (step.image ? [step.image] : [])
      return sum + stepImages.length
    }, 0)
  }, [state.how])
  const handleLevelTagToggle = useCallback((tag: string) => {
    const newTags = state.level_tags.includes(tag)
      ? state.level_tags.filter(t => t !== tag)
      : [...state.level_tags, tag]
    actions.setLevelTags(newTags)
  }, [state.level_tags, actions.setLevelTags])

  const handleSlopeTagToggle = useCallback((tag: string) => {
    const newTags = state.slope_tags.includes(tag)
      ? state.slope_tags.filter(t => t !== tag)
      : [...state.slope_tags, tag]
    actions.setSlopeTags(newTags)
  }, [state.slope_tags, actions.setSlopeTags])

  const handleWhyChange = useCallback((index: number, value: string) => {
    const newWhy = [...state.why]
    newWhy[index] = value
    actions.setWhy(newWhy)
  }, [state.why, actions.setWhy])

  const addWhy = useCallback(() => {
    actions.setWhy([...state.why, ''])
  }, [state.why, actions.setWhy])

  const removeWhy = useCallback((index: number) => {
    if (state.why.length > 1) {
      actions.setWhy(state.why.filter((_, i) => i !== index))
    }
  }, [state.why, actions.setWhy])

  const handleSignalChange = useCallback((type: 'correct' | 'wrong', index: number, value: string) => {
    const newSignals = { ...state.signals }
    newSignals[type][index] = value
    actions.setSignals(newSignals)
  }, [state.signals, actions.setSignals])

  const addSignal = useCallback((type: 'correct' | 'wrong') => {
    const newSignals = { ...state.signals }
    newSignals[type] = [...newSignals[type], '']
    actions.setSignals(newSignals)
  }, [state.signals, actions.setSignals])

  const removeSignal = useCallback((type: 'correct' | 'wrong', index: number) => {
    const newSignals = { ...state.signals }
    if (newSignals[type].length > 1) {
      newSignals[type] = newSignals[type].filter((_, i) => i !== index)
      actions.setSignals(newSignals)
    }
  }, [state.signals, actions.setSignals])

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          課程標題 *
        </label>
        <input
          type="text"
          value={state.title}
          onChange={(e) => actions.setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="輸入課程標題"
        />
        {errors?.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title}</p>
        )}
      </div>

      {/* 問題描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          問題描述 *
        </label>
        <textarea
          value={state.what}
          onChange={(e) => actions.setWhat(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="描述學生常見的技術問題"
        />
        {errors?.what && (
          <p className="mt-1 text-sm text-red-400">{errors.what}</p>
        )}
      </div>

      {/* 程度標籤 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          程度標籤
        </label>
        <div className="flex flex-wrap gap-2">
          {LEVEL_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleLevelTagToggle(option)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                state.level_tags.includes(option)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* 場地標籤 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          場地標籤
        </label>
        <div className="flex flex-wrap gap-2">
          {SLOPE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSlopeTagToggle(option)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                state.slope_tags.includes(option)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* 目標 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          練習目標
        </label>
        <div className="space-y-2">
          {state.why.map((goal, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={goal}
                onChange={(e) => handleWhyChange(index, e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`目標 ${index + 1}`}
              />
              {state.why.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWhy(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  刪除
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addWhy}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            新增目標
          </button>
        </div>
      </div>

      {/* 練習步驟 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          怎麼練
        </label>
        <div className="space-y-4">
          {state.how.map((step, index) => {
            // 取得此步驟的圖片陣列
            const stepImages = step.images || (step.image ? [step.image] : [])
            // 計算此步驟之前的圖片數量
            const prevImageCount = state.how.slice(0, index).reduce((sum, s) => {
              const imgs = s.images || (s.image ? [s.image] : [])
              return sum + imgs.length
            }, 0)

            return (
              <div key={index} className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-400 mt-2">步驟 {index + 1}</span>
                  {state.how.length > 1 && (
                    <button
                      type="button"
                      onClick={() => actions.removeStep(index)}
                      className="ml-auto px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
                    >
                      刪除
                    </button>
                  )}
                </div>
                <textarea
                  value={step.text}
                  onChange={(e) => actions.updateStep(index, { text: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="描述這個步驟的練習內容..."
                />
                {/* 圖片上傳區 */}
                {lessonId && (
                  <StepImageUploader
                    lessonId={lessonId}
                    currentImageCount={prevImageCount}
                    images={stepImages}
                    onImagesChange={(newImages) => {
                      actions.updateStep(index, { images: newImages, image: newImages[0] || null })
                    }}
                  />
                )}
              </div>
            )
          })}
          <button
            type="button"
            onClick={actions.addStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            新增步驟
          </button>
        </div>
      </div>

      {/* 做對訊號 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          做對訊號
        </label>
        <div className="space-y-2">
          {state.signals.correct.map((signal, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={signal}
                onChange={(e) => handleSignalChange('correct', index, e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`做對訊號 ${index + 1}`}
              />
              {state.signals.correct.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSignal('correct', index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  刪除
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSignal('correct')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            新增做對訊號
          </button>
        </div>
      </div>

      {/* 做錯訊號 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          做錯訊號
        </label>
        <div className="space-y-2">
          {state.signals.wrong.map((signal, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={signal}
                onChange={(e) => handleSignalChange('wrong', index, e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`做錯訊號 ${index + 1}`}
              />
              {state.signals.wrong.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSignal('wrong', index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  刪除
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSignal('wrong')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            新增做錯訊號
          </button>
        </div>
      </div>

      {/* Premium 設定 */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={state.is_premium}
            onChange={(e) => actions.setIsPremium(e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-300">
            Premium 課程
          </span>
        </label>
      </div>
    </div>
  )
})
