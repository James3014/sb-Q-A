/**
 * API 重試機制
 * 使用 exponential backoff 策略
 */

import { logger } from './logging'
import { NetworkError, ApiError } from './errors'

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryableStatuses?: number[]
  shouldRetry?: (error: Error, attempt: number) => boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  shouldRetry: () => true
}

/**
 * 計算重試延遲（指數退避）
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffFactor, attempt - 1)
  return Math.min(delay, options.maxDelay)
}

/**
 * 延遲函數
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 判斷錯誤是否可重試
 */
function isRetryableError(error: Error, options: Required<RetryOptions>): boolean {
  // Network errors are always retryable
  if (error instanceof NetworkError) {
    return true
  }

  // Check API error status codes
  if (error instanceof ApiError && error.statusCode) {
    return options.retryableStatuses.includes(error.statusCode)
  }

  // Check for network-related errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return true
  }

  return false
}

/**
 * 帶重試的函數執行器
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      logger.debug(`Attempt ${attempt}/${opts.maxRetries + 1}`)
      return await fn()
    } catch (error) {
      lastError = error as Error

      // If this is the last attempt, throw the error
      if (attempt > opts.maxRetries) {
        logger.error(
          `All retry attempts failed after ${opts.maxRetries} retries`,
          lastError,
          { attempts: attempt }
        )
        throw lastError
      }

      // Check if error is retryable
      if (!isRetryableError(lastError, opts) || !opts.shouldRetry(lastError, attempt)) {
        logger.warn('Error is not retryable, throwing immediately', {
          error: lastError.message,
          attempt
        })
        throw lastError
      }

      // Calculate delay and wait
      const delayMs = calculateDelay(attempt, opts)
      logger.warn(
        `Attempt ${attempt} failed, retrying in ${delayMs}ms`,
        {
          error: lastError.message,
          attempt,
          delayMs
        }
      )

      await delay(delayMs)
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError!
}

/**
 * 帶重試的 fetch 包裝器
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> {
  return retryWithBackoff(async () => {
    try {
      const response = await fetch(url, init)

      // Don't retry successful responses or client errors (except 408 and 429)
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429)) {
        return response
      }

      // Throw ApiError for non-OK responses that should be retried
      throw new ApiError(
        `Request failed with status ${response.status}`,
        response.status,
        { url, method: init?.method || 'GET' }
      )
    } catch (error) {
      // Convert fetch errors to NetworkError
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network request failed', {
          url,
          method: init?.method || 'GET',
          originalError: error.message
        })
      }
      throw error
    }
  }, options)
}

/**
 * 帶重試的 JSON fetch
 */
export async function fetchJsonWithRetry<T>(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<T> {
  const response = await fetchWithRetry(url, init, options)

  if (!response.ok) {
    const error = await createApiErrorFromResponse(response)
    throw error
  }

  try {
    return await response.json()
  } catch (error) {
    logger.error('Failed to parse JSON response', error as Error, { url })
    throw new ApiError('Invalid JSON response from server', response.status, { url })
  }
}

async function createApiErrorFromResponse(response: Response): Promise<ApiError> {
  let message = `API request failed with status ${response.status}`
  let context: Record<string, any> = {
    status: response.status,
    statusText: response.statusText,
    url: response.url
  }

  try {
    const data = await response.json()
    message = data.message || data.error || message
    context = { ...context, ...data }
  } catch {
    // If response is not JSON, use default message
  }

  return new ApiError(message, response.status, context)
}
