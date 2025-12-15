# 後台管理系統架構文檔

## 概述

本文檔描述後台管理系統的架構設計、數據流程和開發規範。

**最後更新**: 2025-12-15
**維護者**: Claude Code

---

## 目錄

- [系統架構](#系統架構)
- [目錄結構](#目錄結構)
- [數據流程](#數據流程)
- [添加新頁面](#添加新頁面)
- [API 設計規範](#api-設計規範)
- [測試規範](#測試規範)
- [相關文檔](#相關文檔)

---

## 系統架構

### 整體架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard (後台管理)                │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Page Layer (頁面層)                     │
│  - 路由 & 認證檢查                                            │
│  - 數據加載 (useAdmin* Hook)                                 │
│  - Container 渲染                                            │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Container Layer (容器層)                   │
│  - UI 狀態管理 (tab, filter, sort)                          │
│  - 事件處理邏輯                                               │
│  - View 組件編排                                             │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     View Layer (視圖層)                      │
│  - 純 UI 渲染                                                │
│  - 無業務邏輯                                                │
│  - 可重用組件                                                │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer (服務層)                   │
│  - API 調用 (BaseService 子類)                              │
│  - 數據轉換                                                  │
│  - 錯誤處理 & 重試                                           │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (數據庫)                         │
│  - Users, Lessons, Payments, etc.                          │
└─────────────────────────────────────────────────────────────┘
```

### 核心原則

1. **關注點分離** (Separation of Concerns)
   - 頁面層只負責路由和認證
   - 容器層負責狀態和邏輯
   - 視圖層只負責 UI 渲染

2. **單向數據流** (Unidirectional Data Flow)
   ```
   State (Hook) → Props → View Component → Events → Actions (Hook)
   ```

3. **依賴注入** (Dependency Injection)
   - 通過 props 傳遞依賴
   - 避免直接調用全局服務

4. **類型安全** (Type Safety)
   - 所有 API 響應都有明確類型
   - 使用 TypeScript strict mode

---

## 目錄結構

```
web/src/
├── app/admin/                       # 後台頁面 (Next.js App Router)
│   ├── page.tsx                     # 儀表板主頁
│   ├── layout.tsx                   # 後台佈局
│   ├── lessons/
│   │   ├── page.tsx                 # 課程管理主頁 (Page 層)
│   │   ├── [id]/edit/page.tsx      # 編輯課程
│   │   └── create/page.tsx          # 創建課程
│   ├── users/
│   │   └── page.tsx                 # 用戶管理
│   ├── affiliates/
│   │   └── page.tsx                 # 聯盟行銷管理
│   ├── commissions/
│   │   └── page.tsx                 # 分潤管理
│   ├── coupons/
│   │   └── page.tsx                 # 優惠券管理
│   ├── analytics/
│   │   └── page.tsx                 # 數據分析
│   ├── monetization/
│   │   └── page.tsx                 # 營收分析
│   └── feedback/
│       └── page.tsx                 # 用戶反饋
│
├── components/admin/                # 後台專用組件
│   ├── lessons/
│   │   ├── LessonsContainer.tsx    # 課程管理容器 (Container 層)
│   │   ├── LessonManageTable.tsx   # 課程表格
│   │   ├── LessonForm.tsx          # 課程表單
│   │   └── views/                  # 視圖組件 (View 層)
│   │       ├── LessonsStatsView.tsx
│   │       ├── EffectivenessView.tsx
│   │       ├── HealthView.tsx
│   │       └── ManageView.tsx
│   └── ...                          # 其他後台組件
│
├── hooks/                           # 自定義 Hooks
│   ├── useAdminAuth.ts             # 後台認證
│   ├── useAdminLessons.ts          # 課程數據管理
│   ├── useAffiliates.ts            # 聯盟數據管理
│   ├── useDataTable.ts             # 通用表格邏輯
│   └── ...
│
├── services/                        # Service 層
│   ├── BaseService.ts              # 基礎服務類
│   ├── admin/
│   │   ├── AdminDashboardService.ts
│   │   ├── AdminUserService.ts
│   │   ├── AdminLessonService.ts
│   │   └── ...
│   └── index.ts
│
├── lib/                             # 工具函數和邏輯
│   ├── adminData.ts                # 後台數據工具 (逐步遷移到 services/)
│   ├── adminApi.ts                 # 後台 API 工具 (逐步遷移到 services/)
│   ├── errors.ts                   # 錯誤類型定義
│   ├── logging.ts                  # 日誌工具
│   ├── apiRetry.ts                 # API 重試邏輯
│   └── admin/
│       └── calculations.ts         # 後台計算函數
│
├── types/                           # TypeScript 類型定義
│   ├── admin.ts                    # 後台相關類型
│   ├── common.ts                   # 通用類型
│   ├── lessons.ts                  # 課程類型
│   ├── affiliate.ts                # 聯盟類型
│   ├── coupon.ts                   # 優惠券類型
│   └── index.ts                    # 統一導出
│
└── components/ui/                   # 通用 UI 組件
    ├── StatusBadge.tsx
    ├── LoadingSpinner.tsx
    ├── EmptyState.tsx
    ├── ConfirmDialog.tsx
    ├── DataTable.tsx
    └── index.ts
```

---

## 數據流程

### 典型的數據流程（以課程管理為例）

```typescript
// 1. Page 層 (app/admin/lessons/page.tsx)
export default function LessonsPage() {
  // 認證檢查
  const { isReady } = useAdminAuth()

  // 數據加載 (Hook)
  const {
    data,
    loading,
    error,
    visibleLessons,
    actions
  } = useAdminLessons()

  // 渲染 Container
  return (
    <AdminLayout>
      <LessonsContainer
        data={data}
        visibleLessons={visibleLessons}
        loading={loading}
        onRefresh={actions.refresh}
        onDelete={actions.deleteLesson}
      />
    </AdminLayout>
  )
}

// 2. Hook 層 (hooks/useAdminLessons.ts)
export function useAdminLessons() {
  const [data, setData] = useState<AdminLessonsData>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // 調用 Service 層
      const lessons = await AdminLessonService.getAll()
      const stats = await AdminDashboardService.getLessonStats()
      setData({ lessons, stats, ... })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteLesson = useCallback(async (id: string) => {
    await AdminLessonService.delete(id)
    await loadData()
  }, [loadData])

  useEffect(() => { loadData() }, [loadData])

  return {
    data,
    loading,
    error,
    visibleLessons: data.lessons.filter(l => !l.deleted_at),
    actions: {
      refresh: loadData,
      deleteLesson
    }
  }
}

// 3. Service 層 (services/admin/AdminLessonService.ts)
export class AdminLessonService extends BaseService {
  static async getAll(): Promise<Lesson[]> {
    return this.get<Lesson[]>('/api/admin/lessons')
  }

  static async delete(id: string): Promise<void> {
    return this.delete(`/api/admin/lessons/${id}`)
  }
}

// 4. Container 層 (components/admin/lessons/LessonsContainer.tsx)
export function LessonsContainer({ data, loading, onRefresh, onDelete }) {
  const [tab, setTab] = useState('stats')
  const [filter, setFilter] = useState({})

  const filteredData = useMemo(() => {
    return data.lessons.filter(l => /* filter logic */)
  }, [data.lessons, filter])

  return (
    <>
      <TabBar tab={tab} onChange={setTab} />
      {tab === 'stats' && (
        <LessonsStatsView
          lessons={filteredData}
          filter={filter}
          onFilterChange={setFilter}
        />
      )}
      {tab === 'manage' && (
        <ManageView
          lessons={filteredData}
          onDelete={onDelete}
        />
      )}
    </>
  )
}

// 5. View 層 (components/admin/lessons/views/LessonsStatsView.tsx)
export function LessonsStatsView({ lessons, filter, onFilterChange }) {
  return (
    <div>
      <FilterBar filter={filter} onChange={onFilterChange} />
      {lessons.map(lesson => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  )
}
```

---

## 添加新頁面

### 步驟 1: 創建類型定義

```typescript
// types/admin.ts
export interface MyNewFeatureData {
  items: MyItem[]
  stats: MyStats
}

export interface MyItem {
  id: string
  name: string
  status: 'active' | 'inactive'
  created_at: string
}
```

### 步驟 2: 創建 Service

```typescript
// services/admin/MyFeatureService.ts
import { BaseService } from '../BaseService'
import type { MyItem, MyNewFeatureData } from '@/types/admin'

export class MyFeatureService extends BaseService {
  static async getAll(): Promise<MyItem[]> {
    return this.get<MyItem[]>('/api/admin/my-feature')
  }

  static async create(data: Partial<MyItem>): Promise<MyItem> {
    return this.post<MyItem>('/api/admin/my-feature', data)
  }

  static async delete(id: string): Promise<void> {
    return this.delete(`/api/admin/my-feature/${id}`)
  }
}
```

### 步驟 3: 創建 Hook

```typescript
// hooks/useMyFeature.ts
import { useState, useEffect, useCallback } from 'react'
import { MyFeatureService } from '@/services'
import type { MyNewFeatureData } from '@/types/admin'

export function useMyFeature() {
  const [data, setData] = useState<MyNewFeatureData>({ items: [], stats: {} })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const items = await MyFeatureService.getAll()
      setData({ items, stats: {} })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  return {
    data,
    loading,
    error,
    actions: {
      refresh: loadData,
      create: MyFeatureService.create,
      delete: MyFeatureService.delete
    }
  }
}
```

### 步驟 4: 創建 Page

```typescript
// app/admin/my-feature/page.tsx
'use client'

import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { useMyFeature } from '@/hooks/useMyFeature'
import { LoadingSpinner, EmptyState } from '@/components/ui'

export default function MyFeaturePage() {
  const { isReady } = useAdminAuth()
  const { data, loading, error, actions } = useMyFeature()

  if (!isReady || loading) {
    return (
      <AdminLayout>
        <AdminHeader title="My Feature" />
        <LoadingSpinner fullscreen />
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <AdminHeader title="My Feature" />
        <div className="p-4 text-center text-red-400">{error}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="My Feature" />
        <div className="p-4 max-w-6xl mx-auto">
          {data.items.length === 0 ? (
            <EmptyState
              title="尚無數據"
              description="目前還沒有任何記錄"
              action={{
                label: '新增',
                onClick: () => actions.create({})
              }}
            />
          ) : (
            <div>
              {/* 你的內容 */}
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  )
}
```

### 步驟 5: 添加路由

在 `app/admin/layout.tsx` 的導航菜單中添加新頁面的鏈接。

### 步驟 6: 編寫測試

```typescript
// __tests__/hooks/useMyFeature.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useMyFeature } from '@/hooks/useMyFeature'
import { MyFeatureService } from '@/services'

jest.mock('@/services')

describe('useMyFeature', () => {
  it('should load data on mount', async () => {
    const mockData = [{ id: '1', name: 'Test' }]
    jest.spyOn(MyFeatureService, 'getAll').mockResolvedValue(mockData)

    const { result } = renderHook(() => useMyFeature())

    await waitFor(() => {
      expect(result.current.data.items).toEqual(mockData)
      expect(result.current.loading).toBe(false)
    })
  })
})
```

---

## API 設計規範

### RESTful API 端點

```
GET    /api/admin/resource           # 獲取列表
GET    /api/admin/resource/:id       # 獲取單個
POST   /api/admin/resource           # 創建
PUT    /api/admin/resource/:id       # 更新
PATCH  /api/admin/resource/:id       # 部分更新
DELETE /api/admin/resource/:id       # 刪除
```

### API 響應格式

**成功響應**:
```typescript
{
  data: T,
  ok: true
}
```

**錯誤響應**:
```typescript
{
  error: "錯誤訊息",
  ok: false,
  code?: "ERROR_CODE"
}
```

### 認證

所有後台 API 都需要管理員身份驗證：

```typescript
// middleware 自動檢查
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const user = await getUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.redirect('/login')
    }
  }
}
```

---

## 測試規範

### 測試類型

1. **單元測試** - Hook, Service, 工具函數
2. **集成測試** - API 路由
3. **E2E 測試** - 關鍵用戶流程（可選）

### 測試覆蓋率目標

- 核心模組: >80%
- Hook: >80%
- Service: >80%
- 工具函數: 100%

### 命名規範

```
__tests__/
├── hooks/
│   └── useMyFeature.test.ts
├── services/
│   └── MyFeatureService.test.ts
└── integration/
    └── api/my-feature.test.ts
```

---

## 相關文檔

- [組件架構規範](./COMPONENT_ARCHITECTURE.md) - 三層架構詳細說明
- [Hook 返回格式規範](./HOOK_STANDARDS.md) - Hook 設計模式
- [重構計劃](../REFACTORING_TODO.md) - 重構進度追蹤

---

## 常見問題

### Q: 為什麼要分三層（Page/Container/View）？

**A**:
- **可測試性**: 每層職責單一，易於測試
- **可重用性**: View 層組件可以在不同 Container 中重用
- **可維護性**: 修改 UI 不影響業務邏輯，反之亦然

### Q: 何時創建新 Service？

**A**:
- 當有新的後台功能模塊時
- 當 API 調用邏輯變得複雜時
- 當需要統一錯誤處理和重試時

### Q: 何時使用 useDataTable？

**A**:
- 需要表格或列表顯示數據時
- 需要篩選、排序、分頁功能時
- 數據量較大需要優化性能時

### Q: 如何處理表單驗證？

**A**:
使用 `useLessonForm` 或類似的表單 Hook，集成驗證邏輯：

```typescript
const { values, errors, handleChange, handleSubmit } = useMyForm({
  initialValues: {},
  validate: (values) => {
    const errors: Record<string, string> = {}
    if (!values.name) errors.name = '必填'
    return errors
  },
  onSubmit: async (values) => {
    await MyService.create(values)
  }
})
```

---

**最後更新**: 2025-12-15
**維護者**: Claude Code

如有問題，請參考相關文檔或提交 Issue。
