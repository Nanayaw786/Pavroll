import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { isSuperAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

async function countRows(admin: any, table: string, companyId: string): Promise<number> {
  const { count } = await admin.from(table).select('id', { count: 'exact', head: true }).eq('company_id', companyId)
  return count || 0
}

async function latestRow(admin: any, table: string, companyId: string): Promise<string | null> {
  const { data } = await admin.from(table).select('created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(1)
  return data?.[0]?.created_at || null
}

export async function GET() {
  const user = await currentUser()
  if (!user || !isSuperAdmin(user.primaryEmailAddress?.emailAddress)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Server is not set up.' }, { status: 500 })
  }
  const admin: any = createClient(url, key, { auth: { persistSession: false } })

  const { data: companies, error } = await admin.from('companies').select('id').limit(300)
  if (error) {
    return NextResponse.json({ error: 'Could not load companies.' }, { status: 500 })
  }

  const usage: Record<string, any> = {}
  await Promise.all((companies || []).map(async (c: any) => {
    const [employees, payrollRuns, leaves, lastPayroll, lastAudit, lastLeave, lastEmployee] = await Promise.all([
      countRows(admin, 'employees', c.id),
      countRows(admin, 'payroll_runs', c.id),
      countRows(admin, 'leave_requests', c.id),
      latestRow(admin, 'payroll_runs', c.id),
      latestRow(admin, 'audit_logs', c.id),
      latestRow(admin, 'leave_requests', c.id),
      latestRow(admin, 'employees', c.id),
    ])
    const dates = [lastPayroll, lastAudit, lastLeave, lastEmployee].filter(Boolean) as string[]
    dates.sort()
    usage[c.id] = {
      employees,
      payroll_runs: payrollRuns,
      leave_requests: leaves,
      last_activity_at: dates.length ? dates[dates.length - 1] : null,
    }
  }))

  return NextResponse.json({ usage })
}