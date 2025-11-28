import { useEffect } from 'react'

export function useScrollRestoration(ready: boolean = true) {
  useEffect(() => {
    if (!ready) return // 等待內容準備好

    const savedPosition = sessionStorage.getItem('homeScrollPos')
    
    if (savedPosition) {
      const position = parseInt(savedPosition)
      
      // 使用 requestAnimationFrame 確保 DOM 已更新
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, position)
        })
      })
    }
  }, [ready])
}
