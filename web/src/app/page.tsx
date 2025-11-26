'use client'

import { useState, useMemo } from 'react'
import { getLessons, filterLessons } from '@/lib/lessons'
import LessonCard from '@/components/LessonCard'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'

export default function Home() {
  const allLessons = getLessons()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ level: '', slope: '', skill: '' })

  const lessons = useMemo(() => {
    return filterLessons({
      search: search || undefined,
      level: filters.level || undefined,
      slope: filters.slope || undefined,
      skill: filters.skill || undefined
    })
  }, [search, filters])

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">🏂 單板教學</h1>

        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <FilterBar
          level={filters.level}
          slope={filters.slope}
          skill={filters.skill}
          onChange={setFilters}
        />

        <p className="text-slate-400 text-sm mb-4">
          找到 {lessons.length} 個練習
        </p>

        <div>
          {lessons.map(lesson => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </div>
    </main>
  )
}
