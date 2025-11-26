'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { getUser, onAuthStateChange } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初始載入用戶
    getUser().then((u) => {
      console.log('[AuthProvider] initial user:', u?.email)
      setUser(u)
      setLoading(false)
    })

    // 監聽 auth 狀態變化
    const { data: { subscription } } = onAuthStateChange((u) => {
      console.log('[AuthProvider] auth changed:', u?.email)
      setUser(u)
      setLoading(false)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
