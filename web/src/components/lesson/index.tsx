'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lesson } from '@/lib/lessons'
import { PracticeLog, PracticeRatings, getAvgRating } from '@/lib/practice'
import { LEVEL_NAMES, SLOPE_NAMES, formatDate } from '@/lib/constants'

// ============================================
// Header
// ============================================
export function LessonHeader({ 
  isFav, 
  favLoading, 
  onToggleFav,
  onShare,
  showActions 
}: { 
  isFav: boolean
  favLoading: boolean
  onToggleFav: () => void
  onShare: () => void
  showActions: boolean
}) {
  return (
    <div className="flex justify-between items-center mb-4">
      <Link href="/" className="text-zinc-400 hover:text-white">← 返回</Link>
      {showActions && (
        <div className="flex gap-3 items-center">
          <button onClick={onShare} className="text-xl hover:scale-110 transition">📤</button>
          <button onClick={onToggleFav} disabled={favLoading} className="text-2xl hover:scale-110 transition">
            {favLoading ? '⏳' : isFav ? '❤️' : '🤍'}
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// Title + Tags
// ============================================
export function LessonTitle({ lesson }: { lesson: Lesson }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-xl font-bold">{lesson.title}</h1>
        {lesson.is_premium && <span className="px-2 py-0.5 bg-amber-600/80 rounded text-xs">PRO</span>}
      </div>
      <div className="flex flex-wrap gap-1">
        {lesson.casi?.Primary_Skill && (
          <Link href={`/?skill=${lesson.casi.Primary_Skill}`} className="px-2 py-1 text-xs rounded-full bg-purple-600 hover:bg-purple-500">
            {lesson.casi.Primary_Skill}
          </Link>
        )}
        {lesson.level_tags?.map(t => (
          <Link key={t} href={`/?level=${t}`} className="px-2 py-1 text-xs rounded-full bg-green-600 hover:bg-green-500">
            {LEVEL_NAMES[t] || t}
          </Link>
        ))}
        {lesson.slope_tags?.map(t => (
          <Link key={t} href={`/?slope=${t}`} className="px-2 py-1 text-xs rounded-full bg-blue-600 hover:bg-blue-500">
            {SLOPE_NAMES[t] || t}
          </Link>
        ))}
      </div>
    </div>
  )
}

// ============================================
// What（問題）
// ============================================
export function LessonWhat({ what }: { what: string }) {
  return (
    <section className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h2 className="font-semibold mb-2 text-amber-400">😰 你可能遇到這些狀況</h2>
      <p className="text-zinc-300 leading-relaxed">{what}</p>
    </section>
  )
}

// ============================================
// Why（目標）
// ============================================
export function LessonWhy({ why }: { why: string[] }) {
  if (!why?.length) return null
  return (
    <section className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h2 className="font-semibold mb-2 text-blue-400">🎯 練習目標</h2>
      <ul className="text-zinc-300 space-y-1">
        {why.map((w, i) => <li key={i}>• {w}</li>)}
      </ul>
    </section>
  )
}

// ============================================
// Steps（How）- 卡片化
// ============================================
export function LessonSteps({ steps }: { steps: { text: string; image?: string | null }[] }) {
  if (!steps?.length) return null
  
  return (
    <section className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h2 className="font-semibold mb-3 text-green-400">🛠️ 怎麼練習</h2>
      <div className="space-y-4">
        {steps.map((step, i) => {
          const text = step.text
            .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
            .replace(/^\d+\.\s*/, '')
            .replace(/^-\s*/, '')
          return (
            <div key={i} className="bg-zinc-700/50 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  {/* 只有有圖片時才顯示 */}
                  {step.image && (
                    <div className="mb-2 rounded-lg overflow-hidden bg-zinc-600">
                      <img src={step.image} alt={`步驟 ${i + 1}`} className="w-full" />
                    </div>
                  )}
                  <p className="text-zinc-300 text-sm" dangerouslySetInnerHTML={{ __html: text }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ============================================
// Signals（做對/做錯）
// ============================================
export function LessonSignals({ correct, wrong }: { correct?: string[]; wrong?: string[] }) {
  if (!correct?.length && !wrong?.length) return null
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      {correct?.length ? (
        <section className="bg-zinc-800 rounded-lg p-4 border-l-4 border-green-500">
          <h2 className="font-semibold mb-2 text-green-400">✅ 做對時你會感覺</h2>
          <ul className="text-zinc-300 text-sm space-y-1">
            {correct.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </section>
      ) : null}
      {wrong?.length ? (
        <section className="bg-zinc-800 rounded-lg p-4 border-l-4 border-red-500">
          <h2 className="font-semibold mb-2 text-red-400">❌ 做錯時你可能感覺</h2>
          <ul className="text-zinc-300 text-sm space-y-1">
            {wrong.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

// ============================================
// Practice CTA + 三項評分彈窗 + 正向回饋
// ============================================
export function LessonPracticeCTA({ 
  onComplete,
  lastPractice,
  saving,
  totalPractices,
  improvement
}: { 
  onComplete: (note: string, ratings: PracticeRatings) => void
  lastPractice?: PracticeLog | null
  saving: boolean
  totalPractices?: number
  improvement?: number | null
}) {
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
      {/* 成功動畫 */}
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
            <button onClick={() => setShowModal(true)} className="mt-2 text-sm text-blue-400">
              再練一次 →
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowModal(true)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition"
          >
            🏂 完成練習
          </button>
        )}
      </section>

      {/* 評分彈窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">📝 這次練習給自己評分</h3>
            
            <div className="space-y-4 mb-4">
              <RatingRow label="技術理解" sublabel="我理解這個動作要怎麼做" value={ratings.rating1} onChange={v => setRatings(r => ({ ...r, rating1: v }))} />
              <RatingRow label="動作成功度" sublabel="我能做出這個動作" value={ratings.rating2} onChange={v => setRatings(r => ({ ...r, rating2: v }))} />
              <RatingRow label="穩定度" sublabel="我能穩定重複這個動作" value={ratings.rating3} onChange={v => setRatings(r => ({ ...r, rating3: v }))} />
            </div>

            <textarea 
              value={note} 
              onChange={e => setNote(e.target.value)}
              placeholder="今天練習的心得（選填）"
              className="w-full bg-zinc-700 rounded-lg p-3 text-sm mb-4 h-20"
            />

            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-zinc-700 rounded-lg">
                取消
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={saving}
                className="flex-1 py-2 bg-blue-600 rounded-lg font-medium disabled:opacity-50"
              >
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
          <button 
            key={n} 
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded text-lg ${n <= value ? 'bg-amber-500' : 'bg-zinc-700'}`}
          >
            ⭐
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Practice History（課程級別）
// ============================================
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

// ============================================
// Recommendations（弱項推薦）
// ============================================
export function LessonRecommendations({ 
  weakSkill, 
  recommendations 
}: { 
  weakSkill: string | null
  recommendations: { id: string; title: string }[]
}) {
  if (!weakSkill && !recommendations.length) {
    return (
      <section className="bg-zinc-800 rounded-lg p-4 mb-4 text-center">
        <p className="text-zinc-400 text-sm">🎯 開始練習即可看到專屬推薦！</p>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-r from-amber-900/30 to-zinc-800 rounded-lg p-4 mb-4 border border-amber-600/30">
      <h2 className="font-semibold mb-2 text-amber-400">
        🔥 {weakSkill ? `根據你的弱項（${weakSkill}），推薦練習` : '推薦練習'}
      </h2>
      <div className="space-y-2">
        {recommendations.map(r => (
          <Link 
            key={r.id} 
            href={`/lesson/${r.id}`}
            className="block bg-zinc-700/50 rounded p-2 text-sm hover:bg-zinc-700 transition"
          >
            {r.title}
          </Link>
        ))}
      </div>
    </section>
  )
}

// ============================================
// Sequence（次序式練習建議）
// ============================================
export function LessonSequence({ 
  prerequisite, 
  next, 
  similar 
}: { 
  prerequisite: { id: string; title: string } | null
  next: { id: string; title: string } | null
  similar: { id: string; title: string }[]
}) {
  if (!prerequisite && !next && !similar.length) return null

  return (
    <section className="bg-zinc-800 rounded-lg p-4 mb-4">
      <h2 className="font-semibold mb-3">📚 學習路徑</h2>
      <div className="space-y-2">
        {prerequisite && (
          <Link href={`/lesson/${prerequisite.id}`} className="flex items-center gap-2 p-2 bg-zinc-700/50 rounded hover:bg-zinc-700 transition">
            <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">先看</span>
            <span className="text-sm text-zinc-300 truncate">{prerequisite.title}</span>
          </Link>
        )}
        {next && (
          <Link href={`/lesson/${next.id}`} className="flex items-center gap-2 p-2 bg-zinc-700/50 rounded hover:bg-zinc-700 transition">
            <span className="text-xs bg-green-600 px-2 py-0.5 rounded">下一步</span>
            <span className="text-sm text-zinc-300 truncate">{next.title}</span>
          </Link>
        )}
        {similar.map(s => (
          <Link key={s.id} href={`/lesson/${s.id}`} className="flex items-center gap-2 p-2 bg-zinc-700/50 rounded hover:bg-zinc-700 transition">
            <span className="text-xs bg-zinc-600 px-2 py-0.5 rounded">相似</span>
            <span className="text-sm text-zinc-300 truncate">{s.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ============================================
// PRO 解鎖區（柔性引導）
// ============================================
export function LessonUnlockPRO() {
  return (
    <section className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg p-6 text-center border border-zinc-700">
      <p className="text-3xl mb-3">🔒</p>
      <h3 className="font-bold mb-2">本課程包含更多細節</h3>
      <p className="text-zinc-400 text-sm mb-4">
        升級 PRO 解鎖 185 堂課程 + 越變越強的儀表板
      </p>
      <Link href="/pricing" className="inline-block bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-medium transition">
        查看方案 →
      </Link>
    </section>
  )
}
