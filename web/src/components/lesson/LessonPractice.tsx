'use client'

import { useState } from 'react'
import { PracticeLog, PracticeRatings, getAvgRating } from '@/lib/practice'
import { formatDate } from '@/lib/constants'

interface CTAProps {
  onComplete: (note: string, ratings: PracticeRatings) => void
  lastPractice?: PracticeLog | null
  saving: boolean
  totalPractices?: number
  improvement?: number | null
}

export function LessonPracticeCTA({ onComplete, lastPractice, saving, totalPractices, improvement }: CTAProps) {
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [note, setNote] = useState('')
  const [ratings, setRatings] = useState<PracticeRatings>({ rating1: 3, rating2: 3, rating3: 3 })

  const handleSubmit = () => {
    onComplete(note, ratings)
    setShowModal(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)
    setNote('')
    setRatings({ rating1: 3, rating2: 3, rating3: 3 })
  }

  const avgRating = lastPractice ? getAvgRating(lastPractice) : null
  const isToday = lastPractice && new Date(lastPractice.created_at).toDateString() === new Date().toDateString()

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-xl font-bold text-green-400 mb-2">做得好！</p>
            <p className="text-zinc-300">+1 次練習（累計 {(totalPractices || 0) + 1} 次）</p>
            {improvement !== null && improvement !== undefined && (
              <p className="text-sm text-zinc-400 mt-2">
                改善度：<span className={improvement >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {improvement >= 0 ? '↑' : '↓'} {Math.abs(improvement).toFixed(1)}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      <section className="bg-gradient-to-r from-blue-900/50 to-zinc-800 rounded-lg p-4 mb-4 border border-blue-600/30">
        {isToday && avgRating ? (
          <div className="text-center">
            <p className="text-green-400 font-medium mb-1">✔ 已完成（今天）</p>
            <p className="text-2xl font-bold">⭐ {avgRating.toFixed(1)} / 5.0</p>
            <button onClick={() => setShowModal(true)} className="mt-2 text-sm text-blue-400">再練一次 →</button>
          </div>
        ) : (
          <button onClick={() => setShowModal(true)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition">
            🏂 完成練習
          </button>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">📝 這次練習給自己評分</h3>
            <div className="space-y-4 mb-4">
              <RatingRow label="技術理解" sublabel="我理解這個動作要怎麼做" value={ratings.rating1} onChange={v => setRatings(r => ({ ...r, rating1: v }))} />
              <RatingRow label="動作成功度" sublabel="我能做出這個動作" value={ratings.rating2} onChange={v => setRatings(r => ({ ...r, rating2: v }))} />
              <RatingRow label="穩定度" sublabel="我能穩定重複這個動作" value={ratings.rating3} onChange={v => setRatings(r => ({ ...r, rating3: v }))} />
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="今天練習的心得（選填）" className="w-full bg-zinc-700 rounded-lg p-3 text-sm mb-4 h-20" />
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-zinc-700 rounded-lg">取消</button>
              <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2 bg-blue-600 rounded-lg font-medium disabled:opacity-50">
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function RatingRow({ label, sublabel, value, onChange }: { label: string; sublabel: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-zinc-500 mb-2">{sublabel}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => onChange(n)} className={`flex-1 py-2 rounded text-lg ${n <= value ? 'bg-amber-500' : 'bg-zinc-700'}`}>⭐</button>
        ))}
      </div>
    </div>
  )
}

export function LessonPracticeHistory({ logs }: { logs: PracticeLog[] }) {
  if (!logs?.length) return null
  return (
    <section className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h2 className="font-semibold mb-3">📅 最近練習紀錄</h2>
      <div className="space-y-2">
        {logs.slice(0, 5).map(log => {
          const avg = getAvgRating(log)
          return (
            <div key={log.id} className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">{formatDate(log.created_at, 'short')}</span>
              <span className="text-amber-400">⭐ {avg?.toFixed(1) || '-'}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
