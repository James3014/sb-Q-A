# 課程內容管理系統 (Lesson CMS) - TDD 測試規格

## 測試金字塔結構

```
Unit Tests (80%)           → 快速、隔離、高覆蓋
  ├── Services: validationService, lessonService, imageService
  ├── Repositories: lessonRepository, imageRepository
  └── Hooks: useLessonForm, useImageUpload, useFormValidation

Integration Tests (15%)    → 測試模組協作
  ├── API routes: POST/PATCH/DELETE /api/admin/lessons
  ├── Image upload: POST /api/admin/upload
  └── End-to-end workflow: create lesson + images

E2E Tests (5%)             → 真實使用者行為
  ├── Login → Create lesson → Verify in list
  ├── Edit lesson → Upload image → Publish
  └── Delete lesson → Verify removed
```

---

## Phase 1: Unit Tests (Core Services & Repositories)

### 1.1 validationService.test.ts

```typescript
describe('validationService', () => {
  describe('validateLessonInput', () => {
    it('should pass for valid lesson input', () => {
      const input: CreateLessonInput = {
        title: '單板轉向',
        what: '如何做出完美轉向',
        why: ['改善平衡', '控制速度'],
        how: [{ text: '步驟1', image: 'url1' }],
        signals: { correct: ['感受到邊刃'], wrong: [] },
        level_tags: ['beginner'],
        slope_tags: ['green'],
        is_premium: false,
      }

      const result = validationService.validateLessonInput(input)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should fail when title is empty', () => {
      const input = { ...validInput, title: '' }
      const result = validationService.validateLessonInput(input)

      expect(result.valid).toBe(false)
      expect(result.errors.title).toBeDefined()
    })

    it('should fail when level_tags is empty', () => {
      const input = { ...validInput, level_tags: [] }
      const result = validationService.validateLessonInput(input)

      expect(result.valid).toBe(false)
      expect(result.errors.level_tags).toBeDefined()
    })

    it('should fail when how array is empty', () => {
      const input = { ...validInput, how: [] }
      const result = validationService.validateLessonInput(input)

      expect(result.valid).toBe(false)
      expect(result.errors.how).toBeDefined()
    })

    it('should validate title length (min 3, max 100)', () => {
      const tooShort = { ...validInput, title: '轉向' }
      const tooLong = { ...validInput, title: 'a'.repeat(101) }

      expect(validationService.validateLessonInput(tooShort).valid).toBe(false)
      expect(validationService.validateLessonInput(tooLong).valid).toBe(false)
    })
  })

  describe('validateImageFile', () => {
    it('should accept jpg, png, webp formats', () => {
      const jpgFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' })
      const pngFile = new File(['content'], 'image.png', { type: 'image/png' })
      const webpFile = new File(['content'], 'image.webp', { type: 'image/webp' })

      expect(validationService.validateImageFile(jpgFile).valid).toBe(true)
      expect(validationService.validateImageFile(pngFile).valid).toBe(true)
      expect(validationService.validateImageFile(webpFile).valid).toBe(true)
    })

    it('should reject non-image formats', () => {
      const txtFile = new File(['content'], 'file.txt', { type: 'text/plain' })
      const result = validationService.validateImageFile(txtFile)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('不支援的檔案格式')
    })

    it('should reject files larger than 5MB', () => {
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      })
      const result = validationService.validateImageFile(largeFile)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('檔案過大')
    })
  })

  describe('validateArrayField', () => {
    it('should reject empty array', () => {
      const result = validationService.validateArrayField([])
      expect(result.valid).toBe(false)
    })

    it('should reject array with empty strings', () => {
      const result = validationService.validateArrayField(['item1', '', 'item3'])
      expect(result.valid).toBe(false)
    })

    it('should pass for valid non-empty array', () => {
      const result = validationService.validateArrayField(['item1', 'item2'])
      expect(result.valid).toBe(true)
    })
  })
})
```

### 1.2 imageService.test.ts

