'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Settings, MessageSquare, CheckCircle, Clock, XCircle, Plus, Loader2, Building2, Bell, CreditCard } from 'lucide-react'

import { getSenderIdRequests, createSenderIdRequest, type SenderIdRequest } from '@/lib/senderIdDb'
import { getCompanyId } from '@/lib/employees'
import { supabase } from '@/lib/supabase'

const statusConfig = {
  pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: Clock, label: 'Pending Approval' },
  approved: { color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle, label: 'Approved' },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', icon: XCircle, label: 'Rejected' },
}

const plans = [
  { name: 'Starter', price: 'GHS 120', period: '/month', employees: 'Up to 10 employees', sms: '50 SMS/month', color: '#6366F1', current: true },
  { name: 'Growth', price: 'GHS 350', period: '/month', employees: 'Up to 50 employees', sms: '200 SMS/month', color: '#10B981', current: false },
  { name: 'Business', price: 'GHS 800', period: '/month', employees: 'Unlimited employees', sms: 'Unlimited SMS', color: '#F59E0B', current: false },
]

export default function SettingsPage() {
  const [companyId, setCompanyId] = useState('')
  const [company, setCompany] = useState<any>(null)
  const [requests, setRequests] = useState<SenderIdRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'general' | 'senderid' | 'billing' | 'notifications'>('general')
  const [form, setForm] = useState({ sender_id: '', purpose: '' })
  const [result, setResult] = useState<{ success: boolean, message: string } | null>(null)
  const [companyForm, setCompanyForm] = useState({ name: '', email: '', phone: '', address: '', tin: '', ssnit_employer_code: '' })
  const [payingPlan, setPayingPlan] = useState<string | null>(null)
  const [payrollSettings, setPayrollSettings] = useState({
    ssnit_employee_rate: 5.5,
    ssnit_employer_rate: 13.0,
    tier2_employer_rate: 5.0,
    use_custom_paye: false,
    custom_paye_rate: 0,
    overtime_rate: 1.5,
    currency: 'GHS',
  })
  const [savingPayroll, setSavingPayroll] = useState(false)

  const handleSavePayrollSettings = async () => {
    setSavingPayroll(true)
    try {
      await supabase.from('companies').update({ payroll_settings: payrollSettings }).eq('id', companyId)
      setResult({ success: true, message: 'Payroll settings saved! New rates apply on next payroll run.' })
      setTimeout(() => setResult(null), 4000)
    } catch (err) {
      setResult({ success: false, message: 'Failed to save payroll settings' })
    } finally {
      setSavingPayroll(false)
    }
  }

  const handlePaystack = (planKey: string, amount: number, planName: string) => {
    if (typeof window === 'undefined') return
    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_eaf1f4d99ab4aa521121a6b9760925cfb5eaa60d',
      email: company?.email || 'admin@company.com',
      amount: amount * 100,
      currency: 'GHS',
      metadata: { plan: planKey, company_name: companyForm.name, plan_name: planName },
      callback: (response: any) => {
        setResult({ success: true, message: `Payment successful! Reference: ${response.reference}` })
        setPayingPlan(null)
      },
      onClose: () => { setPayingPlan(null) }
    })
    handler.openIframe()
  }

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const cId = await getCompanyId()
      setCompanyId(cId)
      const { data: companyData } = await supabase.from('companies').select('*').eq('id', cId).single()
      if (companyData) {
        setCompany(companyData)
        setCompanyForm({
          name: companyData.name || '',
          email: companyData.email || '',
          phone: companyData.phone || '',
          address: companyData.address || '',
          tin: companyData.tin || '',
          ssnit_employer_code: companyData.ssnit_employer_code || '',
        })
        if (companyData.payroll_settings) {
          setPayrollSettings(prev => ({ ...prev, ...companyData.payroll_settings }))
        }
      }
      const reqs = await getSenderIdRequests(cId)
      setRequests(reqs)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCompany = async () => {
    setSaving(true)
    try {
      await supabase.from('companies').update(companyForm).eq('id', companyId)
      setResult({ success: true, message: 'Company details saved!' })
      setTimeout(() => setResult(null), 3000)
    } catch (err) {
      setResult({ success: false, message: 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const handleRequestSenderId = async () => {
    if (!form.sender_id || !form.purpose) return
    if (form.sender_id.length > 11) {
      setResult({ success: false, message: 'Sender ID must be 11 characters or less' })
      return
    }
    setSaving(true)
    try {
      const newRequest = await createSenderIdRequest({
        company_id: companyId,
        company_name: companyForm.name,
        sender_id: form.sender_id,
        purpose: form.purpose,
        status: 'pending',
        admin_note: '',
      })
      setRequests(prev => [newRequest, ...prev])
      setShowForm(false)
      setForm({ sender_id: '', purpose: '' })
      setResult({ success: true, message: 'Sender ID request submitted! You will be notified once approved.' })
      setTimeout(() => setResult(null), 5000)

      // Notify admin via email
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyForm.name,
          email: 'hello.pavroll@proton.me',
          company: companyForm.name,
          subject: `New Sender ID Request: ${form.sender_id}`,
          message: `Company: ${companyForm.name}\nSender ID: ${form.sender_id}\nPurpose: ${form.purpose}\n\nPlease register this Sender ID on JospigarBulkSMS and approve in the Pavroll admin panel.`,
        })
      })
    } catch (err) {
      setResult({ success: false, message: 'Failed to submit request' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Settings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Tabs */}
        <div className="settings-tabs" style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', width: 'fit-content', flexWrap: 'wrap' }}>
          {([
            { key: 'general', label: 'Company', icon: Building2 },
            { key: 'payroll', label: 'Payroll Rates', icon: CreditCard },
            { key: 'senderid', label: 'SMS Sender ID', icon: MessageSquare },
            { key: 'billing', label: 'Billing', icon: Settings },
            { key: 'notifications', label: 'Notifications', icon: Bell },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: tab === t.key ? '#6366F1' : 'transparent',
                color: tab === t.key ? '#fff' : '#64748B' }}>
              <t.icon size={14} /> {t.label}
            </button>
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

        {/* General / Company Tab */}
        {tab === 'general' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', maxWidth: '640px' }}>
            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px', marginBottom: '20px' }}>Company Details</h3>
            <div className="settings-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { label: 'Company Name', key: 'name', placeholder: 'Acme Ghana Ltd' },
                { label: 'Email', key: 'email', placeholder: 'hr@company.com' },
                { label: 'Phone', key: 'phone', placeholder: '0302123456' },
                { label: 'TIN Number', key: 'tin', placeholder: 'C0012345678' },
                { label: 'SSNIT Employer Code', key: 'ssnit_employer_code', placeholder: 'ORG-00123' },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{field.label}</label>
                  <input value={(companyForm as any)[field.key]} onChange={e => setCompanyForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Address</label>
                <input value={companyForm.address} onChange={e => setCompanyForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="15 Independence Ave, Accra"
                  style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveCompany} disabled={saving}
              style={{ marginTop: '20px', padding: '10px 24px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        )}

        {/* SMS Sender ID Tab */}
        {tab === 'senderid' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>

            {/* Info card */}
            <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <MessageSquare size={18} color="#6366F1" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC' }}>Custom SMS Sender ID</h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '8px' }}>
                Send SMS to your employees with your company name as the sender. Instead of a generic number, employees will see <strong style={{ color: '#94A3B8' }}>"{companyForm.name || 'YourCompany'}"</strong> when they receive payslip and leave notifications.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {['Max 11 characters (no spaces)', 'One-time registration: GHS 50', 'Approval takes 24-48 hours', 'Used for all Pavroll SMS notifications'].map(tip => (
                  <p key={tip} style={{ fontSize: '12px', color: '#475569' }}>• {tip}</p>
                ))}
              </div>
            </div>

            {/* Request button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '14px' }}>Your Sender ID Requests</h3>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <Plus size={14} /> Request Sender ID
              </motion.button>
            </div>

            {/* Request form */}
            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '16px' }}>New Sender ID Request</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Sender ID (max 11 characters, no spaces)</label>
                      <input value={form.sender_id} onChange={e => setForm(p => ({ ...p, sender_id: e.target.value.replace(/\s/g, '').slice(0, 11) }))}
                        placeholder="e.g. AcmeGhana"
                        style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                      <p style={{ fontSize: '11px', color: form.sender_id.length > 11 ? '#EF4444' : '#475569' }}>{form.sender_id.length}/11 characters</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Purpose</label>
                      <input value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
                        placeholder="e.g. Employee payslip and HR notifications"
                        style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setShowForm(false)}
                        style={{ padding: '9px 18px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                        Cancel
                      </button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRequestSenderId} disabled={saving}
                        style={{ padding: '9px 20px', borderRadius: '9px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                        {saving ? 'Submitting...' : 'Submit Request'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Requests list */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <Loader2 size={20} color="#6366F1" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
              ) : requests.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <MessageSquare size={32} color="#475569" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#475569', fontSize: '14px' }}>No Sender ID requests yet</p>
                  <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>Request a custom Sender ID to brand your SMS notifications</p>
                </div>
              ) : (
                requests.map((req, i) => {
                  const sc = statusConfig[req.status]
                  const StatusIcon = sc.icon
                  return (
                    <motion.div key={req.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <p style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace' }}>{req.sender_id}</p>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            <StatusIcon size={11} /> {sc.label}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#475569' }}>{req.purpose}</p>
                        {req.admin_note && (
                          <p style={{ fontSize: '12px', color: req.status === 'rejected' ? '#EF4444' : '#10B981', marginTop: '4px' }}>Note: {req.admin_note}</p>
                        )}
                        <p style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>Requested {new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                      {req.status === 'approved' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          <CheckCircle size={14} color="#10B981" />
                          <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>Active</span>
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Payroll Rates Tab */}
        {tab === 'payroll' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>

            {/* Info banner */}
            <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#818CF8', marginBottom: '4px' }}>⚙️ Custom Payroll Rates</p>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6 }}>
                By default Pavroll uses Ghana GRA 2026 standard rates. You can customize SSNIT and PAYE rates here if your company has negotiated different rates or special exemptions.
              </p>
            </div>

            {/* SSNIT Rates */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>SSNIT Contribution Rates</h3>
              <p style={{ fontSize: '12px', color: '#475569', marginBottom: '20px' }}>Standard: Employee 5.5% | Employer 13% | Tier 2 5%</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Employee Rate (%)', key: 'ssnit_employee_rate', desc: 'Deducted from employee salary', standard: '5.5%' },
                  { label: 'Employer Rate (%)', key: 'ssnit_employer_rate', desc: 'Paid by company on top', standard: '13%' },
                  { label: 'Tier 2 Rate (%)', key: 'tier2_employer_rate', desc: 'Occupational pension', standard: '5%' },
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{field.label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={(payrollSettings as any)[field.key]}
                      onChange={e => setPayrollSettings(p => ({ ...p, [field.key]: parseFloat(e.target.value) || 0 }))}
                      style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}
                    />
                    <p style={{ fontSize: '11px', color: '#475569' }}>Standard: {field.standard}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PAYE Settings */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>PAYE Settings</h3>
              <p style={{ fontSize: '12px', color: '#475569', marginBottom: '20px' }}>Standard: GRA 2026 progressive bands (0% - 35%)</p>

              {/* Toggle custom PAYE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>Use Custom Flat PAYE Rate</p>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Override GRA progressive bands with a single flat rate</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }}
                  onClick={() => setPayrollSettings(p => ({ ...p, use_custom_paye: !p.use_custom_paye }))}
                  style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', background: payrollSettings.use_custom_paye ? '#6366F1' : 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: '2px', left: payrollSettings.use_custom_paye ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </motion.button>
              </div>

              {payrollSettings.use_custom_paye && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Custom PAYE Rate (%)</label>
                  <input
                    type="number" min="0" max="50" step="0.5"
                    value={payrollSettings.custom_paye_rate}
                    onChange={e => setPayrollSettings(p => ({ ...p, custom_paye_rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="e.g. 10"
                    style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.3)', color: '#F8FAFC', fontSize: '13px', outline: 'none', maxWidth: '200px' }}
                  />
                  <p style={{ fontSize: '11px', color: '#F59E0B' }}>⚠️ Only use this if your company has a special tax arrangement with GRA</p>
                </motion.div>
              )}

              {!payrollSettings.use_custom_paye && (
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <p style={{ fontSize: '12px', color: '#10B981', fontWeight: 600, marginBottom: '8px' }}>✅ Using GRA 2026 Standard Bands</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                      'First GHS 5,880/year → 0%',
                      'Next GHS 1,320/year → 5%',
                      'Next GHS 1,560/year → 10%',
                      'Next GHS 38,000/year → 17.5%',
                      'Next GHS 192,000/year → 25%',
                      'Next GHS 366,240/year → 30%',
                      'Above GHS 605,000/year → 35%',
                    ].map(band => (
                      <p key={band} style={{ fontSize: '11px', color: '#475569' }}>• {band}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Overtime Rate */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>Overtime Rate</h3>
              <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>Multiplier applied to basic hourly rate for overtime hours</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number" min="1" max="3" step="0.5"
                  value={payrollSettings.overtime_rate}
                  onChange={e => setPayrollSettings(p => ({ ...p, overtime_rate: parseFloat(e.target.value) || 1.5 }))}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', width: '120px' }}
                />
                <span style={{ fontSize: '13px', color: '#475569' }}>× basic hourly rate (Standard: 1.5x)</span>
              </div>
            </div>

            {/* Save button */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSavePayrollSettings} disabled={savingPayroll}
              style={{ padding: '12px 24px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: savingPayroll ? 0.7 : 1, width: 'fit-content' }}>
              {savingPayroll ? 'Saving...' : '💾 Save Payroll Settings'}
            </motion.button>
          </div>
        )}

        {/* Billing Tab */}
        {tab === 'billing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={18} color="#10B981" />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>Starter Plan — Active</p>
                <p style={{ fontSize: '12px', color: '#475569' }}>GHS 120/month • Renews July 6, 2026</p>
              </div>
            </div>

            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px' }}>Available Plans</h3>
            <div className="settings-plans" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {plans.map((plan, i) => (
                <motion.div key={plan.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  style={{ padding: '24px', borderRadius: '16px', background: plan.current ? `${plan.color}10` : 'rgba(255,255,255,0.02)', border: `1px solid ${plan.current ? plan.color + '30' : 'rgba(255,255,255,0.06)'}`, position: 'relative' }}>
                  {plan.current && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: plan.color + '20', color: plan.color }}>CURRENT</span>
                  )}
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: plan.color, marginBottom: '4px' }}>{plan.name}</h3>
                  <p style={{ fontSize: '26px', fontWeight: 800, color: '#F8FAFC', marginBottom: '12px' }}>{plan.price}<span style={{ fontSize: '13px', color: '#475569', fontWeight: 400 }}>{plan.period}</span></p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    {[plan.employees, plan.sms, 'All features included', 'Priority support'].map(feature => (
                      <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={12} color={plan.color} />
                        <span style={{ fontSize: '12px', color: '#94A3B8' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: plan.current ? 1 : 1.02 }} whileTap={{ scale: plan.current ? 1 : 0.98 }}
                    onClick={() => {
                      if (plan.current) return
                      const amounts: Record<string, number> = { starter: 120, growth: 350, business: 800 }
                      const planKey = plan.name.toLowerCase()
                      setPayingPlan(planKey)
                      handlePaystack(planKey, amounts[planKey], plan.name)
                    }}
                    style={{ width: '100%', padding: '9px', borderRadius: '9px', background: plan.current ? 'rgba(255,255,255,0.05)' : plan.color, border: plan.current ? '1px solid rgba(255,255,255,0.08)' : 'none', color: plan.current ? '#475569' : '#fff', fontSize: '13px', fontWeight: 600, cursor: plan.current ? 'default' : 'pointer', opacity: payingPlan === plan.name.toLowerCase() ? 0.7 : 1 }}>
                    {payingPlan === plan.name.toLowerCase() ? 'Opening...' : plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <div style={{ maxWidth: '560px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '15px', marginBottom: '20px' }}>Notification Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Payroll processed', desc: 'Get notified when monthly payroll is run', enabled: true },
                { label: 'SSNIT deadline reminder', desc: '3 days before SSNIT filing deadline', enabled: true },
                { label: 'PAYE deadline reminder', desc: '3 days before PAYE filing deadline', enabled: true },
                { label: 'Leave request submitted', desc: 'When an employee submits a leave request', enabled: true },
                { label: 'New employee added', desc: 'When a new employee is onboarded', enabled: false },
                { label: 'SMS delivery report', desc: 'After bulk SMS is sent', enabled: true },
              ].map((item, i) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{item.label}</p>
                    <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{item.desc}</p>
                  </div>
                  <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: item.enabled ? '#6366F1' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: '3px', left: item.enabled ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      </div>
    </DashboardLayout>
  )
}
