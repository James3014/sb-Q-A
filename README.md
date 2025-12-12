# 🏂 單板教學 App

滑雪板教學內容管理系統，基於 CASI 認證教學框架。專為雪場使用設計，手機優先的 UI。

## 🎯 使用情境

- 🚡 纜車上快速查找問題解法
- 🧤 戴手套操作（大按鈕 ≥44px、大觸控區）
- ☀️ 強光下閱讀（高對比深色主題）
- ⏱️ 找到問題 → 看解法 → 馬上練
- 📶 弱網環境（自動重試機制）

---

## 🌐 Web 版本 (Next.js)

### 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | Next.js 15 + React 19 + TypeScript |
| 樣式 | Tailwind CSS（深色主題） |
| 後端 | Supabase (PostgreSQL + Auth + RLS) |
| 部署 | Zeabur |
| 動畫 | Framer Motion |

### UX 特色（雪場優化）

| 特色 | 說明 |
|------|------|
| 觸控目標 ≥44px | 所有按鈕符合 WCAG 標準 |
| 底部固定操作欄 | 完成練習按鈕不會漏掉 |
| Skeleton 載入 | 骨架屏取代「載入中」文字 |
| 震動回饋 | Android 點擊按鈕有觸覺回饋 |
| 高對比度 | 主按鈕 blue-700/green-700 |
| 省電模式 | 支援 prefers-reduced-motion |
| 弱網重試 | fetchWithRetry 自動重試 |
| 錯誤邊界 | ErrorBoundary 防止白屏 |

### 🎨 Alpine Velocity 美學系統

**設計理念**：速度感 + 滑雪場視覺 + 手機優先

| 元素 | 特色 |
|------|------|
| 字體系統 | Bebas Neue（Display）+ Space Mono（Body） |
| 卡片設計 | 斜切角邊緣、速度光暈、3 層光影效果 |
| 動畫效果 | 滾動斜向滑入、3 秒脈動光暈、點擊速度光暈 |
| Snow Mode | 頂部環境光暈、文字陰影強化 |
| 快速入口 | 優先按鈕視覺差異化、觸覺回饋 |
| 評分 | 9.6/10（Frontend Design Skill） |

### 功能架構

```
前台功能
├── 首頁 - 課程列表、搜尋、分類篩選
├── 課程詳情 - 問題/目標/練習方法/做對做錯訊號
├── 收藏 - 個人收藏清單（需登入）
├── 練習紀錄 - 紀錄每次練習心得（需登入）
├── 付費方案 - 7天/30天/年費訂閱
└── 意見回報 - Bug/課程許願/功能許願

後台功能 (/admin)
├── Dashboard - DAU/WAU、熱門課程、熱門搜尋、快速洞察
├── 用戶管理 - 搜尋用戶、手動開通訂閱
├── 回報管理 - 查看/篩選用戶回報
├── 課程分析 - 熱門/有效度/健康度/熱力圖
├── 付費分析 - 轉換率、方案分布、漏斗
├── 🤝 合作方管理 - 聯盟行銷合作方管理
└── 💰 分潤管理 - 分潤記錄與結算管理
```

### 🤝 聯盟行銷系統

完整的合作方推廣與分潤管理系統，支援教練推廣課程並獲得分潤。

#### 系統特色

| 功能 | 說明 |
|------|------|
| 合作方管理 | 建立合作方帳號、專屬折扣碼、分潤率設定 |
| 用戶追蹤 | 展開式用戶列表，查看每個合作方帶來的用戶 |
| 分潤計算 | 自動計算分潤金額，支援不同分潤率 |
| 季結管理 | 按季度結算分潤，支援批次支付 |
| 合作方儀表板 | 合作方專用後台，查看推廣成效 |

#### 合作方管理 (/admin/affiliates)

| 功能 | 說明 |
|------|------|
| 📊 統計概覽 | 總合作方數、啟用數、總試用數、總分潤 |
| ➕ 新增合作方 | 建立合作方帳號、設定折扣碼和分潤率 |
| 👥 展開用戶列表 | 點擊 ▶ 查看該合作方帶來的所有用戶 |
| 📈 即時統計 | 試用數、轉換數、轉換率、總分潤 |
| 🔄 狀態管理 | 啟用/停用合作方帳號 |

