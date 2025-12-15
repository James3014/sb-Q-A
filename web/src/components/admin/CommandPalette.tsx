'use client'

import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // ⌘K / Ctrl+K 快捷鍵
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm"
         onClick={() => setOpen(false)}>
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-lg"
           onClick={e => e.stopPropagation()}>
        <Command className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl">
          <Command.Input
            placeholder="搜尋課程、用戶、功能..."
            className="w-full px-4 py-3 bg-transparent border-b border-zinc-800
                       text-white placeholder:text-zinc-500 focus:outline-none"
          />
          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-zinc-500">
              找不到結果
            </Command.Empty>

            <Command.Group heading="課程管理" className="text-xs text-zinc-500 px-2 py-1">
              <Command.Item
                onSelect={() => {
                  router.push('/admin/lessons/create')
                  setOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg
                           hover:bg-zinc-800 cursor-pointer data-[selected=true]:bg-zinc-800"
              >
                <span className="text-lg">➕</span>
                <div>
                  <div className="text-white font-medium">新增課程</div>
                  <div className="text-xs text-zinc-400">創建新的滑雪課程</div>
                </div>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  router.push('/admin/lessons')
                  setOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg
                           hover:bg-zinc-800 cursor-pointer data-[selected=true]:bg-zinc-800"
              >
                <span className="text-lg">📚</span>
                <div>
                  <div className="text-white font-medium">管理課程</div>
                  <div className="text-xs text-zinc-400">查看所有課程列表</div>
                </div>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="分析" className="text-xs text-zinc-500 px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => {
                  router.push('/admin/analytics')
                  setOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg
                           hover:bg-zinc-800 cursor-pointer data-[selected=true]:bg-zinc-800"
              >
                <span className="text-lg">📊</span>
                <div>
                  <div className="text-white font-medium">推廣成效</div>
                  <div className="text-xs text-zinc-400">查看分析數據</div>
                </div>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
