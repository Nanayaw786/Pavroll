'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ArrowLeft, Mail, Phone, MapPin, MessageSquare, Clock, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  { q: 'How long does setup take?', a: 'Most companies are up and running in under 5 minutes. Add your company details, import your employees and run your first payroll.' },
  { q: 'Is Pavroll GRA 2024 compliant?', a: 'Yes. PAYE tax bands, SSNIT contributions and Tier 2 pension are all calculated using the latest Ghana GRA 2024 regulations.' },
  { q: 'Can I import existing employees?', a: 'Yes. You can bulk import employees via CSV upload. Download our template, fill in your staff details and upload.' },
  { q: 'How do employees access their payslips?', a: 'Employees log in to the Employee Self-Service (ESS) portal to view and download their payslips. You can also email payslips directly.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no lock-in. Cancel your subscription at any time from the billing settings.' },
  { q: 'Do you support multiple companies?', a: 'Multi-company support is available on the Business plan (GHS 800/month). Perfect for accountants managing multiple clients.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setForm({ name: '', email: '', company: '', subject: '', message: '' })
      setTimeout(() => setSent(false), 5000)
    }, 1500)
  }

  return (
    <div style={{ background: '#0A0A0F', color: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 80px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>Pav<span style={{ color: '#6366F1' }}>roll</span></span>
        </Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 80px 60px', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '20px' }}>
            <MessageSquare size={12} color="#818CF8" />
            <span style={{ fontSize: '12px', color: '#818CF8', fontWeight: 600 }}>Get in touch</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>We'd love to hear from you</h1>
          <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.7 }}>
            Have a question about Pavroll? Want a demo for your team? Need help with your account? We're here.
          </p>
        </motion.div>
      </section>

      {/* Contact info cards */}
      <section style={{ padding: '0 80px 60px', maxWidth: '1280px', margin: '0 auto' }}>
        <div className="contact-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: Mail, title: 'Email Us', value: 'hello@pavroll.app', desc: 'We reply within 24 hours', color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { icon: Phone, title: 'Call Us', value: '+233 XX XXX XXXX', desc: 'Mon–Fri, 9am–6pm GMT', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { icon: MapPin, title: 'Visit Us', value: 'Accra, Ghana 🇬🇭', desc: 'By appointment only', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              style={{ padding: '28px', borderRadius: '16px', background: item.bg, border: `1px solid ${item.color}20`, textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: item.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <item.icon size={22} color={item.color} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>{item.title}</h3>
              <p style={{ fontSize: '14px', color: item.color, fontWeight: 600, marginBottom: '4px' }}>{item.value}</p>
              <p style={{ fontSize: '12px', color: '#475569' }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact form + response time */}
      <section style={{ padding: '0 80px 100px', maxWidth: '1280px', margin: '0 auto' }}>
        <div className="contact-main" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '36px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>Send us a message</h2>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>Fill in the form and we'll get back to you within 24 hours.</p>

            {sent && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '20px' }}>
                <CheckCircle size={16} color="#10B981" />
                <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 500 }}>Message sent! We'll reply within 24 hours.</span>
              </motion.div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'Kwame Mensah' },
                  { label: 'Work Email', key: 'email', placeholder: 'kwame@company.com' },
                ].map(field => (
                  <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{field.label}</label>
                    <input value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                  </div>
                ))}
              </div>

              {[
                { label: 'Company Name', key: 'company', placeholder: 'Acme Ghana Ltd' },
                { label: 'Subject', key: 'subject', placeholder: 'How can we help?' },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{field.label}</label>
                  <input value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                </div>
              ))}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us about your payroll needs, questions or feedback..." rows={5}
                  style={{ padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', resize: 'none' }} />
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={sending}
                style={{ padding: '12px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: sending ? 0.7 : 1, transition: 'all 0.2s' }}>
                {sending ? 'Sending...' : 'Send Message'}
              </motion.button>
            </div>
          </motion.div>

          {/* Right side */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Response time */}
            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Clock size={18} color="#6366F1" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC' }}>Response Times</h3>
              </div>
              {[
                { type: 'General inquiries', time: '< 24 hours' },
                { type: 'Technical support', time: '< 12 hours' },
                { type: 'Billing questions', time: '< 4 hours' },
                { type: 'Enterprise demos', time: 'Same day' },
              ].map(item => (
                <div key={item.type} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>{item.type}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>{item.time}</span>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>Frequently Asked Questions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {faqs.map((faq, i) => (
                  <div key={i} style={{ paddingBottom: '16px', borderBottom: i < faqs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>{faq.q}</p>
                    <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6 }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 80px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '12px', color: '#475569' }}>© 2026 Pavroll. Built for Ghana. 🇬🇭</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }, { label: 'Contact', href: '/contact' }].map(link => (
            <Link key={link.label} href={link.href} style={{ fontSize: '12px', color: '#475569', textDecoration: 'none' }}>{link.label}</Link>
          ))}
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .contact-cards { grid-template-columns: 1fr !important; }
          .contact-main { grid-template-columns: 1fr !important; }
          nav, section, footer { padding-left: 24px !important; padding-right: 24px !important; }
        }
      `}</style>
    </div>
  )
}
