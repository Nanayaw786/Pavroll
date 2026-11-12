import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user) return fail('Please log in.', 401)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return fail('Server is not set up.', 500)
  const db = createClient(url, key, { auth: { persistSession: false } })

  let body: any = {}
  try { body = await req.json() } catch { body = {} }
  const code = String(body?.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (code.length < 3 || code.length > 20) return fail('That referral code is not valid.')

  // The company that belongs to the logged-in user
  const { data: member } = await db
    .from('company_members')
    .select('company_id')
    .eq('clerk_user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  let companyId: string = member?.company_id || ''
  if (!companyId) {
    const { data: owned } = await db.from('companies').select('id').eq('clerk_user_id', user.id).maybeSingle()
    companyId = owned?.id || ''
  }
  if (!companyId) return fail('We could not find your company.', 404)

  const { data: company } = await db.from('companies').select('name, partner_id').eq('id', companyId).maybeSingle()
  if (!company) return fail('We could not find your company.', 404)
  if (company.partner_id) return fail('A referral code has already been applied.', 409)

  const { data: partner } = await db
    .from('referral_partners')
    .select('id, email, total_referrals')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle()
  if (!partner) return fail('That referral code is not valid.', 404)

  const myEmail = (user.primaryEmailAddress?.emailAddress || '').trim().toLowerCase()
  if (myEmail && String(partner.email || '').trim().toLowerCase() === myEmail) {
    return fail('You cannot use your own referral code.')
  }

  const { error: updateError } = await db
    .from('companies')
    .update({ referral_code: code, partner_id: partner.id })
    .eq('id', companyId)
  if (updateError) return fail('Could not apply the code. Please try again.', 500)

  const { data: existing } = await db.from('referrals').select('id').eq('company_id', companyId).maybeSingle()
  if (!existing) {
    await db.from('referrals').insert({
      partner_id: partner.id,
      company_id: companyId,
      company_name: company.name || 'Unknown',
      plan: 'trial',
      monthly_fee: 0,
      commission: 0,
      status: 'trial',
    })
    await db.from('referral_partners').update({ total_referrals: (partner.total_referrals || 0) + 1 }).eq('id', partner.id)
  }

  return NextResponse.json({ success: true })
}
