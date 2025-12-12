// 10.1 分潤計算邏輯

export function calculateCommission(paidAmount: number, commissionRate: number = 0.15): number {
  return Math.round(paidAmount * commissionRate * 100) / 100
}

export function getSettlementPeriod(date: Date = new Date()): string {
  const year = date.getFullYear()
  const quarter = Math.ceil((date.getMonth() + 1) / 3)
  return `${year}-Q${quarter}`
}

export async function getQuarterlyCommissions(supabase: any, partnerId: string, quarter?: string) {
  let query = supabase
    .from('affiliate_commissions')
    .select('*')
    .eq('partner_id', partnerId)

  if (quarter) {
    query = query.eq('settlement_quarter', quarter)
  }

  return query.order('created_at', { ascending: false })
}
