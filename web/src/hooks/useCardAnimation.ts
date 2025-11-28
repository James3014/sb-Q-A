import { useEffect, useRef } from 'react'

export function useCardAnimation() {
  const cardRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          card.classList.add('animate-slide-in-diagonal')
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  return cardRef
}
