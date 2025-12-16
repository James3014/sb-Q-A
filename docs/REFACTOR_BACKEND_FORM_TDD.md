# 🔧 後台表單系統 TDD 重構計畫

## 📋 **重構目標**

基於 Clean Code 和 Linus 原則，將後台表單系統重構為：
- **模組化** - 單一職責，低耦合
- **可測試** - TDD 驅動開發
- **可維護** - 清晰的關注點分離

## 🎯 **TDD 重構流程**

### Phase 1: 🚨 緊急修復 (P0)

#### ✅ Task 1.1: 修復 React Error #310
**測試先行**：
```typescript
// tests/hooks/useLessonForm.test.ts
describe('useLessonForm useCallback dependencies', () => {
  it('should not throw React Error #310 on state updates', () => {
    // 測試 useCallback 依賴正確性
  })
  
  it('should maintain latest state in submit function', () => {
    // 測試 stale closure 問題
  })
})
```

**實作目標**：
- [ ] 建立測試檔案 `tests/hooks/useLessonForm.test.ts`
- [ ] 寫失敗測試（Red）
- [ ] 修復 useCallback 依賴問題（Green）
- [ ] 重構優化（Refactor）

**驗收標準**：
- ✅ 無 React Error #310
- ✅ submit 函數使用最新 state
- ✅ 所有測試通過

---

### Phase 2: 🔥 核心重構 (P1)

#### ✅ Task 2.1: 抽離表單狀態管理
**測試先行**：
```typescript
// tests/hooks/useFormState.test.ts
describe('useFormState', () => {
  it('should initialize with default state', () => {})
  it('should update state correctly', () => {})
  it('should reset to initial state', () => {})
})
```

**實作目標**：
- [ ] 建立 `hooks/form/useFormState.ts`
- [ ] 純狀態管理，無副作用
- [ ] 支援初始化、更新、重置

#### ✅ Task 2.2: 抽離表單動作函數
**測試先行**：
```typescript
// tests/hooks/useFormActions.test.ts
describe('useFormActions', () => {
  it('should provide stable action functions', () => {})
  it('should update state through actions', () => {})
})
```

**實作目標**：
- [ ] 建立 `hooks/form/useFormActions.ts`
- [ ] 純動作函數，穩定引用
- [ ] 與狀態管理解耦

#### ✅ Task 2.3: 抽離資料載入邏輯
**測試先行**：
```typescript
// tests/hooks/useLessonLoader.test.ts
describe('useLessonLoader', () => {
  it('should load lesson data correctly', () => {})
  it('should handle loading states', () => {})
  it('should handle errors gracefully', () => {})
})
```

**實作目標**：
- [ ] 建立 `hooks/lessons/useLessonLoader.ts`
- [ ] 分離載入邏輯與表單邏輯
- [ ] 清晰的載入狀態管理

#### ✅ Task 2.4: 重構 useLessonForm 為組合 Hook
**測試先行**：
```typescript
// tests/hooks/useLessonEditor.test.ts
describe('useLessonEditor', () => {
  it('should compose all form functionality', () => {})
  it('should handle edit mode correctly', () => {})
  it('should handle create mode correctly', () => {})
})
```

**實作目標**：
- [ ] 建立 `hooks/lessons/useLessonEditor.ts`
- [ ] 組合所有子 Hook
- [ ] 保持向後相容的 API

---

### Phase 3: ⚡ 架構優化 (P2)

#### ✅ Task 3.1: 組件職責分離
**測試先行**：
```typescript
// tests/components/LessonFormFields.test.tsx
describe('LessonFormFields', () => {
  it('should render all form fields', () => {})
  it('should handle field updates', () => {})
  it('should display validation errors', () => {})
})
```

**實作目標**：
- [ ] 建立 `components/admin/lessons/LessonFormFields.tsx`
- [ ] 純 UI 組件，無業務邏輯
- [ ] 完整的 props 型別定義

#### ✅ Task 3.2: 動作按鈕組件化
**測試先行**：
```typescript
// tests/components/LessonFormActions.test.tsx
describe('LessonFormActions', () => {
  it('should render action buttons', () => {})
  it('should handle submit correctly', () => {})
  it('should show loading states', () => {})
})
```

**實作目標**：
- [ ] 建立 `components/admin/lessons/LessonFormActions.tsx`
- [ ] 分離按鈕邏輯與表單邏輯
- [ ] 支援載入狀態顯示

