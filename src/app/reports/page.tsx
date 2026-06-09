'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { BarChart3, FileText, Download, TrendingUp } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getCompanyId, getEmployees } from '@/lib/employees'
import { supabase } from '@/lib/supabase'
import { calculatePayroll } from '@/lib/payroll'

const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ReportsPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<'overview' | 'ssnit' | 'paye'>('overview')
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [payrollRuns, setPayrollRuns] = useState<any[]>([])
  const [totals, setTotals] = useState({ gross: 0, net: 0, paye: 0, ssnitEmp: 0, ssnitEmr: 0, tier2: 0 })

  useEffect(() => { if (user) loadData() }, [user])

  const loadData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const cId = await getCompanyId(user.id)
      if (!cId) return

      const [emps, { data: runs }] = await Promise.all([
        getEmployees(cId),
        supabase.from('payroll_runs').select('*').eq('company_id', cId).order('created_at', { ascending: true })
      ])

      setEmployees(emps)
      setPayrollRuns(runs || [])

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const now = new Date()
      const last6: any[] = []

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const run = runs?.find(r => {
          const rd = new Date(r.created_at)
          return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
        })
        last6.push({
          month: months[d.getMonth()],
          gross: run?.total_gross || 0,
          net: run?.total_net || 0,
          paye: run?.total_paye || 0,
          ssnit: run?.total_ssnit_employee || 0,
        })
      }
      setMonthlyData(last6)

      const ytd = (runs || []).reduce((acc, r) => ({
        gross: acc.gross + (r.total_gross || 0),
        net: acc.net + (r.total_net || 0),
        paye: acc.paye + (r.total_paye || 0),
        ssnitEmp: acc.ssnitEmp + (r.total_ssnit_employee || 0),
        ssnitEmr: acc.ssnitEmr + (r.total_ssnit_employer || 0),
        tier2: acc.tier2 + (r.total_tier2 || 0),
      }), { gross: 0, net: 0, paye: 0, ssnitEmp: 0, ssnitEmr: 0, tier2: 0 })
      setTotals(ytd)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const hasData = payrollRuns.length > 0

  const exportCSV = () => {
    if (!hasData) return
    const headers = ['Month', 'Gross', 'Net Pay', 'PAYE', 'SSNIT']
    const rows = monthlyData.filter(m => m.gross > 0).map(m => [m.month, m.gross, m.net, m.paye, m.ssnit])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'pavroll-report.csv'
    a.click()
  }

  return (
    <DashboardLayout title="Reports">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'ssnit', label: 'SSNIT Schedule', icon: FileText },
            { key: 'paye', label: 'PAYE Report', icon: TrendingUp },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                background: activeTab === tab.key ? '#6366F1' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab.key ? '#fff' : '#64748B' }}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
          <button onClick={exportCSV} disabled={!hasData}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', cursor: hasData ? 'pointer' : 'not-allowed', fontSize: '13px', background: 'rgba(255,255,255,0.04)', color: hasData ? '#94A3B8' : '#334155', marginLeft: 'auto' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }} className="report-stats">
              {[
                { label: 'YTD Gross Payroll', value: fmt(totals.gross), color: '#6366F1' },
                { label: 'YTD Net Pay', value: fmt(totals.net), color: '#10B981' },
                { label: 'YTD PAYE', value: fmt(totals.paye), color: '#F59E0B' },
                { label: 'YTD SSNIT', value: fmt(totals.ssnitEmp), color: '#06B6D4' },
              ].map(s => (
                <div key={s.label} style={{ padding: '18px', borderRadius: '14px', background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {!hasData ? (
              <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <BarChart3 size={40} color="#475569" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#F8FAFC', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>No payroll data yet</p>
                <p style={{ color: '#475569', fontSize: '13px' }}>Run your first payroll to generate reports</p>
              </div>
            ) : (
              <>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '20px' }}>Monthly Payroll (Last 6 Months)</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData} barSize={18}>
                      <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                      <Tooltip formatter={(v: any) => [`GHS ${v.toLocaleString()}`, '']} contentStyle={{ background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F8FAFC' }} />
                      <Bar dataKey="gross" name="Gross" fill="#6366F1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="net" name="Net Pay" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '20px' }}>PAYE & SSNIT Trend</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                      <Tooltip formatter={(v: any) => [`GHS ${v.toLocaleString()}`, '']} contentStyle={{ background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F8FAFC' }} />
                      <Line type="monotone" dataKey="paye" name="PAYE" stroke="#F59E0B" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="ssnit" name="SSNIT" stroke="#06B6D4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'ssnit' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>SSNIT Contribution Schedule</h3>
            </div>
            {employees.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#475569', fontSize: '14px' }}>No employees added yet</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  {['Employee', 'SSNIT No.', 'Basic Salary', 'Employee (5.5%)', 'Employer (13%)'].map(h => (
                    <span key={h} style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {employees.filter(e => e.status === 'active').map(emp => {
                  const res = calculatePayroll(emp.basic_salary)
                  return (
                    <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{emp.name}</p>
                        <p style={{ fontSize: '11px', color: '#475569' }}>{emp.department}</p>
                      </div>
                      <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace' }}>{emp.ssnit_number || 'N/A'}</span>
                      <span style={{ fontSize: '12px', color: '#F8FAFC' }}>{fmt(emp.basic_salary)}</span>
                      <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600 }}>{fmt(res.ssnitEmployee)}</span>
                      <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>{fmt(res.ssnitEmployer)}</span>
                    </div>
                  )
                })}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>TOTAL</span>
                  <span></span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{fmt(employees.filter(e => e.status === 'active').reduce((s, e) => s + e.basic_salary, 0))}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>{fmt(employees.filter(e => e.status === 'active').reduce((s, e) => s + calculatePayroll(e.basic_salary).ssnitEmployee, 0))}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>{fmt(employees.filter(e => e.status === 'active').reduce((s, e) => s + calculatePayroll(e.basic_salary).ssnitEmployer, 0))}</span>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'paye' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>PAYE Report</h3>
            </div>
            {employees.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#475569', fontSize: '14px' }}>No employees added yet</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  {['Employee', 'Department', 'Gross Salary', 'PAYE Tax', 'Net Pay'].map(h => (
                    <span key={h} style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {employees.filter(e => e.status === 'active').map(emp => {
                  const res = calculatePayroll(emp.basic_salary)
                  return (
                    <div key={emp.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{emp.name}</p>
                        <p style={{ fontSize: '11px', color: '#475569' }}>{emp.position}</p>
                      </div>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{emp.department}</span>
                      <span style={{ fontSize: '12px', color: '#F8FAFC' }}>{fmt(emp.basic_salary)}</span>
                      <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>{fmt(res.paye)}</span>
                      <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>{fmt(res.netPay)}</span>
                    </div>
                  )
                })}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>TOTAL</span>
                  <span></span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{fmt(employees.filter(e => e.status === 'active').reduce((s, e) => s + e.basic_salary, 0))}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>{fmt(employees.filter(e => e.status === 'active').reduce((s, e) => s + calculatePayroll(e.basic_salary).paye, 0))}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>{fmt(employees.filter(e => e.status === 'active').reduce((s, e) => s + calculatePayroll(e.basic_salary).netPay, 0))}</span>
                </div>
              </>
            )}
          </div>
        )}

      </div>
      <style>{`
        @media (max-width: 768px) {
          .report-stats { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  )
}
