import { useState } from 'react'
import type { AffiliateFormData } from '@/types/affiliate'
import { AFFILIATE_CONSTANTS } from '@/constants/affiliate'

const initialFormData: AffiliateFormData = {
  partner_name: '',
  contact_email: '',
  coupon_code: '',
  commission_rate: AFFILIATE_CONSTANTS.DEFAULT_COMMISSION_RATE
}

export const useAffiliateForm = () => {
  const [formData, setFormData] = useState<AffiliateFormData>(initialFormData)
  const [creating, setCreating] = useState(false)

  const updateField = (field: keyof AffiliateFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
  }

  const validateForm = (): string | null => {
    if (!formData.partner_name.trim()) return '請輸入合作方名稱'
    if (!formData.contact_email.trim()) return '請輸入聯絡 Email'
    if (!formData.coupon_code.trim()) return '請輸入折扣碼'
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.contact_email)) return 'Email 格式不正確'
    
    if (formData.commission_rate < AFFILIATE_CONSTANTS.MIN_COMMISSION_RATE || 
        formData.commission_rate > AFFILIATE_CONSTANTS.MAX_COMMISSION_RATE) {
      return `分潤率必須在 ${AFFILIATE_CONSTANTS.MIN_COMMISSION_RATE * 100}% - ${AFFILIATE_CONSTANTS.MAX_COMMISSION_RATE * 100}% 之間`
    }
    
    return null
  }

  return {
    formData,
    creating,
    setCreating,
    updateField,
    resetForm,
    validateForm
  }
}
