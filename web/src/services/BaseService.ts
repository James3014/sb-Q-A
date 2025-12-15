/**
 * Base Service 類
 * 提供統一的 API 請求邏輯、認證、錯誤處理、重試機制
 */

import { getSessionOrThrow } from '@/lib/supabaseClient'
import { ApiError, NetworkError, AuthError, createApiErrorFromResponse } from '@/lib/errors'
import { logger } from '@/lib/logging'
import { retryWithBackoff, RetryOptions } from '@/lib/apiRetry'

export interface RequestOptions extends RequestInit {
  retry?: boolean | RetryOptions
  skipAuth?: boolean
}

export abstract class BaseService {
  /**
   * 獲取認證 token
   */
  protected static async getAuthToken(): Promise<string> {
    try {
      const { session } = await getSessionOrThrow('BaseService.getAuthToken')

      if (!session?.access_token) {
        throw new AuthError('No access token available')
      }

      return session.access_token
    } catch (error) {
      logger.error('Failed to get auth token', error as Error)
      throw new AuthError('Authentication failed', {
        originalError: (error as Error).message
      })
    }
  }

  /**
   * 發送 HTTP 請求（帶認證、錯誤處理、重試）
   */
  protected static async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { retry = true, skipAuth = false, ...init } = options

    // 準備請求
    const makeRequest = async (): Promise<T> => {
      const startTime = Date.now()

      // 添加認證 header
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string> | undefined)
      }

      if (!skipAuth) {
        const token = await this.getAuthToken()
        headers.Authorization = `Bearer ${token}`
      }

      // 記錄請求
      logger.logApiRequest(init.method || 'GET', path, {
        hasAuth: !skipAuth,
        hasBody: !!init.body
      })

      // 發送請求
      let response: Response
      try {
        response = await fetch(path, { ...init, headers })
      } catch (error) {
        // 網路錯誤
        throw new NetworkError('Network request failed', {
          path,
          method: init.method || 'GET',
          originalError: (error as Error).message
        })
      }

      const duration = Date.now() - startTime

      // 記錄響應
      logger.logApiResponse(
        init.method || 'GET',
        path,
        response.status,
        duration
      )

      // 處理非 OK 響應
      if (!response.ok) {
        const apiError = await createApiErrorFromResponse(response)
        throw apiError
      }

      // 處理 204 No Content
      if (response.status === 204) {
        return {} as T
      }

      // 解析 JSON
      try {
        return await response.json()
      } catch (error) {
        logger.error('Failed to parse JSON response', error as Error, { path })
        throw new ApiError('Invalid JSON response from server', response.status, {
          path
        })
      }
    }

    // 決定是否重試
    if (retry) {
      const retryOptions = typeof retry === 'object' ? retry : undefined
      return retryWithBackoff(makeRequest, retryOptions)
    } else {
      return makeRequest()
    }
  }

  /**
   * GET 請求
   */
  protected static async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  /**
   * POST 請求
   */
  protected static async post<T>(
    path: string,
    body: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    })
  }

  /**
   * PATCH 請求
   */
  protected static async patch<T>(
    path: string,
    body: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    })
  }

  /**
   * PUT 請求
   */
  protected static async put<T>(
    path: string,
    body: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    })
  }

  /**
   * DELETE 請求
   */
  protected static async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }
}
