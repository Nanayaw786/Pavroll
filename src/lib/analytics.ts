import { supabase } from './supabase'

export type EventType =
  | 'page_view'
  | 'payroll_run'
  | 'employee_added'
  | 'employee_archived'
  | 'leave_submitted'
  | 'leave_approved'
  | 'leave_rejected'
  | 'payslip_downloaded'
  | 'payslip_emailed'
  | 'sms_sent'
  | 'report_exported'
  | 'login'
  | 'settings_updated'
  | 'billing_upgraded'
  | 'sender_id_requested'

export async function trackEvent(
  companyId: string,
  eventType: EventType,
  page?: string,
  eventData?: Record<string, any>
) {
  try {
    await supabase.from('app_analytics').insert({
      company_id: companyId,
      event_type: eventType,
      page: page || '',
      event_data: eventData || {},
    })
  } catch (err) {
    // Silent fail — never break the app for analytics
    console.error('Analytics error:', err)
  }
}

export async function getAnalytics(companyId?: string) {
  try {
    let query = supabase
      .from('app_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (companyId) query = query.eq('company_id', companyId)

    const { data } = await query
    return data || []
  } catch {
    return []
  }
}

export async function getAnalyticsSummary() {
  try {
    const { data } = await supabase
      .from('app_analytics')
      .select('event_type, created_at, company_id, page')
      .order('created_at', { ascending: false })
      .limit(5000)

    if (!data) return null

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const todayEvents = data.filter(e => new Date(e.created_at) >= today)
    const weekEvents = data.filter(e => new Date(e.created_at) >= thisWeek)
    const monthEvents = data.filter(e => new Date(e.created_at) >= thisMonth)
    const lastMonthEvents = data.filter(e => {
      const d = new Date(e.created_at)
      return d >= lastMonth && d <= lastMonthEnd
    })

    // Page views
    const pageViews = data.filter(e => e.event_type === 'page_view')
    const pageCounts: Record<string, number> = {}
    pageViews.forEach(e => {
      pageCounts[e.page] = (pageCounts[e.page] || 0) + 1
    })
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }))

    // Event counts
    const eventCounts: Record<string, number> = {}
    data.forEach(e => {
      eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1
    })

    // Unique companies active
    const activeCompanies = new Set(weekEvents.map(e => e.company_id)).size

    // Daily activity for last 7 days
    const dailyActivity = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000)
      const dayEvents = data.filter(e => {
        const d = new Date(e.created_at)
        return d >= day && d < nextDay
      })
      dailyActivity.push({
        date: day.toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric' }),
        events: dayEvents.length,
        payrollRuns: dayEvents.filter(e => e.event_type === 'payroll_run').length,
        logins: dayEvents.filter(e => e.event_type === 'login').length,
      })
    }

    return {
      total: data.length,
      today: todayEvents.length,
      thisWeek: weekEvents.length,
      thisMonth: monthEvents.length,
      lastMonth: lastMonthEvents.length,
      growth: lastMonthEvents.length > 0
        ? Math.round(((monthEvents.length - lastMonthEvents.length) / lastMonthEvents.length) * 100)
        : 0,
      topPages,
      eventCounts,
      activeCompanies,
      dailyActivity,
      payrollRuns: eventCounts['payroll_run'] || 0,
      employeesAdded: eventCounts['employee_added'] || 0,
      payslipsDownloaded: eventCounts['payslip_downloaded'] || 0,
      smsSent: eventCounts['sms_sent'] || 0,
      leavesSubmitted: eventCounts['leave_submitted'] || 0,
      reportsExported: eventCounts['report_exported'] || 0,
    }
  } catch {
    return null
  }
}
