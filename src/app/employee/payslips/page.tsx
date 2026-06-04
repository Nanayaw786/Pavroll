'use client'
import ESSLayout from '@/components/ess/ESSLayout'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FileText, Download, Eye, CheckCircle } from 'lucide-react'
import { calculatePayroll } from '@/lib/payroll'

const employeeData: Record<string, { position: string, department: string, basicSalary: number, ssnitNumber: string, bankName: string, bankAccount: string }> = {
  '1': { position: 'Senior Developer', department: 'Engineering', basicSalary: 5000, ssnitNumber: 'SSN-001234', bankName: 'GCB Bank', bankAccount: '1234567890' },
  '2': { position: 'HR Manager', department: 'HR', basicSalary: 4200, ssnitNumber: 'SSN-001235', bankName: 'Ecobank', bankAccount: '0987654321' },
  '3': { position: 'Accountant', department: 'Finance', basicSalary: 3800, ssnitNumber: 'SSN-001236', bankName: 'Absa Bank', bankAccount: '1122334455' },
  '4': { position: 'Sales Lead', department: 'Sales', basicSalary: 3500, ssnitNumber: 'SSN-001237', bankName: 'Stanbic Bank', bankAccount: '5566778899' },
}

const payslipMonths = [
  { month: 'June', year: 2026 },
  { month: 'May', year: 2026 },
  { month: 'April', year: 2026 },
  { month: 'March', year: 2026 },
  { month: 'February', year: 2026 },
  { month: 'January', year: 2026 },
]

