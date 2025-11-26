# 單板教學 App - TODO（TDD 版）

> 先寫測試 → 再寫實作 → 測試通過

---

## Week 1: PWA 基礎

### 1.1 專案初始化

```bash
# 建立 Next.js 專案
npx create-next-app@latest web --typescript --tailwind --app --src-dir

# 目錄結構
web/
├── src/
│   ├── app/
│   │   ├── page.tsx        # 首頁
│   │   ├── lesson/[id]/    # 詳情頁
│   │   └── layout.tsx      # 共用 layout
│   ├── components/
│   │   ├── LessonCard.tsx
│   │   ├── SearchBar.tsx
│   │   └── FilterBar.tsx
│   ├── lib/
│   │   └── lessons.ts      # 資料讀取
│   └── data/
│       └── lessons.json    # 複製過來
├── public/
│   ├── manifest.json       # PWA
│   └── icons/
└── package.json
```

### 1.2 測試：資料讀取

```typescript
// __tests__/lessons.test.ts
import { getLessons, getLessonById, filterLessons } from '@/lib/lessons'

test('getLessons 回傳 211 筆', () => {
  const lessons = getLessons()
  expect(lessons.length).toBe(211)
})

test('getLessonById 找到資料', () => {
  const lesson = getLessonById('01')
  expect(lesson).not.toBeNull()
  expect(lesson?.title).toBeDefined()
})

test('filterLessons 篩選程度', () => {
  const lessons = filterLessons({ level: 'intermediate' })
  lessons.forEach(l => {
    expect(l.level_tags).toContain('intermediate')
  })
})

test('filterLessons 搜尋關鍵字', () => {
  const lessons = filterLessons({ search: '換刃' })
  expect(lessons.length).toBeGreaterThan(0)
})
```

實作：
- [ ] `src/lib/lessons.ts`
- [ ] `src/data/lessons.json`

### 1.3 測試：元件

```typescript
// __tests__/components.test.tsx
import { render, screen } from '@testing-library/react'
import LessonCard from '@/components/LessonCard'

test('LessonCard 顯示問題', () => {
  const lesson = { id: '01', what: '測試問題', title: '測試標題' }
  render(<LessonCard lesson={lesson} />)
  expect(screen.getByText(/測試問題/)).toBeInTheDocument()
})

test('LessonCard 顯示標籤', () => {
  const lesson = { id: '01', level_tags: ['intermediate'], slope_tags: ['blue'] }
  render(<LessonCard lesson={lesson} />)
  expect(screen.getByText('中級')).toBeInTheDocument()
})
```

實作：
- [ ] `src/components/LessonCard.tsx`
- [ ] `src/components/SearchBar.tsx`
- [ ] `src/components/FilterBar.tsx`

### 1.4 測試：頁面

```typescript
// __tests__/pages.test.tsx
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

test('首頁顯示卡片列表', () => {
  render(<Home />)
  expect(screen.getByText(/找到.*個練習/)).toBeInTheDocument()
})

test('首頁有搜尋框', () => {
  render(<Home />)
  expect(screen.getByPlaceholderText(/搜尋/)).toBeInTheDocument()
})
```

實作：
- [ ] `src/app/page.tsx`
- [ ] `src/app/lesson/[id]/page.tsx`
- [ ] `src/app/layout.tsx`

### 1.5 PWA 設定

```json
// public/manifest.json
{
  "name": "單板教學",
  "short_name": "單板教學",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

驗收：
- [ ] 手機 Safari/Chrome 可「加到主畫面」
- [ ] 開啟後無瀏覽器 UI

### 1.6 部署

```bash
# Zeabur 設定
- 連接 GitHub repo
- 自動偵測 Next.js
- 設定環境變數（Week 2 才需要）
```

驗收：
- [ ] push 後自動部署
- [ ] 手機可正常瀏覽

---

## Week 2: 用戶系統

### 2.1 Supabase Client

```typescript
// __tests__/supabase.test.ts
import { supabase } from '@/lib/supabase'

test('supabase client 存在', () => {
  expect(supabase).toBeDefined()
})
```

實作：
- [ ] `src/lib/supabase.ts`
- [ ] `.env.local` - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

### 2.2 測試：Auth

```typescript
// __tests__/auth.test.ts
import { signUp, signIn, signOut, getUser } from '@/lib/auth'

test('signUp 回傳 user 或 error', async () => {
  const result = await signUp('test@example.com', 'password123')
  expect(result.user || result.error).toBeDefined()
})

