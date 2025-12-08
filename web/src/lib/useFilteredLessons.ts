import { useMemo } from 'react'
import { Lesson } from './lessons'
import { PROBLEM_CATEGORIES } from './constants'

interface FilterParams {
  lessons: Lesson[]
  search: string
  selectedCategory: string | null
  levelFilter: string | null
  slopeFilter: string | null
  skillFilter: string | null
}

export function useFilteredLessons({
  lessons,
  search,
  selectedCategory,
  levelFilter,
  slopeFilter,
  skillFilter,
}: FilterParams) {
  return useMemo(() => {
    let filtered = lessons

    if (levelFilter) {
      filtered = filtered.filter(l => l.level_tags?.includes(levelFilter))
    }
    if (slopeFilter) {
      filtered = filtered.filter(l => l.slope_tags?.includes(slopeFilter))
    }
    if (skillFilter) {
      filtered = filtered.filter(l => l.casi?.Primary_Skill === skillFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.what.toLowerCase().includes(q)
      )
    }
    if (selectedCategory) {
      const cat = PROBLEM_CATEGORIES.find(c => c.id === selectedCategory)
      if (cat) {
        filtered = filtered.filter(l =>
          cat.keywords.some(k => l.title.includes(k) || l.what.includes(k))
        )
      }
    }

    // 排序：免費課程在前，PRO 在後；保持穩定次序避免改動原陣列
    const sorted = [...filtered].sort((a, b) => {
      if (!!a.is_premium === !!b.is_premium) {
        return a.id.localeCompare(b.id)
      }
      return a.is_premium ? 1 : -1
    })

    return sorted
  }, [lessons, search, selectedCategory, levelFilter, slopeFilter, skillFilter])
}
