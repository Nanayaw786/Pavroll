'use client'
import ESSLayout from '@/components/ess/ESSLayout'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FileText, Calendar, TrendingUp, Clock, CheckCircle, ArrowUpRight } from 'lucide-react'
import { calculatePayroll } from '@/lib/payroll'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const employeeData: Record<string, { position: string, department: string, basicSalary: number, joinDate: string, ssnitNumber: string, bankName: string, leaveBalance: number }> = {




}

const months = ['Jan','Feb','Mar','Apr','May','Jun']

const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px' }}>
        <p style={{ color: '#94A3B8', fontSize: '12px' }}>{label}</p>
        <p style={{ color: '#10B981', fontWeight: 600, fontSize: '13px' }}>{fmt(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function ESSDashboard() {
  const [employee, setEmployee] = useState<{ id: string, name: string, email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ess_employee')
    if (stored) setEmployee(JSON.parse(stored))
  }, [])

  if (!employee) return null

  const data = employeeData[employee.id]
  const payroll = calculatePayroll(data.basicSalary)

  const netPayHistory = months.map((month, i) => ({
    month,
    netPay: Math.round(payroll.netPay * (0.97 + i * 0.006)),
  }))

  const recentPayslips = [
    { month: 'June 2026', net: payroll.netPay, status: 'Ready' },
    { month: 'May 2026', net: Math.round(payroll.netPay * 0.998), status: 'Ready' },
    { month: 'April 2026', net: Math.round(payroll.netPay * 0.995), status: 'Ready' },
  ]

  return (
    <ESSLayout title={`Welcome, ${employee.name.split(' ')[0]} 👋`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Stats */}
        <div className="ess-dash-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { label: 'Net Pay This Month', value: fmt(payroll.netPay), icon: TrendingUp, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Leave Balance', value: `${data.leaveBalance} days`, icon: Calendar, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Payslips Available', value: '6', icon: FileText, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Days at Company', value: `${Math.floor((Date.now() - new Date(data.joinDate).getTime()) / (1000 * 60 * 60 * 24))}`, icon: Clock, color: '#06B6D4', bg: 'rgba(6,182,212,0.08)' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ background: stat.bg, border: `1px solid ${stat.color}20`, borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: stat.bg, border: `1px solid ${stat.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={17} color={stat.color} />
                </div>
                <ArrowUpRight size={14} color={stat.color} />
              </div>
              <p style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: '11px', color: '#475569', marginTop: '3px' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Net pay chart + payslip summary */}
        <div className="ess-dash-charts" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px', marginBottom: '4px' }}>My Net Pay History</h3>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '20px' }}>Last 6 months</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={netPayHistory}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(1)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="netPay" stroke="#10B981" strokeWidth={2} fill="url(#netGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* This month breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px', marginBottom: '4px' }}>June 2026 Breakdown</h3>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>Your pay this month</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Gross Salary', value: fmt(payroll.grossSalary), color: '#F8FAFC' },
                { label: 'SSNIT (5.5%)', value: `- ${fmt(payroll.ssnitEmployee)}`, color: '#F59E0B' },
                { label: 'PAYE Tax', value: `- ${fmt(payroll.paye)}`, color: '#EF4444' },
                { label: 'Net Pay', value: fmt(payroll.netPay), color: '#10B981', bold: true },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: item.bold ? 'none' : '1px solid rgba(255,255,255,0.04)', borderTop: item.bold ? '1px solid rgba(255,255,255,0.08)' : 'none', marginTop: item.bold ? '4px' : '0' }}>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{item.label}</span>
                  <span style={{ fontSize: item.bold ? '15px' : '13px', fontWeight: item.bold ? 700 : 500, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent payslips + Leave summary */}
        <div className="ess-dash-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Recent payslips */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>Recent Payslips</h3>
              <a href="/employee/payslips" style={{ fontSize: '12px', color: '#6366F1', textDecoration: 'none' }}>View all</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentPayslips.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={14} color="#6366F1" />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{p.month}</p>
                      <p style={{ fontSize: '11px', color: '#475569' }}>{fmt(p.net)}</p>
                    </div>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#10B981' }}>
                    <CheckCircle size={11} /> {p.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Leave summary */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>Leave Summary</h3>
              <a href="/employee/leave" style={{ fontSize: '12px', color: '#6366F1', textDecoration: 'none' }}>Apply</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Annual Leave', total: 15, used: 15 - data.leaveBalance, color: '#6366F1' },
                { label: 'Sick Leave', total: 10, used: 2, color: '#F59E0B' },
                { label: 'Emergency Leave', total: 3, used: 0, color: '#EF4444' },
              ].map(leave => (
                <div key={leave.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{leave.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#F8FAFC' }}>{leave.total - leave.used}/{leave.total} days left</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ height: '100%', borderRadius: '3px', background: leave.color, width: `${((leave.total - leave.used) / leave.total) * 100}%`, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p style={{ fontSize: '11px', color: '#475569' }}>Total remaining</p>
              <p style={{ fontSize: '20px', fontWeight: 700, color: '#6366F1', marginTop: '2px' }}>{data.leaveBalance} days</p>
            </div>
          </motion.div>
        </div>
      </div>
    </ESSLayout>
  )
}

<style>{`
  @media (max-width: 768px) {
    .ess-dash-stats { grid-template-columns: 1fr 1fr !important; }
    .ess-dash-charts { grid-template-columns: 1fr !important; }
    .ess-dash-bottom { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 480px) {
    .ess-dash-stats { grid-template-columns: 1fr !important; }
  }
`}</style>