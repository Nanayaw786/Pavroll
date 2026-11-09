'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, CheckCircle, MessageCircle, Video, ArrowRight, Loader2 } from 'lucide-react'

const WHATSAPP_NUMBER = '233505216213'
const WHATSAPP_DISPLAY = '+233 50 521 6213'

const METHODS = [
  { key: 'WhatsApp', label: 'WhatsApp call', desc: 'Voice or video. Our favourite.', icon: MessageCircle, color: '#10B981' },
  { key: 'Google Meet', label: 'Google Meet', desc: 'Link sent by email', icon: Video, color: '#6366F1' },
  { key: 'Zoom', label: 'Zoom', desc: 'Link sent by email', icon: Video, color: '#06B6D4' },
]

const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
const SIZES = ['1-10 employees', '11-50 employees', '51-200 employees', '200+ employees']

const inputStyle = {
  padding: '11px 14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#F8FAFC',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
  colorScheme: 'dark',
} as const

export default function DemoPage() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', date: '', time: '', size: '', notes: '', website: '' })
  const [method, setMethod] = useState('WhatsApp')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const buildMessage = () => [
    'Hello Pavroll, I would like to book a demo.',
    '',
    `Name: ${form.name.trim()}`,
    `Company: ${form.company.trim()}`,
    `Email: ${form.email.trim()}`,
    `Phone: ${form.phone.trim()}`,
    `Preferred date: ${form.date}`,
    `Preferred time: ${form.time} (Ghana time)`,
    `Meeting type: ${method}`,
    form.size ? `Company size: ${form.size}` : '',
    form.notes.trim() ? `Notes: ${form.notes.trim()}` : '',
  ].filter(line => line !== '').join('\n')

  const submit = async () => {
    setError('')
    if (form.website) return
    if (!form.name.trim() || !form.company.trim() || !form.email.trim() || !form.phone.trim() || !form.date || !form.time) {
      setError('Please fill in all the fields marked with *.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setStatus('sending')
    let ok = false
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          subject: `Demo request: ${form.company.trim()} (${method})`,
          message: buildMessage(),
        }),
      })
      ok = res.ok
    } catch {
      ok = false
    }
    setEmailSent(ok)
    setStatus('done')
  }

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`

  const field = (label: string, key: 'name' | 'company' | 'email' | 'phone', placeholder: string, required = true) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{label}{required ? ' *' : ''}</label>
      <input
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F8FAFC', fontFamily: 'Inter, sans-serif', padding: '32px 20px 64px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '32px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>Pav<span style={{ color: '#6366F1' }}>roll</span></span>
        </Link>

        {status !== 'done' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '10px' }}>Book a free demo</h1>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7, marginBottom: '28px' }}>
              See how Pavroll handles PAYE, SSNIT and payslips for your business. A short 20-minute call, no pressure.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', marginBottom: '10px' }}>How would you like to meet? *</p>
                <div className="demo-methods" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {METHODS.map(m => (
                    <button key={m.key} type="button" onClick={() => setMethod(m.key)}
                      style={{ padding: '14px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                        border: `2px solid ${method === m.key ? m.color : 'rgba(255,255,255,0.06)'}`,
                        background: method === m.key ? `${m.color}12` : 'rgba(255,255,255,0.02)' }}>
                      <m.icon size={18} color={m.color} style={{ marginBottom: '8px' }} />
                      <p style={{ fontSize: '13px', fontWeight: 600, color: method === m.key ? m.color : '#F8FAFC' }}>{m.label}</p>
                      <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="demo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {field('Your name', 'name', 'Kwame Mensah')}
                {field('Company name', 'company', 'Acme Ghana Ltd')}
                {field('Email', 'email', 'kwame@company.com')}
                {field('Phone / WhatsApp number', 'phone', '024 123 4567')}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Preferred date *</label>
                  <input type="date" min={today} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Preferred time (Ghana time) *</label>
                  <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} style={{ ...inputStyle, background: '#1A1A24' }}>
                    <option value="">Select a time</option>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Company size</label>
                  <select value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} style={{ ...inputStyle, background: '#1A1A24' }}>
                    <option value="">Select (optional)</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Anything you would like us to cover?</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3}
                    placeholder="e.g. We pay 40 staff monthly and need SSNIT schedules"
                    style={{ ...inputStyle, resize: 'none' }} />
                </div>

                {/* Spam trap: real visitors never see or fill this */}
                <input tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }} aria-hidden="true" />
              </div>

              {error && (
                <p style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171', fontSize: '13px' }}>{error}</p>
              )}

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={submit} disabled={status === 'sending'}
                style={{ padding: '14px', borderRadius: '12px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: status === 'sending' ? 0.7 : 1 }}>
                {status === 'sending' ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <>Request my demo <ArrowRight size={16} /></>}
              </motion.button>

              <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center' }}>
                Prefer to chat now? WhatsApp us on <a href={`https://wa.me/${WHATSAPP_NUMBER}`} style={{ color: '#10B981', textDecoration: 'none', fontWeight: 600 }}>{WHATSAPP_DISPLAY}</a>
              </p>
            </div>
          </motion.div>
        )}

        {status === 'done' && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: emailSent ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={34} color={emailSent ? '#10B981' : '#F59E0B'} />
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '10px' }}>
              {emailSent ? 'Demo request received' : 'One more step'}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, marginBottom: '24px' }}>
              {emailSent
                ? (method === 'WhatsApp'
                    ? 'Thank you. We will message you on WhatsApp to confirm your time.'
                    : `Thank you. We will email you a ${method} link to confirm your time.`)
                : 'We could not send your request by email. Please tap the button below to send it to us on WhatsApp instead.'}
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 26px', borderRadius: '12px', background: '#10B981', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              <MessageCircle size={16} /> {emailSent ? 'Confirm faster on WhatsApp' : 'Send on WhatsApp'}
            </a>
            <div style={{ marginTop: '20px' }}>
              <Link href="/" style={{ fontSize: '13px', color: '#818CF8', textDecoration: 'none' }}>Back to home</Link>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .demo-grid { grid-template-columns: 1fr !important; }
          .demo-methods { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}