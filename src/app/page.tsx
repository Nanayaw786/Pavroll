'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, Zap, Users, FileText, BarChart3, Shield, ArrowRight } from 'lucide-react'
import PayrollOrb from '@/components/ui/PayrollOrb'

const features = [
  { icon: Users, title: 'Employee Management', desc: 'Add, edit and manage your entire workforce with SSNIT numbers, bank details and salary info in one place.', color: '#6366F1' },
  { icon: Zap, title: 'Auto Payroll Calculation', desc: 'Ghana GRA 2024 compliant. Auto-calculates PAYE, SSNIT (5.5%), Tier 2 and net pay every month.', color: '#10B981' },
  { icon: FileText, title: 'PDF Payslips', desc: 'Generate branded payslips instantly and email them directly to every employee with one click.', color: '#F59E0B' },
  { icon: BarChart3, title: 'Reports & Exports', desc: 'Export SSNIT schedules, PAYE reports and payroll summaries as CSV. Ready for GRA submission.', color: '#06B6D4' },
  { icon: Shield, title: 'Leave Management', desc: 'Handle leave requests, approvals and balances. Track annual, sick, maternity and emergency leave.', color: '#8B5CF6' },
  { icon: CheckCircle, title: 'Paystack Billing', desc: 'Simple monthly subscription. Cancel anytime. No hidden fees. Priced for Ghanaian SMEs.', color: '#EF4444' },
]

const plans = [
  { name: 'Starter', price: 'GHS 120', period: '/mo', employees: 'Up to 10 employees', features: [
    '✅ PAYE & SSNIT calculations',
    '✅ PDF Payslips',
    '✅ Employee Management',
    '✅ Leave Management',
    '✅ Basic Reports (30 days)',
    '✅ 50 SMS/month',
    '✅ 1 Team Member',
    '❌ Custom Sender ID',
    '❌ ESS Portal',
    '❌ Loan Module',
    '📧 Email Support',
  ], color: '#6366F1', popular: false },
  { name: 'Growth', price: 'GHS 350', period: '/mo', employees: 'Up to 50 employees', features: [
    '✅ Everything in Starter',
    '✅ Advanced Reports (90 days)',
    '✅ 200 SMS/month',
    '✅ Custom Sender ID',
    '✅ ESS Employee Portal',
    '✅ 13th Month Bonus',
    '✅ 3 Team Members',
    '❌ Loan Module',
    '❌ API Access',
    '📧📞 Email + Phone Support',
  ], color: '#10B981', popular: true },
  { name: 'Business', price: 'GHS 800', period: '/mo', employees: 'Unlimited employees', features: [
    '✅ Everything in Growth',
    '✅ Unlimited SMS',
    '✅ Unlimited Team Members',
    '✅ Loan & Salary Advance',
    '✅ Custom Reports',
    '✅ Unlimited Audit Trail',
    '✅ Payroll Variance Alerts',
    '✅ API Access',
    '🎯 Dedicated Account Manager',
  ], color: '#F59E0B', popular: false },
]

