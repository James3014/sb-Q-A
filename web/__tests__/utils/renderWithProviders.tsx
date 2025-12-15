import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * 測試工具：渲染帶有 Provider 的組件
 * 用於測試需要 Context 的組件
 */

interface AllTheProvidersProps {
  children: React.ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return <>{children}</>
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
