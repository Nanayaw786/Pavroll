'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { calculatePayroll } from '@/lib/payroll'
import { Play, CheckCircle, Download, ChevronDown, ChevronUp } from 'lucide-react'

type Employee = {
  id: string
  name: string
  department: string
  position: string
  basicSalary: number
  ssnitNumber: string
  bankName: string
  bankAccount: string
}

const mockEmployees: Employee[] = [
  { id: '1', name: 'Kwame Mensah', department: 'Engineering', position: 'Senior Developer', basicSalary: 5000, ssnitNumber: 'SSN-001234', bankName: 'GCB Bank', bankAccount: '1234567890' },
  { id: '2', name: 'Ama Owusu', department: 'HR', position: 'HR Manager', basicSalary: 4200, ssnitNumber: 'SSN-001235', bankName: 'Ecobank', bankAccount: '0987654321' },
  { id: '3', name: 'Kofi Asante', department: 'Finance', position: 'Accountant', basicSalary: 3800, ssnitNumber: 'SSN-001236', bankName: 'Absa Bank', bankAccount: '1122334455' },
  { id: '4', name: 'Akosua Boateng', department: 'Sales', position: 'Sales Lead', basicSalary: 3500, ssnitNumber: 'SSN-001237', bankName: 'Stanbic Bank', bankAccount: '5566778899' },
]

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()
const avatarColors = ['#6366F1','#10B981','#F59E0B','#EF4444','#06B6D4','#8B5CF6']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear] = useState(currentYear)
  const [ran, setRan] = useState(false)
  const [running, setRunning] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const results = mockEmployees.map(emp => ({
    ...emp,
    ...calculatePayroll(emp.basicSalary),
  }))

  const totals = results.reduce((acc, r) => ({
    grossSalary: acc.grossSalary + r.grossSalary,
    netPay: acc.netPay + r.netPay,
    paye: acc.paye + r.paye,
    ssnitEmployee: acc.ssnitEmployee + r.ssnitEmployee,
    ssnitEmployer: acc.ssnitEmployer + r.ssnitEmployer,
    tier2Employer: acc.tier2Employer + r.tier2Employer,
    totalDeductions: acc.totalDeductions + r.totalDeductions,
  }), { grossSalary: 0, netPay: 0, paye: 0, ssnitEmployee: 0, ssnitEmployer: 0, tier2Employer: 0, totalDeductions: 0 })

  const handleRun = () => {
    setRunning(true)
    setTimeout(() => { setRunning(false); setRan(true) }, 2000)
  }

  const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <DashboardLayout title="Payroll">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Period selector + Run button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: '#475569', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payroll Period</label>
              <select value={selectedMonth} onChange={e => { setSelectedMonth(Number(e.target.value)); setRan(false) }}
                style={{ padding: '8px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                {months.map((m, i) => <option key={m} value={i}>{m} {selectedYear}</option>)}
              </select>
            </div>
            {ran && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginTop: '18px' }}>
                <CheckCircle size={14} color="#10B981" />
                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Payroll Processed</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            {ran && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <Download size={15} /> Export CSV
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRun} disabled={running}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', background: ran ? 'rgba(16,185,129,0.15)' : '#6366F1', border: ran ? '1px solid rgba(16,185,129,0.3)' : 'none', color: ran ? '#10B981' : '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: running ? 0.7 : 1 }}>
              {running ? (
                <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Processing...</>
              ) : ran ? (
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
            { label: 'Total SSNIT', value: fmt(totals.ssnitEmployee + totals.ssnitEmployer), color: '#06B6D4', bg: 'rgba(6,182,212,0.08)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '18px 20px' }}>
              <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: s.color, marginTop: '6px' }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Payroll table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Header */}
          <div className="payroll-table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            {['Employee', 'Gross', 'SSNIT (5.5%)', 'PAYE', 'Deductions', 'Net Pay', ''].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {results.map((emp, i) => (
            <div key={emp.id}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="payroll-table-row"
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px', padding: '14px 20px', borderBottom: expanded === emp.id ? 'none' : '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {getInitials(emp.name)}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{emp.name}</p>
                    <p style={{ fontSize: '11px', color: '#475569' }}>{emp.department}</p>
                  </div>
                </div>
                <span style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 500 }}>{fmt(emp.grossSalary)}</span>
                <span style={{ fontSize: '13px', color: '#F59E0B' }}>{fmt(emp.ssnitEmployee)}</span>
                <span style={{ fontSize: '13px', color: '#EF4444' }}>{fmt(emp.paye)}</span>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{fmt(emp.totalDeductions)}</span>
                <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>{fmt(emp.netPay)}</span>
                <button onClick={() => setExpanded(expanded === emp.id ? null : emp.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px' }}>
                  {expanded === emp.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </motion.div>

              {/* Expanded breakdown */}
              {expanded === emp.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.2 }}
                  style={{ padding: '16px 20px 20px 76px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(99,102,241,0.03)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {[
                      { label: 'Basic Salary', value: fmt(emp.basicSalary), color: '#F8FAFC' },
                      { label: 'Taxable Income', value: fmt(emp.taxableIncome), color: '#94A3B8' },
                      { label: 'SSNIT Employee (5.5%)', value: fmt(emp.ssnitEmployee), color: '#F59E0B' },
                      { label: 'SSNIT Employer (11%)', value: fmt(emp.ssnitEmployer), color: '#F59E0B' },
                      { label: 'Tier 2 Employer (2%)', value: fmt(emp.tier2Employer), color: '#06B6D4' },
                      { label: 'PAYE Tax', value: fmt(emp.paye), color: '#EF4444' },
                      { label: 'Total Deductions', value: fmt(emp.totalDeductions), color: '#94A3B8' },
                      { label: 'Net Pay', value: fmt(emp.netPay), color: '#10B981' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px' }}>
                        <p style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>{item.label}</p>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: item.color }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}

          {/* Totals row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px', padding: '14px 20px', background: 'rgba(99,102,241,0.05)', borderTop: '1px solid rgba(99,102,241,0.15)' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Totals ({results.length} employees)</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{fmt(totals.grossSalary)}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>{fmt(totals.ssnitEmployee)}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>{fmt(totals.paye)}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8' }}>{fmt(totals.totalDeductions)}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>{fmt(totals.netPay)}</span>
            <span />
          </div>
        </div>

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
          @media (max-width: 480px) {
            .payroll-stats { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  )
}
