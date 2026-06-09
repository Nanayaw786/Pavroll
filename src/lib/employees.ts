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

// Get company ID for current user by clerk_user_id
export async function getCompanyId(clerkUserId?: string): Promise<string> {
  try {
    if (clerkUserId) {
      // Check company_members first
      const { data: memberData } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('clerk_user_id', clerkUserId)
        .eq('is_active', true)
        .limit(1)
        .single()
      if (memberData?.company_id) return memberData.company_id

      // Check companies table
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single()
      if (companyData?.id) return companyData.id
    }

    // No company found - return empty string
    // New company will be created on dashboard load
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
    // Check if company already exists
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
          loan_module: false,
          bonus_payroll: false,
          variance_alerts: false,
          custom_reports: false,
          multi_currency: false,
        }
      })
      .select('id')
      .single()

    if (error) throw error

    // Add as admin member
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
  const existing = await getEmployees(companyId)
  if (existing.length > 0) return
  const demo = [
    { company_id: companyId, name: 'Kwame Mensah', email: 'kwame@company.com', phone: '0244123456', department: 'Engineering', position: 'Senior Developer', basic_salary: 5000, ssnit_number: 'SSN-001234', bank_name: 'GCB Bank', bank_account: '1234567890', ghana_card: 'GHA-000123456-7', join_date: '2023-01-15', employment_type: 'Full-time', status: 'active' as const },
    { company_id: companyId, name: 'Ama Owusu', email: 'ama@company.com', phone: '0244234567', department: 'HR', position: 'HR Manager', basic_salary: 4200, ssnit_number: 'SSN-001235', bank_name: 'Ecobank', bank_account: '0987654321', ghana_card: 'GHA-000234567-8', join_date: '2022-06-01', employment_type: 'Full-time', status: 'active' as const },
    { company_id: companyId, name: 'Kofi Asante', email: 'kofi@company.com', phone: '0244345678', department: 'Finance', position: 'Accountant', basic_salary: 3800, ssnit_number: 'SSN-001236', bank_name: 'Absa Bank', bank_account: '1122334455', ghana_card: 'GHA-000345678-9', join_date: '2023-03-10', employment_type: 'Full-time', status: 'active' as const },
  ]
  for (const emp of demo) {
    await supabase.from('employees').insert(emp)
  }
}
