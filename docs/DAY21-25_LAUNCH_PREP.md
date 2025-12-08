# Day 21-25 準備 Day 30 上線物料檢查清單

**日期**: 2025-12-21 ~ 2025-12-25
**版本**: 調整③ 儀表板強化 (Pre-Launch Phase)
**狀態**: 📋 準備階段

---

## 🚀 上線前準備清單

### 1️⃣ 代碼層準備

#### SQL 遷移驗證
- [ ] `migration_practice_analytics.sql` 已測試（本地環境）
  - [ ] 函數 1：`get_practice_frequency_by_skill()` 返回正確結構
  - [ ] 函數 2：`get_skill_improvement_curve()` 返回正確時間序列
  - [ ] 索引 1：`idx_practice_logs_user_created` 已創建
  - [ ] 索引 2：`idx_practice_logs_lesson` 已創建
  - [ ] 驗證查詢正確執行（無 SQL 語法錯誤）

#### React 組件最終檢查
- [ ] `lib/improvement.ts`
  - [ ] 導出 `SkillFrequency` 介面
  - [ ] 導出 `ImprovementPoint` 介面
  - [ ] 導出 `getPracticeFrequencyBySkill()` 函數
  - [ ] 導出 `getSkillImprovementCurve()` 函數
  - [ ] 所有查詢有錯誤處理（try-catch）

- [ ] `components/dashboard/PracticeAnalytics.tsx`
  - [ ] 接收 `SkillFrequency[]` 數據
  - [ ] 無資料狀態友善提示
  - [ ] 動畫 smooth（0.08s 間隔）
  - [ ] 響應式設計（手機友善）
  - [ ] 可訪問性（無障礙）檢查

- [ ] `components/dashboard/SkillImprovementChart.tsx`
  - [ ] 接收 `ImprovementPoint[]` 數據
  - [ ] 柱狀圖正確映射（高度、色彩）
  - [ ] Tooltip 在所有設備上可見
  - [ ] 進度指示器邏輯正確（↗️ ↘️ →）
  - [ ] Y 軸標籤清晰（1-5 ⭐）

- [ ] `components/ImprovementDashboard.tsx`
  - [ ] 正確整合新組件
  - [ ] 自動載入練習頻率分析
  - [ ] 技能選擇器切換邏輯正確
  - [ ] 曲線圖隨技能切換動態更新

- [ ] `app/practice/page.tsx`
  - [ ] 未登入路徑：`LockedState` 正確顯示
  - [ ] 免費用戶路徑：`LockedDashboardPreview` 正確顯示
  - [ ] PRO 用戶路徑：完整儀表板正確顯示
  - [ ] 標籤切換邏輯正確（dashboard ↔ logs）
  - [ ] 練習紀錄標籤不受 PRO 限制（保留舊邏輯）

#### 編譯與構建驗證
- [ ] `npm run build` 成功（0 errors）
- [ ] 所有靜態頁面正確生成（27 pages）
- [ ] 無 TypeScript 警告（warnings = 0）
- [ ] 產物大小合理（無異常增加）

#### 代碼風格檢查
- [ ] 代碼遵循 Alpine Velocity 設計系統
  - [ ] 字體：Bebas Neue (標題) + Space Mono (數據) ✓
  - [ ] 色彩：brand-red 漸層為主 ✓
  - [ ] 動畫：Framer Motion GPU 加速 ✓
  - [ ] 間距：統一的 TailwindCSS 邊距 ✓
- [ ] 無 console.log 遺留（生產環境）
- [ ] 無難懂的變數名
- [ ] 註解清晰（中文或英文，統一）

---

### 2️⃣ 文檔準備

#### 技術文檔
- [ ] **migration_practice_analytics.sql**
  - [ ] 包含完整的 SQL 代碼
  - [ ] 包含執行前驗證步驟
  - [ ] 包含執行後驗證步驟
  - [ ] 包含回滾計畫（如需要）
  - [ ] 清晰的註解說明

- [ ] **DAY1_LAUNCH_CHECKLIST.md**（已有）
  - [ ] 檢查是否需要更新

- [ ] **DAY16-20_QA_TESTING_PLAN.md**（已有）
  - [ ] QA 測試結果已填寫
  - [ ] 已知 Bug 已記錄
  - [ ] 性能基準已建立

- [ ] **Day 30 上線檢查清單** (新建)
  - [ ] 部署步驟清單
  - [ ] 監控指標列表
  - [ ] 回滾程序文檔

