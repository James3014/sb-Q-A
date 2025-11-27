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
    let result = lessons

    if (levelFilter) {
      result = result.filter(l => l.level_tags?.includes(levelFilter))
    }
    if (slopeFilter) {
      result = result.filter(l => l.slope_tags?.includes(slopeFilter))
    }
    if (skillFilter) {
      result = result.filter(l => l.casi?.Primary_Skill === skillFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.what.toLowerCase().includes(q)
      )
    }
    if (selectedCategory) {
      const cat = PROBLEM_CATEGORIES.find(c => c.id === selectedCategory)
      if (cat) {
        result = result.filter(l =>
          cat.keywords.some(k => l.title.includes(k) || l.what.includes(k))
        )
      }
    }

    // 排序：免費課程在前，PRO 在後
    result = result.sort((a, b) => {
      if (a.is_premium === b.is_premium) return 0
      return a.is_premium ? 1 : -1
    })

    return result
  }, [lessons, search, selectedCategory, levelFilter, slopeFilter, skillFilter])
}
