# 事件映射文檔

## 概述

本文檔說明單板教學應用的事件如何映射到 user-core 的標準化事件類型。

## 事件映射表

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

## 事件結構

### user-core 標準事件格式

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
  "user_id": "uuid-123",
  "source_project": "snowboard-teaching",
  "event_type": "snowboard.lesson.viewed",
  "occurred_at": "2025-12-02T10:30:00Z",
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
  note: '今天練習很順利'
})
```

**user-core**：
```json
{
  "user_id": "uuid-123",
  "source_project": "snowboard-teaching",
  "event_type": "snowboard.practice.completed",
  "occurred_at": "2025-12-02T15:45:00Z",
  "payload": {
    "lesson_id": "lesson-01",
    "rating": 4,
    "note": "今天練習很順利",
    "original_event_type": "practice_complete"
  },
  "version": 1
}
```

#### 3. 搜尋事件

**單板教學**：
```typescript
trackEvent('search_keyword', undefined, {
  keyword: '後刃',
  results_count: 5
})
```

**user-core**：
```json
{
  "user_id": "uuid-123",
  "source_project": "snowboard-teaching",
  "event_type": "snowboard.search.performed",
  "occurred_at": "2025-12-02T11:20:00Z",
  "payload": {
    "keyword": "後刃",
    "results_count": 5,
    "original_event_type": "search_keyword"
  },
  "version": 1
}
```

## 事件命名規範

### 格式

```
<project>.<entity>.<action>
```

- **project**: `snowboard` - 專案前綴
- **entity**: 實體名稱（lesson, practice, favorite, search 等）
- **action**: 動作（viewed, completed, added, performed 等）

### 動作詞彙

| 動作 | 說明 | 範例 |
|------|------|------|
| `viewed` | 瀏覽/查看 | `snowboard.lesson.viewed` |
| `performed` | 執行 | `snowboard.search.performed` |
| `completed` | 完成 | `snowboard.practice.completed` |
| `started` | 開始 | `snowboard.practice.started` |
| `added` | 添加 | `snowboard.favorite.added` |
| `removed` | 移除 | `snowboard.favorite.removed` |
| `selected` | 選擇 | `snowboard.plan.selected` |
| `scrolled` | 滾動 | `snowboard.content.scrolled` |

## 批次處理

### 策略

事件不會立即發送到 user-core，而是使用批次處理：

1. **隊列累積**：事件先加入隊列
2. **觸發條件**：
   - 隊列達到 10 個事件
   - 或 5 秒後自動刷新
3. **並行發送**：批次中的所有事件並行發送

### 優勢

- ✅ 減少 API 調用次數
- ✅ 降低網絡開銷
- ✅ 提升性能
- ✅ 不阻塞主流程

### 實作

```typescript
// 在 userCoreSync.ts 中
export function queueEventSync(
  userId: string,
  eventType: string,
  payload: Record<string, unknown>
): void {
  eventQueue.push({ userId, eventType, payload })

  // 達到 10 個事件，立即刷新
  if (eventQueue.length >= 10) {
    flushEventQueue()
    return
  }

  // 否則等待 5 秒後批次刷新
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    flushEventQueue()
  }, 5000)
}
```

## 錯誤處理

### 失敗策略

1. **靜默失敗**：事件同步失敗不影響用戶體驗
2. **日誌紀錄**：所有錯誤紀錄到控制台
3. **不重試**：失敗的事件不會重試（避免複雜性）

### 監控

在瀏覽器控制台查看：

```
[UserCoreSync] Event synced: snowboard.lesson.viewed
[UserCoreSync] Failed to sync event: timeout
[UserCoreSync] Flushing 5 events...
```

## snowbuddy-matching 使用案例

### 基於學習行為的媒合

snowbuddy-matching 可以查詢 user-core 的事件，找到學習進度相似的雪伴：

```typescript
// 在 snowbuddy-matching 中
const events = await userCoreClient.getEvents({
  user_id: userId,
  source_project: 'snowboard-teaching',
  event_type: 'snowboard.practice.completed'
})

// 分析用戶的學習進度
const completedLessons = events.map(e => e.payload.lesson_id)
const avgRating = events
  .filter(e => e.payload.rating)
  .reduce((sum, e) => sum + e.payload.rating, 0) / events.length

// 找到相似的用戶
const similarUsers = await findUsersWithSimilarProgress(
  completedLessons,
  avgRating
)
```

### 教練學生媒合

基於練習評分找到需要幫助的學生：

```typescript
// 找到評分較低的學生
const strugglingStudents = await userCoreClient.getEvents({
  source_project: 'snowboard-teaching',
  event_type: 'snowboard.practice.completed',
  filter: 'payload.rating < 3'
})

// 推薦給教練
const coachMatches = await matchCoachesToStudents(strugglingStudents)
```

## 未來擴展

### 計劃中的事件

| 事件 | 說明 |
|------|------|
| `snowboard.lesson.bookmarked` | 課程書籤 |
| `snowboard.video.watched` | 觀看教學影片 |
| `snowboard.quiz.completed` | 完成測驗 |
| `snowboard.progress.milestone` | 達成里程碑 |
| `snowboard.social.shared` | 分享課程 |

### 事件聚合

未來可以在 user-core 中實現事件聚合：

```typescript
// 用戶學習統計
{
  total_lessons_viewed: 50,
  total_practices_completed: 30,
  avg_practice_rating: 4.2,
  favorite_count: 15,
  learning_streak_days: 7
}
```

## 參考

- [user-core API 文檔](https://user-core.zeabur.app/docs)
- [user-core 事件 schema](../../user-core/contracts/api-openapi.yaml)
- [shared 事件目錄](../../shared/event_catalog.yaml)

---

*最後更新：2025-12-02*
