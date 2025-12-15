import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.playwright/.auth/admin.json')

setup('authenticate as admin', async ({ page }) => {
  // 跳過認證 - E2E 測試僅在開發環境執行
  // 需要設置 ADMIN_EMAIL 和 ADMIN_PASSWORD 環境變數
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.log('⚠️ E2E 測試需要 ADMIN_EMAIL 和 ADMIN_PASSWORD 環境變數')
    console.log('⏭️ 跳過認證設置，E2E 測試將被跳過')
    return
  }

  // 導航到登入頁面
  await page.goto('/login')

  // 填入登入表單
  await page.fill('input[type="email"]', adminEmail)
  await page.fill('input[type="password"]', adminPassword)

  // 提交登入
  await page.click('button[type="submit"]')

  // 等待登入成功
  await page.waitForURL('/', { timeout: 10000 })

  // 確認登入成功
  await expect(page.locator('text=/登出|logout/i')).toBeVisible({ timeout: 5000 })

  // 儲存認證狀態
  await page.context().storageState({ path: authFile })
})
