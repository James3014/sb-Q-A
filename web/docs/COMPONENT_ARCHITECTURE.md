# 組件架構規範 - Page/Container/View 三層模式

**目的**: 統一後台頁面的組件結構，實現清晰的職責分離和更好的可維護性

**更新日期**: 2025-12-15

---

## 📐 三層架構定義

### Layer 1: Page (30-50 行)
**職責**: 路由、認證檢查、初始數據加載

**規則**:
- ✅ **應該做**:
  - 檢查用戶認證狀態 (`useAdminAuth`)
  - 初始化數據加載 (調用自定義 Hook)
  - 渲染 Container 組件
  - 處理全局加載和錯誤狀態

- ❌ **不應該做**:
  - 包含業務邏輯
  - 直接操作 state
  - 包含複雜的 JSX 渲染
  - 調用 API

**範例**:
```tsx
// app/admin/lessons/page.tsx (40 行)
export default function LessonsPage() {
  const { isReady } = useAdminAuth()
  const { data, loading, error } = useAdminLessons()

  if (!isReady) return <LoadingSpinner />
  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} />

  return <LessonsContainer data={data} />
}
```

---

### Layer 2: Container (60-100 行)
**職責**: 狀態管理、事件處理、業務邏輯

**規則**:
- ✅ **應該做**:
  - 管理本地 UI 狀態 (tab, filter, sort 等)
  - 定義事件處理函數 (useCallback)
  - 數據轉換和派生計算 (useMemo)
  - 將數據和事件傳遞給 View 組件

- ❌ **不應該做**:
  - 包含大量 JSX (應該委託給 View)
  - 直接渲染 HTML 元素 (應該使用 View 組件)
  - 包含樣式類名 (應該在 View 中)

**範例**:
```tsx
// components/admin/lessons/LessonsContainer.tsx (80 行)
export function LessonsContainer({ data }: Props) {
  const [tab, setTab] = useState<TabType>('stats')
  const [filter, setFilter] = useState<FilterState>({})

  const handleDelete = useCallback(async (id: string) => {
    // 業務邏輯
  }, [])

  const filteredData = useMemo(() => {
    // 數據派生
    return data.filter(item => matchFilter(item, filter))
  }, [data, filter])

  return (
    <LessonsLayout
      tab={tab}
      onTabChange={setTab}
      filter={filter}
      onFilterChange={setFilter}
    >
      {tab === 'stats' && (
        <LessonsStatsView data={filteredData} onDelete={handleDelete} />
      )}
      {tab === 'effectiveness' && (
        <EffectivenessView data={filteredData} />
      )}
      {/* 其他頁籤 */}
    </LessonsLayout>
  )
}
```

---

### Layer 3: View (50-80 行)
**職責**: 純 UI 渲染，無業務邏輯

**規則**:
- ✅ **應該做**:
  - 純展示組件
  - 接收 props 渲染 UI
  - 觸發事件回調 (onXxx)
  - 使用 UI 組件庫組件

- ❌ **不應該做**:
  - 包含 state (除非是純 UI 狀態，如 hover)
  - 包含業務邏輯
  - 直接調用 API
  - 進行數據轉換

**範例**:
```tsx
// components/admin/lessons/LessonsStatsView.tsx (70 行)
interface Props {
  data: LessonStat[]
  onDelete: (id: string) => void
}

export function LessonsStatsView({ data, onDelete }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {data.slice(0, 50).map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            rank={index + 1}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## 📋 完整範例: Lessons 頁面

### 文件結構
```
app/admin/lessons/
└── page.tsx                           (40 行) - Page 層

components/admin/lessons/
├── LessonsContainer.tsx               (85 行) - Container 層
├── LessonsLayout.tsx                  (60 行) - 布局組件
└── views/
    ├── LessonsStatsView.tsx           (70 行) - View 層
    ├── EffectivenessView.tsx          (65 行) - View 層
    ├── HealthView.tsx                 (60 行) - View 層
    ├── LessonHeatmapView.tsx          (已存在)
    └── LessonManageView.tsx           (已存在)
```

### 數據流
```
用戶操作 → View (觸發 onXxx)
         ↓
      Container (處理事件, 更新 state)
         ↓
      View (根據新 props 重新渲染)
