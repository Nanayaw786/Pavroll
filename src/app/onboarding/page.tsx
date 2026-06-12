'use client'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Mail, Phone, MapPin, FileText, Megaphone, Gift, Briefcase, ChevronRight, ChevronLeft, Check, Zap, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { createCompanyForUser, getCompanyId } from '@/lib/employees'

const BUSINESS_TYPES = [
  { value: 'general', label: '🏢 General Business', desc: 'Retail, trading, services' },
  { value: 'school', label: '🏫 School / Education', desc: 'Nursery, primary, secondary, university' },
  { value: 'clinic', label: '🏥 Clinic / Hospital', desc: 'Medical, dental, pharmacy' },
  { value: 'ngo', label: '🌍 NGO / Non-Profit', desc: 'Charity, foundation, association' },
  { value: 'construction', label: '🏗️ Construction', desc: 'Building, engineering, real estate' },
  { value: 'hospitality', label: '🍽️ Hospitality', desc: 'Restaurant, hotel, catering' },
  { value: 'manufacturing', label: '🏭 Manufacturing', desc: 'Factory, production, processing' },
  { value: 'other', label: '💡 Other', desc: 'Any other business type' },
]

const LEAD_SOURCES = [
  { value: 'tiktok', label: '🎵 TikTok' },
  { value: 'whatsapp', label: '📱 WhatsApp' },
  { value: 'facebook', label: '👥 Facebook' },
  { value: 'instagram', label: '📸 Instagram' },
  { value: 'linkedin', label: '💼 LinkedIn' },
  { value: 'google', label: '🔍 Google Search' },
  { value: 'referral', label: '🤝 Friend / Colleague' },
  { value: 'partner', label: '🏢 Business Agent' },
  { value: 'accountant', label: '📊 Accountant' },
  { value: 'other', label: '💡 Other' },
]

const STEPS = [
  { id: 1, title: 'Company Name', icon: Building2, desc: 'What is your business called?' },
  { id: 2, title: 'Contact Info', icon: Mail, desc: 'How can we reach you?' },
  { id: 3, title: 'Business Type', icon: Briefcase, desc: 'What type of business do you run?' },
  { id: 4, title: 'How did you find us?', icon: Megaphone, desc: 'Help us understand how you found Pavroll' },
  { id: 5, title: 'Referral Code', icon: Gift, desc: 'Do you have a referral code?' },
]

