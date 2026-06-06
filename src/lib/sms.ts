// JospigarBulkSMS API for Ghana

const API_KEY = process.env.ARKESEL_API_KEY!
const SENDER_ID = process.env.ARKESEL_SENDER_ID || 'Pavroll'
const BASE_URL = 'https://sms.jospigarbulksms.com/smsapi'

export type SMSResult = {
  success: boolean
  message: string
  data?: any
}

// Format Ghana phone number
export function formatGhanaPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '')
  if (cleaned.startsWith('+233')) return cleaned.slice(1)
  if (cleaned.startsWith('233')) return cleaned
  if (cleaned.startsWith('0')) return `233${cleaned.slice(1)}`
  return `233${cleaned}`
}

// Send single SMS
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  try {
    const phone = formatGhanaPhone(to)
    const url = `${BASE_URL}?key=${API_KEY}&to=${phone}&msg=${encodeURIComponent(message)}&sender_id=${encodeURIComponent(SENDER_ID)}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.success === true || data.code === 1000) {
      return { success: true, message: 'SMS sent successfully', data }
    }

    const errorMap: Record<number, string> = {
      1002: 'SMS sending failed',
      1003: 'Insufficient SMS balance — please top up',
      1004: 'Invalid API key',
      1005: 'Invalid phone number',
      1006: 'Invalid sender ID',
      1008: 'Empty message',
    }
    return { success: false, message: data.message || errorMap[data.code] || `Failed (code: ${data.code})`, data }
  } catch (error) {
    return { success: false, message: 'SMS service error' }
  }
}

// Send bulk SMS
export async function sendBulkSMS(recipients: { phone: string, message: string }[]): Promise<SMSResult[]> {
  const results = await Promise.all(
    recipients.map(r => sendSMS(r.phone, r.message))
  )
  return results
}

// Message templates
export function payslipSMSMessage(name: string, month: string, year: number, netPay: number): string {
  const firstName = name.split(' ')[0]
  return `Hi ${firstName}, your ${month} ${year} payslip is ready. Net Pay: GHS ${netPay.toLocaleString('en-GH', { minimumFractionDigits: 2 })}. Login to Pavroll ESS to view & download.`
}

export function leaveApprovedSMSMessage(name: string, type: string, days: number, fromDate: string): string {
  const firstName = name.split(' ')[0]
  return `Hi ${firstName}, your ${type} Leave (${days} day${days > 1 ? 's' : ''} from ${fromDate}) has been APPROVED. - Pavroll`
}

export function leaveRejectedSMSMessage(name: string, type: string): string {
  const firstName = name.split(' ')[0]
  return `Hi ${firstName}, your ${type} Leave request has been declined. Contact HR for details. - Pavroll`
}

export function payrollSummarySMSMessage(month: string, year: number, employeeCount: number, totalGross: number, totalNet: number): string {
  return `Pavroll: ${month} ${year} payroll done. ${employeeCount} employees. Gross: GHS ${totalGross.toLocaleString()}. Net: GHS ${totalNet.toLocaleString()}.`
}
