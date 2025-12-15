/**
 * DataTable 組件
 * 通用表格組件，支持卡片式和表格式兩種佈局
 *
 * 設計目標:
 * 1. 支持兩種視覺模式 (card, table)
 * 2. 完全可自定義的列渲染
 * 3. 內建分頁、排序、篩選控制
 * 4. 響應式設計
 */

import React, { ReactNode } from 'react'
import { UseDataTableReturn } from '@/hooks/useDataTable'

/**
 * 列定義
 */
export interface ColumnDef<T> {
  /**
   * 列的唯一鍵
   */
  key: string

  /**
   * 列標題
   */
  header: string | ReactNode

  /**
   * 渲染單元格內容
   */
  render: (item: T, index: number) => ReactNode

  /**
   * 對齊方式
   */
  align?: 'left' | 'center' | 'right'

  /**
   * 是否可排序
   */
  sortable?: boolean

  /**
   * 列寬度 (table 模式)
   */
  width?: string

  /**
   * 是否在 card 模式下隱藏
   */
  hideInCard?: boolean
}

/**
 * DataTable Props
 */
export interface DataTableProps<T> {
  /**
   * 數據和狀態 (來自 useDataTable)
   */
  table: UseDataTableReturn<T>

  /**
   * 列定義
   */
  columns: ColumnDef<T>[]

  /**
   * 顯示模式
   */
  mode?: 'card' | 'table'

  /**
   * 行的唯一鍵 (默認: 'id')
   */
  rowKey?: keyof T

  /**
   * 空狀態提示
   */
  emptyText?: string

  /**
   * 是否顯示分頁控制
   */
  showPagination?: boolean

  /**
   * 是否顯示統計信息
   */
  showStats?: boolean

  /**
   * 自定義 className
   */
  className?: string

  /**
   * 行點擊事件
   */
  onRowClick?: (item: T, index: number) => void
}

/**
 * DataTable 組件
 */
export function DataTable<T extends Record<string, any>>({
  table,
  columns,
  mode = 'card',
  rowKey = 'id' as keyof T,
  emptyText = '暫無數據',
  showPagination = true,
  showStats = true,
  className = '',
  onRowClick
}: DataTableProps<T>) {
  const { data, loading, error, state, actions, stats } = table

  /**
   * 處理排序點擊
   */
  const handleSort = (column: ColumnDef<T>) => {
    if (!column.sortable) return

    const currentSort = state.sort
    const newOrder =
      currentSort?.field === column.key && currentSort.order === 'desc'
        ? 'asc'
        : 'desc'

    actions.setSort(column.key, newOrder)
  }

  /**
   * 渲染加載狀態
   */
  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  /**
   * 渲染錯誤狀態
   */
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
        <p className="font-medium mb-2">載入失敗</p>
        <p className="text-sm text-red-300">{error.message}</p>
        <button
          onClick={actions.refresh}
          className="mt-3 px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-sm transition-colors"
        >
          重試
        </button>
      </div>
    )
  }

  /**
   * 渲染空狀態
   */
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p>{emptyText}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* 統計信息 */}
      {showStats && (
        <div className="flex justify-between items-center mb-4 text-sm text-zinc-400">
          <div>
            顯示 {(state.pagination.page - 1) * state.pagination.pageSize + 1} -{' '}
            {Math.min(
              state.pagination.page * state.pagination.pageSize,
              stats.filtered
            )}{' '}
            / 共 {stats.filtered} 條
            {stats.filtered !== stats.total && ` (已篩選，原始 ${stats.total} 條)`}
          </div>
          {loading && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>載入中...</span>
            </div>
          )}
        </div>
      )}

      {/* 表格內容 */}
      {mode === 'table' ? (
        <TableMode
          data={data}
          columns={columns}
          rowKey={rowKey}
          onRowClick={onRowClick}
          currentSort={state.sort}
          onSort={handleSort}
        />
      ) : (
        <CardMode
          data={data}
          columns={columns}
          rowKey={rowKey}
          onRowClick={onRowClick}
        />
      )}

      {/* 分頁控制 */}
      {showPagination && stats.pageCount > 1 && (
        <Pagination
          currentPage={state.pagination.page}
          pageCount={stats.pageCount}
          onPageChange={actions.setPage}
        />
      )}
    </div>
  )
}

/**
 * 表格模式渲染
 */
function TableMode<T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  onRowClick,
  currentSort,
  onSort
}: {
  data: T[]
  columns: ColumnDef<T>[]
  rowKey: keyof T
  onRowClick?: (item: T, index: number) => void
  currentSort: UseDataTableReturn<T>['state']['sort']
  onSort: (column: ColumnDef<T>) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-700/50">
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={`p-3 text-${column.align || 'left'} ${
                  column.sortable ? 'cursor-pointer hover:bg-zinc-700' : ''
                }`}
                style={{ width: column.width }}
                onClick={() => column.sortable && onSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <span className="text-zinc-500">
                      {currentSort?.field === column.key ? (
                        currentSort.order === 'desc' ? (
                          '↓'
                        ) : (
                          '↑'
                        )
                      ) : (
                        '⇅'
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={String(item[rowKey])}
              className={`border-b border-zinc-700/50 ${
                onRowClick
                  ? 'cursor-pointer hover:bg-zinc-800/50 transition-colors'
                  : ''
              }`}
              onClick={() => onRowClick?.(item, index)}
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  className={`p-3 text-${column.align || 'left'}`}
                >
                  {column.render(item, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * 卡片模式渲染
 */
function CardMode<T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  onRowClick
}: {
  data: T[]
  columns: ColumnDef<T>[]
  rowKey: keyof T
  onRowClick?: (item: T, index: number) => void
}) {
  const visibleColumns = columns.filter(col => !col.hideInCard)

  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div
          key={String(item[rowKey])}
          className={`bg-zinc-800 rounded-lg p-4 ${
            onRowClick
              ? 'cursor-pointer hover:bg-zinc-750 transition-colors'
              : ''
          }`}
          onClick={() => onRowClick?.(item, index)}
        >
          <div className="grid gap-3">
            {visibleColumns.map(column => (
              <div key={column.key}>
                {typeof column.header === 'string' && (
                  <div className="text-xs text-zinc-500 mb-1">
                    {column.header}
                  </div>
                )}
                <div>{column.render(item, index)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 分頁控制
 */
function Pagination({
  currentPage,
  pageCount,
  onPageChange
}: {
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  const pages: (number | 'ellipsis')[] = []

  // 生成頁碼數組 (顯示前3、當前前後各1、最後3)
  if (pageCount <= 7) {
    // 總數 ≤ 7，全部顯示
    for (let i = 1; i <= pageCount; i++) {
      pages.push(i)
    }
  } else {
    // 總數 > 7，智能省略
    pages.push(1)

    if (currentPage > 3) {
      pages.push('ellipsis')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(pageCount - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    if (currentPage < pageCount - 2) {
      pages.push('ellipsis')
    }

    pages.push(pageCount)
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {/* 上一頁 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        上一頁
      </button>

      {/* 頁碼 */}
      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-zinc-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* 下一頁 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === pageCount}
        className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        下一頁
      </button>
    </div>
  )
}
