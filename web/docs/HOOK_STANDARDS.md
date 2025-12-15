# Hook 返回格式統一規範

## 目標
統一所有自定義 Hook 的返回格式，提升代碼可讀性、可預測性和可維護性。

## 標準格式

所有自定義 Hook 必須返回以下結構：

```typescript
{
  // 1. 數據 (data) - 必需
  data: T | T[] | Record<string, T>

  // 2. 加載狀態 (loading) - 必需
  loading: boolean

  // 3. 錯誤 (error) - 必需
  error: AppError | string | null

  // 4. UI 狀態 (state) - 可選，當有 UI 狀態時必須使用
  state?: {
    tab?: string
    filter?: FilterConfig
    sort?: SortConfig
    search?: string
    ...其他 UI 狀態
  }

  // 5. 事件處理器 (actions) - 必需，當有任何操作時
  actions: {
    refresh: () => void | Promise<void>
    create?: (data: T) => Promise<void>
    update?: (id: string, data: Partial<T>) => Promise<void>
    delete?: (id: string) => Promise<void>
    ...其他操作
  }

  // 6. 派生數據 / 統計 (可選，但不應放在 state 中)
  stats?: {
    total: number
    ...其他統計
  }
}
```

## 命名規則

### 1. 數據字段
- **單一實體**: `data: User` 或 直接使用實體名 `user: User`
- **列表**: `data: User[]` 或 `users: User[]`
- **字典**: `data: Record<string, User>`

### 2. 操作字段
所有操作必須放在 `actions:{}` 對象中：

**✅ 正確**:
```typescript
actions: {
  refresh: loadData,
  createAffiliate,
  toggleAffiliate,
  deleteLesson
}
```

**❌ 錯誤** (不要直接暴露操作):
```typescript
{
  loadAffiliates,
  createAffiliate,
  toggleAffiliate
}
```

### 3. UI 狀態字段
所有 UI 狀態必須放在 `state:{}` 對象中：

**✅ 正確**:
```typescript
state: {
  tab: 'popular',
  filter: { level: 'beginner' },
  sort: { field: 'views', order: 'desc' }
}
```

**❌ 錯誤** (不要直接暴露狀態):
```typescript
{
  tab,
  filter,
  sort
}
```

## 實例對比

### ❌ 舊格式 (不符合規範)

```typescript
export const useAffiliates = () => {
  // ...
  return {
    affiliates,           // 數據未統一命名
    loading,
    error,
    stats,               // OK
    loadAffiliates,      // 操作未分組
    createAffiliate,     // 操作未分組
    toggleAffiliate      // 操作未分組
  }
}
```

### ✅ 新格式 (符合規範)

```typescript
export const useAffiliates = () => {
  // ...
  return {
    data: affiliates,     // 統一命名為 data
    loading,              // 標準字段
    error,                // 標準字段
    stats,                // 統計信息
    actions: {            // 操作分組
      refresh: loadAffiliates,
      create: createAffiliate,
      toggle: toggleAffiliate
    }
  }
}
```

## 實際範例

### 範例 1: 簡單數據 Hook

```typescript
export function useUserProfile(userId: string) {
  const [data, setData] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUser = async () => {
    setLoading(true)
    try {
      const user = await UserService.get(userId)
      setData(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUser() }, [userId])

  return {
    data,           // 數據
    loading,        // 加載狀態
    error,          // 錯誤
    actions: {      // 操作
      refresh: loadUser
    }
  }
}
```

### 範例 2: 列表 Hook (無 UI 狀態)

```typescript
export function useAffiliates() {
  const [data, setData] = useState<Affiliate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ... loadAffiliates, createAffiliate, toggleAffiliate

  const stats = useMemo(() => ({
    total: data.length,
    active: data.filter(a => a.is_active).length
  }), [data])

  return {
    data,            // 數據
    loading,         // 加載狀態
    error,           // 錯誤
    stats,           // 派生統計
    actions: {       // 操作
      refresh: loadAffiliates,
      create: createAffiliate,
      toggle: toggleAffiliate
    }
  }
}
```