#### 分潤管理 (/admin/commissions)

| 功能 | 說明 |
|------|------|
| 📊 分潤統計 | 總記錄、待結算、已結算、已支付金額 |
| 🔍 智能篩選 | 按季度、狀態、合作方下拉篩選 |
| 📋 記錄列表 | 詳細分潤記錄，包含用戶、金額、狀態 |
| 💳 批次支付 | 選擇多筆記錄批次標記為已支付 |
| 📅 季結管理 | 按季度自動計算和結算分潤 |

#### 合作方儀表板 (/affiliate/dashboard)

| 功能 | 說明 |
|------|------|
| 📈 推廣統計 | 試用數、轉換數、轉換率、分潤金額 |
| 📊 時間序列 | 30天推廣趨勢圖表 |
| 🎫 折扣碼管理 | 專屬折扣碼和推廣連結 |
| 💰 季結統計 | 各季度分潤統計和支付狀態 |
| 🔗 推廣工具 | 一鍵複製推廣連結 |
```

### 📊 後台數據分析系統

用於了解用戶行為，改善課程內容。

#### 追蹤事件

| 事件 | 說明 | 用途 |
|------|------|------|
| `view_lesson` | 瀏覽課程（含來源） | 知道用戶從哪進入課程 |
| `search_keyword` | 搜尋關鍵字 | 了解用戶在找什麼 |
| `search_no_result` | 搜尋無結果 | 發現內容缺口 |
| `scroll_depth` | 滾動深度（25/50/75/100%） | 判斷內容是否太長 |
| `practice_start` | 開始練習 | 計算練習完成率 |
| `practice_complete` | 完成練習（含評分） | 評估課程有效度 |

#### Dashboard 面板

| 面板 | 內容 | 行動建議 |
|------|------|---------|
| 💡 快速洞察 | 自動分析數據給出建議 | 直接看建議行動 |
| 🔍 內容缺口 | 搜尋無結果 TOP 10 | 新增這些主題的課程 |
| 📊 課程來源 | 首頁/搜尋/分類/相關課程佔比 | 優化高效入口 |
| 🔥 熱門課程 | 瀏覽次數排行 | 了解用戶需求 |
| 🔍 熱門搜尋 | 搜尋關鍵字排行 | 優化課程標題 |

#### 課程分析 Tab

| Tab | 指標 | 判讀方式 |
|-----|------|---------|
| 📊 熱門 | 瀏覽/練習/收藏數 | 高瀏覽低練習 = 內容可能太難 |
| 🎯 有效度 | 用戶練習後評分 | 低分 = 內容不清楚，需重寫 |
| 🩺 健康度 | 滾動完成率 × 40% + 練習完成率 × 60% | 低分 = 需要改善的課程 |
| 🔥 熱力圖 | 視覺化課程表現 | 快速找出冷門課程 |

#### 快速洞察邏輯

自動分析數據，給出可行動建議：

```
1. 內容缺口提醒
   條件：搜尋無結果次數 > 0
   建議：「XXX 被搜尋 N 次但找不到，考慮新增相關課程」

2. 搜尋功能分析
   條件：搜尋來源佔比 > 40%
   建議：「搜尋功能使用率高，用戶能找到想要的課程」

3. 推薦效果分析
   條件：相關課程來源佔比 > 20%
   建議：「相關課程推薦有效，用戶會點擊延伸學習」

4. 標題優化提醒
   條件：熱門搜尋關鍵字 ≠ 熱門課程標題
   建議：「熱門搜尋 XXX 與熱門課程不同，可優化課程標題」
