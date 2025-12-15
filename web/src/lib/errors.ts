/**
 * 統一錯誤處理系統
 * 定義標準化的錯誤類型，用於整個應用
 */

export enum ErrorCode {
  // 認證錯誤
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // API 錯誤
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // 驗證錯誤
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // 資源錯誤
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // 業務邏輯錯誤
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  PAYMENT_FAILED = 'PAYMENT_FAILED',

  // 系統錯誤
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // 未知錯誤
  UNKNOWN = 'UNKNOWN'
}

/**
 * 應用錯誤基類
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly context?: Record<string, any>
  public readonly statusCode?: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN,
    context?: Record<string, any>,
    statusCode?: number,
    isOperational = true
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.context = context
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Maintains proper stack trace (only available in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      statusCode: this.statusCode
    }
  }
}

/**
 * API 錯誤
 */
export class ApiError extends AppError {
  constructor(
    message: string,
    statusCode = 500,
    context?: Record<string, any>
  ) {
    super(message, ErrorCode.API_ERROR, context, statusCode)
    this.name = 'ApiError'
  }
}

/**
 * 認證錯誤
 */
export class AuthError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.UNAUTHORIZED, context, 401)
    this.name = 'AuthError'
  }
}

/**
 * 驗證錯誤
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string>

  constructor(message: string, errors: Record<string, string> = {}) {
    super(message, ErrorCode.VALIDATION_ERROR, { errors }, 400)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

/**
 * 資源未找到錯誤
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`

    super(message, ErrorCode.NOT_FOUND, { resource, identifier }, 404)
    this.name = 'NotFoundError'
  }
}

/**
 * 網路錯誤
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.NETWORK_ERROR, context, 0)
    this.name = 'NetworkError'
  }
}

/**
 * 業務邏輯錯誤
 */
export class BusinessError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.BUSINESS_LOGIC_ERROR, context, 400)
    this.name = 'BusinessError'
  }
}

/**
 * 判斷是否為可操作的錯誤（預期內的錯誤）
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

/**
 * 從 fetch Response 創建 ApiError
 */
export async function createApiErrorFromResponse(response: Response): Promise<ApiError> {
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

/**
 * 用戶友善的錯誤訊息映射
 */
export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof ValidationError) {
    return '輸入資料有誤，請檢查後重試'
  }

  if (error instanceof AuthError) {
    return '您的登入已過期，請重新登入'
  }

  if (error instanceof NotFoundError) {
    return '找不到您要找的內容'
  }

  if (error instanceof NetworkError) {
    return '網路連線異常，請檢查您的網路狀態'
  }

  if (error instanceof BusinessError) {
    return error.message // Business errors already have user-friendly messages
  }

  if (error instanceof ApiError) {
    if (error.statusCode === 429) {
      return '請求過於頻繁，請稍後再試'
    }
    if (error.statusCode && error.statusCode >= 500) {
      return '伺服器發生錯誤，請稍後再試'
    }
  }

  return '發生未預期的錯誤，請稍後再試'
}