#### ✅ Task 3.3: 重構 LessonForm 為容器組件
**測試先行**：
```typescript
// tests/components/LessonForm.test.tsx
describe('LessonForm', () => {
  it('should orchestrate form components', () => {})
  it('should handle data flow correctly', () => {})
})
```

**實作目標**：
- [ ] 重構 `LessonForm.tsx` 為純容器
- [ ] 只負責組件組合與資料流
- [ ] 移除所有業務邏輯

---

### Phase 4: 🛠️ 品質提升 (P3)

#### ✅ Task 4.1: 錯誤處理統一
**測試先行**：
```typescript
// tests/hooks/useErrorBoundary.test.ts
describe('useErrorBoundary', () => {
  it('should capture and display errors', () => {})
  it('should provide error recovery', () => {})
})
```

**實作目標**：
- [ ] 建立 `hooks/common/useErrorBoundary.ts`
- [ ] 統一錯誤處理機制
- [ ] 錯誤恢復功能

#### ✅ Task 4.2: 效能優化
**測試先行**：
```typescript
// tests/performance/FormPerformance.test.tsx
describe('Form Performance', () => {
  it('should minimize re-renders', () => {})
  it('should memo expensive components', () => {})
})
```

**實作目標**：
- [ ] 表單欄位 memo 化
- [ ] 減少不必要的 re-render
- [ ] 效能監控與測試

#### ✅ Task 4.3: 型別安全強化
**測試先行**：
```typescript
// tests/types/FormTypes.test.ts
describe('Form Types', () => {
  it('should enforce strict typing', () => {})
  it('should validate runtime types', () => {})
})
```

**實作目標**：
- [ ] 嚴格的 TypeScript 配置
- [ ] Runtime 型別檢查
- [ ] 完整的型別覆蓋

---

## 📁 **重構後的檔案結構**

```
web/src/
├── hooks/
│   ├── form/                    # 通用表單 Hook
│   │   ├── useFormState.ts      # 狀態管理
│   │   ├── useFormActions.ts    # 動作函數
│   │   └── useFormValidation.ts # 驗證邏輯
│   │
│   ├── lessons/                 # 課程專用 Hook
│   │   ├── useLessonLoader.ts   # 資料載入
│   │   ├── useLessonEditor.ts   # 編輯器組合
│   │   └── useLessonForm.ts     # 向後相容 (deprecated)
│   │
│   └── common/                  # 通用 Hook
│       ├── useErrorBoundary.ts  # 錯誤處理
│       └── useAsyncState.ts     # 異步狀態
│
├── components/admin/lessons/
│   ├── LessonForm.tsx           # 容器組件
│   ├── LessonFormFields.tsx     # 欄位組件
│   ├── LessonFormActions.tsx    # 動作組件
│   └── LessonFormContent.tsx    # 內容組件 (重構)
│
└── tests/                       # 測試檔案
    ├── hooks/
    ├── components/
    ├── performance/
    └── types/
```

## 🎯 **TDD 執行原則**

### Red-Green-Refactor 循環
1. **Red** - 寫失敗測試，明確需求
2. **Green** - 最小實作，讓測試通過
3. **Refactor** - 優化代碼，保持測試通過

### 測試策略
- **單元測試** - Hook 和工具函數
- **整合測試** - 組件互動
- **效能測試** - 渲染效能
- **型別測試** - TypeScript 型別安全

### 驗收標準
每個 Task 完成需滿足：
- ✅ 所有測試通過
- ✅ 型別檢查通過
- ✅ ESLint 無警告
- ✅ 效能無退化
- ✅ 向後相容性保持

## 📊 **進度追蹤**

| Phase | Tasks | 完成 | 測試覆蓋率 | 狀態 |
|-------|-------|------|-----------|------|
| P0    | 1/1   | 0%   | 0%        | 🔴 待開始 |
| P1    | 4/4   | 0%   | 0%        | ⏸️ 等待 P0 |
| P2    | 3/3   | 0%   | 0%        | ⏸️ 等待 P1 |
| P3    | 3/3   | 0%   | 0%        | ⏸️ 等待 P2 |

**總進度**: 0/11 (0%)

---

## 🚀 **開始執行**

```bash
# 1. 建立測試環境
npm install --save-dev @testing-library/react @testing-library/jest-dom

# 2. 開始 Phase 1
cd web/src
mkdir -p tests/hooks
touch tests/hooks/useLessonForm.test.ts

# 3. 執行 TDD 循環
npm test -- --watch
```

**下一步**: 開始 Task 1.1 - 修復 React Error #310

---

*建立時間: 2025-12-16*  
*更新時間: 待更新*
