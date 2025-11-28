'use client'
import { useState } from 'react'
import { vibrate } from '@/components/ui/Button'

interface InlinePracticeCardProps {
  onSubmit: (ratings: { r1: number; r2: number; r3: number }) => Promise<void>
  onClose: () => void
}

function RatingButtons({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-6">
      {/* 標籤與當前分數 */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-lg font-bold text-gradient-velocity"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {label}
        </span>
        <span className="
          px-3 py-1
          bg-gradient-to-r from-amber-500/30 to-orange-500/30
          border border-amber-400/40
          rounded-full
          text-lg font-bold text-amber-300
        ">
          {value}/5
        </span>
      </div>

      {/* 5 個分段按鈕 - Alpine Velocity 風格 */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(score => (
          <button
            key={score}
            onClick={() => {
              onChange(score)
              if (navigator.vibrate) navigator.vibrate(10)
            }}
            className={`
              velocity-shine
              flex-1 h-12
              rounded-lg
              text-base font-bold
              transition-all duration-200
              active:scale-95
              ${value >= score
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-black scale-105 shadow-lg shadow-amber-500/40'
                : 'bg-zinc-700 text-zinc-400 border border-zinc-600'
              }
            `}
          >
            {score}
          </button>
        ))}
      </div>

      {/* 提示文字 */}
      <div className="flex justify-between mt-2 text-xs text-zinc-400 font-semibold">
        <span>需加強</span>
        <span>很好</span>
      </div>
    </div>
  )
}

export function InlinePracticeCard({ onSubmit, onClose }: InlinePracticeCardProps) {
  const [ratings, setRatings] = useState({ r1: 3, r2: 3, r3: 3 })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    vibrate()

    await onSubmit(ratings)

    // Confetti 效果
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then(confetti => {
        confetti.default({ particleCount: 100, spread: 70, origin: { y: 0.8 } })
      }).catch(() => {})
    }

    vibrate([50, 100, 50])
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Alpine Velocity 評分卡片 */}
      <div
        className="
          w-full max-w-lg
          bg-zinc-900
          rounded-t-3xl
          border-t-4 border-amber-500
          p-6 pb-8
          animate-slide-up
          [clip-path:polygon(0_16px,16px_0,100%_0,100%_100%,0_100%)]
        "
        onClick={e => e.stopPropagation()}
      >
        {/* 標題列 */}
        <div className="flex justify-between items-center mb-6">
          <h3
            className="text-2xl font-bold text-gradient-velocity"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            🏂 完成練習！
          </h3>
          <button
            onClick={onClose}
            className="
              w-10 h-10
              flex items-center justify-center
              text-zinc-400 hover:text-white
              text-2xl
              rounded-full
              hover:bg-zinc-800
              transition-all
              active:scale-90
            "
          >
            ×
          </button>
        </div>

        {/* 三個評分維度 */}
        <div className="space-y-6">
          <RatingButtons
            label="技術理解"
            value={ratings.r1}
            onChange={v => setRatings(prev => ({ ...prev, r1: v }))}
          />
          <RatingButtons
            label="動作成功度"
            value={ratings.r2}
            onChange={v => setRatings(prev => ({ ...prev, r2: v }))}
          />
          <RatingButtons
            label="穩定度"
            value={ratings.r3}
            onChange={v => setRatings(prev => ({ ...prev, r3: v }))}
          />
        </div>

        {/* 儲存按鈕 - Alpine Velocity 風格 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="
            velocity-shine
            w-full mt-6
            h-14
            rounded-2xl
            bg-gradient-to-r from-amber-500 to-orange-500
            text-lg font-bold text-black
            shadow-lg shadow-amber-500/40
            disabled:opacity-50 disabled:shadow-none
            active:scale-[0.98]
            transition-all
          "
        >
          {submitting ? '⏳ 儲存中...' : '✓ 儲存練習紀錄'}
        </button>
      </div>
    </div>
  )
}
