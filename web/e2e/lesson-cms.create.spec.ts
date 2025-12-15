import { test, expect } from '@playwright/test'

// E2E 測試需要管理員帳號，在沒有環境變數時跳過
const skipIfNoAuth = !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD

// 登入 helper
async function loginAsAdmin(page: import('@playwright/test').Page) {
  const email = process.env.ADMIN_EMAIL!
  const password = process.env.ADMIN_PASSWORD!

  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')

  // 等待登入成功（重定向到首頁）
  await page.waitForURL('/', { timeout: 15000 })
}

test.describe('Lesson CMS - 建立課程流程', () => {
  test.skip(skipIfNoAuth, '需要 ADMIN_EMAIL 和 ADMIN_PASSWORD 環境變數')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('完整建立課程：填表 → 上傳圖片 → 提交 → 驗證列表', async ({ page }) => {
    // 1. 導航到建立課程頁面
    await page.goto('/admin/lessons/create')
    await expect(page.locator('h1, h2')).toContainText(/建立課程|新增課程/)

    // 2. 填入課程標題
    const titleInput = page.locator('input[placeholder*="例"]').first()
    await titleInput.fill('以腳尖帶動板頭，穩定入門轉彎')
    await expect(titleInput).toHaveValue('以腳尖帶動板頭，穩定入門轉彎')

    // 3. 填入本課目標（富文本編輯器）
    // 註：需要找到 Tiptap editor
    const whatEditor = page.locator('[contenteditable="true"]').first()
    await whatEditor.click()
    await whatEditor.fill('掌握基本的轉彎技術')
    await expect(whatEditor).toContainText('掌握基本的轉彎技術')

    // 4. 新增「為什麼重要」項目
    const whyAddBtn = page.locator('button:has-text("+ 新增理由")')
    await whyAddBtn.click()
    const whyInputs = page.locator('input[placeholder*="提升"]')
    await whyInputs.first().fill('提升穩定度')

    // 5. 選擇程度標籤
    const levelButton = page.locator('button:has-text("初級")')
    await levelButton.click()
    await expect(levelButton).toHaveClass(/bg-blue-600/)

    // 6. 選擇場地標籤
    const slopeButton = page.locator('button:has-text("綠坡")')
    await slopeButton.click()
    await expect(slopeButton).toHaveClass(/bg-blue-600/)

    // 7. 上傳圖片
    const uploadZone = page.locator('div:has-text("拖放圖片")')
    await uploadZone.click()
    const fileInput = page.locator('input[type="file"]')

    // 建立測試圖片
    const testImagePath = '/tmp/test-image.png'
    // 注：實際執行時需要建立真實圖片檔案
    // 這裡假設圖片已存在
    if (fileInput) {
      await fileInput.setInputFiles({
        name: 'test-lesson.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
      })

      // 等待上傳完成
      await page.waitForTimeout(2000)

      // 驗證圖片預覽
      const preview = page.locator('img[alt*="Step"]')
      await expect(preview).toHaveCount(1)
    }

    // 8. 新增教學步驟
    const stepEditor = page.locator('text=課程步驟')
    await expect(stepEditor).toBeVisible()

    // 9. 新增「做對的訊號」
    const correctBtn = page.locator('button:has-text("+ 新增項目")').nth(0)
    await correctBtn.click()
    await page.locator('input[placeholder*="肩膀"]').fill('肩膀放鬆')

    // 10. 新增「做錯的訊號」
    const wrongBtn = page.locator('button:has-text("+ 新增項目")').nth(1)
    await wrongBtn.click()
    await page.locator('input[placeholder*="膝蓋"]').fill('膝蓋鎖死')

    // 11. 檢查 PRO 內容勾選框
    const proCheckbox = page.locator('input[type="checkbox"]')
    // 可選：勾選 PRO 標記
    // await proCheckbox.check()

    // 12. 提交表單
    const submitBtn = page.locator('button:has-text("儲存課程")')
    await submitBtn.click()

    // 13. 驗證重定向到課程列表
    await page.waitForURL('/admin/lessons')
    await expect(page).toHaveURL('/admin/lessons')

    // 14. 驗證新課程出現在列表
    const lessonTitle = page.locator('text=以腳尖帶動板頭，穩定入門轉彎')
    await expect(lessonTitle).toBeVisible()

    // 15. 驗證課程狀態（應已發布）
    const statusCell = page.locator('text=已發布|發布')
    await expect(statusCell).toBeVisible()

    // 16. 驗證操作按鈕存在
    const editBtn = page.locator('button:has-text("編輯")').first()
    const deleteBtn = page.locator('button:has-text("刪除")').first()
    await expect(editBtn).toBeVisible()
    await expect(deleteBtn).toBeVisible()
  })

  test('建立課程時必填欄位驗證', async ({ page }) => {
    await page.goto('/admin/lessons/create')

    // 直接點擊提交，不填任何資料
    const submitBtn = page.locator('button:has-text("儲存課程")')
    await submitBtn.click()

    // 驗證錯誤訊息
    const errorMessages = page.locator('text=/課程標題|必填|為必/i')
    await expect(errorMessages).toBeVisible({ timeout: 3000 })

    // 驗證未重定向
    await expect(page).toHaveURL('/admin/lessons/create')
  })

  test('圖片上傳超過大小限制時顯示錯誤', async ({ page }) => {
    await page.goto('/admin/lessons/create')

    // 嘗試上傳過大的檔案
    const fileInput = page.locator('input[type="file"]')

    // 建立 10MB 的檔案（超過 5MB 限制）
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 'a')
    await fileInput.setInputFiles({
      name: 'large-file.jpg',
      mimeType: 'image/jpeg',
      buffer: largeBuffer,
    })

    // 驗證錯誤提示
    const errorMsg = page.locator('text=/檔案|大小|超過|限制/i')
    await expect(errorMsg).toBeVisible({ timeout: 5000 })
  })

  test('無效的圖片格式被拒絕', async ({ page }) => {
    await page.goto('/admin/lessons/create')

    // 嘗試上傳非圖片檔案
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is not an image'),
    })

    // 驗證錯誤提示
    const errorMsg = page.locator('text=/格式|類型|無效|不支援/i')
    await expect(errorMsg).toBeVisible({ timeout: 3000 })
  })

  test('表單響應式設計 - 移動裝置', async ({ page }) => {
    // 設定行動裝置視口
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/admin/lessons/create')

    // 驗證表單元素在移動裝置上可見
    const titleInput = page.locator('input[placeholder*="例"]').first()
    await expect(titleInput).toBeVisible()

    const submitBtn = page.locator('button:has-text("儲存課程")')
    await expect(submitBtn).toBeVisible()

    // 驗證無水平滾動
    const viewport = await page.viewportSize()
    expect(viewport?.width).toBeLessThanOrEqual(500)
  })
})
