# 安全與防護調整紀錄

## 本次改動
- 新增環境變數樣板 `web/.env.example`：列出 Supabase、支付、Webhook、Admin 角色、Turnstile、Rate Limit 等必填/可選變數。
- API 速率限制（可開關）：`src/middleware.ts` 內建 IP rate limit，支援 Upstash Redis（`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`）或記憶體 fallback（`RATE_LIMIT_ENABLED`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`）。
- 機器人防護：`src/lib/botDefense.ts` Turnstile 驗證；`api/payments/checkout` 支援 `x-turnstile-token`/`turnstileToken`，若設 `TURNSTILE_SECRET_KEY` 則必須通過驗證。
- 禁爬控制：`src/middleware.ts` 對 `/admin`、`/mock-checkout`、`/payment-success`、`/payment-failure` 設 `X-Robots-Tag: noindex, nofollow`。
- 全域錯誤頁：`src/app/error.tsx`（友善 500 回退，dev 顯示詳情）與 `src/app/not-found.tsx`（404）。
- 日誌控制：`src/lib/logger.ts`，生產環境僅輸出 error，避免暴露內部資訊。
- ESLint 規則：`.eslintrc.json` 限制 console（允許 error）。

## 部署環境（Zeabur）建議
1) **填寫環境變數**：依 `.env.example` 完整設定，尤其：
   - Supabase：`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - 支付：`PAYMENT_PROVIDER`, `PAYMENT_OENTECH_*`, `PAYMENT_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`
   - Admin：`ADMIN_EMAILS`, `ADMIN_ROLES`, `NEXT_PUBLIC_ADMIN_EMAILS`, `NEXT_PUBLIC_ADMIN_ROLES`
   - Bot 防護：`TURNSTILE_SECRET_KEY`
   - Rate Limit：`RATE_LIMIT_ENABLED=true`（如要啟用）、`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`
2) **Zeabur DNS/HTTPS**：確保自訂網域已開啟 HTTPS，`NEXT_PUBLIC_APP_URL` 使用 https，支付成功/失敗回調與 webhook URL 必須與網域一致。
3) **Webhook 保護**：在 Zeabur 控制台設定 `PAYMENT_WEBHOOK_SECRET`，並確認支付供應商回呼 URL 指向 Zeabur 部署的 HTTPS 路徑。
4) **日誌/監控**：若使用 Zeabur 日誌，建議再接入 Sentry/Vercel Analytics（需額外 DSN/env）；將 `logger` 上層串到監控服務。
5) **Rate Limit 升級**：Zeabur 無伺服器共用記憶體，可改用 Upstash/Redis/KV 儲存計數；目前的記憶體版適合單實例，水平擴展時需替換。
6) **Bot 防護前端**：在付款/登入/敏感表單頁加入 Turnstile 小組件（`TurnstileWidget`），將 token 透過 header `x-turnstile-token` 或 body `turnstileToken` 傳給 API。
7) **Console 管控**：`.eslintrc.json` 已限制非 error 級別 console，建議在 CI 執行 `next lint`。
7) **Console 清理**：生產環境啟用 ESLint 規則禁止 `console.log`/`console.warn`（保留 error），減少暴露內部細節。
8) **成本/配額**：在 Supabase/外部 API 設告警與限額；Zeabur 部署若有計費，設定監控避免流量突增。
