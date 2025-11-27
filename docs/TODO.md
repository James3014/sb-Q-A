# TODO

## 重構清單（Clean Code + Linus 原則）

- [x] 1. 統一後台頁面使用 AdminLayout（消除重複驗證邏輯）
- [x] 2. 移除 admin/page.tsx 重複的 loading/權限檢查
- [x] 3. 後台密碼統一用環境變數
- [x] 4. 刪除空的 web/src/data 資料夾
- [x] 5. admin/page.tsx 拆分子組件（StatCard、TopLessons、TopKeywords、RecentFeedback）
- [x] 6. 拆分 ImprovementDashboard 組件（practice/page.tsx 369→100 行）
- [x] 7. SKILL_RECOMMENDATIONS 移到 constants.ts
- [x] 8. 拆分 LessonHeatmap 組件（admin/lessons/page.tsx 325→150 行）
- [x] 9. 建立 formatDate() 共用函數
- [x] 10. 訂閱方案常數 SUBSCRIPTION_PLANS 移到 constants.ts
- [x] 11. getSubscriptionStatus() 移到 lib/subscription.ts
- [x] 12. FunnelBar / ProgressBar / StatCard 移到 ui.tsx
- [x] 13. admin/users 拆分 ActivationPanel 組件
- [x] 14. FEEDBACK_TYPES 移到 constants.ts
- [x] 15. 驗證 build ✅

## 第五輪重構（2025-11-27）

- [x] 16. admin/page.tsx 移除重複 StatCard，使用 ui.tsx
- [x] 17. FEEDBACK_TYPE_LABELS 移到 constants.ts
- [x] 18. 首頁 slopeFilter 使用 SLOPE_NAMES
- [x] 19. admin/page.tsx RecentFeedback 使用 formatDate
- [x] 20. admin/feedback 使用 formatDate + FEEDBACK_TYPE_LABELS
- [x] 21. 驗證 build ✅

---

## 課程詳情頁增強版（2025-11-27）

### Schema 變更
- [x] 22. practice_logs 新增 rating1/rating2/rating3 欄位（migration_rating_v2.sql）

### 組件拆分
- [x] 23. LessonHeader（返回、收藏、分享）
- [x] 24. LessonWhat（問題區塊重新排版）
- [x] 25. LessonWhy（目標區塊重新排版）
- [x] 26. LessonSteps（How 步驟卡片化 + 圖片槽位）
- [x] 27. LessonSignals（做對/做錯訊號）
- [x] 28. LessonPracticeCTA（練習按鈕 + 三項評分彈窗）
- [x] 29. LessonPracticeHistory（課程級別練習紀錄）
- [x] 30. LessonRecommendations（弱項推薦課程）
- [x] 31. LessonUnlockPRO（柔性付費引導）

### 整合
- [x] 32. 重寫 LessonDetail.tsx 使用新組件
- [x] 33. 更新 practice.ts API 支援三項評分
- [x] 34. 驗證 build ✅

---

## 課程詳情頁增強 Phase 2（2025-11-27）

### Phase 1：完成後正向回饋
- [x] 35. 練習完成動畫（✓ 打勾動畫）
- [x] 36. 顯示「+1 次練習」+ 累計次數
- [x] 37. 顯示最近改善度變化

### Phase 2：次序式練習建議
- [x] 38. getRelatedLessons 函數（基於技能和程度）
- [x] 39. LessonSequence 組件（先看 → 下一步 → 相似）
- [x] 40. 顯示在課程底部

### Phase 3：AI 示意圖規劃
- [ ] 41. 從 heatmap 選出 TOP 10 熱門課程
- [ ] 42. 建立 Prompt 標準化模板（簡筆畫風格）
- [ ] 43. 定義圖片風格指南

---

## Schema v3 + Learning Path Engine（2025-11-27）

### Phase 1：Schema v3 Migration
- [x] 46. 建立 skills 表 + 初始資料（5 個 CASI 技能）
- [x] 47. 建立 competencies 表 + 初始資料
- [x] 48. 擴充 lessons 表（新增欄位）
- [x] 49. 建立 lesson_skills 多對多表
- [x] 50. 建立 lesson_prerequisites 表
- [x] 51. 建立 tags + lesson_tags 表
- [x] 52. 資料遷移腳本（casi → casi_raw + primary_skill_code）

### Phase 2：TypeScript Types
- [x] 53. 建立 types/lesson.ts
- [x] 54. 建立 types/rider.ts
- [x] 55. 建立 types/path.ts
- [x] 56. 更新現有 API 使用新型別（待整合）

### Phase 3：Learning Path Engine v1
- [x] 57. filterCandidates() - 候選課程過濾
- [x] 58. scoreLessons() - 多維度評分
- [x] 59. schedulePath() - 排程邏輯
- [x] 60. buildSummary() - 產生人類可讀說明
- [ ] 61. Supabase Edge Function: recommend-path

### Phase 4：症狀 → 課程映射
- [x] 62. 定義 Symptom codes
- [x] 63. AI 分析產生 symptom → lesson mapping（284 個）
- [x] 64. AI 分析產生 lesson prerequisites（9 個）
- [x] 65. 建立 goal → skill/tag mapping

### 其他調整
- [x] 44. 步驟卡片圖片槽位預設不展開
- [x] 45. 驗證 build ✅

---

## ✅ 已完成

### Clean Code 第五輪 (2025-11-27)
- [x] admin/page.tsx 移除重複 StatCard
- [x] FEEDBACK_TYPE_LABELS 常數化
- [x] 首頁 slopeFilter 使用 SLOPE_NAMES
- [x] 所有日期顯示統一使用 formatDate

### Clean Code 第四輪 (2025-11-27)
- [x] formatDate() 共用日期格式化函數
- [x] SUBSCRIPTION_PLANS 訂閱方案常數
- [x] FEEDBACK_TYPES 回報類型常數
- [x] getSubscriptionStatus() 訂閱狀態函數
- [x] calculateExpiryDate() 到期日計算
- [x] ProgressBar / FunnelBar / StatCard 共用組件
- [x] ActivationPanel 開通面板組件
- [x] admin/users 205→95 行
- [x] admin/monetization 移除內嵌 FunnelBar

### Clean Code 第三輪 (2025-11-27)
- [x] ImprovementDashboard 拆成獨立組件
- [x] LessonHeatmap 拆成獨立組件
- [x] SKILL_RECOMMENDATIONS 移到 constants.ts
- [x] practice/page.tsx 369→100 行
- [x] admin/lessons/page.tsx 325→150 行

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