```

### 💳 訂閱 & 支付系統

**訂閱方案**

| 方案 | 價格 | 有效期 | 內容 |
|------|------|--------|------|
| 免費 | $0 | ∞ | 28 堂初級課程、搜尋篩選、PRO 課程預覽（僅問題） |
| 7天 PASS | $180 | 7 天 | 全部 213 堂課程、收藏功能、練習紀錄 |
| 30天 PASS | $290 | 30 天 | 全部 213 堂課程、收藏功能、練習紀錄 |
| PRO 年費 | $690 | 365 天 | 全部 213+ 堂課程、收藏、練習紀錄、未來新增內容 |

**支付流程**

```
用戶選擇方案 → /pricing 頁面
    ↓
POST /api/payments/checkout (需登入)
    ↓
金流 SDK 初始化 → 支付頁面 (ŌEN Tech)
    ↓
支付完成 → POST /api/payments/webhook
    ↓
更新訂閱狀態 → 導回 /payment-success
    ↓
前端輪詢 /api/payments/status
    ↓
AuthProvider 自動刷新訂閱狀態 → 所有受保護頁面立即可用
```

**支付安全機制**

- ✅ **伺服器時間驗證**：過期日期使用絕對 UTC 時間戳，防止客戶端時間篡改
- ✅ **Webhook 冪等性**：唯一索引 on (provider, provider_payment_id) 防止重複處理
- ✅ **重複購買防止**：檢查現有有效訂閱，返回 409 Conflict
- ✅ **RLS 政策**：用戶只能存取自己的訂閱/收藏/練習紀錄
- ✅ **訂閱狀態同期**：Payment Success 頁自動調用 refreshSubscription() 更新狀態

### 專案結構

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 首頁
│   │   ├── lesson/[id]/        # 課程詳情
│   │   ├── favorites/          # 收藏頁
│   │   ├── practice/           # 練習紀錄
│   │   ├── pricing/            # 付費方案
│   │   ├── feedback/           # 意見回報
│   │   ├── login/              # 登入頁
│   │   ├── admin/              # 後台
│   │   ├── affiliate/          # 🤝 合作方系統（2025-12-12 新增）
│   │   │   ├── login/          # 合作方登入
│   │   │   ├── dashboard/      # 合作方儀表板
│   │   │   └── reset-password/ # 密碼重設
│   │   └── api/admin/          # 🔒 Admin Server API（2025-11-29 新增）
│   │       ├── dashboard/      # Dashboard 數據 API
│   │       ├── users/          # 用戶管理 API
│   │       ├── lessons/        # 課程分析 API
│   │       ├── monetization/   # 付費分析 API
│   │       ├── subscription/   # 訂閱開通 API
│   │       └── affiliates/     # 🤝 合作方管理 API（2025-12-12 新增）
│   │           ├── create/     # 建立合作方
│   │           └── users/      # 合作方用戶列表
│   │
│   ├── components/
│   │   ├── ui/                 # 原子組件（Button, Loading, Stats...）
│   │   ├── home/               # 首頁組件
│   │   ├── lesson/             # 課程詳情子組件
│   │   ├── practice/           # 練習相關組件
│   │   ├── dashboard/          # 儀表板組件
│   │   ├── AuthProvider.tsx    # 認證 Context
│   │   ├── ErrorBoundary.tsx   # 錯誤邊界
│   │   ├── LessonCard.tsx      # 課程卡片
│   │   ├── LessonDetail.tsx    # 課程詳情
│   │   ├── SearchBar.tsx       # 搜尋欄
│   │   └── SkeletonLesson.tsx  # 載入骨架
│   │
│   └── lib/
│       ├── supabase.ts         # Supabase Client（前端）
│       ├── supabaseServer.ts   # 🔒 Supabase Service Role（後端）
│       ├── auth.ts             # 認證函數
│       ├── lessons.ts          # 課程 API
│       ├── favorites.ts        # 收藏 API
│       ├── practice.ts         # 練習紀錄 API
│       ├── improvement.ts      # 改善度計算
│       ├── analytics.ts        # 事件追蹤
│       ├── adminApi.ts         # 🔒 Admin API 客戶端封裝（2025-11-29）
│       ├── adminData.ts        # 🔒 Admin 資料層封裝（2025-11-29）
│       ├── subscription.ts     # 訂閱檢查
│       ├── constants.ts        # 常數定義
│       ├── retry.ts            # 弱網重試工具
│       ├── useAdminAuth.ts     # 後台驗證 Hook
│       └── useFilteredLessons.ts # 篩選 Hook
│
├── .env.local.example          # 環境變數範本
└── package.json
```

