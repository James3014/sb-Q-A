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
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-semibold text-zinc-300">{label}</span>
        <span className="text-2xl font-bold text-amber-400">{value}/5</span>
      </div>
      
      {/* 5 個分段按鈕 */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(score => (
          <button
            key={score}
            onClick={() => {
              onChange(score)
              if (navigator.vibrate) navigator.vibrate(10)
            }}
            className={`
              flex-1 h-12 rounded-lg text-base font-bold transition-all duration-200
              ${value >= score
                ? 'bg-amber-500 text-slate-900 scale-105'
                : 'bg-slate-700 text-slate-400'
              }
              active:scale-95
            `}
          >
            {score}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between mt-2 text-sm text-slate-400">
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-zinc-900 rounded-t-3xl border-t-2 border-[var(--accent)] p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">🏂 完成練習！</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-2xl">×</button>
        </div>

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

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-lg font-bold text-slate-900 disabled:opacity-50 active:scale-98 transition-transform"
        >
          {submitting ? '儲存中...' : '✓ 儲存練習紀錄'}
        </button>
      </div>
    </div>
  )
}
