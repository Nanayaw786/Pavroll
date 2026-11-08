import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Amounts in pesewas (GHS x 100). Keep these in step with the prices shown on the site.
const PLAN_BY_AMOUNT: Record<number, string> = {
  30000: 'starter',
  80000: 'growth',
  160000: 'business',
}

const DAY_MS = 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Please log in to activate your plan.' }, { status: 401 })
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!paystackSecret || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Billing is not set up on the server.' }, { status: 500 })
  }
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  let reference = ''
  try {
    const body = await req.json()
    reference = String(body?.reference || '')
  } catch {
    reference = ''
  }
  if (!/^[A-Za-z0-9_.=-]{6,100}$/.test(reference)) {
    return NextResponse.json({ error: 'Invalid payment reference.' }, { status: 400 })
  }

  // Find the company that belongs to the logged-in user
  const { data: member } = await admin
    .from('company_members')
    .select('company_id')
    .eq('clerk_user_id', userId)
    .eq('is_active', true)
    .maybeSingle()
  let companyId: string = member?.company_id || ''
  if (!companyId) {
    const { data: owned } = await admin
      .from('companies')
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle()
    companyId = owned?.id || ''
  }
  if (!companyId) {
    return NextResponse.json({ error: 'We could not find your company.' }, { status: 404 })
  }

  // Ask Paystack whether this payment really happened
  let payment: any = null
  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
      cache: 'no-store',
    })
    const json = await res.json()
    payment = json?.status ? json.data : null
  } catch {
    payment = null
  }
  if (!payment || payment.status !== 'success') {
    return NextResponse.json({ error: 'We could not confirm this payment.' }, { status: 400 })
  }
  if (payment.currency !== 'GHS') {
    return NextResponse.json({ error: 'This payment was not made in GHS.' }, { status: 400 })
  }
  const plan = PLAN_BY_AMOUNT[Number(payment.amount)]
  if (!plan) {
    return NextResponse.json({ error: 'This payment amount does not match any plan.' }, { status: 400 })
  }

  // A payment can be used only once
  const { data: existing } = await admin
    .from('payments')
    .select('company_id, plan, amount')
    .eq('reference', reference)
    .maybeSingle()
  if (existing) {
    if (existing.company_id === companyId) {
      return NextResponse.json({ success: true, plan: existing.plan, amount: existing.amount, reference, alreadyApplied: true })
    }
    return NextResponse.json({ error: 'This payment has already been used.' }, { status: 409 })
  }
  const { error: insertError } = await admin
    .from('payments')
    .insert({ reference, company_id: companyId, plan, amount: payment.amount, currency: 'GHS' })
  if (insertError) {
    return NextResponse.json({ error: 'Could not record the payment. Please try again.' }, { status: 409 })
  }

  // Activate the plan for 30 days (adds on top if the current plan is still running)
  const { data: company } = await admin
    .from('companies')
    .select('plan, plan_expires_at')
    .eq('id', companyId)
    .maybeSingle()
  const now = Date.now()
  const currentEnd = company?.plan && company.plan !== 'trial' && company.plan_expires_at
    ? new Date(company.plan_expires_at).getTime()
    : 0
  const start = currentEnd > now ? currentEnd : now
  const expiresAt = new Date(start + 30 * DAY_MS).toISOString()

  const { error: updateError } = await admin
    .from('companies')
    .update({ plan, is_active: true, plan_expires_at: expiresAt })
    .eq('id', companyId)
  if (updateError) {
    await admin.from('payments').delete().eq('reference', reference)
    return NextResponse.json(
      { error: `Your payment was received but the plan could not be saved. Please contact support with reference ${reference}.` },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, plan, amount: payment.amount, reference, expiresAt })
}