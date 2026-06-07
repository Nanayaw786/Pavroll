'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Users, Plus, Mail, Shield, Pencil, UserX, CheckCircle, XCircle, Loader2, Crown, Briefcase, Calculator, Users2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { getCompanyMembers, addCompanyMember, updateMemberRole, deactivateMember, seedAdminMember, type CompanyMember, type Role, ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'
import { getCompanyId } from '@/lib/employees'
import { supabase } from '@/lib/supabase'

const ROLE_ICONS: Record<Role, any> = {
  admin: Crown,
  hr: Users2,
  accountant: Calculator,
  manager: Briefcase,
}

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Full access — billing, settings, all modules',
  hr: 'Employees, Leave, Offboarding, Bulk SMS',
  accountant: 'Payroll, Payslips, Reports, Audit Trail',
  manager: 'View employees & approve leave requests',
}

const departments = ['Management', 'Engineering', 'HR', 'Finance', 'Sales', 'Operations', 'Marketing']

function getInitials(name: string) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'
}

export default function TeamPage() {
  const { user } = useUser()
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [companyId, setCompanyId] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ success: boolean, message: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'hr' as Role, department: 'HR' })

  useEffect(() => { loadData() }, [user])

  const loadData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const cId = await getCompanyId()
      setCompanyId(cId)
      const { data: company } = await supabase.from('companies').select('name').eq('id', cId).single()
      if (company) setCompanyName(company.name)

      // Seed admin if not exists
      await seedAdminMember(cId, user.id, user.primaryEmailAddress?.emailAddress || '', user.fullName || 'Admin')

      const membersList = await getCompanyMembers(cId)
      setMembers(membersList)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!form.name || !form.email) return
    setSaving(true)
    try {
      const newMember = await addCompanyMember({
        company_id: companyId,
        clerk_user_id: `pending_${Date.now()}`,
        email: form.email,
        name: form.name,
        role: form.role,
        department: form.department,
        is_active: true,
        invited_at: new Date().toISOString(),
        joined_at: '',
      })
      setMembers(prev => [newMember, ...prev])

      // Send invite email
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.fullName || 'Admin',
          email: form.email,
          company: companyName,
          subject: `You've been invited to join ${companyName} on Pavroll`,
          message: `Hi ${form.name},\n\nYou have been invited to join ${companyName} on Pavroll as ${ROLE_LABELS[form.role]}.\n\nClick the link below to create your account and get started:\nhttps://pavroll-nwvm.vercel.app/sign-up\n\nYour role: ${ROLE_LABELS[form.role]}\nDepartment: ${form.department}\n\nWelcome to the team!\n\n${user?.fullName || 'Admin'}\n${companyName}`,
        })
      })

      setResult({ success: true, message: `Invitation sent to ${form.email}!` })
      setShowInvite(false)
      setForm({ name: '', email: '', role: 'hr', department: 'HR' })
      setTimeout(() => setResult(null), 4000)
    } catch (err) {
      setResult({ success: false, message: 'Failed to send invitation' })
    } finally {
      setSaving(false)
    }
  }

  const handleRoleChange = async (id: string, role: Role) => {
    await updateMemberRole(id, role)
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m))
    setEditingId(null)
    setResult({ success: true, message: 'Role updated successfully!' })
    setTimeout(() => setResult(null), 3000)
  }

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return
    await deactivateMember(id)
    setMembers(prev => prev.filter(m => m.id !== id))
    setResult({ success: true, message: `${name} removed from team.` })
    setTimeout(() => setResult(null), 3000)
  }

  const activeMembers = members.filter(m => m.is_active)
  const currentUserMember = members.find(m => m.clerk_user_id === user?.id)
  const isAdmin = currentUserMember?.role === 'admin'

  return (
    <DashboardLayout title="Team Management">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Stats */}
        <div className="team-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { label: 'Total Members', value: activeMembers.length, color: '#6366F1', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Admins', value: activeMembers.filter(m => m.role === 'admin').length, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
            { label: 'HR Managers', value: activeMembers.filter(m => m.role === 'hr').length, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Accountants', value: activeMembers.filter(m => m.role === 'accountant').length, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '14px', padding: '16px 20px' }}>
              <p style={{ fontSize: '26px', fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px',
                background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              {result.success ? <CheckCircle size={16} color="#10B981" /> : <XCircle size={16} color="#EF4444" />}
              <span style={{ fontSize: '13px', color: result.success ? '#10B981' : '#EF4444', fontWeight: 500 }}>{result.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#F8FAFC' }}>Team Members</h2>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{companyName} • {activeMembers.length} members</p>
          </div>
          {isAdmin && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowInvite(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={15} /> Invite Member
            </motion.button>
          )}
        </div>

        {/* Role permissions info */}
        <div className="team-roles" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {(Object.keys(ROLE_LABELS) as Role[]).map((role, i) => {
            const Icon = ROLE_ICONS[role]
            const color = ROLE_COLORS[role]
            return (
              <motion.div key={role} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ padding: '16px', borderRadius: '14px', background: `${color}08`, border: `1px solid ${color}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={color} />
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{ROLE_LABELS[role]}</p>
                </div>
                <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>{ROLE_DESCRIPTIONS[role]}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Members list */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '14px' }}>Active Members</h3>
          </div>

          {loading && (
            <div style={{ padding: '40px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader2 size={20} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#475569', fontSize: '14px' }}>Loading team...</span>
            </div>
          )}

          {!loading && activeMembers.map((member, i) => {
            const color = ROLE_COLORS[member.role]
            const Icon = ROLE_ICONS[member.role]
            const isCurrentUser = member.clerk_user_id === user?.id
            return (
              <motion.div key={member.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="team-member" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color, flexShrink: 0 }}>
                  {getInitials(member.name)}
                </div>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>{member.name}</p>
                    {isCurrentUser && (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(99,102,241,0.15)', color: '#818CF8', fontWeight: 600 }}>You</span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{member.email}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={12} color={color} />
                  </div>
                  {editingId === member.id ? (
                    <select value={member.role} onChange={e => handleRoleChange(member.id, e.target.value as Role)}
                      style={{ padding: '5px 10px', borderRadius: '8px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                      {(Object.keys(ROLE_LABELS) as Role[]).map(r => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: `${color}15`, color, border: `1px solid ${color}25` }}>
                      {ROLE_LABELS[member.role]}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: '#475569' }}>{member.department}</span>
                {isAdmin && !isCurrentUser && (
                  <div className="team-member-actions" style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setEditingId(editingId === member.id ? null : member.id)}
                      style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366F1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDeactivate(member.id, member.name)}
                      style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserX size={13} />
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Invite Dialog */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowInvite(false) }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', width: '480px', maxWidth: '95vw' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>Invite Team Member</h2>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>They'll receive an email invitation to join {companyName} on Pavroll.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Full Name', key: 'name', placeholder: 'Ama Owusu' },
                { label: 'Work Email', key: 'email', placeholder: 'ama@company.com' },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{field.label}</label>
                  <input value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                </div>
              ))}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Role</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                  {(Object.keys(ROLE_LABELS) as Role[]).filter(r => r !== 'admin').map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <p style={{ fontSize: '11px', color: '#475569' }}>{ROLE_DESCRIPTIONS[form.role]}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Department</label>
                <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Role preview */}
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: `${ROLE_COLORS[form.role]}08`, border: `1px solid ${ROLE_COLORS[form.role]}20` }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: ROLE_COLORS[form.role], marginBottom: '4px' }}>
                  {ROLE_LABELS[form.role]} — Access Preview
                </p>
                <p style={{ fontSize: '11px', color: '#64748B' }}>{ROLE_DESCRIPTIONS[form.role]}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInvite(false)}
                style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleInvite} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><Mail size={14} /> Send Invitation</>}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  )
}
