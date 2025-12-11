/**
 * 支付供應商策略模式
 *
 * 新增供應商步驟：
 * 1. 建立新檔案 providers/xxx.ts
 * 2. 實作 PaymentProvider 介面
 * 3. 在此匯出並加入 providers 陣列
 */

import { WebhookPayload } from '../types'
import { PaymentProvider } from './types'
import { oentechProvider } from './oentech'
import { mockProvider } from './mock'

export type { PaymentProvider } from './types'

// 按優先順序排列，mockProvider 放最後作為預設
const providers: PaymentProvider[] = [
  oentechProvider,
  mockProvider,
]

/**
 * 根據 rawBody 找到對應的 provider 並解析 webhook
 */
export function parseWebhookPayload(rawBody: Record<string, unknown>): WebhookPayload | null {
  for (const provider of providers) {
    if (provider.canHandle(rawBody)) {
      return provider.parseWebhook(rawBody)
    }
  }
  return null
}

/**
 * 取得目前使用的供應商名稱
 */
export function getProviderName(rawBody: Record<string, unknown>): string {
  for (const provider of providers) {
    if (provider.canHandle(rawBody)) {
      return provider.name
    }
  }
  return 'unknown'
}
