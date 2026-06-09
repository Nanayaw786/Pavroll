'use client'
import { useUser } from '@clerk/nextjs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Shield, Search, Download, User, CreditCard, FileText, Settings, Calendar, Users, Loader2 } from 'lucide-react'
import { getAuditLogs, type AuditLog } from '@/lib/auditDb'
import { getCompanyId } from '@/lib/employees'

type AuditAction = 'payroll' | 'employee' | 'leave' | 'settings' | 'payslip' | 'import'

const moduleConfig: Record<string, { icon: any, color: string, bg: string }> = {
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
  const [logs, setLogs] = useState<AuditLog[]>([])
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const cId = await getCompanyId(user?.id)
      const data = await getAuditLogs(cId)
      setLogs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = logs.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.user_email.toLowerCase().includes(search.toLowerCase())
    const matchModule = moduleFilter === 'all' || log.module === moduleFilter
    const matchSeverity = severityFilter === 'all' || log.severity === severityFilter
    return matchSearch && matchModule && matchSeverity
  })

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Details', 'Severity']
    const rows = logs.map(l => [l.created_at, l.user_email, l.action, l.module, `"${l.details}"`, l.severity])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pavroll_audit_trail.csv'
    a.click()
  }

  const stats = {
    total: logs.length,
    warnings: logs.filter(l => l.severity === 'warning').length,
    critical: logs.filter(l => l.severity === 'critical').length,
    today: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length,
  }

  return (
    <DashboardLayout title="Audit Trail">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Stats */}
        <div className="audit-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { label: 'Total Actions', value: stats.total, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Warnings', value: stats.warnings, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Critical', value: stats.critical, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
            { label: 'Today', value: stats.today, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
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
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', flexWrap: 'wrap' }}>
              {['all', 'payroll', 'employee', 'leave', 'payslip', 'settings', 'import'].map(m => (
                <button key={m} onClick={() => setModuleFilter(m)}
                  style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: moduleFilter === m ? '#6366F1' : 'transparent',
                    color: moduleFilter === m ? '#fff' : '#64748B' }}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px' }}>
              {['all', 'info', 'warning', 'critical'].map(s => (
                <button key={s} onClick={() => setSeverityFilter(s)}
                  style={{ padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: severityFilter === s ? '#6366F1' : 'transparent',
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

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div className="audit-table-header" style={{ display: 'grid', gridTemplateColumns: '160px 140px 140px 1fr 80px', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            {['Timestamp', 'User', 'Action', 'Details', 'Severity'].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {loading && (
            <div style={{ padding: '48px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader2 size={20} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#475569', fontSize: '14px' }}>Loading audit logs...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Shield size={36} color="#475569" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#475569', fontSize: '14px' }}>No audit logs yet</p>
              <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>Actions will appear here as you use Pavroll</p>
            </div>
          )}

          {!loading && filtered.map((log, i) => {
            const mc = moduleConfig[log.module] || moduleConfig['payroll']
            const sc = severityConfig[log.severity]
            const ModuleIcon = mc.icon
            const date = new Date(log.created_at)
            return (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="audit-table-row"
                style={{ display: 'grid', gridTemplateColumns: '160px 140px 140px 1fr 80px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
                  background: log.severity === 'critical' ? 'rgba(239,68,68,0.02)' : log.severity === 'warning' ? 'rgba(245,158,11,0.01)' : 'transparent' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>{date.toLocaleDateString()}</p>
                  <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>{date.toLocaleTimeString()}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={11} color="#6366F1" />
                  </div>
                  <span style={{ fontSize: '12px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.user_email.split('@')[0]}</span>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
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
    </DashboardLayout>
  )
}
