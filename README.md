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
├── 練習紀錄 - 記錄每次練習心得（需登入）
├── 付費方案 - 7天/30天/年費訂閱
└── 意見回報 - Bug/課程許願/功能許願

後台功能 (/admin)
├── Dashboard - DAU/WAU、熱門課程、熱門搜尋、最新回報
├── 用戶管理 - 搜尋用戶、手動開通訂閱
├── 回報管理 - 查看/篩選用戶回報
├── 課程分析 - 瀏覽/練習/收藏統計
└── 付費分析 - 轉換率、方案分布、漏斗
```

### 訂閱方案

| 方案 | 價格 | 內容 |
|------|------|------|
| 免費 | $0 | 28 堂初級課程、搜尋篩選、PRO 課程預覽（僅問題） |
| 7天 PASS | $180 | 全部 213 堂課程、收藏、練習紀錄 |
| 30天 PASS | $290 | 同上 |
| PRO 年費 | $690 | 同上 |

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
│   │   └── admin/              # 後台
│   │
│   ├── components/
│   │   ├── ui/                 # 原子組件（Button, Loading, Stats...）
│   │   ├── home/               # 首頁組件
│   │   ├── lesson/             # 課程詳情子組件
│   │   ├── dashboard/          # 儀表板組件
│   │   ├── AuthProvider.tsx    # 認證 Context
│   │   ├── ErrorBoundary.tsx   # 錯誤邊界
│   │   ├── LessonCard.tsx      # 課程卡片
│   │   ├── LessonDetail.tsx    # 課程詳情
│   │   ├── SearchBar.tsx       # 搜尋欄
│   │   └── SkeletonLesson.tsx  # 載入骨架
│   │
│   └── lib/
│       ├── supabase.ts         # Supabase Client
│       ├── auth.ts             # 認證函數
│       ├── lessons.ts          # 課程 API
│       ├── favorites.ts        # 收藏 API
│       ├── practice.ts         # 練習紀錄 API
│       ├── improvement.ts      # 改善度計算
│       ├── analytics.ts        # 事件追蹤
│       ├── admin.ts            # 後台 API
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
NEXT_PUBLIC_ADMIN_PASSWORD=your-admin-password
```

### 本地開發

```bash
cd web
npm install
npm run dev
```

### 資料庫 Schema

主要表格：
- `lessons` - 課程內容
- `users` - 用戶資料（含訂閱狀態）
- `favorites` - 收藏關聯
- `practice_logs` - 練習紀錄
- `event_log` - 事件追蹤
- `feedback` - 用戶回報

詳見 [docs/schema.sql](docs/schema.sql)

### 後台安全機制

三層驗證：
1. Supabase Auth 登入
2. Email 白名單（`ADMIN_EMAILS`）
3. 後台密碼（`NEXT_PUBLIC_ADMIN_PASSWORD`）

---

## 🐍 Streamlit 版本（舊版）

```bash
cd /Users/jameschen/Downloads/單板教學
source .venv/bin/activate
streamlit run app.py --server.address 0.0.0.0 --server.port 8501
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

### UX 優化（2025-11-28）
- [x] 手機優先改造（卡片簡化、水平滑動、分段評分）
- [x] Alpine Velocity 美學系統（字體、斜切角、光影動效）
- [x] 自動偵測數字標頭分段顯示

---

## 🗺️ 未來規劃

- [ ] 金流串接（綠界/藍新）
- [ ] AI 示意圖生成
- [ ] 改善計畫課程
- [ ] CASI Level 2/3 深度內容
- [ ] 個人儀表板（趨勢圖）
- [ ] 推播通知

---

## 📚 開發文件

| 文件 | 說明 |
|------|------|
| [SDD.md](docs/SDD.md) | 軟體設計文件 |
| [PLAN.md](docs/PLAN.md) | 開發計畫 |
| [TODO.md](docs/TODO.md) | 待辦清單 |
| [schema.sql](docs/schema.sql) | 資料庫 Schema |
| [migration_subscription.sql](docs/migration_subscription.sql) | 訂閱欄位 Migration |
| [migration_event_log.sql](docs/migration_event_log.sql) | 事件追蹤 Migration |
| [migration_admin.sql](docs/migration_admin.sql) | 後台函數 Migration |
| [Alpine_Velocity_實作報告_2025-11-28.md](Alpine_Velocity_實作報告_2025-11-28.md) | Alpine Velocity 美學實作 |
| [Alpine_Velocity_進階優化_2025-11-28.md](Alpine_Velocity_進階優化_2025-11-28.md) | 視覺深度與微動效優化 |
| [UX_第四輪建議_手機優先_2025-11-28.md](UX_第四輪建議_手機優先_2025-11-28.md) | 手機優先 UX 改善方案 |

---

*最後更新：2025-11-28*
