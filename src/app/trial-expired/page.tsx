'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap, CheckCircle, ArrowRight, Clock } from 'lucide-react'
import { useState } from 'react'

const plans = [
  { key: 'starter', name: 'Starter', price: 120, employees: 'Up to 10 employees', sms: '50 SMS/month', color: '#6366F1' },
  { key: 'growth', name: 'Growth', price: 350, employees: 'Up to 50 employees', sms: '200 SMS/month', color: '#10B981', popular: true },
  { key: 'business', name: 'Business', price: 800, employees: 'Unlimited employees', sms: 'Unlimited SMS', color: '#F59E0B' },
]

export default function TrialExpiredPage() {
  const [paying, setPaying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = (planKey: string, amount: number, planName: string) => {
    if (typeof window === 'undefined') return
    if (!(window as any).PaystackPop) {
      setError('Payment system loading... please try again.')
      return
    }
    setPaying(planKey)
    const handler = (window as any).PaystackPop.setup({
      key: 'pk_live_eaf1f4d99ab4aa521121a6b9760925cfb5eaa60d',
      email: 'admin@company.com',
      amount: amount * 100,
      currency: 'GHS',
      metadata: { plan: planKey, plan_name: planName },
      callback: (response: any) => {
        window.location.href = `/billing/success?reference=${response.reference}`
      },
      onClose: () => setPaying(null)
    })
    handler.openIframe()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F8FAFC', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '48px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color="white" fill="white" />
        </div>
        <span style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC' }}>Pav<span style={{ color: '#6366F1' }}>roll</span></span>
      </Link>

      {/* Expired notice */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', maxWidth: '560px', marginBottom: '48px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Clock size={32} color="#EF4444" />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Your free trial has ended
        </h1>
        <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.7, marginBottom: '8px' }}>
          Your 30-day free trial has expired. Upgrade to a paid plan to continue using Pavroll and keep access to all your payroll data.
        </p>
        <p style={{ fontSize: '14px', color: '#475569' }}>
          Your data is safe — it will be available immediately after upgrading.
        </p>
      </motion.div>

      {error && (
        <div style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: '13px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '900px', width: '100%', marginBottom: '40px' }}>
        {plans.map((plan, i) => (
          <motion.div key={plan.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ padding: '28px', borderRadius: '20px', background: plan.popular ? `${plan.color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${plan.popular ? plan.color + '30' : 'rgba(255,255,255,0.06)'}`, position: 'relative', textAlign: 'center' }}>
            {plan.popular && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: plan.color, color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '999px' }}>
                MOST POPULAR
              </div>
            )}
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: plan.color, marginBottom: '4px' }}>{plan.name}</h3>
            <p style={{ fontSize: '32px', fontWeight: 800, color: '#F8FAFC', marginBottom: '4px' }}>GHS {plan.price}</p>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>per month</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', textAlign: 'left' }}>
              {[plan.employees, plan.sms, 'All features included', 'Priority support', 'Custom Sender ID'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={13} color={plan.color} />
                  <span style={{ fontSize: '13px', color: '#94A3B8' }}>{f}</span>
                </div>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleUpgrade(plan.key, plan.price, plan.name)}
              disabled={!!paying}
              style={{ width: '100%', padding: '11px', borderRadius: '10px', background: plan.color, border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', opacity: paying === plan.key ? 0.7 : 1 }}>
              {paying === plan.key ? 'Opening...' : `Upgrade to ${plan.name}`}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <p style={{ fontSize: '13px', color: '#475569', textAlign: 'center' }}>
        Questions? Contact us at{' '}
        <a href="mailto:hello.pavroll@proton.me" style={{ color: '#6366F1', textDecoration: 'none' }}>hello.pavroll@proton.me</a>
        {' '}or{' '}
        <a href="tel:+233539299311" style={{ color: '#6366F1', textDecoration: 'none' }}>+233 53 929 9311</a>
      </p>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
