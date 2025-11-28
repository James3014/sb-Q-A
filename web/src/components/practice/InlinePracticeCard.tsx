'use client'
import { useState } from 'react'
import { vibrate } from '@/components/ui/Button'

interface InlinePracticeCardProps {
  onSubmit: (ratings: { r1: number; r2: number; r3: number }) => Promise<void>
  onClose: () => void
}

function RatingSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="text-[var(--accent)] font-bold">{value}/5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-3 rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
        style={{ background: `linear-gradient(to right, var(--accent) ${(value - 1) * 25}%, #3f3f46 ${(value - 1) * 25}%)` }}
      />
      <div className="flex justify-between text-xs text-zinc-500">
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
          <RatingSlider 
            label="技術理解" 
            value={ratings.r1} 
            onChange={v => setRatings(prev => ({ ...prev, r1: v }))}
          />
          <RatingSlider 
            label="動作成功度" 
            value={ratings.r2} 
            onChange={v => setRatings(prev => ({ ...prev, r2: v }))}
          />
          <RatingSlider 
            label="穩定度" 
            value={ratings.r3} 
            onChange={v => setRatings(prev => ({ ...prev, r3: v }))}
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-14 mt-6 rounded-xl font-bold text-lg transition-all active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: 'var(--btn-success-bg)', color: 'var(--btn-success-text)' }}
        >
          {submitting ? '儲存中...' : '💾 儲存'}
        </button>
      </div>
    </div>
  )
}
