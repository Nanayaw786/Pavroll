'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Shield, Search, Download, User, CreditCard, FileText, Settings, Calendar, Users } from 'lucide-react'

type AuditAction = 'payroll' | 'employee' | 'leave' | 'settings' | 'payslip' | 'import'
type AuditSeverity = 'info' | 'warning' | 'critical'

type AuditLog = {
  id: string
  timestamp: string
  user: string
  action: string
  module: AuditAction
  details: string
  severity: AuditSeverity
  ip: string
}

const logs: AuditLog[] = [
  { id: '1', timestamp: '2026-06-04 14:32:01', user: 'Admin', action: 'Payroll Run', module: 'payroll', details: 'June 2026 payroll processed for 4 employees. Total: GHS 16,500.00', severity: 'info', ip: '192.168.1.1' },
  { id: '2', timestamp: '2026-06-04 14:30:15', user: 'Admin', action: 'Employee Added', module: 'employee', details: 'New employee Kofi Boateng added to Engineering department. Salary: GHS 4,500', severity: 'info', ip: '192.168.1.1' },
  { id: '3', timestamp: '2026-06-04 13:45:22', user: 'Admin', action: 'Salary Modified', module: 'employee', details: 'Kwame Mensah salary changed from GHS 4,500 to GHS 5,000 (+11.1%). Requires review.', severity: 'warning', ip: '192.168.1.1' },
  { id: '4', timestamp: '2026-06-04 12:20:10', user: 'Admin', action: 'Payslips Emailed', module: 'payslip', details: 'May 2026 payslips sent to 4 employees via email', severity: 'info', ip: '192.168.1.1' },
  { id: '5', timestamp: '2026-06-04 11:15:33', user: 'Admin', action: 'Leave Approved', module: 'leave', details: 'Ama Owusu sick leave (2 days: 20-21 May) approved', severity: 'info', ip: '192.168.1.1' },
  { id: '6', timestamp: '2026-06-04 10:05:44', user: 'Admin', action: 'Bulk Import', module: 'import', details: '5 employees imported via CSV. 5 valid, 0 errors.', severity: 'info', ip: '192.168.1.1' },
  { id: '7', timestamp: '2026-06-03 16:30:00', user: 'Admin', action: 'Employee Archived', module: 'employee', details: 'Yaw Darko archived from Engineering department', severity: 'warning', ip: '192.168.1.2' },
  { id: '8', timestamp: '2026-06-03 15:22:11', user: 'Admin', action: 'Settings Changed', module: 'settings', details: 'Company SSNIT employer code updated to ORG-00123', severity: 'critical', ip: '192.168.1.1' },
  { id: '9', timestamp: '2026-06-03 14:10:05', user: 'Admin', action: 'Payroll Run', module: 'payroll', details: 'May 2026 payroll processed for 4 employees. Total: GHS 16,200.00', severity: 'info', ip: '192.168.1.1' },
  { id: '10', timestamp: '2026-06-03 09:00:00', user: 'Admin', action: 'Leave Rejected', module: 'leave', details: 'Akosua Boateng annual leave (5 days) rejected — peak season', severity: 'warning', ip: '192.168.1.1' },
  { id: '11', timestamp: '2026-06-02 17:45:30', user: 'Admin', action: 'Employee Added', module: 'employee', details: 'New employee Akosua Boateng added to Sales department. Salary: GHS 3,500', severity: 'info', ip: '192.168.1.3' },
  { id: '12', timestamp: '2026-06-02 11:20:00', user: 'Admin', action: 'Payslip Downloaded', module: 'payslip', details: 'Kwame Mensah downloaded April 2026 payslip via ESS portal', severity: 'info', ip: '192.168.1.5' },
]

