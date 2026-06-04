'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { UserX, CheckCircle, Clock, AlertTriangle, Download, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { calculatePayroll } from '@/lib/payroll'

const employees = [
  { id: '1', name: 'Kwame Mensah', department: 'Engineering', position: 'Senior Developer', basicSalary: 5000, joinDate: '2023-01-15', ssnitNumber: 'SSN-001234', bankName: 'GCB Bank', bankAccount: '1234567890' },
  { id: '2', name: 'Ama Owusu', department: 'HR', position: 'HR Manager', basicSalary: 4200, joinDate: '2022-06-01', ssnitNumber: 'SSN-001235', bankName: 'Ecobank', bankAccount: '0987654321' },
  { id: '3', name: 'Kofi Asante', department: 'Finance', position: 'Accountant', basicSalary: 3800, joinDate: '2023-03-10', ssnitNumber: 'SSN-001236', bankName: 'Absa Bank', bankAccount: '1122334455' },
  { id: '4', name: 'Akosua Boateng', department: 'Sales', position: 'Sales Lead', basicSalary: 3500, joinDate: '2022-11-20', ssnitNumber: 'SSN-001237', bankName: 'Stanbic Bank', bankAccount: '5566778899' },
]

const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444']

const clearanceItems = [
  { id: 'laptop', label: 'Laptop / Equipment returned', category: 'IT' },
  { id: 'badge', label: 'Access badge / ID card returned', category: 'IT' },
  { id: 'accounts', label: 'System accounts deactivated', category: 'IT' },
  { id: 'email', label: 'Email forwarding set up', category: 'IT' },
  { id: 'handover', label: 'Work handover document completed', category: 'HR' },
  { id: 'contract', label: 'Exit interview conducted', category: 'HR' },
  { id: 'nda', label: 'NDA reminder sent', category: 'HR' },
  { id: 'leave', label: 'Outstanding leave days calculated', category: 'HR' },
  { id: 'loans', label: 'Outstanding loans settled', category: 'Finance' },
  { id: 'advances', label: 'Salary advances recovered', category: 'Finance' },
  { id: 'final_pay', label: 'Final pay calculated & approved', category: 'Finance' },
  { id: 'p45', label: 'P45 / Tax documents issued', category: 'Finance' },
]

