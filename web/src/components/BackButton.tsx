'use client'
import { useRouter } from 'next/navigation'
import { vibrate } from '@/components/ui/Button'

export function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    vibrate()
    
    // 檢查是否有上一頁歷史
    if (typeof window !== 'undefined' && window.history.length > 1) {
      const referrer = document.referrer
      // 如果來自同網站，返回上一頁（保留搜尋結果）
      if (referrer && referrer.includes(window.location.host)) {
        router.back()
        return
      }
    }
    // 否則返回首頁
    router.push('/')
  }

  return (
    <button 
      onClick={handleBack} 
      className="w-11 h-11 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg active:scale-95 transition-all"
      title="返回"
    >
      ←
    </button>
  )
}
