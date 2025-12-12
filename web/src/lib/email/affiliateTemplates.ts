// 10.2 Email 模板系統

export interface AffiliateAccountData {
  partner_name: string
  contact_email: string
  coupon_code: string
  reset_link: string
}

export interface QuarterlyReportData {
  partner_name: string
  quarter: string
  total_trials: number
  total_conversions: number
  conversion_rate: number
  total_commissions: number
  pending_amount: number
  settled_amount: number
}

export function generateAffiliateWelcomeEmail(data: AffiliateAccountData): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>歡迎加入 SnowSkill 合作夥伴計畫</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">🎿 歡迎加入 SnowSkill 合作夥伴計畫</h1>
        
        <p>親愛的 ${data.partner_name}，</p>
        
        <p>恭喜您成功加入 SnowSkill 合作夥伴計畫！以下是您的帳號資訊：</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>帳號資訊</h3>
            <p><strong>登入 Email：</strong> ${data.contact_email}</p>
            <p><strong>專屬折扣碼：</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${data.coupon_code}</code></p>
            <p><strong>分潤率：</strong> 15%</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>🔐 首次登入設定</h3>
            <p>請點擊以下連結設定您的登入密碼：</p>
            <p><a href="${data.reset_link}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">設定密碼</a></p>
            <p><small>此連結將在 24 小時後失效</small></p>
        </div>
        
        <h3>📊 如何開始推廣</h3>
        <ol>
            <li>設定密碼後登入合作方儀表板</li>
            <li>複製您的專屬推廣連結</li>
            <li>分享給潛在用戶，每筆轉付費可獲得 15% 分潤</li>
            <li>在儀表板查看即時統計和季結報告</li>
        </ol>
        
        <p><strong>推廣連結格式：</strong><br>
        <code>https://www.snowskill.app/pricing?coupon=${data.coupon_code}</code></p>
        
        <hr style="margin: 30px 0;">
        
        <p>如有任何問題，請隨時聯繫我們。</p>
        
        <p>祝您推廣順利！<br>
        SnowSkill 團隊</p>
    </div>
</body>
</html>
  `.trim()
}

export function generateQuarterlyReportEmail(data: QuarterlyReportData): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${data.quarter} 季結報告</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">📊 ${data.quarter} 季結報告</h1>
        
        <p>親愛的 ${data.partner_name}，</p>
        
        <p>您的 ${data.quarter} 季度推廣成果已結算完成，以下是詳細報告：</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📈 推廣成果</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>試用啟用數</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.total_trials}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>轉付費數</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.total_conversions}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>轉換率</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.conversion_rate}%</td>
                </tr>
            </table>
        </div>
        
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>💰 分潤統計</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #bbf7d0;"><strong>總分潤金額</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #bbf7d0; text-align: right; color: #059669;">NT$${Math.round(data.total_commissions)}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #bbf7d0;">待結算</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #bbf7d0; text-align: right;">NT$${Math.round(data.pending_amount)}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>已結算</strong></td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold;">NT$${Math.round(data.settled_amount)}</td>
                </tr>
            </table>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>💡 提醒：</strong>已結算金額將在下個月統一支付，請留意您的收款帳戶。</p>
        </div>
        
        <p>您可以隨時登入合作方儀表板查看詳細統計資料。</p>
        
        <p><a href="https://www.snowskill.app/affiliate/login" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">登入儀表板</a></p>
        
        <hr style="margin: 30px 0;">
        
        <p>感謝您的推廣努力！<br>
        SnowSkill 團隊</p>
    </div>
</body>
</html>
  `.trim()
}

export function generateCommissionPaidEmail(partnerName: string, amount: number, quarter: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>分潤支付通知</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #059669;">✅ 分潤支付完成</h1>
        
        <p>親愛的 ${partnerName}，</p>
        
        <p>您的 ${quarter} 季度分潤已完成支付：</p>
        
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2 style="color: #059669; margin: 0;">NT$${Math.round(amount)}</h2>
            <p style="margin: 5px 0 0 0; color: #065f46;">已支付至您的收款帳戶</p>
        </div>
        
        <p>請確認您的帳戶收款狀況，如有任何問題請聯繫我們。</p>
        
        <p>繼續努力推廣，期待下季度更好的成果！</p>
        
        <hr style="margin: 30px 0;">
        
        <p>SnowSkill 團隊</p>
    </div>
</body>
</html>
  `.trim()
}
