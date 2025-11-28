import { useEffect } from 'react'

export function useScrollRestoration(ready: boolean = true) {
  useEffect(() => {
    if (!ready) return

    const savedPosition = sessionStorage.getItem('homeScrollPos')
    console.log('[useScrollRestoration] ready:', ready, 'savedPosition:', savedPosition)
    
    if (savedPosition) {
      const position = parseInt(savedPosition, 10)
      console.log('[useScrollRestoration] 準備恢復到:', position)
      
      setTimeout(() => {
        window.scrollTo(0, position)
        console.log('[useScrollRestoration] 已恢復，當前位置:', window.scrollY)
        sessionStorage.removeItem('homeScrollPos')
      }, 0)
    }
  }, [ready])
}
