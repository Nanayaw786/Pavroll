import { supabase } from './supabase'

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
  starter: 120,
  growth: 350,
  business: 800,
}

// Get all partners
export async function getReferralPartners(): Promise<ReferralPartner[]> {
  const { data, error } = await supabase
    .from('referral_partners')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as ReferralPartner[]
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
  const { data, error } = await supabase
    .from('referral_partners')
    .insert({ ...partner, code: partner.code.toUpperCase() })
    .select()
    .single()
  if (error) throw error
  return data as ReferralPartner
}

// Update partner
export async function updateReferralPartner(id: string, updates: Partial<ReferralPartner>): Promise<void> {
  const { error } = await supabase
    .from('referral_partners')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

// Delete partner
export async function deleteReferralPartner(id: string): Promise<void> {
  const { error } = await supabase
    .from('referral_partners')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Get all referrals
export async function getReferrals(partnerId?: string): Promise<Referral[]> {
  let query = supabase
    .from('referrals')
    .select(`*, partner:referral_partners(*)`)
    .order('created_at', { ascending: false })
  if (partnerId) query = query.eq('partner_id', partnerId)
  const { data, error } = await query
  if (error) throw error
  return data as Referral[]
}

// Apply referral code when company signs up
export async function applyReferralCode(companyId: string, code: string): Promise<boolean> {
  try {
    const partner = await getPartnerByCode(code)
    if (!partner) return false

    // Update company with referral info
    await supabase.from('companies').update({
      referral_code: code.toUpperCase(),
      partner_id: partner.id,
    }).eq('id', companyId)

    // Get company name
    const { data: company } = await supabase
      .from('companies')
      .select('name, plan')
      .eq('id', companyId)
      .single()

    // Create referral record
    await supabase.from('referrals').insert({
      partner_id: partner.id,
      company_id: companyId,
      company_name: company?.name || 'Unknown',
      plan: company?.plan || 'trial',
      monthly_fee: PLAN_PRICES[company?.plan || 'trial'],
      commission: PLAN_PRICES[company?.plan || 'trial'] * (partner.commission_rate / 100),
      status: company?.plan === 'trial' ? 'trial' : 'active',
    })

    // Update partner total referrals
    await supabase.from('referral_partners').update({
      total_referrals: partner.total_referrals + 1,
    }).eq('id', partner.id)

    return true
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
