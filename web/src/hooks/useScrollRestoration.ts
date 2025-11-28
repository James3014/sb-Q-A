import { useEffect } from 'react'

export function useScrollRestoration(ready: boolean = true) {
  useEffect(() => {
    if (!ready) return

    const lastViewedLesson = sessionStorage.getItem('lastViewedLesson')
    const lastViewedUrl = sessionStorage.getItem('lastViewedUrl')
    const currentUrl = window.location.href
    
    // 只有在相同 URL（相同篩選條件）時才恢復位置
    if (lastViewedLesson && lastViewedUrl === currentUrl) {
      setTimeout(() => {
        const card = document.querySelector(`[data-lesson-id="${lastViewedLesson}"]`)
        if (card) {
          card.scrollIntoView({ behavior: 'instant', block: 'center' })
        }
        // 恢復後清除
        sessionStorage.removeItem('lastViewedLesson')
        sessionStorage.removeItem('lastViewedUrl')
      }, 100)
    }
  }, [ready])
}
