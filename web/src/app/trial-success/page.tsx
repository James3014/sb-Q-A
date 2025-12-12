'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PageContainer } from '@/components/ui'
import { formatDate } from '@/lib/constants'

export default function TrialSuccessPage() {
  const searchParams = useSearchParams()
  const planLabel = searchParams.get('plan') || '7天 PASS'
  const expires = searchParams.get('expires')

  return (
    <PageContainer className="p-4">
      <div className="mx-auto max-w-md rounded-3xl border border-emerald-600/50 bg-gradient-to-b from-emerald-900/40 to-zinc-900 p-6 text-center">
        <p className="text-3xl">✅</p>
        <h1 className="mt-4 text-2xl font-bold text-white">免費試用已啟用</h1>
        <p className="mt-2 text-sm text-emerald-100/90">
          {planLabel} 全部內容立即解鎖！
        </p>

        <div className="mt-6 rounded-2xl bg-zinc-900/80 p-4 text-left">
          <p className="text-sm text-zinc-400">到期時間</p>
          <p className="text-lg font-semibold text-white">
            {expires ? formatDate(expires) : '7 天後'}
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            試用到期後會自動回到免費版，可隨時升級正式方案，不會遺失任何練習紀錄。
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white/90 px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-white"
        >
          開始學習
        </Link>

        <Link
          href="/pricing"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/30 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          查看完整方案
        </Link>
      </div>
    </PageContainer>
  )
}
