import {
  calculateEffectiveness,
  calculateHealth,
  calculateConversionRate,
  calculateCommission,
  sortByField,
  calculateStats,
  calculatePercentage,
  calculateGrowthRate
} from '@/lib/admin/calculations'

describe('calculations', () => {
  describe('calculateEffectiveness', () => {
    it('should return 0 when practices < 3', () => {
      const result = calculateEffectiveness({
        id: '1',
        practices: 2,
        avg_rating: 5,
        completion_rate: 0.8,
        practice_rate: 0.6
      })
      expect(result.score).toBe(0)
      expect(result.reason).toContain('insufficient data')
    })

    it('should calculate correctly when practices >= 3', () => {
      const result = calculateEffectiveness({
        id: '1',
        practices: 10,
        avg_rating: 4,
        completion_rate: 0.8,
        practice_rate: 0.6
      })
      expect(result.score).toBe(80) // (4/5) * 100
      expect(result.count).toBe(10)
    })
  })

  describe('calculateHealth', () => {
    it('should calculate health score correctly', () => {
      const result = calculateHealth({
        id: '1',
        practices: 10,
        avg_rating: 4,
        completion_rate: 1.0,
        practice_rate: 0.5
      })
      expect(result.score).toBe(0.7) // 1.0*0.4 + 0.5*0.6
      expect(result.components.completion).toBe(0.4)
      expect(result.components.practice).toBe(0.3)
    })
  })

  describe('calculateConversionRate', () => {
    it('should return 0 when total is 0', () => {
      expect(calculateConversionRate(0, 0)).toBe(0)
    })

    it('should calculate percentage correctly', () => {
      expect(calculateConversionRate(100, 25)).toBe(25)
    })
  })

  describe('calculateCommission', () => {
    it('should calculate commission correctly', () => {
      expect(calculateCommission(1000, 0.1)).toBe(100)
      expect(calculateCommission(500, 0.15)).toBe(75)
    })
  })

  describe('sortByField', () => {
    const items = [
      { id: '1', value: 30 },
      { id: '2', value: 10 },
      { id: '3', value: 20 }
    ]

    it('should sort ascending by default', () => {
      const sorted = sortByField(items, 'value')
      expect(sorted.map(i => i.value)).toEqual([10, 20, 30])
    })

    it('should sort descending when specified', () => {
      const sorted = sortByField(items, 'value', 'desc')
      expect(sorted.map(i => i.value)).toEqual([30, 20, 10])
    })

    it('should not mutate original array', () => {
      sortByField(items, 'value')
      expect(items[0].value).toBe(30) // Original unchanged
    })
  })

  describe('calculateStats', () => {
    it('should return zeros for empty array', () => {
      const stats = calculateStats([])
      expect(stats).toEqual({ sum: 0, avg: 0, min: 0, max: 0, count: 0 })
    })

    it('should calculate stats correctly', () => {
      const stats = calculateStats([10, 20, 30, 40, 50])
      expect(stats.sum).toBe(150)
      expect(stats.avg).toBe(30)
      expect(stats.min).toBe(10)
      expect(stats.max).toBe(50)
      expect(stats.count).toBe(5)
    })
  })

  describe('calculatePercentage', () => {
    it('should return 0 when total is 0', () => {
      expect(calculatePercentage(10, 0)).toBe(0)
    })

    it('should calculate percentage with default decimals', () => {
      expect(calculatePercentage(25, 100)).toBe(25)
    })

    it('should respect decimal parameter', () => {
      expect(calculatePercentage(1, 3, 4)).toBe(33.3333)
    })
  })

  describe('calculateGrowthRate', () => {
    it('should return 100 when previous is 0 and current > 0', () => {
      expect(calculateGrowthRate(50, 0)).toBe(100)
    })

    it('should return 0 when both are 0', () => {
      expect(calculateGrowthRate(0, 0)).toBe(0)
    })

    it('should calculate growth rate correctly', () => {
      expect(calculateGrowthRate(150, 100)).toBe(50) // 50% growth
      expect(calculateGrowthRate(75, 100)).toBe(-25) // -25% decline
    })
  })
})