### 範例 3: 複雜 Hook (有 UI 狀態)

```typescript
export function useAdminLessons() {
  const [data, setData] = useState<AdminLessonsData>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // UI 狀態
  const [tab, setTab] = useState('stats')
  const [filter, setFilter] = useState({})

  // ...

  return {
    data,              // 數據
    loading,           // 加載狀態
    error,             // 錯誤
    state: {           // UI 狀態
      tab,
      filter
    },
    actions: {         // 操作
      refresh: loadData,
      deleteLesson,
      setTab,          // UI 狀態修改也算操作
      setFilter
    }
  }
}
```

### 範例 4: 表格 Hook (完整示例)

```typescript
export function useDataTable<T>(config: DataTableConfig<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  // UI 狀態
  const [filter, setFilter] = useState(config.initialFilter)
  const [sort, setSort] = useState<SortConfig | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  })
  const [search, setSearch] = useState('')

  // ... logic

  return {
    data: paginatedData,  // 數據 (經過分頁處理)
    loading,              // 加載狀態
    error,                // 錯誤
    state: {              // UI 狀態
      filter,
      sort,
      pagination,
      search
    },
    actions: {            // 操作
      setFilter,
      setSort,
      setPage,
      setPageSize,
      setSearch,
      refresh,
      reset
    },
    stats: {              // 統計
      total: data.length,
      filtered: filteredData.length,
      pageCount: Math.ceil(filteredData.length / pagination.pageSize)
    }
  }
}
```

## 遷移指南

### 步驟 1: 識別不符合規範的 Hook

運行以下命令找出需要重構的 Hook:

```bash
# 查找直接返回操作函數的 Hook
grep -r "return {" src/hooks/ | grep -v "actions:"
```

### 步驟 2: 重構 Hook

1. **數據字段標準化**:
   - 單一實體: 使用 `data` 或實體名
   - 列表: 使用 `data: T[]`

2. **操作分組**:
   - 將所有操作函數放入 `actions: {}` 對象
   - `refresh` 是標準操作名 (取代 load*, fetch*, reload*)

3. **UI 狀態分組**:
   - 將 tab, filter, sort 等放入 `state: {}` 對象
   - setState 函數放入 `actions: {}` 對象

### 步驟 3: 更新組件使用方式

**之前**:
```typescript
const { affiliates, loadAffiliates, createAffiliate } = useAffiliates()

// 使用
loadAffiliates()
createAffiliate(data)
```

**之後**:
```typescript
const { data: affiliates, actions } = useAffiliates()

// 使用
actions.refresh()
actions.create(data)
```

或使用解構:
```typescript
const {
  data: affiliates,
  actions: { refresh, create }
} = useAffiliates()

// 使用
refresh()
create(data)
```

## 例外情況

### 1. 簡單的輔助 Hook
非數據 Hook (如 `useCardAnimation`, `useScrollRestoration`) 不需要遵循此格式。

### 2. 第三方 Hook
不要重構第三方庫的 Hook (如 `useRouter`, `useState`)。

### 3. 已有大量使用的穩定 Hook
如果 Hook 被大量使用且修改成本過高，可以：
1. 創建新版本 Hook (如 `useAffiliatesV2`)
2. 逐步遷移
3. 標記舊版本為 `@deprecated`

## 檢查清單

在提交 PR 前，確保：

- [ ] Hook 返回對象包含 `data`, `loading`, `error`
- [ ] 所有操作函數在 `actions: {}` 對象中
- [ ] UI 狀態在 `state: {}` 對象中 (如果有)
- [ ] `refresh` 操作存在 (取代 load*)
- [ ] TypeScript 類型定義完整
- [ ] 組件已更新使用新格式
- [ ] 測試已更新

## 參考

- [useAdminLessons.ts](../src/hooks/useAdminLessons.ts) - 標準範例
- [useDataTable.ts](../src/hooks/useDataTable.ts) - 複雜範例
- [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) - 組件架構規範

---

**最後更新**: 2025-12-15
**維護者**: Claude Code
