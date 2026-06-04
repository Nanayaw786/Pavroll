'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Plus, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react'

type LeaveStatus = 'pending' | 'approved' | 'rejected'
type LeaveType = 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Emergency'

type LeaveRequest = {
  id: string
  employeeName: string
  department: string
  type: LeaveType
  from: string
  to: string
  days: number
  reason: string
  status: LeaveStatus
  appliedOn: string
}

const mockLeaves: LeaveRequest[] = [
  { id: '1', employeeName: 'Kwame Mensah', department: 'Engineering', type: 'Annual', from: '2026-06-10', to: '2026-06-14', days: 5, reason: 'Family vacation', status: 'pending', appliedOn: '2026-06-01' },
  { id: '2', employeeName: 'Ama Owusu', department: 'HR', type: 'Sick', from: '2026-06-05', to: '2026-06-06', days: 2, reason: 'Medical appointment', status: 'approved', appliedOn: '2026-06-04' },
  { id: '3', employeeName: 'Kofi Asante', department: 'Finance', type: 'Emergency', from: '2026-06-08', to: '2026-06-08', days: 1, reason: 'Family emergency', status: 'approved', appliedOn: '2026-06-07' },
  { id: '4', employeeName: 'Akosua Boateng', department: 'Sales', type: 'Annual', from: '2026-07-01', to: '2026-07-05', days: 5, reason: 'Holiday', status: 'pending', appliedOn: '2026-06-01' },
]

const leaveBalances = [
  { name: 'Kwame Mensah', annual: 15, sick: 10, used: 5, remaining: 20 },
  { name: 'Ama Owusu', annual: 15, sick: 10, used: 7, remaining: 18 },
  { name: 'Kofi Asante', annual: 15, sick: 10, used: 3, remaining: 22 },
  { name: 'Akosua Boateng', annual: 15, sick: 10, used: 2, remaining: 23 },
]

const leaveTypes: LeaveType[] = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency']
const employees = ['Kwame Mensah', 'Ama Owusu', 'Kofi Asante', 'Akosua Boateng']
const departments: Record<string, string> = { 'Kwame Mensah': 'Engineering', 'Ama Owusu': 'HR', 'Kofi Asante': 'Finance', 'Akosua Boateng': 'Sales' }
const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const statusConfig = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'Pending' },
  approved: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle, label: 'Approved' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: XCircle, label: 'Rejected' },
}

const emptyForm = { employeeName: '', type: 'Annual' as LeaveType, from: '', to: '', reason: '' }

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaves)
  const [tab, setTab] = useState<'requests' | 'balances'>('requests')
  const [filter, setFilter] = useState<'all' | LeaveStatus>('all')
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const filtered = leaves.filter(l => filter === 'all' ? true : l.status === filter)

  const handleAction = (id: string, status: LeaveStatus) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  const calcDays = (from: string, to: string) => {
    if (!from || !to) return 0
    const d = (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24) + 1
    return Math.max(0, d)
  }

  const handleSave = () => {
    if (!form.employeeName || !form.from || !form.to) return
    const days = calcDays(form.from, form.to)
    const newLeave: LeaveRequest = {
      id: Date.now().toString(),
      employeeName: form.employeeName,
      department: departments[form.employeeName] || '',
      type: form.type,
      from: form.from,
      to: form.to,
      days,
      reason: form.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    }
    setLeaves(prev => [newLeave, ...prev])
    setShowDialog(false)
    setForm(emptyForm)
  }

  const stats = {
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
    totalDays: leaves.filter(l => l.status === 'approved').reduce((s, l) => s + l.days, 0),
  }

  return (
    <DashboardLayout title="Leave Management">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Stats */}
        <div className="leave-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { label: 'Pending Requests', value: stats.pending, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Approved', value: stats.approved, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Rejected', value: stats.rejected, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
            { label: 'Days Approved', value: stats.totalDays, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '18px 20px' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs + actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px' }}>
            {(['requests', 'balances'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  background: tab === t ? '#6366F1' : 'transparent',
                  color: tab === t ? '#fff' : '#64748B' }}>
                {t === 'requests' ? 'Leave Requests' : 'Leave Balances'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {tab === 'requests' && (
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'all 0.2s',
                      background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
                      borderColor: filter === f ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)',
                      color: filter === f ? '#818CF8' : '#64748B' }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDialog(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={15} /> New Request
            </motion.button>
          </div>
        </div>

        {/* Leave Requests table */}
        {tab === 'requests' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['Employee', 'Type', 'Duration', 'Days', 'Status', 'Actions'].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>

            {filtered.map((leave, i) => {
              const sc = statusConfig[leave.status]
              const StatusIcon = sc.icon
              return (
                <motion.div key={leave.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {getInitials(leave.employeeName)}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{leave.employeeName}</p>
                      <p style={{ fontSize: '11px', color: '#475569' }}>{leave.department}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', width: 'fit-content' }}>{leave.type}</span>
                  <div>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>{leave.from}</p>
                    <p style={{ fontSize: '11px', color: '#475569' }}>to {leave.to}</p>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{leave.days}d</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', width: 'fit-content', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    <StatusIcon size={11} /> {sc.label}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {leave.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(leave.id, 'approved')}
                          style={{ padding: '5px 10px', borderRadius: '7px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                          Approve
                        </button>
                        <button onClick={() => handleAction(leave.id, 'rejected')}
                          style={{ padding: '5px 10px', borderRadius: '7px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                          Reject
                        </button>
                      </>
                    )}
                    {leave.status !== 'pending' && (
                      <button onClick={() => handleAction(leave.id, 'pending')}
                        style={{ padding: '5px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B', fontSize: '11px', cursor: 'pointer' }}>
                        Reset
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Leave Balances table */}
        {tab === 'balances' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['Employee', 'Annual Entitlement', 'Sick Leave', 'Days Used', 'Remaining'].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>
            {leaveBalances.map((emp, i) => (
              <motion.div key={emp.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                    {getInitials(emp.name)}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{emp.name}</span>
                </div>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{emp.annual} days</span>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{emp.sick} days</span>
                <span style={{ fontSize: '13px', color: '#EF4444' }}>{emp.used} days</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>{emp.remaining} days</span>
                  <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', maxWidth: '60px' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: '#10B981', width: `${(emp.remaining / 25) * 100}%` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* New Request Dialog */}
      {showDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDialog(false) }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', width: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color="#6366F1" />
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#F8FAFC' }}>New Leave Request</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Employee', key: 'employeeName', type: 'select', options: employees },
                { label: 'Leave Type', key: 'type', type: 'select', options: leaveTypes },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{field.label}</label>
                  <select value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                    <option value="">Select...</option>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[{ label: 'From', key: 'from' }, { label: 'To', key: 'to' }].map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{f.label}</label>
                    <input type="date" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                  </div>
                ))}
              </div>

              {form.from && form.to && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <span style={{ fontSize: '13px', color: '#818CF8', fontWeight: 600 }}>{calcDays(form.from, form.to)} working days</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Reason</label>
                <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Brief reason for leave..." rows={3}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', resize: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDialog(false)}
                style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave}
                style={{ padding: '10px 24px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Submit Request
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}

<style>{`
  @media (max-width: 768px) {
    .leave-stats { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 480px) {
    .leave-stats { grid-template-columns: 1fr !important; }
  }
`}</style>