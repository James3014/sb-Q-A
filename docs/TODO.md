# TODO

## ✅ 後台 Dashboard - 已完成

### Phase 1 - 基本數據
- [x] 1. 建立 `/admin` 路由 + 管理員驗證
- [x] 2. 總覽頁：DAU/WAU 統計
- [x] 3. 總覽頁：熱門課程 TOP 10
- [x] 4. 總覽頁：最新回報 5 筆
- [x] 5. `/admin/feedback` 回報列表頁

### Phase 2 - 進階分析
- [x] 6. `/admin/lessons` 課程分析頁
- [x] 7. `/admin/monetization` 付費分析頁

---

## ⏳ 待執行 SQL

需要在 Supabase SQL Editor 執行：
- `docs/migration_admin.sql` (後台統計函數)

---

## ✅ 已完成

### 事件追蹤系統
- [x] event_log 資料表
- [x] trackEvent() 函數
- [x] 埋點：view_lesson, search_keyword, pricing_view, favorite, practice

### 回報系統
- [x] feedback 資料表
- [x] /feedback 回報頁面
- [x] 首頁回報入口

### Clean Code 重構
- [x] constants.ts 統一常數
- [x] 共用組件 ui.tsx
- [x] useFilteredLessons hook
- [x] LessonDetail 子組件拆分
