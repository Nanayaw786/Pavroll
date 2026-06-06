'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import {
  Zap, Building2, Users, CreditCard, MessageSquare, BarChart3,
  Shield, Settings, LogOut, Bell, TrendingUp, Activity,
  CheckCircle, XCircle, Clock, ToggleLeft, ToggleRight,
  Mail, Phone, Eye, RefreshCw, Loader2, Crown, AlertTriangle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Company = {
  id: string
  name: string
  email: string
  phone: string
  plan: string
  trial_ends_at: string
  is_active: boolean
  features: Record<string, boolean>
  created_at: string
}

const FEATURE_LIST = [
  { key: 'loan_module', label: 'Loan & Salary Advance', desc: 'Employee loan management' },
  { key: 'bonus_payroll', label: '13th Month / Bonus', desc: 'Bonus payroll processing' },
  { key: 'variance_alerts', label: 'Payroll Variance Alerts', desc: 'Detect unusual payroll changes' },
  { key: 'custom_reports', label: 'Custom Reports', desc: 'Advanced reporting module' },
  { key: 'bulk_sms', label: 'Bulk SMS', desc: 'SMS notifications' },
  { key: 'ess_portal', label: 'ESS Portal', desc: 'Employee self-service' },
  { key: 'offboarding', label: 'Offboarding Module', desc: 'Employee exit management' },
  { key: 'sender_id', label: 'Custom Sender ID', desc: 'Branded SMS sender' },
  { key: 'multi_currency', label: 'Multi Currency', desc: 'USD, EUR support' },
]

const PLAN_COLORS: Record<string, string> = {
  trial: '#F59E0B',
  starter: '#6366F1',
  growth: '#10B981',
  business: '#EF4444',
}

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'companies', label: 'Companies', icon: Building2 },
  { key: 'features', label: 'Feature Flags', icon: ToggleRight },
  { key: 'senderids', label: 'Sender IDs', icon: MessageSquare },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'support', label: 'Support', icon: Mail },
  { key: 'settings', label: 'System', icon: Settings },
]