```typescript
describe('imageService', () => {
  let mockCanvas: HTMLCanvasElement

  beforeEach(() => {
    mockCanvas = document.createElement('canvas')
    jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas)
  })

  describe('compressImage', () => {
    it('should compress image to max 1200px width', async () => {
      const file = new File(['content'], 'large.jpg', { type: 'image/jpeg' })

      // Mock canvas
      const mockContext = {
        drawImage: jest.fn(),
        canvas: { toBlob: jest.fn() },
      }
      mockCanvas.getContext = jest.fn().mockReturnValue(mockContext)

      await imageService.compressImage(file)

      expect(mockContext.drawImage).toHaveBeenCalled()
      // 驗證寬度計算: width <= 1200
    })

    it('should return compressed file with same name', async () => {
      const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' })
      const compressed = await imageService.compressImage(file)

      expect(compressed.name).toBe('image.jpg')
      expect(compressed.type).toBe('image/jpeg')
    })
  })

  describe('validateImageFile', () => {
    it('should validate file type and size', () => {
      const validFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' })
      const result = imageService.validateImageFile(validFile)

      expect(result.valid).toBe(true)
    })
  })

  describe('uploadAndLink', () => {
    it('should upload image and return URL', async () => {
      const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' })
      const lessonId = 'L-123'
      const stepIndex = 0

      const mockUrl = 'https://storage.example.com/lessons/L-123/step-0.jpg'
      jest.spyOn(imageRepository, 'uploadImage').mockResolvedValue(mockUrl)

      const result = await imageService.uploadAndLink(file, lessonId, stepIndex)

      expect(result).toBe(mockUrl)
      expect(imageRepository.uploadImage).toHaveBeenCalledWith(
        expect.any(File),
        'lessons/L-123/step-0.jpg'
      )
    })

    it('should handle upload errors gracefully', async () => {
      const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' })

      jest.spyOn(imageRepository, 'uploadImage').mockRejectedValue(
        new Error('Network error')
      )

      await expect(imageService.uploadAndLink(file, 'L-123', 0)).rejects.toThrow(
        'Network error'
      )
    })
  })
})
```

### 1.3 lessonService.test.ts

```typescript
describe('lessonService', () => {
  describe('createLessonWithValidation', () => {
    it('should create lesson for valid input', async () => {
      const input: CreateLessonInput = validInput
      const mockLesson = { id: 'L-123', ...input, created_at: '2025-12-14T00:00:00Z' }

      jest.spyOn(validationService, 'validateLessonInput').mockReturnValue({
        valid: true,
        errors: {},
      })
      jest.spyOn(lessonRepository, 'createLesson').mockResolvedValue(mockLesson)

      const result = await lessonService.createLessonWithValidation(input)

      expect(result.id).toBe('L-123')
      expect(lessonRepository.createLesson).toHaveBeenCalledWith(input)
    })

    it('should throw ValidationError for invalid input', async () => {
      const input = { ...validInput, title: '' }

      jest.spyOn(validationService, 'validateLessonInput').mockReturnValue({
        valid: false,
        errors: { title: '課程標題為必填' },
      })

      await expect(lessonService.createLessonWithValidation(input)).rejects.toThrow(
        ValidationError
      )
    })
  })

  describe('updateLessonWithValidation', () => {
    it('should update existing lesson', async () => {
      const lessonId = 'L-123'
      const updateData = { title: '新標題' }
      const updated = { ...existingLesson, ...updateData }

      jest.spyOn(validationService, 'validateLessonInput').mockReturnValue({
        valid: true,
        errors: {},
      })
      jest.spyOn(lessonRepository, 'updateLesson').mockResolvedValue(updated)

      const result = await lessonService.updateLessonWithValidation(lessonId, updateData)

      expect(result.title).toBe('新標題')
      expect(lessonRepository.updateLesson).toHaveBeenCalledWith(lessonId, updateData)
    })

    it('should throw NotFoundError if lesson does not exist', async () => {
      const lessonId = 'NON-EXISTENT'

      jest.spyOn(lessonRepository, 'updateLesson').mockRejectedValue(
        new NotFoundError('Lesson')
      )

      await expect(lessonService.updateLessonWithValidation(lessonId, {})).rejects.toThrow(
        NotFoundError
      )
    })
  })

  describe('publishLesson', () => {
    it('should set is_published to true', async () => {
      const lessonId = 'L-123'

      jest.spyOn(lessonRepository, 'updateLesson').mockResolvedValue({
        ...existingLesson,
        is_published: true,
      })

      await lessonService.publishLesson(lessonId)

      expect(lessonRepository.updateLesson).toHaveBeenCalledWith(lessonId, {
        is_published: true,
      })
    })
  })

  describe('unpublishLesson', () => {
    it('should set is_published to false', async () => {
      const lessonId = 'L-123'

      jest.spyOn(lessonRepository, 'updateLesson').mockResolvedValue({
        ...existingLesson,
        is_published: false,
      })

      await lessonService.unpublishLesson(lessonId)

      expect(lessonRepository.updateLesson).toHaveBeenCalledWith(lessonId, {
        is_published: false,
      })
    })
  })
})
```

