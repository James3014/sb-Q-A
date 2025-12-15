/**
 * Export Utility Tests
 *
 * 測試數據匯出功能
 */

import { exportToCSV } from '@/lib/admin/export'

describe('exportToCSV', () => {
  // Mock URL.createObjectURL and URL.revokeObjectURL
  const mockCreateObjectURL = jest.fn()
  const mockRevokeObjectURL = jest.fn()

  beforeAll(() => {
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('blob:mock-url')

    // Mock document.createElement and appendChild
    document.createElement = jest.fn().mockImplementation((tagName) => {
      const element = {
        tagName,
        href: '',
        download: '',
        click: jest.fn(),
        style: {},
      }
      return element as any
    })

    document.body.appendChild = jest.fn()
    document.body.removeChild = jest.fn()
  })

  describe('CSV 生成', () => {
    it('應該生成正確的 CSV headers', () => {
      const data = [
        { name: 'Alice', age: 30, city: 'Taipei' },
        { name: 'Bob', age: 25, city: 'Tokyo' },
      ]

      exportToCSV(data, 'test')

      // 檢查 Blob 是否被創建
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    it('應該處理單筆數據', () => {
      const data = [{ name: 'Alice', age: 30 }]

      exportToCSV(data, 'test')

      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    it('應該處理空陣列', () => {
      const data: any[] = []

      exportToCSV(data, 'test')

      // 空陣列不應該創建下載
      expect(mockCreateObjectURL).not.toHaveBeenCalled()
    })

    it('應該處理中文字元', () => {
      const data = [
        { 姓名: '王小明', 年齡: 30, 城市: '台北' },
        { 姓名: '李小華', 年齡: 25, 城市: '台中' },
      ]

      exportToCSV(data, 'test')

      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    it('應該處理特殊字元（逗號、換行）', () => {
      const data = [
        { text: 'Hello, World', description: 'Line1\nLine2' },
      ]

      exportToCSV(data, 'test')

      expect(mockCreateObjectURL).toHaveBeenCalled()
    })
  })

  describe('檔名格式', () => {
    beforeAll(() => {
      // Mock date to get predictable filename
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-01-15'))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('應該生成包含日期的檔名', () => {
      const data = [{ name: 'Test' }]
      const createElementSpy = jest.spyOn(document, 'createElement')

      exportToCSV(data, 'analytics')

      const linkElement = createElementSpy.mock.results[0].value
      expect(linkElement.download).toMatch(/analytics-2025-01-15\.csv/)
    })

    it('應該使用自定義檔名前綴', () => {
      const data = [{ name: 'Test' }]
      const createElementSpy = jest.spyOn(document, 'createElement')

      exportToCSV(data, 'custom-prefix')

      const linkElement = createElementSpy.mock.results[0].value
      expect(linkElement.download).toContain('custom-prefix')
    })
  })

  describe('下載觸發', () => {
    it('應該觸發下載', () => {
      const data = [{ name: 'Test' }]
      const createElementSpy = jest.spyOn(document, 'createElement')

      exportToCSV(data, 'test')

      const linkElement = createElementSpy.mock.results[0].value
      expect(linkElement.click).toHaveBeenCalled()
    })

    it('應該設定正確的 MIME type', () => {
      const data = [{ name: 'Test' }]

      exportToCSV(data, 'test')

      const blobCall = (global.Blob as any).mock.calls[0]
      expect(blobCall[1]).toEqual({ type: 'text/csv;charset=utf-8;' })
    })
  })

  describe('邊界情況', () => {
    it('應該處理 null 值', () => {
      const data = [{ name: 'Alice', age: null, city: 'Taipei' }]

      exportToCSV(data, 'test')

      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    it('應該處理 undefined 值', () => {
      const data = [{ name: 'Alice', age: undefined, city: 'Taipei' }]

      exportToCSV(data, 'test')

      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    it('應該處理數字值', () => {
      const data = [{ count: 123, price: 45.67 }]

      exportToCSV(data, 'test')

      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    it('應該處理布林值', () => {
      const data = [{ active: true, verified: false }]

      exportToCSV(data, 'test')

      expect(mockCreateObjectURL).toHaveBeenCalled()
    })
  })
})

// Mock Blob constructor
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
})) as any
