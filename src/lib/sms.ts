// Arkesel SMS API for Ghana

const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY!
const SENDER_ID = process.env.ARKESEL_SENDER_ID || 'Pavroll'
const BASE_URL = 'https://sms.arkesel.com/api/v2/sms/send'

export type SMSResult = {
  success: boolean
  message: string
  data?: any
}

// Format Ghana phone number to international format
export function formatGhanaPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '')
  if (cleaned.startsWith('+233')) return cleaned
  if (cleaned.startsWith('233')) return `+${cleaned}`
  if (cleaned.startsWith('0')) return `+233${cleaned.slice(1)}`
  return `+233${cleaned}`
}

// Send single SMS
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  try {
    const phone = formatGhanaPhone(to)
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'api-key': ARKESEL_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: SENDER_ID,
        message,
        recipients: [phone],
      }),
    })
    const data = await response.json()
    if (response.ok && data.status === 'success') {
      return { success: true, message: 'SMS sent successfully', data }
    }
    return { success: false, message: data.message || 'Failed to send SMS', data }
  } catch (error) {
    return { success: false, message: 'SMS service error' }
  }
}

// Send bulk SMS to multiple recipients
export async function sendBulkSMS(recipients: { phone: string, message: string }[]): Promise<SMSResult[]> {
  const results = await Promise.all(
    recipients.map(r => sendSMS(r.phone, r.message))
  )
  return results
}

// Payslip ready notification
export function payslipSMSMessage(name: string, month: string, year: number, netPay: number): string {
  const firstName = name.split(' ')[0]
  return `Hi ${firstName}, your ${month} ${year} payslip is ready. Net Pay: GHS ${netPay.toLocaleString('en-GH', { minimumFractionDigits: 2 })}. Login to Pavroll ESS portal to view & download. - Pavroll`
}

// Leave approved notification
export function leaveApprovedSMSMessage(name: string, type: string, days: number, fromDate: string): string {
  const firstName = name.split(' ')[0]
  return `Hi ${firstName}, your ${type} Leave request (${days} day${days > 1 ? 's' : ''} from ${fromDate}) has been APPROVED. - Pavroll`
}

// Leave rejected notification
export function leaveRejectedSMSMessage(name: string, type: string): string {
  const firstName = name.split(' ')[0]
  return `Hi ${firstName}, your ${type} Leave request has been declined. Please contact HR for more details. - Pavroll`
}

// Payroll summary to admin
export function payrollSummarySMSMessage(month: string, year: number, employeeCount: number, totalGross: number, totalNet: number): string {
  return `Pavroll Alert: ${month} ${year} payroll processed. ${employeeCount} employees. Gross: GHS ${totalGross.toLocaleString()}. Net: GHS ${totalNet.toLocaleString()}. - Pavroll`
}
