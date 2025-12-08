'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ImprovementData, SkillFrequency, ImprovementPoint, getPracticeFrequencyBySkill, getSkillImprovementCurve } from '@/lib/improvement'
import { Lesson } from '@/lib/lessons'
import { useAuth } from './AuthProvider'

// Components
import { ImprovementSummary } from './dashboard/ImprovementSummary'
import { StatsOverview } from './dashboard/StatsOverview'
import { SkillDistribution } from './dashboard/SkillDistribution'
import { WeaknessAlert } from './dashboard/WeaknessAlert'
import { PracticeTrend } from './dashboard/PracticeTrend'
import { RecentPracticeList } from './dashboard/RecentPracticeList'
import { PracticeAnalytics } from './dashboard/PracticeAnalytics'
import { SkillImprovementChart } from './dashboard/SkillImprovementChart'

export function ImprovementDashboard({ data, lessons }: { data: ImprovementData; lessons: Lesson[] }) {
  const { user } = useAuth()
  const [trendDays, setTrendDays] = useState<7 | 30>(30)

  // 🆕 新增狀態管理
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [skillCurveData, setSkillCurveData] = useState<ImprovementPoint[]>([])
  const [practiceFrequency, setPracticeFrequency] = useState<SkillFrequency[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // 🆕 初次載入練習頻率分析
  useEffect(() => {
    if (user) {
      loadPracticeFrequency()
    }
  }, [user])

  // 🆕 當選擇技能時，載入該技能的進步曲線
  useEffect(() => {
    if (selectedSkill && user) {
      loadSkillCurve(selectedSkill)
    }
  }, [selectedSkill, user])

  // 🆕 載入練習頻率分析
  async function loadPracticeFrequency() {
    if (!user) return
    setAnalyticsLoading(true)
    const freq = await getPracticeFrequencyBySkill(user.id, 30)
    setPracticeFrequency(freq)

    // 自動選擇練習最多的技能
    if (freq.length > 0 && !selectedSkill) {
      setSelectedSkill(freq[0].skill)
    }
    setAnalyticsLoading(false)
  }

  // 🆕 載入技能進步曲線
  async function loadSkillCurve(skill: string) {
    if (!user) return
    const curve = await getSkillImprovementCurve(user.id, skill, 30)
    setSkillCurveData(curve)
  }

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
        <div className="glass-panel rounded-lg p-4 border-l-4 border-l-brand-red">
          <p className="text-sm">🏂 已經 <span className="text-brand-red font-bold text-lg">{daysSinceLastPractice}</span> 天沒練習囉！</p>
          <p className="text-xs text-zinc-400 mt-1">試試看回到雪場核心技巧的習題吧</p>
          <Link href="/" className="inline-block mt-3 text-sm text-brand-red hover:text-red-400 transition-colors font-medium">開始練習 →</Link>
        </div>
      )}

      {/* 🆕 練習頻率分析組件 */}
      {analyticsLoading ? (
        <div className="glass-panel rounded-lg p-8 text-center border border-zinc-700/50">
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full" />
          </div>
        </div>
      ) : (
        <PracticeAnalytics data={practiceFrequency} />
      )}

      {/* 🆕 技能選擇器 */}
      {practiceFrequency.length > 0 && (
        <div className="glass-panel rounded-lg p-4 border border-zinc-700/50">
          <h3 className="font-bebas text-lg mb-3">選擇技能查看進步曲線</h3>
          <div className="flex gap-2 flex-wrap">
            {practiceFrequency.map(item => (
              <button
                key={item.skill}
                onClick={() => setSelectedSkill(item.skill)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-200
                  ${selectedSkill === item.skill
                    ? 'bg-gradient-to-r from-brand-red to-red-500 text-white shadow-lg shadow-red-500/50 scale-105'
                    : 'bg-zinc-700/60 text-zinc-300 hover:bg-zinc-600 border border-zinc-600/60'
                  }
                `}
              >
                {item.skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🆕 技能進步曲線圖 */}
      {selectedSkill && (
        <SkillImprovementChart
          skillName={selectedSkill}
          data={skillCurveData}
        />
      )}

      <PracticeTrend trend={data.trend} trendDays={trendDays} setTrendDays={setTrendDays} />
      <RecentPracticeList recentPractice={data.recentPractice} />
    </div>
  )
}
