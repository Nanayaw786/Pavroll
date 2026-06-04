'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, CreditCard, FileText,
  Calendar, BarChart3, Settings, LogOut, Zap,
  Shield, UserX, Menu, X
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/employees', icon: Users, label: 'Employees' },
  { href: '/payroll', icon: CreditCard, label: 'Payroll' },
  { href: '/payslips', icon: FileText, label: 'Payslips' },
  { href: '/leave', icon: Calendar, label: 'Leave' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/audit', icon: Shield, label: 'Audit Trail' },
  { href: '/offboarding', icon: UserX, label: 'Offboarding' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
            Pav<span style={{ color: '#6366F1' }}>roll</span>
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                  color: active ? '#818CF8' : '#64748B' }}>
                <item.icon size={16} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
                {active && <motion.div layoutId="activeIndicator" style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#6366F1' }} />}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ margin: '0 4px 4px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#818CF8' }}>Starter Plan</p>
          <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>Upgrade for more features</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', cursor: 'pointer', color: '#475569' }}>
          <LogOut size={16} />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Sign Out</span>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="desktop-sidebar" style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: '240px', background: 'rgba(10,10,15,0.97)', borderRight: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', zIndex: 50 }}>
        <SidebarContent />
      </aside>

      {/* Mobile hamburger button */}
      <button className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        style={{ display: 'none', position: 'fixed', top: '14px', left: '16px', zIndex: 60, background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#F8FAFC' }}>
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 55, backdropFilter: 'blur(4px)' }} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: '260px', background: 'rgba(10,10,15,0.99)', borderRight: '1px solid rgba(255,255,255,0.08)', zIndex: 60 }}>
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
