'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, CheckCircle, ArrowRight, Mail, Phone, MapPin, Star, Shield, TrendingUp, Users, FileText, Bell, UserX } from 'lucide-react'
import { useState } from 'react'

const features = [
  { icon: TrendingUp, title: 'Ghana GRA 2026 Compliant', desc: 'Auto-calculates PAYE, SSNIT (5.5%), Tier 2 pension and net pay — always up to date with GRA regulations.', color: '#6366F1' },
  { icon: FileText, title: 'PDF Payslips', desc: 'Generate branded payslips instantly and email them directly to every employee with one click.', color: '#10B981' },
  { icon: Users, title: 'Employee Management', desc: 'Add, edit and manage your entire workforce with SSNIT numbers, bank details and salary info in one place.', color: '#F59E0B' },
  { icon: Bell, title: 'Compliance Alerts', desc: 'Never miss a SSNIT or PAYE deadline again. Pavroll alerts you days before every filing deadline.', color: '#06B6D4' },
  { icon: Shield, title: 'Audit Trail', desc: 'Every payroll action logged with timestamp. CFOs and auditors love the complete transparency.', color: '#8B5CF6' },
  { icon: UserX, title: 'Offboarding Module', desc: 'Calculate final pay, gratuity, notice pay and manage clearance checklists — nobody does this cleanly in Ghana.', color: '#EF4444' },
]

const testimonials = [
  { name: 'Abena Osei', role: 'HR Manager', company: 'TechGhana Ltd', text: 'Pavroll saved us 3 days every month. SSNIT calculations used to take forever. Now it\'s done in seconds.', rating: 5, avatar: 'AO' },
  { name: 'Kweku Darko', role: 'Finance Director', company: 'Accra Foods Co.', text: 'The audit trail alone is worth the subscription. Our external auditors were impressed by the level of detail.', rating: 5, avatar: 'KD' },
  { name: 'Ama Sarpong', role: 'CEO', company: 'Sarpong Ventures', text: 'Finally a payroll tool built for Ghana. The PAYE calculations are spot on with GRA 2026 rates.', rating: 5, avatar: 'AS' },
  { name: 'Kofi Mensah', role: 'Accountant', company: 'MensahCorp', text: 'I manage payroll for 3 companies. Pavroll\'s multi-company support is a game changer for me.', rating: 5, avatar: 'KM' },
]

const team = [
  { name: 'Samuel Mensah', role: 'Founder & CEO', bio: 'Full-stack developer with 7+ years building software for African businesses. Built Pavroll to solve his own payroll pain.', avatar: 'SM', color: '#6366F1' },
  { name: 'KodrixLab', role: 'Technology', bio: 'The engineering team behind Pavroll. Specialists in building premium SaaS products for the Ghanaian market.', avatar: 'KL', color: '#10B981' },
]

