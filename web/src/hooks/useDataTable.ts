/**
 * useDataTable Hook
 * 統一的表格/列表邏輯管理
 *
 * 設計目標:
 * 1. 單一數據源原則
 * 2. 支持前端/後端篩選
 * 3. 內建錯誤處理和重試
 * 4. 真正的分頁支持
 * 5. 可選的排序和搜尋
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { logger } from '@/lib/logging'
import { AppError } from '@/lib/errors'

/**
 * 篩選模式
 */
export type FilterMode = 'client' | 'server'

/**
 * 排序配置
 */
export interface SortConfig {
  field: string
  order: 'asc' | 'desc'
}

/**
 * 分頁配置
 */
export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
}

/**
 * 篩選配置 (可擴展的字典)
 */
export type FilterConfig = Record<string, any>

/**
 * Hook 配置
 */
export interface UseDataTableOptions<T> {
  /**
   * 數據獲取函數
   * @param params - 包含 filter, sort, pagination 的參數
   * @returns 數據數組和可選的總數
   */
  fetchFn: (params: {
    filter?: FilterConfig
    sort?: SortConfig
    pagination?: PaginationConfig
  }) => Promise<{ data: T[]; total?: number }>

  /**
   * 篩選模式 (默認: 'client')
   * - 'client': 在前端記憶體中篩選 (適合小數據集)
   * - 'server': 通過 API 參數篩選 (適合大數據集)
   */
  filterMode?: FilterMode

  /**
   * 初始篩選條件
   */
  initialFilter?: FilterConfig

  /**
   * 初始排序
   */
  initialSort?: SortConfig

  /**
   * 每頁條目數 (默認: 20)
   */
  pageSize?: number

  /**
   * 客戶端篩選函數 (filterMode='client' 時使用)
   * @param item - 單個數據項
   * @param filter - 當前篩選條件
   * @returns 是否匹配篩選條件
   */
  clientFilterFn?: (item: T, filter: FilterConfig) => boolean

  /**
   * 客戶端排序函數 (可選，默認使用簡單比較)
   * @param a - 數據項 A
   * @param b - 數據項 B
   * @param sort - 排序配置
   * @returns 排序比較結果
   */
  clientSortFn?: (a: T, b: T, sort: SortConfig) => number

  /**
   * 是否自動加載 (默認: true)
   */
  autoLoad?: boolean

  /**
   * 依賴項 (當這些值變化時重新加載)
   */
  deps?: any[]
}

/**
 * Hook 返回值
 */
export interface UseDataTableReturn<T> {
  // 數據狀態
  data: T[]
  loading: boolean
  error: AppError | null

  // UI 狀態
  state: {
    filter: FilterConfig
    sort: SortConfig | null
    pagination: PaginationConfig
    search: string
  }

  // 操作方法
  actions: {
    setFilter: (filter: FilterConfig) => void
    setSort: (field: string, order?: 'asc' | 'desc') => void
    setPage: (page: number) => void
    setPageSize: (pageSize: number) => void
    setSearch: (query: string) => void
    refresh: () => Promise<void>
    reset: () => void
  }

  // 統計信息
  stats: {
    total: number
    filtered: number
    pageCount: number
  }
}

/**
 * useDataTable Hook
 */