#### 營銷與通信文檔
- [ ] **用戶公告草稿**
  ```
  主題：「練習中心升級！新增深度分析功能」

  尊敬的 PRO 用戶：

  我們很高興地宣佈，練習中心正式升級！

  🆕 新增功能：
  • 練習頻率分析 - 一眼看出最常練習的技能
  • 技能進步曲線圖 - 視覺化您的 30 天進步
  • 個人化統計 - 平均評分、練習次數、最後練習時間

  📊 立即體驗：進入「練習中心」→「改善儀表板」

  這些功能完全免費提供給所有 PRO 訂閱用戶！
  ```
  - [ ] 中文版本審核通過
  - [ ] 英文版本（如需要）審核通過
  - [ ] 發布時間確定（Day 30 中午）
  - [ ] 發布管道確認（Email、App 推送、社交媒體）

- [ ] **用戶教學文檔**
  - [ ] 練習頻率分析如何使用（圖文教學）
  - [ ] 進度曲線圖如何閱讀
  - [ ] 常見問題解答（FAQ）
  - [ ] 螢幕截圖準備完畢

- [ ] **內部培訓文檔**（客服）
  - [ ] 新功能概述
  - [ ] 常見用戶提問與回答
  - [ ] 故障排查指南
  - [ ] 回滾程序（緊急情況）

---

### 3️⃣ 監控與告警準備

#### 日誌與監控工具配置
- [ ] **Sentry 配置**（錯誤追蹤）
  - [ ] 為新組件添加錯誤邊界
  - [ ] 配置 RPC 查詢失敗告警
  - [ ] 配置前端 JavaScript 錯誤告警
  - [ ] 告警規則：Critical 立即通知，Warning 每小時總結

- [ ] **DataDog 或 NewRelic（如有使用）**
  - [ ] 配置 RPC 查詢性能指標
  - [ ] 設置 API 響應時間告警（> 500ms）
  - [ ] 設置 React 組件渲染時間基準
  - [ ] 配置儀表板視圖

- [ ] **Supabase 日誌監控**
  - [ ] 檢查 SQL 函數執行日誌
  - [ ] 驗證 RLS 策略不誤阻攔用戶查詢

#### 關鍵指標定義
- [ ] **性能指標**
  ```
  • RPC 查詢平均響應時間：500ms
  • 儀表板首屏加載時間：< 1s
  • 組件重渲染次數：每次技能切換 ≤ 2 次
  • 頁面動畫 FPS：≥ 50fps
  ```

- [ ] **業務指標**
  ```
  • 練習中心日活躍用戶（DAU）
  • 儀表板訪問率（Dashboard Tab 點擊 / 進入練習頁)
  • 技能曲線圖查看率（選擇技能 / 訪問儀表板)
  • 30 天留存率（Day 30 後 7 天活躍用戶)
  ```

- [ ] **錯誤指標**
  ```
  • RPC 查詢錯誤率：< 1%
  • 前端 JavaScript 錯誤率：< 0.5%
  • 組件渲染失敗率：0%
  ```

---

### 4️⃣ 備份與災難恢復

#### 數據備份
- [ ] **Supabase 自動備份已啟用**
  - [ ] 驗證備份頻率（每日/每小時）
  - [ ] 驗證備份保留期（至少 7 天）
  - [ ] 測試備份恢復流程（一次）

#### 回滾計畫
- [ ] **代碼回滾**
  ```bash
  # 快速回滾命令
  git revert <commit-hash>  # fcb0a56
  git push origin main
  # Zeabur 自動部署
  ```
  - [ ] 命令已驗證（不執行，但語法正確）
  - [ ] 回滾時間估計：< 5 分鐘（包括 Zeabur 部署）

- [ ] **SQL 回滾**
  ```sql
  -- 刪除新增的函數
  DROP FUNCTION IF EXISTS get_practice_frequency_by_skill(UUID, INT);
  DROP FUNCTION IF EXISTS get_skill_improvement_curve(UUID, TEXT, INT);

  -- 刪除新增的索引
  DROP INDEX IF EXISTS idx_practice_logs_user_created;
  DROP INDEX IF EXISTS idx_practice_logs_lesson;
  ```
  - [ ] 回滾 SQL 已準備
  - [ ] 執行時間估計：< 1 分鐘

- [ ] **應急聯繫清單**
  ```
  • 開發人員：[聯繫方式]
  • Supabase 支持：[帳號/聯繫方式]
  • 產品經理：[聯繫方式]
  • 客服負責人：[聯繫方式]
  ```