const stats = [
  { value: '500+', label: 'Companies' },
  { value: 'GHS 2M+', label: 'Payroll Processed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '5 min', label: 'Setup Time' },
]

const whyGhana = [
  { title: 'Built for GRA 2026', desc: 'PAYE tax bands, SSNIT contributions, Tier 2 pension — all hardcoded to Ghana\'s exact regulations. Not a generic tool adapted for Ghana.' },
  { title: 'Priced in GHS', desc: 'Starting at GHS 120/month. No USD billing, no hidden forex charges. Transparent pricing for Ghanaian businesses.' },
  { title: 'SSNIT Schedule Export', desc: 'Generate SSNIT contribution schedules ready for submission. One click CSV export that accountants love.' },
  { title: 'Ghana Card Integration', desc: 'Store Ghana Card numbers alongside SSNIT numbers, bank details and employment contracts in one place.' },
  { title: 'Local Support', desc: 'Support team based in Ghana. We understand your payroll challenges because we\'ve lived them.' },
  { title: 'MTN Mobile Money Ready', desc: 'Paystack integration supports Mobile Money payments — the way Ghanaians prefer to pay.' },
]

export default function AboutPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ name: '', email: '', company: '', message: '' })
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/" style={{ padding: '8px 18px', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>Home</Link>
          <Link href="/dashboard" style={{ padding: '8px 18px', borderRadius: '9px', background: '#6366F1', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="about-hero" style={{ padding: '100px 80px 80px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '24px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366F1' }} />
            <span style={{ fontSize: '12px', color: '#818CF8', fontWeight: 600 }}>About Pavroll</span>
          </div>
          <h1 style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '20px' }}>
            Built for Ghana.<br />
            <span style={{ background: 'linear-gradient(135deg,#818CF8,#6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Built to last.</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#64748B', lineHeight: 1.7, marginBottom: '36px' }}>
            Pavroll was born from a simple frustration — Ghanaian SMEs were running payroll on Excel, missing SSNIT deadlines, and getting PAYE calculations wrong. We built the tool we wished existed.
          </p>
          <Link href="/dashboard">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', background: '#6366F1', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
              Start Free Trial <ArrowRight size={16} />
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ padding: '40px 80px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="about-stats" style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '36px', fontWeight: 800, color: '#6366F1' }}>{s.value}</p>
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '100px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="about-mission">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '20px' }}>Our Mission</h2>
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.8, marginBottom: '20px' }}>
              To make compliant, accurate payroll accessible to every Ghanaian business — from the 5-person startup in East Legon to the 200-employee manufacturing company in Tema.
            </p>
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.8, marginBottom: '28px' }}>
              We believe no business should lose money to payroll errors, miss SSNIT deadlines, or spend 3 days every month calculating PAYE manually. That time belongs to growing your business.
            </p>
            {['GRA 2026 compliant always', 'Never miss a statutory deadline', 'Save 3+ days every month', 'Built for Ghanaian SMEs'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <CheckCircle size={16} color="#10B981" />
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>{item}</span>
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '24px', padding: '40px' }}>
              <p style={{ fontSize: '48px', marginBottom: '16px' }}>🇬🇭</p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#F8FAFC', marginBottom: '12px' }}>Made in Ghana, for Ghana</h3>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.7, marginBottom: '20px' }}>
                Every feature in Pavroll was designed with the Ghanaian business context in mind. From GRA tax bands to SSNIT contribution schedules, we speak your language.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['GHS pricing — no hidden forex charges', 'Supabase + Vercel — 99.9% uptime', 'GDPR & Ghana Data Protection compliant'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366F1', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Ghana */}
      <section style={{ padding: '80px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em' }}>Why Pavroll for Ghana?</h2>
            <p style={{ fontSize: '16px', color: '#64748B', marginTop: '12px' }}>Not a generic global payroll tool. Built from the ground up for Ghana.</p>
          </div>
          <div className="about-why" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {whyGhana.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                style={{ padding: '28px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <CheckCircle size={18} color="#6366F1" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em' }}>Everything you need</h2>
          <p style={{ fontSize: '16px', color: '#64748B', marginTop: '12px' }}>One tool. Complete payroll management for your Ghanaian business.</p>
        </div>
        <div className="about-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              style={{ padding: '28px', borderRadius: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: f.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <f.icon size={20} color={f.color} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Company Story */}
      <section style={{ padding: '80px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '24px' }}>Our Story</h2>
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.8, marginBottom: '20px' }}>
              Pavroll started when our founder, Samuel, was building apps for Ghanaian businesses and kept seeing the same problem — payroll. Companies were losing money to calculation errors, accountants were spending entire weekends on SSNIT schedules, and HR managers were manually emailing payslips one by one.
            </p>
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.8, marginBottom: '20px' }}>
              The existing tools were either too expensive, too complex, or not built for Ghana's specific tax laws. So we built Pavroll — a tool that automates everything, stays compliant with GRA regulations, and actually looks beautiful to use.
            </p>
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.8 }}>
              Today, Pavroll handles payroll for hundreds of Ghanaian businesses — from tech startups in Accra to manufacturing companies in Tema. We're just getting started. 🇬🇭
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '100px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em' }}>The Team</h2>
          <p style={{ fontSize: '16px', color: '#64748B', marginTop: '12px' }}>Small team. Big vision. Built in Ghana.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', maxWidth: '800px', margin: '0 auto' }} className="about-team">
          {team.map((member, i) => (
            <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              style={{ padding: '32px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: `linear-gradient(135deg, ${member.color}, ${member.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 auto 16px' }}>
                {member.avatar}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>{member.name}</h3>
              <p style={{ fontSize: '13px', color: member.color, fontWeight: 600, marginBottom: '12px' }}>{member.role}</p>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em' }}>What our clients say</h2>
            <p style={{ fontSize: '16px', color: '#64748B', marginTop: '12px' }}>Ghanaian businesses trust Pavroll every month.</p>
          </div>
          <div className="about-testimonials" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                style={{ padding: '28px', borderRadius: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} color="#F59E0B" fill="#F59E0B" />)}
                </div>
                <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>{t.name}</p>
                    <p style={{ fontSize: '12px', color: '#475569' }}>{t.role}, {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section style={{ padding: '100px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }} className="about-contact">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '20px' }}>Get in touch</h2>
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.7, marginBottom: '36px' }}>
              Have questions about Pavroll? Want a demo for your team? We'd love to hear from you.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { icon: Mail, label: 'Email', value: 'hello@pavroll.app' },
                { icon: Phone, label: 'Phone', value: '+233 XX XXX XXXX' },
                { icon: MapPin, label: 'Location', value: 'Accra, Ghana 🇬🇭' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={18} color="#6366F1" />
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                    <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '2px' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '36px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', marginBottom: '24px' }}>Send us a message</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Full Name', key: 'name', placeholder: 'Kwame Mensah' },
                { label: 'Work Email', key: 'email', placeholder: 'kwame@company.com' },
                { label: 'Company Name', key: 'company', placeholder: 'Acme Ghana Ltd' },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{field.label}</label>
                  <input value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Tell us about your payroll needs..." rows={4}
                  style={{ padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', resize: 'none' }} />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                style={{ padding: '12px', borderRadius: '10px', background: sent ? '#10B981' : '#6366F1', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px', transition: 'background 0.2s' }}>
                {sent ? '✅ Message Sent!' : 'Send Message'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 80px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '44px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>Ready to simplify payroll?</h2>
          <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '36px' }}>Join hundreds of Ghanaian businesses running payroll the smart way.</p>
          <Link href="/dashboard">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 36px', borderRadius: '14px', background: '#6366F1', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
              Start Free Trial <ArrowRight size={18} />
            </motion.div>
          </Link>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '16px' }}>No credit card required • Setup in 5 minutes</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="about-footer" style={{ padding: '32px 80px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={12} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>Pav<span style={{ color: '#6366F1' }}>roll</span></span>
        </div>
        <p style={{ fontSize: '12px', color: '#475569' }}>© 2026 Pavroll. Built for Ghana. 🇬🇭</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }, { label: 'Contact', href: '/contact' }].map(link => (
            <a key={link.label} href={link.href} style={{ fontSize: '12px', color: '#475569', textDecoration: 'none' }}>{link.label}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          section { padding-left: 24px !important; padding-right: 24px !important; padding-top: 60px !important; padding-bottom: 60px !important; }
          nav { padding: 0 20px !important; }
          .about-hero { padding: 60px 24px 40px !important; }
          .about-hero h1 { font-size: 36px !important; }
          .about-mission { grid-template-columns: 1fr !important; gap: 32px !important; }
          .about-why { grid-template-columns: 1fr !important; }
          .about-features { grid-template-columns: 1fr !important; }
          .about-team { grid-template-columns: 1fr !important; }
          .about-testimonials { grid-template-columns: 1fr !important; }
          .about-contact { grid-template-columns: 1fr !important; gap: 40px !important; }
          .about-stats { grid-template-columns: 1fr 1fr !important; gap: 20px !important; padding: 24px !important; }
          .about-footer { flex-direction: column !important; text-align: center !important; padding: 24px !important; }
          .about-cta h2 { font-size: 32px !important; }
        }
        @media (max-width: 480px) {
          .about-hero h1 { font-size: 28px !important; }
          .about-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
