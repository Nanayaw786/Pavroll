'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { Upload, Download, CheckCircle, XCircle, AlertTriangle, Users, ArrowRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'

type ImportedEmployee = {
  name: string
  email: string
  phone: string
  department: string
  position: string
  basicSalary: number
  ssnitNumber: string
  bankName: string
  bankAccount: string
  valid: boolean
  errors: string[]
}

const requiredFields = ['name', 'email', 'department', 'position', 'basicSalary', 'ssnitNumber', 'bankName', 'bankAccount']
const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function validateEmployee(emp: any): ImportedEmployee {
  const errors: string[] = []
  if (!emp.name) errors.push('Name required')
  if (!emp.email || !emp.email.includes('@')) errors.push('Valid email required')
  if (!emp.department) errors.push('Department required')
  if (!emp.position) errors.push('Position required')
  if (!emp.basicSalary || isNaN(Number(emp.basicSalary))) errors.push('Valid salary required')
  if (!emp.ssnitNumber) errors.push('SSNIT number required')
  if (!emp.bankName) errors.push('Bank name required')
  if (!emp.bankAccount) errors.push('Bank account required')
  return {
    name: emp.name || '',
    email: emp.email || '',
    phone: emp.phone || '',
    department: emp.department || '',
    position: emp.position || '',
    basicSalary: Number(emp.basicSalary) || 0,
    ssnitNumber: emp.ssnitNumber || '',
    bankName: emp.bankName || '',
    bankAccount: emp.bankAccount || '',
    valid: errors.length === 0,
    errors,
  }
}

function parseCSV(text: string): ImportedEmployee[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''))
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const obj: any = {}
    headers.forEach((h, i) => { obj[h] = values[i] || '' })
    // normalize common header variations
    if (obj['fullname']) obj['name'] = obj['fullname']
    if (obj['basicsalary']) obj['basicSalary'] = obj['basicsalary']
    if (obj['ssnit'] || obj['ssnitnumber']) obj['ssnitNumber'] = obj['ssnit'] || obj['ssnitnumber']
    if (obj['bank'] || obj['bankname']) obj['bankName'] = obj['bank'] || obj['bankname']
    if (obj['account'] || obj['bankaccount']) obj['bankAccount'] = obj['account'] || obj['bankaccount']
    return validateEmployee(obj)
  }).filter(e => e.name)
}

const sampleCSV = `name,email,phone,department,position,basicSalary,ssnitNumber,bankName,bankAccount
Kofi Boateng,kofi.boateng@company.com,0244111222,Engineering,Software Engineer,4500,SSN-002001,GCB Bank,1234567891
Abena Mensah,abena.mensah@company.com,0244333444,HR,HR Assistant,3200,SSN-002002,Ecobank,0987654322
Yaw Asante,yaw.asante@company.com,0244555666,Finance,Finance Analyst,3800,SSN-002003,Absa Bank,1122334456
Akua Darko,akua.darko@company.com,0244777888,Sales,Sales Executive,3000,SSN-002004,Stanbic Bank,5566778890
Kwesi Amponsah,kwesi@company.com,0244999000,Engineering,DevOps Engineer,5500,SSN-002005,Fidelity Bank,9900112233`

