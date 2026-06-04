'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, X, Bell } from 'lucide-react'

type Alert = {
  id: string
  type: 'urgent' | 'warning' | 'info' | 'done'
  title: string
  desc: string
  deadline: string
  daysLeft: number
}

const alerts: Alert[] = [
  { id: '1', type: 'urgent', title: 'SSNIT Contribution Due', desc: 'Monthly SSNIT contributions for June 2026 must be filed with SSNIT by the 14th.', deadline: '14 June 2026', daysLeft: 10 },
  { id: '2', type: 'warning', title: 'PAYE Filing Deadline', desc: 'Submit your monthly PAYE return to GRA for June 2026. Late filing attracts a penalty.', deadline: '21 June 2026', daysLeft: 17 },
  { id: '3', type: 'info', title: 'Tier 2 Pension Remittance', desc: 'Remit Tier 2 pension contributions to your approved trustee for June 2026.', deadline: '14 June 2026', daysLeft: 10 },
  { id: '4', type: 'done', title: 'May 2026 SSNIT Filed', desc: 'SSNIT contributions for May 2026 were successfully submitted.', deadline: '14 May 2026', daysLeft: 0 },
]

const typeConfig = {
  urgent: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: AlertTriangle, label: 'Urgent' },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'Due Soon' },
  info: { color: '#06B6D4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)', icon: Bell, label: 'Upcoming' },
  done: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle, label: 'Completed' },
}

export default function ComplianceAlerts() {
  const [dismissed, setDismissed] = useState<string[]>([])
  const [expanded, setExpanded] = useState(true)

  const visible = alerts.filter(a => !dismissed.includes(a.id))
  const active = visible.filter(a => a.type !== 'done')

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: expanded ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={15} color="#EF4444" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>Compliance Alerts</p>
            <p style={{ fontSize: '11px', color: '#475569' }}>Ghana GRA & SSNIT deadlines</p>
          </div>
          {active.length > 0 && (
            <span style={{ padding: '2px 8px', borderRadius: '999px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '11px', fontWeight: 700 }}>
              {active.length} pending
            </span>
          )}
        </div>
        <span style={{ fontSize: '12px', color: '#475569' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {visible.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#475569', fontSize: '13px' }}>
                  All alerts dismissed ✓
                </div>
              )}
              <AnimatePresence>
                {visible.map(alert => {
                  const cfg = typeConfig[alert.type]
                  const Icon = cfg.icon
                  return (
                    <motion.div key={alert.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8, height: 0 }} layout
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: cfg.bg, border: `1px solid ${cfg.border}`, position: 'relative' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: cfg.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <Icon size={14} color={cfg.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{alert.title}</p>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: cfg.color + '15', color: cfg.color, border: `1px solid ${cfg.color}25` }}>{cfg.label}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5 }}>{alert.desc}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#475569' }}>Deadline: <span style={{ color: cfg.color, fontWeight: 600 }}>{alert.deadline}</span></span>
                          {alert.daysLeft > 0 && (
                            <span style={{ fontSize: '11px', fontWeight: 600, color: alert.daysLeft <= 7 ? '#EF4444' : '#F59E0B' }}>
                              {alert.daysLeft} days left
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setDismissed(prev => [...prev, alert.id])}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: '2px', flexShrink: 0 }}>
                        <X size={14} />
                      </button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
