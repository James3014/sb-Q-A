'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        }
      ) => void
      reset: (widgetId?: string) => void
    }
  }
}

interface Props {
  onToken?: (token: string | null) => void
  className?: string
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function TurnstileWidget({ onToken, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!siteKey) return

    if (window.turnstile) {
      setLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = () => setLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (!siteKey || !loaded || !containerRef.current || !window.turnstile) return

    window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: token => onToken?.(token),
      'expired-callback': () => onToken?.(null),
      'error-callback': () => onToken?.(null),
    })
  }, [loaded, onToken])

  if (!siteKey) return null

  return <div ref={containerRef} className={className} />
}
