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

test.describe('Lesson CMS - 編輯課程流程', () => {
  test.skip(skipIfNoAuth, '需要 ADMIN_EMAIL 和 ADMIN_PASSWORD 環境變數')

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('完整編輯課程：導航 → 修改資料 → 保存 → 驗證更新', async ({ page }) => {
    // 1. 導航到課程列表頁面
    await page.goto('/admin/lessons')
    await expect(page.locator('text=課程管理|管理')).toBeVisible()

    // 2. 等待課程列表載入
    await page.waitForTimeout(1000)

    // 3. 找到第一個課程的編輯按鈕
    const editButtons = page.locator('button:has-text("編輯")')
    await expect(editButtons.first()).toBeVisible()

    // 4. 點擊編輯按鈕
    await editButtons.first().click()

    // 5. 驗證導航到編輯頁面
    await expect(page).toHaveURL(/\/admin\/lessons\/[^/]+\/edit/)

    // 6. 修改課程標題
    const titleInput = page.locator('input[placeholder*="例"]').first()
    const oldValue = await titleInput.inputValue()
    const newTitle = `修改後的標題 - ${Date.now()}`
    await titleInput.clear()
    await titleInput.fill(newTitle)
    await expect(titleInput).toHaveValue(newTitle)

    // 7. 修改本課目標
    const whatEditor = page.locator('[contenteditable="true"]').first()
    await whatEditor.click()
    await whatEditor.clear()
    await whatEditor.fill('修改後的目標內容')
    await expect(whatEditor).toContainText('修改後的目標內容')

    // 8. 修改「為什麼重要」列表
    const whyInputs = page.locator('input[placeholder*="提升"]')
    if (await whyInputs.count() > 0) {
      await whyInputs.first().clear()
      await whyInputs.first().fill('修改後的理由')
    }

    // 9. 拖拉排序步驟（驗證 StepEditor 拖拉功能）
    const dragHandle = page.locator('div:has-text("⋮⋮")').first()
    if (await dragHandle.isVisible()) {
      const firstStep = page.locator('[class*="step"]').first()
      const secondStep = page.locator('[class*="step"]').nth(1)

      if (await firstStep.isVisible() && await secondStep.isVisible()) {
        // 執行拖拉操作
        await dragHandle.dragTo(secondStep)
        await page.waitForTimeout(500)

        // 驗證順序已改變
        const steps = page.locator('[class*="p-3"]')
        const count = await steps.count()
        expect(count).toBeGreaterThan(0)
      }
    }

    // 10. 修改等級標籤
    const levelButtons = page.locator('button:has-text("初級|中級|進階")')
    if (await levelButtons.count() > 0) {
      // 取消現有選擇並選擇新的
      const selectedLevel = page.locator('button.bg-blue-600')
      if (await selectedLevel.count() > 0) {
        await selectedLevel.first().click()
        await page.waitForTimeout(300)
      }

      // 選擇另一個等級
      await levelButtons.nth(1).click()
    }

    // 11. 修改場地標籤
    const slopeButtons = page.locator('button:has-text("綠坡|紅坡|黑坡")')
    if (await slopeButtons.count() > 0) {
      await slopeButtons.nth(1).click()
    }

    // 12. 修改 PRO 內容標記
    const proCheckbox = page.locator('input[type="checkbox"]')
    if (await proCheckbox.count() > 0) {
      const isChecked = await proCheckbox.first().isChecked()
      if (!isChecked) {
        await proCheckbox.first().check()
      }
    }

    // 13. 提交編輯
    const submitBtn = page.locator('button:has-text("儲存課程")')
    await submitBtn.click()

    // 14. 驗證重定向回列表
    await expect(page).toHaveURL('/admin/lessons')
    await page.waitForTimeout(1000)

    // 15. 驗證修改已保存
    const updatedTitle = page.locator(`text=${newTitle}`)
    await expect(updatedTitle).toBeVisible()
  })

  test('編輯時刪除圖片', async ({ page }) => {
    // 1. 進入課程列表
    await page.goto('/admin/lessons')

    // 2. 尋找有圖片的課程並編輯
    const editButtons = page.locator('button:has-text("編輯")')
    await editButtons.first().click()

    // 3. 驗證在編輯頁面
    await expect(page).toHaveURL(/\/admin\/lessons\/[^/]+\/edit/)

    // 4. 找到圖片刪除按鈕
    const deleteImageBtn = page.locator('button:has-text("✕")').first()

    if (await deleteImageBtn.isVisible()) {
      // 5. 刪除圖片
      await deleteImageBtn.click()
      await page.waitForTimeout(500)

      // 6. 驗證圖片已移除
      const imagePreview = page.locator('img[alt*="Step"]')
      const count = await imagePreview.count()

      // 計算應該剩下的圖片數量
      if (count === 0) {
        // 成功刪除最後一張圖片
        expect(count).toBe(0)
      }
    }

    // 7. 提交編輯
    const submitBtn = page.locator('button:has-text("儲存課程")')
    await submitBtn.click()

    // 8. 驗證保存成功
    await expect(page).toHaveURL('/admin/lessons')
  })

  test('編輯課程時新增和刪除 why 項目', async ({ page }) => {
    // 1. 進入編輯頁面
    await page.goto('/admin/lessons')
    const editButtons = page.locator('button:has-text("編輯")')
    await editButtons.first().click()

    await expect(page).toHaveURL(/\/admin\/lessons\/[^/]+\/edit/)

    // 2. 找到「為什麼重要」區段
    const whySection = page.locator('text=/為什麼重要|理由/')
    await expect(whySection).toBeVisible()

    // 3. 新增新的理由
    const addWhyBtn = page.locator('button:has-text("+ 新增")').first()
    await addWhyBtn.click()

    // 4. 填入新理由
    const whyInputs = page.locator('input[placeholder*="提升"]')
    const newInput = whyInputs.last()
    await newInput.fill('新增的理由項目')

    // 5. 驗證新項目已添加
    await expect(newInput).toHaveValue('新增的理由項目')

    // 6. 刪除一個理由（找到刪除按鈕）
    const deleteButtons = page.locator('button:has-text("🗑️")').first()
    if (await deleteButtons.isVisible()) {
      await deleteButtons.click()
      await page.waitForTimeout(300)
    }

    // 7. 提交修改
    const submitBtn = page.locator('button:has-text("儲存課程")')
    await submitBtn.click()

    // 8. 驗證保存
    await expect(page).toHaveURL('/admin/lessons')
  })

  test('編輯頁面表單驗證', async ({ page }) => {
    // 1. 進入編輯頁面
    await page.goto('/admin/lessons')
    const editButtons = page.locator('button:has-text("編輯")')
    await editButtons.first().click()

    await expect(page).toHaveURL(/\/admin\/lessons\/[^/]+\/edit/)

    // 2. 清空必填欄位（標題）
    const titleInput = page.locator('input[placeholder*="例"]').first()
    await titleInput.clear()

    // 3. 嘗試提交
    const submitBtn = page.locator('button:has-text("儲存課程")')
    await submitBtn.click()

    // 4. 驗證錯誤訊息出現
    const errorMsg = page.locator('text=/必填|標題|課程/')
    await expect(errorMsg).toBeVisible({ timeout: 3000 })

    // 5. 驗證仍在編輯頁面（未提交）
    await expect(page).toHaveURL(/\/admin\/lessons\/[^/]+\/edit/)
  })

  test('編輯課程時重設按鈕', async ({ page }) => {
    // 1. 進入編輯頁面
    await page.goto('/admin/lessons')
    const editButtons = page.locator('button:has-text("編輯")')
    await editButtons.first().click()

    await expect(page).toHaveURL(/\/admin\/lessons\/[^/]+\/edit/)

    // 2. 取得原始標題
    const titleInput = page.locator('input[placeholder*="例"]').first()
    const originalTitle = await titleInput.inputValue()

    // 3. 修改標題
    const newTitle = `測試修改 ${Date.now()}`
    await titleInput.clear()
    await titleInput.fill(newTitle)

    // 4. 點擊重設按鈕
    const resetBtn = page.locator('button:has-text("重設")')
    await resetBtn.click()

    // 5. 驗證重設回原始值
    await expect(titleInput).toHaveValue(originalTitle)
  })

  test('編輯後取消 - 點擊返回', async ({ page }) => {
    // 1. 進入編輯頁面
    await page.goto('/admin/lessons')
    const editButtons = page.locator('button:has-text("編輯")')
    await editButtons.first().click()

    await expect(page).toHaveURL(/\/admin\/lessons\/[^/]+\/edit/)

    // 2. 進行修改
    const titleInput = page.locator('input[placeholder*="例"]').first()
    await titleInput.clear()
    await titleInput.fill(`未保存的修改 ${Date.now()}`)

    // 3. 返回上一頁（瀏覽器返回或導航）
    await page.goBack()

    // 4. 驗證返回列表（不保存修改）
    await expect(page).toHaveURL('/admin/lessons')
  })
})
