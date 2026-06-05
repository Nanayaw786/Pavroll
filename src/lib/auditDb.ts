import { supabase } from './supabase'

export type AuditLog = {
  id: string
  company_id: string
  user_email: string
  action: string
  module: string
  details: string
  severity: 'info' | 'warning' | 'critical'
  created_at: string
}

export async function getAuditLogs(companyId: string): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data as AuditLog[]
}

export async function addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase
    .from('audit_logs')
    .insert(log)
  if (error) throw error
}
