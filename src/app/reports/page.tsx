'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Download, FileText, BarChart3, TrendingUp } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { calculatePayroll } from '@/lib/payroll'

const employees = [
  { id: '1', name: 'Kwame Mensah', department: 'Engineering', ssnitNumber: 'SSN-001234', basicSalary: 5000 },
  { id: '2', name: 'Ama Owusu', department: 'HR', ssnitNumber: 'SSN-001235', basicSalary: 4200 },
  { id: '3', name: 'Kofi Asante', department: 'Finance', ssnitNumber: 'SSN-001236', basicSalary: 3800 },
  { id: '4', name: 'Akosua Boateng', department: 'Sales', ssnitNumber: 'SSN-001237', basicSalary: 3500 },
]

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const monthlyData = [
  { month: 'Jan', gross: 14800, net: 11800, paye: 2100, ssnit: 900 },
  { month: 'Feb', gross: 15200, net: 12100, paye: 2200, ssnit: 900 },
  { month: 'Mar', gross: 15000, net: 11900, paye: 2150, ssnit: 950 },
  { month: 'Apr', gross: 16000, net: 12700, paye: 2350, ssnit: 950 },
  { month: 'May', gross: 15800, net: 12500, paye: 2300, ssnit: 1000 },
  { month: 'Jun', gross: 16500, net: 13127, paye: 2465, ssnit: 908 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px' }}>
        <p style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '6px' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontSize: '12px', fontWeight: 600 }}>{p.name}: GHS {p.value?.toLocaleString()}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ssnit' | 'paye'>('overview')
  const [selectedMonth, setSelectedMonth] = useState(5)

  const payrollResults = employees.map(emp => ({
    ...emp,
    ...calculatePayroll(emp.basicSalary),
  }))

  const exportSSNIT = () => {
    const headers = ['Employee Name', 'SSNIT Number', 'Basic Salary', 'Employee Contribution (5.5%)', 'Employer Contribution (11%)', 'Tier 2 (2%)', 'Total']
    const rows = payrollResults.map(e => [
      e.name, e.ssnitNumber, e.basicSalary,
      e.ssnitEmployee, e.ssnitEmployer, e.tier2Employer,
      (e.ssnitEmployee + e.ssnitEmployer + e.tier2Employer).toFixed(2)
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SSNIT_Schedule_${months[selectedMonth]}_2026.csv`
    a.click()
  }

  const exportPAYE = () => {
    const headers = ['Employee Name', 'Gross Salary', 'Taxable Income', 'PAYE Tax', 'Net Pay']
    const rows = payrollResults.map(e => [e.name, e.grossSalary, (e.grossSalary - e.ssnitEmployee), e.paye, e.netPay])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `PAYE_Report_${months[selectedMonth]}_2026.csv`
    a.click()
  }

  const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const totals = payrollResults.reduce((acc, r) => ({
    gross: acc.gross + r.grossSalary,
    net: acc.net + r.netPay,
    paye: acc.paye + r.paye,
    ssnitEmp: acc.ssnitEmp + r.ssnitEmployee,
    ssnitEmr: acc.ssnitEmr + r.ssnitEmployer,
    tier2: acc.tier2 + r.tier2Employer,
  }), { gross: 0, net: 0, paye: 0, ssnitEmp: 0, ssnitEmr: 0, tier2: 0 })

  return (
    <DashboardLayout title="Reports">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px' }}>
            {([
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'ssnit', label: 'SSNIT Schedule', icon: FileText },
              { key: 'paye', label: 'PAYE Report', icon: TrendingUp },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: activeTab === t.key ? '#6366F1' : 'transparent',
                  color: activeTab === t.key ? '#fff' : '#64748B' }}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
              style={{ padding: '8px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
              {months.map((m, i) => <option key={m} value={i}>{m} 2026</option>)}
            </select>
            {activeTab === 'ssnit' && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportSSNIT}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <Download size={15} /> Export SSNIT CSV
              </motion.button>
            )}
            {activeTab === 'paye' && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportPAYE}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <Download size={15} /> Export PAYE CSV
              </motion.button>
            )}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="reports-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              {[
                { label: 'YTD Gross Payroll', value: fmt(monthlyData.reduce((s, m) => s + m.gross, 0)), color: '#6366F1' },
                { label: 'YTD Net Pay', value: fmt(monthlyData.reduce((s, m) => s + m.net, 0)), color: '#10B981' },
                { label: 'YTD PAYE', value: fmt(monthlyData.reduce((s, m) => s + m.paye, 0)), color: '#F59E0B' },
                { label: 'YTD SSNIT', value: fmt(monthlyData.reduce((s, m) => s + m.ssnit, 0)), color: '#06B6D4' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '18px 20px' }}>
                  <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: s.color, marginTop: '8px' }}>{s.value}</p>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px', marginBottom: '4px' }}>Gross vs Net Pay</h3>
                <p style={{ fontSize: '12px', color: '#475569', marginBottom: '20px' }}>Monthly comparison</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                    <Bar dataKey="gross" name="Gross" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="net" name="Net" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px', marginBottom: '4px' }}>Tax Deductions Trend</h3>
                <p style={{ fontSize: '12px', color: '#475569', marginBottom: '20px' }}>PAYE & SSNIT over time</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                    <Line type="monotone" dataKey="paye" name="PAYE" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="ssnit" name="SSNIT" stroke="#06B6D4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* SSNIT Schedule Tab */}
        {activeTab === 'ssnit' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>SSNIT Schedule — {months[selectedMonth]} 2026</h3>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Employee & employer contributions</p>
              </div>
              <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(6,182,212,0.1)', color: '#06B6D4', border: '1px solid rgba(6,182,212,0.2)' }}>
                {employees.length} employees
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['Employee', 'SSNIT No.', 'Basic Salary', 'Employee (5.5%)', 'Employer (11%)', 'Tier 2 (2%)'].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>
            {payrollResults.map((emp, i) => (
              <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{emp.name}</span>
                <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace' }}>{emp.ssnitNumber}</span>
                <span style={{ fontSize: '13px', color: '#F8FAFC' }}>{fmt(emp.basicSalary)}</span>
                <span style={{ fontSize: '13px', color: '#F59E0B', fontWeight: 600 }}>{fmt(emp.ssnitEmployee)}</span>
                <span style={{ fontSize: '13px', color: '#06B6D4', fontWeight: 600 }}>{fmt(emp.ssnitEmployer)}</span>
                <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>{fmt(emp.tier2Employer)}</span>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', background: 'rgba(99,102,241,0.05)', borderTop: '1px solid rgba(99,102,241,0.15)' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Totals</span>
              <span />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{fmt(totals.gross)}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>{fmt(totals.ssnitEmp)}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#06B6D4' }}>{fmt(totals.ssnitEmr)}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>{fmt(totals.tier2)}</span>
            </div>
          </div>
        )}

        {/* PAYE Tab */}
        {activeTab === 'paye' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>PAYE Report — {months[selectedMonth]} 2026</h3>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Income tax per employee (Ghana GRA 2024)</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['Employee', 'Gross Salary', 'Taxable Income', 'PAYE Tax', 'Net Pay'].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>
            {payrollResults.map((emp) => (
              <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{emp.name}</p>
                  <p style={{ fontSize: '11px', color: '#475569' }}>{emp.department}</p>
                </div>
                <span style={{ fontSize: '13px', color: '#F8FAFC' }}>{fmt(emp.grossSalary)}</span>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{fmt((emp.grossSalary - emp.ssnitEmployee))}</span>
                <span style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600 }}>{fmt(emp.paye)}</span>
                <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>{fmt(emp.netPay)}</span>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', background: 'rgba(99,102,241,0.05)', borderTop: '1px solid rgba(99,102,241,0.15)' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Totals</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{fmt(totals.gross)}</span>
              <span />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>{fmt(totals.paye)}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>{fmt(totals.net)}</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

<style>{`
  @media (max-width: 768px) {
    .reports-stats { grid-template-columns: 1fr 1fr !important; }
    .reports-charts { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .reports-stats { grid-template-columns: 1fr !important; }
  }
`}</style>