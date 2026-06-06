'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, Zap, Clock } from 'lucide-react'
import Link from 'next/link'
import { getTrialStatus, getTrialBannerColor, getTrialMessage, type TrialStatus } from '@/lib/trial'
import { getCompanyId } from '@/lib/employees'

export default function TrialBanner() {
  const [trial, setTrial] = useState<TrialStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    loadTrial()
  }, [])

  const loadTrial = async () => {
    try {
      const cId = await getCompanyId()
      const status = await getTrialStatus(cId)
      setTrial(status)
    } catch (err) {
      console.error(err)
    }
  }

  if (!trial || !trial.isTrial || trial.isExpired || dismissed) return null

  const color = getTrialBannerColor(trial.daysLeft)
  const message = getTrialMessage(trial.daysLeft)
  const isUrgent = trial.daysLeft <= 7

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.3 }}
        style={{ background: `${color}12`, borderBottom: `1px solid ${color}25`, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={14} color={color} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{message}</p>
            {trial.trialEndsAt && (
              <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>
                Trial ends {new Date(trial.trialEndsAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/settings?tab=billing">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '8px', background: color, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}>
              <Zap size={12} fill="white" /> Upgrade Now
            </motion.div>
          </Link>
          {!isUrgent && (
            <button onClick={() => setDismissed(true)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px', display: 'flex', alignItems: 'center' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
