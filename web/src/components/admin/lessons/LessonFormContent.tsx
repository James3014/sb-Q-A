'use client'

import { FormEvent, useState } from 'react'
import type { UseLessonFormReturn } from '@/hooks/lessons/useLessonForm'
import type { UseFormValidationReturn } from '@/hooks/lessons/useFormValidation'
import type { UseImageUploadReturn } from '@/hooks/lessons/useImageUpload'
import { LEVEL_OPTIONS, SLOPE_OPTIONS } from '@/constants/lesson'
import { ImageUploadZone } from './ImageUploadZone'
import { RichTextEditor } from './RichTextEditor'
import { ArrayInputField } from './ArrayInputField'
import { ChipInput } from './ChipInput'
import { StepEditor } from './StepEditor'
import { LessonPreview } from './LessonPreview'

interface LessonFormContentProps {
  form: UseLessonFormReturn
  validation: UseFormValidationReturn
  image: UseImageUploadReturn
  onSubmit: () => Promise<void>
  isSubmitting: boolean
  serverError?: string | null
  successMessage?: string | null
}

export function LessonFormContent({
  form,
  validation,
  image,
  onSubmit,
  isSubmitting,
  serverError,
  successMessage,
}: LessonFormContentProps) {
  const [showPreview, setShowPreview] = useState(true)
  const stepImage = form.state.how[0]?.image || null

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <div className="space-y-4">
      {/* 預覽切換按鈕（手機顯示） */}
      <div className="md:hidden flex gap-2">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition ${
            showPreview
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          📱 預覽
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition ${
            !showPreview
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          ✏️ 編輯
        </button>
      </div>

      {/* 預覽面板（手機時全寬，桌面時右側） */}
      {showPreview && (
        <div className="md:hidden">
          <LessonPreview formState={form.state} />
        </div>
      )}

      {/* 編輯表單 */}
      <div className={`${showPreview && 'md:hidden'} md:grid md:grid-cols-3 md:gap-6`}>
        {/* 左側編輯欄（MD 以上時 2 列） */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
      {serverError && (
        <div className="rounded border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {serverError}
        </div>
      )}
      {successMessage && (
        <div className="rounded border border-emerald-500 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {successMessage}
        </div>
      )}

      <section className="space-y-2">
        <label className="block text-sm font-semibold text-white">課程標題</label>
        <input
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="例：以腳尖帶動板頭，穩定入門轉彎"
          value={form.state.title}
          onChange={event => form.setTitle(event.target.value)}
          onBlur={() => validation.validateField('title', form.state.title)}
        />
        {validation.errors.title && <p className="text-sm text-red-400">{validation.errors.title}</p>}
      </section>

      <RichTextEditor
        label="本課目標"
        value={form.state.what}
        onChange={value => {
          form.setWhat(value)
          validation.validateField('what', value)
        }}
        error={validation.errors.what}
        placeholder="描述這堂課希望學員掌握的重點..."
      />

      <ArrayInputField
        label="為什麼重要（每行一個理由）"
        value={form.state.why}
        onChange={values => {
          form.setWhy(values.filter(item => item.trim().length > 0))
          validation.validateField('why', values.filter(item => item.trim().length > 0))
        }}
        placeholder="例：提升穩定度"
        error={validation.errors.why}
        addLabel="+ 新增理由"
      />

      <section className="space-y-2">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-white">程度標籤</span>
            <ChipInput
              value={form.state.level_tags}
              options={LEVEL_OPTIONS.map(option => ({ label: option, value: option }))}
              onChange={values => {
                form.setLevelTags(values)
                validation.validateField('level_tags', values)
              }}
              error={validation.errors.level_tags}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-white">場地標籤</span>
            <ChipInput
              value={form.state.slope_tags}
              options={SLOPE_OPTIONS.map(option => ({ label: option, value: option }))}
              onChange={values => {
                form.setSlopeTags(values)
                validation.validateField('slope_tags', values)
              }}
              error={validation.errors.slope_tags}
            />
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500 focus:ring-amber-500"
            checked={form.state.is_premium}
            onChange={event => form.setIsPremium(event.target.checked)}
          />
          PRO 內容（僅付費解鎖）
        </label>
      </section>

      <section className="space-y-4 rounded border border-zinc-800 p-4">
        <label className="block text-sm font-semibold text-white">🛠️ 怎麼練</label>
        <StepEditor
          steps={form.state.how.map((step, index) => ({
            id: `step-${index}`,
            text: step.text,
            image: step.image,
          }))}
          onChange={newSteps => {
            const updatedHow = newSteps.map(step => ({
              text: step.text,
              image: step.image,
            }))
            form.setHow(updatedHow)
            validation.validateField('how', updatedHow)
          }}
        />
        {validation.errors.how && <p className="text-sm text-red-400">{validation.errors.how}</p>}
      </section>

      <section className="space-y-2">
        <label className="block text-sm font-semibold text-white">示範圖片（第一個步驟）</label>
        <ImageUploadZone
          uploader={image}
          previewUrl={stepImage ?? null}
          onRemove={async () => {
            form.updateStep(0, { image: undefined })
          }}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ArrayInputField
          label="做對的訊號（每行一個）"
          value={form.state.signals.correct}
          onChange={values => {
            form.setSignals({ ...form.state.signals, correct: values })
            validation.validateField('signals', { ...form.state.signals, correct: values })
          }}
          placeholder="例：肩膀放鬆"
        />
        <ArrayInputField
          label="做錯的訊號（每行一個）"
          value={form.state.signals.wrong}
          onChange={values => {
            form.setSignals({ ...form.state.signals, wrong: values })
            validation.validateField('signals', { ...form.state.signals, wrong: values })
          }}
          placeholder="例：膝蓋鎖死"
        />
        {validation.errors.signals && <p className="text-sm text-red-400">{validation.errors.signals}</p>}
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={form.reset}
          className="rounded border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-400"
        >
          重設
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-60"
        >
          {isSubmitting ? '儲存中...' : '儲存課程'}
        </button>
      </div>
    </form>

    {/* 右側預覽面板（桌面版顯示） */}
    <div className="hidden md:block md:col-span-1">
      <div className="sticky top-4">
        <LessonPreview formState={form.state} />
      </div>
    </div>
  </div>
    </div>
  )
}
