# 🎯 功能規格集合

**最後更新**: 2025-12-05

---

## 目錄

1. [事件映射](#事件映射)
2. [Learning Path Engine](#learning-path-engine)
3. [滾動位置恢復](#滾動位置恢復)

---

## 事件映射

### 概述

本節說明單板教學應用的事件如何映射到 user-core 的標準化事件類型。

### 事件映射表

| 單板教學事件 | user-core 事件 | 說明 | Payload |
|-------------|---------------|------|---------|
| `view_lesson` | `snowboard.lesson.viewed` | 用戶瀏覽課程 | `{ lesson_id, source?, ... }` |
| `search_keyword` | `snowboard.search.performed` | 用戶執行搜尋 | `{ keyword, results_count?, ... }` |
| `search_no_result` | `snowboard.search.no_result` | 搜尋無結果 | `{ keyword, ... }` |
| `pricing_view` | `snowboard.pricing.viewed` | 瀏覽付費方案頁 | `{ ... }` |
| `plan_selected` | `snowboard.plan.selected` | 選擇訂閱方案 | `{ plan_id, price?, ... }` |
| `purchase_success` | `snowboard.purchase.completed` | 購買成功 | `{ plan_id, amount?, ... }` |
| `favorite_add` | `snowboard.favorite.added` | 添加收藏 | `{ lesson_id, ... }` |
| `favorite_remove` | `snowboard.favorite.removed` | 移除收藏 | `{ lesson_id, ... }` |
| `practice_complete` | `snowboard.practice.completed` | 完成練習 | `{ lesson_id, rating?, note?, ... }` |
| `practice_start` | `snowboard.practice.started` | 開始練習 | `{ lesson_id, ... }` |
| `scroll_depth` | `snowboard.content.scrolled` | 內容滾動深度 | `{ lesson_id, depth?, ... }` |

### 事件結構

#### user-core 標準事件格式

```typescript
{
  user_id: string              // 用戶 ID
  source_project: "snowboard-teaching"  // 來源專案
  event_type: string           // 事件類型（見上表）
  occurred_at: string          // ISO 8601 時間戳
  payload: {
    lesson_id?: string         // 課程 ID（如適用）
    original_event_type: string // 原始事件類型
    ...                        // 其他自定義欄位
  }
  version: 1                   // 事件 schema 版本
}
```

### 範例

#### 1. 課程瀏覽事件

**單板教學**：
```typescript
trackEvent('view_lesson', 'lesson-01', {
  source: 'home_page',
  category: 'beginner'
})
```

**user-core**：
```json
{
  "user_id": "user-123",
  "source_project": "snowboard-teaching",
  "event_type": "snowboard.lesson.viewed",
  "occurred_at": "2025-12-05T10:30:00Z",
  "payload": {
    "lesson_id": "lesson-01",
    "source": "home_page",
    "category": "beginner",
    "original_event_type": "view_lesson"
  },
  "version": 1
}
```

#### 2. 練習完成事件

**單板教學**：
```typescript
trackEvent('practice_complete', 'lesson-01', {
  rating: 4,
  note: "今天練習很順利"
})
```

**user-core**：
```json
{
  "user_id": "user-123",
  "source_project": "snowboard-teaching",
  "event_type": "snowboard.practice.completed",
  "occurred_at": "2025-12-05T10:30:00Z",
  "payload": {
    "lesson_id": "lesson-01",
    "rating": 4,
    "note": "今天練習很順利",
    "original_event_type": "practice_complete"
  },
  "version": 1
}
```

### 實作

**檔案**: `web/src/lib/analytics.ts`

```typescript
import { syncEventToCore } from './userCoreSync'

const EVENT_TYPE_MAPPING = {
  'view_lesson': 'snowboard.lesson.viewed',
  'search_keyword': 'snowboard.search.performed',
  'search_no_result': 'snowboard.search.no_result',
  'pricing_view': 'snowboard.pricing.viewed',
  'plan_selected': 'snowboard.plan.selected',
  'purchase_success': 'snowboard.purchase.completed',
  'favorite_add': 'snowboard.favorite.added',
  'favorite_remove': 'snowboard.favorite.removed',
  'practice_complete': 'snowboard.practice.completed',
  'practice_start': 'snowboard.practice.started',
  'scroll_depth': 'snowboard.content.scrolled',
}

export async function trackEvent(
  eventType: EventType,
  lessonId?: string,
  metadata?: Record<string, unknown>
) {
  // 1. 寫入 Supabase（保持現有邏輯）
  await supabase.from('event_log').insert({...})

  // 2. 同步到 user-core（非阻塞，批次處理）
  if (user?.id) {
    const userCoreEventType = EVENT_TYPE_MAPPING[eventType]
    queueEventSync(user.id, userCoreEventType, {
      lesson_id: lessonId,
      original_event_type: eventType,
      ...metadata
    })
  }
}
```

---

## Learning Path Engine

### 概述

Learning Path Engine 根據騎手狀態（程度、症狀、目標、已完成課程）產生個人化學習路徑。

### 架構

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│  web/src/lib/path/computeClientPath.ts                  │
│  - 前端呈現/排序/UI 轉換                                  │
└─────────────────────┬───────────────────────────────────┘
                      │ invoke
┌─────────────────────▼───────────────────────────────────┐
│              Supabase Edge Function                      │
│  supabase/functions/recommend-path/                      │
│  ├── index.ts      # 入口                                │
│  ├── types.ts      # 型別定義                            │
│  ├── score.ts      # 過濾 + 評分                         │
│  └── schedule.ts   # 排程 + 摘要                         │
└─────────────────────┬───────────────────────────────────┘
                      │ query
┌─────────────────────▼───────────────────────────────────┐
│                    Supabase DB                           │
│  lessons, skills, lesson_skills, lesson_prerequisites    │
└─────────────────────────────────────────────────────────┘
```

### API

#### POST /functions/v1/recommend-path

**Request**:
```json
{
  "riderState": {
    "profile": {
      "id": "user-123",
      "level": "intermediate",
      "preferredTerrain": ["blue", "black"],
      "avoidTerrain": ["park"],
      "goals": ["control_speed", "moguls_intro"]
    },
    "symptoms": [
      { "code": "rear_seat", "description": "後座", "severity": 2 },
      { "code": "ice_chatter", "description": "冰面抖", "severity": 1 }
    ],
    "completedLessons": ["lesson-01", "lesson-02"]
  }
}
```

**Response**:
```json
{
  "path": [
    {
      "lesson_id": "lesson-03",
      "title": "後刃控制",
      "score": 95,
      "reason": "解決後座問題",
      "priority": "high"
    },
    {
      "lesson_id": "lesson-04",
      "title": "冰面技巧",
      "score": 85,
      "reason": "改善冰面抖動",
      "priority": "medium"
    }
  ],
  "summary": {
    "total_lessons": 2,
    "estimated_time": "2 weeks",
    "focus_areas": ["後刃控制", "冰面技巧"]
  }
}
```

### 評分邏輯

**檔案**: `supabase/functions/recommend-path/score.ts`

```typescript
function scoreLessons(lessons, riderState) {
  return lessons.map(lesson => {
    let score = 0
    
    // 1. 症狀匹配（+30 分）
    if (matchesSymptoms(lesson, riderState.symptoms)) {
      score += 30
    }
    
    // 2. 目標匹配（+25 分）
    if (matchesGoals(lesson, riderState.profile.goals)) {
      score += 25
    }
    
    // 3. 程度匹配（+20 分）
    if (lesson.level === riderState.profile.level) {
      score += 20
    }
    
    // 4. 雪道偏好（+15 分）
    if (matchesTerrain(lesson, riderState.profile.preferredTerrain)) {
      score += 15
    }
    
    // 5. 前置課程完成（+10 分）
    if (prerequisitesMet(lesson, riderState.completedLessons)) {
      score += 10
    }
    
    return { ...lesson, score }
  })
}
```

### 前端整合

**檔案**: `web/src/lib/path/computeClientPath.ts`

```typescript
export async function computeClientPath(riderState) {
  // 1. 呼叫 Edge Function
  const response = await fetch('/functions/v1/recommend-path', {
    method: 'POST',
    body: JSON.stringify({ riderState })
  })
  
  const { path, summary } = await response.json()
  
  // 2. 前端排序/過濾
  const sortedPath = path
    .filter(lesson => lesson.score > 50)
    .sort((a, b) => b.score - a.score)
  
  return { path: sortedPath, summary }
}
```

---

## 滾動位置恢復

### 核心問題 - DOM 穩定性

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

### 實作

#### 1. 記錄滾動位置

**檔案**: `web/src/components/LessonCard.tsx`

```tsx
function LessonCard({ lesson }) {
  const handleClick = () => {
    // 記錄當前滾動位置
    sessionStorage.setItem('homeScrollY', window.scrollY.toString())
    
    // 導航到課程詳情
    router.push(`/lesson/${lesson.id}`)
  }
  
  return (
    <div onClick={handleClick}>
      {/* 課程卡片內容 */}
    </div>
  )
}
```

#### 2. 恢復滾動位置

**檔案**: `web/src/app/page.tsx`

```tsx
function HomePage() {
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // 載入課程資料
    fetchLessons().then(() => {
      setLoading(false)
    })
  }, [])
  
  useHomePersistence(!loading)  // 等待 loading = false
  
  return (
    <div>
      {loading ? <SkeletonLesson /> : <LessonList />}
    </div>
  )
}
```

**檔案**: `web/src/lib/useHomePersistence.ts`

```tsx
export function useHomePersistence(ready: boolean) {
  useEffect(() => {
    if (!ready) return
    
    const scrollY = sessionStorage.getItem('homeScrollY')
    if (!scrollY) return
    
    // 雙重 RAF 確保 DOM 穩定
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(scrollY), behavior: 'auto' })
        sessionStorage.removeItem('homeScrollY')
      })
    })
  }, [ready])
}
```

### 局限性

#### 我們只記住了什麼？

```tsx
sessionStorage.setItem('homeScrollY', window.scrollY.toString())
```

**只記住**：絕對滾動位置（scrollY）

#### 什麼情況會失效？

1. **篩選條件改變**：用戶返回後改變篩選，課程列表不同
2. **視窗大小改變**：手機橫豎屏切換
3. **課程數量改變**：新增或刪除課程

#### 改進方案（未實作）

記錄更多上下文：
```tsx
sessionStorage.setItem('homeContext', JSON.stringify({
  scrollY: window.scrollY,
  filters: { level, slope, skill },
  lessonId: currentLessonId,  // 當前可見的課程 ID
  timestamp: Date.now()
}))
```

恢復時：
1. 檢查 filters 是否相同
2. 如果不同，嘗試滾動到 lessonId
3. 如果 lessonId 不存在，放棄恢復

---

**最後更新**: 2025-12-05
**狀態**: ✅ 已實作