---

### 5️⃣ 安全檢查

#### 數據隱私與 RLS
- [ ] **驗證 RLS 策略**
  ```
  • practice_logs 表：用戶只能看自己的記錄
  • lessons 表：免費/PRO 課程分別應用 RLS
  ```
  - [ ] 測試：以用戶 A 身份查詢，驗證無法看到用戶 B 的數據
  - [ ] 測試：以管理員身份查詢，驗證可以看到所有數據

#### 輸入驗證
- [ ] **SQL 注入防護**
  - [ ] 所有 RPC 查詢使用參數化（不字符串拼接）
  - [ ] `get_practice_frequency_by_skill()` 和 `get_skill_improvement_curve()` 驗證無問題

#### 性能濫用防護
- [ ] **速率限制（Rate Limiting）**
  - [ ] API 端點已配置速率限制（如需要）
  - [ ] 單個用戶不能在短時間內發送大量 RPC 查詢

---

### 6️⃣ 生產環境最終檢查

#### 環境配置驗證
- [ ] **Supabase 生產環境**
  - [ ] URL 正確（https://...supabase.co）
  - [ ] Anon Key 正確（非本地密鑰）
  - [ ] RLS 已啟用（所有表）

- [ ] **Next.js 構建配置**
  - [ ] `next.config.js` 正確配置
  - [ ] 環境變數正確設置（API 密鑰、URL）
  - [ ] 沒有本地開發設置留在生產

#### 部署流程驗證
- [ ] **代碼部署流程**（提前測試）
  1. [ ] 本地編譯成功
  2. [ ] 提交 Git 代碼
  3. [ ] GitHub 自動檢查通過（CI/CD）
  4. [ ] Zeabur 自動部署
  5. [ ] 部署成功通知收到

- [ ] **數據庫遷移流程**（提前測試，不在生產執行）
  1. [ ] 備份現有數據庫
  2. [ ] 在備份副本上執行 SQL 遷移
  3. [ ] 驗證函數和索引已創建
  4. [ ] 驗證功能正常
  5. [ ] 刪除備份副本

---

### 7️⃣ 上線時間表（Day 21-25）

#### Day 21（週一）
- [ ] 完成 QA 測試報告（汇總 Day 16-20 結果）
- [ ] 整理已知 Bug 和修復清單
- [ ] 準備用戶公告草稿（待簽核）

#### Day 22-23（週二-三）
- [ ] 代碼最終審核（Code Review）
- [ ] 文檔最終審核（技術文檔、用戶文檔）
- [ ] 監控工具最終配置
- [ ] 客服培訓（內部說明）

#### Day 24-25（週四-五）
- [ ] 最終備份驗證
- [ ] 應急聯繫清單驗證
- [ ] 上線檢查清單最終審核
- [ ] **簽核批准**（產品經理、技術負責人）

---

## 📊 簽核與批准

| 角色 | 簽核人 | 日期 | 狀態 |
|------|--------|------|------|
| 開發 | Claude Code | 2025-12-08 | ✅ |
| QA | [待定] | [待定] | ⏳ |
| 產品經理 | [待定] | [待定] | ⏳ |
| 技術負責人 | [待定] | [待定] | ⏳ |
| 上線負責人 | [待定] | [待定] | ⏳ |

---

## 🎯 Day 30 上線流程（預覽）

**Day 30 上線順序**：
1. **10:00 UTC+8** - 最終檢查（監控準備好）
2. **10:30 UTC+8** - Supabase 執行 SQL 遷移
3. **10:40 UTC+8** - 驗證 SQL 執行成功
4. **11:00 UTC+8** - GitHub 推送新代碼（如有遺漏）
5. **11:10 UTC+8** - Zeabur 自動部署
6. **11:30 UTC+8** - 部署驗證（測試用戶路徑）
7. **12:00 UTC+8** - 發送用戶公告
8. **12:30 UTC+8** - 監控儀表板監看

**預計完全上線時間**：12:30 UTC+8（30 分鐘總耗時）

---

## 🔗 相關文檔

- [DAY1_LAUNCH_CHECKLIST.md](./DAY1_LAUNCH_CHECKLIST.md) - 調整① 上線檢查清單
- [DAY16-20_QA_TESTING_PLAN.md](./DAY16-20_QA_TESTING_PLAN.md) - QA 測試計畫

---

**文檔生成日期**：2025-12-08
**計畫版本**：v1.0
**預計完成**：Day 25 (2025-12-25)
