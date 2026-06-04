'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, Calendar, User, LogOut, Zap } from 'lucide-react'

const navItems = [
  { href: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/employee/payslips', icon: FileText, label: 'My Payslips' },
  { href: '/employee/leave', icon: Calendar, label: 'My Leave' },
  { href: '/employee/profile', icon: User, label: 'My Profile' },
]

export default function ESSLayout({ children, title }: { children: React.ReactNode, title: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [employee, setEmployee] = useState<{ name: string, email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ess_employee')
    if (!stored) { router.push('/employee'); return }
    setEmployee(JSON.parse(stored))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('ess_employee')
    router.push('/employee')
  }

  if (!employee) return null

  const initials = employee.name.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0F' }}>
      {/* Sidebar */}
      <aside className="ess-sidebar" style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'rgba(10,10,15,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 40 }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>Pav<span style={{ color: '#6366F1' }}>roll</span></p>
            <p style={{ fontSize: '10px', color: '#475569' }}>Employee Portal</p>
          </div>
        </div>

        {/* Employee card */}
        <div style={{ margin: '0 12px 16px', padding: '12px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.name}</p>
              <p style={{ fontSize: '11px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
                    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                    border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                    color: active ? '#818CF8' : '#64748B' }}>
                  <item.icon size={16} />
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 8px 20px' }}>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', width: '100%', background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ess-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: '240px' }}>
        {/* Topbar */}
        <div style={{ padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC' }}>{title}</h1>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '1px' }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ fontSize: '12px', color: '#475569' }}>
            Employee Portal
          </div>
        </div>

        {/* Content */}
        <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="ess-content grid-bg"
          style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {children}
        </motion.main>
      </div>
    </div>
  )
}

<style>{`
  @media (max-width: 768px) {
    .ess-sidebar { display: none !important; }
    .ess-main { margin-left: 0 !important; }
    .ess-content { padding: 16px !important; }
  }
`}</style>