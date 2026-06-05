import { supabase } from './supabase'
import { calculatePayroll } from './payroll'
import { getEmployees } from './employees'

export type PayrollRun = {
  id: string
  company_id: string
  month: number
  year: number
  total_gross: number
  total_net: number
  total_paye: number
  total_ssnit: number
  employee_count: number
  status: 'draft' | 'processed' | 'paid'
  created_at: string
}

export type PayrollItem = {
  id: string
  payroll_run_id: string
  employee_id: string
  basic_salary: number
  gross_salary: number
  ssnit_employee: number
  ssnit_employer: number
  tier2_employer: number
  paye: number
  total_deductions: number
  net_pay: number
  created_at: string
  employee?: {
    name: string
    department: string
    position: string
    ssnit_number: string
    bank_name: string
    bank_account: string
  }
}

// Get all payroll runs for a company
export async function getPayrollRuns(companyId: string): Promise<PayrollRun[]> {
  const { data, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('company_id', companyId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
  if (error) throw error
  return data as PayrollRun[]
}

// Get payroll items for a run
export async function getPayrollItems(payrollRunId: string): Promise<PayrollItem[]> {
  const { data, error } = await supabase
    .from('payroll_items')
    .select(`*, employee:employees(name, department, position, ssnit_number, bank_name, bank_account)`)
    .eq('payroll_run_id', payrollRunId)
  if (error) throw error
  return data as PayrollItem[]
}

// Run payroll for a month/year
export async function runPayroll(companyId: string, month: number, year: number): Promise<PayrollRun> {
  // Check if already exists
  const { data: existing } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('company_id', companyId)
    .eq('month', month)
    .eq('year', year)
    .single()

  if (existing) {
    // Delete old items and re-run
    await supabase.from('payroll_items').delete().eq('payroll_run_id', existing.id)
    await supabase.from('payroll_runs').delete().eq('id', existing.id)
  }

  // Get active employees
  const employees = await getEmployees(companyId)
  const active = employees.filter(e => e.status === 'active')

  // Calculate payroll for each
  const items = active.map(emp => {
    const result = calculatePayroll(emp.basic_salary)
    return {
      employee_id: emp.id,
      basic_salary: result.basicSalary,
      gross_salary: result.grossSalary,
      ssnit_employee: result.ssnitEmployee,
      ssnit_employer: result.ssnitEmployer,
      tier2_employer: result.tier2Employer,
      paye: result.paye,
      total_deductions: result.totalDeductions,
      net_pay: result.netPay,
    }
  })

  // Totals
  const totals = items.reduce((acc, item) => ({
    gross: acc.gross + item.gross_salary,
    net: acc.net + item.net_pay,
    paye: acc.paye + item.paye,
    ssnit: acc.ssnit + item.ssnit_employee,
  }), { gross: 0, net: 0, paye: 0, ssnit: 0 })

  // Create payroll run
  const { data: run, error: runError } = await supabase
    .from('payroll_runs')
    .insert({
      company_id: companyId,
      month,
      year,
      total_gross: Math.round(totals.gross * 100) / 100,
      total_net: Math.round(totals.net * 100) / 100,
      total_paye: Math.round(totals.paye * 100) / 100,
      total_ssnit: Math.round(totals.ssnit * 100) / 100,
      employee_count: active.length,
      status: 'processed',
    })
    .select()
    .single()
  if (runError) throw runError

  // Insert payroll items
  const { error: itemsError } = await supabase
    .from('payroll_items')
    .insert(items.map(item => ({ ...item, payroll_run_id: run.id })))
  if (itemsError) throw itemsError

  // Log to audit
  await supabase.from('audit_logs').insert({
    company_id: companyId,
    user_email: 'admin@company.com',
    action: 'Payroll Run',
    module: 'payroll',
    details: `${month}/${year} payroll processed for ${active.length} employees. Total: GHS ${totals.gross.toFixed(2)}`,
    severity: 'info',
  })

  return run as PayrollRun
}
