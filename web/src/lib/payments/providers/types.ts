import { WebhookPayload } from '../types'

/**
 * 支付供應商介面
 * 使用策略模式處理不同供應商的 webhook 解析
 */
export interface PaymentProvider {
  /** 供應商名稱 */
  name: string

  /**
   * 檢查 webhook payload 是否屬於此供應商
   */
  canHandle(rawBody: Record<string, unknown>): boolean

  /**
   * 解析 webhook payload 為統一格式
   */
  parseWebhook(rawBody: Record<string, unknown>): WebhookPayload
}