const moduleConfig: Record<AuditAction, { icon: any, color: string, bg: string }> = {
  payroll: { icon: CreditCard, color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  employee: { icon: User, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  leave: { icon: Calendar, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  settings: { icon: Settings, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  payslip: { icon: FileText, color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
  import: { icon: Users, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
}

const severityConfig = {
  info: { color: '#94A3B8', bg: 'rgba(148,163,184,0.08)', label: 'Info' },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: 'Warning' },
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', label: 'Critical' },
}

export default function AuditPage() {
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState<AuditAction | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | 'all'>('all')

  const filtered = logs.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase())
    const matchModule = moduleFilter === 'all' || log.module === moduleFilter
    const matchSeverity = severityFilter === 'all' || log.severity === severityFilter
    return matchSearch && matchModule && matchSeverity
  })

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Details', 'Severity', 'IP']
    const rows = logs.map(l => [l.timestamp, l.user, l.action, l.module, `"${l.details}"`, l.severity, l.ip])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pavroll_audit_trail.csv'
    a.click()
  }

  return (
    <DashboardLayout title="Audit Trail">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Stats */}
        <div className="audit-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { label: 'Total Actions', value: logs.length, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Warnings', value: logs.filter(l => l.severity === 'warning').length, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Critical', value: logs.filter(l => l.severity === 'critical').length, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
            { label: 'Today', value: logs.filter(l => l.timestamp.startsWith('2026-06-04')).length, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '16px 20px' }}>
              <p style={{ fontSize: '26px', fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Module filter */}
            <div className="audit-filters" style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', flexWrap: 'wrap' }}>
              {(['all', 'payroll', 'employee', 'leave', 'payslip', 'settings', 'import'] as const).map(m => (
                <button key={m} onClick={() => setModuleFilter(m)}
                  style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: moduleFilter === m ? '#6366F1' : 'transparent',
                    color: moduleFilter === m ? '#fff' : '#64748B' }}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {/* Severity filter */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px' }}>
              {(['all', 'info', 'warning', 'critical'] as const).map(s => (
                <button key={s} onClick={() => setSeverityFilter(s)}
                  style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: severityFilter === s ? (s === 'all' ? '#6366F1' : severityConfig[s]?.color || '#6366F1') : 'transparent',
                    color: severityFilter === s ? '#fff' : '#64748B' }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', width: '200px' }}>
              <Search size={14} color="#475569" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#94A3B8', fontSize: '13px', width: '100%' }} />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Download size={14} /> Export
            </motion.button>
          </div>
        </div>

        {/* Audit log table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div className="audit-table-header" style={{ display: 'grid', gridTemplateColumns: '160px 100px 140px 1fr 80px', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            {['Timestamp', 'User', 'Action', 'Details', 'Severity'].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Shield size={36} color="#475569" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#475569', fontSize: '14px' }}>No logs match your filters</p>
            </div>
          )}

          {filtered.map((log, i) => {
            const mc = moduleConfig[log.module]
            const sc = severityConfig[log.severity]
            const ModuleIcon = mc.icon
            return (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="audit-table-row"
                style={{ display: 'grid', gridTemplateColumns: '160px 100px 140px 1fr 80px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
                  background: log.severity === 'critical' ? 'rgba(239,68,68,0.02)' : log.severity === 'warning' ? 'rgba(245,158,11,0.01)' : 'transparent' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>{log.timestamp.split(' ')[0]}</p>
                  <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>{log.timestamp.split(' ')[1]}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={11} color="#6366F1" />
                  </div>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{log.user}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: mc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ModuleIcon size={12} color={mc.color} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#F8FAFC' }}>{log.action}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', paddingRight: '12px', lineHeight: 1.5 }}>{log.details}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '999px', width: 'fit-content', background: sc.bg, color: sc.color }}>
                  {sc.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

<style>{`
  @media (max-width: 768px) {
    .audit-stats { grid-template-columns: 1fr 1fr !important; }
    .audit-table-header { display: none !important; }
    .audit-table-row { grid-template-columns: 1fr auto !important; }
    .audit-table-row > *:nth-child(2),
    .audit-table-row > *:nth-child(3) { display: none !important; }
  }
  @media (max-width: 480px) {
    .audit-stats { grid-template-columns: 1fr !important; }
  }
`}</style>