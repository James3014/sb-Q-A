# 後台管理系統架構文檔

最後更新: 2025-12-15

---

## 📋 目錄結構

```
web/src/
├── app/admin/               # 後台頁面
│   ├── page.tsx            # Dashboard 儀表盤
│   ├── users/              # 用戶管理
│   ├── lessons/            # 課程管理
│   ├── feedback/           # 回報管理
│   ├── coupons/            # 折扣碼管理
│   ├── affiliates/         # 聯盟行銷
│   ├── commissions/        # 分潤記錄
│   ├── analytics/          # 推廣分析
│   └── monetization/       # 付費分析
│
├── components/
│   ├── AdminLayout.tsx     # 後台通用布局
│   ├── ErrorBoundary.tsx   # 錯誤邊界
│   └── admin/              # 後台專用組件
│       └── lessons/        # 課程管理組件
│
├── services/               # API 服務層
│   ├── BaseService.ts      # 基礎服務類
│   └── admin/              # 後台服務
│       ├── AdminDashboardService.ts
│       ├── AdminLessonService.ts
│       └── AdminUserService.ts
│
├── lib/
│   ├── errors.ts           # 錯誤處理
│   ├── logging.ts          # 日誌系統
│   ├── apiRetry.ts         # API 重試
│   └── admin/
│       └── calculations.ts # 計算邏輯
│
└── hooks/                  # 自定義 Hooks
    ├── useAdminAuth.ts
    ├── useAffiliates.ts
    └── lessons/
        ├── useLessonForm.ts
        ├── useImageUpload.ts
        └── useFormValidation.ts
```

---

## 🏗️ 架構層級

### 1. 頁面層 (Page Layer)
**職責**: 路由、認證檢查、數據加載初始化
**範例**: `app/admin/lessons/page.tsx`

```typescript
export default function LessonsPage() {
  const { isReady } = useAdminAuth()
  const { data, loading } = useAdminLessons()

  if (!isReady) return <LoadingSpinner />
  return <LessonsContainer data={data} />
}
```

### 2. 容器層 (Container Layer)
**職責**: 狀態管理、事件處理、業務邏輯
**範例**: `LessonsContainer.tsx`

```typescript
export function LessonsContainer({ data }: Props) {
  const [tab, setTab] = useState('popular')
  const handleDelete = useCallback(...)

  return (
    <div>
      <TabBar tab={tab} onChange={setTab} />
      <LessonsView data={filtered} onDelete={handleDelete} />
    </div>
  )
}
```

### 3. 展示層 (Presentation Layer)
**職責**: 純 UI 渲染，無業務邏輯
**範例**: `LessonsView.tsx`

```typescript
export function LessonsView({ data, onDelete }: Props) {
  return (
    <div>
      {data.map(lesson => (
        <LessonCard key={lesson.id} lesson={lesson} onDelete={onDelete} />
      ))}
    </div>
  )
}
```

---

## 🔄 數據流

```
用戶操作
  ↓
頁面組件 (Page)
  ↓
Hook (useAdminLessons)
  ↓
Service (AdminLessonService)
  ↓
BaseService (認證 + 重試 + 日誌)
  ↓
API 端點 (/api/admin/lessons)
  ↓
Supabase Database
```

---

## 🛡️ 錯誤處理流程

```
API 請求錯誤
  ↓
BaseService 捕獲
  ↓
判斷錯誤類型 (Network, Auth, API, Validation)
  ↓
記錄到 Logger
  ↓
可重試錯誤? → 是 → exponential backoff 重試 (最多3次)
                ↓ 否
  ↓
拋出 AppError
  ↓
ErrorBoundary 捕獲
  ↓
顯示用戶友善訊息
```

---

## 🧪 測試策略

### 單元測試 (Unit Tests)
- **純函數**: `calculations.ts` 的所有函數
- **Hooks**: `useLessonForm`, `useAdminAuth` 等
- **目標覆蓋率**: >80%

### 集成測試 (Integration Tests)
- **API 服務**: Service 類的 API 調用
- **完整流程**: 從 Hook 到 Service 的數據流

### E2E 測試 (End-to-End)
- **關鍵路徑**: 登入 → 創建課程 → 編輯 → 刪除
- **工具**: Playwright

---

## 📝 代碼規範

### 命名規約
- **組件**: PascalCase (`LessonCard.tsx`)
- **Hook**: camelCase, 以 `use` 開頭 (`useLessonForm`)
- **Service**: PascalCase, 以 `Service` 結尾 (`AdminLessonService`)
- **常數**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### 文件組織
- 每個文件單一職責
- 相關文件放在同一目錄
- 共用邏輯提取到 `lib/` 或 `hooks/`

### TypeScript
- 所有函數都有返回類型
- 避免 `any`，使用 `unknown` 或具體類型
- 優先使用 `interface` 而非 `type`

---

## 🚀 添加新頁面步驟

### 1. 創建 Service
```typescript
// services/admin/AdminNewFeatureService.ts
export class AdminNewFeatureService extends BaseService {
  static async getAll() {
    return this.get<Data[]>('/api/admin/new-feature')
  }
}
```

### 2. 創建 Hook
```typescript
// hooks/useAdminNewFeature.ts
export function useAdminNewFeature() {
  const [data, setData] = useState<Data[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AdminNewFeatureService.getAll()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
```

### 3. 創建頁面
```typescript
// app/admin/new-feature/page.tsx
export default function NewFeaturePage() {
  const { isReady } = useAdminAuth()
  const { data, loading } = useAdminNewFeature()

  if (!isReady) return <LoadingSpinner />
  if (loading) return <LoadingSpinner />

  return <NewFeatureView data={data} />
}
```

### 4. 添加測試
```typescript
// __tests__/hooks/useAdminNewFeature.test.ts
describe('useAdminNewFeature', () => {
  it('should load data on mount', async () => {
    // ...
  })
})
```

---

## 📚 相關文檔

- [API 端點文檔](./ADMIN_API.md)
- [貢獻指南](./CONTRIBUTING.md)
- [重構計劃](../REFACTORING_TODO.md)

---

**維護者**: Claude Code
**聯絡**: 如有問題請查看 GitHub Issues
