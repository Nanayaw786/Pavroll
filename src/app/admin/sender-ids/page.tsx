'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MessageSquare, CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react'
import { getSenderIdRequests, updateSenderIdStatus, type SenderIdRequest } from '@/lib/senderIdDb'

const statusConfig = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'Pending' },
  approved: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle, label: 'Approved' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: XCircle, label: 'Rejected' },
}

export default function AdminSenderIdsPage() {
  const [requests, setRequests] = useState<SenderIdRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [adminNote, setAdminNote] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ success: boolean, message: string } | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getSenderIdRequests()
      setRequests(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id + status)
    try {
      await updateSenderIdStatus(id, status, adminNote[id] || '')
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, admin_note: adminNote[id] || '' } : r))
      setResult({ success: true, message: `Sender ID ${status} successfully!` })

      // Notify client via email
      const req = requests.find(r => r.id === id)
      if (req) {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Pavroll Admin',
            email: 'hello.pavroll@proton.me',
            company: req.company_name,
            subject: `Sender ID "${req.sender_id}" ${status}`,
            message: `Your Sender ID request "${req.sender_id}" has been ${status}.\n\nNote: ${adminNote[id] || 'None'}\n\nYou can now use this Sender ID for your SMS notifications in Pavroll.`,
          })
        })
      }
      setTimeout(() => setResult(null), 3000)
    } catch (err) {
      setResult({ success: false, message: 'Action failed' })
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = requests.filter(r => filter === 'all' ? true : r.status === filter)
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  return (
    <DashboardLayout title="Admin — Sender ID Requests">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { label: 'Total Requests', value: stats.total, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Pending', value: stats.pending, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Approved', value: stats.approved, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Rejected', value: stats.rejected, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '16px 20px' }}>
              <p style={{ fontSize: '26px', fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Result alert */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px',
                background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              {result.success ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
              <span style={{ fontSize: '13px', color: result.success ? '#10B981' : '#EF4444', fontWeight: 500 }}>{result.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters + refresh */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px' }}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                  background: filter === f ? '#6366F1' : 'transparent',
                  color: filter === f ? '#fff' : '#64748B' }}>
                {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${stats[f]})`}
              </button>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
            <RefreshCw size={14} /> Refresh
          </motion.button>
        </div>

        {/* Requests list */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '14px' }}>Sender ID Requests</h3>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Review and approve/reject client Sender ID requests</p>
          </div>

          {loading && (
            <div style={{ padding: '48px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader2 size={20} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#475569', fontSize: '14px' }}>Loading requests...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <MessageSquare size={36} color="#475569" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#475569', fontSize: '14px' }}>No {filter !== 'all' ? filter : ''} requests</p>
            </div>
          )}

          {!loading && filtered.map((req, i) => {
            const sc = statusConfig[req.status]
            const StatusIcon = sc.icon
            return (
              <motion.div key={req.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC', fontFamily: 'monospace' }}>{req.sender_id}</p>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        <StatusIcon size={11} /> {sc.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>🏢 {req.company_name}</p>
                    <p style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Purpose: {req.purpose}</p>
                    <p style={{ fontSize: '11px', color: '#334155' }}>Submitted {new Date(req.created_at).toLocaleDateString()} at {new Date(req.created_at).toLocaleTimeString()}</p>
                    {req.admin_note && (
                      <p style={{ fontSize: '12px', color: req.status === 'rejected' ? '#EF4444' : '#10B981', marginTop: '6px' }}>Admin note: {req.admin_note}</p>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                      <input value={adminNote[req.id] || ''} onChange={e => setAdminNote(p => ({ ...p, [req.id]: e.target.value }))}
                        placeholder="Add a note (optional)..."
                        style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '12px', outline: 'none' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(req.id, 'approved')} disabled={!!actionLoading}
                          style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading ? 0.7 : 1 }}>
                          {actionLoading === req.id + 'approved' ? 'Approving...' : '✓ Approve'}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(req.id, 'rejected')} disabled={!!actionLoading}
                          style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading ? 0.7 : 1 }}>
                          {actionLoading === req.id + 'rejected' ? 'Rejecting...' : '✗ Reject'}
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  )
}