### 1.4 useLessonForm.test.ts (React Hooks)

```typescript
describe('useLessonForm', () => {
  it('should initialize form with empty state', () => {
    const { result } = renderHook(() => useLessonForm())

    expect(result.current.form).toEqual({
      title: '',
      what: '',
      why: [],
      how: [],
      signals: { correct: [], wrong: [] },
      level_tags: [],
      slope_tags: [],
      is_premium: false,
    })
  })

  it('should load existing lesson for edit mode', async () => {
    const mockLesson = { id: 'L-123', title: 'Test', ...validInput }

    jest.spyOn(lessonRepository, 'getLessonById').mockResolvedValue(mockLesson)

    const { result, waitForNextUpdate } = renderHook(() => useLessonForm('L-123'))
    await waitForNextUpdate()

    expect(result.current.form.title).toBe('Test')
  })

  it('should update form field', () => {
    const { result } = renderHook(() => useLessonForm())

    act(() => {
      result.current.setTitle('新課程')
    })

    expect(result.current.form.title).toBe('新課程')
  })

  it('should add step to how array', () => {
    const { result } = renderHook(() => useLessonForm())

    act(() => {
      result.current.addStep({ text: '步驟1', image: undefined })
    })

    expect(result.current.form.how).toHaveLength(1)
    expect(result.current.form.how[0].text).toBe('步驟1')
  })

  it('should remove step from how array', () => {
    const { result } = renderHook(() => useLessonForm())

    act(() => {
      result.current.addStep({ text: '步驟1' })
      result.current.addStep({ text: '步驟2' })
      result.current.removeStep(0)
    })

    expect(result.current.form.how).toHaveLength(1)
    expect(result.current.form.how[0].text).toBe('步驟2')
  })

  it('should reset form to initial state', () => {
    const { result } = renderHook(() => useLessonForm())

    act(() => {
      result.current.setTitle('課程')
      result.current.reset()
    })

    expect(result.current.form.title).toBe('')
  })

  it('should submit form and call onSuccess', async () => {
    const onSuccess = jest.fn()
    const { result } = renderHook(() => useLessonForm(undefined, onSuccess))

    jest.spyOn(lessonService, 'createLessonWithValidation').mockResolvedValue({
      id: 'L-123',
      ...validInput,
    })

    act(() => {
      result.current.setTitle('課程')
      result.current.setLevelTags(['beginner'])
      result.current.setHow([{ text: '步驟1' }])
    })

    await act(async () => {
      await result.current.submit()
    })

    expect(onSuccess).toHaveBeenCalled()
  })
})
```

---

## Phase 2: Integration Tests (API Routes)

### 2.1 POST /api/admin/lessons

```typescript
describe('POST /api/admin/lessons', () => {
  it('should create lesson with valid input', async () => {
    const body = validInput

    const response = await POST(createMockRequest(body), {})

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.ok).toBe(true)
    expect(data.lesson.id).toBeDefined()
  })

  it('should return 400 for invalid input', async () => {
    const body = { ...validInput, title: '' }

    const response = await POST(createMockRequest(body), {})

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.ok).toBe(false)
    expect(data.error).toBeDefined()
  })

  it('should return 401 for unauthorized user', async () => {
    const body = validInput
    const req = createMockRequest(body, { auth: null })

    const response = await POST(req, {})

    expect(response.status).toBe(401)
  })

  it('should return 403 for non-admin user', async () => {
    const body = validInput
    const req = createMockRequest(body, { auth: { is_admin: false } })

    const response = await POST(req, {})

    expect(response.status).toBe(403)
  })
})
```

