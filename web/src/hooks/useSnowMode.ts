'use client'
import { useEffect, useState } from 'react'

export function useSnowMode() {
  const [snowMode, setSnowMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('snowMode')
    if (saved === 'true') {
      setSnowMode(true)
      document.documentElement.dataset.theme = 'snow'
    }
  }, [])

  const toggle = () => {
    setSnowMode(prev => {
      const next = !prev
      localStorage.setItem('snowMode', String(next))
      document.documentElement.dataset.theme = next ? 'snow' : 'default'
      return next
    })
  }

  return { snowMode, toggle }
}
