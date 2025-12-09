import { useMemo } from 'react'
import { Lesson } from '@/lib/lessons'
import { Subscription } from '@/lib/subscription'

export function useAccessibleLessons(
  filteredLessons: Lesson[],
  subscription: Subscription
) {
  return useMemo(() => {
    if (subscription.isActive) {
      return filteredLessons
    }
    
    // 未訂閱：只顯示初級課程
    return filteredLessons.filter(lesson => 
      lesson.level_tags?.includes('beginner')
    )
  }, [filteredLessons, subscription.isActive])
}
