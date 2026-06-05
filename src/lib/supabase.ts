import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          address: string
          tin: string
          ssnit_employer_code: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      employees: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
      }
      payroll_runs: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['payroll_runs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payroll_runs']['Insert']>
      }
      payroll_items: {
        Row: {
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
        }
        Insert: Omit<Database['public']['Tables']['payroll_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payroll_items']['Insert']>
      }
      leave_requests: {
        Row: {
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
        }
        Insert: Omit<Database['public']['Tables']['leave_requests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leave_requests']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          company_id: string
          user_email: string
          action: string
          module: string
          details: string
          severity: 'info' | 'warning' | 'critical'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
      loans: {
        Row: {
          id: string
          company_id: string
          employee_id: string
          amount: number
          monthly_deduction: number
          balance: number
          reason: string
          status: 'active' | 'completed'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['loans']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['loans']['Insert']>
      }
    }
  }
}
