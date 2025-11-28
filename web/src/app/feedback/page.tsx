'use client'
import { PageContainer } from '@/components/ui';

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { PageHeader } from '@/components/ui'
import { getSupabase } from '@/lib/supabase'
import { FEEDBACK_TYPES } from '@/lib/constants'

export default function FeedbackPage() {
  const { user } = useAuth()
  const [type, setType] = useState('other')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async () => {
    if (!content.trim()) return
    setStatus('sending')

    const supabase = getSupabase()
    if (!supabase) {
      setStatus('error')
      return
    }

    const { error } = await supabase.from('feedback').insert({
      user_id: user?.id || null,
      type,
      content,
      page: typeof window !== 'undefined' ? window.location.href : null,
    })

    if (error) {
      console.error('[Feedback]', error)
      setStatus('error')
    } else {
      setStatus('sent')
      setContent('')
    }
  }

  return (
    <PageContainer>
      <PageHeader title="意見回報" emoji="📝" />
      
      <div className="p-4 max-w-lg mx-auto">
        {status === 'sent' ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🙏</p>
            <p className="text-zinc-300 mb-2">感謝你的回饋！</p>
            <p className="text-zinc-500 text-sm">我們會盡快處理</p>
          </div>
        ) : (
          <>
            <p className="text-zinc-400 text-sm mb-4">你想提供什麼？</p>
            
            <div className="space-y-2 mb-6">
              {FEEDBACK_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`w-full p-3 rounded-lg text-left ${type === t.id ? 'bg-blue-600' : 'bg-zinc-800'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="請描述你的問題或建議..."
              className="w-full h-32 p-3 bg-zinc-800 rounded-lg text-white placeholder-zinc-500 mb-4"
            />

            <button
              onClick={handleSubmit}
              disabled={!content.trim() || status === 'sending'}
              className="w-full py-3 bg-blue-600 rounded-lg font-medium disabled:opacity-50"
            >
              {status === 'sending' ? '送出中...' : status === 'error' ? '發生錯誤，請重試' : '送出'}
            </button>

            {!user && (
              <p className="text-zinc-500 text-xs text-center mt-4">
                未登入也可以送出，但登入後我們能更好地追蹤處理進度
              </p>
            )}
          </>
        )}
      </div>
    </PageContainer>
  )
}
