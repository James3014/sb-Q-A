# 重構紀錄

## 第一輪：常數抽離
- 建立 `lib/constants.ts`
- 統一管理 LEVEL_TAGS、SLOPE_TAGS、SKILL_TAGS
- 統一 emoji 圖示對應

## 第二輪：共用組件
- 建立 `components/ui.tsx`
- 抽離 Button、LoadingState、LoadingText、PageHeader
- 抽離 LockedState、EmptyState、ProgressBar、FunnelBar、StatCard

## 第三輪：Hook 抽離
- 建立 `lib/useFilteredLessons.ts`
- 將首頁篩選邏輯從 page.tsx 抽離
- 包含搜尋、程度、雪道、技能篩選

## 第四輪：課程詳情拆分
- 建立 `components/lesson/` 目錄
- LessonHeader.tsx - 標題、標籤、收藏按鈕
- LessonContent.tsx - What/Why/How/Signals 區塊
- LessonPractice.tsx - 練習紀錄表單
- LessonRecommend.tsx - 相關推薦

## 第五輪：後台統一
- 建立 `components/AdminLayout.tsx`
- 統一後台頁面驗證邏輯
- 建立 `lib/useAdminAuth.ts` Hook

## 第六輪：Dashboard 拆分
- 建立 `components/dashboard/` 目錄
- StatsCards.tsx - DAU/WAU 統計卡片
- TopLessons.tsx - 熱門課程列表
- TopSearches.tsx - 熱門搜尋
- RecentFeedback.tsx - 最新回報

## 第七輪：Types 與 UI 整理
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

## UX 優化第一輪
| 項目 | 說明 |
|------|------|
| 字級優化 | 正文 14px → 18px，行高 1.8 |
| 錯誤頁改善 | 返回按鈕、emoji、說明文字、spinner |
| 震動回饋 | `vibrate()` 函數，Android 觸覺回饋 |
| Skeleton 載入 | `SkeletonLesson.tsx` 骨架屏 |
| 底部操作欄 | `BottomActionBar.tsx`（60px 高） |
| 觸控目標 | 所有按鈕 ≥44px |
| 搜尋框放大 | 高度 40px → 56px，字級 18px |

## UX 優化第二輪
| 項目 | 說明 |
|------|------|
| 對比度提升 | blue-600 → blue-700，green-600 → green-700 |
| 卡片邊框 | 加 `border border-zinc-700` |
| 弱網重試 | `lib/retry.ts` - fetchWithRetry |
| 省電模式 | `prefers-reduced-motion` 支援 |
| 圖片優化 | Next/Image lazy loading |
| 頂部圖示 | 44x44px 觸控區域 + hover 背景 |

---

## 新增功能
| 日期 | 功能 |
|------|------|
| 2025-11-28 | 首頁加入 logo 圖片 |
| 2025-11-28 | 支援 Supabase Storage 課程圖片 |

## UX 優化第三輪（2025-11-28）
| 項目 | 說明 |
|------|------|
| Snow Mode | 高對比主題（黃黑/橙黑，對比度 12.3:1） |
| useSnowMode.ts | 主題切換 hook + localStorage 持久化 |
| 嵌入式評分卡 | InlinePracticeCard + 滑動評分 + Confetti |
| 麵包屑導航 | Breadcrumb.tsx（首頁 > 技能 > 課程） |
| 智能返回 | BackButton.tsx（根據來源決定返回目標） |

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
- 從 GitHub 移除 SQL、課程 JSON、原始 .md 檔案
- 使用 `git filter-branch` 清除歷史
- 更新 `.gitignore` 排除 `txt/`、`scripts/`、`CASI/`、`give/`

---

*最後更新：2025-11-28*
