import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { isSuperAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

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
  const admin = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await admin
    .from('payments')
    .select('id, reference, company_id, plan, amount, currency, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) {
    return NextResponse.json({ error: 'Could not load payments.' }, { status: 500 })
  }
  return NextResponse.json({ payments: data || [] })
}