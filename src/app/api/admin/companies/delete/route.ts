import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { isSuperAdmin } from '@/lib/admin'

export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user || !isSuperAdmin(user.primaryEmailAddress?.emailAddress)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  let body: any = {}
  try { body = await req.json() } catch { body = {} }
  const companyId = String(body?.companyId || '')
  const confirmName = String(body?.confirmName || '').trim().toLowerCase()
  if (!/^[0-9a-fA-F-]{36}$/.test(companyId)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Server is not set up.' }, { status: 500 })
  }
  const admin = createClient(url, key, { auth: { persistSession: false } })

  const { data: company } = await admin.from('companies').select('id, name').eq('id', companyId).maybeSingle()
  if (!company) {
    return NextResponse.json({ error: 'Company not found.' }, { status: 404 })
  }
  const expected = String(company.name || '').trim().toLowerCase() || 'delete'
  if (confirmName !== expected) {
    return NextResponse.json({ error: 'The name you typed did not match. Nothing was deleted.' }, { status: 400 })
  }

  const { count } = await admin.from('payments').select('id', { count: 'exact', head: true }).eq('company_id', companyId)
  if (count && count > 0) {
    return NextResponse.json({ error: 'This company has recorded payments, so it cannot be deleted. Payment records are kept.' }, { status: 409 })
  }

  const { error } = await admin.rpc('admin_delete_company', { p_company_id: companyId })
  if (error) {
    return NextResponse.json({ error: `Could not delete: ${error.message}` }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}