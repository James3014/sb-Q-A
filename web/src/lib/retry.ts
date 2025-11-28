/**
 * 弱網重試工具
 * 自動重試失敗的請求，指數退避
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  timeout = 10000
): Promise<T> {
  try {
    return await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ])
  } catch (error) {
    if (retries === 0) throw error
    await new Promise(r => setTimeout(r, delay))
    return fetchWithRetry(fn, retries - 1, delay * 2, timeout)
  }
}