### 2.2 PATCH /api/admin/lessons/[id]

```typescript
describe('PATCH /api/admin/lessons/[id]', () => {
  it('should update existing lesson', async () => {
    const lessonId = 'L-123'
    const updateData = { title: '新標題' }

    const response = await PATCH(createMockRequest(updateData), {
      params: { id: lessonId },
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.lesson.title).toBe('新標題')
  })

  it('should return 404 for non-existent lesson', async () => {
    const lessonId = 'NON-EXISTENT'

    const response = await PATCH(createMockRequest({}), {
      params: { id: lessonId },
    })

    expect(response.status).toBe(404)
  })
})
```

### 2.3 DELETE /api/admin/lessons/[id]

```typescript
describe('DELETE /api/admin/lessons/[id]', () => {
  it('should soft delete lesson', async () => {
    const lessonId = 'L-123'

    const response = await DELETE(createMockRequest(), {
      params: { id: lessonId },
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.ok).toBe(true)
  })

  it('should return 404 if lesson not found', async () => {
    const response = await DELETE(createMockRequest(), {
      params: { id: 'NON-EXISTENT' },
    })

    expect(response.status).toBe(404)
  })
})
```

### 2.4 POST /api/admin/upload

```typescript
describe('POST /api/admin/upload', () => {
  it('should upload image and return URL', async () => {
    const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('lessonId', 'L-123')
    formData.append('stepIndex', '0')

    const response = await POST(createMockRequest(formData), {})

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.url).toBeDefined()
    expect(data.path).toBe('lessons/L-123/step-0.jpg')
  })

  it('should reject invalid file type', async () => {
    const file = new File(['content'], 'file.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', file)

    const response = await POST(createMockRequest(formData), {})

    expect(response.status).toBe(400)
  })

  it('should reject file larger than 5MB', async () => {
    const file = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    })
    const formData = new FormData()
    formData.append('file', file)

    const response = await POST(createMockRequest(formData), {})

    expect(response.status).toBe(400)
  })
})
```

---

## Phase 3: E2E Tests (User Workflows)

### 3.1 Playwright: Complete lesson creation flow

```typescript
test('User can create, edit, and publish lesson', async ({ page, context }) => {
  // Login
  await page.goto('/admin/lessons')
  await expect(page).toHaveTitle(/Admin/)

  // Navigate to create
  await page.click('button:has-text("新增課程")')
  await expect(page).toHaveURL('/admin/lessons/create')

  // Fill form
  await page.fill('input[name="title"]', '轉向教學')
  await page.fill('textarea[name="what"]', '如何在單板上做出完美轉向')

  // Add steps
  await page.click('button:has-text("新增步驟")')
  await page.fill('[data-test="step-0-text"]', '步驟1: 邊刃準備')

  // Upload image
  const fileInput = await page.$('input[type="file"]')
  await fileInput?.setInputFiles('./test-image.jpg')
  await page.waitForSelector('[data-test="image-preview"]')

  // Add tags
  await page.click('button[data-tag="beginner"]')
  await page.click('button[data-tag="green"]')

  // Submit
  await page.click('button:has-text("建立課程")')
  await page.waitForURL('/admin/lessons')

  // Verify in list
  await expect(page.locator('text=轉向教學')).toBeVisible()
})
```

---

## 測試執行順序

### Day 1-2: Unit Tests (80%)
```bash
npm test -- services/  # validationService, imageService, lessonService
npm test -- repositories/  # lessonRepository, imageRepository
npm test -- hooks/  # useLessonForm, useImageUpload, useFormValidation
```

### Day 3: Integration Tests (15%)
```bash
npm test -- integration/api/  # API route tests
npm test -- integration/workflows/  # Combined operations
```

### Day 4: E2E Tests (5%)
```bash
npx playwright test  # Full user workflows
```

---

## 覆蓋率目標

- **Overall**: > 80%
- **Services**: > 90%
- **Repositories**: > 85%
- **Components**: > 70% (不含純 UI)
- **Hooks**: > 85%
- **API Routes**: > 80%

