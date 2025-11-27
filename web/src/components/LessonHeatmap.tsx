'use client'

import { useState } from 'react'
import { Lesson } from '@/lib/lessons'

interface LessonStat {
  id: string
  views: number
  practices: number
  favorites: number
}

type HeatmapType = 'level' | 'skill' | 'slope'

interface Props {
  lessons: Lesson[]
  stats: LessonStat[]
}

export function LessonHeatmap({ lessons, stats }: Props) {
  const [type, setType] = useState<HeatmapType>('level')
  
  const statsMap = new Map(stats.map(s => [s.id, s]))

  const getData = () => {
    if (type === 'level') {
      const levels = [
        { key: 'beginner', label: '初級' },
        { key: 'intermediate', label: '中級' },
        { key: 'advanced', label: '進階' },
      ]
      return levels.map(({ key, label }) => {
        const filtered = lessons.filter(l => l.level_tags?.includes(key))
        const s = filtered.map(l => statsMap.get(l.id)).filter(Boolean) as LessonStat[]
        return {
          label,
          count: filtered.length,
          views: s.reduce((a, x) => a + x.views, 0),
          practices: s.reduce((a, x) => a + x.practices, 0),
          favorites: s.reduce((a, x) => a + x.favorites, 0),
        }
      })
    }
    
    if (type === 'skill') {
      const skills = ['站姿與平衡', '旋轉', '用刃', '壓力控制', '時機與協調性']
      return skills.map(skill => {
        const filtered = lessons.filter(l => l.casi?.Primary_Skill === skill)
        const s = filtered.map(l => statsMap.get(l.id)).filter(Boolean) as LessonStat[]
        return {
          label: skill,
          count: filtered.length,
          views: s.reduce((a, x) => a + x.views, 0),
          practices: s.reduce((a, x) => a + x.practices, 0),
          favorites: s.reduce((a, x) => a + x.favorites, 0),
        }
      })
    }
    
    const slopes = [
      { key: 'green', label: '綠道' }, { key: 'blue', label: '藍道' }, { key: 'black', label: '黑道' },
      { key: 'mogul', label: '蘑菇' }, { key: 'powder', label: '粉雪' }, { key: 'park', label: '公園' }, { key: 'tree', label: '樹林' },
    ]
    return slopes.map(({ key, label }) => {
      const filtered = lessons.filter(l => l.slope_tags?.includes(key))
      const s = filtered.map(l => statsMap.get(l.id)).filter(Boolean) as LessonStat[]
      return {
        label,
        count: filtered.length,
        views: s.reduce((a, x) => a + x.views, 0),
        practices: s.reduce((a, x) => a + x.practices, 0),
        favorites: s.reduce((a, x) => a + x.favorites, 0),
      }
    })
  }

  const data = getData()
  const maxViews = Math.max(...data.map(d => d.views), 1)

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['level', 'skill', 'slope'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-2 rounded text-sm ${type === t ? 'bg-blue-600' : 'bg-zinc-800'}`}
          >
            {t === 'level' ? '程度' : t === 'skill' ? 'CASI 技能' : '雪道類型'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {data.map(d => (
          <div key={d.label} className="bg-zinc-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{d.label}</span>
              <span className="text-xs text-zinc-500">{d.count} 堂課</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {[
                { label: '瀏覽', value: d.views, color: 'bg-blue-500' },
                { label: '練習', value: d.practices, color: 'bg-green-500' },
                { label: '收藏', value: d.favorites, color: 'bg-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="text-zinc-500 text-xs mb-1">{label}</p>
                  <div className="h-4 bg-zinc-700 rounded overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${(value / maxViews) * 100}%` }} />
                  </div>
                  <p className="text-xs mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
