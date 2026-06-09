'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Download, Send, Eye, FileText, CheckCircle } from 'lucide-react'
import { calculatePayroll } from '@/lib/payroll'

const employees: any[] = [


]

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
const avatarColors = ['#6366F1','#10B981','#F59E0B','#EF4444']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function PayslipPreview({ emp, month, year, onClose }: { emp: typeof employees[0], month: number, year: number, onClose: () => void }) {
  const result = calculatePayroll(emp.basicSalary)

  const printPayslip = () => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${emp.name} - ${months[month]} ${year}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', Arial, sans-serif; background: #fff; color: #1a1a2e; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #6366F1; }
          .company { display: flex; align-items: center; gap: 12px; }
          .logo { width: 40px; height: 40px; background: linear-gradient(135deg, #6366F1, #818CF8); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 16px; }
          .company-name { font-size: 22px; font-weight: 800; color: #1a1a2e; }
          .payslip-title { text-align: right; }
          .payslip-title h2 { font-size: 18px; font-weight: 700; color: #6366F1; }
          .payslip-title p { font-size: 13px; color: #64748b; margin-top: 2px; }
          .employee-section { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; background: #f8fafc; border-radius: 12px; padding: 20px; }
          .field label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          .field p { font-size: 14px; color: #1a1a2e; font-weight: 600; margin-top: 3px; }
          .section-title { font-size: 13px; font-weight: 700; color: #6366F1; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
          .earnings-deductions { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th { font-size: 11px; color: #94a3b8; font-weight: 600; text-align: left; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          td { font-size: 13px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #334155; }
          td:last-child { text-align: right; font-weight: 600; color: #1a1a2e; }
          .total-row td { font-weight: 700; font-size: 14px; color: #6366F1; border-top: 2px solid #6366F1; border-bottom: none; padding-top: 12px; }
          .net-pay { background: linear-gradient(135deg, #6366F1, #818CF8); border-radius: 12px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
          .net-pay p { color: rgba(255,255,255,0.8); font-size: 13px; }
          .net-pay h2 { color: white; font-size: 28px; font-weight: 800; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">
            <div class="logo">P</div>
            <div>
              <div class="company-name">Pavroll</div>
              <div style="font-size:12px;color:#64748b;">HR & Payroll Management</div>
            </div>
          </div>
          <div class="payslip-title">
            <h2>PAYSLIP</h2>
            <p>${months[month]} ${year}</p>
            <p style="margin-top:4px;color:#6366F1;font-weight:600;">Confidential</p>
          </div>
        </div>

        <div class="employee-section">
          <div class="field"><label>Employee Name</label><p>${emp.name}</p></div>
          <div class="field"><label>Position</label><p>${emp.position}</p></div>
          <div class="field"><label>Department</label><p>${emp.department}</p></div>
          <div class="field"><label>SSNIT Number</label><p>${emp.ssnitNumber}</p></div>
          <div class="field"><label>Bank</label><p>${emp.bankName}</p></div>
          <div class="field"><label>Account Number</label><p>${emp.bankAccount}</p></div>
        </div>

        <div class="earnings-deductions">
          <div>
            <div class="section-title">Earnings</div>
            <table>
              <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
              <tr><td>Basic Salary</td><td>${fmt(result.basicSalary)}</td></tr>
              <tr><td>Gross Salary</td><td>${fmt(result.grossSalary)}</td></tr>
              <tr class="total-row"><td>Total Earnings</td><td>${fmt(result.grossSalary)}</td></tr>
            </table>
          </div>
          <div>
            <div class="section-title">Deductions</div>
            <table>
              <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
              <tr><td>SSNIT (Employee 5.5%)</td><td>${fmt(result.ssnitEmployee)}</td></tr>
              <tr><td>PAYE Tax</td><td>${fmt(result.paye)}</td></tr>
              <tr class="total-row"><td>Total Deductions</td><td>${fmt(result.totalDeductions)}</td></tr>
            </table>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <div class="section-title">Employer Contributions</div>
          <table>
            <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
            <tr><td>SSNIT Employer (11%)</td><td>${fmt(result.ssnitEmployer)}</td></tr>
            <tr><td>Tier 2 Employer (2%)</td><td>${fmt(result.tier2Employer)}</td></tr>
          </table>
        </div>

        <div class="net-pay">
          <div><p>NET PAY FOR ${months[month].toUpperCase()} ${year}</p><h2>${fmt(result.netPay)}</h2></div>
          <div style="text-align:right"><p>Payment Method</p><p style="color:white;font-weight:700;font-size:14px;margin-top:4px;">Bank Transfer</p><p style="color:rgba(255,255,255,0.7);font-size:12px;">${emp.bankName} • ${emp.bankAccount}</p></div>
        </div>

        <div class="footer">
          <span>Generated by Pavroll • ${new Date().toLocaleDateString()}</span>
          <span>This is a computer-generated payslip and requires no signature.</span>
        </div>
      </body>
      </html>
    `)
    w.document.close()
    w.print()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Modal header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={18} color="#6366F1" />
            <span style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>Payslip Preview</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={printPayslip}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              <Download size={13} /> Download PDF
            </motion.button>
            <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>

        {/* Payslip content */}
        <div style={{ padding: '28px 32px', background: '#fff', margin: '20px', borderRadius: '16px', color: '#1a1a2e' }}>
          {/* Company header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid #6366F1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px' }}>P</div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '18px' }}>Pavroll</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>HR & Payroll Management</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 700, color: '#6366F1', fontSize: '16px' }}>PAYSLIP</p>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{months[month]} {year}</p>
            </div>
          </div>

          {/* Employee info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            {[
              { label: 'Employee', value: emp.name },
              { label: 'Position', value: emp.position },
              { label: 'Department', value: emp.department },
              { label: 'SSNIT No.', value: emp.ssnitNumber },
              { label: 'Bank', value: emp.bankName },
              { label: 'Account', value: emp.bankAccount },
            ].map(f => (
              <div key={f.label}>
                <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginTop: '2px' }}>{f.value}</p>
              </div>
            ))}
          </div>

          {/* Earnings & Deductions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Earnings</p>
              {[
                { label: 'Basic Salary', value: fmt(result.basicSalary) },
                { label: 'Gross Salary', value: fmt(result.grossSalary) },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '12px', color: '#334155' }}>{r.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a2e' }}>{r.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '2px solid #6366F1', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366F1' }}>Total</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#6366F1' }}>{fmt(result.grossSalary)}</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Deductions</p>
              {[
                { label: 'SSNIT (5.5%)', value: fmt(result.ssnitEmployee) },
                { label: 'PAYE Tax', value: fmt(result.paye) },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '12px', color: '#334155' }}>{r.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444' }}>{r.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '2px solid #EF4444', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>Total</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>{fmt(result.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Pay — {months[month]} {year}</p>
              <p style={{ color: 'white', fontSize: '26px', fontWeight: 800, marginTop: '4px' }}>{fmt(result.netPay)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>Bank Transfer</p>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{emp.bankName}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{emp.bankAccount}</p>
            </div>
          </div>

          <p style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', marginTop: '16px' }}>Generated by Pavroll • {new Date().toLocaleDateString()} • Computer-generated, no signature required</p>
        </div>
      </motion.div>
    </div>
  )
}

export default function PayslipsPage() {
  const [selectedMonth, setSelectedMonth] = useState(5)
  const [selectedYear] = useState(2026)
  const [previewEmp, setPreviewEmp] = useState<typeof employees[0] | null>(null)
  const [sentIds, setSentIds] = useState<string[]>([])
  const [sending, setSending] = useState<string | null>(null)

  const handleSend = (id: string) => {
    setSending(id)
    setTimeout(() => { setSending(null); setSentIds(prev => [...prev, id]) }, 1500)
  }

  const handleSendAll = () => {
    employees.forEach((emp, i) => {
      setTimeout(() => {
        setSentIds(prev => [...prev, emp.id])
      }, i * 400)
    })
  }

  return (
    <DashboardLayout title="Payslips">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
              style={{ padding: '8px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
              {months.map((m, i) => <option key={m} value={i}>{m} {selectedYear}</option>)}
            </select>
            <span style={{ fontSize: '13px', color: '#475569' }}>{employees.length} employees</span>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSendAll}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <Send size={14} /> Email All Payslips
          </motion.button>
        </div>

        {/* Stats */}
        <div className="payslips-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { label: 'Total Payslips', value: employees.length, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Sent', value: sentIds.length, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Pending', value: employees.length - sentIds.length, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '18px 20px' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Payslips table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div className="payslip-table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            {['Employee', 'Department', 'Basic Salary', 'Net Pay', 'Status', 'Actions'].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {employees.map((emp, i) => {
            const result = calculatePayroll(emp.basicSalary)
            const sent = sentIds.includes(emp.id)
            const isSending = sending === emp.id
            return (
              <motion.div key={emp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="payslip-table-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {getInitials(emp.name)}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{emp.name}</p>
                    <p style={{ fontSize: '11px', color: '#475569' }}>{emp.email}</p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{emp.department}</span>
                <span style={{ fontSize: '13px', color: '#F8FAFC' }}>{fmt(emp.basicSalary)}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>{fmt(result.netPay)}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', width: 'fit-content',
                  background: sent ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: sent ? '#10B981' : '#F59E0B',
                  border: `1px solid ${sent ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                  {sent ? <><CheckCircle size={11} /> Sent</> : <><FileText size={11} /> Pending</>}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPreviewEmp(emp)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    <Eye size={11} /> View
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSend(emp.id)} disabled={sent || isSending}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px', background: sent ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${sent ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)'}`, color: sent ? '#10B981' : '#94A3B8', fontSize: '11px', fontWeight: 600, cursor: sent ? 'default' : 'pointer', opacity: isSending ? 0.6 : 1 }}>
                    {isSending ? '...' : sent ? <><CheckCircle size={11} /> Sent</> : <><Send size={11} /> Send</>}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {previewEmp && <PayslipPreview emp={previewEmp} month={selectedMonth} year={selectedYear} onClose={() => setPreviewEmp(null)} />}
    </DashboardLayout>
  )
}

<style>{`
  @media (max-width: 768px) {
    .payslips-stats { grid-template-columns: 1fr !important; }
  }
`}</style>