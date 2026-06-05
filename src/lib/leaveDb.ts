import { supabase } from './supabase'

export type LeaveRequest = {
  id: string
  company_id: string
  employee_id: string
  type: string
  from_date: string
  to_date: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  employee?: {
    name: string
    department: string
  }
}

export async function getLeaveRequests(companyId: string): Promise<LeaveRequest[]> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select(`*, employee:employees(name, department)`)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as LeaveRequest[]
}

export async function addLeaveRequest(request: Omit<LeaveRequest, 'id' | 'created_at' | 'employee'>): Promise<LeaveRequest> {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert(request)
    .select(`*, employee:employees(name, department)`)
    .single()
  if (error) throw error
  return data as LeaveRequest
}

export async function updateLeaveStatus(id: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
  const { error } = await supabase
    .from('leave_requests')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}
