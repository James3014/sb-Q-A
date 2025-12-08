'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from './supabase'
import { isAdminUser } from './adminAuth'

export function useAdminAuth() {
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    async function check() {
      const supabase = getSupabase()
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      setIsAuthorized(isAdminUser(user))
      setLoading(false)
    }
    check()
  }, [])

  // isReady = 已載入完成 + 是管理員
  return { loading, isAuthorized, isReady: !loading && isAuthorized }
}
