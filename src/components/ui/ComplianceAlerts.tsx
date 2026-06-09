'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, Bell } from 'lucide-react'

type Alert = {
  id: string
  type: 'urgent' | 'warning' | 'info' | 'done'
  title: string
  desc: string
  deadline: string
  daysLeft: number
}

function getAlerts(): Alert[] {
  const now = new Date()
  const month = now.toLocaleString('en-GH', { month: 'long', year: 'numeric' })
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleString('en-GH', { month: 'long', year: 'numeric' })
  const year = now.getFullYear()
  const m = now.getMonth()

  const ssnit14 = new Date(year, m, 14)
  const paye15 = new Date(year, m, 15)
  const tier14 = new Date(year, m, 14)

  const daysTo = (d: Date) => Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return [
    {
      id: '1',
      type: daysTo(ssnit14) <= 3 ? 'urgent' : daysTo(ssnit14) <= 7 ? 'warning' : daysTo(ssnit14) < 0 ? 'done' : 'info',
      title: 'SSNIT Contribution Due',
      desc: `Monthly SSNIT contributions for ${month} must be filed with SSNIT by the 14th.`,
      deadline: `14 ${month}`,
      daysLeft: Math.max(0, daysTo(ssnit14)),
    },
    {
      id: '2',
      type: daysTo(paye15) <= 3 ? 'urgent' : daysTo(paye15) <= 7 ? 'warning' : daysTo(paye15) < 0 ? 'done' : 'info',
      title: 'PAYE Filing Deadline',
      desc: `Submit your monthly PAYE return to GRA for ${month}. Late filing attracts a penalty.`,
      deadline: `15 ${month}`,
      daysLeft: Math.max(0, daysTo(paye15)),
    },
    {
      id: '3',
      type: daysTo(tier14) <= 3 ? 'urgent' : daysTo(tier14) <= 7 ? 'warning' : daysTo(tier14) < 0 ? 'done' : 'info',
      title: 'Tier 2 Pension Remittance',
      desc: `Remit Tier 2 pension contributions to your approved trustee for ${month}.`,
      deadline: `14 ${month}`,
      daysLeft: Math.max(0, daysTo(tier14)),
    },
    {
      id: '4',
      type: 'done',
      title: `${prevMonth} SSNIT Filed`,
      desc: `SSNIT contributions for ${prevMonth} deadline has passed.`,
      deadline: `14 ${prevMonth}`,
      daysLeft: 0,
    },
  ]
}

const typeConfig = {
  urgent: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', icon: AlertTriangle, label: 'Urgent' },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'Due Soon' },
  info: { color: '#06B6D4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)', icon: Bell, label: 'Upcoming' },
  done: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle, label: 'Completed' },
}

export default function ComplianceAlerts() {
  const [dismissed, setDismissed] = useState<string[]>([])
  const [expanded, setExpanded] = useState(true)
  const alerts = getAlerts()
  const visible = alerts.filter(a => !dismissed.includes(a.id))
  const active = visible.filter(a => a.type !== 'done')

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
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
        <span style={{ color: '#475569', fontSize: '18px' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
            {visible.map(alert => {
              const cfg = typeConfig[alert.type]
              const Icon = cfg.icon
              return (
                <div key={alert.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: cfg.bg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                      <Icon size={16} color={cfg.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{alert.title}</p>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: `${cfg.color}20`, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>{alert.desc}</p>
                        <p style={{ fontSize: '11px', color: cfg.color, marginTop: '4px', fontWeight: 600 }}>
                          Deadline: {alert.deadline}{alert.daysLeft > 0 ? ` — ${alert.daysLeft} days left` : ''}
                        </p>
                      </div>
                    </div>
                    {alert.type !== 'done' && (
                      <button onClick={() => setDismissed(p => [...p, alert.id])}
                        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '16px', flexShrink: 0 }}>×</button>
                    )}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