### 環境變數

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 🔒 後端專用（2025-11-29）
NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password
```

**注意**：
- `NEXT_PUBLIC_*` 會暴露給前端，只能用於公開資料
- `SUPABASE_SERVICE_ROLE_KEY` 僅用於 server-side API，可繞過 RLS

### 本地開發

```bash
cd web
npm install
npm run dev
```

### 資料庫 Schema

主要表格：
- `lessons` - 課程內容（🔒 RLS 啟用，premium 需訂閱）
- `users` - 用戶資料（含訂閱狀態，🔒 RLS 啟用）
- `favorites` - 收藏關聯（🔒 RLS 啟用，需訂閱）
- `practice_logs` - 練習紀錄（🔒 RLS 啟用，需訂閱）
- `event_log` - 事件追蹤（🔒 RLS 啟用 + rate-limit）
- `feedback` - 用戶回報
- `subscription_plans` - 訂閱方案版本化表（2025-11-29 新增）

安全函數：
- `is_subscription_active(user_id)` - 檢查訂閱是否有效（伺服器時間）
- `assert_event_log_limits()` - event_log 寫入限制（rate-limit + 大小）

詳見：
- [docs/schema.sql](docs/schema.sql) - 基礎 Schema
- [docs/migration_subscription_security.sql](docs/migration_subscription_security.sql) - RLS 政策
- [docs/migration_event_log_guardrails.sql](docs/migration_event_log_guardrails.sql) - Rate limit
- [docs/migration_subscription_plans.sql](docs/migration_subscription_plans.sql) - 方案版本化

### 後台安全機制

#### 三層驗證
1. Supabase Auth 登入
2. Email 白名單（`ADMIN_EMAILS`）
3. 後台密碼（`NEXT_PUBLIC_ADMIN_PASSWORD`）

#### 安全架構（2025-11-29 強化）

| 層級 | 機制 | 說明 |
|------|------|------|
| **前端** | API 封裝 | `adminApi.ts` 統一 token 取得與錯誤處理 |
| **前端** | 關注點分離 | `adminData.ts` 封裝所有 API，頁面只負責 UI |
| **後端** | Server API | 所有 admin 查詢改由 `/api/admin/*` 執行 |
| **後端** | Service Key | 使用 service role key，繞過 RLS |
| **後端** | is_admin 檢查 | 每個 API 都驗證 `users.is_admin = true` |
| **資料庫** | RLS 政策 | `users`/`lessons`/`favorites`/`practice_logs` 啟用 RLS |
| **資料庫** | 訂閱檢查 | `is_subscription_active()` 函數（伺服器時間） |
| **資料庫** | Premium 防護 | 非訂閱用戶無法讀取 premium 課程 |
| **資料庫** | Rate Limit | event_log 限制 120 次/分鐘（用戶）、60 次/分鐘（匿名） |
| **資料庫** | 大小限制 | event_log metadata 限制 4000 字元 |

#### 安全改善效果

**改善前**：
- ❌ 前端直接用 anon key 查詢敏感資料
- ❌ 客戶端可繞過訂閱檢查（修改本地時間）
- ❌ event_log 可被濫用（無限寫入）
- ❌ 訂閱方案變更會影響老用戶

**改善後**：
- ✅ 敏感資料只能透過 server API + service key 存取
- ✅ 訂閱檢查使用伺服器時間（`is_subscription_active()`）
- ✅ event_log 有 rate-limit 和大小限制
- ✅ 訂閱方案版本化，保留歷史方案
- ✅ RLS 政策確保資料隔離（用戶只能存取自己的資料）
- ✅ Premium 課程受 RLS 保護（需有效訂閱）

#### 相關檔案

```
web/src/
├── lib/
│   ├── adminApi.ts          # 客戶端 API 封裝（token + 錯誤處理）
│   ├── adminData.ts         # Admin API 調用封裝
│   └── supabaseServer.ts    # Service Role Client
│
├── app/api/admin/
│   ├── dashboard/route.ts   # Dashboard API（server-side）
│   ├── users/route.ts       # 用戶管理 API
│   ├── lessons/route.ts     # 課程分析 API
│   ├── monetization/route.ts # 付費分析 API
│   └── subscription/route.ts # 訂閱開通 API
│
docs/
├── migration_subscription_security.sql    # RLS + is_subscription_active
├── migration_event_log_guardrails.sql     # Rate limit + 大小限制
├── migration_subscription_plans.sql       # 方案版本化表
└── SMOKE_AUTH_SUBSCRIPTION.md             # 權限驗證測試用例
```

---

## 📱 功能特色

### 首頁（列表）

| 功能 | 說明 |
|------|------|
| 🔍 搜尋 | 關鍵字搜尋問題、標題、目標 |
| 篩選-程度 | 初級 / 中級 / 進階 |
| 篩選-雪道 | 綠道 / 藍道 / 黑道 / 蘑菇 / 粉雪 / 公園 / 樹林 |
| 篩選-技能 | CASI 五項核心技能 |
| 問題優先 | 卡片最上方顯示問題，快速對號入座 |

### 詳情頁

| 區塊 | 內容 |
|------|------|
| 😰 問題 | 學生常見的技術問題描述 |
| 🎯 目標 | 改善這個問題的目的或好處 |
| 🛠️ 怎麼練 | 具體的動作要點或練習步驟 |
| ✅ 做對訊號 | 練習正確時的身體感受或視覺回饋 |
| ❌ 做錯訊號 | 練習錯誤時的警示訊號 |
| 📚 CASI 分類 | 主要技能、核心能力分類 |

### CASI 五項核心技能

1. **站姿與平衡** - 居中且靈活的站姿
2. **旋轉** - 用下肢轉動滑雪板
3. **用刃** - 在有效邊刃上保持平衡
4. **壓力** - 控制板的壓力與變形
5. **時機與協調性** - 動作時序與流暢度

---

## 📊 資料格式

每筆教學資料結構：

```json
{
  "id": "01",
  "title": "滾刃快換刃：少站直縮小弧度",
  "level_tags": ["intermediate"],
  "slope_tags": ["blue"],
  "is_premium": false,
  "what": "問題描述...",
  "why": ["目標1", "目標2"],
  "how": [
    {"text": "步驟說明", "image": null}
  ],
  "signals": {
    "correct": ["做對訊號1", "做對訊號2"],
    "wrong": ["做錯訊號1"]
  },
  "casi": {
    "Primary_Skill": "用刃",
    "Core_Competency": "居中且靈活的站姿"
  }
}
```

---

## 📈 統計

- 教學文件總數：213 個
- 免費課程：28 堂（初級）
- PRO 課程：185 堂（中級/進階）
- 程度分類：初級 / 中級 / 進階
- 雪道分類：9 種（綠道、藍道、黑道、蘑菇、粉雪、公園、樹林、平地、全地形）
- CASI 技能：5 項

---

## ✅ 已完成功能

### 前台
- [x] 課程列表與搜尋
- [x] 分類篩選（程度/雪道/技能）
- [x] 課程詳情頁
- [x] 用戶登入/註冊
- [x] 收藏功能
- [x] 練習紀錄
- [x] 付費方案頁
- [x] 意見回報

### 後台
- [x] Dashboard（DAU/WAU/熱門課程/搜尋/回報）
- [x] 用戶管理（搜尋/開通訂閱）
- [x] 回報管理
- [x] 課程分析
- [x] 付費分析
- [x] 🤝 合作方管理（聯盟行銷系統）
- [x] 💰 分潤管理（季結算/批次支付）

### 聯盟行銷系統 (2025-12-12)
- [x] 合作方帳號建立與管理
- [x] 專屬折扣碼生成
- [x] 用戶追蹤與展開列表
- [x] 分潤自動計算
- [x] 分潤記錄管理
- [x] 智能篩選（季度/狀態/合作方）
- [x] 合作方儀表板
- [x] 推廣統計與趨勢圖表
- [x] 季結算管理
- [x] 批次支付功能

### 事件追蹤
- [x] 課程瀏覽
- [x] 搜尋關鍵字
- [x] 付費頁瀏覽
- [x] 收藏操作
- [x] 練習完成

### Clean Code 重構
- [x] constants.ts - 統一常數
- [x] ui.tsx - 共用組件
- [x] useFilteredLessons - 篩選邏輯抽離
- [x] LessonDetail 拆分子組件
- [x] AdminLayout 統一後台驗證
- [x] useAdminAuth Hook
- [x] **安全性強化（2025-11-29）**
  - 移除客戶端直連 Supabase（Admin/metrics/monetization）
  - Admin API 伺服器化（service key + RLS）
  - 客戶端 API 封裝（adminApi.ts + adminData.ts）
  - 前端關注點分離（頁面只負責 UI）
  - event_log 後端校驗/節流（rate-limit + 大小限制）
  - 訂閱方案版本化（DB 方案表 + 歷史保留）
  - 權限驗證 Smoke Tests（未訂閱/訂閱中/admin）

### UX 優化（2025-11-28）
- [x] 手機優先改造（卡片簡化、水平滑動、分段評分）
- [x] Alpine Velocity 美學系統（字體、斜切角、光影動效）
- [x] 自動偵測數字標頭分段顯示

---

## 🗺️ 未來規劃

**已完成**
- ✅ 金流系統（ŌEN Tech）
- ✅ 訂閱管理（免費/短期 PASS/年費）
- ✅ 後台數據分析（Dashboard/課程分析/付費分析）
- ✅ 用戶認證與授權（Supabase Auth + RLS）
- ✅ Alpine Velocity 美學系統

**優先開發**
- [ ] **推播提醒**
  - 即將過期提醒（7天前）
  - 新課程上線通知
  - 練習成績改善提醒

- [ ] **個人化機制**
  - 學習進度儀表板（進度條/時間統計）
  - 個人化課程推薦（基於瀏覽/練習歷史）
  - 改善計畫跟蹤（針對弱項課程自動推薦）

- [ ] **內容擴展**
  - AI 生成示意圖（基於課程文字）
  - CASI Level 2/3 進階內容
  - 季節性課程（新雪季更新內容）
  - 用戶貢獻內容（社群課程）

**未來考慮**
- [ ] 離線模式（Offline-first PWA）
- [ ] 社群功能（課程討論/經驗分享）
- [ ] 教練端平台（學生管理/進度追蹤）
- [ ] 多語言支援（中文/英文/日文）
- [ ] 小組訓練課程（班級管理）

---

## 📚 開發文件

所有文件統一放在 [docs/](docs/) 目錄，詳見 [FILE_ORGANIZATION.md](docs/FILE_ORGANIZATION.md)

### 核心文件

| 文件 | 說明 |
|------|------|
| [SDD.md](docs/SDD.md) | 軟體設計文件 |
| [PLAN.md](docs/PLAN.md) | 開發計畫 |
| [TODO.md](docs/TODO.md) | 待辦清單 |
| [FILE_ORGANIZATION.md](docs/FILE_ORGANIZATION.md) | 📁 檔案組織說明 |

### 資料庫

| 文件 | 說明 |
|------|------|
| [schema.sql](docs/schema.sql) | 資料庫 Schema |
| [migration_subscription_security.sql](docs/migration_subscription_security.sql) | 🔒 RLS 政策 + 訂閱檢查函數 |
| [migration_event_log_guardrails.sql](docs/migration_event_log_guardrails.sql) | 🔒 event_log Rate Limit |
| [migration_subscription_plans.sql](docs/migration_subscription_plans.sql) | 🔒 訂閱方案版本化表 |
| [migration_payments.sql](docs/migration_payments.sql) | 💳 金流系統 |

### UX/UI 設計

| 文件 | 說明 |
|------|------|
| [Alpine_Velocity_實作報告_2025-11-28.md](docs/Alpine_Velocity_實作報告_2025-11-28.md) | Alpine Velocity 美學實作 |
| [Alpine_Velocity_進階優化_2025-11-28.md](docs/Alpine_Velocity_進階優化_2025-11-28.md) | 視覺深度與微動效優化 |
| [UX_第四輪建議_手機優先_2025-11-28.md](docs/UX_第四輪建議_手機優先_2025-11-28.md) | 手機優先 UX 改善方案 |

### 安全性與測試

| 文件 | 說明 |
|------|------|
| [安全性強化報告_2025-12-01.md](docs/安全性強化報告_2025-12-01.md) | 🔒 安全性強化總結 |
| [SMOKE_AUTH_SUBSCRIPTION.md](docs/SMOKE_AUTH_SUBSCRIPTION.md) | 🔒 權限驗證測試用例 |
| [PAYMENTS.md](docs/PAYMENTS.md) | 💳 支付系統完整文件（規劃/測試/報告） |

### 部署與維護

| 文件 | 說明 |
|------|------|
| [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) | 生產環境部署指南 |
| [LINUS_GUIDE.md](docs/LINUS_GUIDE.md) | Linus 原則指南 |

---

---

## 🔒 安全性強化總結（2025-11-29）

### 項目 125-130：Clean Code + Linus 重構行動

這次重構主要解決了**安全性漏洞**和**架構問題**，確保敏感資料不會被前端直接存取。

#### 改善項目

| # | 項目 | 改善前 | 改善後 |
|---|------|--------|--------|
| 125 | 敏感資料訪問 | 前端用 anon key 直連 Supabase | 改走 server API + service key |
| 126 | API 客戶端封裝 | 每個頁面重複 fetch 邏輯 | `adminApi.ts` 統一處理 |
| 127 | 關注點分離 | 頁面混雜資料邏輯 | `adminData.ts` 封裝，頁面只負責 UI |
| 128 | event_log 防護 | 無限制，可被濫用 | Rate-limit + 大小限制 |
| 129 | 方案版本化 | 前端常數，無歷史紀錄 | DB 方案表 + 版本控制 |
| 130 | 權限驗證測試 | 無測試用例 | Smoke Tests 文件 |

#### 核心改善

**1. 三層架構分離**
```
前端（UI）→ adminData.ts（資料層）→ /api/admin/*（Server API）→ Supabase（service key）
```

**2. 安全防護機制**
- ✅ RLS 政策：用戶只能存取自己的資料
- ✅ 訂閱檢查：使用伺服器時間，無法繞過
- ✅ Premium 防護：非訂閱用戶無法讀取 premium 課程
- ✅ Rate Limit：event_log 限制 120 次/分鐘
- ✅ 大小限制：metadata 限制 4000 字元

**3. 可維護性提升**
- ✅ 統一錯誤處理（`adminApi.ts`）
- ✅ 統一 token 取得（避免重複代碼）
- ✅ 型別安全（TypeScript interfaces）
- ✅ 測試用例（Smoke Tests）

#### 影響範圍

**修改的檔案**：
- `web/src/lib/adminApi.ts` - 新增
- `web/src/lib/adminData.ts` - 新增
- `web/src/lib/supabaseServer.ts` - 新增
- `web/src/app/api/admin/**/*.ts` - 新增 5 個 API 路由
- `web/src/app/admin/**/*.tsx` - 改用 `adminData.ts`
- `docs/migration_subscription_security.sql` - 新增
- `docs/migration_event_log_guardrails.sql` - 新增
- `docs/migration_subscription_plans.sql` - 新增
- `docs/SMOKE_AUTH_SUBSCRIPTION.md` - 新增

**程式碼品質**：
- ✅ 移除 21 處 `console.log`
- ✅ 統一型別使用 `lesson-v3.ts`
- ✅ 消除重複樣式（`PageContainer` 組件）
- ✅ Build 成功通過

---

*最後更新：2025-12-12*
