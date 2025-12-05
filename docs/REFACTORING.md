# 🔧 重構與清理記錄

**最後更新**: 2025-12-05

---

## 目錄

1. [重構歷史](#重構歷史)
2. [待辦清單](#待辦清單)
3. [檔案整理](#檔案整理)

---

## 重構歷史

### 第一輪：常數抽離

**目標**: 統一管理常數，避免重複定義

**實作**:
- 建立 `lib/constants.ts`
- 統一管理 LEVEL_TAGS、SLOPE_TAGS、SKILL_TAGS
- 統一 emoji 圖示對應

### 第二輪：共用組件

**目標**: 抽離重複的 UI 組件

**實作**:
- 建立 `components/ui.tsx`
- 抽離 Button、LoadingState、LoadingText、PageHeader
- 抽離 LockedState、EmptyState、ProgressBar、FunnelBar、StatCard

### 第三輪：Hook 抽離

**目標**: 將複雜邏輯抽離為 Hook

**實作**:
- 建立 `lib/useFilteredLessons.ts`
- 將首頁篩選邏輯從 page.tsx 抽離
- 包含搜尋、程度、雪道、技能篩選

### 第四輪：課程詳情拆分

**目標**: 拆分大型組件，提升可維護性

**實作**:
- 建立 `components/lesson/` 目錄
- LessonHeader.tsx - 標題、標籤、收藏按鈕
- LessonContent.tsx - What/Why/How/Signals 區塊
- LessonPractice.tsx - 練習紀錄表單
- LessonRecommend.tsx - 相關推薦

### 第五輪：後台統一

**目標**: 統一後台驗證邏輯

**實作**:
- 建立 `components/AdminLayout.tsx`
- 統一後台頁面驗證邏輯
- 建立 `lib/useAdminAuth.ts` Hook

### 第六輪：Dashboard 拆分

**目標**: 拆分 Dashboard 組件

**實作**:
- 建立 `components/dashboard/` 目錄
- StatsCards.tsx - DAU/WAU 統計卡片
- TopLessons.tsx - 熱門課程列表
- TopSearches.tsx - 熱門搜尋
- RecentFeedback.tsx - 最新回報

### 第七輪：Types 與 UI 整理

**目標**: 整理型別定義和 UI 組件

**實作**:
- `types/lesson.ts` → `lesson-v3.ts`（標記未來規劃）
- `types/rider.ts` → `rider-v3.ts`（標記未來規劃）
- `ui.tsx` 拆分為 `ui/` 目錄：
  - `Button.tsx` - Button + vibrate()
  - `Loading.tsx` - LoadingState, LoadingText
  - `Layout.tsx` - PageHeader, LockedState, EmptyState
  - `Stats.tsx` - ProgressBar, FunnelBar, StatCard
  - `index.ts` - 統一導出
- 新增 `ErrorBoundary.tsx` 全域錯誤邊界

---

## UX 優化

### 第一輪優化

| 項目 | 說明 |
|------|------|
| 字級優化 | 正文 14px → 18px，行高 1.8 |
| 錯誤頁改善 | 返回按鈕、emoji、說明文字、spinner |
| 震動回饋 | `vibrate()` 函數，Android 觸覺回饋 |
| Skeleton 載入 | `SkeletonLesson.tsx` 骨架屏 |
| 底部操作欄 | `BottomActionBar.tsx`（60px 高） |
| 觸控目標 | 所有按鈕 ≥44px |
| 搜尋框放大 | 高度 40px → 56px，字級 18px |

### 第二輪優化

| 項目 | 說明 |
|------|------|
| 對比度提升 | blue-600 → blue-700，green-600 → green-700 |
| 卡片邊框 | 加 `border border-zinc-700` |
| 弱網重試 | `lib/retry.ts` - fetchWithRetry |
| 省電模式 | `prefers-reduced-motion` 支援 |
| 圖片優化 | Next/Image lazy loading |
| 頂部圖示 | 44x44px 觸控區域 + hover 背景 |

### 第三輪優化（2025-11-28）

| 項目 | 說明 |
|------|------|
| Snow Mode | 高對比主題（黃黑/橙黑，對比度 12.3:1） |
| useSnowMode.ts | 主題切換 hook + localStorage 持久化 |
| 嵌入式評分卡 | InlinePracticeCard + 滑動評分 + Confetti |
| 麵包屑導航 | Breadcrumb.tsx（首頁 > 技能 > 課程） |
| 智能返回 | BackButton.tsx（根據來源決定返回目標） |

---

## 新增功能

| 日期 | 功能 |
|------|------|
| 2025-11-28 | 首頁加入 logo 圖片 |
| 2025-11-28 | 支援 Supabase Storage 課程圖片 |

---

## 訂閱／權限強化（2025-11-29）

| 項目 | 說明 |
|------|------|
| Server API for Admin | 新增 `/api/admin/subscription`、`/api/admin/users`、`/api/admin/monetization`、`/api/admin/dashboard` 以 service key + is_admin 驗證執行 |
| ActivationPanel | 客戶端不再直接更新 `users`，改呼叫 server API |
| Admin 頁面 | users/monetization/dashboard 改為呼叫 server API，需 access token |
| Supabase server client | 新增 `lib/supabaseServer.ts` 以 service role key 建立 server 端客戶端 |
| event_log 防呆 | `trackEvent` 限制 metadata 大小，避免濫用寫入 |

---

## 敏感資料清理

**實作**:
- 從 GitHub 移除 SQL、課程 JSON、原始 .md 檔案
- 使用 `git filter-branch` 清除歷史
- 更新 `.gitignore` 排除 `txt/`、`scripts/`、`CASI/`、`give/`

---

## 待辦清單

### 收藏與練習紀錄功能

| # | 任務 | 狀態 |
|---|------|------|
| 1 | 修復 Supabase client，確保 session 正確傳遞 | ✅ |
| 2 | 加入 debug log 確認 auth 狀態 | ✅ |
| 3 | 簡化 favorites 邏輯（add/remove 分開） | ✅ |
| 4 | 加入錯誤處理和用戶提示 | ✅ |
| 5 | Build 測試通過 | ✅ |

### 修改內容

**supabase.ts**
- 改名 `getSupabase()` 更清晰
- 加入 console.error 當環境變數缺失

**auth.ts**
- 所有函數加入錯誤 log
- `onAuthStateChange` 加入狀態變化 log
- 新增 `getSession()` 函數

**favorites.ts**
- 移除 `toggleFavorite`，改回 `addFavorite` / `removeFavorite`
- 每個操作前檢查 session 是否有效
- 加入詳細 console.log 方便 debug
- 返回 `{ success, error }` 格式

**practice.ts**
- 操作前檢查 session
- 加入錯誤處理和 log
- 返回 `{ success, error }` 格式

**LessonDetail.tsx**
- 分離 favLoading / favError 狀態
- 分離 noteStatus / noteError 狀態
- 顯示錯誤訊息給用戶
- 按鈕 disabled 狀態更完整

**AuthProvider.tsx**
- 加入初始化和狀態變化的 log

---

## 檔案整理

### 執行摘要（2025-12-05）

**整理目標**:
1. ✅ 消除重複檔案
2. ✅ 統一文檔位置（docs/）
3. ✅ 歸檔歷史檔案
4. ✅ 更新 .gitignore

### 變更清單

#### 根目錄清理

**移除的檔案**:
- `todo.md` → 刪除（`docs/TODO.md` 更完整）

**移動到 docs/ 的檔案**:
- `PHASE2_COMPLETE.md`
- `PHASE3_COMPLETE.md`
- `QUICKSTART_USER_CORE.md`
- `USER_CORE_INTEGRATION_SUMMARY.md`
- `UX_審查報告_2025-11-28.md`
- `UX_第四輪建議_手機優先_2025-11-28.md`
- `Alpine_Velocity_實作報告_2025-11-28.md`
- `Alpine_Velocity_進階優化_2025-11-28.md`

**根目錄保留檔案（僅 6 個）**:
```
.env                    # 本地環境變數（不提交 git）
.env.example            # 環境變數範本
.gitignore              # Git 規則
README.md               # 專案主文檔
zeabur.json             # 部署配置
logo.jpeg               # Logo 圖片
```

#### docs/ 目錄整理

**歸檔到 docs/archive/rls-fixes/（22 個檔案）**:
- `FIX_RLS_*.sql` - 各種 RLS 修復嘗試
- `QUICK_FIX_RLS.sql`
- `CHECK_RLS_STATUS.sql`
- `ENABLE_RLS_LESSONS.sql`
- `LIST_POLICIES.sql`
- `LIST_ALL_POLICIES.sql`
- `RECREATE_POLICY.sql`
- `TEST_*.sql` - 測試 SQL
- `DEBUG_FUNCTION.sql`

**歸檔到 docs/archive/data/（6 個檔案）**:
- `lessons_consolidated.json` (366KB)
- `lessons_parsed.json` (395KB)
- `prerequisites_analysis.json` (21KB)
- `update_lessons.sql` (390KB)
- `update_how_consolidated.sql` (78KB)
- `update_lesson_64_images.sql` (1.3KB)

**docs/ 保留檔案（38 個）**:
- 核心文檔：SDD.md, PLAN.md, TODO.md
- Migration SQL：migration_*.sql
- 階段報告：PHASE2_COMPLETE.md, PHASE3_COMPLETE.md
- UX 報告：UX_*.md, Alpine_Velocity_*.md
- 整合文檔：USER_CORE_*.md, EVENT_MAPPING.md
- 安全性：安全性強化報告_2025-12-01.md, SMOKE_AUTH_SUBSCRIPTION.md
- 金流系統：PAYMENT_*.md, payments_integration.md
- 部署維護：PRODUCTION_DEPLOYMENT.md, LINUS_GUIDE.md
- 新增：FILE_ORGANIZATION.md, CLEANUP_2025-12-05.md

#### .gitignore 更新

新增排除規則:
```gitignore
# Archive（舊版資料）
archive/
docs/archive/          # 新增
```

確保以下不會提交:
- `.env` - 敏感資料
- `.DS_Store` - 系統檔案
- `docs/archive/` - 歷史檔案
- `data/` - 課程資料
- `sam_cleaned/` - 原始資料
- `huang_cleaned/` - 原始資料

### 統計數據

**整理前**:
- 根目錄檔案：14 個 Markdown
- docs/ 檔案：59 個
- 重複檔案：2 個（todo.md）

**整理後**:
- 根目錄檔案：6 個（僅保留必要檔案）
- docs/ 檔案：38 個（活躍文檔）
- docs/archive/ 檔案：28 個（歷史檔案）
- 重複檔案：0 個

**空間節省**:
- 歸檔大型檔案：~1.2 MB
- 移除重複檔案：1 個

### 後續維護建議

1. **新增文檔**：統一放在 `docs/` 目錄
2. **命名規範**：遵循 FILE_ORGANIZATION.md 的前綴規則
3. **定期清理**：每個 Phase 完成後整理一次
4. **歸檔原則**：
   - 已解決的問題 → `docs/archive/rls-fixes/`
   - 大型資料檔案 → `docs/archive/data/`
   - 舊版實作 → `archive/`（根目錄）
5. **README 更新**：重大變更後更新主文檔的文檔清單

---

**最後更新**: 2025-12-05
**執行者**: Kiro
