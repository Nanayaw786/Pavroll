'use client'
import ESSLayout from '@/components/ess/ESSLayout'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Plus, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'

const leaveBalances: Record<string, { annual: number, sick: number, emergency: number, used: number }> = {
  '1': { annual: 15, sick: 10, emergency: 3, used: 5 },
  '2': { annual: 15, sick: 10, emergency: 3, used: 7 },
  '3': { annual: 15, sick: 10, emergency: 3, used: 3 },
  '4': { annual: 15, sick: 10, emergency: 3, used: 2 },
}

type LeaveType = 'Annual' | 'Sick' | 'Emergency' | 'Maternity' | 'Paternity'
type LeaveStatus = 'pending' | 'approved' | 'rejected'

type LeaveRequest = {
  id: string
  type: LeaveType
  from: string
  to: string
  days: number
  reason: string
  status: LeaveStatus
  appliedOn: string
}

const mockRequests: LeaveRequest[] = [
  { id: '1', type: 'Annual', from: '2026-06-10', to: '2026-06-14', days: 5, reason: 'Family vacation', status: 'pending', appliedOn: '2026-06-01' },
  { id: '2', type: 'Sick', from: '2026-05-20', to: '2026-05-21', days: 2, reason: 'Medical appointment', status: 'approved', appliedOn: '2026-05-19' },
  { id: '3', type: 'Emergency', from: '2026-04-08', to: '2026-04-08', days: 1, reason: 'Family emergency', status: 'approved', appliedOn: '2026-04-07' },
]

const leaveTypes: LeaveType[] = ['Annual', 'Sick', 'Emergency', 'Maternity', 'Paternity']

const statusConfig = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'Pending' },
  approved: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle, label: 'Approved' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: XCircle, label: 'Rejected' },
}

const emptyForm = { type: 'Annual' as LeaveType, from: '', to: '', reason: '' }

export default function ESSLeave() {
  const [employee, setEmployee] = useState<{ id: string, name: string } | null>(null)
  const [requests, setRequests] = useState<LeaveRequest[]>(mockRequests)
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ess_employee')
    if (stored) setEmployee(JSON.parse(stored))
  }, [])

  if (!employee) return null

  const balance = leaveBalances[employee.id]
  const remaining = balance.annual - balance.used

  const calcDays = (from: string, to: string) => {
    if (!from || !to) return 0
    return Math.max(0, Math.floor((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)) + 1)
  }

  const handleSubmit = () => {
    if (!form.from || !form.to || !form.reason) return
    const days = calcDays(form.from, form.to)
    const newReq: LeaveRequest = {
      id: Date.now().toString(),
      type: form.type,
      from: form.from,
      to: form.to,
      days,
      reason: form.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    }
    setRequests(prev => [newReq, ...prev])
    setShowDialog(false)
    setForm(emptyForm)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <ESSLayout title="My Leave">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Success toast */}
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="#10B981" />
            <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 500 }}>Leave request submitted successfully. Awaiting manager approval.</span>
          </motion.div>
        )}

        {/* Balance cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { label: 'Annual Leave', total: balance.annual, remaining: remaining, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Sick Leave', total: balance.sick, remaining: balance.sick - 2, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Emergency Leave', total: balance.emergency, remaining: balance.emergency, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
            { label: 'Days Used', total: balance.annual, remaining: balance.used, color: '#94A3B8', bg: 'rgba(148,163,184,0.08)' },
          ].map((b, i) => (
            <motion.div key={b.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: b.bg, border: `1px solid ${b.color}20`, borderRadius: '14px', padding: '18px 20px' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: b.color }}>{b.remaining}</p>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{b.label}</p>
              <div style={{ marginTop: '8px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', borderRadius: '2px', background: b.color, width: `${(b.remaining / b.total) * 100}%` }} />
              </div>
              <p style={{ fontSize: '10px', color: '#475569', marginTop: '4px' }}>{b.remaining} of {b.total} days</p>
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>My Leave Requests</h3>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDialog(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={15} /> Apply for Leave
          </motion.button>
        </div>

        {/* Requests list */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            {['Type', 'Duration', 'Days', 'Status', 'Reason'].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {requests.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Calendar size={36} color="#475569" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#475569', fontSize: '14px' }}>No leave requests yet</p>
            </div>
          )}

          {requests.map((req, i) => {
            const sc = statusConfig[req.status]
            const StatusIcon = sc.icon
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px 1fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)', width: 'fit-content', fontWeight: 500 }}>{req.type}</span>
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>{req.from}</p>
                  <p style={{ fontSize: '11px', color: '#475569' }}>to {req.to}</p>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{req.days}d</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', width: 'fit-content', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                  <StatusIcon size={11} /> {sc.label}
                </span>
                <span style={{ fontSize: '12px', color: '#475569' }}>{req.reason}</span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Apply dialog */}
      {showDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDialog(false) }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', width: '460px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color="#6366F1" />
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#F8FAFC' }}>Apply for Leave</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Leave Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as LeaveType }))}
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
                  <span style={{ fontSize: '12px', color: '#475569', marginLeft: '8px' }}>({remaining} days remaining)</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Reason</label>
                <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Brief reason for leave request..." rows={3}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', resize: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDialog(false)}
                style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                style={{ padding: '10px 24px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Submit Request
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </ESSLayout>
  )
}