test('signIn 回傳 session 或 error', async () => {
  const result = await signIn('test@example.com', 'password123')
  expect(result.session || result.error).toBeDefined()
})

test('signOut 不報錯', async () => {
  await expect(signOut()).resolves.not.toThrow()
})

test('getUser 未登入回傳 null', async () => {
  const user = await getUser()
  expect(user).toBeNull()
})
```

實作：
- [ ] `src/lib/auth.ts`
- [ ] `src/app/login/page.tsx`
- [ ] `src/components/AuthButton.tsx`

### 2.3 測試：收藏

```typescript
// __tests__/favorites.test.ts
import { addFavorite, removeFavorite, getFavorites, isFavorited } from '@/lib/favorites'

test('addFavorite 成功', async () => {
  const result = await addFavorite('user-id', '01')
  expect(result.error).toBeUndefined()
})

test('getFavorites 回傳陣列', async () => {
  const favs = await getFavorites('user-id')
  expect(Array.isArray(favs)).toBe(true)
})

test('isFavorited 回傳 boolean', async () => {
  const result = await isFavorited('user-id', '01')
  expect(typeof result).toBe('boolean')
})
```

實作：
- [ ] `src/lib/favorites.ts`
- [ ] `src/components/FavoriteButton.tsx`
- [ ] `src/app/favorites/page.tsx`

### 2.4 測試：練習紀錄

```typescript
// __tests__/practice.test.ts
import { logPractice, getRecentPractices } from '@/lib/practice'

test('logPractice 成功', async () => {
  const result = await logPractice('user-id', '01', 4)
  expect(result.error).toBeUndefined()
})

test('getRecentPractices 回傳陣列', async () => {
  const logs = await getRecentPractices('user-id', 10)
  expect(Array.isArray(logs)).toBe(true)
})
```

實作：
- [ ] `src/lib/practice.ts`
- [ ] `src/components/PracticeButton.tsx`
- [ ] `src/app/practice/page.tsx`

---

## Week 3: 付費功能

### 3.1 測試：Premium 檢查

```typescript
// __tests__/premium.test.ts
import { isPremium, getPremiumLessons, getFreeLessons } from '@/lib/premium'

test('getFreeLessons 約 50 筆', () => {
  const lessons = getFreeLessons()
  expect(lessons.length).toBeGreaterThanOrEqual(40)
  expect(lessons.length).toBeLessThanOrEqual(60)
})

test('getPremiumLessons 約 160 筆', () => {
  const lessons = getPremiumLessons()
  expect(lessons.length).toBeGreaterThan(150)
})

test('isPremium 回傳 boolean', async () => {
  const result = await isPremium('user-id')
  expect(typeof result).toBe('boolean')
})
```

實作：
- [ ] `src/lib/premium.ts`
- [ ] 更新 `lessons.json` 加入 `is_premium` 欄位

### 3.2 Premium UI

實作：
- [ ] `src/components/PremiumLock.tsx`
- [ ] `src/app/premium/page.tsx`

驗收：
- [ ] Free 用戶看到 Premium 內容有 🔒
- [ ] 點擊 🔒 跳轉到付費頁

---

## 檔案結構

```
單板教學/
├── web/                    # Next.js 專案
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── lesson/[id]/page.tsx
│   │   │   ├── favorites/page.tsx
│   │   │   ├── practice/page.tsx
│   │   │   └── premium/page.tsx
│   │   ├── components/
│   │   │   ├── LessonCard.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── AuthButton.tsx
│   │   │   ├── FavoriteButton.tsx
│   │   │   ├── PracticeButton.tsx
│   │   │   └── PremiumLock.tsx
│   │   ├── lib/
│   │   │   ├── lessons.ts
│   │   │   ├── supabase.ts
│   │   │   ├── auth.ts
│   │   │   ├── favorites.ts
│   │   │   ├── practice.ts
│   │   │   └── premium.ts
│   │   └── data/
│   │       └── lessons.json
│   ├── __tests__/
│   │   ├── lessons.test.ts
│   │   ├── components.test.tsx
│   │   ├── auth.test.ts
│   │   ├── favorites.test.ts
│   │   ├── practice.test.ts
│   │   └── premium.test.ts
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   └── package.json
├── lessons.json            # 原始資料（保留）
├── docs/
│   ├── PLAN.md
│   ├── TODO.md
│   └── schema.sql
└── README.md
```

---

## 執行測試

```bash
cd web
npm test              # 執行所有測試
npm test -- --watch   # 監聽模式
npm run dev           # 開發伺服器
npm run build         # 建置
```
