'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Plus, CheckCircle, XCircle, Clock, Calendar, Loader2 } from 'lucide-react'
import { getLeaveRequests, addLeaveRequest, updateLeaveStatus, type LeaveRequest } from '@/lib/leaveDb'
import { getEmployees, getCompanyId, type Employee } from '@/lib/employees'

type LeaveStatus = 'pending' | 'approved' | 'rejected'

const statusConfig = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'Pending' },
  approved: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle, label: 'Approved' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: XCircle, label: 'Rejected' },
}

const leaveTypes = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Emergency']
const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const emptyForm = { employeeId: '', type: 'Annual', from: '', to: '', reason: '' }

export default function LeavePage() {
  const [companyId, setCompanyId] = useState('')
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'requests' | 'balances'>('requests')
  const [filter, setFilter] = useState<'all' | LeaveStatus>('all')
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const cId = await getCompanyId()
      setCompanyId(cId)
      const [leaveData, empData] = await Promise.all([
        getLeaveRequests(cId),
        getEmployees(cId)
      ])
      setLeaves(leaveData)
      setEmployees(empData.filter(e => e.status === 'active'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = leaves.filter(l => filter === 'all' ? true : l.status === filter)

  const handleAction = async (id: string, status: LeaveStatus) => {
    await updateLeaveStatus(id, status)
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  const calcDays = (from: string, to: string) => {
    if (!from || !to) return 0
    return Math.max(0, Math.floor((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)) + 1)
  }

  const handleSave = async () => {
    if (!form.employeeId || !form.from || !form.to) return
    setSaving(true)
    try {
      const days = calcDays(form.from, form.to)
      const newLeave = await addLeaveRequest({
        company_id: companyId,
        employee_id: form.employeeId,
        type: form.type,
        from_date: form.from,
        to_date: form.to,
        days,
        reason: form.reason,
        status: 'pending',
      })
      setLeaves(prev => [newLeave, ...prev])
      setShowDialog(false)
      setForm(emptyForm)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
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

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
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

        {/* Loading */}
        {loading && (
          <div style={{ padding: '48px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Loader2 size={20} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#475569', fontSize: '14px' }}>Loading leave requests...</span>
          </div>
        )}

        {/* Leave Requests table */}
        {!loading && tab === 'requests' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['Employee', 'Type', 'Duration', 'Days', 'Status', 'Actions'].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <Calendar size={36} color="#475569" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#475569', fontSize: '14px' }}>No leave requests yet</p>
              </div>
            )}

            {filtered.map((leave, i) => {
              const sc = statusConfig[leave.status]
              const StatusIcon = sc.icon
              const empName = leave.employee?.name || 'Unknown'
              const empDept = leave.employee?.department || ''
              return (
                <motion.div key={leave.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {getInitials(empName)}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{empName}</p>
                      <p style={{ fontSize: '11px', color: '#475569' }}>{empDept}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', width: 'fit-content' }}>{leave.type}</span>
                  <div>
                    <p style={{ fontSize: '12px', color: '#94A3B8' }}>{leave.from_date}</p>
                    <p style={{ fontSize: '11px', color: '#475569' }}>to {leave.to_date}</p>
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

        {/* Leave Balances */}
        {!loading && tab === 'balances' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['Employee', 'Annual', 'Sick', 'Days Used', 'Remaining'].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>
            {employees.map((emp, i) => {
              const empLeaves = leaves.filter(l => l.employee_id === emp.id && l.status === 'approved')
              const used = empLeaves.reduce((s, l) => s + l.days, 0)
              const remaining = Math.max(0, 15 - used)
              return (
                <motion.div key={emp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                      {getInitials(emp.name)}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{emp.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>15 days</span>
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>10 days</span>
                  <span style={{ fontSize: '13px', color: '#EF4444' }}>{used} days</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>{remaining} days</span>
                    <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', maxWidth: '60px' }}>
                      <div style={{ height: '100%', borderRadius: '2px', background: '#10B981', width: `${(remaining / 15) * 100}%` }} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Employee</label>
                <select value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Leave Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                  {leaveTypes.map(t => <option key={t} value={t}>{t} Leave</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[{ label: 'From', key: 'from' }, { label: 'To', key: 'to' }].map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{f.label}</label>
                    <input type="date" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                  </div>
                ))}
              </div>

              {form.from && form.to && calcDays(form.from, form.to) > 0 && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <span style={{ fontSize: '13px', color: '#818CF8', fontWeight: 600 }}>{calcDays(form.from, form.to)} days requested</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Reason</label>
                <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Brief reason..." rows={3}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', resize: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDialog(false)}
                style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Submit Request'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .leave-stats { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .leave-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  )
}