```

---

## 🎯 拆分步驟清單

對於任何大型頁面 (>200 行)，按以下步驟拆分:

### Step 1: 分析現有代碼
- [ ] 統計總行數
- [ ] 識別主要功能區塊
- [ ] 找出重複的 UI 模式
- [ ] 評估複雜度

### Step 2: 設計組件結構
- [ ] 定義 Container 的職責
- [ ] 列出需要的 View 組件
- [ ] 定義 Props 接口

### Step 3: 創建 Page 層
- [ ] 提取認證邏輯
- [ ] 提取數據加載邏輯 (使用 Hook)
- [ ] 渲染 Container

### Step 4: 創建 Container 層
- [ ] 遷移 state 管理
- [ ] 遷移事件處理
- [ ] 定義數據派生邏輯

### Step 5: 創建 View 層
- [ ] 為每個主要功能創建獨立 View
- [ ] 移除業務邏輯，只保留渲染
- [ ] 確保 Props 類型定義完整

### Step 6: 測試驗證
- [ ] 運行測試套件
- [ ] 手動測試所有功能
- [ ] 檢查行數是否符合規範

---

## ⚖️ 判斷何時需要拆分

### 明確需要拆分的信號:
- ✅ 文件 >200 行
- ✅ 包含 >5 個條件渲染分支
- ✅ 包含 >5 個 state
- ✅ 單個函數 >30 行
- ✅ 多個開發者抱怨"找不到代碼"

### 可以暫緩拆分的情況:
- ❌ 文件 <100 行
- ❌ 邏輯簡單清晰
- ❌ 沒有重複代碼
- ❌ 測試覆蓋率高

---

## 📏 行數限制指南

| 層級 | 最小 | 理想 | 最大 | 超過最大應採取的措施 |
|------|------|------|------|---------------------|
| **Page** | 20 | 30-40 | 50 | 提取 Hook |
| **Container** | 40 | 60-80 | 100 | 拆分為多個 Container |
| **View** | 30 | 50-70 | 80 | 拆分為更小的 View 組件 |
| **Hook** | 10 | 20-40 | 60 | 拆分為多個 Hook |

**重要**: 這些是指導原則，不是嚴格規則。清晰度和可維護性比行數更重要。

---

## 🚫 反模式

### 反模式 1: Fat Page
```tsx
// ❌ 壞例子: 所有邏輯都在 page.tsx
export default function Page() {
  const [data, setData] = useState([])
  const [tab, setTab] = useState('stats')
  // ... 100 行 state 和邏輯

  return (
    <div>
      {/* 200 行 JSX */}
    </div>
  )
}
```

### 反模式 2: Anemic Container
```tsx
// ❌ 壞例子: Container 只是個殼
export function Container({ data }: Props) {
  return <View data={data} />  // 沒有任何邏輯
}
```

### 反模式 3: Smart View
```tsx
// ❌ 壞例子: View 包含業務邏輯
export function View({ data }: Props) {
  const [filter, setFilter] = useState({})  // ❌ View 不應該有 state

  useEffect(() => {
    // ❌ View 不應該調用 API
    fetchData().then(setData)
  }, [])

  return <div>...</div>
}
```

---

## ✅ 最佳實踐

### 1. Props 命名規範
- 數據: `data`, `items`, `list`
- 事件: `onXxx` (如 `onClick`, `onDelete`)
- 狀態: `isLoading`, `hasError`, `isDisabled`
- 配置: `config`, `options`, `settings`

### 2. 文件命名規範
- Page: `page.tsx`
- Container: `XxxContainer.tsx`
- View: `XxxView.tsx`
- Hook: `useXxx.ts`

### 3. 導入順序
```tsx
// 1. React 和第三方庫
import React, { useState, useCallback } from 'react'

// 2. 自定義 Hooks
import { useAdminAuth } from '@/hooks/useAdminAuth'

// 3. 組件
import { Button } from '@/components/ui/Button'
import { LessonsContainer } from '@/components/admin/lessons/LessonsContainer'

// 4. 類型
import type { Lesson } from '@/types/admin'

// 5. 工具和常數
import { formatDate } from '@/lib/utils'
import { LESSON_CATEGORIES } from '@/constants'
```

---

## 📚 延伸閱讀

- [Thinking in React (官方文檔)](https://react.dev/learn/thinking-in-react)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [The Art of Unix Programming by Eric S. Raymond](http://www.catb.org/~esr/writings/taoup/html/)

---

**維護者**: Claude Code
**版本**: 1.0
**最後更新**: 2025-12-15
