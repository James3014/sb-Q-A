import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics'

export function useScrollDepth(lessonId: string) {
  const tracked = useRef<Set<number>>(new Set())

  useEffect(() => {
    tracked.current = new Set()

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const percent = Math.round((scrollTop / docHeight) * 100)
      const milestones = [25, 50, 75, 100]

      milestones.forEach(m => {
        if (percent >= m && !tracked.current.has(m)) {
          tracked.current.add(m)
          trackEvent('scroll_depth', lessonId, { depth: m })
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lessonId])
}
