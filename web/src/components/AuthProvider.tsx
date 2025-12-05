'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { getUser, onAuthStateChange } from '@/lib/auth'
import { getSubscription, Subscription } from '@/lib/subscription'

interface AuthContextType {
  user: User | null
  loading: boolean
  subscription: Subscription
}

const defaultSubscription: Subscription = { plan: 'free', endDate: null, isActive: false }

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  subscription: defaultSubscription
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription>(defaultSubscription)

  useEffect(() => {
    let isMounted = true

    // 初始化使用者狀態
    getUser().then(async (u) => {
      if (!isMounted) return
      setUser(u)
      if (u) {
        const sub = await getSubscription(u.id)
        if (isMounted) setSubscription(sub)
      }
      if (isMounted) setLoading(false)
    }).catch((err) => {
      console.error('[AuthProvider] Failed to get user:', err)
      if (isMounted) setLoading(false)
    })

    // 監聽認證狀態變化
    const { data: { subscription: authSub } } = onAuthStateChange(async (u) => {
      if (!isMounted) return

      setUser(u)
      if (u) {
        try {
          const sub = await getSubscription(u.id)
          if (isMounted) setSubscription(sub)
        } catch (err) {
          console.error('[AuthProvider] Failed to get subscription:', err)
        }
      } else {
        setSubscription(defaultSubscription)
      }
    })

    return () => {
      isMounted = false
      authSub.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, subscription }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
