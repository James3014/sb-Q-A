'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { getUser, onAuthStateChange } from '@/lib/auth'
import { getSubscription, Subscription } from '@/lib/subscription'

interface AuthContextType {
  user: User | null
  loading: boolean
  subscription: Subscription
  subscriptionVersion: number  // 版本號，用於觸發組件重新載入
  refreshSubscription: () => Promise<void>
}

const defaultSubscription: Subscription = { plan: 'free', endDate: null, isActive: false }

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscription: defaultSubscription,
  subscriptionVersion: 0,
  refreshSubscription: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription>(defaultSubscription)
  const [subscriptionVersion, setSubscriptionVersion] = useState(0)

  // 使用 ref 來保存最新的 user，避免閉包問題
  const userRef = useRef<User | null>(null)
  userRef.current = user

  // 刷新訂閱狀態的函數 - 使用 useCallback 優化
  const refreshSubscription = useCallback(async () => {
    const currentUser = userRef.current
    if (!currentUser) {
      // 嘗試重新獲取用戶
      const u = await getUser()
      if (!u) return
      userRef.current = u
      setUser(u)
    }

    const userId = userRef.current?.id
    if (!userId) return

    try {
      const sub = await getSubscription(userId)
      setSubscription(sub)
      setSubscriptionVersion(v => v + 1)  // 增加版本號，觸發依賴此值的組件重新載入
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[AuthProvider] Subscription refreshed:', sub)
      }
    } catch (err) {
      console.error('[AuthProvider] Failed to refresh subscription:', err)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    // 初始化使用者狀態
    getUser().then(async (u) => {
      if (!isMounted) return
      setUser(u)
      userRef.current = u
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
      userRef.current = u
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
    <AuthContext.Provider value={{ user, loading, subscription, subscriptionVersion, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
