'use client'

import Image from 'next/image'
import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'
import { StatusBadge } from '@/components/ui'

export interface LessonPreviewProps {
  formState: UseLessonFormState
}

export function LessonPreview({ formState }: LessonPreviewProps) {
  const { title, what, why, how, signals, level_tags, slope_tags, is_premium } = formState

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      {/* 標題和標籤 */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">
            {title || '（未設定標題）'}
          </h2>
          {is_premium && (
            <StatusBadge variant="warning" size="sm">
              PRO
            </StatusBadge>
          )}
        </div>

        {/* 標籤 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {level_tags?.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {tag}
            </span>
          ))}
          {slope_tags?.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* WHAT 章節 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">這個練習學什麼</h3>
        <p className="text-zinc-300 leading-relaxed">
          {what || '（未填寫說明）'}
        </p>
      </div>

      {/* WHY 章節 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">為什麼要練</h3>
        {why && why.length > 0 ? (
          <ul className="space-y-2">
            {why.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-zinc-300">
                <span className="text-blue-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500 text-sm">（未填寫）</p>
        )}
      </div>

      {/* HOW 章節 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">怎麼練</h3>
        {how && how.length > 0 ? (
          <div className="space-y-4">
            {how.map((step, idx) => (
              <div key={idx} className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-600 text-white">
                    步驟 {idx + 1}
                  </span>
                </div>
                {step.image && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={step.image}
                      alt={'步驟 ' + (idx + 1)}
                      width={400}
                      height={300}
                      className="w-full h-auto"
                    />
                  </div>
                )}
                <p className="text-zinc-300 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">（未填寫）</p>
        )}
      </div>

      {/* SIGNALS 章節 */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 正確信號 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">做對的訊號 ✅</h3>
            {signals?.correct && signals.correct.length > 0 ? (
              <ul className="space-y-2">
                {signals.correct.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 text-sm">（未填寫）</p>
            )}
          </div>

          {/* 錯誤信號 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">做錯的訊號 ❌</h3>
            {signals?.wrong && signals.wrong.length > 0 ? (
              <ul className="space-y-2">
                {signals.wrong.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-red-400 mt-1">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 text-sm">（未填寫）</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
