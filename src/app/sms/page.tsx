'use client'
import { useUser } from '@clerk/nextjs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MessageSquare, Send, Users, CheckCircle, XCircle, Loader2, Phone } from 'lucide-react'
import { getEmployees, getCompanyId, type Employee } from '@/lib/employees'

type SMSLog = {
  id: string
  type: string
  recipient: string
  message: string
  status: 'sent' | 'failed'
  timestamp: string
}

const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function SMSPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [companyId, setCompanyId] = useState('')
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [logs, setLogs] = useState<SMSLog[]>([])
  const [tab, setTab] = useState<'bulk' | 'custom' | 'logs'>('bulk')
  const [selected, setSelected] = useState<string[]>([])
  const [customPhone, setCustomPhone] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [messageTemplate, setMessageTemplate] = useState('payslip')
  const [result, setResult] = useState<{ success: boolean, message: string } | null>(null)

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const currentMonth = months[new Date().getMonth()]
  const currentYear = new Date().getFullYear()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const cId = await getCompanyId(user?.id)
      setCompanyId(cId)
      const emps = await getEmployees(cId)
      setEmployees(emps.filter(e => e.status === 'active'))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const selectAll = () => {
    setSelected(selected.length === employees.length ? [] : employees.map(e => e.id))
  }

  const getPreviewMessage = (emp: Employee) => {
    const firstName = emp.name.split(' ')[0]
    switch (messageTemplate) {
      case 'payslip':
        return `Hi ${firstName}, your ${currentMonth} ${currentYear} payslip is ready. Net Pay: GHS 3,914.00. Login to Pavroll ESS to view & download. - Pavroll`
      case 'reminder':
        return `Hi ${firstName}, this is a reminder that your ${currentMonth} ${currentYear} payslip is available on Pavroll ESS. - Pavroll`
      case 'custom':
        return customMessage.replace('{name}', firstName)
      default:
        return ''
    }
  }

  const handleSendBulk = async () => {
    if (selected.length === 0) return
    setSending(true)
    setResult(null)
    try {
      const selectedEmps = employees.filter(e => selected.includes(e.id))
      const payload = selectedEmps.map(emp => ({
        phone: emp.phone,
        name: emp.name,
        netPay: 3914.00, // In real app, calculate from payroll
      }))

      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payslip',
          data: { employees: payload, month: currentMonth, year: currentYear }
        })
      })
      const data = await res.json()

      // Log results
      const newLogs: SMSLog[] = selectedEmps.map((emp, i) => ({
        id: Date.now().toString() + i,
        type: 'Payslip Notification',
        recipient: emp.name,
        message: getPreviewMessage(emp),
        status: data.success ? 'sent' : 'failed',
        timestamp: new Date().toLocaleString(),
      }))
      setLogs(prev => [...newLogs, ...prev])
      setResult({ success: data.success, message: data.success ? `SMS sent to ${data.sent} employees!` : 'Failed to send SMS' })
      if (data.success) setSelected([])
    } catch (err) {
      setResult({ success: false, message: 'SMS service error' })
    } finally {
      setSending(false)
    }
  }

  const handleSendCustom = async () => {
    if (!customPhone || !customMessage) return
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'custom', data: { phone: customPhone, message: customMessage } })
      })
      const data = await res.json()
      const newLog: SMSLog = {
        id: Date.now().toString(),
        type: 'Custom SMS',
        recipient: customPhone,
        message: customMessage,
        status: data.success ? 'sent' : 'failed',
        timestamp: new Date().toLocaleString(),
      }
      setLogs(prev => [newLog, ...prev])
      setResult({ success: data.success, message: data.success ? 'SMS sent successfully!' : 'Failed to send SMS' })
      if (data.success) { setCustomPhone(''); setCustomMessage('') }
    } catch (err) {
      setResult({ success: false, message: 'SMS service error' })
    } finally {
      setSending(false)
    }
  }

  return (
    <DashboardLayout title="Bulk SMS">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Stats */}
        <div className="sms-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { label: 'Total Employees', value: employees.length, color: '#6366F1', bg: 'rgba(99,102,241,0.08)', icon: Users },
            { label: 'SMS Sent Today', value: logs.filter(l => l.status === 'sent').length, color: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle },
            { label: 'Failed', value: logs.filter(l => l.status === 'failed').length, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: XCircle },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '1px' }}>{s.label}</p>
              </div>
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

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
          {([
            { key: 'bulk', label: 'Bulk SMS', icon: Users },
            { key: 'custom', label: 'Custom SMS', icon: Phone },
            { key: 'logs', label: 'SMS Logs', icon: MessageSquare },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: tab === t.key ? '#6366F1' : 'transparent',
                color: tab === t.key ? '#fff' : '#64748B' }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Bulk SMS Tab */}
        {tab === 'bulk' && (
          <div className="sms-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Employee selection */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '14px' }}>Select Recipients</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{selected.length} of {employees.length} selected</p>
                </div>
                <button onClick={selectAll}
                  style={{ fontSize: '12px', fontWeight: 600, color: '#6366F1', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '5px 12px', borderRadius: '7px', cursor: 'pointer' }}>
                  {selected.length === employees.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <Loader2 size={20} color="#6366F1" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
              ) : (
                employees.map((emp, i) => (
                  <div key={emp.id} onClick={() => toggleSelect(emp.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s',
                      background: selected.includes(emp.id) ? 'rgba(99,102,241,0.06)' : 'transparent' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${selected.includes(emp.id) ? '#6366F1' : 'rgba(255,255,255,0.15)'}`, background: selected.includes(emp.id) ? '#6366F1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {selected.includes(emp.id) && <CheckCircle size={11} color="white" />}
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {getInitials(emp.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{emp.name}</p>
                      <p style={{ fontSize: '11px', color: '#475569' }}>{emp.phone || 'No phone number'}</p>
                    </div>
                    <span style={{ fontSize: '11px', color: '#475569' }}>{emp.department}</span>
                  </div>
                ))
              )}
            </div>

            {/* Message config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '14px', marginBottom: '16px' }}>Message Template</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { key: 'payslip', label: 'Payslip Ready', desc: 'Notify employees their payslip is available' },
                    { key: 'reminder', label: 'Payslip Reminder', desc: 'Remind employees to check their payslip' },
                  ].map(t => (
                    <div key={t.key} onClick={() => setMessageTemplate(t.key)}
                      style={{ padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', border: `1px solid ${messageTemplate === t.key ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        background: messageTemplate === t.key ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: messageTemplate === t.key ? '#818CF8' : '#F8FAFC' }}>{t.label}</p>
                      <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{t.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Preview */}
                {selected.length > 0 && (
                  <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
                    <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</p>
                    <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.6 }}>
                      {getPreviewMessage(employees.find(e => e.id === selected[0])!)}
                    </p>
                    <p style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>{getPreviewMessage(employees.find(e => e.id === selected[0])!).length} characters</p>
                  </div>
                )}

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSendBulk} disabled={selected.length === 0 || sending}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '10px', background: selected.length > 0 ? '#6366F1' : 'rgba(255,255,255,0.05)', border: 'none', color: selected.length > 0 ? '#fff' : '#475569', fontSize: '13px', fontWeight: 600, cursor: selected.length > 0 ? 'pointer' : 'not-allowed', opacity: sending ? 0.7 : 1 }}>
                  {sending ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><Send size={15} /> Send to {selected.length} Employee{selected.length !== 1 ? 's' : ''}</>}
                </motion.button>
              </div>

              {/* SMS Tips */}
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#818CF8', marginBottom: '8px' }}>📱 SMS Tips</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {['Keep messages under 160 characters for single SMS', 'Ensure employee phone numbers are correct', 'SMS delivered to MTN, Vodafone & AirtelTigo', 'Powered by Arkesel Ghana SMS API'].map(tip => (
                    <p key={tip} style={{ fontSize: '11px', color: '#475569' }}>• {tip}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom SMS Tab */}
        {tab === 'custom' && (
          <div style={{ maxWidth: '560px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px', marginBottom: '20px' }}>Send Custom SMS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Phone Number</label>
                <input value={customPhone} onChange={e => setCustomPhone(e.target.value)} placeholder="0244123456 or +233244123456"
                  style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Message</label>
                <textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)} placeholder="Type your message... Use {name} for employee name" rows={4}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', resize: 'none' }} />
                <p style={{ fontSize: '11px', color: '#475569' }}>{customMessage.length}/160 characters</p>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSendCustom} disabled={!customPhone || !customMessage || sending}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
                {sending ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><Send size={15} /> Send SMS</>}
              </motion.button>
            </div>
          </div>
        )}

        {/* SMS Logs Tab */}
        {tab === 'logs' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '14px' }}>SMS History</h3>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>All SMS sent this session</p>
            </div>

            {logs.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <MessageSquare size={36} color="#475569" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#475569', fontSize: '14px' }}>No SMS sent yet</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <motion.div key={log.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: log.status === 'sent' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    {log.status === 'sent' ? <CheckCircle size={15} color="#10B981" /> : <XCircle size={15} color="#EF4444" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{log.recipient}</p>
                      <span style={{ fontSize: '11px', color: '#475569', flexShrink: 0, marginLeft: '12px' }}>{log.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>{log.message}</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>{log.type}</span>
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px',
                        background: log.status === 'sent' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: log.status === 'sent' ? '#10B981' : '#EF4444' }}>
                        {log.status === 'sent' ? '✓ Delivered' : '✗ Failed'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  )
}
