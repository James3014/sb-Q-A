/**
 * ConversionFunnel Component Tests
 *
 * 測試互動式轉換漏斗組件的各種功能
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { ConversionFunnel } from '@/components/admin/analytics/ConversionFunnel'

const mockData = {
  totalClicks: 1500,
  totalTrials: 450,
  totalConversions: 135,
  clickToTrialRate: 30.0,
  trialToConversionRate: 30.0,
  overallConversionRate: 9.0,
}

describe('ConversionFunnel', () => {
  describe('基本渲染', () => {
    it('應該渲染標題', () => {
      render(<ConversionFunnel data={mockData} />)
      expect(screen.getByText('🔄 轉換漏斗')).toBeInTheDocument()
    })

    it('應該顯示所有三個階段', () => {
      render(<ConversionFunnel data={mockData} />)
      expect(screen.getByText('1,500')).toBeInTheDocument() // 點擊
      expect(screen.getByText('450')).toBeInTheDocument() // 試用
      expect(screen.getByText('135')).toBeInTheDocument() // 付費
    })

    it('應該顯示階段標籤', () => {
      render(<ConversionFunnel data={mockData} />)
      expect(screen.getByText('點擊')).toBeInTheDocument()
      expect(screen.getByText('試用')).toBeInTheDocument()
      expect(screen.getByText('付費')).toBeInTheDocument()
    })

    it('應該顯示轉換率', () => {
      render(<ConversionFunnel data={mockData} />)
      const conversionTexts = screen.getAllByText('30.0% 轉換')
      expect(conversionTexts).toHaveLength(2) // 兩個進度條
    })

    it('應該顯示整體轉換率', () => {
      render(<ConversionFunnel data={mockData} />)
      expect(screen.getByText(/整體轉換率/)).toBeInTheDocument()
      expect(screen.getByText('9.00%')).toBeInTheDocument()
    })
  })

  describe('數值格式化', () => {
    it('應該使用千位分隔符格式化大數字', () => {
      const data = {
        ...mockData,
        totalClicks: 15000,
        totalTrials: 4500,
        totalConversions: 1350,
      }
      render(<ConversionFunnel data={data} />)
      expect(screen.getByText('15,000')).toBeInTheDocument()
      expect(screen.getByText('4,500')).toBeInTheDocument()
      expect(screen.getByText('1,350')).toBeInTheDocument()
    })

    it('應該顯示小數點後一位的轉換率', () => {
      const data = {
        ...mockData,
        clickToTrialRate: 25.6789,
        trialToConversionRate: 33.3333,
      }
      render(<ConversionFunnel data={data} />)
      expect(screen.getByText('25.7% 轉換')).toBeInTheDocument()
      expect(screen.getByText('33.3% 轉換')).toBeInTheDocument()
    })

    it('應該顯示整體轉換率的詳細說明', () => {
      render(<ConversionFunnel data={mockData} />)
      // 9% 轉換率 = 每 11.11 次點擊 → 1 次付費
      expect(screen.getByText(/每 11 次點擊/)).toBeInTheDocument()
    })
  })

  describe('Hover 互動', () => {
    it('應該在 hover 點擊階段時顯示 tooltip', () => {
      render(<ConversionFunnel data={mockData} />)
      const clicksStage = screen.getByText('1,500').parentElement as HTMLElement

      fireEvent.mouseEnter(clicksStage)
      expect(screen.getByText('來自推廣連結的點擊數')).toBeInTheDocument()

      fireEvent.mouseLeave(clicksStage)
      expect(screen.queryByText('來自推廣連結的點擊數')).not.toBeInTheDocument()
    })

    it('應該在 hover 試用階段時顯示 tooltip', () => {
      render(<ConversionFunnel data={mockData} />)
      const trialsStage = screen.getByText('450').parentElement as HTMLElement

      fireEvent.mouseEnter(trialsStage)
      expect(screen.getByText('啟用折扣碼試用的用戶數')).toBeInTheDocument()

      fireEvent.mouseLeave(trialsStage)
      expect(screen.queryByText('啟用折扣碼試用的用戶數')).not.toBeInTheDocument()
    })

    it('應該在 hover 付費階段時顯示 tooltip', () => {
      render(<ConversionFunnel data={mockData} />)
      const conversionsStage = screen.getByText('135').parentElement as HTMLElement

      fireEvent.mouseEnter(conversionsStage)
      expect(screen.getByText('完成付費訂閱的用戶數')).toBeInTheDocument()

      fireEvent.mouseLeave(conversionsStage)
      expect(screen.queryByText('完成付費訂閱的用戶數')).not.toBeInTheDocument()
    })

    it('應該同時只顯示一個 tooltip', () => {
      render(<ConversionFunnel data={mockData} />)
      const clicksStage = screen.getByText('1,500').parentElement as HTMLElement
      const trialsStage = screen.getByText('450').parentElement as HTMLElement

      fireEvent.mouseEnter(clicksStage)
      expect(screen.getByText('來自推廣連結的點擊數')).toBeInTheDocument()

      fireEvent.mouseEnter(trialsStage)
      expect(screen.queryByText('來自推廣連結的點擊數')).not.toBeInTheDocument()
      expect(screen.getByText('啟用折扣碼試用的用戶數')).toBeInTheDocument()
    })
  })

  describe('動畫效果', () => {
    it('應該對 hover 的階段添加 scale 樣式', () => {
      render(<ConversionFunnel data={mockData} />)
      const clicksNumber = screen.getByText('1,500')

      fireEvent.mouseEnter(clicksNumber.parentElement as HTMLElement)
      expect(clicksNumber).toHaveClass('scale-110')

      fireEvent.mouseLeave(clicksNumber.parentElement as HTMLElement)
      expect(clicksNumber).not.toHaveClass('scale-110')
    })

    it('應該對數字元素添加 transition 樣式', () => {
      render(<ConversionFunnel data={mockData} />)
      const clicksNumber = screen.getByText('1,500')
      expect(clicksNumber).toHaveClass('transition-all')
    })
  })

  describe('進度條', () => {
    it('應該顯示進度條寬度符合轉換率', () => {
      render(<ConversionFunnel data={mockData} />)
      const progressBars = document.querySelectorAll('[style*="width"]')

      // 應該有兩個進度條（點擊→試用, 試用→付費）
      expect(progressBars.length).toBeGreaterThanOrEqual(2)
    })

    it('應該使用漸層色進度條', () => {
      render(<ConversionFunnel data={mockData} />)
      const progressBars = document.querySelectorAll('.bg-gradient-to-r')

      // 應該有兩個漸層進度條
      expect(progressBars.length).toBeGreaterThanOrEqual(2)
    })

    it('應該對進度條添加動畫', () => {
      render(<ConversionFunnel data={mockData} />)
      const progressBars = document.querySelectorAll('.duration-500')

      // 應該有兩個帶動畫的進度條
      expect(progressBars.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('樣式和類別', () => {
    it('應該套用卡片樣式', () => {
      const { container } = render(<ConversionFunnel data={mockData} />)
      const card = container.firstChild as HTMLElement

      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border-zinc-800')
      expect(card).toHaveClass('bg-zinc-900/50')
    })

    it('應該為不同階段使用不同顏色', () => {
      render(<ConversionFunnel data={mockData} />)

      const clicksNumber = screen.getByText('1,500')
      const trialsNumber = screen.getByText('450')
      const conversionsNumber = screen.getByText('135')

      expect(clicksNumber).toHaveClass('text-yellow-400')
      expect(trialsNumber).toHaveClass('text-blue-400')
      expect(conversionsNumber).toHaveClass('text-green-400')
    })
  })

  describe('無障礙功能', () => {
    it('應該為 hover 區域提供 cursor-pointer', () => {
      render(<ConversionFunnel data={mockData} />)
      const clicksStage = screen.getByText('1,500').parentElement as HTMLElement

      expect(clicksStage).toHaveClass('cursor-pointer')
    })

    it('應該使用語義化結構', () => {
      render(<ConversionFunnel data={mockData} />)

      // 標題應該是 h3
      const title = screen.getByText('🔄 轉換漏斗')
      expect(title.tagName).toBe('H3')
    })
  })

  describe('邊界情況', () => {
    it('應該處理零值數據', () => {
      const zeroData = {
        totalClicks: 0,
        totalTrials: 0,
        totalConversions: 0,
        clickToTrialRate: 0,
        trialToConversionRate: 0,
        overallConversionRate: 0,
      }
      render(<ConversionFunnel data={zeroData} />)

      expect(screen.getAllByText('0')).toHaveLength(3) // 三個階段都是 0
      const conversionTexts = screen.getAllByText('0.0% 轉換')
      expect(conversionTexts).toHaveLength(2) // 兩個進度條
    })

    it('應該處理 100% 轉換率', () => {
      const perfectData = {
        totalClicks: 100,
        totalTrials: 100,
        totalConversions: 100,
        clickToTrialRate: 100,
        trialToConversionRate: 100,
        overallConversionRate: 100,
      }
      render(<ConversionFunnel data={perfectData} />)

      const conversionTexts = screen.getAllByText('100.0% 轉換')
      expect(conversionTexts).toHaveLength(2) // 兩個進度條
    })

    it('應該處理極大數值', () => {
      const largeData = {
        totalClicks: 1234567,
        totalTrials: 456789,
        totalConversions: 123456,
        clickToTrialRate: 37.0,
        trialToConversionRate: 27.0,
        overallConversionRate: 10.0,
      }
      render(<ConversionFunnel data={largeData} />)

      expect(screen.getByText('1,234,567')).toBeInTheDocument()
      expect(screen.getByText('456,789')).toBeInTheDocument()
      expect(screen.getByText('123,456')).toBeInTheDocument()
    })
  })
})
