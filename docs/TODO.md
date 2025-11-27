# TODO

## 重構清單（Clean Code + Linus 原則）

- [x] 1. 統一後台頁面使用 AdminLayout（消除重複驗證邏輯）
- [x] 2. 移除 admin/page.tsx 重複的 loading/權限檢查
- [x] 3. 後台密碼統一用環境變數
- [x] 4. 刪除空的 web/src/data 資料夾
- [x] 5. admin/page.tsx 拆分子組件（StatCard、TopLessons、TopKeywords、RecentFeedback）

---

## ✅ 已完成

### Clean Code 第二輪 (2025-11-27)
- [x] 5 個 admin 頁面統一使用 AdminLayout + AdminHeader
- [x] 移除所有重複的權限驗證邏輯（約 -150 行）
- [x] useAdminAuth hook 統一管理驗證狀態
- [x] 環境變數 NEXT_PUBLIC_ADMIN_PASSWORD
- [x] admin/page.tsx 拆分 4 個子組件

### 後台 Dashboard
- [x] 總覽頁
- [x] 用戶管理（搜尋、開通）
- [x] 回報管理
- [x] 課程分析
- [x] 付費分析

### 事件追蹤
- [x] event_log 表
- [x] trackEvent 函數
- [x] 埋點完成

### Clean Code 第一輪
- [x] constants.ts
- [x] ui.tsx 共用組件
- [x] useFilteredLessons hook
- [x] LessonDetail 拆分子組件
