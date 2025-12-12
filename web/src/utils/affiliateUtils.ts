export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('zh-TW')
}

export const calculateCommission = (amount: number, rate: number): number => {
  return Math.round(amount * rate)
}

export const getSubscriptionStatus = (user: {
  subscription_type?: string
  subscription_expires_at?: string
}): string => {
  if (!user.subscription_expires_at) return '無訂閱'
  
  const expiresAt = new Date(user.subscription_expires_at)
  const now = new Date()
  
  if (expiresAt > now) {
    return `${user.subscription_type} (到期：${formatDate(user.subscription_expires_at)})`
  } else {
    return '已過期'
  }
}

export const generateReferralLink = (couponCode: string): string => {
  return `https://www.snowskill.app/pricing?ref=${couponCode}&trial=1`
}

export const formatCurrency = (amount: number): string => {
  return `NT$${Math.round(amount)}`
}
