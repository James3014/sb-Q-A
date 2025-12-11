# 單板教學 - Snowskill.app

[Live Demo](https://www.snowskill.app/) • [GitHub](https://github.com/James3014/sb-Q-A)

## 📋 專案概述

**單板教學** 是一個專業的單板滑雪線上課程平台，提供 **200+ 堂課程**，基於 CASI (Canadian Association of Snowsports Instructors) 教學框架設計，涵蓋初級到進階技巧。

### 核心特性

- ✅ **213 堂專業課程** - 初級（Green）、中級（Red）、進階（Black）
- ✅ **進度追蹤系統** - 記錄學習進度、評分和能力評估
- ✅ **訂閱制 (SaaS)** - 7天/30天/年費訂閱，Stripe 支付
- ✅ **完整認證系統** - Supabase Auth，支援 Email/密碼登入
- ✅ **後台管理** - 課程管理、用戶管理、營收統計
- ✅ **實時監控** - Sentry 錯誤追蹤、統一日誌層
- ✅ **SEO 優化** - 動態 sitemap、robots.txt、X-Robots-Tag headers

## 🚀 技術棧

| 層級 | 技術 |
|------|------|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **Styling** | Tailwind CSS + Framer Motion |
| **Backend** | Next.js API Routes + Supabase |
| **Database** | Supabase PostgreSQL + RLS |
| **Authentication** | Supabase Auth |
| **Payments** | Stripe + OenTech Payment API |
| **Hosting** | Zeabur (Serverless) |
| **SSL/TLS** | Let's Encrypt (自動續期) |
| **CDN** | Zeabur Edge Network |
| **Bot Protection** | Cloudflare Turnstile |

## 📦 核心文件結構

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # 首頁
│   │   ├── lesson/[id]/page.tsx     # 課程詳細頁（動態）
│   │   ├── login/page.tsx           # 認證頁
│   │   ├── pricing/page.tsx         # 定價頁
│   │   ├── admin/                   # 後台管理
│   │   ├── api/                     # API 端點
│   │   ├── robots.ts                # SEO robots.txt 配置
│   │   ├── sitemap.ts               # 動態 sitemap 生成
│   │   ├── error.tsx                # 全域錯誤邊界
│   │   └── layout.tsx               # Root 佈局
│   ├── lib/
│   │   ├── lessons.ts               # 課程數據層
│   │   ├── supabase.ts              # Supabase 客戶端
│   │   ├── auth.ts                  # 認證工具
│   │   ├── monitoring.ts            # 統一監控層
│   │   ├── logger.ts                # 日誌工具
│   │   ├── payments.ts              # 支付邏輯
│   │   └── ...
│   └── components/
│       ├── LessonCard.tsx           # 課程卡片
│       ├── AuthProvider.tsx         # 認證提供者
│       └── ...
├── public/
│   ├── robots.txt                   # SEO 爬蟲控制
│   └── favicon.ico
└── package.json
```

## 🔐 安全性檢查清單 ✅

部署前完整驗證 (評分: **8.1/10**)

| 項目 | 狀態 | 評分 | 說明 |
|------|------|------|------|
| 環境變數管理 | ✅ | 8/10 | API Keys 不硬編碼，使用 process.env |
| API 禁止公開 | ✅ | 9/10 | JWT 認證、Webhook 簽名完整 |
| 機器人防護 | ✅ | 8/10 | Turnstile 已集成 |
| robots.txt | ✅ | **10/10** | 動態生成，支持 SEO |
| 錯誤處理 | ✅ | **10/10** | 友善的 500/404 頁面 |
| 日誌監控 | ✅ | 8/10 | 統一監控層，支持 Sentry |
| HTTPS 設定 | ✅ | 9/10 | Let's Encrypt 自動續期 |
| **成本控制** | ⏳ | 2/10 | 需設定 Supabase/OenTech 限額 |
| Console 清理 | ✅ | 9/10 | 生產環境無調試輸出 |

詳見：[DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md)

## 🛠 開發指南

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000)

### 構建生產版本

```bash
npm run build
npm run start
```

### 檢查類型和 Lint

```bash
npm run type-check
npm run lint
```

### 環境變數配置

複製 `.env.example` 為 `.env.local`：

```bash
cp .env.example .env.local
```

必需變數：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
STRIPE_PUBLIC_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
```

## 📊 主要功能

### 1. 課程管理
- 213 堂結構化課程
- 基於 CASI 教學框架
- 按程度分類（初/中/進）
- 課程搜尋和篩選

### 2. 用戶系統
- Email 註冊/登入
- 訂閱管理（3 種方案）
- 進度追蹤
- 收藏列表

### 3. 支付系統
- Stripe 整合
- OenTech 支付（台灣用戶）
- Webhook 驗證
- 支付狀態追蹤

### 4. 後台管理
- Dashboard 統計
- 課程管理
- 用戶管理
- 營收分析

### 5. 監控與分析
- 統一監控層（Sentry 就緒）
- API 性能追蹤
- 支付事件日誌
- 錯誤自動捕捉

## 📈 部署狀態

**環境**: Zeabur (Serverless)
**域名**: https://www.snowskill.app
**SSL**: Let's Encrypt (自動續期)
**構建**: Next.js 16 + TypeScript
**CDN**: Zeabur Edge Network

最新部署: 2025-12-11
部署分支: `main`

## 🔗 相關文檔

- [部署檢查清單](../DEPLOYMENT_CHECKLIST.md) - 9 大安全檢查項目
- [環境變數安全指南](../ENV_FILE_SECURITY_GUIDE.md) - Token 輪換步驟
- [SDD 規格書](../SDD.md) - 完整系統設計文檔

## 📝 Git 提交規範

使用 Conventional Commits 風格：

```bash
feat: 新功能
fix: 修復
refactor: 重構
docs: 文檔
chore: 維護
```

示例：

```bash
git commit -m "feat: 新增動態 sitemap.xml 和更新 robots.ts"
```

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'feat: 新增功能'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📞 支援

- 問題回報：[GitHub Issues](https://github.com/James3014/sb-Q-A/issues)
- 功能請求：[GitHub Discussions](https://github.com/James3014/sb-Q-A/discussions)

## 📄 授權

MIT License - 詳見 LICENSE 文件
