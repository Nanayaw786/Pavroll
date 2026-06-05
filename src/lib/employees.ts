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

// Get company id — for now use the seeded demo company
export async function getCompanyId(): Promise<string> {
  const { data } = await supabase
    .from('companies')
    .select('id')
    .limit(1)
    .single()
  return data?.id || ''
}

// Get all employees
export async function getEmployees(companyId: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Employee[]
}

// Add employee
export async function addEmployee(employee: Omit<Employee, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single()
  if (error) throw error
  return data as Employee
}

// Update employee
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

// Archive / restore employee
export async function toggleEmployeeStatus(id: string, status: 'active' | 'archived') {
  const { error } = await supabase
    .from('employees')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

// Seed demo employees
export async function seedDemoEmployees(companyId: string) {
  const demo = [
    { company_id: companyId, name: 'Kwame Mensah', email: 'kwame@company.com', phone: '0244123456', department: 'Engineering', position: 'Senior Developer', basic_salary: 5000, ssnit_number: 'SSN-001234', bank_name: 'GCB Bank', bank_account: '1234567890', ghana_card: 'GHA-000123456-7', join_date: '2023-01-15', employment_type: 'Full-time', status: 'active' as const },
    { company_id: companyId, name: 'Ama Owusu', email: 'ama@company.com', phone: '0244234567', department: 'HR', position: 'HR Manager', basic_salary: 4200, ssnit_number: 'SSN-001235', bank_name: 'Ecobank', bank_account: '0987654321', ghana_card: 'GHA-000234567-8', join_date: '2022-06-01', employment_type: 'Full-time', status: 'active' as const },
    { company_id: companyId, name: 'Kofi Asante', email: 'kofi@company.com', phone: '0244345678', department: 'Finance', position: 'Accountant', basic_salary: 3800, ssnit_number: 'SSN-001236', bank_name: 'Absa Bank', bank_account: '1122334455', ghana_card: 'GHA-000345678-9', join_date: '2023-03-10', employment_type: 'Full-time', status: 'active' as const },
    { company_id: companyId, name: 'Akosua Boateng', email: 'akosua@company.com', phone: '0244456789', department: 'Sales', position: 'Sales Lead', basic_salary: 3500, ssnit_number: 'SSN-001237', bank_name: 'Stanbic Bank', bank_account: '5566778899', ghana_card: 'GHA-000456789-0', join_date: '2022-11-20', employment_type: 'Full-time', status: 'active' as const },
  ]
  const { error } = await supabase.from('employees').insert(demo)
  if (error) throw error
}
