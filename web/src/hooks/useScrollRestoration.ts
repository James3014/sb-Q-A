import { useEffect } from 'react'

export function useScrollRestoration() {
  useEffect(() => {
    // 恢復首頁的滾動位置
    const savedPosition = sessionStorage.getItem('homeScrollPos')
    
    if (savedPosition) {
      const position = parseInt(savedPosition)
      
      // 延遲恢復，確保內容已渲染
      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: position,
          behavior: 'instant' // 立即跳轉，不要平滑滾動
        })
      }, 50)

      return () => clearTimeout(timeoutId)
    }
  }, [])
}
