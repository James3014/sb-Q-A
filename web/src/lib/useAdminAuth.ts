'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { isAdmin } from './admin'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'sb2025admin'

export function useAdminAuth() {
  const { user, loading } = useAuth()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('admin_auth')
      if (saved === 'true') setAuthenticated(true)
    }
  }, [])

  const isAuthorized = !loading && user && isAdmin(user.email)
  const isReady = !loading && isAuthorized && authenticated

  const submitPassword = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      sessionStorage.setItem('admin_auth', 'true')
      return true
    }
    return false
  }

  return {
    loading,
    user,
    isAuthorized,
    isReady,
    authenticated,
    password,
    setPassword,
    submitPassword,
  }
}
