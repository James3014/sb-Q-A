# 📁 檔案組織說明

最後更新：2025-12-05

## 目錄結構

```
單板教學/
├── README.md                    # 專案主文檔
├── .gitignore                   # Git 忽略規則
├── .env.example                 # 環境變數範本
├── zeabur.json                  # Zeabur 部署配置
│
├── web/                         # Next.js 應用程式
├── docs/                        # 📚 所有文檔統一放這裡
│   ├── archive/                 # 歷史檔案（不提交 git）
│   │   ├── rls-fixes/          # 舊的 RLS 修復 SQL
│   │   └── data/               # 大型資料檔案
│   │
│   ├── SDD.md                  # 軟體設計文件
│   ├── TODO.md                 # 待辦清單（主要）
│   ├── PLAN.md                 # 開發計畫
│   │
│   ├── schema.sql              # 資料庫 Schema
│   ├── migration_*.sql         # Migration 檔案
│   │
│   ├── PHASE2_COMPLETE.md      # Phase 2 完成報告
│   ├── PHASE3_COMPLETE.md      # Phase 3 完成報告
│   │
│   ├── UX_審查報告_2025-11-28.md
│   ├── UX_第四輪建議_手機優先_2025-11-28.md
│   ├── Alpine_Velocity_實作報告_2025-11-28.md
│   ├── Alpine_Velocity_進階優化_2025-11-28.md
│   │
│   ├── USER_CORE_INTEGRATION.md
│   ├── QUICKSTART_USER_CORE.md
│   ├── USER_CORE_INTEGRATION_SUMMARY.md
│   │
│   ├── 安全性強化報告_2025-12-01.md
│   ├── SMOKE_AUTH_SUBSCRIPTION.md
│   │
│   ├── payments_integration.md
│   ├── migration_payments.sql
│   ├── test-plan-payments.md
│   ├── PAYMENT_TESTING_GUIDE.md
│   ├── PAYMENT_ISSUES_SUMMARY.md
│   ├── PAYMENT_SYSTEM_TEST_REPORT.md
│   │
│   ├── PRODUCTION_DEPLOYMENT.md
│   ├── MIGRATION_COMPLETED.md
│   ├── LINUS_GUIDE.md
│   ├── REFACTOR_LOG.md
│   ├── REFACTOR_TODO.md
│   │
│   ├── AI_ILLUSTRATION_GUIDE.md
│   ├── EVENT_MAPPING.md
│   ├── path_engine_spec.md
│   ├── scroll-restoration.md
│   ├── ui_mockup.md
│   │
│   ├── TRACEABILITY_SOLUTION.md
│   └── FILE_AUDIT_REPORT.md
│
├── scripts/                     # 工具腳本
├── data/                        # 課程資料（不提交 git）
├── sam_cleaned/                 # 原始資料（不提交 git）
├── huang_cleaned/               # 原始資料（不提交 git）
├── archive/                     # 舊版檔案（不提交 git）
└── tests/                       # 測試檔案
```

## 檔案分類

### 📖 核心文檔（docs/）

#### 設計與規劃
- `SDD.md` - 軟體設計文件
- `PLAN.md` - 開發計畫
- `TODO.md` - 待辦清單（主要版本）
- `ui_mockup.md` - UI 設計稿

#### 資料庫
- `schema.sql` - 基礎 Schema
- `migration_subscription.sql` - 訂閱欄位
- `migration_event_log.sql` - 事件追蹤
- `migration_admin.sql` - 後台函數
- `migration_subscription_security.sql` - RLS 政策
- `migration_event_log_guardrails.sql` - Rate Limit
- `migration_subscription_plans.sql` - 方案版本化
- `migration_prerequisites.sql` - 前置條件
- `migration_payments.sql` - 金流系統

#### 開發階段報告
- `PHASE2_COMPLETE.md` - Phase 2：事件同步
- `PHASE3_COMPLETE.md` - Phase 3：完整整合
- `MIGRATION_COMPLETED.md` - Migration 完成報告

#### UX/UI 設計
- `UX_審查報告_2025-11-28.md` - UX 審查
- `UX_第四輪建議_手機優先_2025-11-28.md` - 手機優先改善
- `Alpine_Velocity_實作報告_2025-11-28.md` - 美學系統實作
- `Alpine_Velocity_進階優化_2025-11-28.md` - 視覺深度優化

#### 整合文檔
- `USER_CORE_INTEGRATION.md` - user-core 整合文檔
- `QUICKSTART_USER_CORE.md` - 快速開始指南
- `USER_CORE_INTEGRATION_SUMMARY.md` - 整合完成報告
- `EVENT_MAPPING.md` - 事件映射

