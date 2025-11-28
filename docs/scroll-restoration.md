# 滾動位置恢復實作說明

## 📚 教學版本（兩層理解）

### Layer 1: 核心問題 - DOM 穩定性

**滾動恢復最怕的是什麼？**
→ **DOM 尚未穩定就執行 `scrollTo`**

#### 問題時間線

```
0ms:   返回首頁，開始載入
10ms:  useEffect 執行 → scrollTo(1234) → 但頁面是空的！
200ms: lessons 載入完成 → 重新渲染 → 滾動位置重置為 0 ❌
```

#### 解決方案：雙保險

```tsx
// 保險 1: 等待 loading flag
useHomePersistence(!loading)  // loading = false 才執行

// 保險 2: 使用 RAF 確保 DOM 已更新
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    window.scrollTo({ top: scrollY, behavior: 'auto' })
  })
})
```

**為什麼需要雙重 RAF？**
- 第 1 次 RAF：等待瀏覽器下一次重繪
- 第 2 次 RAF：確保 React 的 DOM 更新已完成

---

### Layer 2: 當前實作的局限

#### 我們只記住了什麼？

```tsx
// LessonCard.tsx
sessionStorage.setItem('homeScrollY', window.scrollY.toString())
```

**只記住**：絕對滾動位置（scrollY）

#### 什麼情況會失效？

| 場景 | 記住的 scrollY | 返回後的頁面高度 | 結果 |
|------|---------------|----------------|------|
| 正常瀏覽 | 1234px | 相同 | ✅ 正確 |
| 點「展開全部」後 | 4069px | 變小（只顯示 20 張） | ❌ 跳到底部 |
| 切換篩選後 | 1234px | 變化（不同課程數） | ⚠️ 可能不準 |

**覆蓋率**：約 80%（正常瀏覽場景）

---

## 🚀 未來升級方向（完整版）

### 需要序列化的狀態

```tsx
interface HomeState {
  showAll: boolean           // 是否展開全部
  selectedCategory: string   // 選擇的快速入口
  search: string            // 搜尋關鍵字
  scrollY: number           // 滾動位置
  timestamp: number         // 時間戳（用於過期檢查）
}
```

### 實作步驟

#### Step 1: 離開時序列化

```tsx
// LessonCard.tsx
const handleClick = () => {
  const state: HomeState = {
    showAll,
    selectedCategory,
    search,
    scrollY: window.scrollY,
    timestamp: Date.now()
  }
  sessionStorage.setItem('homeState', JSON.stringify(state))
}
```

#### Step 2: 返回時還原狀態

```tsx
// page.tsx
function HomeContent() {
  const savedState = useRef(loadState()).current
  
  // 用快照初始化 state
  const [showAll, setShowAll] = useState(savedState?.showAll || false)
  const [selectedCategory, setSelectedCategory] = useState(savedState?.selectedCategory || null)
  const [search, setSearch] = useState(savedState?.search || '')
  
  // ...
}
```

#### Step 3: 等待資料載入完成

```tsx
useEffect(() => {
  if (!loading && savedState?.scrollY) {
    // 確保篩選後的課程列表已渲染
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedState.scrollY, behavior: 'auto' })
        sessionStorage.removeItem('homeState')
      })
    })
  }
}, [loading, savedState])
```

#### Step 4: Fallback 邏輯

```tsx
// 如果快照中的卡片不存在（例如篩選後消失）
if (savedState && !filteredLessons.some(l => l.id === savedState.lastViewedId)) {
  // Fallback: 滾動到最接近的位置或頂部
  window.scrollTo({ top: 0, behavior: 'auto' })
}
```

---

## 📊 成本效益分析

| 版本 | 開發時間 | 覆蓋率 | 維護成本 | 當前選擇 |
|------|---------|-------|---------|---------|
| 簡化版（只記 scrollY） | 30min | 80% | 低 | ✅ 已實作 |
| 完整版（序列化狀態） | 2-3hr | 95% | 中 | 未來可選 |

---

## 🎯 何時升級到完整版？

**觸發條件**（滿足任一即可升級）：

1. **用戶反饋**：「展開全部後返回會跳掉」的抱怨 >5 次/週
2. **數據指標**：「展開全部」使用率 >30%
3. **產品需求**：需要完美的瀏覽體驗（例如付費功能）

**不升級的理由**：
- 當前簡化版已覆蓋主要場景
- 用戶可以用「點頂部返回頂部」的原生功能
- 保持代碼簡單，降低維護成本

---

## 💡 關鍵學習點

### 1. 理解問題本質
- 不是「如何記住滾動位置」
- 而是「如何在 DOM 穩定後恢復」

### 2. 漸進式實作
- 先解決 80% 的場景（簡化版）
- 再根據需求升級（完整版）
- 不要一開始就過度設計

### 3. 接受取捨
- 完美方案 ≠ 最佳方案
- 簡單可靠 > 功能完整但複雜
- 根據實際需求決定投入程度

---

## 📝 相關檔案

- 實作：`web/src/hooks/useHomePersistence.ts`
- 使用：`web/src/app/page.tsx`
- 觸發：`web/src/components/LessonCard.tsx`

---

**最後更新**：2025-11-29
**當前版本**：簡化版（只記 scrollY）
**覆蓋率**：約 80%