function FloatingNumber({ n, x, y, delay }: { n: string, x: number, y: number, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 0.3, 0], y: -80 }}
      transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: Math.random() * 3 }}
      style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, fontSize: '13px', fontWeight: 700, color: '#6366F1', fontFamily: 'monospace', pointerEvents: 'none' }}>
      {n}
    </motion.div>
  )
}

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    tin: '',
    address: '',
    business_type: '',
    lead_source: '',
    lead_source_detail: '',
    referral_code: '',
  })

  const mathNumbers = [
    'PAYE', 'SSNIT', '5.5%', '13%', 'GHS', 'Tier2',
    '17.5%', 'GRA', '30d', 'NET', 'TAX', '2026',
    'HR', 'SME', 'GHS 120', 'AUTO',
  ]

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.firstName ? `${user.firstName}'s Company` : '',
      }))
    }
  }, [user])

  // Check if already onboarded
  useEffect(() => {
    const check = async () => {
      if (!user) return
      const cId = await getCompanyId(user.id)
      if (cId) {
        const { data } = await supabase.from('companies').select('name').eq('id', cId).single()
        if (data?.name && !data.name.includes("'s Company") && !data.name.includes('My Company')) {
          sessionStorage.setItem('onboarding_checked', 'true')
      router.push('/dashboard')
        }
      }
    }
    check()
  }, [user])

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setError('')
  }

  const validateStep = () => {
    if (step === 1 && !form.name.trim()) { setError('Please enter your company name'); return false }
    if (step === 2 && !form.email.trim()) { setError('Please enter your email'); return false }
    if (step === 3 && !form.business_type) { setError('Please select your business type'); return false }
    if (step === 4 && !form.lead_source) { setError('Please tell us how you found Pavroll'); return false }
    return true
  }

  const next = () => {
    if (!validateStep()) return
    if (step < STEPS.length) setStep(step + 1)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    if (!user) return
    setSaving(true)
    setError('')
    try {
      const userEmail = form.email || user.primaryEmailAddress?.emailAddress || ''
      const userName = form.name || user.fullName || `${user.firstName || 'My'} Company`

      // Get or create company
      let cId = await getCompanyId(user.id)
      if (!cId) {
        cId = await createCompanyForUser(user.id, userEmail, userName)
      }

      if (!cId) {
        setError('Could not create your account. Please try again.')
        setSaving(false)
        return
      }

      // Update company with onboarding info
      const updates: any = {
        name: userName,
        email: userEmail,
      }
      if (form.phone) updates.phone = form.phone
      if (form.tin) updates.tin = form.tin
      if (form.address) updates.address = form.address
      if (form.business_type) updates.business_type = form.business_type
      if (form.lead_source) updates.lead_source = form.lead_source
      if (form.lead_source_detail) updates.lead_source_detail = form.lead_source_detail

      await supabase.from('companies').update(updates).eq('id', cId)

      // Apply referral code if provided
      if (form.referral_code.trim()) {
        try {
          const { data: partner } = await supabase
            .from('referral_partners')
            .select('id, commission_rate, total_referrals')
            .eq('code', form.referral_code.toUpperCase())
            .eq('is_active', true)
            .maybeSingle()

          if (partner) {
            await supabase.from('companies').update({
              referral_code: form.referral_code.toUpperCase(),
              partner_id: partner.id,
            }).eq('id', cId)

            await supabase.from('referrals').insert({
              partner_id: partner.id,
              company_id: cId,
              company_name: userName,
              plan: 'trial',
              monthly_fee: 0,
              commission: 0,
              status: 'trial',
            })

            await supabase.from('referral_partners').update({
              total_referrals: (partner.total_referrals || 0) + 1,
            }).eq('id', partner.id)
          }
        } catch (refErr) {
          console.error('Referral error:', refErr)
          // Don't block onboarding for referral errors
        }
      }

      sessionStorage.setItem('onboarding_checked', 'true')
      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100
  const currentStep = STEPS[step - 1]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* Animated math background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {mathNumbers.map((n, i) => (
          <FloatingNumber key={i} n={n} x={Math.random() * 90 + 5} y={Math.random() * 90 + 5} delay={i * 0.4} />
        ))}
        {/* Animated gradient orbs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 4, repeat: Infinity }}
          style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: '#6366F1', filter: 'blur(100px)' }} />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.02, 0.05, 0.02] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: '#10B981', filter: 'blur(100px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC' }}>Pav<span style={{ color: '#6366F1' }}>roll</span></span>
        </motion.div>

        {/* Progress bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#475569' }}>Step {step} of {STEPS.length}</span>
            <span style={{ fontSize: '12px', color: '#6366F1', fontWeight: 600 }}>{Math.round(progress)}% complete</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
              style={{ height: '100%', background: 'linear-gradient(to right, #6366F1, #818CF8)', borderRadius: '2px' }} />
          </div>
          {/* Step dots */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
            {STEPS.map(s => (
              <motion.div key={s.id} animate={{ scale: step === s.id ? 1.2 : 1 }}
                style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700,
                  background: step > s.id ? '#6366F1' : step === s.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${step >= s.id ? '#6366F1' : 'rgba(255,255,255,0.08)'}`,
                  color: step > s.id ? '#fff' : step === s.id ? '#6366F1' : '#475569' }}>
                {step > s.id ? <Check size={12} /> : s.id}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px' }}>

            {/* Step header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <currentStep.icon size={20} color="#6366F1" />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC' }}>{currentStep.title}</h2>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>{currentStep.desc}</p>
              </div>
            </div>

            {/* Step 1 — Company Name */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>Company / Business Name *</label>
                  <input value={form.name} onChange={e => updateForm('name', e.target.value)}
                    placeholder="e.g. Mensah Trading Ltd"
                    autoFocus
                    style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '15px', outline: 'none', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#6366F1'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>TIN Number (Optional)</label>
                  <input value={form.tin} onChange={e => updateForm('tin', e.target.value)}
                    placeholder="e.g. C0012345678"
                    style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '15px', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#6366F1'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>Business Address (Optional)</label>
                  <input value={form.address} onChange={e => updateForm('address', e.target.value)}
                    placeholder="e.g. Accra, Greater Accra"
                    style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '15px', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#6366F1'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
              </div>
            )}

            {/* Step 2 — Contact Info */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>Work Email *</label>
                  <input value={form.email} onChange={e => updateForm('email', e.target.value)}
                    placeholder="your@company.com" type="email" autoFocus
                    style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '15px', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#6366F1'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>Phone Number *</label>
                  <input value={form.phone} onChange={e => updateForm('phone', e.target.value)}
                    placeholder="e.g. 0244123456" type="tel"
                    style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '15px', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#6366F1'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
              </div>
            )}

            {/* Step 3 — Business Type */}
            {step === 3 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {BUSINESS_TYPES.map(type => (
                  <motion.button key={type.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => updateForm('business_type', type.value)}
                    style={{ padding: '14px 12px', borderRadius: '12px', border: `2px solid ${form.business_type === type.value ? '#6366F1' : 'rgba(255,255,255,0.06)'}`,
                      background: form.business_type === type.value ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: form.business_type === type.value ? '#818CF8' : '#F8FAFC', marginBottom: '2px' }}>{type.label}</p>
                    <p style={{ fontSize: '11px', color: '#475569' }}>{type.desc}</p>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Step 4 — Lead Source */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {LEAD_SOURCES.map(src => (
                    <motion.button key={src.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => updateForm('lead_source', src.value)}
                      style={{ padding: '12px', borderRadius: '10px', border: `2px solid ${form.lead_source === src.value ? '#6366F1' : 'rgba(255,255,255,0.06)'}`,
                        background: form.lead_source === src.value ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                        color: form.lead_source === src.value ? '#818CF8' : '#94A3B8', transition: 'all 0.15s', textAlign: 'left' }}>
                      {src.label}
                    </motion.button>
                  ))}
                </div>
                {(form.lead_source === 'referral' || form.lead_source === 'partner' || form.lead_source === 'other') && (
                  <motion.input initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    value={form.lead_source_detail} onChange={e => updateForm('lead_source_detail', e.target.value)}
                    placeholder={form.lead_source === 'referral' ? 'Who referred you?' : form.lead_source === 'partner' ? "Agent's name?" : 'Please specify'}
                    style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.3)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                )}
              </div>
            )}

            {/* Step 5 — Referral Code */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p style={{ fontSize: '13px', color: '#818CF8', fontWeight: 600, marginBottom: '4px' }}>🎁 Have a referral code?</p>
                  <p style={{ fontSize: '12px', color: '#475569' }}>If someone referred you to Pavroll, enter their code here. This is optional.</p>
                </div>
                <input value={form.referral_code} onChange={e => updateForm('referral_code', e.target.value.toUpperCase())}
                  placeholder="e.g. MAXWELL100"
                  style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '18px', outline: 'none', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '2px', textAlign: 'center' }}
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                <p style={{ fontSize: '12px', color: '#334155', textAlign: 'center' }}>You can skip this if you don't have one</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontSize: '12px', color: '#EF4444', marginTop: '12px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </motion.p>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
              {step > 1 ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(step - 1)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '14px', cursor: 'pointer' }}>
                  <ChevronLeft size={16} /> Back
                </motion.button>
              ) : <div />}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={next} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366F1, #818CF8)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Setting up...</>
                ) : step === STEPS.length ? (
                  <><Check size={16} /> Complete Setup</>
                ) : (
                  <>Next <ChevronRight size={16} /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip link for step 5 */}
        {step === 5 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#475569' }}>
            <span onClick={() => { setSaving(true); handleSubmit() }} style={{ color: '#6366F1', cursor: 'pointer', textDecoration: 'underline' }}>
              Skip and go to dashboard →
            </span>
          </motion.p>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#334155' }}>
          🔒 Your information is secure and encrypted
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
