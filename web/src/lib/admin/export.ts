/**
 * Data Export Utilities
 *
 * 提供數據匯出功能（CSV 格式）
 */

export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // 生成 headers（從第一筆資料的 keys）
  const headers = Object.keys(data[0])

  // 生成 CSV 內容
  const csvRows = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        // 處理 null/undefined
        if (value === null || value === undefined) {
          return ''
        }
        // 轉為字串
        const stringValue = String(value)
        // 如果包含逗號、換行或雙引號，需要用雙引號包裹並跳脫
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return '"' + stringValue.replace(/"/g, '""') + '"'
        }
        return stringValue
      }).join(',')
    ),
  ]

  const csvContent = csvRows.join('\n')

  // 添加 UTF-8 BOM 以支援 Excel
  const BOM = '\uFEFF'
  const csvWithBOM = BOM + csvContent

  // 創建 Blob
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })

  // 創建下載連結
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url

  // 設定檔名（包含日期）
  const date = new Date().toISOString().split('T')[0]
  link.download = `${filename}-${date}.csv`

  // 觸發下載
  document.body.appendChild(link)
  link.click()

  // 清理
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
