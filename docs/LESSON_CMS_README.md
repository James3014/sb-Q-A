# 課程內容管理系統 (Lesson CMS) 文件導覽

## 📚 完整文件集合

本文件夾包含課程內容管理系統的完整實作文件，按照 **TDD 方法論 + Clean Code + Linus 原則** 組織。

---

## 🎯 核心文件 (Lesson CMS 相關)

### 1. **LESSON_CMS_PLAN.md** - 高階實作計畫
   - **用途**: 整體架構與技術決策
   - **適讀人**: PM、架構師、團隊領導
   - **主要內容**:
     - 為什麼選擇自建而非 Payload CMS
     - 資料庫 Schema 設計 (SQL migration)
     - 3 個 Phase 的高層規劃
     - AI 整合預留設計
   - **檔案大小**: 13KB
   - **快速連結**:
     - [§ 資料庫 Schema](#-資料庫-schema-變更) - 建立索引
     - [§ API 路由設計](#-api-路由設計) - 端點列表
     - [§ Phase 1-3 概覽](#-實作優先順序-3-phases) - 分階段規劃

### 2. **LESSON_CMS_ARCHITECTURE.md** - 詳細架構設計
   - **用途**: 模組化設計、層次分離、設計原則應用
   - **適讀人**: 技術主管、資深開發者、架構審查
   - **主要內容**:
     - 6 層模組分解圖 (Data Access → Service → Hooks → Component → API → Types)
     - 各層的職責、介面、設計原則
     - 資料流圖 (建立課程、上傳圖片)
     - 錯誤處理策略 (自訂例外類型)
     - Clean Code 原則應用 (命名、函數設計、註解)
     - Linus 原則應用 (簡潔設計、向下相容、實用主義)
     - 部署檢查清單
   - **檔案大小**: 16KB
   - **快速連結**:
     - [§ 1. 模組分解](#-1-模組分解-modular-architecture) - 整體架構圖
     - [§ 2. 詳細模組設計](#-2-詳細模組設計) - 每層的設計
     - [§ 6. Clean Code 原則](#-6-clean-code-原則應用) - 程式碼品質指南

### 3. **LESSON_CMS_TEST_SPECS.md** - TDD 測試規範
   - **用途**: 測試驅動開發 (TDD) 的具體測試案例
   - **適讀人**: QA、測試工程師、開發者 (寫測試)
   - **主要內容**:
     - 測試金字塔結構 (80% Unit + 15% Integration + 5% E2E)
     - Phase 1 詳細單元測試代碼:
       - `validationService.test.ts` - 驗證邏輯測試 (6 test suites)
       - `imageService.test.ts` - 圖片服務測試 (4 test suites)
       - `lessonService.test.ts` - 課程服務測試 (4 test suites)
       - `useLessonForm.test.ts` - React Hooks 測試 (6 methods)
     - Phase 2 整合測試案例 (API 路由測試)
     - Phase 3 E2E 測試 (Playwright)
     - 覆蓋率目標 & 執行序列
   - **檔案大小**: 18KB
   - **快速連結**:
     - [§ 測試金字塔](#-測試金字塔) - 比例與結構
     - [§ Phase 1 詳細單元測試](#-phase-1-詳細單元測試) - 具體測試代碼

### 4. **LESSON_CMS_IMPLEMENTATION_TODO.md** - 分粒度待做清單 ⭐ 重點
   - **用途**: 日常實作的行動清單 (所有任務都很細)
   - **適讀人**: 開發者 (按清單逐一實作)
   - **主要內容**:
     - **Phase 1: 基礎 CRUD + 單元測試** (3-5 天)
       - 1.1 型別定義 & 常數 (Task 1.1.1 - 1.1.2)
       - 1.2 資料存取層 (Task 1.2.1 - 1.2.10)
       - 1.3 狀態管理層 (Task 1.3.1 - 1.3.6)
       - 1.4 API 路由層 (Task 1.4.1 - 1.4.8)
       - 1.5 UI 層 (Task 1.5.1 - 1.5.6)
       - 1.6 資料庫遷移 (Task 1.6.1 - 1.6.2)
       - 1.7 整合檢查 (Task 1.7.1 - 1.7.3)
     - Phase 2-3 概要 (詳細規劃見 PLAN.md)
     - TDD 循環指引 (紅-綠-重構)
     - 驗收標準檢查清單
     - 進度追蹤表
     - 常見問題 & 答案
   - **檔案大小**: 26KB
   - **快速連結**:
     - [§ Phase 1 詳細任務](#-phase-1-基礎-crud--單元測試-3-5-天) - 逐個 Task
     - [§ TDD 循環](#-tdd-循環-紅-綠-重構) - 如何執行
     - [§ 驗收標準](#-驗收標準) - 何時視為完成

---

## 📖 使用指南

### 角色導引

**我是 PM / 技術主管**
→ 閱讀順序: LESSON_CMS_PLAN.md → LESSON_CMS_ARCHITECTURE.md

**我是開發者，要開始實作**
→ 閱讀順序:
1. LESSON_CMS_ARCHITECTURE.md (30 分鐘) - 理解架構
2. LESSON_CMS_IMPLEMENTATION_TODO.md (1 小時) - 規劃工作
3. LESSON_CMS_TEST_SPECS.md (1 小時) - 理解測試
4. 開始實作 Task 1.1.1

**我是 QA / 測試工程師**
→ 閱讀順序:
1. LESSON_CMS_TEST_SPECS.md (必讀)
2. LESSON_CMS_ARCHITECTURE.md (了解模組)
3. LESSON_CMS_IMPLEMENTATION_TODO.md (驗收標準)

**我要做代碼審查**
→ 閱讀順序:
1. LESSON_CMS_ARCHITECTURE.md (§ 6 Clean Code)
2. LESSON_CMS_ARCHITECTURE.md (§ 7 Linus 原則)
3. LESSON_CMS_IMPLEMENTATION_TODO.md (§ Clean Code 檢查清單)

---

## 🚀 快速開始 (3 步)

### Step 1: 理解架構 (30 分)
```bash
# 開啟並閱讀
cat docs/LESSON_CMS_ARCHITECTURE.md

# 重點: 掌握 6 層模組設計
```

### Step 2: 規劃工作 (1 小時)
```bash
# 開啟待做清單
cat docs/LESSON_CMS_IMPLEMENTATION_TODO.md

# 複製進度表到你的管理工具 (Trello, Jira, Notion)
```

### Step 3: 開始實作
```bash
# Phase 1 Task 1.1.1 - 建立型別定義
# 參考: LESSON_CMS_IMPLEMENTATION_TODO.md § 1.1

# 建立目錄結構
mkdir -p web/src/lib/lessons/{repositories,services}
mkdir -p web/src/hooks/lessons
mkdir -p web/src/components/admin/lessons
mkdir -p web/src/__tests__/{unit,integration}

# 開始編寫測試 (TDD - 先測試!)
# 詳見: LESSON_CMS_TEST_SPECS.md § Phase 1
```

---

## 📊 文件關係圖

```
LESSON_CMS_PLAN.md (策略層)
    ↓
    ├─→ 技術決策: 自建 vs Payload CMS
    ├─→ 資料庫設計: Schema 變更
    └─→ 3 Phase 高層規劃

    ↓

LESSON_CMS_ARCHITECTURE.md (設計層)
    ↓
    ├─→ 6 層模組設計
    ├─→ 介面定義
    ├─→ 資料流圖
    └─→ Clean Code + Linus 原則

    ↓

LESSON_CMS_TEST_SPECS.md (測試層)
    ↓
    ├─→ 測試金字塔
    ├─→ Unit Tests (Phase 1)
    ├─→ Integration Tests (Phase 2)
    └─→ E2E Tests (Phase 3)

    ↓

LESSON_CMS_IMPLEMENTATION_TODO.md (執行層) ⭐ 日常工作用
    ↓
    ├─→ 細粒度 Tasks (30+ 個)
    ├─→ TDD 循環指引
    ├─→ 驗收標準
    └─→ 進度追蹤表
```

---

## ✅ 文件檢查清單

確認所有文件都已準備好:

- [x] LESSON_CMS_PLAN.md - ✅ 高階計畫
- [x] LESSON_CMS_ARCHITECTURE.md - ✅ 架構設計
- [x] LESSON_CMS_TEST_SPECS.md - ✅ TDD 測試規範
- [x] LESSON_CMS_IMPLEMENTATION_TODO.md - ✅ 待做清單
- [x] LESSON_CMS_README.md - ✅ 本文件 (導覽)

---

## 📐 核心設計原則速覽

### TDD (測試驅動開發)
```
🔴 紅   → 編寫測試，失敗
🟢 綠   → 編寫最小實現，通過
🟡 重構 → 改善程式碼品質
```

### Clean Code (乾淨代碼)
- ✅ 命名清晰 (不用 `h()`, `process()`)
- ✅ 單一職責 (SRP)
- ✅ 函數要小 (< 20 行)
- ✅ 無魔法值 (使用常數)
- ✅ 錯誤明確化 (自訂例外)
- ✅ 無註解 (程式碼自己說話)

### Linus 原則
- ✅ 簡潔設計 (避免特殊情況)
- ✅ 向下相容 (新欄位用 DEFAULT)
- ✅ 實用主義 (解決實際問題)
- ✅ 資料結構優先 (好型別勝過複雜邏輯)

### 模組化與解耦
- ✅ 6 層分離 (Data Access → Service → Hooks → Component → API → Types)
- ✅ 介面清晰 (Props / Callbacks / API)
- ✅ 零耦合 (各層獨立開發/測試)
- ✅ 關注點分離 (UI / Logic / Data)

---

## 🎓 進階閱讀

想深入了解某個特定主題?

### 想要理解資料存取層 (Repository Pattern)
→ LESSON_CMS_ARCHITECTURE.md § 2.1

### 想要理解業務邏輯層 (Service Pattern)
→ LESSON_CMS_ARCHITECTURE.md § 2.2

### 想要理解狀態管理層 (Custom Hooks)
→ LESSON_CMS_ARCHITECTURE.md § 2.3

### 想要理解 UI 層 (Smart vs Presentational)
→ LESSON_CMS_ARCHITECTURE.md § 2.4

### 想要學習如何編寫測試
→ LESSON_CMS_TEST_SPECS.md § Phase 1

### 想要學習如何應用 Clean Code
→ LESSON_CMS_ARCHITECTURE.md § 6

### 想要學習如何應用 Linus 原則
→ LESSON_CMS_ARCHITECTURE.md § 7

---

## 🔗 相關文件 (其他主題)

本專案的其他重要文件:

- **LINUS_GUIDE.md** - Linus Torvalds 設計哲學指南
- **TODO.md** - 整個專案的總體待做清單
- **TESTING_GUIDE.md** - 測試框架與工具配置
- **REFACTORING.md** - Clean Code 重構指南
- **DEPLOYMENT_CHECKLIST.md** - 佈署檢查清單

---

## 📝 版本與更新

- **文件版本**: 1.0
- **建立日期**: 2025-12-14
- **遵循**: TDD + Clean Code + Linus 原則
- **由**: Claude Code 生成

---

## 💡 常見問題

**Q: 為什麼要遵循 TDD?**
A: TDD 確保代碼品質、可維護性、覆蓋率。後期修復 bug 成本高 10 倍。

**Q: 為什麼要分 6 層?**
A: 模組分離讓各層獨立開發、測試、維護。減少耦合，提高復用性。

**Q: 能跳過 Phase 1 直接做 Phase 2 嗎?**
A: 不建議。Phase 1 是基礎，所有 Phase 2-3 的功能都依賴它。

**Q: 測試覆蓋率一定要 > 80% 嗎?**
A: 是的。低覆蓋率導致隱藏 bug，後期修復成本指數增長。

**Q: 完成 Phase 1 要多久?**
A: 3-5 天 (取決於團隊經驗)。按照 TODO.md 細粒度任務執行。

---

## 🤝 聯繫與反饋

如有任何疑問或改進建議，請參考:
- 架構設計 → LESSON_CMS_ARCHITECTURE.md
- 實作指南 → LESSON_CMS_IMPLEMENTATION_TODO.md
- 測試規範 → LESSON_CMS_TEST_SPECS.md

---

**開始實作吧! 🚀**

建議第一步: 閱讀 LESSON_CMS_ARCHITECTURE.md 的第 1 章 (30 分鐘)
