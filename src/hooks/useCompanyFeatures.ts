'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCompanyId } from '@/lib/employees'

export type CompanyFeatures = {
  loan_module: boolean
  bonus_payroll: boolean
  variance_alerts: boolean
  custom_reports: boolean
  bulk_sms: boolean
  ess_portal: boolean
  offboarding: boolean
  sender_id: boolean
  multi_currency: boolean
}

const DEFAULT_FEATURES: CompanyFeatures = {
  loan_module: false,
  bonus_payroll: false,
  variance_alerts: false,
  custom_reports: false,
  bulk_sms: true,
  ess_portal: true,
  offboarding: true,
  sender_id: true,
  multi_currency: false,
}

export function useCompanyFeatures() {
  const [features, setFeatures] = useState<CompanyFeatures>(DEFAULT_FEATURES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeatures()
  }, [])

  const loadFeatures = async () => {
    try {
      const cId = await getCompanyId()
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
