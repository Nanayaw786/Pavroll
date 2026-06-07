'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { calculatePayroll, DEFAULT_SETTINGS, type PayrollSettings } from '@/lib/payroll'
import { runPayroll, getPayrollRuns, getPayrollItems, type PayrollRun, type PayrollItem } from '@/lib/payrollDb'
import { getEmployees, getCompanyId, type Employee } from '@/lib/employees'
import { supabase } from '@/lib/supabase'
import { Play, CheckCircle, Download, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()
const avatarColors = ['#6366F1','#10B981','#F59E0B','#EF4444','#06B6D4','#8B5CF6']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function PayrollPage() {
  const [companyId, setCompanyId] = useState('')
  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>(DEFAULT_SETTINGS)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])
  const [currentRun, setCurrentRun] = useState<PayrollRun | null>(null)
  const [items, setItems] = useState<PayrollItem[]>([])
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear] = useState(currentYear)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const cId = await getCompanyId()
      setCompanyId(cId)
      const { data: companyData } = await supabase.from('companies').select('payroll_settings').eq('id', cId).single()
      if (companyData?.payroll_settings) {
        setPayrollSettings(prev => ({ ...prev, ...companyData.payroll_settings }))
      }
      const [emps, runs] = await Promise.all([
        getEmployees(cId),
        getPayrollRuns(cId)
      ])
      setEmployees(emps.filter(e => e.status === 'active'))
      setPayrollRuns(runs)
      // Check if current month already processed
      const existing = runs.find(r => r.month === selectedMonth && r.year === selectedYear)
      if (existing) {
        setCurrentRun(existing)
        const runItems = await getPayrollItems(existing.id)
        setItems(runItems)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRun = async () => {
    setRunning(true)
    try {
      const run = await runPayroll(companyId, selectedMonth, selectedYear)
      setCurrentRun(run)
      const runItems = await getPayrollItems(run.id)
      setItems(runItems)
      setPayrollRuns(prev => [run, ...prev.filter(r => !(r.month === selectedMonth && r.year === selectedYear))])
    } catch (err) {
      console.error(err)
    } finally {
      setRunning(false)
    }
  }

  const handleMonthChange = async (month: number) => {
    setSelectedMonth(month)
    setCurrentRun(null)
    setItems([])
    if (!companyId) return
    const existing = payrollRuns.find(r => r.month === month && r.year === selectedYear)
    if (existing) {
      setCurrentRun(existing)
      const runItems = await getPayrollItems(existing.id)
      setItems(runItems)
    }
  }

  const exportCSV = () => {
    if (!items.length) return
    const headers = ['Employee', 'Department', 'Basic Salary', 'SSNIT (5.5%)', 'PAYE', 'Total Deductions', 'Net Pay']
    const rows = items.map(item => [
      item.employee?.name || '', item.employee?.department || '',
      item.basic_salary, item.ssnit_employee, item.paye,
      item.total_deductions, item.net_pay
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll_${months[selectedMonth-1]}_${selectedYear}.csv`
    a.click()
  }

  // Use real items if run exists, otherwise calculate from employees
  const displayItems = currentRun ? items : employees.map(emp => {
    const result = calculatePayroll(emp.basic_salary, payrollSettings)
    return {
      id: emp.id,
      payroll_run_id: '',
      employee_id: emp.id,
      basic_salary: result.basicSalary,
      gross_salary: result.grossSalary,
      ssnit_employee: result.ssnitEmployee,
      ssnit_employer: result.ssnitEmployer,
      tier2_employer: result.tier2Employer,
      paye: result.paye,
      total_deductions: result.totalDeductions,
      net_pay: result.netPay,
      created_at: '',
      employee: { name: emp.name, department: emp.department, position: emp.position, ssnit_number: emp.ssnit_number, bank_name: emp.bank_name, bank_account: emp.bank_account }
    } as PayrollItem
  })

  const totals = displayItems.reduce((acc, r) => ({
    grossSalary: acc.grossSalary + r.gross_salary,
    netPay: acc.netPay + r.net_pay,
    paye: acc.paye + r.paye,
    ssnitEmployee: acc.ssnitEmployee + r.ssnit_employee,
    ssnitEmployer: acc.ssnitEmployer + r.ssnit_employer,
    totalDeductions: acc.totalDeductions + r.total_deductions,
  }), { grossSalary: 0, netPay: 0, paye: 0, ssnitEmployee: 0, ssnitEmployer: 0, totalDeductions: 0 })

  return (
    <DashboardLayout title="Payroll">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payroll Period</label>
              <select value={selectedMonth} onChange={e => handleMonthChange(Number(e.target.value))}
                style={{ padding: '8px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                {months.map((m, i) => <option key={m} value={i+1}>{m} {selectedYear}</option>)}
              </select>
            </div>
            {currentRun && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginTop: '18px' }}>
                <CheckCircle size={14} color="#10B981" />
                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Payroll Processed</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            {currentRun && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportCSV}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <Download size={15} /> Export CSV
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRun} disabled={running || loading}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', background: currentRun ? 'rgba(16,185,129,0.15)' : '#6366F1', border: currentRun ? '1px solid rgba(16,185,129,0.3)' : 'none', color: currentRun ? '#10B981' : '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: running ? 0.7 : 1 }}>
              {running ? (
                <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
              ) : currentRun ? (
                <><CheckCircle size={15} /> Re-run Payroll</>
              ) : (
                <><Play size={15} fill="white" /> Run Payroll</>
              )}
            </motion.button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="payroll-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { label: 'Total Gross', value: fmt(totals.grossSalary), color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Total Net Pay', value: fmt(totals.netPay), color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Total PAYE', value: fmt(totals.paye), color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Total SSNIT', value: fmt(totals.ssnitEmployee), color: '#06B6D4', bg: 'rgba(6,182,212,0.08)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '18px 20px' }}>
              <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: s.color, marginTop: '6px' }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: '48px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Loader2 size={20} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#475569', fontSize: '14px' }}>Loading payroll data...</span>
          </div>
        )}

        {/* Payroll table */}
        {!loading && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="payroll-table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['Employee', 'Gross', 'SSNIT (5.5%)', 'PAYE', 'Deductions', 'Net Pay', ''].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>

            {displayItems.map((item, i) => {
              const empName = item.employee?.name || 'Unknown'
              const empDept = item.employee?.department || ''
              const isExpanded = expanded === item.employee_id
              return (
                <div key={item.employee_id}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="payroll-table-row"
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px', padding: '14px 20px', borderBottom: isExpanded ? 'none' : '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {getInitials(empName)}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{empName}</p>
                        <p style={{ fontSize: '11px', color: '#475569' }}>{empDept}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 500 }}>{fmt(item.gross_salary)}</span>
                    <span style={{ fontSize: '13px', color: '#F59E0B' }}>{fmt(item.ssnit_employee)}</span>
                    <span style={{ fontSize: '13px', color: '#EF4444' }}>{fmt(item.paye)}</span>
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>{fmt(item.total_deductions)}</span>
                    <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>{fmt(item.net_pay)}</span>
                    <button onClick={() => setExpanded(isExpanded ? null : item.employee_id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </motion.div>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.2 }}
                      style={{ padding: '16px 20px 20px 76px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(99,102,241,0.03)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {[
                          { label: 'Basic Salary', value: fmt(item.basic_salary), color: '#F8FAFC' },
                          { label: 'SSNIT Employer (11%)', value: fmt(item.ssnit_employer), color: '#F59E0B' },
                          { label: 'Tier 2 Employer (2%)', value: fmt(item.tier2_employer), color: '#06B6D4' },
                          { label: 'Net Pay', value: fmt(item.net_pay), color: '#10B981' },
                        ].map(d => (
                          <div key={d.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px' }}>
                            <p style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>{d.label}</p>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: d.color }}>{d.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )
            })}

            {/* Totals row */}
            <div className="payroll-table-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px', padding: '14px 20px', background: 'rgba(99,102,241,0.05)', borderTop: '1px solid rgba(99,102,241,0.15)' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Totals ({displayItems.length} employees)</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{fmt(totals.grossSalary)}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>{fmt(totals.ssnitEmployee)}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>{fmt(totals.paye)}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8' }}>{fmt(totals.totalDeductions)}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>{fmt(totals.netPay)}</span>
              <span />
            </div>
          </div>
        )}

        {/* Previous runs */}
        {payrollRuns.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px', marginBottom: '14px' }}>Payroll History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {payrollRuns.map(run => (
                <div key={run.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{months[run.month-1]} {run.year}</p>
                    <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>{run.employee_count} employees</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>{fmt(run.total_net)}</p>
                    <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>Net Pay</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    {run.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 768px) {
            .payroll-stats { grid-template-columns: 1fr 1fr !important; }
            .payroll-table-header { display: none !important; }
            .payroll-table-row { grid-template-columns: 1fr auto auto !important; }
            .payroll-table-row > *:nth-child(3),
            .payroll-table-row > *:nth-child(4),
            .payroll-table-row > *:nth-child(5) { display: none !important; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  )
}
