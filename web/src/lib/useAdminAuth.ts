'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from './supabase'

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

      // 從資料庫檢查 is_admin
      const { data } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      setIsAuthorized(data?.is_admin === true)
      setLoading(false)
    }
    check()
  }, [])

  return { loading, isAuthorized, isReady: !loading && isAuthorized }
}
