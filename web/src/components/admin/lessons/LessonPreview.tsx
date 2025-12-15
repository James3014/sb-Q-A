'use client'

import type { UseLessonFormReturn } from '@/hooks/lessons/useLessonForm'

interface LessonPreviewProps {
  form: UseLessonFormReturn
}

/**
 * 課程預覽組件 - 實時顯示課程最終排版
 * 手機友好的設計，模擬學生看到的樣子
 */
export function LessonPreview({ form }: LessonPreviewProps) {
  const { state } = form

  return (
    <div className="bg-slate-900 text-white rounded-lg overflow-hidden border border-zinc-700">
      {/* 預覽標題 */}
      <div className="bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-400">
        📱 課程預覽（手機版）
      </div>

      {/* 預覽內容 - 模擬手機屏幕 */}
      <div className="bg-black aspect-video sm:aspect-auto sm:max-h-[600px] overflow-y-auto">
        <div className="bg-slate-900 text-white p-4 space-y-4">
          {/* 課程標題 */}
          <div className="space-y-2">
            <h1 className="text-xl font-bold break-words">
              {state.title || '（課程標題）'}
            </h1>
            <div className="flex flex-wrap gap-2">
              {state.is_premium && (
                <span className="inline-block bg-amber-600 px-2 py-1 text-xs rounded font-semibold">
                  🔒 PRO
                </span>
              )}
              {state.level_tags && state.level_tags.length > 0 && (
                <div className="flex gap-1">
                  {state.level_tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-block bg-blue-600 px-2 py-1 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {state.slope_tags && state.slope_tags.length > 0 && (
                <div className="flex gap-1">
                  {state.slope_tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-block bg-green-600 px-2 py-1 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 課程目標 */}
          {state.what && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-zinc-300">📌 課程問題</h2>
              <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {state.what}
              </div>
            </div>
          )}

          {/* 為什麼重要 */}
          {state.why && state.why.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-zinc-300">🎯 為什麼重要</h2>
              <ul className="text-sm text-zinc-400 space-y-1 ml-4">
                {state.why.map((item, i) => (
                  <li key={i} className="list-disc">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 教學步驟 */}
          {state.how && state.how.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-300">📖 教學步驟</h2>
              {state.how.map((step, i) => (
                <div key={i} className="bg-zinc-800 rounded p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-zinc-700 rounded-full text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300">步驟 {i + 1}</span>
                  </div>
                  <p className="text-sm text-zinc-400 whitespace-pre-wrap">
                    {step.text || '（步驟內容）'}
                  </p>
                  {step.image && (
                    <img
                      src={step.image}
                      alt={`步驟 ${i + 1}`}
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 做對的信號 */}
          {state.signals?.correct && state.signals.correct.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-emerald-400">✅ 做對的信號</h2>
              <ul className="text-sm text-zinc-400 space-y-1 ml-4">
                {state.signals.correct.map((item, i) => (
                  <li key={i} className="list-disc">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 做錯的信號 */}
          {state.signals?.wrong && state.signals.wrong.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-red-400">❌ 做錯的信號</h2>
              <ul className="text-sm text-zinc-400 space-y-1 ml-4">
                {state.signals.wrong.map((item, i) => (
                  <li key={i} className="list-disc">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 空白 */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  )
}
