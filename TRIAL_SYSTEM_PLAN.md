# 免費試用 7 天功能 - 實作計畫

## 概述

為合作夥伴推廣設計「7天免費試用」功能，採用折扣碼系統，試用到期自動降級至免費版，無需綁定付款方式。

### 核心決策

1. **試用權限**：7天 PASS 完整功能（213 堂課 + 收藏 + 練習紀錄）
   - 理由：與現有方案一致、實作簡單、轉換率最高

2. **推廣方式**：專屬連結自動套用折扣碼
   - 格式：`https://snowskill.app/pricing?coupon=PARTNER2025`
   - 優點：一鍵啟用、轉換率最高、合作夥伴易於分享

3. **到期行為**：自動降級為免費版（Vercel Cron 每日執行）

4. **分潤機制**：
   - 分潤比例：15%
   - 計算基數：NT$180（7天 PASS 原價）
   - 單筆分潤：NT$27
   - 結算週期：季結（1/4/7/10 月）
   - 查詢方式：合作方登入儀表板

---

## 資料庫 Schema

### 新增表：coupons（折扣碼主表）

```sql
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'free_trial',
  plan_id TEXT NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  partner_name TEXT,
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON public.coupons(code) WHERE is_active = TRUE;
CREATE INDEX idx_coupons_partner ON public.coupons(partner_name);
```

### 新增表：coupon_usages（使用紀錄）

```sql
CREATE TABLE public.coupon_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  UNIQUE(coupon_id, user_id)
);

CREATE INDEX idx_coupon_usages_user ON public.coupon_usages(user_id);
CREATE INDEX idx_coupon_usages_coupon ON public.coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_ip ON public.coupon_usages(ip_address);
```

### 新增表：affiliate_partners（合作方帳號，Phase 2）

```sql
CREATE TABLE public.affiliate_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  supabase_user_id UUID UNIQUE REFERENCES auth.users(id),
  default_commission_rate NUMERIC(5,2) DEFAULT 15.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_affiliate_partners_email ON public.affiliate_partners(email);
```

### 新增表：affiliate_commissions（分潤記錄，Phase 2）

```sql
CREATE TABLE public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES public.affiliate_partners(id),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  original_payment_id UUID REFERENCES public.payments(id),
  conversion_payment_id UUID REFERENCES public.payments(id),
  trial_activation_date TIMESTAMPTZ,
  conversion_date TIMESTAMPTZ,
  commission_amount NUMERIC(10,2),
  settlement_period TEXT,
  status TEXT DEFAULT 'pending',
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_partner ON public.affiliate_commissions(partner_id);
CREATE INDEX idx_commissions_settlement ON public.affiliate_commissions(settlement_period);
CREATE INDEX idx_commissions_status ON public.affiliate_commissions(status);
```

### 擴充表：users（Phase 1）

```sql
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS trial_activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_source TEXT,
  ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_trial_used ON public.users(trial_used);
```

### Phase 2 schema擴充（合作方）

```sql
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.affiliate_partners(id);
```

> 先完成 Phase 1（單純試用流程）。Phase 2 建立 `affiliate_partners` 後，再新增 `partner_id` 並將合作方專屬折扣碼與該欄位連結。

---

## API 端點設計

### 1. 驗證折扣碼 - `POST /api/coupons/validate`

**輸入**：`{ code: string }`

**驗證邏輯**：
1. 查詢折扣碼存在且啟用
2. 檢查有效期限
3. 檢查使用次數限制
4. 若已登入：檢查用戶是否已使用此碼、是否已用過試用

---

### 2. 兌換折扣碼 - `POST /api/coupons/redeem`

**Transaction 邏輯**：
1. 驗證 JWT token（必須登入）
2. 防濫用檢查（IP 限制、Email domain 黑名單）
3. 開啟 Transaction：
   - 更新 `users` 表（subscription_type, expires_at, trial_used, trial_source）
   - 插入 `coupon_usages` 記錄
   - 更新 `coupons.used_count += 1`
   - 插入 `payments` 記錄（amount = 0, status = 'active'）