export default function ImportPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [employees, setEmployees] = useState<ImportedEmployee[]>([])
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      setEmployees(parsed)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) handleFile(file)
  }

  const handleImport = () => {
    const valid = employees.filter(e => e.valid)
    setImporting(true)
    setTimeout(() => {
      setImportedCount(valid.length)
      setImporting(false)
      setStep('done')
    }, 1800)
  }

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pavroll_employee_import_template.csv'
    a.click()
  }

  const valid = employees.filter(e => e.valid)
  const invalid = employees.filter(e => !e.valid)

  return (
    <DashboardLayout title="Bulk Import Employees">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '900px' }}>

        {/* Progress steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          {[
            { key: 'upload', label: '1. Upload CSV' },
            { key: 'preview', label: '2. Preview & Validate' },
            { key: 'done', label: '3. Import Complete' },
          ].map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px',
                background: step === s.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: `1px solid ${step === s.key ? 'rgba(99,102,241,0.3)' : 'transparent'}` }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700,
                  background: step === s.key ? '#6366F1' : 'rgba(255,255,255,0.06)',
                  color: step === s.key ? '#fff' : '#475569' }}>{i + 1}</div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: step === s.key ? '#818CF8' : '#475569' }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.08)' }} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Download template */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderRadius: '12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>Download the CSV template</p>
                    <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Fill in your employees and upload below</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={downloadSample}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    <Download size={14} /> Download Template
                  </motion.button>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${dragging ? '#6366F1' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', padding: '60px 40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    background: dragging ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)' }}>
                  <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
                  <motion.div animate={{ y: dragging ? -4 : 0 }} transition={{ duration: 0.2 }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Upload size={24} color="#6366F1" />
                    </div>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>
                      {dragging ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
                    </p>
                    <p style={{ fontSize: '13px', color: '#475569' }}>or <span style={{ color: '#6366F1', fontWeight: 500 }}>click to browse</span></p>
                    <p style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>Supports .csv files only</p>
                  </motion.div>
                </div>

                {/* CSV format guide */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px 18px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '10px' }}>Required CSV columns:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['name', 'email', 'phone', 'department', 'position', 'basicSalary', 'ssnitNumber', 'bankName', 'bankAccount'].map(col => (
                      <span key={col} style={{ padding: '3px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818CF8', fontSize: '11px', fontFamily: 'monospace' }}>{col}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Total Rows', value: employees.length, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
                  { label: 'Valid', value: valid.length, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
                  { label: 'Errors', value: invalid.length, color: invalid.length > 0 ? '#EF4444' : '#475569', bg: invalid.length > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.02)' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '12px', padding: '16px 20px' }}>
                    <p style={{ fontSize: '26px', fontWeight: 700, color: s.color }}>{s.value}</p>
                    <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Error warning */}
              {invalid.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ fontSize: '12px', color: '#F59E0B' }}>{invalid.length} row{invalid.length > 1 ? 's' : ''} have errors and will be skipped. Fix the CSV and re-upload to include them.</p>
                </div>
              )}

              {/* Table */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  {['Employee', 'Email', 'Department', 'Salary', 'SSNIT', 'Status'].map(h => (
                    <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                  ))}
                </div>
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {employees.map((emp, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
                        background: emp.valid ? 'transparent' : 'rgba(239,68,68,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: emp.valid ? avatarColors[i % avatarColors.length] : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {emp.name ? getInitials(emp.name) : '?'}
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: emp.valid ? '#F8FAFC' : '#94A3B8' }}>{emp.name || '—'}</p>
                          {!emp.valid && emp.errors.length > 0 && (
                            <p style={{ fontSize: '10px', color: '#EF4444', marginTop: '1px' }}>{emp.errors[0]}</p>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.email || '—'}</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{emp.department || '—'}</span>
                      <span style={{ fontSize: '12px', color: emp.valid ? '#F8FAFC' : '#94A3B8', fontWeight: 500 }}>{emp.basicSalary ? `GHS ${emp.basicSalary.toLocaleString()}` : '—'}</span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>{emp.ssnitNumber || '—'}</span>
                      <div>
                        {emp.valid
                          ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#10B981' }}><CheckCircle size={12} /> Valid</span>
                          : <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#EF4444' }}><XCircle size={12} /> Error</span>
                        }
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => { setStep('upload'); setEmployees([]) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                  <RotateCcw size={14} /> Re-upload
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleImport} disabled={valid.length === 0 || importing}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px', background: valid.length > 0 ? '#6366F1' : 'rgba(255,255,255,0.05)', border: 'none', color: valid.length > 0 ? '#fff' : '#475569', fontSize: '13px', fontWeight: 600, cursor: valid.length > 0 ? 'pointer' : 'not-allowed', opacity: importing ? 0.7 : 1 }}>
                  {importing
                    ? <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Importing...</>
                    : <><Users size={15} /> Import {valid.length} Employee{valid.length !== 1 ? 's' : ''} <ArrowRight size={14} /></>
                  }
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Done */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '60px 40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color="#10B981" />
              </motion.div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F8FAFC', marginBottom: '8px' }}>Import Successful!</h2>
              <p style={{ fontSize: '15px', color: '#475569', marginBottom: '6px' }}><span style={{ color: '#10B981', fontWeight: 700 }}>{importedCount} employees</span> have been added to Pavroll.</p>
              {invalid.length > 0 && <p style={{ fontSize: '13px', color: '#F59E0B', marginBottom: '24px' }}>{invalid.length} rows were skipped due to errors.</p>}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '28px' }}>
                <button onClick={() => { setStep('upload'); setEmployees([]) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                  <Upload size={14} /> Import More
                </button>
                <Link href="/employees">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px', background: '#6366F1', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
                    <Users size={15} /> View Employees <ArrowRight size={14} />
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  )
}
