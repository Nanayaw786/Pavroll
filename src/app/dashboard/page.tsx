'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Users, CreditCard, TrendingUp, FileText } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import ComplianceAlerts from '@/components/ui/ComplianceAlerts'
import TrialBanner from '@/components/ui/TrialBanner'
import { getCompanyId, getEmployees } from '@/lib/employees'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [stats, setStats] = useState({
    totalEmployees: 0,
    monthlyPayroll: 0,
    avgSalary: 0,
    payslipsSent: 0,
  })
  const [trendData, setTrendData] = useState<any[]>([])
  const [pieData, setPieData] = useState([
    { name: 'Net Pay', value: 0, color: '#6366F1' },
    { name: 'PAYE', value: 0, color: '#10B981' },
    { name: 'SSNIT', value: 0, color: '#F59E0B' },
    { name: 'Tier 2', value: 0, color: '#06B6D4' },
  ])
  const [deptData, setDeptData] = useState<any[]>([])

  useEffect(() => { if (user) loadData() }, [user])

  const loadData = async () => {
    if (!user) return
    try {
      setLoading(true)
      let cId = await getCompanyId(user.id)
      
      if (!cId) {
        // Brand new user - create company and send to onboarding
        const { createCompanyForUser } = await import('@/lib/employees')
        cId = await createCompanyForUser(
          user.id,
          user.primaryEmailAddress?.emailAddress || '',
          user.fullName || user.firstName || 'Admin'
        )
        router.push('/onboarding')
        return
      }

      // Check if onboarding completed
      const { data: co } = await supabase
        .from('companies')
        .select('name, phone')
        .eq('id', cId)
        .single()

      const needsOnboarding = !co?.phone || 
        co?.name?.includes("'s Company") || 
        co?.name?.includes('My Company') ||
        co?.name === ''

      if (needsOnboarding) {
        router.push('/onboarding')
        return
      }
      
      if (!cId) return
      setCompanyId(cId)

      // Get company name
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', cId)
        .single()
      if (company) setCompanyName(company.name)

      // Get employees
      const employees = await getEmployees(cId)
      const totalEmployees = employees.filter(e => e.status === 'active').length
      const avgSalary = totalEmployees > 0
        ? Math.round(employees.filter(e => e.status === 'active').reduce((s, e) => s + e.basic_salary, 0) / totalEmployees)
        : 0

      // Get payroll runs
      const { data: payrollRuns } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('company_id', cId)
        .order('created_at', { ascending: false })

      const latestRun = payrollRuns?.[0]
      const monthlyPayroll = latestRun?.total_gross || 0
      const payslipsSent = latestRun?.employee_count || 0

      setStats({ totalEmployees, monthlyPayroll, avgSalary, payslipsSent })

      // Build trend data from last 7 payroll runs
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const trend = months.map(month => ({ month, amount: 0 }))

      if (payrollRuns && payrollRuns.length > 0) {
        payrollRuns.slice(0, 7).forEach(run => {
          const date = new Date(run.created_at)
          const monthIdx = date.getMonth()
          trend[monthIdx].amount = run.total_gross || 0
        })
      }

      // Only show months with data or last 7 months
      const now = new Date()
      const last7 = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = months[d.getMonth()]
        const run = payrollRuns?.find(r => {
          const rd = new Date(r.created_at)
          return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
        })
        last7.push({ month: monthName, amount: run?.total_gross || 0 })
      }
      setTrendData(last7)

      // Pie chart from latest payroll run
      if (latestRun) {
        const gross = latestRun.total_gross || 0
        const paye = latestRun.total_paye || 0
        const ssnit = latestRun.total_ssnit_employee || 0
        const tier2 = latestRun.total_tier2 || 0
        const net = latestRun.total_net || 0

        if (gross > 0) {
          setPieData([
            { name: 'Net Pay', value: Math.round((net / gross) * 100), color: '#6366F1' },
            { name: 'PAYE', value: Math.round((paye / gross) * 100), color: '#10B981' },
            { name: 'SSNIT', value: Math.round((ssnit / gross) * 100), color: '#F59E0B' },
            { name: 'Tier 2', value: Math.round((tier2 / gross) * 100), color: '#06B6D4' },
          ])
        }
      }

      // Department data from employees
      const deptMap: Record<string, number> = {}
      employees.filter(e => e.status === 'active').forEach(emp => {
        deptMap[emp.department] = (deptMap[emp.department] || 0) + emp.basic_salary
      })
      const deptArr = Object.entries(deptMap)
        .map(([dept, spend]) => ({ dept, spend }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 5)
      setDeptData(deptArr)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 0 })}`

  const statCards = [
    { label: 'Total Employees', value: stats.totalEmployees, display: stats.totalEmployees.toString(), icon: Users, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Monthly Payroll', value: stats.monthlyPayroll, display: fmt(stats.monthlyPayroll), icon: CreditCard, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { label: 'Avg. Salary', value: stats.avgSalary, display: fmt(stats.avgSalary), icon: TrendingUp, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { label: 'Payslips Sent', value: stats.payslipsSent, display: stats.payslipsSent.toString(), icon: FileText, color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  ]

  const hasPayrollData = stats.monthlyPayroll > 0

  return (
    <DashboardLayout title="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC' }}>
              {companyName || 'Dashboard'}
            </h1>
            <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
              {new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Payroll Engine Active</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="stats-grid">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={18} color={stat.color} />
                </div>
              </div>
              <p style={{ fontSize: '24px', fontWeight: 800, color: stat.color, marginBottom: '4px' }}>{stat.display}</p>
              <p style={{ fontSize: '12px', color: '#475569' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }} className="charts-grid">

          {/* Payroll Trend */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>Payroll Trend</p>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Monthly payroll spend (GHS)</p>
              </div>
              <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}>Last 7 months</span>
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

          {/* Pay Breakdown Pie */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '4px' }}>Pay Breakdown</p>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>Deductions vs net pay</p>
            {!hasPayrollData ? (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
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

        {/* Compliance Alerts */}
        <ComplianceAlerts />

        {/* Payroll by Department */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', width: '100%' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '4px' }}>Payroll by Department</p>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', marginBottom: '24px' }}>This month's spend per department</p>
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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
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
