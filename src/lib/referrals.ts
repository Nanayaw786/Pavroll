import { supabase } from './supabase'
import { adminData } from './adminApi'

export type ReferralPartner = {
  id: string
  name: string
  email: string
  phone: string
  code: string
  commission_rate: number
  total_referrals: number
  total_earnings: number
  is_active: boolean
  notes: string
  created_at: string
}

export type Referral = {
  id: string
  partner_id: string
  company_id: string
  company_name: string
  plan: string
  monthly_fee: number
  commission: number
  status: 'trial' | 'active' | 'cancelled'
  referred_at: string
  activated_at: string
  created_at: string
  partner?: ReferralPartner
}

const PLAN_PRICES: Record<string, number> = {
  trial: 0,
  starter: 300,
  growth: 800,
  business: 1600,
}

// Get all partners
export async function getReferralPartners(): Promise<ReferralPartner[]> {
  const { partners } = await adminData('partners:list')
  return partners as ReferralPartner[]
}

// Get single partner by code
export async function getPartnerByCode(code: string): Promise<ReferralPartner | null> {
  const { data } = await supabase
    .from('referral_partners')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()
  return data as ReferralPartner | null
}

// Create partner
export async function createReferralPartner(partner: Omit<ReferralPartner, 'id' | 'created_at' | 'total_referrals' | 'total_earnings'>): Promise<ReferralPartner> {
  const { partner: created } = await adminData('partners:create', { partner: { ...partner, code: partner.code.toUpperCase() } })
  return created as ReferralPartner
}

// Update partner
export async function updateReferralPartner(id: string, updates: Partial<ReferralPartner>): Promise<void> {
  await adminData('partners:update', { id, updates })
}

// Delete partner
export async function deleteReferralPartner(id: string): Promise<void> {
  await adminData('partners:delete', { id })
}

// Get all referrals
export async function getReferrals(partnerId?: string): Promise<Referral[]> {
  const { referrals } = await adminData('referrals:list', partnerId ? { partnerId } : {})
  return referrals as Referral[]
}

// Apply referral code when company signs up
export async function applyReferralCode(companyId: string, code: string): Promise<boolean> {
  try {
    const res = await fetch('/api/referral/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const json = await res.json().catch(() => ({}))
    return res.ok && json.success === true
  } catch {
    return false
  }
}

// Update referral when company upgrades plan
export async function updateReferralPlan(companyId: string, plan: string): Promise<void> {
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('partner_id, referral_code')
      .eq('id', companyId)
      .single()

    if (!company?.partner_id) return

    const { data: partner } = await supabase
      .from('referral_partners')
      .select('commission_rate, total_earnings')
      .eq('id', company.partner_id)
      .single()

    if (!partner) return

    const monthlyFee = PLAN_PRICES[plan] || 0
    const commission = monthlyFee * (partner.commission_rate / 100)

    await supabase.from('referrals')
      .update({
        plan,
        monthly_fee: monthlyFee,
        commission,
        status: plan === 'trial' ? 'trial' : 'active',
        activated_at: plan !== 'trial' ? new Date().toISOString() : null,
      })
      .eq('company_id', companyId)

    // Update partner earnings
    if (plan !== 'trial') {
      await supabase.from('referral_partners').update({
        total_earnings: (partner.total_earnings || 0) + commission,
      }).eq('id', company.partner_id)
    }
  } catch (err) {
    console.error('Referral update error:', err)
  }
}

// Get partner stats
export async function getPartnerStats(partnerId: string) {
  const referrals = await getReferrals(partnerId)
  return {
    total: referrals.length,
    trial: referrals.filter(r => r.status === 'trial').length,
    active: referrals.filter(r => r.status === 'active').length,
    cancelled: referrals.filter(r => r.status === 'cancelled').length,
    monthlyCommission: referrals.filter(r => r.status === 'active').reduce((s, r) => s + r.commission, 0),
    totalEarnings: referrals.reduce((s, r) => s + r.commission, 0),
  }
}

// Generate unique referral code
export function generateReferralCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6)
  const suffix = Math.floor(Math.random() * 900 + 100).toString()
  return `${prefix}${suffix}`
}
