'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import {
  Zap, Building2, Users, CreditCard, MessageSquare, BarChart3,
  Shield, Settings, LogOut, Bell, TrendingUp, Activity,
  CheckCircle, XCircle, Clock, ToggleRight, Mail, Phone,
  Eye, RefreshCw, Loader2, Crown, AlertTriangle, Calculator,
  Megaphone, DollarSign, PieChart, ArrowUp, ArrowDown,
  Star, Zap as ZapIcon, Globe, Database, Server
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { calculatePayroll, DEFAULT_SETTINGS } from '@/lib/payroll'
import { getAnalyticsSummary } from '@/lib/analytics'

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
  // Core Premium Features (ON by default)
  { key: 'payslips', label: 'Payslips', desc: 'PDF payslip generation and email delivery', default: true },
  { key: 'leave', label: 'Leave Management', desc: 'Leave requests, approvals and balances', default: true },
  { key: 'reports', label: 'Reports', desc: 'Payroll reports and CSV export', default: true },
  { key: 'audit_trail', label: 'Audit Trail', desc: 'Complete action history and compliance logs', default: true },
  { key: 'offboarding', label: 'Offboarding Module', desc: 'Employee exit, gratuity and clearance', default: true },
  { key: 'bulk_sms', label: 'Bulk SMS', desc: 'SMS notifications to employees', default: true },
  { key: 'calculator', label: 'Payroll Calculator', desc: 'PAYE, SSNIT, Net Pay calculator', default: true },
  { key: 'team', label: 'Team Management', desc: 'Multi-user roles and permissions', default: true },
  { key: 'ess_portal', label: 'ESS Portal', desc: 'Employee self-service portal', default: true },
  { key: 'sender_id', label: 'Custom Sender ID', desc: 'Branded SMS sender name', default: true },
  // Advanced Features (OFF by default)
  { key: 'loan_module', label: 'Loan & Salary Advance', desc: 'Employee loan management and deductions', default: false },
  { key: 'bonus_payroll', label: '13th Month / Bonus Payroll', desc: 'Bonus and 13th month processing', default: false },
  { key: 'variance_alerts', label: 'Payroll Variance Alerts', desc: 'Detect unusual payroll changes automatically', default: false },
  { key: 'custom_reports', label: 'Custom Reports', desc: 'Advanced custom reporting module', default: false },
  { key: 'multi_currency', label: 'Multi Currency', desc: 'USD, EUR and other currency support', default: false },
]

const PLAN_COLORS: Record<string, string> = {
  trial: '#F59E0B',
  starter: '#6366F1',
  growth: '#10B981',
  business: '#EF4444',
}

const PLAN_PRICES: Record<string, number> = {
  trial: 0, starter: 120, growth: 350, business: 800,
}

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'analytics', label: 'Analytics', icon: PieChart },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'companies', label: 'Companies', icon: Building2 },
  { key: 'features', label: 'Feature Flags', icon: ToggleRight },
  { key: 'calculator', label: 'Calculator', icon: Calculator },
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
  { key: 'senderids', label: 'Sender IDs', icon: MessageSquare },
  { key: 'revenue', label: 'Revenue', icon: DollarSign },
  { key: 'system', label: 'System', icon: Server },
  { key: 'support', label: 'Support', icon: Mail },
]

