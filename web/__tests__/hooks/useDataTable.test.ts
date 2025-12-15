/**
 * useDataTable Hook Tests
 * 測試統一表格邏輯的所有功能
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { useDataTable, UseDataTableOptions } from '@/hooks/useDataTable'

// 測試數據類型
interface TestItem {
  id: number
  name: string
  age: number
  category: string
}

// Mock 數據
const mockData: TestItem[] = [
  { id: 1, name: 'Alice', age: 25, category: 'A' },
  { id: 2, name: 'Bob', age: 30, category: 'B' },
  { id: 3, name: 'Charlie', age: 35, category: 'A' },
  { id: 4, name: 'David', age: 40, category: 'C' },
  { id: 5, name: 'Eve', age: 28, category: 'B' },
  { id: 6, name: 'Frank', age: 32, category: 'A' },
  { id: 7, name: 'Grace', age: 27, category: 'C' },
  { id: 8, name: 'Henry', age: 33, category: 'B' }
]

describe('useDataTable', () => {
  describe('客戶端模式 (client mode)', () => {
    it('應該初始加載數據', async () => {
      const mockFetchFn = jest.fn().mockResolvedValue({ data: mockData })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client',
          pageSize: 5
        })
      )

      // 初始狀態應該是 loading
      expect(result.current.loading).toBe(true)

      // 等待數據加載
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockFetchFn).toHaveBeenCalledTimes(1)
      expect(result.current.data).toHaveLength(5) // 第一頁，5 條數據
      expect(result.current.stats.total).toBe(8)
      expect(result.current.stats.filtered).toBe(8)
      expect(result.current.error).toBeNull()
    })

    it('應該支持客戶端篩選', async () => {
      const mockFetchFn = jest.fn().mockResolvedValue({ data: mockData })

      const clientFilterFn = (item: TestItem, filter: Record<string, any>) => {
        if (filter.category) {
          return item.category === filter.category
        }
        return true
      }

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client',
          clientFilterFn,
          pageSize: 10
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // 應用篩選
      act(() => {
        result.current.actions.setFilter({ category: 'A' })
      })

      // 篩選後應該只有 category='A' 的數據
      await waitFor(() => {
        expect(result.current.data).toHaveLength(3)
        expect(result.current.stats.filtered).toBe(3)
        expect(result.current.data.every(item => item.category === 'A')).toBe(
          true
        )
      })
    })

    it('應該支持客戶端排序', async () => {
      const mockFetchFn = jest.fn().mockResolvedValue({ data: mockData })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client',
          pageSize: 10
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // 按年齡升序排序
      act(() => {
        result.current.actions.setSort('age', 'asc')
      })

      await waitFor(() => {
        expect(result.current.data[0]?.age).toBe(25) // Alice
        expect(result.current.data[1]?.age).toBe(27) // Grace
      })

      // 改為降序
      act(() => {
        result.current.actions.setSort('age', 'desc')
      })

      await waitFor(() => {
        expect(result.current.data[0]?.age).toBe(40) // David
        expect(result.current.data[1]?.age).toBe(35) // Charlie
      })
    })

    it('應該支持客戶端分頁', async () => {
      const mockFetchFn = jest.fn().mockResolvedValue({ data: mockData })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client',
          pageSize: 3
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // 第一頁
      expect(result.current.data).toHaveLength(3)
      expect(result.current.state.pagination.page).toBe(1)
      expect(result.current.stats.pageCount).toBe(3) // 8 items / 3 per page = 3 pages

      // 切換到第二頁
      act(() => {
        result.current.actions.setPage(2)
      })

      await waitFor(() => {
        expect(result.current.data).toHaveLength(3)
        expect(result.current.data[0]?.id).toBe(4) // David
      })

      // 切換到第三頁
      act(() => {
        result.current.actions.setPage(3)
      })

      await waitFor(() => {
        expect(result.current.data).toHaveLength(2) // 最後一頁只有 2 條
      })
    })

    it('應該支持修改每頁條目數', async () => {
      const mockFetchFn = jest.fn().mockResolvedValue({ data: mockData })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client',
          pageSize: 3
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toHaveLength(3)
      expect(result.current.stats.pageCount).toBe(3)

      // 修改每頁條目數
      act(() => {
        result.current.actions.setPageSize(5)
      })

      await waitFor(() => {
        expect(result.current.data).toHaveLength(5)
        expect(result.current.stats.pageCount).toBe(2) // 8 / 5 = 2 pages
        expect(result.current.state.pagination.page).toBe(1) // 應重置到第一頁
      })
    })

    it('應該支持組合篩選和排序', async () => {
      const mockFetchFn = jest.fn().mockResolvedValue({ data: mockData })

      const clientFilterFn = (item: TestItem, filter: Record<string, any>) => {
        if (filter.category) {
          return item.category === filter.category
        }
        return true
      }

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client',
          clientFilterFn,
          pageSize: 10
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // 篩選 category='A' 並按年齡降序排序
      act(() => {
        result.current.actions.setFilter({ category: 'A' })
        result.current.actions.setSort('age', 'desc')
      })

      await waitFor(() => {
        expect(result.current.data).toHaveLength(3)
        expect(result.current.data[0]?.age).toBe(35) // Charlie
        expect(result.current.data[1]?.age).toBe(32) // Frank
        expect(result.current.data[2]?.age).toBe(25) // Alice
      })
    })

    it('應該支持 refresh 操作', async () => {
      let dataVersion = 1
      const mockFetchFn = jest.fn(() => {
        const data = dataVersion === 1 ? mockData : [...mockData].reverse()
        return Promise.resolve({ data })
      })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client',
          pageSize: 10
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const firstId = result.current.data[0].id
      expect(mockFetchFn).toHaveBeenCalledTimes(1)

      // 改變數據版本並刷新
      dataVersion = 2
      await act(async () => {
        await result.current.actions.refresh()
      })

      await waitFor(() => {
        expect(result.current.data[0].id).not.toBe(firstId)
      })
      expect(mockFetchFn).toHaveBeenCalledTimes(2)
    })

    it('應該支持 reset 操作', async () => {
      const mockFetchFn = jest.fn().mockResolvedValue({ data: mockData })

      const clientFilterFn = (item: TestItem, filter: Record<string, any>) => {
        if (filter.category) {
          return item.category === filter.category
        }
        return true
      }

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client',
          clientFilterFn,
          initialFilter: {},
          initialSort: { field: 'id', order: 'asc' },
          pageSize: 3
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // 修改狀態
      act(() => {
        result.current.actions.setFilter({ category: 'A' })
        result.current.actions.setSort('age', 'desc')
        result.current.actions.setPage(2)
      })

      await waitFor(() => {
        expect(result.current.state.filter.category).toBe('A')
        expect(result.current.state.sort?.field).toBe('age')
        expect(result.current.state.pagination.page).toBe(2)
      })

      // 重置
      await act(async () => {
        result.current.actions.reset()
      })

      await waitFor(() => {
        expect(result.current.state.filter).toEqual({})
        expect(result.current.state.sort?.field).toBe('id')
        expect(result.current.state.pagination.page).toBe(1)
      })
    })
  })

  describe('伺服器端模式 (server mode)', () => {
    it('應該將篩選參數傳給 fetchFn', async () => {
      const mockFetchFn = jest
        .fn()
        .mockResolvedValue({ data: mockData.slice(0, 3), total: 3 })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'server',
          pageSize: 10
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // 設置篩選
      act(() => {
        result.current.actions.setFilter({ category: 'A' })
      })

      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenLastCalledWith(
          expect.objectContaining({
            filter: { category: 'A' }
          })
        )
      })
    })

    it('應該將排序參數傳給 fetchFn', async () => {
      const mockFetchFn = jest
        .fn()
        .mockResolvedValue({ data: mockData, total: 8 })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'server',
          pageSize: 10
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // 設置排序
      act(() => {
        result.current.actions.setSort('age', 'desc')
      })

      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sort: { field: 'age', order: 'desc' }
          })
        )
      })
    })

    it('應該將分頁參數傳給 fetchFn', async () => {
      const mockFetchFn = jest
        .fn()
        .mockResolvedValue({ data: mockData.slice(0, 3), total: 8 })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'server',
          pageSize: 3
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockFetchFn).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            page: 1,
            pageSize: 3
          })
        })
      )

      // 切換頁碼
      act(() => {
        result.current.actions.setPage(2)
      })

      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenLastCalledWith(
          expect.objectContaining({
            pagination: expect.objectContaining({
              page: 2,
              pageSize: 3
            })
          })
        )
      })
    })

    it('應該使用伺服器返回的 total', async () => {
      const mockFetchFn = jest
        .fn()
        .mockResolvedValue({ data: mockData.slice(0, 5), total: 100 })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'server',
          pageSize: 5
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats.total).toBe(100)
      expect(result.current.stats.pageCount).toBe(20) // 100 / 5
    })
  })

  describe('錯誤處理', () => {
    it('應該捕獲並記錄錯誤', async () => {
      const mockError = new Error('Network error')
      const mockFetchFn = jest.fn().mockRejectedValue(mockError)

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client'
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.message).toContain('Failed to load data')
      expect(result.current.data).toHaveLength(0)
    })

    it('應該在錯誤後允許重試', async () => {
      let callCount = 0
      const mockFetchFn = jest.fn(() => {
        callCount++
        if (callCount === 1) {
          return Promise.reject(new Error('First call fails'))
        }
        return Promise.resolve({ data: mockData })
      })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client'
        })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).not.toBeNull()

      // 重試
      await act(async () => {
        await result.current.actions.refresh()
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
        expect(result.current.data.length).toBeGreaterThan(0)
      })
    })
  })

  describe('自動加載控制', () => {
    it('autoLoad=false 時不應自動加載', async () => {
      const mockFetchFn = jest.fn().mockResolvedValue({ data: mockData })

      const { result } = renderHook(() =>
        useDataTable({
          fetchFn: mockFetchFn,
          filterMode: 'client',
          autoLoad: false
        })
      )

      // 不應該自動調用
      await waitFor(() => {
        expect(mockFetchFn).not.toHaveBeenCalled()
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.data).toHaveLength(0)

      // 手動刷新
      await act(async () => {
        await result.current.actions.refresh()
      })

      await waitFor(() => {
        expect(mockFetchFn).toHaveBeenCalledTimes(1)
        expect(result.current.data.length).toBeGreaterThan(0)
      })
    })
  })
})
