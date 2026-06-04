'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Building2, User, Bell, Shield, CreditCard, Save } from 'lucide-react'

const tabs = [
  { key: 'company', label: 'Company', icon: Building2 },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'billing', label: 'Billing', icon: CreditCard },
]

function Field({ label, value, type = 'text', onChange }: { label: string, value: string, type?: string, onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
    </div>
  )
}

function Toggle({ label, desc, value, onChange }: { label: string, desc: string, value: boolean, onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#F8FAFC' }}>{label}</p>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{desc}</p>
      </div>
      <div onClick={() => onChange(!value)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: value ? '#6366F1' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: '3px', left: value ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState('company')
  const [saved, setSaved] = useState(false)

  const [company, setCompany] = useState({ name: 'Acme Ghana Ltd', email: 'hr@acme.com.gh', phone: '0302123456', address: '15 Independence Ave, Accra', tin: 'C0012345678', ssnit: 'ORG-00123' })
  const [profile, setProfile] = useState({ name: 'Admin User', email: 'admin@acme.com.gh', role: 'HR Manager', phone: '0244123456' })
  const [notifs, setNotifs] = useState({ payrollReminder: true, leaveRequests: true, payslipSent: false, monthlyReport: true })
  const [security, setSecurity] = useState({ current: '', newPass: '', confirm: '' })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const plans = [
    { name: 'Starter', price: 'GHS 120', period: '/mo', employees: 'Up to 10 employees', features: ['Payroll processing', 'PDF payslips', 'Leave management'], current: true, color: '#6366F1' },
    { name: 'Growth', price: 'GHS 350', period: '/mo', employees: 'Up to 50 employees', features: ['Everything in Starter', 'SSNIT export', 'Email payslips', 'Reports & analytics'], current: false, color: '#10B981' },
    { name: 'Business', price: 'GHS 800', period: '/mo', employees: 'Unlimited employees', features: ['Everything in Growth', 'Multi-company', 'Priority support', 'Custom branding'], current: false, color: '#F59E0B' },
  ]

  return (
    <DashboardLayout title="Settings">
      <div className="settings-layout" style={{ display: 'flex', gap: '24px', width: '100%' }}>

        {/* Sidebar */}
        <div className="settings-nav" style={{ width: '200px', flexShrink: 0 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', border: 'none', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%',
                  background: tab === t.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: tab === t.key ? '#818CF8' : '#64748B' }}>
                <t.icon size={15} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="settings-content" style={{ flex: 1, minWidth: 0 }}>
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px' }}>

            {/* Company Tab */}
            {tab === 'company' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>Company Information</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Your company details used on payslips and reports</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Company Name" value={company.name} onChange={v => setCompany(p => ({ ...p, name: v }))} />
                  <Field label="Company Email" value={company.email} onChange={v => setCompany(p => ({ ...p, email: v }))} />
                  <Field label="Phone Number" value={company.phone} onChange={v => setCompany(p => ({ ...p, phone: v }))} />
                  <Field label="TIN Number" value={company.tin} onChange={v => setCompany(p => ({ ...p, tin: v }))} />
                  <Field label="SSNIT Employer Code" value={company.ssnit} onChange={v => setCompany(p => ({ ...p, ssnit: v }))} />
                  <Field label="Address" value={company.address} onChange={v => setCompany(p => ({ ...p, address: v }))} />
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {tab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>Your Profile</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Manage your personal account details</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(99,102,241,0.06)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff' }}>A</div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>{profile.name}</p>
                    <p style={{ fontSize: '12px', color: '#475569' }}>{profile.role}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Full Name" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
                  <Field label="Email" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} />
                  <Field label="Role" value={profile.role} onChange={v => setProfile(p => ({ ...p, role: v }))} />
                  <Field label="Phone" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} />
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {tab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>Notifications</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Choose what alerts you receive</p>
                </div>
                <div>
                  <Toggle label="Payroll Reminder" desc="Get reminded 3 days before payroll is due" value={notifs.payrollReminder} onChange={v => setNotifs(p => ({ ...p, payrollReminder: v }))} />
                  <Toggle label="Leave Requests" desc="Notify when an employee submits a leave request" value={notifs.leaveRequests} onChange={v => setNotifs(p => ({ ...p, leaveRequests: v }))} />
                  <Toggle label="Payslip Sent Confirmation" desc="Confirm when payslips have been emailed" value={notifs.payslipSent} onChange={v => setNotifs(p => ({ ...p, payslipSent: v }))} />
                  <Toggle label="Monthly Reports" desc="Receive monthly payroll summary reports" value={notifs.monthlyReport} onChange={v => setNotifs(p => ({ ...p, monthlyReport: v }))} />
                </div>
              </div>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>Security</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Update your password</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '400px' }}>
                  <Field label="Current Password" value={security.current} type="password" onChange={v => setSecurity(p => ({ ...p, current: v }))} />
                  <Field label="New Password" value={security.newPass} type="password" onChange={v => setSecurity(p => ({ ...p, newPass: v }))} />
                  <Field label="Confirm New Password" value={security.confirm} type="password" onChange={v => setSecurity(p => ({ ...p, confirm: v }))} />
                </div>
                <div style={{ padding: '14px 16px', background: 'rgba(99,102,241,0.06)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p style={{ fontSize: '12px', color: '#818CF8', fontWeight: 500 }}>Password requirements</p>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Minimum 8 characters, at least one number and one special character</p>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {tab === 'billing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>Billing & Plans</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Manage your subscription</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {plans.map(plan => (
                    <div key={plan.name} style={{ borderRadius: '14px', padding: '20px', border: `1px solid ${plan.current ? plan.color + '40' : 'rgba(255,255,255,0.06)'}`, background: plan.current ? `${plan.color}08` : 'rgba(255,255,255,0.02)', position: 'relative' }}>
                      {plan.current && (
                        <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: plan.color + '20', color: plan.color, border: `1px solid ${plan.color}30` }}>CURRENT</span>
                      )}
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC' }}>{plan.name}</p>
                      <p style={{ fontSize: '26px', fontWeight: 800, color: plan.color, marginTop: '8px' }}>{plan.price}<span style={{ fontSize: '13px', fontWeight: 400, color: '#475569' }}>{plan.period}</span></p>
                      <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', marginBottom: '16px' }}>{plan.employees}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                        {plan.features.map(f => (
                          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: plan.color, flexShrink: 0 }} />
                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>{f}</span>
                          </div>
                        ))}
                      </div>
                      {!plan.current && (
                        <button style={{ width: '100%', padding: '9px', borderRadius: '9px', background: plan.color + '15', border: `1px solid ${plan.color}30`, color: plan.color, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                          Upgrade
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save button */}
            {tab !== 'billing' && (
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px', background: saved ? '#10B981' : '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                  <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}

<style>{`
  @media (max-width: 768px) {
    .settings-layout { flex-direction: column !important; }
    .settings-nav { width: 100% !important; }
    .settings-nav > div { flex-direction: row !important; flex-wrap: wrap !important; gap: 4px !important; }
    .billing-plans { grid-template-columns: 1fr !important; }
  }
`}</style>