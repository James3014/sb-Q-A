'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lesson } from '@/lib/lessons'
import { useAuth } from './AuthProvider'
import { isFavorited, addFavorite, removeFavorite } from '@/lib/favorites'
import { addPracticeLog } from '@/lib/practice'

const LEVEL_NAMES: Record<string, string> = { beginner: '初級', intermediate: '中級', advanced: '進階' }
const SLOPE_NAMES: Record<string, string> = { green: '綠道', blue: '藍道', black: '黑道', mogul: '蘑菇', powder: '粉雪', park: '公園', tree: '樹林', flat: '平地', all: '全地形' }

export default function LessonDetail({ lesson }: { lesson: Lesson }) {
  const { user } = useAuth()
  const [isFav, setIsFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // TODO: 從 user metadata 檢查是否為 Premium 用戶
  const isPremiumUser = false
  const isLocked = lesson.is_premium && !isPremiumUser

  useEffect(() => {
    if (user) isFavorited(user.id, lesson.id).then(setIsFav)
  }, [user, lesson.id])

  const handleToggleFav = async () => {
    if (!user || favLoading) return
    setFavLoading(true)
    const result = isFav ? await removeFavorite(user.id, lesson.id) : await addFavorite(user.id, lesson.id)
    if (result.success) setIsFav(!isFav)
    setFavLoading(false)
  }

  const savePractice = async () => {
    if (!user || !note.trim()) return
    setNoteStatus('saving')
    const result = await addPracticeLog(user.id, lesson.id, note)
    if (result.success) {
      setNoteStatus('saved')
      setNote('')
      setTimeout(() => { setNoteStatus('idle'); setShowNote(false) }, 1500)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-slate-400">← 返回</Link>
          {user && !isLocked && (
            <div className="flex gap-3 items-center">
              <button onClick={() => setShowNote(!showNote)} className="text-xl">📝</button>
              <button onClick={handleToggleFav} disabled={favLoading} className="text-2xl">
                {favLoading ? '⏳' : isFav ? '❤️' : '🤍'}
              </button>
            </div>
          )}
        </div>

        {showNote && user && (
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="記錄今天的練習心得..." className="w-full bg-slate-700 rounded p-2 text-sm mb-2 h-20" />
            <button onClick={savePractice} disabled={noteStatus === 'saving' || !note.trim()} className="bg-blue-600 px-4 py-2 rounded text-sm disabled:opacity-50">
              {noteStatus === 'saving' ? '儲存中...' : noteStatus === 'saved' ? '✓ 已儲存' : '儲存紀錄'}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-xl font-bold">{lesson.title}</h1>
          {lesson.is_premium && <span className="px-2 py-0.5 bg-amber-600/80 rounded text-xs text-amber-100">PRO</span>}
        </div>

        <div className="flex flex-wrap gap-1 mb-6">
          {lesson.level_tags?.map(t => <span key={t} className="px-2 py-1 text-xs rounded-full bg-green-600">{LEVEL_NAMES[t] || t}</span>)}
          {lesson.slope_tags?.map(t => <span key={t} className="px-2 py-1 text-xs rounded-full bg-blue-600">{SLOPE_NAMES[t] || t}</span>)}
          {lesson.casi?.Primary_Skill && <span className="px-2 py-1 text-xs rounded-full bg-purple-600">{lesson.casi.Primary_Skill}</span>}
        </div>

        <section className="bg-slate-800 rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-2">😰 問題</h2>
          <p className="text-slate-300 leading-relaxed">{lesson.what}</p>
        </section>

        {isLocked ? (
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg p-6 text-center">
            <p className="text-4xl mb-4">🔒</p>
            <h3 className="text-lg font-bold mb-2">升級解鎖完整內容</h3>
            <p className="text-slate-400 text-sm mb-4">包含目標、練習方法、做對/做錯訊號</p>
            <Link href="/pricing" className="inline-block bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-medium">
              查看方案 →
            </Link>
          </div>
        ) : (
          <>
            <section className="bg-slate-800 rounded-lg p-4 mb-4">
              <h2 className="font-semibold mb-2">🎯 目標</h2>
              <ul className="text-slate-300 space-y-1">
                {lesson.why?.map((w, i) => <li key={i}>• {w}</li>)}
              </ul>
            </section>

            <section className="bg-slate-800 rounded-lg p-4 mb-4">
              <h2 className="font-semibold mb-2">🛠️ 怎麼練</h2>
              <div className="text-slate-300 space-y-2">
                {lesson.how?.map((h, i) => {
                  const text = h.text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^\d+\.\s*/, '').replace(/^-\s*/, '')
                  return <p key={i} dangerouslySetInnerHTML={{ __html: `<strong>${i + 1}.</strong> ${text}` }} />
                })}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <section className="bg-slate-800 rounded-lg p-4">
                <h2 className="font-semibold mb-2 text-green-400">✅ 做對</h2>
                <ul className="text-slate-300 text-sm space-y-1">
                  {lesson.signals?.correct?.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </section>
              <section className="bg-slate-800 rounded-lg p-4">
                <h2 className="font-semibold mb-2 text-red-400">❌ 做錯</h2>
                <ul className="text-slate-300 text-sm space-y-1">
                  {lesson.signals?.wrong?.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </section>
            </div>

            {(lesson.casi?.Primary_Skill || lesson.casi?.Core_Competency) && (
              <section className="bg-slate-800 rounded-lg p-4">
                <h2 className="font-semibold mb-2">📚 CASI</h2>
                <p className="text-slate-300 text-sm">技能：{lesson.casi.Primary_Skill}</p>
                <p className="text-slate-300 text-sm">能力：{lesson.casi.Core_Competency}</p>
              </section>
            )}

            {user && (
              <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-4">
                <div className="max-w-lg mx-auto flex gap-3">
                  <button
                    onClick={handleToggleFav}
                    disabled={favLoading}
                    className={`flex-1 py-3 rounded-lg font-medium ${isFav ? 'bg-pink-600' : 'bg-slate-700'}`}
                  >
                    {favLoading ? '⏳' : isFav ? '❤️ 已收藏' : '🤍 加入收藏'}
                  </button>
                  <button
                    onClick={() => setShowNote(true)}
                    className="flex-1 py-3 rounded-lg font-medium bg-blue-600"
                  >
                    📝 完成練習
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
