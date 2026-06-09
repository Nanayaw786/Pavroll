import { supabase } from './supabase'

export type Employee = {
  id: string
  company_id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  basic_salary: number
  ssnit_number: string
  bank_name: string
  bank_account: string
  ghana_card: string
  join_date: string
  employment_type: string
  status: 'active' | 'archived'
  created_at: string
}

// Get company ID for current user - STRICTLY by clerk_user_id
export async function getCompanyId(clerkUserId?: string): Promise<string> {
  if (!clerkUserId) return ''
  
  try {
    // Check company_members first
    const { data: memberData } = await supabase
      .from('company_members')
      .select('company_id')
      .eq('clerk_user_id', clerkUserId)
      .eq('is_active', true)
      .maybeSingle()
    if (memberData?.company_id) return memberData.company_id

    // Check companies table directly
    const { data: companyData } = await supabase
      .from('companies')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle()
    if (companyData?.id) return companyData.id

    return ''
  } catch (err) {
    console.error('getCompanyId error:', err)
    return ''
  }
}

// Create fresh company for new user
export async function createCompanyForUser(
  clerkUserId: string,
  userEmail: string,
  userName: string
): Promise<string> {
  try {
    // Check if already exists
    const existing = await getCompanyId(clerkUserId)
    if (existing) return existing

    const now = new Date()
    const trialEnds = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('companies')
      .insert({
        clerk_user_id: clerkUserId,
        name: `${userName || 'My'} Company`,
        email: userEmail || '',
        plan: 'trial',
        is_active: true,
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEnds.toISOString(),
        features: {
          payslips: true, leave: true, reports: true,
          audit_trail: true, offboarding: true, bulk_sms: true,
          calculator: true, team: true, ess_portal: true,
          sender_id: true, loan_module: false, bonus_payroll: false,
          variance_alerts: false, custom_reports: false, multi_currency: false,
        }
      })
      .select('id')
      .single()

    if (error) throw error

    await supabase.from('company_members').insert({
      company_id: data.id,
      clerk_user_id: clerkUserId,
      email: userEmail || '',
      name: userName || 'Admin',
      role: 'admin',
      department: 'Management',
      is_active: true,
      invited_at: now.toISOString(),
      joined_at: now.toISOString(),
    })

    return data.id
  } catch (err) {
    console.error('createCompanyForUser error:', err)
    return ''
  }
}

export async function getEmployees(companyId: string) {
  if (!companyId) return []
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Employee[]
}

export async function addEmployee(employee: Omit<Employee, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single()
  if (error) throw error
  return data as Employee
}

export async function updateEmployee(id: string, updates: Partial<Employee>) {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Employee
}

export async function toggleEmployeeStatus(id: string, status: 'active' | 'archived') {
  const { error } = await supabase
    .from('employees')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function seedDemoEmployees(companyId: string) {
  // Disabled - companies start fresh
}
