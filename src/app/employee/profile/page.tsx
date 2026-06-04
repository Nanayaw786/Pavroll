'use client'
import ESSLayout from '@/components/ess/ESSLayout'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Save, User, CreditCard, FileText, Shield } from 'lucide-react'

const employeeData: Record<string, any> = {
  '1': { position: 'Senior Developer', department: 'Engineering', basicSalary: 5000, ssnitNumber: 'SSN-001234', bankName: 'GCB Bank', bankAccount: '1234567890', phone: '0244123456', ghanaCard: 'GHA-000123456-7', joinDate: '2023-01-15', employmentType: 'Full-time' },
  '2': { position: 'HR Manager', department: 'HR', basicSalary: 4200, ssnitNumber: 'SSN-001235', bankName: 'Ecobank', bankAccount: '0987654321', phone: '0244234567', ghanaCard: 'GHA-000234567-8', joinDate: '2022-06-01', employmentType: 'Full-time' },
  '3': { position: 'Accountant', department: 'Finance', basicSalary: 3800, ssnitNumber: 'SSN-001236', bankName: 'Absa Bank', bankAccount: '1122334455', phone: '0244345678', ghanaCard: 'GHA-000345678-9', joinDate: '2023-03-10', employmentType: 'Full-time' },
  '4': { position: 'Sales Lead', department: 'Sales', basicSalary: 3500, ssnitNumber: 'SSN-001237', bankName: 'Stanbic Bank', bankAccount: '5566778899', phone: '0244456789', ghanaCard: 'GHA-000456789-0', joinDate: '2022-11-20', employmentType: 'Full-time' },
}

const tabs = [
  { key: 'personal', label: 'Personal Info', icon: User },
  { key: 'bank', label: 'Bank Details', icon: CreditCard },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'security', label: 'Security', icon: Shield },
]

const documents = [
  { name: 'Employment Contract', date: '2023-01-15', status: 'Available' },
  { name: 'Offer Letter', date: '2022-12-20', status: 'Available' },
  { name: 'Ghana Card Copy', date: '2023-01-15', status: 'Available' },
  { name: 'Tax Certificate 2025', date: '2025-01-10', status: 'Available' },
]

function Field({ label, value, editable = false, onChange }: { label: string, value: string, editable?: boolean, onChange?: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{label}</label>
      {editable && onChange ? (
        <input value={value} onChange={e => onChange(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
      ) : (
        <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8', fontSize: '13px' }}>
          {value}
        </div>
      )}
    </div>
  )
}

export default function ESSProfile() {
  const [employee, setEmployee] = useState<{ id: string, name: string, email: string } | null>(null)
  const [tab, setTab] = useState('personal')
  const [saved, setSaved] = useState(false)
  const [phone, setPhone] = useState('')
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('ess_employee')
    if (stored) {
      const emp = JSON.parse(stored)
      setEmployee(emp)
      setPhone(employeeData[emp.id]?.phone || '')
    }
  }, [])

  if (!employee) return null
  const data = employeeData[employee.id]
  const initials = employee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <ESSLayout title="My Profile">
      <div className="ess-profile-layout" style={{ display: 'flex', gap: '24px', width: '100%' }}>

        {/* Left — Avatar + info */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Avatar */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 auto 12px' }}>
              {initials}
            </div>
            <p style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '14px' }}>{employee.name}</p>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{data.position}</p>
            <div style={{ marginTop: '10px', padding: '4px 10px', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'inline-block' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981' }}>● Active</span>
            </div>
          </div>

          {/* Quick info */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Department', value: data.department },
              { label: 'Join Date', value: new Date(data.joinDate).toLocaleDateString('en-GB') },
              { label: 'Employment', value: data.employmentType },
            ].map(item => (
              <div key={item.label}>
                <p style={{ fontSize: '10px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '9px', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
                  background: tab === t.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: tab === t.key ? '#818CF8' : '#64748B' }}>
                <t.icon size={14} />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right — Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px' }}>

            {/* Personal Info */}
            {tab === 'personal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>Personal Information</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Your personal details on record</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Full Name" value={employee.name} />
                  <Field label="Work Email" value={employee.email} />
                  <Field label="Phone Number" value={phone} editable onChange={setPhone} />
                  <Field label="Ghana Card Number" value={data.ghanaCard} />
                  <Field label="SSNIT Number" value={data.ssnitNumber} />
                  <Field label="Department" value={data.department} />
                  <Field label="Position" value={data.position} />
                  <Field label="Employment Type" value={data.employmentType} />
                </div>
              </div>
            )}

            {/* Bank Details */}
            {tab === 'bank' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>Bank Details</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Your salary payment information</p>
                </div>
                <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <p style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 500 }}>To update bank details, please contact your HR manager directly.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Bank Name" value={data.bankName} />
                  <Field label="Account Number" value={data.bankAccount} />
                  <Field label="Account Name" value={employee.name} />
                  <Field label="Payment Method" value="Bank Transfer" />
                </div>
                <div style={{ padding: '16px 18px', borderRadius: '12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Basic Salary</p>
                    <p style={{ fontSize: '22px', fontWeight: 800, color: '#6366F1', marginTop: '2px' }}>GHS {data.basicSalary.toLocaleString()}</p>
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569' }}>Paid monthly</p>
                </div>
              </div>
            )}

            {/* Documents */}
            {tab === 'documents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>My Documents</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Your employment documents and records</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {documents.map((doc, i) => (
                    <motion.div key={doc.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={16} color="#6366F1" />
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{doc.name}</p>
                          <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>Added {new Date(doc.date).toLocaleDateString('en-GB')}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', padding: '3px 10px', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          {doc.status}
                        </span>
                        <button style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                          Download
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {tab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>Security</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Update your portal password</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '380px' }}>
                  {[
                    { label: 'Current Password', value: currentPass, onChange: setCurrentPass },
                    { label: 'New Password', value: newPass, onChange: setNewPass },
                    { label: 'Confirm New Password', value: confirmPass, onChange: setConfirmPass },
                  ].map(f => (
                    <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{f.label}</label>
                      <input type="password" value={f.value} onChange={e => f.onChange(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save button */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px', background: saved ? '#10B981' : '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </ESSLayout>
  )
}

<style>{`
  @media (max-width: 768px) {
    .ess-profile-layout { flex-direction: column !important; }
  }
`}</style>