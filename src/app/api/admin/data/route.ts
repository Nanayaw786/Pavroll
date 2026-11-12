import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { isSuperAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-fA-F-]{36}$/
const FEATURE_KEYS = [
  'payslips', 'leave', 'reports', 'audit_trail', 'offboarding', 'bulk_sms', 'calculator', 'team',
  'ess_portal', 'sender_id', 'loan_module', 'bonus_payroll', 'variance_alerts', 'custom_reports', 'multi_currency',
]
const PARTNER_FIELDS = ['name', 'email', 'phone', 'code', 'commission_rate', 'total_referrals', 'total_earnings', 'is_active', 'notes']

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

function pick(obj: any, keys: string[]) {
  const out: Record<string, any> = {}
  if (!obj || typeof obj !== 'object') return out
  for (const k of keys) if (k in obj) out[k] = obj[k]
  return out
}

function cleanCode(value: any) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function POST(req: NextRequest) {
  const user = await currentUser()
  if (!user || !isSuperAdmin(user.primaryEmailAddress?.emailAddress)) return fail('Forbidden', 403)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return fail('Server is not set up.', 500)
  const db = createClient(url, key, { auth: { persistSession: false } })

  let body: any = {}
  try { body = await req.json() } catch { body = {} }
  const action = String(body?.action || '')

  try {
    switch (action) {
      case 'companies:list': {
        const { data, error } = await db.from('companies').select('*').order('created_at', { ascending: false })
        if (error) throw error
        return NextResponse.json({ companies: data || [] })
      }

      case 'companies:feature': {
        const companyId = String(body.companyId || '')
        const feature = String(body.feature || '')
        if (!UUID.test(companyId) || !FEATURE_KEYS.includes(feature) || typeof body.value !== 'boolean') {
          return fail('Invalid request.')
        }
        const { data: company, error: readErr } = await db.from('companies').select('features').eq('id', companyId).maybeSingle()
        if (readErr) throw readErr
        if (!company) return fail('Company not found.', 404)
        const features = { ...(company.features || {}), [feature]: body.value }
        const { error } = await db.from('companies').update({ features }).eq('id', companyId)
        if (error) throw error
        return NextResponse.json({ success: true, features })
      }

      case 'senderids:list': {
        const { data, error } = await db.from('sender_id_requests').select('*').order('created_at', { ascending: false })
        if (error) throw error
        return NextResponse.json({ requests: data || [] })
      }

      case 'senderids:status': {
        const id = String(body.id || '')
        const status = String(body.status || '')
        if (!UUID.test(id) || !['approved', 'rejected'].includes(status)) return fail('Invalid request.')
        const update: Record<string, any> = { status, updated_at: new Date().toISOString() }
        if (typeof body.adminNote === 'string') update.admin_note = body.adminNote.slice(0, 500)
        const { error } = await db.from('sender_id_requests').update(update).eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'partners:list': {
        const { data, error } = await db.from('referral_partners').select('*').order('created_at', { ascending: false })
        if (error) throw error
        return NextResponse.json({ partners: data || [] })
      }

      case 'partners:create': {
        const p = pick(body.partner, PARTNER_FIELDS)
        const name = String(p.name || '').trim()
        const code = cleanCode(p.code)
        const rate = Number(p.commission_rate ?? 10)
        if (!name || code.length < 3) return fail('A name and a code of at least 3 letters or digits are required.')
        if (!(rate >= 0 && rate <= 100)) return fail('Commission rate must be between 0 and 100.')
        const { data, error } = await db
          .from('referral_partners')
          .insert({ ...p, name, code, commission_rate: rate })
          .select()
          .single()
        if (error) throw error
        return NextResponse.json({ partner: data })
      }

      case 'partners:update': {
        const id = String(body.id || '')
        if (!UUID.test(id)) return fail('Invalid request.')
        const updates = pick(body.updates, PARTNER_FIELDS)
        if ('code' in updates) updates.code = cleanCode(updates.code)
        if ('commission_rate' in updates) {
          const rate = Number(updates.commission_rate)
          if (!(rate >= 0 && rate <= 100)) return fail('Commission rate must be between 0 and 100.')
          updates.commission_rate = rate
        }
        if (Object.keys(updates).length === 0) return fail('Nothing to update.')
        const { error } = await db.from('referral_partners').update(updates).eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'partners:delete': {
        const id = String(body.id || '')
        if (!UUID.test(id)) return fail('Invalid request.')
        const { error } = await db.from('referral_partners').delete().eq('id', id)
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'referrals:list': {
        let query = db.from('referrals').select('*, partner:referral_partners(*)').order('created_at', { ascending: false })
        if (body.partnerId) {
          if (!UUID.test(String(body.partnerId))) return fail('Invalid request.')
          query = query.eq('partner_id', String(body.partnerId))
        }
        const { data, error } = await query
        if (error) throw error
        return NextResponse.json({ referrals: data || [] })
      }

      case 'analytics:rows': {
        const limit = Math.min(Math.max(Number(body.limit) || 5000, 1), 5000)
        let query = db.from('app_analytics').select('*').order('created_at', { ascending: false }).limit(limit)
        if (body.companyId) {
          if (!UUID.test(String(body.companyId))) return fail('Invalid request.')
          query = query.eq('company_id', String(body.companyId))
        }
        const { data, error } = await query
        if (error) throw error
        return NextResponse.json({ rows: data || [] })
      }

      default:
        return fail('Unknown action.')
    }
  } catch (err) {
    console.error('admin data error', err)
    return fail('Request failed.', 500)
  }
}
