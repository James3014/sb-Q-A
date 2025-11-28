import { useEffect } from 'react'

export function useHomePersistence(ready: boolean) {
  useEffect(() => {
    if (!ready) return

    const savedScrollY = sessionStorage.getItem('homeScrollY')
    
    if (savedScrollY) {
      const scrollY = parseInt(savedScrollY, 10)
      
      // 使用 RAF 確保 DOM 已更新
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: 'auto' })
          sessionStorage.removeItem('homeScrollY')
        })
      })
    }
  }, [ready])
}
