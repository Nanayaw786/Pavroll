'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

type Status = 'loading' | 'success' | 'failed' | 'login'

function BillingSuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<any>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!reference) {
      setMessage('No payment reference was found.')
      setStatus('failed')
      return
    }
    activate(reference)
  }, [reference])

  const activate = async (ref: string) => {
    try {
      const res = await fetch('/api/billing/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref }),
      })
      if (res.status === 401 || res.status === 404) {
        setStatus('login')
        return
      }
      const result = await res.json()
      if (res.ok && result.success) {
        setData(result)
        setStatus('success')
      } else {
        setMessage(result.error || 'Something went wrong.')
        setStatus('failed')
      }
    } catch {
      setMessage('Could not reach the server. Please try again.')
      setStatus('failed')
    }
  }

  const planName = data?.plan ? data.plan.charAt(0).toUpperCase() + data.plan.slice(1) : ''
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(`/billing/success?reference=${reference || ''}`)}`

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
      style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center', margin: '0 20px' }}>

      {status === 'loading' && (
        <>
          <Loader2 size={48} color="#6366F1" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>Confirming your payment...</h2>
          <p style={{ fontSize: '14px', color: '#475569' }}>Please wait while we activate your plan.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={40} color="#10B981" />
          </motion.div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#F8FAFC', marginBottom: '8px' }}>Payment Successful!</h2>
          <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '24px', lineHeight: 1.6 }}>
            Your plan is now active. You can start running payroll immediately.
          </p>
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Plan</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{planName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Amount</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>GHS {(Number(data?.amount || 0) / 100).toFixed(2)}</span>
            </div>
            {data?.expiresAt && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#475569' }}>Active until</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{new Date(data.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Reference</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#F8FAFC', fontFamily: 'monospace' }}>{data?.reference}</span>
            </div>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '12px', background: '#6366F1', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Go to Dashboard <ArrowRight size={16} />
            </motion.div>
          </Link>
        </>
      )}

      {status === 'login' && (
        <>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F8FAFC', marginBottom: '8px' }}>Please log in</h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.6 }}>
            Your payment went through. Log in to finish activating your plan.
          </p>
          <Link href={signInUrl} style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '12px', background: '#6366F1', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Log in <ArrowRight size={16} />
            </motion.div>
          </Link>
        </>
      )}

      {status === 'failed' && (
        <>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span style={{ fontSize: '36px', color: '#EF4444' }}>X</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#F8FAFC', marginBottom: '8px' }}>We could not activate your plan</h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.6 }}>{message}</p>
          <Link href="/settings" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', borderRadius: '12px', background: '#6366F1', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Back to Settings <ArrowRight size={16} />
            </motion.div>
          </Link>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '20px' }}>
            Need help? Email hello@pavroll.com and include this reference: {reference}
          </p>
        </>
      )}
    </motion.div>
  )
}

export default function BillingSuccessPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <Suspense fallback={null}>
        <BillingSuccessContent />
      </Suspense>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}