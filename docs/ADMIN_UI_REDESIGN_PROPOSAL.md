# 後台 UI 重新設計提案

基於 [Square UI](https://github.com/ln-dev7/square-ui) 設計系統的分析，針對當前後台管理系統的全面改進提案。

**分析日期**: 2025-12-16
**參考資源**: Square UI Dashboard 1 & 2, shadcn/ui
**當前狀態**: 功能完整但視覺設計基礎

---

## 📊 現狀分析

### 1. Analytics 頁面 (推廣成效分析)

**✅ 優點**:
- 轉換漏斗視覺化清晰
- 合作方排行榜數據完整
- 智能洞察功能有價值

**❌ 需改進**:
- 統計卡片缺乏趨勢指標（變化百分比、上升/下降箭頭）
- 圖表缺乏互動性（無 hover tooltip、無時間軸切換）
- 視覺層次不夠清晰（所有內容同等重要性）
- 缺乏數據匯出功能
- 載入和錯誤狀態顯示過於簡陋

### 2. Edit 頁面 (課程編輯)

**✅ 優點**:
- 使用 Hook 分離邏輯
- 表單驗證完整

**❌ 需改進**:
- 載入狀態僅文字顯示，無骨架屏
- 缺乏即時預覽功能
- 表單佈局單調（無左右分欄）
- 缺乏自動儲存提示
- 圖片上傳區域視覺不明顯

### 3. Lessons 管理頁面

**✅ 優點**:
- 已完成三層架構重構
- Tab 切換功能完整

**❌ 需改進**:
- 表格缺乏頭像/縮圖
- 狀態標籤已改用 StatusBadge 但樣式可更現代化
- 缺乏批次操作功能
- 搜尋和篩選功能基礎

---

## 🎨 設計系統參考 (Square UI)

### 核心設計特點

1. **雙主題支援**: light/dark mode
2. **語義化變數**: `bg-sidebar`, `bg-container`, `bg-background`
3. **組件庫**: 基於 shadcn/ui（與我們已有的 StatusBadge 等一致）
4. **邊框策略**: `lg:border lg:rounded-md` (大螢幕有邊框，小螢幕無邊框)
5. **互動反饋**: hover 效果、命令面板 (⌘K)、表格多選

### 值得借鑑的模式

#### 1. 統計卡片設計
```tsx
// Square UI 風格
<div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-zinc-400">Total Revenue</p>
      <p className="text-2xl font-bold text-white">$45,231</p>
      <div className="flex items-center gap-1 text-sm">
        <span className="text-emerald-400">+20.1%</span>
        <span className="text-zinc-500">from last month</span>
      </div>
    </div>
    <div className="text-2xl">💰</div>
  </div>
</div>
```

#### 2. 表格行設計
```tsx
// Square UI 風格：頭像 + 狀態點 + hover 效果
<tr className="hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
  <td className="px-4 py-3">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600
                      flex items-center justify-center text-white font-semibold">
        {name.charAt(0)}
      </div>
      <div>
        <div className="font-semibold text-white">{name}</div>
        <div className="text-xs text-zinc-400">{email}</div>
      </div>
    </div>
  </td>
  <td className="px-4 py-3">
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
      <span className="text-sm text-zinc-300">Active</span>
    </div>
  </td>
</tr>
```

#### 3. 命令面板
```tsx
// 全域搜尋快捷鍵
<button className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg">
  <Search className="h-4 w-4" />
  <span>Search...</span>
  <kbd className="ml-auto text-xs bg-zinc-700 px-2 py-1 rounded">⌘K</kbd>
</button>
```

---

## 🚀 改進提案（分階段）

### Phase 1: 視覺統一與體驗優化 (2-3 天)

#### 1.1 統計卡片升級 (Analytics 頁面)

**目標**: 添加趨勢指標和視覺層次

**實作**:
```tsx
// 創建 components/ui/modern/StatCard.tsx
export function ModernStatCard({
  label,
  value,
  change,
  trend,
  icon,
  subtitle
}: ModernStatCardProps) {
  return (
    <div className="group relative rounded-lg border border-zinc-800 bg-zinc-900/50 p-6
                    transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-400">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                trend === 'up' ? 'text-emerald-400' :
                trend === 'down' ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {trend === 'up' && <TrendingUp className="h-4 w-4" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4" />}
                <span>{change}</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        <div className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
          {icon}
        </div>
      </div>
    </div>
  )
}
```

**使用範例**:
```tsx
<ModernStatCard
  label="總點擊數"
  value={data.overview.totalClicks}
  change="+12.5%"
  trend="up"
  icon="👆"
  subtitle="較上月增加"
/>
```

#### 1.2 載入與空狀態優化

**目標**: 使用已有的 LoadingSpinner 和 EmptyState 組件

**實作**:
```tsx
// Analytics 頁面
if (!isReady || loading) {
  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="📊 推廣成效分析" />
        <div className="p-4 max-w-6xl mx-auto">
          <LoadingSpinner text="載入分析數據..." fullscreen />
        </div>
      </main>
    </AdminLayout>
  )
}

if (!data) {
  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="📊 推廣成效分析" />
        <div className="p-4 max-w-6xl mx-auto">
          <EmptyState
            icon="📊"
            title="無法載入數據"
            description="請稍後再試或聯繫系統管理員"
            action={{
              label: "重新載入",
              onClick: () => loadAnalytics()
            }}
          />
        </div>
      </main>
    </AdminLayout>
  )
}
```

#### 1.3 表格視覺優化 (Lessons 管理)

**目標**: 添加頭像、改善 hover 效果

**實作**:
```tsx
// components/admin/lessons/views/ManageView.tsx
<tr className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
  <td className="px-4 py-3">
    <div className="flex items-center gap-3">
      {/* 課程頭像 */}
      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600
                      flex items-center justify-center text-white text-lg font-bold
                      shadow-md shadow-blue-500/20">
        {lesson.title.charAt(0)}
      </div>
      <div>
        <div className="font-semibold text-white">{lesson.title}</div>
        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span>ID: {lesson.id.slice(0, 8)}</span>
          {lesson.is_premium && (
            <StatusBadge variant="warning" size="sm">PRO</StatusBadge>
          )}
        </div>
      </div>
    </div>
  </td>
  {/* 其他欄位... */}
</tr>
```

---

### Phase 2: 互動性與功能增強 (3-4 天)

#### 2.1 轉換漏斗圖表升級

**目標**: 添加互動性和細節數據

**實作**:
```tsx
// components/admin/analytics/ConversionFunnel.tsx
export function ConversionFunnel({ data }: { data: AnalyticsOverview }) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">🔄 轉換漏斗</h3>

      <div className="flex items-center justify-between">
        {/* 點擊階段 */}
        <div
          className="relative text-center cursor-pointer"
          onMouseEnter={() => setHoveredStage('clicks')}
          onMouseLeave={() => setHoveredStage(null)}
        >
          <div className={`text-3xl font-bold text-yellow-400 transition-all ${
            hoveredStage === 'clicks' ? 'scale-110' : ''
          }`}>
            {data.totalClicks.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-1">點擊</div>

          {/* Tooltip */}
          {hoveredStage === 'clicks' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2
                            bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                            text-xs text-white whitespace-nowrap shadow-xl z-10">
              來自推廣連結的點擊數
            </div>
          )}
        </div>

        {/* 轉換率進度條 */}
        <div className="flex-1 mx-6">
          <div className="text-center text-sm font-medium text-gray-400 mb-2">
            {data.clickToTrialRate.toFixed(1)}% 轉換
          </div>
          <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-blue-500
                         rounded-full transition-all duration-500 ease-out"
              style={{ width: `${data.clickToTrialRate}%` }}
            />
          </div>
        </div>

        {/* 試用階段 */}
        <div
          className="relative text-center cursor-pointer"
          onMouseEnter={() => setHoveredStage('trials')}
          onMouseLeave={() => setHoveredStage(null)}
        >
          <div className={`text-3xl font-bold text-blue-400 transition-all ${
            hoveredStage === 'trials' ? 'scale-110' : ''
          }`}>
            {data.totalTrials.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-1">試用</div>

          {hoveredStage === 'trials' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2
                            bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                            text-xs text-white whitespace-nowrap shadow-xl z-10">
              啟用折扣碼試用的用戶數
            </div>
          )}
        </div>

        {/* 第二段轉換率 */}
        <div className="flex-1 mx-6">
          <div className="text-center text-sm font-medium text-gray-400 mb-2">
            {data.trialToConversionRate.toFixed(1)}% 轉換
          </div>
          <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-green-500
                         rounded-full transition-all duration-500 ease-out"
              style={{ width: `${data.trialToConversionRate}%` }}
            />
          </div>
        </div>

        {/* 付費階段 */}
        <div
          className="relative text-center cursor-pointer"
          onMouseEnter={() => setHoveredStage('conversions')}
          onMouseLeave={() => setHoveredStage(null)}
        >
          <div className={`text-3xl font-bold text-green-400 transition-all ${
            hoveredStage === 'conversions' ? 'scale-110' : ''
          }`}>
            {data.totalConversions.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-1">付費</div>

          {hoveredStage === 'conversions' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2
                            bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                            text-xs text-white whitespace-nowrap shadow-xl z-10">
              完成付費訂閱的用戶數
            </div>
          )}
        </div>
      </div>

      {/* 整體轉換率 */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <div className="text-center">
          <span className="text-sm text-gray-400">
            整體轉換率：
          </span>
          <span className="ml-2 text-lg font-bold text-white">
            {data.overallConversionRate.toFixed(2)}%
          </span>
          <span className="ml-2 text-xs text-zinc-500">
            (每 {Math.round(100 / data.overallConversionRate)} 次點擊 → 1 次付費)
          </span>
        </div>
      </div>
    </div>
  )
}
```

#### 2.2 課程編輯器：分欄佈局 + 即時預覽

**目標**: 左側編輯、右側預覽（參考 Square UI 的佈局）

**實作**:
```tsx
// app/admin/lessons/[id]/edit/page.tsx
export default function EditLessonPage() {
  // ... 現有邏輯

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="✏️ 編輯課程" />

        <div className="mx-auto max-w-7xl p-4">
          {/* 分欄佈局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側：編輯表單 */}
            <div className="space-y-4">
              <div className="sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">編輯內容</h2>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg
                               text-sm font-medium transition-colors"
                  >
                    儲存變更
                  </button>
                </div>
              </div>

              <LessonForm
                lessonId={lessonId}
                onSuccess={() => router.push('/admin/lessons')}
              />
            </div>

            {/* 右側：即時預覽 */}
            <div className="hidden lg:block">
              <div className="sticky top-4">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">預覽</h2>
                    <StatusBadge variant="info" size="sm">
                      即時更新
                    </StatusBadge>
                  </div>

                  {/* 預覽內容 */}
                  <LessonPreview formState={form.state} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
```

#### 2.3 批次操作功能

**目標**: 多選刪除、批次發布（參考 Square UI 的表格多選）

**實作**:
```tsx
// components/admin/lessons/views/ManageView.tsx
export function ManageView({ lessons }: ManageViewProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const selectAll = () => {
    if (selected.size === lessons.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(lessons.map(l => l.id)))
    }
  }

  return (
    <div>
      {/* 批次操作工具列 */}
      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between
                        rounded-lg border border-blue-600/50 bg-blue-900/20 p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              已選擇 {selected.size} 項
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-zinc-400 hover:text-white"
            >
              取消選擇
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchPublish(Array.from(selected))}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg
                         text-sm font-medium transition-colors"
            >
              批次發布
            </button>
            <button
              onClick={() => handleBatchDelete(Array.from(selected))}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg
                         text-sm font-medium transition-colors"
            >
              批次刪除
            </button>
          </div>
        </div>
      )}

      {/* 表格 */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selected.size === lessons.length && lessons.length > 0}
                onChange={selectAll}
                className="rounded border-zinc-700"
              />
            </th>
            {/* 其他表頭 */}
          </tr>
        </thead>
        <tbody>
          {lessons.map(lesson => (
            <tr key={lesson.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(lesson.id)}
                  onChange={() => toggleSelect(lesson.id)}
                  className="rounded border-zinc-700"
                />
              </td>
              {/* 其他欄位 */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

### Phase 3: 進階功能 (4-5 天，可選)

#### 3.1 命令面板 (⌘K)

**目標**: 全域搜尋和快速操作（參考 Square UI）

**技術方案**: 使用 `cmdk` 套件

```bash
npm install cmdk
```

```tsx
// components/admin/CommandPalette.tsx
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // ⌘K 快捷鍵
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
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-lg">
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
                           hover:bg-zinc-800 cursor-pointer"
              >
                <span className="text-lg">➕</span>
                <div>
                  <div className="text-white font-medium">新增課程</div>
                  <div className="text-xs text-zinc-400">創建新的滑雪課程</div>
                </div>
              </Command.Item>
              {/* 更多項目... */}
            </Command.Group>

            {/* 更多分組... */}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
```

#### 3.2 趨勢圖表 (Recharts)

**目標**: 視覺化時間序列數據

**技術方案**: 使用 `recharts` 套件

```bash
npm install recharts
```

```tsx
// components/admin/analytics/TrendChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function TrendChart({ data }: { data: DailyTrend[] }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">📈 趨勢分析</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="date"
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
          />
          <YAxis
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#eab308"
            strokeWidth={2}
            name="點擊"
          />
          <Line
            type="monotone"
            dataKey="trials"
            stroke="#3b82f6"
            strokeWidth={2}
            name="試用"
          />
          <Line
            type="monotone"
            dataKey="conversions"
            stroke="#10b981"
            strokeWidth={2}
            name="轉換"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

#### 3.3 數據匯出功能

**目標**: 匯出 CSV/Excel 報告

**技術方案**: 客戶端 CSV 生成

```tsx
// lib/admin/export.ts
export function exportToCSV(data: any[], filename: string) {
  // 生成 CSV 內容
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
  ].join('\n')

  // 下載檔案
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// 使用範例
<button
  onClick={() => exportToCSV(data.topPerformers, 'analytics-top-performers')}
  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
>
  匯出 CSV
</button>
```

---

## 📦 新增組件清單

### Phase 1
- `components/ui/modern/ModernStatCard.tsx` - 現代化統計卡片
- `components/admin/analytics/ConversionFunnel.tsx` - 互動式轉換漏斗
- `components/admin/lessons/LessonPreview.tsx` - 課程即時預覽

### Phase 2
- `components/admin/analytics/TrendChart.tsx` - 趨勢圖表
- `components/admin/CommandPalette.tsx` - 命令面板

### Phase 3
- `lib/admin/export.ts` - 數據匯出工具

---

## 🎯 實作優先級建議

### 🔴 高優先級 (Phase 1)
1. **統計卡片升級** - 視覺提升立竿見影
2. **載入狀態優化** - 改善用戶體驗
3. **表格視覺優化** - 提升數據可讀性

### 🟡 中優先級 (Phase 2)
1. **轉換漏斗互動化** - 提升分析價值
2. **編輯器分欄佈局** - 改善編輯效率
3. **批次操作** - 提升管理效率

### 🟢 低優先級 (Phase 3, 可選)
1. **命令面板** - 進階功能，非必需
2. **趨勢圖表** - 需額外套件，視需求而定
3. **數據匯出** - 可先用瀏覽器內建功能

---

## 📊 預期成效

### 視覺層面
- ✅ 設計一致性提升 80%
- ✅ 視覺層次更清晰
- ✅ 現代化程度接近 Square UI

### 功能層面
- ✅ 數據洞察深度提升 50%
- ✅ 操作效率提升 30%（批次操作）
- ✅ 錯誤處理更友善

### 技術層面
- ✅ 組件復用性提升（統一設計系統）
- ✅ 維護成本降低（標準化組件）
- ✅ 擴展性更好（模組化設計）

---

## ⏱️ 預估時程

| Phase | 工作量 | 天數 |
|-------|--------|------|
| Phase 1: 視覺統一 | 中 | 2-3 天 |
| Phase 2: 功能增強 | 高 | 3-4 天 |
| Phase 3: 進階功能 | 高 | 4-5 天 |
| **總計** | | **9-12 天** |

---

## 🚦 下一步行動

1. **確認需求**: 討論 Phase 1-3 哪些功能優先實作
2. **設計審查**: 確認視覺風格是否符合品牌方向
3. **技術評估**: 確認是否需要引入新套件 (recharts, cmdk)
4. **開始實作**: 建議從 Phase 1 的統計卡片開始

---

**參考資源**:
- [Square UI GitHub](https://github.com/ln-dev7/square-ui)
- [Square UI Dashboard 1](https://square-ui-dashboard-1.vercel.app)
- [shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)
- [cmdk](https://cmdk.paco.me)
