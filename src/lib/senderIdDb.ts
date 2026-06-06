import { supabase } from './supabase'

export type SenderIdRequest = {
  id: string
  company_id: string
  company_name: string
  sender_id: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string
  created_at: string
  updated_at: string
}

export async function getSenderIdRequests(companyId?: string): Promise<SenderIdRequest[]> {
  let query = supabase
    .from('sender_id_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (companyId) query = query.eq('company_id', companyId)
  const { data, error } = await query
  if (error) throw error
  return data as SenderIdRequest[]
}

export async function createSenderIdRequest(request: Omit<SenderIdRequest, 'id' | 'created_at' | 'updated_at'>): Promise<SenderIdRequest> {
  const { data, error } = await supabase
    .from('sender_id_requests')
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data as SenderIdRequest
}

export async function updateSenderIdStatus(id: string, status: 'approved' | 'rejected', adminNote?: string): Promise<void> {
  const { error } = await supabase
    .from('sender_id_requests')
    .update({ status, admin_note: adminNote, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function getApprovedSenderId(companyId: string): Promise<string | null> {
  const { data } = await supabase
    .from('sender_id_requests')
    .select('sender_id')
    .eq('company_id', companyId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data?.sender_id || null
}
