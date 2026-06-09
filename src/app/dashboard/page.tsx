'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Users, CreditCard, TrendingUp, FileText, ArrowUpRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useEffect, useState } from 'react'
import PayrollOrb from '@/components/ui/PayrollOrb'
import ComplianceAlerts from '@/components/ui/ComplianceAlerts'

const payrollTrend = [
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 47000 },
  { month: 'Mar', amount: 0 },
  { month: 'Apr', amount: 52000 },
  { month: 'May', amount: 49000 },
  { month: 'Jun', amount: 58000 },
  { month: 'Jul', amount: 61000 },
]

const deductionData = [
  { name: 'Net Pay', value: 68, color: '#6366F1' },
  { name: 'PAYE', value: 18, color: '#10B981' },
  { name: 'SSNIT', value: 9, color: '#F59E0B' },
  { name: 'Tier 2', value: 5, color: '#06B6D4' },
]

const deptData = [

  { dept: 'Sales', spend: 18000 },
  { dept: 'HR', spend: 9000 },
  { dept: 'Finance', spend: 12000 },
  { dept: 'Ops', spend: 7000 },
]

const stats = [
  { label: 'Total Employees', value: 0, display: '0', change: '', icon: Users, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
  { label: 'Monthly Payroll', value: 0, display: 'GHS 0', change: '', icon: CreditCard, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  { label: 'Avg. Salary', value: 0, display: 'GHS 0', change: '', icon: TrendingUp, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { label: 'Payslips Sent', value: 0, display: '0', change: '', icon: FileText, color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px' }}>
        <p style={{ color: '#94A3B8', fontSize: '12px' }}>{label}</p>
        <p style={{ color: '#F8FAFC', fontWeight: 600 }}>GHS {payload[0].value?.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

function StatCard({ stat, index }: { stat: typeof stats[0], index: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!stat.value) return
    let start = 0
    const step = stat.value / 40
    const timer = setInterval(() => {
      start += step
      if (start >= stat.value) { setCount(stat.value); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 30)
    return () => clearInterval(timer)
  }, [stat.value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <stat.icon size={18} color={stat.color} />
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, color: '#10B981' }}>
          <ArrowUpRight size={12} />{stat.change}
        </span>
      </div>
      <div>
        <p style={{ fontSize: '26px', fontWeight: 700, color: '#F8FAFC', lineHeight: 1.2 }}>
          {stat.value ? count : stat.display}
        </p>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{stat.label}</p>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Row 1: Orb + Stats */}
        <div className="dashboard-hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', width: '100%' }}>
          {/* Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ position: 'relative', height: '220px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div style={{ position: 'absolute', inset: 0 }}><PayrollOrb /></div>
            <div style={{ position: 'absolute', bottom: '16px', left: '20px', zIndex: 10 }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payroll Engine</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#F8FAFC' }}>Active</p>
            </div>
          </motion.div>

          {/* Stats 2-col */}
          <div className="dashboard-stats" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {stats.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
          </div>
        </div>

        {/* Row 2: Area chart + Donut */}
        <div className="dashboard-charts" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>Payroll Trend</h3>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Monthly payroll spend (GHS)</p>
              </div>
              <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}>Last 7 months</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={payrollTrend}>
                <defs>
                  <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={2} fill="url(#payrollGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}
          >
            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>Pay Breakdown</h3>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', marginBottom: '16px' }}>Deductions vs net pay</p>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={deductionData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {deductionData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#F8FAFC' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {deductionData.map((item) => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#F8FAFC' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Compliance Alerts */}
        <ComplianceAlerts />

        {/* Row 3: Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', width: '100%' }}
        >
          <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>Payroll by Department</h3>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', marginBottom: '24px' }}>This month's spend per department</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={deptData} barSize={32}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="dept" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="spend" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
      <style>{`
        @media (max-width: 768px) {
          .dashboard-hero { grid-template-columns: 1fr !important; }
          .dashboard-stats { grid-column: span 1 !important; grid-template-columns: 1fr 1fr !important; }
          .dashboard-charts { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .dashboard-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  )
}