const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ESSPayslips() {
  const [employee, setEmployee] = useState<{ id: string, name: string, email: string } | null>(null)
  const [viewing, setViewing] = useState<{ month: string, year: number } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ess_employee')
    if (stored) setEmployee(JSON.parse(stored))
  }, [])

  if (!employee) return null

  const data = employeeData[employee.id]
  const payroll = calculatePayroll(data.basicSalary)

  const printPayslip = (month: string, year: number) => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`
      <!DOCTYPE html><html><head><title>Payslip - ${employee.name} - ${month} ${year}</title>
      <style>* { margin:0;padding:0;box-sizing:border-box; } body { font-family:Arial,sans-serif;background:#fff;color:#1a1a2e;padding:40px; } .header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #6366F1; } .logo { width:40px;height:40px;background:linear-gradient(135deg,#6366F1,#818CF8);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:16px; } .grid { display:grid;grid-template-columns:1fr 1fr;gap:24px;background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px; } .field label { font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase; } .field p { font-size:14px;font-weight:600;margin-top:3px; } table { width:100%;border-collapse:collapse; } th { font-size:11px;color:#94a3b8;text-align:left;padding:8px 0;border-bottom:1px solid #e2e8f0; } td { font-size:13px;padding:10px 0;border-bottom:1px solid #f1f5f9;color:#334155; } td:last-child { text-align:right;font-weight:600; } .net { background:linear-gradient(135deg,#6366F1,#818CF8);border-radius:12px;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;margin-top:16px; } </style>
      </head><body>
      <div class="header"><div style="display:flex;align-items:center;gap:12px"><div class="logo">P</div><div><div style="font-size:20px;font-weight:800">Pavroll</div><div style="font-size:12px;color:#64748b">HR & Payroll</div></div></div><div style="text-align:right"><div style="font-size:18px;font-weight:700;color:#6366F1">PAYSLIP</div><div style="font-size:13px;color:#64748b">${month} ${year}</div></div></div>
      <div class="grid"><div class="field"><label>Employee</label><p>${employee.name}</p></div><div class="field"><label>Position</label><p>${data.position}</p></div><div class="field"><label>Department</label><p>${data.department}</p></div><div class="field"><label>SSNIT</label><p>${data.ssnitNumber}</p></div><div class="field"><label>Bank</label><p>${data.bankName}</p></div><div class="field"><label>Account</label><p>${data.bankAccount}</p></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:16px">
      <div><p style="font-size:11px;font-weight:700;color:#6366F1;text-transform:uppercase;margin-bottom:8px">Earnings</p><table><tr><th>Description</th><th style="text-align:right">Amount</th></tr><tr><td>Basic Salary</td><td>${fmt(payroll.basicSalary)}</td></tr><tr><td>Gross Salary</td><td>${fmt(payroll.grossSalary)}</td></tr></table></div>
      <div><p style="font-size:11px;font-weight:700;color:#EF4444;text-transform:uppercase;margin-bottom:8px">Deductions</p><table><tr><th>Description</th><th style="text-align:right">Amount</th></tr><tr><td>SSNIT (5.5%)</td><td>${fmt(payroll.ssnitEmployee)}</td></tr><tr><td>PAYE Tax</td><td>${fmt(payroll.paye)}</td></tr></table></div>
      </div>
      <div class="net"><div><p style="color:rgba(255,255,255,0.75);font-size:11px;text-transform:uppercase">NET PAY — ${month.toUpperCase()} ${year}</p><p style="color:white;font-size:28px;font-weight:800;margin-top:4px">${fmt(payroll.netPay)}</p></div><div style="text-align:right"><p style="color:rgba(255,255,255,0.75);font-size:11px">Bank Transfer</p><p style="color:white;font-weight:700;font-size:14px;margin-top:2px">${data.bankName}</p><p style="color:rgba(255,255,255,0.7);font-size:12px">${data.bankAccount}</p></div></div>
      <p style="font-size:10px;color:#94a3b8;text-align:center;margin-top:20px">Generated by Pavroll • ${new Date().toLocaleDateString()} • Computer-generated</p>
      </body></html>
    `)
    w.document.close()
    w.print()
  }

  return (
    <ESSLayout title="My Payslips">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            { label: 'Total Payslips', value: payslipMonths.length, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Latest Net Pay', value: fmt(payroll.netPay), color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'YTD Earnings', value: fmt(payroll.grossSalary * 6), color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '18px 20px' }}>
              <p style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Payslips list */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>All Payslips</h3>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Click view to preview or download</p>
          </div>

          {payslipMonths.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="#6366F1" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>{p.month} {p.year}</p>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '1px' }}>Net Pay: <span style={{ color: '#10B981', fontWeight: 600 }}>{fmt(payroll.netPay)}</span></p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#10B981', padding: '3px 10px', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <CheckCircle size={11} /> Ready
                </span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setViewing(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  <Eye size={13} /> View
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => printPayslip(p.month, p.year)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  <Download size={13} /> Download
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview modal */}
      {viewing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setViewing(null) }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', width: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#F8FAFC' }}>Payslip — {viewing.month} {viewing.year}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => printPayslip(viewing.month, viewing.year)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  <Download size={13} /> Download PDF
                </motion.button>
                <button onClick={() => setViewing(null)}
                  style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>

            {/* Payslip preview */}
            <div style={{ margin: '20px', padding: '28px 32px', background: '#fff', borderRadius: '16px', color: '#1a1a2e' }}>
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
                  <p style={{ fontSize: '12px', color: '#64748b' }}>{viewing.month} {viewing.year}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                {[{ label: 'Employee', value: employee.name }, { label: 'Position', value: data.position }, { label: 'Department', value: data.department }, { label: 'SSNIT No.', value: data.ssnitNumber }, { label: 'Bank', value: data.bankName }, { label: 'Account', value: data.bankAccount }].map(f => (
                  <div key={f.label}><p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{f.label}</p><p style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{f.value}</p></div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', marginBottom: '8px' }}>Earnings</p>
                  {[{ label: 'Basic Salary', value: fmt(payroll.basicSalary) }, { label: 'Gross Salary', value: fmt(payroll.grossSalary) }].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '12px', color: '#334155' }}>{r.label}</span><span style={{ fontSize: '12px', fontWeight: 600 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', marginBottom: '8px' }}>Deductions</p>
                  {[{ label: 'SSNIT (5.5%)', value: fmt(payroll.ssnitEmployee) }, { label: 'PAYE Tax', value: fmt(payroll.paye) }].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '12px', color: '#334155' }}>{r.label}</span><span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'linear-gradient(135deg,#6366F1,#818CF8)', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', textTransform: 'uppercase' }}>NET PAY — {viewing.month.toUpperCase()} {viewing.year}</p>
                  <p style={{ color: 'white', fontSize: '26px', fontWeight: 800, marginTop: '4px' }}>{fmt(payroll.netPay)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>Bank Transfer</p>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>{data.bankName}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{data.bankAccount}</p>
                </div>
              </div>
              <p style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', marginTop: '16px' }}>Generated by Pavroll • {new Date().toLocaleDateString()}</p>
            </div>
          </motion.div>
        </div>
      )}
    </ESSLayout>
  )
}
