'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Archive, Users, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getEmployees, addEmployee, updateEmployee, toggleEmployeeStatus, getCompanyId, seedDemoEmployees, type Employee } from '@/lib/employees'

const departments = ['Engineering', 'HR', 'Finance', 'Sales', 'Operations', 'Marketing']
const banks = ['GCB Bank', 'Ecobank', 'Absa Bank', 'Stanbic Bank', 'Fidelity Bank', 'Zenith Bank', 'Access Bank', 'Cal Bank']
const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6']

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const emptyForm = {
  name: '', email: '', phone: '', department: '', position: '',
  basicSalary: '', ssnitNumber: '', bankName: '', bankAccount: '',
  ghanaCard: '', joinDate: '', employmentType: 'Full-time'
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('active')
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const cId = await getCompanyId()
      setCompanyId(cId)
      const emps = await getEmployees(cId)
      if (emps.length === 0) {
        await seedDemoEmployees(cId)
        const seeded = await getEmployees(cId)
        setEmployees(seeded)
      } else {
        setEmployees(emps)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ? true : e.status === filter
    return matchSearch && matchFilter
  })

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowDialog(true)
  }

  const openEdit = (emp: Employee) => {
    setEditingId(emp.id)
    setForm({
      name: emp.name, email: emp.email, phone: emp.phone,
      department: emp.department, position: emp.position,
      basicSalary: emp.basic_salary.toString(),
      ssnitNumber: emp.ssnit_number, bankName: emp.bank_name,
      bankAccount: emp.bank_account, ghanaCard: emp.ghana_card || '',
      joinDate: emp.join_date || '', employmentType: emp.employment_type || 'Full-time'
    })
    setShowDialog(true)
    setOpenMenu(null)
  }

  const handleArchive = async (emp: Employee) => {
    const newStatus = emp.status === 'active' ? 'archived' : 'active'
    await toggleEmployeeStatus(emp.id, newStatus)
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: newStatus } : e))
    setOpenMenu(null)
  }

  const handleSave = async () => {
    if (!form.name || !form.email || !form.department) return
    setSaving(true)
    try {
      if (editingId) {
        const updated = await updateEmployee(editingId, {
          name: form.name, email: form.email, phone: form.phone,
          department: form.department, position: form.position,
          basic_salary: Number(form.basicSalary),
          ssnit_number: form.ssnitNumber, bank_name: form.bankName,
          bank_account: form.bankAccount, ghana_card: form.ghanaCard,
          join_date: form.joinDate, employment_type: form.employmentType
        })
        setEmployees(prev => prev.map(e => e.id === editingId ? updated : e))
      } else {
        const newEmp = await addEmployee({
          company_id: companyId, name: form.name, email: form.email,
          phone: form.phone, department: form.department, position: form.position,
          basic_salary: Number(form.basicSalary), ssnit_number: form.ssnitNumber,
          bank_name: form.bankName, bank_account: form.bankAccount,
          ghana_card: form.ghanaCard, join_date: form.joinDate,
          employment_type: form.employmentType, status: 'active'
        })
        setEmployees(prev => [newEmp, ...prev])
      }
      setShowDialog(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Employees">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['active', 'archived', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'all 0.2s',
                  background: filter === f ? '#6366F1' : 'rgba(255,255,255,0.03)',
                  borderColor: filter === f ? '#6366F1' : 'rgba(255,255,255,0.08)',
                  color: filter === f ? '#fff' : '#94A3B8' }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', width: '200px' }}>
              <Search size={14} color="#475569" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees..."
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#94A3B8', fontSize: '13px', width: '100%' }} />
            </div>
            <Link href="/employees/import">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818CF8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
                <Upload size={15} /> Bulk Import
              </motion.div>
            </Link>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={16} /> Add Employee
            </motion.button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="emp-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Active Employees', value: employees.filter(e => e.status === 'active').length, color: '#10B981' },
            { label: 'Total Payroll', value: `GHS ${employees.filter(e => e.status === 'active').reduce((s, e) => s + e.basic_salary, 0).toLocaleString()}`, color: '#6366F1' },
            { label: 'Departments', value: [...new Set(employees.map(e => e.department))].length, color: '#F59E0B' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div className="emp-table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            {['Employee', 'Contact', 'Department', 'Basic Salary', 'Status', ''].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {loading && (
            <div style={{ padding: '48px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Loader2 size={20} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#475569', fontSize: '14px' }}>Loading employees...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Users size={40} color="#475569" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#475569', fontSize: '14px' }}>No employees found</p>
            </div>
          )}

          {!loading && filtered.map((emp, i) => (
            <motion.div key={emp.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="emp-table-row"
              style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 80px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', position: 'relative' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {getInitials(emp.name)}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{emp.name}</p>
                  <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>{emp.position}</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#94A3B8' }}>{emp.email}</p>
                <p style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>{emp.phone}</p>
              </div>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>{emp.department}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>GHS {emp.basic_salary.toLocaleString()}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', width: 'fit-content',
                background: emp.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(71,85,105,0.2)',
                color: emp.status === 'active' ? '#10B981' : '#64748B',
                border: `1px solid ${emp.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(71,85,105,0.3)'}` }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: emp.status === 'active' ? '#10B981' : '#64748B' }} />
                {emp.status === 'active' ? 'Active' : 'Archived'}
              </span>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setOpenMenu(openMenu === emp.id ? null : emp.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: '#475569' }}>
                  <MoreHorizontal size={16} />
                </button>
                {openMenu === emp.id && (
                  <div style={{ position: 'absolute', right: 0, top: '32px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '4px', zIndex: 50, minWidth: '140px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    <button onClick={() => openEdit(emp)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', borderRadius: '6px' }}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => handleArchive(emp)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: emp.status === 'active' ? '#F59E0B' : '#10B981', fontSize: '13px', cursor: 'pointer', borderRadius: '6px' }}>
                      <Archive size={14} /> {emp.status === 'active' ? 'Archive' : 'Restore'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .emp-stats { grid-template-columns: 1fr !important; }
          .emp-table-header { display: none !important; }
          .emp-table-row { grid-template-columns: 1fr auto !important; gap: 8px !important; }
          .emp-table-row > *:nth-child(2),
          .emp-table-row > *:nth-child(3),
          .emp-table-row > *:nth-child(4) { display: none !important; }
        }
      `}</style>

      {/* Add/Edit Dialog */}
      {showDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDialog(false) }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', width: '560px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', marginBottom: '24px' }}>
              {editingId ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Full Name', key: 'name', placeholder: 'Kwame Mensah' },
                { label: 'Email', key: 'email', placeholder: 'kwame@company.com' },
                { label: 'Phone', key: 'phone', placeholder: '0244123456' },
                { label: 'Position', key: 'position', placeholder: 'Senior Developer' },
                { label: 'Basic Salary (GHS)', key: 'basicSalary', placeholder: '3000' },
                { label: 'SSNIT Number', key: 'ssnitNumber', placeholder: 'SSN-001234' },
                { label: 'Ghana Card Number', key: 'ghanaCard', placeholder: 'GHA-000123456-7' },
                { label: 'Bank Account Number', key: 'bankAccount', placeholder: '1234567890' },
                { label: 'Join Date', key: 'joinDate', placeholder: '2024-01-15' },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{field.label}</label>
                  <input value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Department</label>
                <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Bank Name</label>
                <select value={form.bankName} onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))}
                  style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                  <option value="">Select bank</option>
                  {banks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDialog(false)}
                style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Employee'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  )
}
