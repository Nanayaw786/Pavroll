import { supabase } from './supabase'

export type TrialStatus = {
  isActive: boolean
  isTrial: boolean
  isExpired: boolean
  daysLeft: number
  plan: string
  trialEndsAt: string | null
}

export async function getTrialStatus(companyId: string): Promise<TrialStatus> {
  const { data, error } = await supabase
    .from('companies')
    .select('trial_started_at, trial_ends_at, plan, is_active')
    .eq('id', companyId)
    .single()

  if (error || !data) {
    return { isActive: false, isTrial: false, isExpired: true, daysLeft: 0, plan: 'trial', trialEndsAt: null }
  }

  const now = new Date()
  const trialEndsAt = data.trial_ends_at ? new Date(data.trial_ends_at) : null
  const isTrial = data.plan === 'trial'
  const isExpired = isTrial && trialEndsAt ? now > trialEndsAt : false
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0
  const isActive = data.is_active && !isExpired

  return {
    isActive,
    isTrial,
    isExpired,
    daysLeft,
    plan: data.plan || 'trial',
    trialEndsAt: data.trial_ends_at,
  }
}

export function getTrialBannerColor(daysLeft: number): string {
  if (daysLeft <= 3) return '#EF4444'
  if (daysLeft <= 7) return '#F59E0B'
  return '#6366F1'
}

export function getTrialMessage(daysLeft: number): string {
  if (daysLeft === 0) return 'Your trial expires today! Upgrade now to keep access.'
  if (daysLeft === 1) return 'Last day of your trial! Upgrade now to keep access.'
  if (daysLeft <= 3) return `Only ${daysLeft} days left in your trial. Upgrade now!`
  if (daysLeft <= 7) return `${daysLeft} days left in your free trial. Upgrade to keep access.`
  return `${daysLeft} days left in your free trial.`
}
