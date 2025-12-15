/**
 * LessonsStatsView
 * 課程統計視圖 - 純展示組件
 */

import { LessonStat } from '@/lib/adminData'

interface FilterBarProps {
  filterLevel: string
  onFilterLevelChange: (level: string) => void
  filterPremium: string
  onFilterPremiumChange: (premium: string) => void
  sortBy: 'views' | 'practices' | 'favorites'
  onSortByChange: (sortBy: 'views' | 'practices' | 'favorites') => void
}

interface Props {
  lessons: LessonStat[]
  filterBar: FilterBarProps
}

export function LessonsStatsView({ lessons, filterBar }: Props) {
  const { filterLevel, onFilterLevelChange, filterPremium, onFilterPremiumChange, sortBy, onSortByChange } = filterBar

  // 統計計算
  const totalViews = lessons.reduce((a, l) => a + l.views, 0)
  const totalPractices = lessons.reduce((a, l) => a + l.practices, 0)
  const totalFavorites = lessons.reduce((a, l) => a + l.favorites, 0)

  return (
    <>
      {/* 篩選控件 */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex gap-2 items-center">
          <span className="text-zinc-400 text-sm">程度：</span>
          {[
            { k: 'all', l: '全部' },
            { k: 'beginner', l: '初級' },
            { k: 'intermediate', l: '中級' },
            { k: 'advanced', l: '進階' }
          ].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => onFilterLevelChange(k)}
              className={`px-2 py-1 rounded text-xs ${
                filterLevel === k ? 'bg-green-600' : 'bg-zinc-800'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-zinc-400 text-sm">類型：</span>
          {[
            { k: 'all', l: '全部' },
            { k: 'free', l: '免費' },
            { k: 'pro', l: 'PRO' }
          ].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => onFilterPremiumChange(k)}
              className={`px-2 py-1 rounded text-xs ${
                filterPremium === k ? 'bg-amber-600' : 'bg-zinc-800'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-zinc-400 text-sm">排序：</span>
          {[
            { k: 'views', l: '瀏覽' },
            { k: 'practices', l: '練習' },
            { k: 'favorites', l: '收藏' }
          ].map(({ k, l }) => (
            <button
              key={k}
              onClick={() => onSortByChange(k as typeof sortBy)}
              className={`px-2 py-1 rounded text-xs ${
                sortBy === k ? 'bg-blue-600' : 'bg-zinc-800'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '篩選結果', value: lessons.length },
          { label: '總瀏覽', value: totalViews },
          { label: '總練習', value: totalPractices },
          { label: '總收藏', value: totalFavorites }
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-zinc-800 rounded-lg p-3 text-center"
          >
            <p className="text-zinc-400 text-xs">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* 課程列表 */}
      <div className="space-y-2">
        {lessons.slice(0, 50).map((lesson, index) => (
          <div
            key={lesson.id}
            className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-sm w-6">{index + 1}.</span>
                <span className="truncate">{lesson.title}</span>
                {lesson.is_premium && (
                  <span className="text-xs px-1 bg-amber-600/50 rounded">
                    PRO
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-4 text-sm text-zinc-400">
              <span>👁 {lesson.views}</span>
              <span>📝 {lesson.practices}</span>
              <span>❤️ {lesson.favorites}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
