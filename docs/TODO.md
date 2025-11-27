# TODO

## ✅ 事件追蹤系統 - 已完成

- [x] 1. 建立 `event_log` 資料表 (SQL)
- [x] 2. 建立 `trackEvent()` 函數
- [x] 3. 埋點：view_lesson
- [x] 4. 埋點：search_keyword
- [x] 5. 埋點：pricing_view
- [x] 6. 埋點：favorite_add/remove
- [x] 7. 埋點：practice_complete

## ✅ 回報系統 - 已完成

- [x] 8. 建立 `feedback` 資料表 (SQL)
- [x] 9. 建立回報頁面 `/feedback`
- [x] 10. 首頁加入回報入口

---

## ⏳ 待執行 SQL

需要在 Supabase SQL Editor 執行：
- `docs/migration_event_log.sql`

---

## ✅ 已完成 - Clean Code 重構

- [x] 刪除未使用檔案 (`lessons.json`, `FilterBar.tsx`)
- [x] 建立 `constants.ts` 統一常數
- [x] 抽出共用組件 `LoadingState`, `LockedState`, `PageHeader`
- [x] 拆分 `page.tsx` - 抽出篩選 hook
- [x] 拆分 `LessonDetail.tsx` 子組件