const stats = [
  { value: '500+', label: 'Companies' },
  { value: 'GHS 2M+', label: 'Payroll Processed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '5 min', label: 'Setup Time' },
]

export default function LandingPage() {
  return (
    <div style={{ background: '#0A0A0F', color: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav className="landing-nav" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 80px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>Pav<span style={{ color: '#6366F1' }}>roll</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {[
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'About', href: '/about' },
          ].map(item => (
            <a key={item.label} href={item.href} style={{ fontSize: '14px', color: '#64748B', textDecoration: 'none', transition: 'color 0.2s' }}>{item.label}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/dashboard" style={{ padding: '8px 18px', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>Sign In</Link>
          <Link href="/dashboard" style={{ padding: '8px 18px', borderRadius: '9px', background: '#6366F1', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section" style={{ padding: '80px 40px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', maxWidth: '1280px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '24px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366F1' }} />
            <span style={{ fontSize: '12px', color: '#818CF8', fontWeight: 600 }}>Built for Ghanaian SMEs</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '20px' }}>
            Payroll that<br />
            <span style={{ background: 'linear-gradient(135deg,#818CF8,#6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>just works.</span>
          </h1>
          <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px' }}>
            Ghana GRA 2024 compliant payroll for SMEs. Auto-calculate PAYE, SSNIT & Tier 2. Generate payslips. Export SSNIT schedules. All in one beautiful tool.
          </p>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', background: '#6366F1', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
                Start Free Trial <ArrowRight size={16} />
              </motion.div>
            </Link>
            <p style={{ fontSize: '13px', color: '#475569' }}>No credit card required</p>
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '40px' }}>
            {['GRA 2024 Compliant', 'SSNIT Export', 'PDF Payslips'].map(tag => (
              <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} color="#10B981" />
                <span style={{ fontSize: '13px', color: '#64748B' }}>{tag}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          className="hero-visual"
          style={{ position: 'relative', height: '420px', borderRadius: '24px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', overflow: 'hidden' }}>
          <PayrollOrb />
          <div style={{ position: 'absolute', bottom: '28px', left: '28px', right: '28px' }}>
            <div style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', borderRadius: '14px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '11px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>June 2026 Payroll</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[{ label: 'Gross', value: 'GHS 16,500', color: '#F8FAFC' }, { label: 'PAYE', value: 'GHS 2,465', color: '#EF4444' }, { label: 'Net Pay', value: 'GHS 13,127', color: '#10B981' }].map(s => (
                  <div key={s.label}>
                    <p style={{ fontSize: '11px', color: '#475569' }}>{s.label}</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: s.color, marginTop: '2px' }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="stats-section" style={{ padding: '40px 80px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="stats-grid" style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '36px', fontWeight: 800, color: '#6366F1' }}>{s.value}</p>
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section" style={{ padding: '80px 80px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em' }}>Everything you need</h2>
          <p style={{ fontSize: '16px', color: '#64748B', marginTop: '12px' }}>One tool. Complete payroll management for your Ghanaian business.</p>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              style={{ padding: '28px', borderRadius: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', transition: 'border-color 0.2s' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: f.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <f.icon size={20} color={f.color} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing-section" style={{ padding: '80px 80px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em' }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: '16px', color: '#64748B', marginTop: '12px' }}>Priced for Ghanaian businesses. Cancel anytime.</p>
          </div>
          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '960px', margin: '0 auto' }}>
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                style={{ padding: '28px', borderRadius: '20px', background: plan.popular ? `${plan.color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${plan.popular ? plan.color + '30' : 'rgba(255,255,255,0.06)'}`, position: 'relative' }}>
                {plan.popular && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: '999px', background: plan.color, color: '#fff', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>MOST POPULAR</div>
                )}
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>{plan.name}</p>
                <p style={{ fontSize: '36px', fontWeight: 800, color: plan.color, marginTop: '12px' }}>{plan.price}<span style={{ fontSize: '14px', fontWeight: 400, color: '#475569' }}>{plan.period}</span></p>
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', marginBottom: '20px' }}>{plan.employees}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} color={plan.color} />
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: '10px', background: plan.popular ? plan.color : plan.color + '15', border: `1px solid ${plan.color}30`, color: plan.popular ? '#fff' : plan.color, fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
                    Get Started
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 80px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: '600px', margin: '0 auto' }}>
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

      <style>{`
        @media (max-width: 900px) {
          .hero-section { grid-template-columns: 1fr !important; padding: 48px 20px 32px !important; gap: 28px !important; }
          .hero-title { font-size: 38px !important; }
          .hero-visual { height: 260px !important; }
          .landing-nav { padding: 0 20px !important; }
          .landing-nav > div:nth-child(2) { display: none !important; }
          .stats-section { padding: 28px 20px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
          .features-section { padding: 48px 20px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .pricing-section { padding: 48px 20px !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .landing-footer { flex-direction: column !important; gap: 12px !important; text-align: center !important; padding: 20px !important; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 30px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* Footer */}
      <footer className="landing-footer" style={{ padding: '32px 80px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
    </div>
  )
}
