import { supabase } from './supabase'

export type Role = 'admin' | 'hr' | 'accountant' | 'manager'

export type CompanyMember = {
  id: string
  company_id: string
  clerk_user_id: string
  email: string
  name: string
  role: Role
  department: string
  is_active: boolean
  invited_at: string
  joined_at: string
  created_at: string
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin (Owner)',
  hr: 'HR Manager',
  accountant: 'Accountant',
  manager: 'Department Manager',
}

export const ROLE_COLORS: Record<Role, string> = {
  admin: '#6366F1',
  hr: '#10B981',
  accountant: '#F59E0B',
  manager: '#06B6D4',
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: ['dashboard', 'employees', 'payroll', 'payslips', 'leave', 'reports', 'audit', 'offboarding', 'sms', 'settings', 'team'],
  hr: ['dashboard', 'employees', 'leave', 'offboarding', 'sms'],
  accountant: ['dashboard', 'payroll', 'payslips', 'reports', 'audit'],
  manager: ['dashboard', 'employees', 'leave'],
}

export function hasPermission(role: Role, module: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(module) || false
}

// Get member by Clerk user ID
export async function getMemberByClerkId(clerkUserId: string): Promise<CompanyMember | null> {
  const { data, error } = await supabase
    .from('company_members')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .eq('is_active', true)
    .single()
  if (error) return null
  return data as CompanyMember
}

// Get all members for a company
export async function getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
  const { data, error } = await supabase
    .from('company_members')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as CompanyMember[]
}

// Add a member
export async function addCompanyMember(member: Omit<CompanyMember, 'id' | 'created_at'>): Promise<CompanyMember> {
  const { data, error } = await supabase
    .from('company_members')
    .insert(member)
    .select()
    .single()
  if (error) throw error
  return data as CompanyMember
}

// Update member role
export async function updateMemberRole(id: string, role: Role): Promise<void> {
  const { error } = await supabase
    .from('company_members')
    .update({ role })
    .eq('id', id)
  if (error) throw error
}

// Deactivate member
export async function deactivateMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('company_members')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}

// Seed admin member for existing company
export async function seedAdminMember(companyId: string, clerkUserId: string, email: string, name: string): Promise<void> {
  const existing = await getMemberByClerkId(clerkUserId)
  if (existing) return
  await addCompanyMember({
    company_id: companyId,
    clerk_user_id: clerkUserId,
    email,
    name,
    role: 'admin',
    department: 'Management',
    is_active: true,
    invited_at: new Date().toISOString(),
    joined_at: new Date().toISOString(),
  })
}