const reasonOptions = ['Resignation', 'Redundancy', 'Contract End', 'Retirement', 'Dismissal', 'Mutual Agreement']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function yearsOfService(joinDate: string, exitDate: string) {
  const join = new Date(joinDate)
  const exit = new Date(exitDate)
  return (exit.getTime() - join.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
}

function calculateGratuity(basicSalary: number, years: number) {
  // Ghana standard: 15 working days per year of service
  const dailyRate = (basicSalary * 12) / 260
  return Math.round(dailyRate * 15 * Math.min(years, 30) * 100) / 100
}

function calculateNoticePay(basicSalary: number, noticeDays: number) {
  const dailyRate = basicSalary / 22
  return Math.round(dailyRate * noticeDays * 100) / 100
}

function calculateLeavePay(basicSalary: number, unusedDays: number) {
  const dailyRate = basicSalary / 22
  return Math.round(dailyRate * unusedDays * 100) / 100
}

const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

type OffboardingCase = {
  employeeId: string
  exitDate: string
  reason: string
  noticeDays: number
  unusedLeaveDays: number
  checklist: Record<string, boolean>
  status: 'in_progress' | 'completed'
}

export default function OffboardingPage() {
  const [cases, setCases] = useState<OffboardingCase[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({ employeeId: '', exitDate: '', reason: 'Resignation', noticeDays: '30', unusedLeaveDays: '5' })

  const handleCreate = () => {
    if (!form.employeeId || !form.exitDate) return
    const newCase: OffboardingCase = {
      employeeId: form.employeeId,
      exitDate: form.exitDate,
      reason: form.reason,
      noticeDays: Number(form.noticeDays),
      unusedLeaveDays: Number(form.unusedLeaveDays),
      checklist: Object.fromEntries(clearanceItems.map(i => [i.id, false])),
      status: 'in_progress',
    }
    setCases(prev => [newCase, ...prev])
    setShowDialog(false)
    setExpanded(form.employeeId)
    setForm({ employeeId: '', exitDate: '', reason: 'Resignation', noticeDays: '30', unusedLeaveDays: '5' })
  }

  const toggleCheck = (empId: string, itemId: string) => {
    setCases(prev => prev.map(c => {
      if (c.employeeId !== empId) return c
      const checklist = { ...c.checklist, [itemId]: !c.checklist[itemId] }
      const allDone = Object.values(checklist).every(Boolean)
      return { ...c, checklist, status: allDone ? 'completed' : 'in_progress' }
    }))
  }

  const exportCase = (c: OffboardingCase) => {
    const emp = employees.find(e => e.id === c.employeeId)
    if (!emp) return
    const years = yearsOfService(emp.joinDate, c.exitDate)
    const payroll = calculatePayroll(emp.basicSalary)
    const gratuity = calculateGratuity(emp.basicSalary, years)
    const noticePay = calculateNoticePay(emp.basicSalary, c.noticeDays)
    const leavePay = calculateLeavePay(emp.basicSalary, c.unusedLeaveDays)
    const finalNet = payroll.netPay + gratuity + noticePay + leavePay

    const content = `OFFBOARDING SUMMARY - ${emp.name}
Generated by Pavroll on ${new Date().toLocaleDateString()}
${'='.repeat(50)}

EMPLOYEE DETAILS
Name: ${emp.name}
Position: ${emp.position}
Department: ${emp.department}
SSNIT: ${emp.ssnitNumber}
Join Date: ${emp.joinDate}
Exit Date: ${c.exitDate}
Reason: ${c.reason}
Years of Service: ${years.toFixed(1)}

FINAL PAY CALCULATION
Last Month Net Pay: ${fmt(payroll.netPay)}
Gratuity (${years.toFixed(1)} years): ${fmt(gratuity)}
Notice Pay (${c.noticeDays} days): ${fmt(noticePay)}
Unused Leave Pay (${c.unusedLeaveDays} days): ${fmt(leavePay)}
TOTAL FINAL PAYMENT: ${fmt(finalNet)}

CLEARANCE STATUS
${clearanceItems.map(i => `[${c.checklist[i.id] ? 'X' : ' '}] ${i.label}`).join('\n')}
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `offboarding_${emp.name.replace(' ', '_')}.txt`
    a.click()
  }

  return (
    <DashboardLayout title="Offboarding">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { label: 'Active Cases', value: cases.filter(c => c.status === 'in_progress').length, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Completed', value: cases.filter(c => c.status === 'completed').length, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Total Cases', value: cases.length, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '16px 20px' }}>
              <p style={{ fontSize: '26px', fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>Offboarding Cases</h3>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDialog(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <UserX size={15} /> Start Offboarding
          </motion.button>
        </div>

        {/* Empty state */}
        {cases.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <UserX size={24} color="#6366F1" />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>No offboarding cases yet</p>
            <p style={{ fontSize: '13px', color: '#475569' }}>Start an offboarding process to calculate final pay and manage clearance</p>
          </div>
        )}

        {/* Cases */}
        {cases.map(c => {
          const emp = employees.find(e => e.id === c.employeeId)
          if (!emp) return null
          const years = yearsOfService(emp.joinDate, c.exitDate)
          const payroll = calculatePayroll(emp.basicSalary)
          const gratuity = calculateGratuity(emp.basicSalary, years)
          const noticePay = calculateNoticePay(emp.basicSalary, c.noticeDays)
          const leavePay = calculateLeavePay(emp.basicSalary, c.unusedLeaveDays)
          const finalTotal = payroll.netPay + gratuity + noticePay + leavePay
          const completedItems = Object.values(c.checklist).filter(Boolean).length
          const totalItems = clearanceItems.length
          const progress = Math.round((completedItems / totalItems) * 100)
          const isExpanded = expanded === c.employeeId
          const empIndex = employees.findIndex(e => e.id === c.employeeId)

          return (
            <motion.div key={c.employeeId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${c.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', overflow: 'hidden' }}>

              {/* Case header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', background: c.status === 'completed' ? 'rgba(16,185,129,0.03)' : 'transparent' }}
                onClick={() => setExpanded(isExpanded ? null : c.employeeId)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: avatarColors[empIndex % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    {getInitials(emp.name)}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>{emp.name}</p>
                    <p style={{ fontSize: '12px', color: '#475569' }}>{emp.position} • {emp.department} • Exit: {c.exitDate}</p>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    background: c.reason === 'Resignation' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                    color: c.reason === 'Resignation' ? '#F59E0B' : '#818CF8',
                    border: `1px solid ${c.reason === 'Resignation' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)'}` }}>
                    {c.reason}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* Progress */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>{completedItems}/{totalItems} cleared</p>
                    <div style={{ width: '100px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '100%', borderRadius: '2px', background: c.status === 'completed' ? '#10B981' : '#6366F1', width: `${progress}%`, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px',
                    background: c.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: c.status === 'completed' ? '#10B981' : '#F59E0B',
                    border: `1px solid ${c.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                    {c.status === 'completed' ? <><CheckCircle size={11} /> Complete</> : <><Clock size={11} /> In Progress</>}
                  </span>
                  <motion.button whileHover={{ scale: 1.02 }} onClick={e => { e.stopPropagation(); exportCase(c) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    <Download size={12} /> Export
                  </motion.button>
                  {isExpanded ? <ChevronUp size={16} color="#475569" /> : <ChevronDown size={16} color="#475569" />}
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                      {/* Final Pay Calculation */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          💰 Final Pay Calculation
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { label: `Last Month Net Pay`, value: fmt(payroll.netPay), color: '#F8FAFC' },
                            { label: `Gratuity (${years.toFixed(1)} yrs × 15 days)`, value: fmt(gratuity), color: '#6366F1' },
                            { label: `Notice Pay (${c.noticeDays} days)`, value: fmt(noticePay), color: '#F59E0B' },
                            { label: `Unused Leave (${c.unusedLeaveDays} days)`, value: fmt(leavePay), color: '#06B6D4' },
                          ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <span style={{ fontSize: '12px', color: '#94A3B8' }}>{item.label}</span>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: item.color }}>{item.value}</span>
                            </div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', marginTop: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Total Final Payment</span>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#10B981' }}>{fmt(finalTotal)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Clearance Checklist */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', marginBottom: '14px' }}>✅ Clearance Checklist</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {['IT', 'HR', 'Finance'].map(cat => (
                            <div key={cat}>
                              <p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '10px', marginBottom: '6px' }}>{cat}</p>
                              {clearanceItems.filter(i => i.category === cat).map(item => (
                                <div key={item.id} onClick={() => toggleCheck(c.employeeId, item.id)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s',
                                    background: c.checklist[item.id] ? 'rgba(16,185,129,0.06)' : 'transparent' }}>
                                  <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${c.checklist[item.id] ? '#10B981' : 'rgba(255,255,255,0.15)'}`, background: c.checklist[item.id] ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                    {c.checklist[item.id] && <CheckCircle size={11} color="white" />}
                                  </div>
                                  <span style={{ fontSize: '12px', color: c.checklist[item.id] ? '#10B981' : '#94A3B8', textDecoration: c.checklist[item.id] ? 'line-through' : 'none', transition: 'all 0.15s' }}>
                                    {item.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Start Offboarding Dialog */}
      {showDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDialog(false) }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', width: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserX size={18} color="#EF4444" />
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#F8FAFC' }}>Start Offboarding</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Employee */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Employee</label>
                <select value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                  <option value="">Select employee...</option>
                  {employees.filter(e => !cases.find(c => c.employeeId === e.id)).map(e => (
                    <option key={e.id} value={e.id}>{e.name} — {e.department}</option>
                  ))}
                </select>
              </div>

              {/* Exit date + reason */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Exit Date</label>
                  <input type="date" value={form.exitDate} onChange={e => setForm(p => ({ ...p, exitDate: e.target.value }))}
                    style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Reason</label>
                  <select value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                    style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                    {reasonOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Notice days + unused leave */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Notice Period (days)', key: 'noticeDays' },
                  { label: 'Unused Leave Days', key: 'unusedLeaveDays' },
                ].map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{f.label}</label>
                    <input type="number" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                  </div>
                ))}
              </div>

              {/* Preview calc */}
              {form.employeeId && form.exitDate && (
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  {(() => {
                    const emp = employees.find(e => e.id === form.employeeId)
                    if (!emp) return null
                    const years = yearsOfService(emp.joinDate, form.exitDate)
                    const payroll = calculatePayroll(emp.basicSalary)
                    const gratuity = calculateGratuity(emp.basicSalary, years)
                    const noticePay = calculateNoticePay(emp.basicSalary, Number(form.noticeDays))
                    const leavePay = calculateLeavePay(emp.basicSalary, Number(form.unusedLeaveDays))
                    const total = payroll.netPay + gratuity + noticePay + leavePay
                    return (
                      <div>
                        <p style={{ fontSize: '11px', color: '#818CF8', fontWeight: 600, marginBottom: '6px' }}>Estimated Final Payment</p>
                        <p style={{ fontSize: '20px', fontWeight: 800, color: '#10B981' }}>{fmt(total)}</p>
                        <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{years.toFixed(1)} years of service</p>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDialog(false)}
                style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreate}
                style={{ padding: '10px 24px', borderRadius: '10px', background: '#EF4444', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Start Offboarding
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}
