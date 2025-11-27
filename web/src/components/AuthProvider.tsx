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
    getUser().then(async (u) => {
      setUser(u)
      if (u) {
        const sub = await getSubscription(u.id)
        setSubscription(sub)
      }
      setLoading(false)
    })

    const { data: { subscription: authSub } } = onAuthStateChange(async (u) => {
      setUser(u)
      if (u) {
        const sub = await getSubscription(u.id)
        setSubscription(sub)
      } else {
        setSubscription(defaultSubscription)
      }
      setLoading(false)
    })
    
    return () => authSub.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, subscription }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
