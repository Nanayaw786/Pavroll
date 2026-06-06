import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, sendBulkSMS, payslipSMSMessage, leaveApprovedSMSMessage, leaveRejectedSMSMessage, payrollSummarySMSMessage } from '@/lib/sms'
import { rateLimit, getClientIP } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  // Rate limit: 50 SMS requests per hour per IP
  const ip = getClientIP(req)
  const limit = rateLimit(`sms_${ip}`, { maxRequests: 50, windowMs: 60 * 60 * 1000 })
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }
  try {
    const body = await req.json()
    const { sanitizeString, sanitizePhone } = await import('@/lib/sanitize')
    const type = sanitizeString(body.type || '')
    const data = body.data || {}

    switch (type) {
      case 'payslip': {
        const { employees, month, year } = data
        const results = await sendBulkSMS(
          employees.map((emp: any) => ({
            phone: emp.phone,
            message: payslipSMSMessage(emp.name, month, year, emp.netPay)
          }))
        )
        const sent = results.filter(r => r.success).length
        return NextResponse.json({ success: true, sent, total: employees.length })
      }

      case 'leave_approved': {
        const { phone, name, leaveType, days, fromDate } = data
        const result = await sendSMS(phone, leaveApprovedSMSMessage(name, leaveType, days, fromDate))
        return NextResponse.json(result)
      }

      case 'leave_rejected': {
        const { phone, name, leaveType } = data
        const result = await sendSMS(phone, leaveRejectedSMSMessage(name, leaveType))
        return NextResponse.json(result)
      }

      case 'payroll_summary': {
        const { adminPhone, month, year, employeeCount, totalGross, totalNet } = data
        const result = await sendSMS(adminPhone, payrollSummarySMSMessage(month, year, employeeCount, totalGross, totalNet))
        return NextResponse.json(result)
      }

      case 'custom': {
        const { phone, message } = data
        const result = await sendSMS(phone, message)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ error: 'Invalid SMS type' }, { status: 400 })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'SMS service error' }, { status: 500 })
  }
}
