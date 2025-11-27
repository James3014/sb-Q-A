'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImprovementData } from '@/lib/improvement'
import { Lesson } from '@/lib/lessons'

// Components
import { ImprovementSummary } from './dashboard/ImprovementSummary'
import { StatsOverview } from './dashboard/StatsOverview'
import { SkillDistribution } from './dashboard/SkillDistribution'
import { WeaknessAlert } from './dashboard/WeaknessAlert'
import { PracticeTrend } from './dashboard/PracticeTrend'
import { RecentPracticeList } from './dashboard/RecentPracticeList'

export function ImprovementDashboard({ data, lessons }: { data: ImprovementData; lessons: Lesson[] }) {
  const [trendDays, setTrendDays] = useState<7 | 30>(30)

  const weakSkill = data.skills.length > 0
    ? data.skills.reduce((min, s) => s.score < min.score ? s : min, data.skills[0])
    : null

  const lastPracticeDate = data.recentPractice?.[0]?.date
  const daysSinceLastPractice = lastPracticeDate
    ? Math.floor((Date.now() - new Date(lastPracticeDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-4">
      <ImprovementSummary data={data} />
      <StatsOverview data={data} />
      <SkillDistribution skills={data.skills} />
      <WeaknessAlert weakSkill={weakSkill} lessons={lessons} />

      {/* 久未練習提示 */}
      {daysSinceLastPractice !== null && daysSinceLastPractice >= 5 && (
        <div className="bg-zinc-800 rounded-lg p-4 border border-blue-600/30">
          <p className="text-sm">🏂 已經 <span className="text-blue-400 font-bold">{daysSinceLastPractice}</span> 天沒練習囉！</p>
          <p className="text-xs text-zinc-500 mt-1">試試看回到雪場核心技巧的習題吧</p>
          <Link href="/" className="inline-block mt-2 text-sm text-blue-400">開始練習 →</Link>
        </div>
      )}

      <PracticeTrend trend={data.trend} trendDays={trendDays} setTrendDays={setTrendDays} />
      <RecentPracticeList recentPractice={data.recentPractice} />
    </div>
  )
}
