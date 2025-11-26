'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lesson } from '@/lib/lessons'
import { useAuth } from './AuthProvider'
import { getFavorites, addFavorite, removeFavorite } from '@/lib/favorites'

const LEVEL_NAMES: Record<string, string> = {
  beginner: '初級', intermediate: '中級', advanced: '進階'
}
const SLOPE_NAMES: Record<string, string> = {
  green: '綠道', blue: '藍道', black: '黑道', mogul: '蘑菇',
  powder: '粉雪', park: '公園', tree: '樹林', flat: '平地', all: '全地形'
}

export default function LessonDetail({ lesson }: { lesson: Lesson }) {
  const { user } = useAuth()
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {
    if (user) {
      getFavorites(user.id).then(favs => setIsFav(favs.includes(lesson.id)))
    }
  }, [user, lesson.id])

  const toggleFav = async () => {
    if (!user) return
    if (isFav) {
      await removeFavorite(user.id, lesson.id)
    } else {
      await addFavorite(user.id, lesson.id)
    }
    setIsFav(!isFav)
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-slate-400">← 返回</Link>
          {user && (
            <button onClick={toggleFav} className="text-2xl">
              {isFav ? '❤️' : '🤍'}
            </button>
          )}
        </div>

        <h1 className="text-xl font-bold mb-3">{lesson.title}</h1>

        <div className="flex flex-wrap gap-1 mb-6">
          {lesson.level_tags?.map(t => (
            <span key={t} className="px-2 py-1 text-xs rounded-full bg-green-600">{LEVEL_NAMES[t] || t}</span>
          ))}
          {lesson.slope_tags?.map(t => (
            <span key={t} className="px-2 py-1 text-xs rounded-full bg-blue-600">{SLOPE_NAMES[t] || t}</span>
          ))}
          {lesson.casi?.Primary_Skill && (
            <span className="px-2 py-1 text-xs rounded-full bg-purple-600">{lesson.casi.Primary_Skill}</span>
          )}
        </div>

        <section className="bg-slate-800 rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-2">😰 問題</h2>
          <p className="text-slate-300 leading-relaxed">{lesson.what}</p>
        </section>

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
              const text = h.text
                .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
                .replace(/^\d+\.\s*/, '')
                .replace(/^-\s*/, '')
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
      </div>
    </main>
  )
}
