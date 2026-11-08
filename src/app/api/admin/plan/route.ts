import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { isSuperAdmin } from '@/lib/admin'

const PLANS = ['trial', 'starter', 'growth', 'business']
const DAY_MS = 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user || !isSuperAdmin(user.primaryEmailAddress?.emailAddress)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  let body: any = {}
  try { body = await req.json() } catch { body = {} }
  const companyId = String(body?.companyId || '')
  const plan = String(body?.plan || '')
  if (!/^[0-9a-fA-F-]{36}$/.test(companyId) || !PLANS.includes(plan)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Server is not set up.' }, { status: 500 })
  }
  const admin = createClient(url, key, { auth: { persistSession: false } })
  const planExpiresAt = plan === 'trial' ? null : new Date(Date.now() + 30 * DAY_MS).toISOString()
  const update: Record<string, any> = { plan, plan_expires_at: planExpiresAt }
  if (plan !== 'trial') update.is_active = true
  const { error } = await admin.from('companies').update(update).eq('id', companyId)
  if (error) {
    return NextResponse.json({ error: 'Could not update the plan.' }, { status: 500 })
  }
  return NextResponse.json({ success: true, plan, plan_expires_at: planExpiresAt })
}