export function useDataTable<T>(
  options: UseDataTableOptions<T>
): UseDataTableReturn<T> {
  const {
    fetchFn,
    filterMode = 'client',
    initialFilter = {},
    initialSort,
    pageSize: initialPageSize = 20,
    clientFilterFn,
    clientSortFn,
    autoLoad = true,
    deps = []
  } = options

  // 狀態管理
  const [rawData, setRawData] = useState<T[]>([])
  const [loading, setLoading] = useState(autoLoad)
  const [error, setError] = useState<AppError | null>(null)

  // UI 狀態
  const [filter, setFilter] = useState<FilterConfig>(initialFilter)
  const [sort, setSort] = useState<SortConfig | null>(initialSort || null)
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: initialPageSize,
    total: 0
  })
  const [search, setSearch] = useState('')

  /**
   * 加載數據
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: Parameters<typeof fetchFn>[0] = {}

      // 伺服器端模式：傳遞所有參數
      if (filterMode === 'server') {
        if (Object.keys(filter).length > 0) params.filter = filter
        if (sort) params.sort = sort
        params.pagination = pagination
      }

      logger.info('useDataTable: Loading data', {
        filterMode,
        params
      })

      const result = await fetchFn(params)
      setRawData(result.data)

      // 更新總數 (伺服器端模式)
      if (filterMode === 'server' && result.total !== undefined) {
        setPagination(prev => ({ ...prev, total: result.total! }))
      } else if (filterMode === 'client') {
        // 客戶端模式：總數為原始數據長度
        setPagination(prev => ({ ...prev, total: result.data.length }))
      }

      logger.info('useDataTable: Data loaded successfully', {
        count: result.data.length,
        total: result.total
      })
    } catch (err) {
      const appError =
        err instanceof AppError
          ? err
          : new AppError(
              'Failed to load data',
              'DATA_LOAD_ERROR' as any, // ErrorCode
              err as any
            )
      setError(appError)
      logger.error('useDataTable: Failed to load data', err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, filterMode, filter, sort, pagination.page, pagination.pageSize])

  /**
   * 客戶端篩選
   */
  const filteredData = useMemo(() => {
    if (filterMode === 'server') {
      // 伺服器端模式：直接使用原始數據
      return rawData
    }

    let result = rawData

    // 應用篩選
    if (clientFilterFn && Object.keys(filter).length > 0) {
      result = result.filter(item => clientFilterFn(item, filter))
    }

    // 應用搜尋 (如果設置了 search)
    // 注意：這需要 clientFilterFn 處理 search 參數
    // 或者在這裡實現通用的搜尋邏輯

    return result
  }, [rawData, filter, search, filterMode, clientFilterFn])

  /**
   * 客戶端排序
   */
  const sortedData = useMemo(() => {
    if (filterMode === 'server' || !sort) {
      return filteredData
    }

    const sorted = [...filteredData]

    if (clientSortFn) {
      sorted.sort((a, b) => clientSortFn(a, b, sort))
    } else {
      // 默認排序邏輯
      sorted.sort((a, b) => {
        const aVal = (a as any)[sort.field]
        const bVal = (b as any)[sort.field]

        if (aVal === bVal) return 0

        const comparison = aVal < bVal ? -1 : 1
        return sort.order === 'asc' ? comparison : -comparison
      })
    }

    return sorted
  }, [filteredData, sort, filterMode, clientSortFn])

  /**
   * 客戶端分頁
   */
  const paginatedData = useMemo(() => {
    if (filterMode === 'server') {
      // 伺服器端模式：數據已經分頁
      return sortedData
    }

    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return sortedData.slice(start, end)
  }, [sortedData, pagination.page, pagination.pageSize, filterMode])

  /**
   * 統計信息
   */
  const stats = useMemo(() => {
    const filtered =
      filterMode === 'client' ? filteredData.length : pagination.total
    const total = filterMode === 'client' ? rawData.length : pagination.total

    return {
      total,
      filtered,
      pageCount: Math.ceil(filtered / pagination.pageSize) || 1
    }
  }, [
    rawData.length,
    filteredData.length,
    pagination.total,
    pagination.pageSize,
    filterMode
  ])

  /**
   * 操作方法
   */
  const actions = useMemo(
    () => ({
      setFilter: (newFilter: FilterConfig) => {
        setFilter(newFilter)
        setPagination(prev => ({ ...prev, page: 1 })) // 重置頁碼
      },

      setSort: (field: string, order: 'asc' | 'desc' = 'desc') => {
        setSort({ field, order })
        setPagination(prev => ({ ...prev, page: 1 })) // 重置頁碼
      },

      setPage: (page: number) => {
        setPagination(prev => ({ ...prev, page }))
      },

      setPageSize: (pageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize, page: 1 })) // 重置頁碼
      },

      setSearch: (query: string) => {
        setSearch(query)
        setPagination(prev => ({ ...prev, page: 1 })) // 重置頁碼
      },

      refresh: loadData,

      reset: () => {
        setFilter(initialFilter)
        setSort(initialSort || null)
        setPagination({
          page: 1,
          pageSize: initialPageSize,
          total: 0
        })
        setSearch('')
        loadData()
      }
    }),
    [loadData, initialFilter, initialSort, initialPageSize]
  )

  /**
   * 自動加載和響應式更新
   */
  useEffect(() => {
    if (autoLoad) {
      loadData()
    }
  }, [filter, sort, pagination.page, pagination.pageSize, ...deps])

  return {
    data: paginatedData,
    loading,
    error,
    state: {
      filter,
      sort,
      pagination,
      search
    },
    actions,
    stats
  }
}
