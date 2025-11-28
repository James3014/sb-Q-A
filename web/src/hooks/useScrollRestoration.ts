import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function useScrollRestoration() {
  const pathname = usePathname()

  useEffect(() => {
    // 恢復滾動位置
    const savedPosition = sessionStorage.getItem(`scroll-${pathname}`)
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition))
    }

    // 儲存滾動位置
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${pathname}`, window.scrollY.toString())
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])
}
