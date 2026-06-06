'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, X } from 'lucide-react'

export default function MobileNotice() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('mobile-notice-dismissed')
    if (!isDismissed && window.innerWidth < 768) {
      setShow(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    setShow(false)
    sessionStorage.setItem('mobile-notice-dismissed', 'true')
  }

  if (!show || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{
          position: 'fixed', bottom: '20px', left: '16px', right: '16px',
          zIndex: 9999, background: '#111118',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '18px', padding: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
        }}>
        <button onClick={handleDismiss}
          style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px' }}>
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Monitor size={22} color="#6366F1" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>
              You're on a mobile device 📱
            </p>
            <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6, marginBottom: '14px' }}>
              Pavroll is crafted for the expansive canvas of a laptop or desktop screen — where every payroll detail, chart, and employee record breathes freely. For the richest, most productive experience, we recommend switching to a larger display.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleDismiss}
                style={{ flex: 1, padding: '9px', borderRadius: '9px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                Got it, continue anyway
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
