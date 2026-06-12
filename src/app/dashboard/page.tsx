'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Users, CreditCard, TrendingUp, FileText } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import ComplianceAlerts from '@/components/ui/ComplianceAlerts'
import { getCompanyId, getEmployees, createCompanyForUser } from '@/lib/employees'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [companyId, setCompanyId] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [stats, setStats] = useState({ totalEmployees: 0, monthlyPayroll: 0, avgSalary: 0, payslipsSent: 0 })
  const [trendData, setTrendData] = useState<any[]>([])
  const [pieData, setPieData] = useState([
    { name: 'Net Pay', value: 0, color: '#6366F1' },
    { name: 'PAYE', value: 0, color: '#10B981' },
    { name: 'SSNIT', value: 0, color: '#F59E0B' },
    { name: 'Tier 2', value: 0, color: '#06B6D4' },
  ])
  const [deptData, setDeptData] = useState<any[]>([])
  const checkedRef = useRef(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push('/sign-in'); return }
    if (checkedRef.current) return
    checkedRef.current = true
    checkOnboarding()
  }, [isLoaded, user])

  const checkOnboarding = async () => {
    if (!user) return
    try {
      // Get or create company
      let cId = await getCompanyId(user.id)
      if (!cId) {
        cId = await createCompanyForUser(
          user.id,
          user.primaryEmailAddress?.emailAddress || '',
          user.fullName || user.firstName || 'Admin'
        )
      }
      if (!cId) { router.push('/onboarding'); return }

      setCompanyId(cId)
      setReady(true)
      loadDashboard(cId)
    } catch (err) {
      console.error(err)
      router.push('/onboarding')
    }
  }

  const loadDashboard = async (cId: string) => {
    try {
      const { data: company } = await supabase.from('companies').select('name').eq('id', cId).single()
      if (company) setCompanyName(company.name)

      const employees = await getEmployees(cId)
      const active = employees.filter(e => e.status === 'active')
      const totalEmployees = active.length
      const avgSalary = totalEmployees > 0 ? Math.round(active.reduce((s, e) => s + e.basic_salary, 0) / totalEmployees) : 0

      const { data: runs } = await supabase.from('payroll_runs').select('*').eq('company_id', cId).order('created_at', { ascending: false })
      const latest = runs?.[0]
      const monthlyPayroll = latest?.total_gross || 0
      const payslipsSent = latest?.employee_count || 0
      setStats({ totalEmployees, monthlyPayroll, avgSalary, payslipsSent })

      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      const now = new Date()
      const last7 = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const run = runs?.find(r => { const rd = new Date(r.created_at); return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear() })
        last7.push({ month: months[d.getMonth()], amount: run?.total_gross || 0 })
      }
      setTrendData(last7)

      if (latest && latest.total_gross > 0) {
        const g = latest.total_gross
        setPieData([
          { name: 'Net Pay', value: Math.round(((latest.total_net||0)/g)*100), color: '#6366F1' },
          { name: 'PAYE', value: Math.round(((latest.total_paye||0)/g)*100), color: '#10B981' },
          { name: 'SSNIT', value: Math.round(((latest.total_ssnit_employee||0)/g)*100), color: '#F59E0B' },
          { name: 'Tier 2', value: Math.round(((latest.total_tier2||0)/g)*100), color: '#06B6D4' },
        ])
      }

      const deptMap: Record<string, number> = {}
      active.forEach(emp => { deptMap[emp.department] = (deptMap[emp.department]||0) + emp.basic_salary })
      setDeptData(Object.entries(deptMap).map(([dept, spend]) => ({ dept, spend })).sort((a,b) => b.spend - a.spend).slice(0, 5))
    } catch (err) {
      console.error(err)
    }
  }

  const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 0 })}`

  // Show nothing until ready — prevents flash
  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '24px' }}>P</span>
          </div>
          <div style={{ width: '28px', height: '28px', border: '3px solid #6366F1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Employees', display: stats.totalEmployees.toString(), icon: Users, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Monthly Payroll', display: fmt(stats.monthlyPayroll), icon: CreditCard, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Avg. Salary', display: fmt(stats.avgSalary), icon: TrendingUp, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Payslips Sent', display: stats.payslipsSent.toString(), icon: FileText, color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  ]

  const hasPayrollData = stats.monthlyPayroll > 0

  return (
    <DashboardLayout title="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC' }}>{companyName || 'Dashboard'}</h1>
            <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Payroll Engine Active</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="stats-grid">
          {statCards.map((stat, i) => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={18} color={stat.color} />
                </div>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 800, color: stat.color, marginBottom: '4px' }}>{stat.display}</p>
              <p style={{ fontSize: '12px', color: '#475569' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }} className="charts-grid">
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>Payroll Trend</p>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Monthly payroll spend (GHS)</p>
              </div>
            </div>
            {!hasPayrollData ? (
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: '#475569', fontSize: '14px', fontWeight: 600 }}>No payroll data yet</p>
                <p style={{ color: '#334155', fontSize: '12px' }}>Run your first payroll to see the trend</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                  <Tooltip formatter={(v: any) => [`GHS ${v.toLocaleString()}`, 'Payroll']} contentStyle={{ background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F8FAFC' }} />
                  <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={2} fill="url(#payrollGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '4px' }}>Pay Breakdown</p>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>Deductions vs net pay</p>
            {!hasPayrollData ? (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#475569', fontSize: '13px', textAlign: 'center' }}>Run payroll to see breakdown</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v}%`]} contentStyle={{ background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F8FAFC' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pieData.map(item => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: item.color, fontWeight: 600 }}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <ComplianceAlerts />

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '4px' }}>Payroll by Department</p>
          <p style={{ fontSize: '12px', color: '#475569', marginBottom: '24px' }}>Salary spend per department</p>
          {deptData.length === 0 ? (
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
              <p style={{ color: '#475569', fontSize: '14px', fontWeight: 600 }}>No employees added yet</p>
              <p style={{ color: '#334155', fontSize: '12px' }}>Add employees to see department breakdown</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptData} barSize={32}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="dept" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                <Tooltip formatter={(v: any) => [`GHS ${v.toLocaleString()}`, 'Salary']} contentStyle={{ background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F8FAFC' }} />
                <Bar dataKey="spend" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .charts-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  )
}