#### 安全性
- `安全性強化報告_2025-12-01.md` - 安全性強化總結
- `SMOKE_AUTH_SUBSCRIPTION.md` - 權限驗證測試

#### 金流系統
- `payments_integration.md` - 金流整合文檔
- `test-plan-payments.md` - 測試計畫
- `PAYMENT_TESTING_GUIDE.md` - 測試指南
- `PAYMENT_ISSUES_SUMMARY.md` - 問題總結
- `PAYMENT_SYSTEM_TEST_REPORT.md` - 測試報告

#### 部署與維護
- `PRODUCTION_DEPLOYMENT.md` - 生產環境部署
- `LINUS_GUIDE.md` - Linus 原則指南
- `REFACTOR_LOG.md` - 重構日誌
- `REFACTOR_TODO.md` - 重構待辦

#### 功能規格
- `AI_ILLUSTRATION_GUIDE.md` - AI 示意圖指南
- `path_engine_spec.md` - 路徑引擎規格
- `scroll-restoration.md` - 滾動恢復

#### 審計與追蹤
- `TRACEABILITY_SOLUTION.md` - 可追溯性方案
- `FILE_AUDIT_REPORT.md` - 檔案審計報告
- `FILE_ORGANIZATION.md` - 本文件

### 🗄️ 歷史檔案（docs/archive/）

不提交到 git，僅本地保留：

#### RLS 修復歷史（rls-fixes/）
- `FIX_RLS_*.sql` - 各種 RLS 修復嘗試
- `QUICK_FIX_RLS.sql`
- `CHECK_RLS_STATUS.sql`
- `ENABLE_RLS_LESSONS.sql`
- `TEST_*.sql` - 測試 SQL
- `DEBUG_FUNCTION.sql`

#### 大型資料檔案（data/）
- `lessons_consolidated.json` - 課程資料（整合版）
- `lessons_parsed.json` - 課程資料（解析版）
- `prerequisites_analysis.json` - 前置條件分析
- `update_lessons.sql` - 課程更新 SQL（390KB）
- `update_how_consolidated.sql` - How 欄位更新（78KB）
- `update_lesson_64_images.sql` - 圖片更新

## 整理原則

### ✅ 保留在根目錄
- `README.md` - 專案主文檔
- `.gitignore` - Git 規則
- `.env.example` - 環境變數範本
- `zeabur.json` - 部署配置

### 📚 移到 docs/
- 所有 Markdown 文檔
- 所有 SQL Migration
- 所有設計/規劃/報告文件

### 🗄️ 移到 docs/archive/
- 舊的 RLS 修復 SQL（已解決的問題）
- 大型資料檔案（JSON/SQL）
- 歷史測試檔案

### 🚫 不提交 git
- `.env` - 敏感資料
- `.DS_Store` - macOS 系統檔案
- `docs/archive/` - 歷史檔案
- `data/` - 課程資料
- `sam_cleaned/` - 原始資料
- `huang_cleaned/` - 原始資料
- `archive/` - 舊版檔案

## 檔案命名規範

### 文檔類型前綴
- 無前綴：核心文檔（README, SDD, PLAN, TODO）
- `PHASE*_` - 階段完成報告
- `UX_` - UX/UI 相關
- `Alpine_Velocity_` - 美學系統
- `USER_CORE_` - user-core 整合
- `PAYMENT_` - 金流系統
- `migration_` - 資料庫 Migration
- `FIX_` - 修復檔案（已歸檔）
- `TEST_` - 測試檔案（已歸檔）

### 日期格式
- 使用 `YYYY-MM-DD` 格式
- 範例：`UX_審查報告_2025-11-28.md`

## 維護建議

1. **新增文檔**：統一放在 `docs/` 目錄
2. **完成的修復**：移到 `docs/archive/rls-fixes/`
3. **大型資料**：移到 `docs/archive/data/`
4. **定期清理**：每個 Phase 完成後整理一次
5. **README 更新**：重大變更後更新主文檔

---

*本次整理日期：2025-12-05*
*整理項目：*
- ✅ 移除根目錄重複的 `todo.md`（保留 `docs/TODO.md`）
- ✅ 移動 Phase 報告到 docs/
- ✅ 移動 UX/Alpine Velocity 報告到 docs/
- ✅ 移動 user-core 整合文件到 docs/
- ✅ 歸檔舊的 RLS 修復 SQL
- ✅ 歸檔大型資料檔案
- ✅ 更新 .gitignore 排除 archive