export default function SuperAdminPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [tab, setTab] = useState('overview')
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [result, setResult] = useState<{ success: boolean, message: string } | null>(null)
  const [senderIds, setSenderIds] = useState<any[]>([])
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: companiesData } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
      if (companiesData) setCompanies(companiesData as Company[])
      const { data: senderData } = await supabase.from('sender_id_requests').select('*').order('created_at', { ascending: false })
      if (senderData) setSenderIds(senderData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = async (companyId: string, feature: string, current: boolean) => {
    setToggling(companyId + feature)
    try {
      const company = companies.find(c => c.id === companyId)
      if (!company) return
      const updatedFeatures = { ...company.features, [feature]: !current }
      await supabase.from('companies').update({ features: updatedFeatures }).eq('id', companyId)
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, features: updatedFeatures } : c))
      if (selectedCompany?.id === companyId) setSelectedCompany(prev => prev ? { ...prev, features: updatedFeatures } : null)
      setResult({ success: true, message: `${feature} ${!current ? 'enabled' : 'disabled'} for ${company.name}` })
      setTimeout(() => setResult(null), 3000)
    } catch (err) {
      setResult({ success: false, message: 'Failed to toggle feature' })
    } finally {
      setToggling(null)
    }
  }

  const updatePlan = async (companyId: string, plan: string) => {
    await supabase.from('companies').update({ plan }).eq('id', companyId)
    setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, plan } : c))
    setResult({ success: true, message: `Plan updated to ${plan}` })
    setTimeout(() => setResult(null), 3000)
  }

  const approveSenderId = async (id: string, status: 'approved' | 'rejected') => {
    await supabase.from('sender_id_requests').update({ status }).eq('id', id)
    setSenderIds(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    setResult({ success: true, message: `Sender ID ${status}!` })
    setTimeout(() => setResult(null), 3000)
  }

  const stats = {
    totalCompanies: companies.length,
    onTrial: companies.filter(c => c.plan === 'trial').length,
    paying: companies.filter(c => c.plan !== 'trial').length,
    mrr: companies.filter(c => c.plan === 'starter').length * 120 +
      companies.filter(c => c.plan === 'growth').length * 350 +
      companies.filter(c => c.plan === 'business').length * 800,
    pendingSenderIds: senderIds.filter(s => s.status === 'pending').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: '#F8FAFC', fontFamily: 'Inter, sans-serif', display: 'flex' }}>

      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0A0A0F', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg,#EF4444,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={14} color="white" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#F8FAFC' }}>Control Center</span>
          </div>
          <p style={{ fontSize: '10px', color: '#475569', marginLeft: '36px' }}>Pavroll Super Admin</p>
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => setTab(item.key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', marginBottom: '2px', transition: 'all 0.15s', textAlign: 'left',
                background: tab === item.key ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: tab === item.key ? '#EF4444' : '#64748B' }}>
              <item.icon size={15} />
              <span style={{ fontSize: '13px', fontWeight: tab === item.key ? 600 : 400 }}>{item.label}</span>
              {item.key === 'senderids' && stats.pendingSenderIds > 0 && (
                <span style={{ marginLeft: 'auto', background: '#EF4444', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '999px' }}>{stats.pendingSenderIds}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', marginBottom: '4px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#EF4444' }}>
              {user?.firstName?.[0] || 'S'}
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#F8FAFC' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '10px', color: '#475569' }}>Super Admin</p>
            </div>
          </div>
          <button onClick={() => signOut({ redirectUrl: '/' })}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#475569', fontSize: '12px', cursor: 'pointer' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: '220px', flex: 1, padding: '24px', minHeight: '100vh' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#F8FAFC' }}>
              {NAV_ITEMS.find(n => n.key === tab)?.label}
            </h1>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
              Pavroll Control Center • {new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: maintenanceMode ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${maintenanceMode ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: maintenanceMode ? '#EF4444' : '#10B981', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: maintenanceMode ? '#EF4444' : '#10B981' }}>{maintenanceMode ? 'Maintenance' : 'All Systems Operational'}</span>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} onClick={loadData}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
              <RefreshCw size={13} /> Refresh
            </motion.button>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
              <Eye size={13} /> View App
            </Link>
          </div>
        </div>

        {/* Result alert */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              {result.success ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
              <span style={{ fontSize: '13px', color: result.success ? '#10B981' : '#EF4444', fontWeight: 500 }}>{result.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && (
          <div style={{ padding: '80px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Loader2 size={24} color="#EF4444" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#475569' }}>Loading control center...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
                  {[
                    { label: 'Total Companies', value: stats.totalCompanies, color: '#6366F1', bg: 'rgba(99,102,241,0.08)', icon: Building2 },
                    { label: 'On Trial', value: stats.onTrial, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: Clock },
                    { label: 'Paying Clients', value: stats.paying, color: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: CreditCard },
                    { label: 'Monthly Revenue', value: `GHS ${stats.mrr.toLocaleString()}`, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: TrendingUp },
                    { label: 'Pending Sender IDs', value: stats.pendingSenderIds, color: '#06B6D4', bg: 'rgba(6,182,212,0.08)', icon: MessageSquare },
                  ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <s.icon size={16} color={s.color} />
                      </div>
                      <p style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</p>
                      <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{s.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Recent companies */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '14px' }}>All Companies</h3>
                    <span style={{ fontSize: '11px', color: '#475569' }}>{companies.length} total</span>
                  </div>
                  {companies.map((company, i) => {
                    const trialEnds = company.trial_ends_at ? new Date(company.trial_ends_at) : null
                    const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
                    const planColor = PLAN_COLORS[company.plan] || '#6366F1'
                    return (
                      <motion.div key={company.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${planColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: planColor, flexShrink: 0 }}>
                          {company.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: '140px' }}>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>{company.name}</p>
                          <p style={{ fontSize: '11px', color: '#475569' }}>{company.email}</p>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: `${planColor}15`, color: planColor, border: `1px solid ${planColor}25` }}>
                          {company.plan?.toUpperCase()}
                        </span>
                        {company.plan === 'trial' && (
                          <span style={{ fontSize: '11px', color: daysLeft <= 7 ? '#EF4444' : '#F59E0B' }}>
                            {daysLeft}d left
                          </span>
                        )}
                        <select value={company.plan} onChange={e => updatePlan(company.id, e.target.value)}
                          style={{ padding: '5px 10px', borderRadius: '7px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '11px', outline: 'none', cursor: 'pointer' }}>
                          {['trial', 'starter', 'growth', 'business'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <button onClick={() => { setSelectedCompany(company); setTab('features') }}
                          style={{ padding: '5px 12px', borderRadius: '7px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>
                          Features →
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* COMPANIES TAB */}
            {tab === 'companies' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {companies.map((company, i) => {
                  const planColor = PLAN_COLORS[company.plan] || '#6366F1'
                  const trialEnds = company.trial_ends_at ? new Date(company.trial_ends_at) : null
                  const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
                  return (
                    <motion.div key={company.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${planColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: planColor }}>
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>{company.name}</h3>
                            <p style={{ fontSize: '12px', color: '#475569' }}>ID: {company.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', background: `${planColor}15`, color: planColor }}>
                            {company.plan?.toUpperCase()}
                          </span>
                          <select value={company.plan} onChange={e => updatePlan(company.id, e.target.value)}
                            style={{ padding: '6px 12px', borderRadius: '8px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                            {['trial', 'starter', 'growth', 'business'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {[
                          { label: 'Email', value: company.email || 'N/A', icon: Mail },
                          { label: 'Phone', value: company.phone || 'N/A', icon: Phone },
                          { label: 'Trial Ends', value: company.plan === 'trial' ? `${daysLeft} days left` : 'Paid plan', icon: Clock },
                        ].map(item => (
                          <div key={item.label} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>{item.label}</p>
                            <p style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 500 }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* FEATURE FLAGS TAB */}
            {tab === 'features' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Company selector */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px 20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', display: 'block', marginBottom: '8px' }}>Select Company</label>
                  <select value={selectedCompany?.id || ''} onChange={e => setSelectedCompany(companies.find(c => c.id === e.target.value) || null)}
                    style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', width: '100%', maxWidth: '400px', cursor: 'pointer' }}>
                    <option value="">-- Select a company --</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.plan})</option>)}
                  </select>
                </div>

                {selectedCompany && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '15px' }}>{selectedCompany.name}</h3>
                        <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Toggle features on/off for this company</p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', background: `${PLAN_COLORS[selectedCompany.plan] || '#6366F1'}15`, color: PLAN_COLORS[selectedCompany.plan] || '#6366F1' }}>
                        {selectedCompany.plan?.toUpperCase()}
                      </span>
                    </div>
                    {FEATURE_LIST.map((feature, i) => {
                      const isEnabled = selectedCompany.features?.[feature.key] ?? false
                      const isLoading = toggling === selectedCompany.id + feature.key
                      return (
                        <motion.div key={feature.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                          style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>{feature.label}</p>
                            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{feature.desc}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: isEnabled ? '#10B981' : '#475569' }}>
                              {isEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => toggleFeature(selectedCompany.id, feature.key, isEnabled)}
                              disabled={!!isLoading}
                              style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                                background: isEnabled ? '#10B981' : 'rgba(255,255,255,0.1)',
                                opacity: isLoading ? 0.7 : 1 }}>
                              {isLoading ? (
                                <Loader2 size={12} color="white" style={{ animation: 'spin 1s linear infinite', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                              ) : (
                                <div style={{ position: 'absolute', top: '3px', left: isEnabled ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}

                {!selectedCompany && (
                  <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                    <ToggleRight size={40} color="#475569" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#475569', fontSize: '14px' }}>Select a company above to manage their features</p>
                  </div>
                )}
              </div>
            )}

            {/* SENDER IDs TAB */}
            {tab === 'senderids' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                  <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '14px' }}>Sender ID Requests</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{stats.pendingSenderIds} pending approval</p>
                </div>
                {senderIds.length === 0 && (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <MessageSquare size={36} color="#475569" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#475569', fontSize: '14px' }}>No Sender ID requests yet</p>
                  </div>
                )}
                {senderIds.map((req, i) => (
                  <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#F8FAFC', fontFamily: 'monospace' }}>{req.sender_id}</p>
                      <p style={{ fontSize: '12px', color: '#475569' }}>{req.company_name} • {req.purpose}</p>
                      <p style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px',
                      background: req.status === 'approved' ? 'rgba(16,185,129,0.1)' : req.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: req.status === 'approved' ? '#10B981' : req.status === 'rejected' ? '#EF4444' : '#F59E0B' }}>
                      {req.status}
                    </span>
                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <motion.button whileHover={{ scale: 1.02 }} onClick={() => approveSenderId(req.id, 'approved')}
                          style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                          ✓ Approve
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} onClick={() => approveSenderId(req.id, 'rejected')}
                          style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                          ✗ Reject
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* USERS TAB */}
            {tab === 'users' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                <Users size={40} color="#475569" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>All Users</p>
                <p style={{ color: '#475569', fontSize: '13px', marginBottom: '20px' }}>User management across all companies coming soon.</p>
                <p style={{ color: '#475569', fontSize: '12px' }}>Total companies: {companies.length}</p>
              </div>
            )}

            {/* SUPPORT TAB */}
            {tab === 'support' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
                <Mail size={40} color="#475569" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Support Inbox</p>
                <p style={{ color: '#475569', fontSize: '13px', marginBottom: '20px' }}>All contact form submissions go to hello.pavroll@proton.me</p>
                <a href="mailto:hello.pavroll@proton.me"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: '#6366F1', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  <Mail size={14} /> Open Inbox
                </a>
              </div>
            )}

            {/* SYSTEM TAB */}
            {tab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '20px' }}>System Settings</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {[
                      { label: 'Maintenance Mode', desc: 'Take Pavroll offline for maintenance', value: maintenanceMode, onChange: () => setMaintenanceMode(!maintenanceMode), danger: true },
                      { label: 'New Signups', desc: 'Allow new companies to sign up', value: true, onChange: () => {}, danger: false },
                      { label: 'SMS Notifications', desc: 'Global SMS sending enabled', value: true, onChange: () => {}, danger: false },
                      { label: 'Email Notifications', desc: 'Global email sending enabled', value: true, onChange: () => {}, danger: false },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: item.danger ? '#EF4444' : '#F8FAFC' }}>{item.label}</p>
                          <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{item.desc}</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={item.onChange}
                          style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative', background: item.value ? (item.danger ? '#EF4444' : '#10B981') : 'rgba(255,255,255,0.1)' }}>
                          <div style={{ position: 'absolute', top: '2px', left: item.value ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <AlertTriangle size={18} color="#EF4444" />
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#EF4444' }}>Danger Zone</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>These actions are irreversible. Proceed with extreme caution.</p>
                  <button style={{ padding: '9px 18px', borderRadius: '9px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Clear All Trial Data
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}
