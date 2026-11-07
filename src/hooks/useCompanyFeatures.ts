'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { getCompanyId } from '@/lib/employees'

export type CompanyFeatures = {
  // Core premium features (ON by default)
  payslips: boolean
  leave: boolean
  reports: boolean
  audit_trail: boolean
  offboarding: boolean
  bulk_sms: boolean
  calculator: boolean
  team: boolean
  ess_portal: boolean
  sender_id: boolean
  // Advanced features (OFF by default)
  loan_module: boolean
  bonus_payroll: boolean
  variance_alerts: boolean
  custom_reports: boolean
  multi_currency: boolean
}

export const DEFAULT_FEATURES: CompanyFeatures = {
  // Core premium — ON by default
  payslips: true,
  leave: true,
  reports: true,
  audit_trail: true,
  offboarding: true,
  bulk_sms: true,
  calculator: true,
  team: true,
  ess_portal: true,
  sender_id: true,
  // Advanced — OFF by default
  loan_module: false,
  bonus_payroll: false,
  variance_alerts: false,
  custom_reports: false,
  multi_currency: false,
}

export function useCompanyFeatures() {
  const { user, isLoaded } = useUser()
  const [features, setFeatures] = useState<CompanyFeatures>(DEFAULT_FEATURES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait until Clerk has loaded the user before looking up the company
    if (!isLoaded) return
    if (!user?.id) {
      setLoading(false)
      return
    }
    loadFeatures(user.id)
  }, [isLoaded, user?.id])

  const loadFeatures = async (userId: string) => {
    try {
      const cId = await getCompanyId(userId)
      if (!cId) return
      const { data } = await supabase
        .from('companies')
        .select('features')
        .eq('id', cId)
        .single()
      if (data?.features) {
        setFeatures({ ...DEFAULT_FEATURES, ...data.features })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { features, loading }
}