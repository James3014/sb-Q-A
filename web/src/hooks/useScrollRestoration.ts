import { useEffect } from 'react'

export function useScrollRestoration(ready: boolean = true) {
  useEffect(() => {
    if (!ready) return

    const lastViewedLesson = sessionStorage.getItem('lastViewedLesson')
    
    if (lastViewedLesson) {
      // 找到該卡片並滾動到它
      setTimeout(() => {
        const card = document.querySelector(`[data-lesson-id="${lastViewedLesson}"]`)
        if (card) {
          card.scrollIntoView({ behavior: 'instant', block: 'center' })
          sessionStorage.removeItem('lastViewedLesson')
        }
      }, 100) // 給內容渲染時間
    }
  }, [ready])
}
