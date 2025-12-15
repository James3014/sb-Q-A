/**
 * ModernStatCard Component Tests
 *
 * 測試現代化統計卡片組件的各種功能和狀態
 */

import { render, screen } from '@testing-library/react'
import { ModernStatCard } from '@/components/ui/modern/ModernStatCard'

describe('ModernStatCard', () => {
  describe('基本渲染', () => {
    it('應該渲染標籤和數值', () => {
      render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
        />
      )

      expect(screen.getByText('總用戶數')).toBeInTheDocument()
      expect(screen.getByText('1,234')).toBeInTheDocument()
    })

    it('應該接受數字類型的 value', () => {
      render(
        <ModernStatCard
          label="總用戶數"
          value={1234}
        />
      )

      expect(screen.getByText('1,234')).toBeInTheDocument()
    })

    it('應該渲染副標題（如果提供）', () => {
      render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
          subtitle="較上月增加"
        />
      )

      expect(screen.getByText('較上月增加')).toBeInTheDocument()
    })

    it('應該不渲染副標題（如果未提供）', () => {
      render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
        />
      )

      expect(screen.queryByText('較上月增加')).not.toBeInTheDocument()
    })
  })

  describe('趨勢指標', () => {
    it('應該顯示上升趨勢（up）', () => {
      render(
        <ModernStatCard
          label="總收入"
          value="$45,231"
          change="+20.1%"
          trend="up"
        />
      )

      expect(screen.getByText('+20.1%')).toBeInTheDocument()
      // 檢查是否有上升箭頭（透過 class 或 data-testid）
      const changeElement = screen.getByText('+20.1%').parentElement
      expect(changeElement).toHaveClass('text-emerald-400')
    })

    it('應該顯示下降趨勢（down）', () => {
      render(
        <ModernStatCard
          label="總支出"
          value="$12,345"
          change="-5.2%"
          trend="down"
        />
      )

      expect(screen.getByText('-5.2%')).toBeInTheDocument()
      const changeElement = screen.getByText('-5.2%').parentElement
      expect(changeElement).toHaveClass('text-red-400')
    })

    it('應該顯示持平趨勢（neutral）', () => {
      render(
        <ModernStatCard
          label="訪客數"
          value="5,000"
          change="0%"
          trend="neutral"
        />
      )

      expect(screen.getByText('0%')).toBeInTheDocument()
      const changeElement = screen.getByText('0%').parentElement
      expect(changeElement).toHaveClass('text-zinc-400')
    })

    it('應該不顯示趨勢（如果未提供 change）', () => {
      render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
        />
      )

      expect(screen.queryByText('%')).not.toBeInTheDocument()
    })

    it('應該處理缺少 trend 但有 change 的情況（預設 neutral）', () => {
      render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
          change="+10%"
        />
      )

      expect(screen.getByText('+10%')).toBeInTheDocument()
      const changeElement = screen.getByText('+10%').parentElement
      expect(changeElement).toHaveClass('text-zinc-400')
    })
  })

  describe('圖示顯示', () => {
    it('應該顯示圖示（如果提供）', () => {
      render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
          icon="👥"
        />
      )

      expect(screen.getByText('👥')).toBeInTheDocument()
    })

    it('應該不顯示圖示（如果未提供）', () => {
      const { container } = render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
        />
      )

      // 檢查沒有 icon 容器（應該只有一個 text-3xl 是數值）
      const iconContainers = container.querySelectorAll('[class*="text-3xl"]')
      // 應該只有數值那個 text-3xl，沒有 icon 的 text-3xl
      expect(iconContainers.length).toBe(1)
      // 那個 text-3xl 應該包含數值
      expect(iconContainers[0].textContent).toBe('1,234')
    })

    it('應該支援 React 節點作為 icon', () => {
      render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
          icon={<div data-testid="custom-icon">Custom Icon</div>}
        />
      )

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })
  })

  describe('樣式和類別', () => {
    it('應該套用預設樣式類別', () => {
      const { container } = render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border-zinc-800')
      expect(card).toHaveClass('bg-zinc-900/50')
    })

    it('應該套用自定義 className', () => {
      const { container } = render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
          className="custom-class"
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-class')
    })

    it('應該合併預設和自定義 className', () => {
      const { container } = render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
          className="my-custom-class"
        />
      )

      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('my-custom-class')
    })
  })

  describe('無障礙功能', () => {
    it('應該具有適當的語義結構', () => {
      render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
          change="+10%"
          trend="up"
        />
      )

      // 標籤應該是小字
      const label = screen.getByText('總用戶數')
      expect(label.tagName).toBe('P')

      // 數值應該是大字
      const value = screen.getByText('1,234')
      expect(value.tagName).toBe('P')
    })

    it('應該為趨勢變化提供視覺標示', () => {
      render(
        <ModernStatCard
          label="總收入"
          value="$45,231"
          change="+20.1%"
          trend="up"
        />
      )

      const changeElement = screen.getByText('+20.1%').parentElement
      // 檢查顏色類別
      expect(changeElement).toHaveClass('text-emerald-400')
    })
  })

  describe('數值格式化', () => {
    it('應該格式化大數字（千位分隔符）', () => {
      render(
        <ModernStatCard
          label="總收入"
          value={1234567}
        />
      )

      expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })

    it('應該保留字串格式（如貨幣符號）', () => {
      render(
        <ModernStatCard
          label="總收入"
          value="$1,234"
        />
      )

      expect(screen.getByText('$1,234')).toBeInTheDocument()
    })
  })

  describe('響應式設計', () => {
    it('應該在小螢幕上調整佈局', () => {
      const { container } = render(
        <ModernStatCard
          label="總用戶數"
          value="1,234"
          icon="👥"
        />
      )

      const card = container.firstChild as HTMLElement
      // 檢查 padding 是否適當（p-6）
      expect(card).toHaveClass('p-6')
    })
  })
})
