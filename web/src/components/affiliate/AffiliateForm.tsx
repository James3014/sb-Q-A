import { useAffiliateForm } from '@/hooks/useAffiliateForm'
import { showErrorAlert } from '@/utils/errorHandler'
import { UI_CONSTANTS } from '@/constants/affiliate'

interface AffiliateFormProps {
  onSubmit: (formData: any) => Promise<void>
  onCancel: () => void
}

export const AffiliateForm = ({ onSubmit, onCancel }: AffiliateFormProps) => {
  const { formData, creating, setCreating, updateField, resetForm, validateForm } = useAffiliateForm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const error = validateForm()
    if (error) {
      alert(error)
      return
    }

    try {
      setCreating(true)
      await onSubmit(formData)
      resetForm()
      onCancel()
    } catch (error) {
      showErrorAlert(error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="bg-zinc-800 rounded-lg p-6 mb-6">
      <h3 className="font-bold mb-4">新增合作方</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="合作方名稱"
          value={formData.partner_name}
          onChange={(e) => updateField('partner_name', e.target.value)}
          className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
          required
        />
        <input
          type="email"
          placeholder="聯絡 Email"
          value={formData.contact_email}
          onChange={(e) => updateField('contact_email', e.target.value)}
          className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
          required
        />
        <input
          type="text"
          placeholder="專屬折扣碼"
          value={formData.coupon_code}
          onChange={(e) => updateField('coupon_code', e.target.value.toUpperCase())}
          className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
          required
        />
        <input
          type="number"
          placeholder="分潤率 (0.15 = 15%)"
          value={formData.commission_rate}
          onChange={(e) => updateField('commission_rate', parseFloat(e.target.value))}
          step="0.01"
          min="0.05"
          max="0.30"
          className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded"
          required
        />
        <div className="col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={creating}
            className={UI_CONSTANTS.BUTTONS.PRIMARY}
          >
            {creating ? '建立中...' : '建立合作方'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
