'use client'
import { motion } from 'framer-motion'
import { Bell, Search, ChevronDown } from 'lucide-react'

export default function Topbar({ title }: { title: string }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div className="topbar-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px' }}>
        {/* Title */}
        <div className="topbar-title">
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>{title}</h1>
          <p className="topbar-date" style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search — hidden on mobile */}
          <div className="topbar-search" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', width: '180px' }}>
            <Search size={13} color="#475569" />
            <input placeholder="Search..." className="bg-transparent text-sm outline-none w-full"
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#94A3B8', fontSize: '13px', width: '100%' }} />
          </div>

          {/* Notifications */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', flexShrink: 0 }}>
            <Bell size={15} color="#94A3B8" />
            <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', background: '#6366F1' }} />
          </motion.button>

          {/* Avatar */}
          <motion.div whileHover={{ scale: 1.02 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>A</div>
            <span className="topbar-admin" style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>Admin</span>
            <ChevronDown size={13} color="#475569" />
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .topbar-inner { padding: 12px 16px 12px 52px !important; }
          .topbar-search { display: none !important; }
          .topbar-admin { display: none !important; }
          .topbar-date { display: none !important; }
          .topbar-title h1 { font-size: 16px !important; }
        }
      `}</style>
    </motion.header>
  )
}