4. 發送分析事件
5. 返回成功

---

### 3. 建立合作方帳號 - `POST /api/admin/affiliates/create`

**輸入**：
```typescript
{
  name: string
  email: string
  coupon_code: string
}
```

**自動執行**：
1. 建立 `affiliate_partners` 帳號
2. 建立 `coupons` 折扣碼
3. 發送 Email 給合作方（帳號資訊 + 分享連結 + 密碼重設連結）

---

### 4. Cron Job - `GET /api/cron/expire-trials`

**每日凌晨 2 點執行**：
- 查詢過期試用用戶
- 批次降級為免費版

**每季 1 日凌晨 3 點執行** - `GET /api/cron/quarterly-settlement`：
- 查詢本季試用轉付費訂單
- 計算分潤（NT$180 × 15% = NT$27/筆）
- 插入 `affiliate_commissions` 記錄
- 發送季結統計 Email

---

## 前端實作

### 需要新增的檔案

1. `src/components/CouponBanner.tsx` - 折扣橫幅組件
2. `src/app/trial-success/page.tsx` - 試用成功頁面
3. `src/app/affiliate/login/page.tsx` - 合作方登入頁面
4. `src/app/affiliate/dashboard/page.tsx` - 合作方統計儀表板

### 需要修改的檔案

1. `src/app/pricing/page.tsx`
   - 讀取 URL 參數 `?coupon=XXX`
   - 自動驗證折扣碼
   - 顯示 CouponBanner 組件
   - 處理兌換流程

---

## 實作優先順序

### Phase 1: MVP - 試用系統（3-4 工作日）

| 任務 | 時間 |
|------|------|
| 資料庫 Schema | 1h |
| API: 驗證折扣碼 | 2h |
| API: 兌換折扣碼 | 3h |
| 工具函式 + 防濫用 | 4h |
| Pricing 頁整合 | 2h |
| UI 組件 | 2h |
| Cron Job（降級） | 2h |
| 測試 + Debug | 4h |

**小計**：~20 小時

### Phase 2: 分潤系統 + 合作方管理（3-4 工作日）

| 任務 | 時間 |
|------|------|
| 建立合作方帳號 API | 3h |
| 合作方登入系統 | 3h |
| 儀表板 | 4h |
| 季結計算 Cron | 3h |
| Email 模板 | 2h |
| Webhook 擴充 | 2h |
| 測試 + Debug | 3h |

**小計**：~20 小時

### Phase 3: 管理後台（2 天，可選）

- 管理員建立折扣碼介面
- 分潤統計儀表板
- 合作方列表管理

---

## 使用者流程

### 一般用戶

```
分享連結 → 驗證折扣碼 → 顯示橫幅 → 啟用試用
→ 試用成功 → 享受 7 天 → 自動降級 → 可續訂
```

### 合作方

```
建立帳號 → 分享連結 → 用戶試用 → 7 天後續訂
→ 自動計算分潤 → 季結結算 → 登入儀表板查閱
```

---

## 關鍵指標

| 指標 | 說明 |
|------|------|
| 試用啟用次數 | 點擊「啟用試用」並成功開通的用戶數 |
| 轉付費次數 | 試用結束後續訂付費的用戶數 |
| 轉換率 | 轉付費次數 / 試用啟用次數 |
| 應得分潤 | 轉付費次數 × NT$27 |

---

## 環境變數

```bash
CRON_SECRET=<random-string>  # Cron Job 驗證密鑰
```

---

## 部署檢查清單

- [ ] 執行資料庫 migration
- [ ] 設定環境變數
- [ ] 配置 Vercel Cron
- [ ] 手動測試折扣碼流程
- [ ] 測試試用到期降級
- [ ] 測試合作方帳號建立
- [ ] 配置 Email 通知
- [ ] 監控告警設定