// Calculator components
function fmt(n: number) { return `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

function AdminCalculator() {
  const [calcType, setCalcType] = useState('netpay')
  const [salary, setSalary] = useState('')
  const [result, setResult] = useState<any>(null)
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [history, setHistory] = useState<string[]>([])

  const calculate = () => {
    const s = parseFloat(salary)
    if (!s) return
    const res = calculatePayroll(s, DEFAULT_SETTINGS)
    setResult(res)
  }

  const handleBasicBtn = (btn: string) => {
    if (btn === 'C') { setDisplay('0'); setExpression(''); return }
    if (btn === '⌫') { setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0'); return }
    if (btn === '=') {
      try {
        const expr = expression + display
        const res = Function('"use strict"; return (' + expr.replace('×', '*').replace('÷', '/') + ')')()
        const resultStr = parseFloat(res.toFixed(10)).toString()
        setHistory(prev => [`${expr} = ${resultStr}`, ...prev.slice(0, 9)])
        setDisplay(resultStr); setExpression('')
      } catch { setDisplay('Error') }
      return
    }
    if (['+', '-', '×', '÷'].includes(btn)) { setExpression(prev => prev + display + btn); setDisplay('0'); return }
    if (btn === '.' && display.includes('.')) return
    setDisplay(prev => prev === '0' && btn !== '.' ? btn : prev + btn)
  }

  const btnColors: Record<string, string> = {
    'C': '#EF4444', '÷': '#F59E0B', '×': '#F59E0B', '-': '#F59E0B', '+': '#F59E0B', '=': '#10B981',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[
          { key: 'basic', label: 'Basic' },
          { key: 'netpay', label: 'Net Pay' },
          { key: 'paye', label: 'PAYE' },
          { key: 'ssnit', label: 'SSNIT' },
          { key: 'reverse', label: 'Reverse' },
          { key: 'gratuity', label: 'Gratuity' },
          { key: 'loan', label: 'Loan' },
        ].map(t => (
          <button key={t.key} onClick={() => { setCalcType(t.key); setResult(null) }}
            style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 500,
              background: calcType === t.key ? '#EF4444' : 'rgba(255,255,255,0.06)',
              color: calcType === t.key ? '#fff' : '#64748B' }}>
            {t.label}
          </button>
        ))}
      </div>

      {calcType === 'basic' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)' }}>
              <p style={{ fontSize: '11px', color: '#475569', textAlign: 'right', minHeight: '16px' }}>{expression}</p>
              <p style={{ fontSize: '36px', fontWeight: 700, color: '#F8FAFC', textAlign: 'right' }}>{display}</p>
            </div>
            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[['C', '±', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '-'], ['1', '2', '3', '+'], ['0', '.', '⌫', '=']].flat().map((btn, i) => (
                <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => handleBasicBtn(btn)}
                  style={{ padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 600,
                    background: btnColors[btn] ? `${btnColors[btn]}20` : 'rgba(255,255,255,0.06)',
                    color: btnColors[btn] || '#F8FAFC',
                    gridColumn: btn === '0' ? 'span 2' : 'span 1' }}>
                  {btn}
                </motion.button>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ fontSize: '11px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>History</p>
            {history.length === 0 && <p style={{ fontSize: '11px', color: '#334155', textAlign: 'center', padding: '16px 0' }}>No history</p>}
            {history.map((h, i) => <p key={i} style={{ fontSize: '11px', color: i === 0 ? '#F8FAFC' : '#475569', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'monospace' }}>{h}</p>)}
          </div>
        </div>
      )}

      {calcType !== 'basic' && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px', maxWidth: '480px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>Monthly Basic Salary (GHS)</label>
              <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="5000"
                style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} onClick={calculate}
              style={{ padding: '10px', borderRadius: '10px', background: '#EF4444', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Calculate
            </motion.button>
          </div>
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Gross Salary', value: fmt(result.grossSalary), color: '#6366F1' },
                { label: 'SSNIT (Employee 5.5%)', value: `- ${fmt(result.ssnitEmployee)}`, color: '#F59E0B' },
                { label: 'SSNIT (Employer 13%)', value: fmt(result.ssnitEmployer), color: '#06B6D4' },
                { label: 'Tier 2 (Employer 5%)', value: fmt(result.tier2Employer), color: '#8B5CF6' },
                { label: 'PAYE Tax', value: `- ${fmt(result.paye)}`, color: '#EF4444' },
                { label: 'Total Deductions', value: fmt(result.totalDeductions), color: '#F59E0B' },
                { label: 'NET PAY', value: fmt(result.netPay), color: '#10B981' },
                { label: 'Effective Tax Rate', value: `${result.effectiveTaxRate}%`, color: '#94A3B8' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', color: item.color, fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

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
  const [announcement, setAnnouncement] = useState({ title: '', message: '', type: 'info' })
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  useEffect(() => { loadData(); loadAnalytics() }, [])

  const loadAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const data = await getAnalyticsSummary()
      setAnalyticsData(data)
    } catch (err) { console.error(err) }
    finally { setLoadingAnalytics(false) }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: companiesData } = await supabase.from('companies').select('*').order('created_at', { ascending: false })
      if (companiesData) setCompanies(companiesData as Company[])
      const { data: senderData } = await supabase.from('sender_id_requests').select('*').order('created_at', { ascending: false })
      if (senderData) setSenderIds(senderData)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
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
    } catch { setResult({ success: false, message: 'Failed to toggle feature' }) }
    finally { setToggling(null) }
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

  const sendAnnouncement = async () => {
    if (!announcement.title || !announcement.message) return
    setSendingAnnouncement(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Pavroll Team',
          email: 'hello.pavroll@proton.me',
          company: 'Pavroll',
          subject: `[Pavroll Announcement] ${announcement.title}`,
          message: `${announcement.message}\n\n— The Pavroll Team\nhello.pavroll@proton.me\n+233 53 929 9311`,
        })
      })
      setResult({ success: true, message: 'Announcement sent to all companies!' })
      setAnnouncement({ title: '', message: '', type: 'info' })
      setTimeout(() => setResult(null), 4000)
    } catch { setResult({ success: false, message: 'Failed to send announcement' }) }
    finally { setSendingAnnouncement(false) }
  }

  const stats = {
    totalCompanies: companies.length,
    onTrial: companies.filter(c => c.plan === 'trial').length,
    paying: companies.filter(c => c.plan !== 'trial').length,
    mrr: companies.reduce((sum, c) => sum + (PLAN_PRICES[c.plan] || 0), 0),
    arr: companies.reduce((sum, c) => sum + (PLAN_PRICES[c.plan] || 0), 0) * 12,
    pendingSenderIds: senderIds.filter(s => s.status === 'pending').length,
    starter: companies.filter(c => c.plan === 'starter').length,
    growth: companies.filter(c => c.plan === 'growth').length,
    business: companies.filter(c => c.plan === 'business').length,
    trialExpiring: companies.filter(c => {
      if (c.plan !== 'trial') return false
      const days = Math.ceil((new Date(c.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return days <= 7 && days >= 0
    }).length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: '#F8FAFC', fontFamily: 'Inter, sans-serif', display: 'flex' }}>

      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0A0A0F', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50, overflowY: 'auto' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg,#EF4444,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={14} color="white" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#F8FAFC' }}>Control Center</span>
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
              {item.key === 'announcements' && (
                <span style={{ marginLeft: 'auto', background: '#F59E0B', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '999px' }}>NEW</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '8px 12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#EF4444' }}>
              {user?.firstName?.[0] || 'S'}
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#F8FAFC' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: '10px', color: '#EF4444' }}>Super Admin 👑</p>
            </div>
          </div>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderRadius: '8px', color: '#475569', fontSize: '12px', textDecoration: 'none', marginBottom: '2px' }}>
            <Eye size={13} /> View App
          </Link>
          <button onClick={() => signOut({ redirectUrl: '/' })}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#475569', fontSize: '12px', cursor: 'pointer' }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: '220px', flex: 1, padding: '24px', minHeight: '100vh' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC' }}>{NAV_ITEMS.find(n => n.key === tab)?.label}</h1>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
              Pavroll Control Center • {new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: maintenanceMode ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${maintenanceMode ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: maintenanceMode ? '#EF4444' : '#10B981', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: maintenanceMode ? '#EF4444' : '#10B981' }}>{maintenanceMode ? 'Maintenance' : 'All Systems Go'}</span>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} onClick={loadData}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}>
              <RefreshCw size={13} /> Refresh
            </motion.button>
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
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Main stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                  {[
                    { label: 'Total Companies', value: stats.totalCompanies, color: '#6366F1', bg: 'rgba(99,102,241,0.08)', icon: Building2, sub: `${stats.paying} paying` },
                    { label: 'Monthly Revenue', value: `GHS ${stats.mrr.toLocaleString()}`, color: '#10B981', bg: 'rgba(16,185,129,0.08)', icon: DollarSign, sub: `GHS ${stats.arr.toLocaleString()} ARR` },
                    { label: 'On Trial', value: stats.onTrial, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: Clock, sub: `${stats.trialExpiring} expiring soon` },
                    { label: 'Pending Sender IDs', value: stats.pendingSenderIds, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', icon: MessageSquare, sub: 'Need approval' },
                  ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '18px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <s.icon size={16} color={s.color} />
                        <span style={{ fontSize: '10px', color: s.color, background: `${s.color}15`, padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>{s.sub}</span>
                      </div>
                      <p style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</p>
                      <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{s.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Plan breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {[
                    { label: 'Trial', count: stats.onTrial, revenue: 0, color: '#F59E0B' },
                    { label: 'Starter (GHS 120)', count: stats.starter, revenue: stats.starter * 120, color: '#6366F1' },
                    { label: 'Growth (GHS 350)', count: stats.growth, revenue: stats.growth * 350, color: '#10B981' },
                    { label: 'Business (GHS 800)', count: stats.business, revenue: stats.business * 800, color: '#EF4444' },
                  ].map(plan => (
                    <div key={plan.label} style={{ padding: '16px', borderRadius: '12px', background: `${plan.color}08`, border: `1px solid ${plan.color}20`, textAlign: 'center' }}>
                      <p style={{ fontSize: '28px', fontWeight: 800, color: plan.color }}>{plan.count}</p>
                      <p style={{ fontSize: '11px', color: '#475569', marginBottom: '6px' }}>{plan.label}</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>GHS {plan.revenue.toLocaleString()}/mo</p>
                    </div>
                  ))}
                </div>

                {/* Companies list */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '14px' }}>All Companies</h3>
                    <span style={{ fontSize: '11px', color: '#475569' }}>{companies.length} total</span>
                  </div>
                  {companies.map((company, i) => {
                    const trialEnds = company.trial_ends_at ? new Date(company.trial_ends_at) : null
                    const daysLeft = trialEnds ? Math.max(0, Math.ceil((trialEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
                    const planColor = PLAN_COLORS[company.plan] || '#6366F1'
                    return (
                      <motion.div key={company.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${planColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: planColor, flexShrink: 0 }}>
                          {company.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{company.name}</p>
                          <p style={{ fontSize: '11px', color: '#475569' }}>{company.email}</p>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: `${planColor}15`, color: planColor }}>
                          {company.plan?.toUpperCase()}
                        </span>
                        {company.plan === 'trial' && (
                          <span style={{ fontSize: '11px', color: daysLeft <= 7 ? '#EF4444' : '#F59E0B', fontWeight: 600 }}>{daysLeft}d left</span>
                        )}
                        <select value={company.plan} onChange={e => updatePlan(company.id, e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '6px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '11px', outline: 'none', cursor: 'pointer' }}>
                          {['trial', 'starter', 'growth', 'business'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <button onClick={() => { setSelectedCompany(company); setTab('features') }}
                          style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: '11px', cursor: 'pointer' }}>
                          Features →
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ACTIVITY TAB */}
            {tab === 'activity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {loadingAnalytics ? (
                  <div style={{ padding: '60px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <Loader2 size={24} color="#EF4444" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: '#475569' }}>Loading activity data...</span>
                  </div>
                ) : !analyticsData ? (
                  <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                    <Activity size={40} color="#475569" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#F8FAFC', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>No Activity Yet</p>
                    <p style={{ color: '#475569', fontSize: '13px' }}>Activity will appear here as companies use Pavroll</p>
                  </div>
                ) : (
                  <>
                    {/* Activity stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {[
                        { label: 'Total Events', value: analyticsData.total, color: '#6366F1', icon: Activity },
                        { label: 'Today', value: analyticsData.today, color: '#10B981', icon: TrendingUp },
                        { label: 'This Week', value: analyticsData.thisWeek, color: '#F59E0B', icon: BarChart3 },
                        { label: 'This Month', value: analyticsData.thisMonth, color: '#06B6D4', icon: PieChart },
                        { label: 'Active Companies', value: analyticsData.activeCompanies, color: '#8B5CF6', icon: Building2 },
                        { label: 'Growth vs Last Month', value: `${analyticsData.growth > 0 ? '+' : ''}${analyticsData.growth}%`, color: analyticsData.growth >= 0 ? '#10B981' : '#EF4444', icon: TrendingUp },
                      ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                          style={{ padding: '16px 18px', borderRadius: '14px', background: `${s.color}08`, border: `1px solid ${s.color}20`, display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <s.icon size={18} color={s.color} />
                          </div>
                          <div>
                            <p style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</p>
                            <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>{s.label}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Daily activity chart */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '20px' }}>Daily Activity — Last 7 Days</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '120px' }}>
                        {analyticsData.dailyActivity.map((day: any, i: number) => {
                          const maxEvents = Math.max(...analyticsData.dailyActivity.map((d: any) => d.events), 1)
                          const height = Math.max(4, (day.events / maxEvents) * 100)
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                              <p style={{ fontSize: '10px', color: '#475569', fontWeight: 600 }}>{day.events}</p>
                              <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: i * 0.08, duration: 0.5 }}
                                style={{ width: '100%', borderRadius: '4px', background: 'linear-gradient(to top, #6366F1, #818CF8)', minHeight: '4px' }} />
                              <p style={{ fontSize: '10px', color: '#475569', textAlign: 'center' }}>{day.date}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Top pages */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>Most Visited Pages</h3>
                        <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>Where users spend most time</p>
                      </div>
                      {analyticsData.topPages.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center' }}>
                          <p style={{ color: '#475569', fontSize: '13px' }}>No page views tracked yet</p>
                        </div>
                      ) : analyticsData.topPages.map((page: any, i: number) => {
                        const maxCount = analyticsData.topPages[0]?.count || 1
                        const pct = Math.round((page.count / maxCount) * 100)
                        const pageLabels: Record<string, string> = {
                          '/dashboard': '📊 Dashboard',
                          '/employees': '👥 Employees',
                          '/payroll': '💰 Payroll',
                          '/payslips': '📄 Payslips',
                          '/leave': '🏖️ Leave',
                          '/reports': '📈 Reports',
                          '/audit': '🛡️ Audit Trail',
                          '/sms': '📱 Bulk SMS',
                          '/settings': '⚙️ Settings',
                          '/calculator': '🧮 Calculator',
                          '/team': '👨‍👩‍👧 Team',
                          '/offboarding': '🚪 Offboarding',
                        }
                        return (
                          <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 500 }}>{pageLabels[page.page] || page.page}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366F1' }}>{page.count} views</span>
                            </div>
                            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.08, duration: 0.5 }}
                                style={{ height: '100%', borderRadius: '2px', background: 'linear-gradient(to right, #6366F1, #818CF8)' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Feature usage */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '16px' }}>Feature Usage</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {[
                          { label: 'Payroll Runs', value: analyticsData.payrollRuns, color: '#6366F1', icon: '💰' },
                          { label: 'Employees Added', value: analyticsData.employeesAdded, color: '#10B981', icon: '👥' },
                          { label: 'Payslips Downloaded', value: analyticsData.payslipsDownloaded, color: '#F59E0B', icon: '📄' },
                          { label: 'SMS Sent', value: analyticsData.smsSent, color: '#06B6D4', icon: '📱' },
                          { label: 'Leave Submitted', value: analyticsData.leavesSubmitted, color: '#8B5CF6', icon: '🏖️' },
                          { label: 'Reports Exported', value: analyticsData.reportsExported, color: '#EF4444', icon: '📈' },
                        ].map(item => (
                          <div key={item.label} style={{ padding: '14px', borderRadius: '10px', background: `${item.color}08`, border: `1px solid ${item.color}20`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '20px' }}>{item.icon}</span>
                            <div>
                              <p style={{ fontSize: '18px', fontWeight: 700, color: item.color }}>{item.value}</p>
                              <p style={{ fontSize: '11px', color: '#475569' }}>{item.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ANALYTICS */}
            {tab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {[
                    { label: 'Monthly Recurring Revenue', value: `GHS ${stats.mrr.toLocaleString()}`, color: '#10B981', icon: DollarSign },
                    { label: 'Annual Recurring Revenue', value: `GHS ${stats.arr.toLocaleString()}`, color: '#6366F1', icon: TrendingUp },
                    { label: 'Avg Revenue Per Company', value: `GHS ${stats.paying > 0 ? Math.round(stats.mrr / stats.paying).toLocaleString() : 0}`, color: '#F59E0B', icon: BarChart3 },
                  ].map((s, i) => (
                    <div key={s.label} style={{ padding: '20px', borderRadius: '14px', background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                      <s.icon size={20} color={s.color} style={{ marginBottom: '10px' }} />
                      <p style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</p>
                      <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Trial conversion */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '20px' }}>Plan Distribution</h3>
                  {[
                    { label: 'Trial', count: stats.onTrial, total: stats.totalCompanies, color: '#F59E0B' },
                    { label: 'Starter', count: stats.starter, total: stats.totalCompanies, color: '#6366F1' },
                    { label: 'Growth', count: stats.growth, total: stats.totalCompanies, color: '#10B981' },
                    { label: 'Business', count: stats.business, total: stats.totalCompanies, color: '#EF4444' },
                  ].map(plan => (
                    <div key={plan.label} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#94A3B8' }}>{plan.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: plan.color }}>{plan.count} companies</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '100%', borderRadius: '3px', background: plan.color, width: `${plan.total > 0 ? (plan.count / plan.total) * 100 : 0}%`, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trial expiring soon */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(245,158,11,0.05)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>⚠️ Trials Expiring Soon</h3>
                    <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Companies to follow up with</p>
                  </div>
                  {companies.filter(c => {
                    if (c.plan !== 'trial') return false
                    const days = Math.ceil((new Date(c.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    return days <= 14 && days >= 0
                  }).length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center' }}>
                      <CheckCircle size={28} color="#10B981" style={{ margin: '0 auto 8px' }} />
                      <p style={{ color: '#475569', fontSize: '13px' }}>No trials expiring in the next 14 days</p>
                    </div>
                  )}
                  {companies.filter(c => {
                    if (c.plan !== 'trial') return false
                    const days = Math.ceil((new Date(c.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    return days <= 14 && days >= 0
                  }).map(company => {
                    const days = Math.ceil((new Date(company.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    return (
                      <div key={company.id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{company.name}</p>
                          <p style={{ fontSize: '11px', color: '#475569' }}>{company.email}</p>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: days <= 3 ? '#EF4444' : '#F59E0B' }}>{days} days left</span>
                        <select value={company.plan} onChange={e => updatePlan(company.id, e.target.value)}
                          style={{ padding: '5px 10px', borderRadius: '7px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '11px', outline: 'none', cursor: 'pointer' }}>
                          {['trial', 'starter', 'growth', 'business'].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* COMPANIES */}
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
                            <p style={{ fontSize: '11px', color: '#475569' }}>ID: {company.id.slice(0, 8)}... • Joined {new Date(company.created_at).toLocaleDateString()}</p>
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
                          <button onClick={() => { setSelectedCompany(company); setTab('features') }}
                            style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                            Manage Features →
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {[
                          { label: 'Email', value: company.email || 'N/A' },
                          { label: 'Phone', value: company.phone || 'N/A' },
                          { label: 'Trial Ends', value: company.plan === 'trial' ? `${daysLeft} days left` : 'Paid plan' },
                          { label: 'Monthly Revenue', value: `GHS ${(PLAN_PRICES[company.plan] || 0).toLocaleString()}` },
                        ].map(item => (
                          <div key={item.label} style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '10px', color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                            <p style={{ fontSize: '12px', color: '#F8FAFC', fontWeight: 500 }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* FEATURE FLAGS */}
            {tab === 'features' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px 20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8', display: 'block', marginBottom: '8px' }}>Select Company</label>
                  <select value={selectedCompany?.id || ''} onChange={e => setSelectedCompany(companies.find(c => c.id === e.target.value) || null)}
                    style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', width: '100%', maxWidth: '400px', cursor: 'pointer' }}>
                    <option value="">-- Select a company --</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.plan})</option>)}
                  </select>
                </div>

                {selectedCompany ? (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '15px' }}>{selectedCompany.name}</h3>
                        <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>Toggle features on/off</p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', background: `${PLAN_COLORS[selectedCompany.plan] || '#6366F1'}15`, color: PLAN_COLORS[selectedCompany.plan] || '#6366F1' }}>
                        {selectedCompany.plan?.toUpperCase()}
                      </span>
                    </div>
                    {FEATURE_LIST.map((feature, i) => {
                      const isEnabled = selectedCompany.features?.[feature.key] ?? false
                      const isLoading = toggling === selectedCompany.id + feature.key
                      return (
                        <div key={feature.key} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>{feature.label}</p>
                            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{feature.desc}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: isEnabled ? '#10B981' : '#475569' }}>{isEnabled ? 'On' : 'Off'}</span>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => toggleFeature(selectedCompany.id, feature.key, isEnabled)}
                              disabled={!!isLoading}
                              style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                                background: isEnabled ? '#10B981' : 'rgba(255,255,255,0.1)', opacity: isLoading ? 0.7 : 1 }}>
                              {isLoading ? (
                                <Loader2 size={12} color="white" style={{ animation: 'spin 1s linear infinite', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                              ) : (
                                <div style={{ position: 'absolute', top: '3px', left: isEnabled ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      )
                    })}
                  </motion.div>
                ) : (
                  <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                    <ToggleRight size={40} color="#475569" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#475569', fontSize: '14px' }}>Select a company to manage features</p>
                  </div>
                )}
              </div>
            )}

            {/* CALCULATOR */}
            {tab === 'calculator' && <AdminCalculator />}

            {/* ANNOUNCEMENTS */}
            {tab === 'announcements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>Send Announcement</h3>
                  <p style={{ fontSize: '12px', color: '#475569', marginBottom: '20px' }}>Send an email announcement to all Pavroll companies</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Announcement Type</label>
                      <select value={announcement.type} onChange={e => setAnnouncement(p => ({ ...p, type: e.target.value }))}
                        style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                        <option value="info">ℹ️ Information</option>
                        <option value="feature">🚀 New Feature</option>
                        <option value="maintenance">🔧 Maintenance</option>
                        <option value="urgent">🚨 Urgent</option>
                        <option value="pricing">💰 Pricing Update</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Title</label>
                      <input value={announcement.title} onChange={e => setAnnouncement(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. New Feature: Loan Module is now available!"
                        style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Message</label>
                      <textarea value={announcement.message} onChange={e => setAnnouncement(p => ({ ...p, message: e.target.value }))}
                        placeholder="Write your announcement message here..." rows={6}
                        style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none', resize: 'none' }} />
                    </div>

                    {/* Preview */}
                    {announcement.title && (
                      <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <p style={{ fontSize: '11px', color: '#6366F1', fontWeight: 600, marginBottom: '6px' }}>PREVIEW</p>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>[Pavroll Announcement] {announcement.title}</p>
                        <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.6 }}>{announcement.message}</p>
                      </div>
                    )}

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={sendAnnouncement} disabled={sendingAnnouncement || !announcement.title || !announcement.message}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', background: '#EF4444', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: sendingAnnouncement ? 0.7 : 1 }}>
                      {sendingAnnouncement ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><Megaphone size={15} /> Send to All Companies ({companies.length})</>}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* SENDER IDs */}
            {tab === 'senderids' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                  <div key={req.id} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
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
                  </div>
                ))}
              </div>
            )}

            {/* REVENUE */}
            {tab === 'revenue' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  {[
                    { label: 'Monthly Recurring Revenue', value: `GHS ${stats.mrr.toLocaleString()}`, sub: 'This month', color: '#10B981' },
                    { label: 'Annual Recurring Revenue', value: `GHS ${stats.arr.toLocaleString()}`, sub: 'Projected', color: '#6366F1' },
                    { label: 'Paying Customers', value: stats.paying, sub: `of ${stats.totalCompanies} total`, color: '#F59E0B' },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '24px', borderRadius: '16px', background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                      <p style={{ fontSize: '32px', fontWeight: 800, color: s.color }}>{s.value}</p>
                      <p style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 600, marginTop: '4px' }}>{s.label}</p>
                      <p style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Revenue breakdown */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '20px' }}>Revenue Breakdown</h3>
                  {[
                    { plan: 'Starter', count: stats.starter, price: 120, color: '#6366F1' },
                    { plan: 'Growth', count: stats.growth, price: 350, color: '#10B981' },
                    { plan: 'Business', count: stats.business, price: 800, color: '#EF4444' },
                  ].map(p => (
                    <div key={p.plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color }} />
                        <span style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 500 }}>{p.plan} Plan</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: p.color }}>GHS {(p.count * p.price).toLocaleString()}/mo</p>
                        <p style={{ fontSize: '11px', color: '#475569' }}>{p.count} × GHS {p.price}</p>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC' }}>Total MRR</span>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#10B981' }}>GHS {stats.mrr.toLocaleString()}/mo</span>
                  </div>
                </div>
              </div>
            )}

            {/* SYSTEM */}
            {tab === 'system' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '20px' }}>System Settings</h3>
                  {[
                    { label: 'Maintenance Mode', desc: 'Take Pavroll offline for maintenance', value: maintenanceMode, onChange: () => setMaintenanceMode(!maintenanceMode), danger: true },
                    { label: 'New Signups', desc: 'Allow new companies to sign up', value: true, onChange: () => {}, danger: false },
                    { label: 'SMS Notifications', desc: 'Global SMS sending enabled', value: true, onChange: () => {}, danger: false },
                    { label: 'Email Notifications', desc: 'Global email sending enabled', value: true, onChange: () => {}, danger: false },
                    { label: 'Paystack Payments', desc: 'Allow payment processing', value: true, onChange: () => {}, danger: false },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: item.danger ? '#EF4444' : '#F8FAFC' }}>{item.label}</p>
                        <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{item.desc}</p>
                      </div>
                      <motion.button whileHover={{ scale: 1.05 }} onClick={item.onChange}
                        style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative',
                          background: item.value ? (item.danger ? '#EF4444' : '#10B981') : 'rgba(255,255,255,0.1)' }}>
                        <div style={{ position: 'absolute', top: '2px', left: item.value ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                      </motion.button>
                    </div>
                  ))}
                </div>

                {/* System info */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>System Information</h3>
                  {[
                    { label: 'Version', value: 'Pavroll v1.0.0' },
                    { label: 'Stack', value: 'Next.js 14 + Supabase + Clerk' },
                    { label: 'Database', value: 'Supabase (West EU - Ireland)' },
                    { label: 'Auth', value: 'Clerk Authentication' },
                    { label: 'Payments', value: 'Paystack (Live Mode)' },
                    { label: 'SMS', value: 'JospigarBulkSMS' },
                    { label: 'Hosting', value: 'Vercel (pavroll-nwvm.vercel.app)' },
                    { label: 'GRA Rates', value: 'Ghana GRA 2026 (Updated June 2026)' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '12px', color: '#475569' }}>{item.label}</span>
                      <span style={{ fontSize: '12px', color: '#F8FAFC', fontWeight: 500 }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <AlertTriangle size={18} color="#EF4444" />
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#EF4444' }}>Danger Zone</h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>These actions are irreversible. Proceed with extreme caution.</p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button style={{ padding: '9px 18px', borderRadius: '9px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      Clear All Trial Data
                    </button>
                    <button style={{ padding: '9px 18px', borderRadius: '9px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                      Reset Demo Company
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUPPORT */}
            {tab === 'support' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                  <Mail size={40} color="#6366F1" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>Support Inbox</h3>
                  <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px', lineHeight: 1.6 }}>
                    All contact form submissions from clients go directly to your email inbox at hello.pavroll@proton.me
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="mailto:hello.pavroll@proton.me"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: '#6366F1', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                      <Mail size={14} /> Open Email Inbox
                    </a>
                    <a href="tel:+233539299311"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                      <Phone size={14} /> +233 53 929 9311
                    </a>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>Quick Support Stats</h3>
                  {[
                    { label: 'Total Companies', value: companies.length, color: '#6366F1' },
                    { label: 'Companies on Trial', value: stats.onTrial, color: '#F59E0B' },
                    { label: 'Paying Companies', value: stats.paying, color: '#10B981' },
                    { label: 'Pending Sender IDs', value: stats.pendingSenderIds, color: '#EF4444' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '13px', color: '#94A3B8' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
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
