'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Eye, EyeOff, Lock, Mail } from 'lucide-react'

const mockEmployees = [



  { id: '4', email: 'akosua@company.com', password: 'pass123', name: 'Akosua Boateng' },
]

export default function EmployeeLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setError('')
    setLoading(true)
    setTimeout(() => {
      const emp = mockEmployees.find(e => e.email === email && e.password === password)
      if (emp) {
        localStorage.setItem('ess_employee', JSON.stringify(emp))
        router.push('/employee/dashboard')
      } else {
        setError('Invalid email or password')
        setLoading(false)
      }
    }, 1000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      className="grid-bg">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Zap size={22} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC' }}>Pav<span style={{ color: '#6366F1' }}>roll</span></h1>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>Employee Self-Service Portal</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>Sign in to view your payslips and leave</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Work Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                <Mail size={15} color="#475569" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="kwame@company.com" type="email"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F8FAFC', fontSize: '13px', width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Password</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                <Lock size={15} color="#475569" />
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type={showPass ? 'text' : 'password'}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F8FAFC', fontSize: '13px', flex: 1 }} />
                <button onClick={() => setShowPass(!showPass)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p style={{ fontSize: '12px', color: '#EF4444' }}>{error}</p>}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogin} disabled={loading}
              style={{ padding: '12px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '4px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </div>

          <div style={{ marginTop: '20px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p style={{ fontSize: '11px', color: '#818CF8', fontWeight: 600, marginBottom: '4px' }}>Demo credentials</p>

            <p style={{ fontSize: '11px', color: '#475569' }}>Password: pass123</p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#475569', marginTop: '20px' }}>
          Are you an admin? <a href="/dashboard" style={{ color: '#6366F1', textDecoration: 'none' }}>Go to Admin Dashboard</a>
        </p>
      </motion.div>
    </div>
  )
}
