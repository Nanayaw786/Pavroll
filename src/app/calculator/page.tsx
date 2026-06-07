'use client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calculator, TrendingUp, Users, ArrowLeftRight, Clock, Gift, CreditCard, Star, Shield, BarChart3, Delete } from 'lucide-react'
import { calculatePayroll, calculatePAYE, DEFAULT_SETTINGS } from '@/lib/payroll'

type CalcTab = 'basic' | 'paye' | 'ssnit' | 'netpay' | 'reverse' | 'overtime' | 'gratuity' | 'loan' | 'bonus' | 'compare'

const TABS = [
  { key: 'basic', label: 'Basic Calc', icon: Calculator },
  { key: 'paye', label: 'PAYE', icon: Shield },
  { key: 'ssnit', label: 'SSNIT', icon: Users },
  { key: 'netpay', label: 'Net Pay', icon: TrendingUp },
  { key: 'reverse', label: 'Reverse', icon: ArrowLeftRight },
  { key: 'overtime', label: 'Overtime', icon: Clock },
  { key: 'gratuity', label: 'Gratuity', icon: Gift },
  { key: 'loan', label: 'Loan', icon: CreditCard },
  { key: 'bonus', label: '13th Month', icon: Star },
  { key: 'compare', label: 'Compare', icon: BarChart3 },
]

const fmt = (n: number) => `GHS ${n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function ResultCard({ label, value, color = '#6366F1', large = false }: { label: string, value: string, color?: string, large?: boolean }) {
  return (
    <div style={{ padding: '16px', borderRadius: '12px', background: `${color}08`, border: `1px solid ${color}20`, textAlign: 'center' }}>
      <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: large ? '24px' : '18px', fontWeight: 800, color }}>{value}</p>
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, prefix = 'GHS', type = 'number' }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        {prefix && (
          <span style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.06)', color: '#475569', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{prefix}</span>
        )}
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: 'none', color: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
      </div>
    </div>
  )
}

// ===== BASIC CALCULATOR =====
function BasicCalculator() {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [lastResult, setLastResult] = useState<number | null>(null)
  const [history, setHistory] = useState<string[]>([])

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ]

  const handleButton = (btn: string) => {
    if (btn === 'C') { setDisplay('0'); setExpression(''); return }
    if (btn === '⌫') {
      setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0')
      return
    }
    if (btn === '±') { setDisplay(prev => (parseFloat(prev) * -1).toString()); return }
    if (btn === '%') { setDisplay(prev => (parseFloat(prev) / 100).toString()); return }
    if (btn === '=') {
      try {
        const expr = expression + display
        const result = Function('"use strict"; return (' + expr.replace('×', '*').replace('÷', '/') + ')')()
        const resultStr = parseFloat(result.toFixed(10)).toString()
        setHistory(prev => [`${expr} = ${resultStr}`, ...prev.slice(0, 9)])
        setLastResult(result)
        setDisplay(resultStr)
        setExpression('')
      } catch { setDisplay('Error') }
      return
    }
    if (['+', '-', '×', '÷'].includes(btn)) {
      setExpression(prev => prev + display + btn)
      setDisplay('0')
      return
    }
    if (btn === '.' && display.includes('.')) return
    setDisplay(prev => prev === '0' && btn !== '.' ? btn : prev + btn)
  }

  const btnColors: Record<string, string> = {
    'C': '#EF4444', '±': '#6366F1', '%': '#6366F1',
    '÷': '#F59E0B', '×': '#F59E0B', '-': '#F59E0B', '+': '#F59E0B', '=': '#10B981',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden' }}>
        {/* Display */}
        <div style={{ padding: '24px 20px', background: 'rgba(0,0,0,0.3)', minHeight: '100px' }}>
          <p style={{ fontSize: '12px', color: '#475569', minHeight: '20px', textAlign: 'right' }}>{expression}</p>
          <p style={{ fontSize: '42px', fontWeight: 700, color: '#F8FAFC', textAlign: 'right', wordBreak: 'break-all', lineHeight: 1.2 }}>{display}</p>
        </div>
        {/* Buttons */}
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {buttons.flat().map((btn, i) => (
            <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => handleButton(btn)}
              style={{ padding: '18px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 600, transition: 'all 0.1s',
                background: btnColors[btn] ? `${btnColors[btn]}20` : 'rgba(255,255,255,0.06)',
                color: btnColors[btn] || '#F8FAFC',
                gridColumn: btn === '0' ? 'span 2' : 'span 1',
              }}>
              {btn}
            </motion.button>
          ))}
        </div>
      </div>

      {/* History */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>History</p>
        {history.length === 0 && <p style={{ fontSize: '12px', color: '#334155', textAlign: 'center', padding: '20px 0' }}>No calculations yet</p>}
        {history.map((h, i) => (
          <p key={i} style={{ fontSize: '12px', color: i === 0 ? '#F8FAFC' : '#475569', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'monospace' }}>{h}</p>
        ))}
      </div>
    </div>
  )
}

// ===== PAYE CALCULATOR =====
function PAYECalculator() {
  const [salary, setSalary] = useState('')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const s = parseFloat(salary)
    if (!s || s <= 0) return
    const res = calculatePayroll(s, DEFAULT_SETTINGS)
    const annualTaxable = (s - res.ssnitEmployee) * 12
    const bands = [
      { name: 'First GHS 5,880 (0%)', limit: 5880, rate: 0 },
      { name: 'Next GHS 1,320 (5%)', limit: 1320, rate: 0.05 },
      { name: 'Next GHS 1,560 (10%)', limit: 1560, rate: 0.10 },
      { name: 'Next GHS 38,000 (17.5%)', limit: 38000, rate: 0.175 },
      { name: 'Next GHS 192,000 (25%)', limit: 192000, rate: 0.25 },
      { name: 'Next GHS 366,240 (30%)', limit: 366240, rate: 0.30 },
      { name: 'Above (35%)', limit: Infinity, rate: 0.35 },
    ]
    let remaining = annualTaxable
    const breakdown = bands.map(band => {
      const taxable = Math.min(remaining, band.limit)
      const tax = taxable * band.rate
      remaining -= taxable
      return { ...band, taxable: Math.max(0, taxable), annualTax: Math.max(0, tax), monthlyTax: Math.max(0, tax / 12) }
    }).filter(b => b.taxable > 0)
    setResult({ ...res, breakdown, annualTaxable, annualPAYE: res.paye * 12 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', maxWidth: '480px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>PAYE Tax Calculator (GRA 2026)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <InputField label="Monthly Basic Salary" value={salary} onChange={setSalary} placeholder="5000" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculate}
            style={{ padding: '11px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Calculate PAYE
          </motion.button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <ResultCard label="Monthly PAYE" value={fmt(result.paye)} color="#EF4444" large />
            <ResultCard label="Annual PAYE" value={fmt(result.annualPAYE)} color="#F59E0B" large />
            <ResultCard label="Effective Rate" value={`${result.effectiveTaxRate}%`} color="#6366F1" large />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>PAYE Band Breakdown</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Band', 'Annual Taxable', 'Annual Tax', 'Monthly Tax'].map(h => (
                <span key={h} style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {result.breakdown.map((band: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{band.name}</span>
                <span style={{ fontSize: '12px', color: '#F8FAFC' }}>{fmt(band.taxable)}</span>
                <span style={{ fontSize: '12px', color: '#EF4444' }}>{fmt(band.annualTax)}</span>
                <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600 }}>{fmt(band.monthlyTax)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ===== SSNIT CALCULATOR =====
function SSNITCalculator() {
  const [salary, setSalary] = useState('')
  const [empRate, setEmpRate] = useState('5.5')
  const [emplRate, setEmplRate] = useState('13')
  const [tier2Rate, setTier2Rate] = useState('5')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const s = parseFloat(salary)
    if (!s) return
    const ceiling = 69000
    const insurable = Math.min(s, ceiling)
    const emp = insurable * (parseFloat(empRate) / 100)
    const empl = insurable * (parseFloat(emplRate) / 100)
    const tier2 = insurable * (parseFloat(tier2Rate) / 100)
    setResult({
      insurable, emp, empl, tier2,
      totalEmployee: emp,
      totalEmployer: empl + tier2,
      totalSSNIT: emp + empl + tier2,
      annualEmp: emp * 12,
      annualEmpl: (empl + tier2) * 12,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', maxWidth: '520px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>SSNIT Contribution Calculator</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <InputField label="Monthly Basic Salary" value={salary} onChange={setSalary} placeholder="5000" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <InputField label="Employee Rate (%)" value={empRate} onChange={setEmpRate} placeholder="5.5" prefix="%" />
            <InputField label="Employer Rate (%)" value={emplRate} onChange={setEmplRate} placeholder="13" prefix="%" />
            <InputField label="Tier 2 Rate (%)" value={tier2Rate} onChange={setTier2Rate} placeholder="5" prefix="%" />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculate}
            style={{ padding: '11px', borderRadius: '10px', background: '#10B981', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Calculate SSNIT
          </motion.button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
            <ResultCard label="Employee Pays (Monthly)" value={fmt(result.emp)} color="#EF4444" large />
            <ResultCard label="Employer Pays (Monthly)" value={fmt(result.totalEmployer)} color="#F59E0B" large />
            <ResultCard label="Total SSNIT (Monthly)" value={fmt(result.totalSSNIT)} color="#10B981" large />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <ResultCard label="Insurable Earnings" value={fmt(result.insurable)} color="#6366F1" />
            <ResultCard label="Tier 1 (Employee)" value={fmt(result.emp)} color="#EF4444" />
            <ResultCard label="Tier 1 (Employer)" value={fmt(result.empl)} color="#F59E0B" />
            <ResultCard label="Tier 2 (Employer)" value={fmt(result.tier2)} color="#06B6D4" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <ResultCard label="Annual Employee Contribution" value={fmt(result.annualEmp)} color="#EF4444" />
            <ResultCard label="Annual Employer Contribution" value={fmt(result.annualEmpl)} color="#F59E0B" />
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ===== NET PAY CALCULATOR =====
function NetPayCalculator() {
  const [salary, setSalary] = useState('')
  const [allowances, setAllowances] = useState('')
  const [otherDeductions, setOtherDeductions] = useState('')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const s = parseFloat(salary) || 0
    const a = parseFloat(allowances) || 0
    const d = parseFloat(otherDeductions) || 0
    const gross = s + a
    const res = calculatePayroll(gross, DEFAULT_SETTINGS)
    const finalNet = res.netPay - d
    setResult({ ...res, allowances: a, otherDeductions: d, finalNet, gross })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', maxWidth: '480px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>Net Pay Calculator</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <InputField label="Basic Salary" value={salary} onChange={setSalary} placeholder="5000" />
          <InputField label="Allowances (optional)" value={allowances} onChange={setAllowances} placeholder="500" />
          <InputField label="Other Deductions (loans, etc.)" value={otherDeductions} onChange={setOtherDeductions} placeholder="200" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculate}
            style={{ padding: '11px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Calculate Net Pay
          </motion.button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '16px' }}>
            <ResultCard label="Gross Pay" value={fmt(result.gross)} color="#6366F1" large />
            <ResultCard label="SSNIT" value={fmt(result.ssnitEmployee)} color="#F59E0B" large />
            <ResultCard label="PAYE" value={fmt(result.paye)} color="#EF4444" large />
            <ResultCard label="Net Pay" value={fmt(result.finalNet)} color="#10B981" large />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', marginBottom: '16px' }}>Full Breakdown</h4>
            {[
              { label: 'Basic Salary', value: fmt(parseFloat(salary) || 0), color: '#F8FAFC' },
              { label: 'Allowances', value: fmt(result.allowances), color: '#10B981' },
              { label: 'Gross Pay', value: fmt(result.gross), color: '#6366F1', bold: true },
              { label: 'SSNIT (Employee)', value: `- ${fmt(result.ssnitEmployee)}`, color: '#F59E0B' },
              { label: 'PAYE Tax', value: `- ${fmt(result.paye)}`, color: '#EF4444' },
              { label: 'Other Deductions', value: `- ${fmt(result.otherDeductions)}`, color: '#EF4444' },
              { label: 'NET PAY', value: fmt(result.finalNet), color: '#10B981', bold: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: item.bold ? 700 : 400 }}>{item.label}</span>
                <span style={{ fontSize: '13px', color: item.color, fontWeight: item.bold ? 700 : 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ===== REVERSE CALCULATOR =====
function ReverseCalculator() {
  const [netPay, setNetPay] = useState('')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const net = parseFloat(netPay)
    if (!net) return
    // Binary search for gross salary
    let low = net, high = net * 3
    for (let i = 0; i < 100; i++) {
      const mid = (low + high) / 2
      const res = calculatePayroll(mid, DEFAULT_SETTINGS)
      if (Math.abs(res.netPay - net) < 0.01) {
        setResult({ gross: mid, ...res, targetNet: net })
        return
      }
      if (res.netPay < net) low = mid
      else high = mid
    }
    const mid = (low + high) / 2
    const res = calculatePayroll(mid, DEFAULT_SETTINGS)
    setResult({ gross: mid, ...res, targetNet: net })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', maxWidth: '480px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>Reverse Calculator</h3>
        <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>Enter desired take-home pay → get required gross salary</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <InputField label="Desired Net Pay (Take-home)" value={netPay} onChange={setNetPay} placeholder="4000" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculate}
            style={{ padding: '11px', borderRadius: '10px', background: '#8B5CF6', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Calculate Required Gross
          </motion.button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <ResultCard label="Required Gross" value={fmt(result.gross)} color="#8B5CF6" large />
            <ResultCard label="SSNIT Deduction" value={fmt(result.ssnitEmployee)} color="#F59E0B" large />
            <ResultCard label="PAYE Deduction" value={fmt(result.paye)} color="#EF4444" large />
            <ResultCard label="Actual Net Pay" value={fmt(result.netPay)} color="#10B981" large />
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ===== OVERTIME CALCULATOR =====
function OvertimeCalculator() {
  const [basicSalary, setBasicSalary] = useState('')
  const [hoursPerMonth, setHoursPerMonth] = useState('160')
  const [overtimeHours, setOvertimeHours] = useState('')
  const [overtimeRate, setOvertimeRate] = useState('1.5')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const salary = parseFloat(basicSalary) || 0
    const hours = parseFloat(hoursPerMonth) || 160
    const otHours = parseFloat(overtimeHours) || 0
    const rate = parseFloat(overtimeRate) || 1.5
    const hourlyRate = salary / hours
    const otPay = hourlyRate * rate * otHours
    const grossWithOT = salary + otPay
    const res = calculatePayroll(grossWithOT, DEFAULT_SETTINGS)
    setResult({ hourlyRate, otPay, grossWithOT, ...res, otHours, rate })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', maxWidth: '520px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>Overtime Calculator</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <InputField label="Basic Monthly Salary" value={basicSalary} onChange={setBasicSalary} placeholder="3000" />
          <InputField label="Regular Hours/Month" value={hoursPerMonth} onChange={setHoursPerMonth} placeholder="160" prefix="hrs" />
          <InputField label="Overtime Hours" value={overtimeHours} onChange={setOvertimeHours} placeholder="20" prefix="hrs" />
          <InputField label="Overtime Rate" value={overtimeRate} onChange={setOvertimeRate} placeholder="1.5" prefix="×" />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculate}
          style={{ marginTop: '14px', width: '100%', padding: '11px', borderRadius: '10px', background: '#F59E0B', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Calculate Overtime
        </motion.button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <ResultCard label="Hourly Rate" value={fmt(result.hourlyRate)} color="#6366F1" />
            <ResultCard label="Overtime Pay" value={fmt(result.otPay)} color="#F59E0B" large />
            <ResultCard label="Gross with OT" value={fmt(result.grossWithOT)} color="#06B6D4" />
            <ResultCard label="Net Pay with OT" value={fmt(result.netPay)} color="#10B981" large />
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ===== GRATUITY CALCULATOR =====
function GratuityCalculator() {
  const [salary, setSalary] = useState('')
  const [years, setYears] = useState('')
  const [rate, setRate] = useState('25')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const s = parseFloat(salary) || 0
    const y = parseFloat(years) || 0
    const r = parseFloat(rate) || 25
    const annualSalary = s * 12
    const gratuity = (annualSalary * y * r) / 100
    const monthly = gratuity / (y * 12)
    setResult({ gratuity, annualSalary, monthly, years: y, rate: r })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', maxWidth: '480px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '8px' }}>Gratuity Calculator</h3>
        <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>Calculate end-of-service gratuity for long-serving employees</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <InputField label="Monthly Basic Salary" value={salary} onChange={setSalary} placeholder="5000" />
          <InputField label="Years of Service" value={years} onChange={setYears} placeholder="5" prefix="yrs" />
          <InputField label="Gratuity Rate (%)" value={rate} onChange={setRate} placeholder="25" prefix="%" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculate}
            style={{ padding: '11px', borderRadius: '10px', background: '#10B981', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Calculate Gratuity
          </motion.button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <ResultCard label="Annual Salary" value={fmt(result.annualSalary)} color="#6366F1" />
            <ResultCard label="Total Gratuity" value={fmt(result.gratuity)} color="#10B981" large />
            <ResultCard label="Monthly Accrual" value={fmt(result.monthly)} color="#F59E0B" />
          </div>
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', marginTop: '4px' }}>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              After <strong style={{ color: '#F8FAFC' }}>{result.years} years</strong> of service at <strong style={{ color: '#F8FAFC' }}>{result.rate}%</strong> gratuity rate,
              this employee is entitled to <strong style={{ color: '#10B981' }}>{fmt(result.gratuity)}</strong> gratuity payment.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ===== LOAN CALCULATOR =====
function LoanCalculator() {
  const [amount, setAmount] = useState('')
  const [months, setMonths] = useState('')
  const [interest, setInterest] = useState('0')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const a = parseFloat(amount) || 0
    const m = parseFloat(months) || 1
    const r = parseFloat(interest) || 0
    let monthly = 0
    let totalRepayment = 0
    let totalInterest = 0

    if (r === 0) {
      monthly = a / m
      totalRepayment = a
    } else {
      const monthlyRate = r / 100 / 12
      monthly = a * monthlyRate * Math.pow(1 + monthlyRate, m) / (Math.pow(1 + monthlyRate, m) - 1)
      totalRepayment = monthly * m
      totalInterest = totalRepayment - a
    }

    // Generate schedule
    let balance = a
    const schedule = []
    for (let i = 1; i <= Math.min(m, 12); i++) {
      const interestCharge = balance * (r / 100 / 12)
      const principal = monthly - interestCharge
      balance = Math.max(0, balance - principal)
      schedule.push({ month: i, payment: monthly, principal, interest: interestCharge, balance })
    }

    setResult({ monthly, totalRepayment, totalInterest, schedule, amount: a, months: m })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', maxWidth: '480px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>Loan & Salary Advance Calculator</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <InputField label="Loan Amount" value={amount} onChange={setAmount} placeholder="5000" />
          <InputField label="Repayment Period" value={months} onChange={setMonths} placeholder="12" prefix="months" />
          <InputField label="Interest Rate (annual %)" value={interest} onChange={setInterest} placeholder="0 for interest-free" prefix="%" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculate}
            style={{ padding: '11px', borderRadius: '10px', background: '#06B6D4', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Calculate Repayment
          </motion.button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <ResultCard label="Monthly Deduction" value={fmt(result.monthly)} color="#06B6D4" large />
            <ResultCard label="Total Repayment" value={fmt(result.totalRepayment)} color="#6366F1" large />
            <ResultCard label="Total Interest" value={fmt(result.totalInterest)} color="#F59E0B" large />
          </div>

          {result.schedule.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>Repayment Schedule {result.months > 12 ? '(First 12 months)' : ''}</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 1fr', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Month', 'Payment', 'Principal', 'Interest', 'Balance'].map(h => (
                  <span key={h} style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>
              {result.schedule.map((row: any) => (
                <div key={row.month} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 1fr', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>Month {row.month}</span>
                  <span style={{ fontSize: '12px', color: '#F8FAFC', fontWeight: 600 }}>{fmt(row.payment)}</span>
                  <span style={{ fontSize: '12px', color: '#10B981' }}>{fmt(row.principal)}</span>
                  <span style={{ fontSize: '12px', color: '#F59E0B' }}>{fmt(row.interest)}</span>
                  <span style={{ fontSize: '12px', color: '#6366F1' }}>{fmt(row.balance)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ===== 13TH MONTH CALCULATOR =====
function BonusCalculator() {
  const [salary, setSalary] = useState('')
  const [months, setMonths] = useState('12')
  const [bonusType, setBonusType] = useState('13th')
  const [customRate, setCustomRate] = useState('100')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const s = parseFloat(salary) || 0
    const m = parseFloat(months) || 12
    const r = parseFloat(customRate) || 100
    const annualSalary = s * m
    let bonus = 0
    let label = ''

    if (bonusType === '13th') {
      bonus = s  // One full month salary
      label = '13th Month Bonus (1 month salary)'
    } else if (bonusType === 'percentage') {
      bonus = annualSalary * (r / 100)
      label = `${r}% of Annual Salary`
    } else if (bonusType === 'prorated') {
      bonus = s * (m / 12)
      label = `Prorated for ${m} months`
    }

    // PAYE on bonus (taxed at 5% for junior staff per Ghana law)
    const bonusPAYE = bonus * 0.05
    const netBonus = bonus - bonusPAYE

    setResult({ bonus, bonusPAYE, netBonus, annualSalary, label })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', maxWidth: '520px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>13th Month & Bonus Calculator</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <InputField label="Monthly Basic Salary" value={salary} onChange={setSalary} placeholder="5000" />
          <InputField label="Months Worked" value={months} onChange={setMonths} placeholder="12" prefix="months" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>Bonus Type</label>
            <select value={bonusType} onChange={e => setBonusType(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '10px', background: '#1A1A24', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
              <option value="13th">13th Month (1 full month salary)</option>
              <option value="percentage">Percentage of Annual Salary</option>
              <option value="prorated">Prorated Bonus</option>
            </select>
          </div>
          {bonusType === 'percentage' && (
            <InputField label="Bonus Percentage" value={customRate} onChange={setCustomRate} placeholder="10" prefix="%" />
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculate}
            style={{ padding: '11px', borderRadius: '10px', background: '#F59E0B', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Calculate Bonus
          </motion.button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <ResultCard label="Gross Bonus" value={fmt(result.bonus)} color="#F59E0B" large />
            <ResultCard label="PAYE on Bonus (5%)" value={fmt(result.bonusPAYE)} color="#EF4444" large />
            <ResultCard label="Net Bonus" value={fmt(result.netBonus)} color="#10B981" large />
          </div>
          <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', marginTop: '4px' }}>
            <p style={{ fontSize: '12px', color: '#64748B' }}>
              {result.label} • Bonus taxed at 5% per Ghana Revenue Authority regulations for bonuses not exceeding 15% of annual salary.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ===== SALARY COMPARISON =====
function CompareCalculator() {
  const [salary1, setSalary1] = useState('')
  const [salary2, setSalary2] = useState('')
  const [name1, setName1] = useState('Employee A')
  const [name2, setName2] = useState('Employee B')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const s1 = parseFloat(salary1) || 0
    const s2 = parseFloat(salary2) || 0
    const r1 = calculatePayroll(s1, DEFAULT_SETTINGS)
    const r2 = calculatePayroll(s2, DEFAULT_SETTINGS)
    const diff = {
      gross: s2 - s1,
      ssnit: r2.ssnitEmployee - r1.ssnitEmployee,
      paye: r2.paye - r1.paye,
      net: r2.netPay - r1.netPay,
      totalCost: (s2 + r2.ssnitEmployer + r2.tier2Employer) - (s1 + r1.ssnitEmployer + r1.tier2Employer),
    }
    setResult({ r1, r2, diff, s1, s2 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F8FAFC', marginBottom: '16px' }}>Salary Comparison Calculator</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input value={name1} onChange={e => setName1(e.target.value)} placeholder="Employee A"
              style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8', fontSize: '13px', fontWeight: 600, outline: 'none' }} />
            <InputField label="Monthly Salary" value={salary1} onChange={setSalary1} placeholder="5000" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input value={name2} onChange={e => setName2(e.target.value)} placeholder="Employee B"
              style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: '13px', fontWeight: 600, outline: 'none' }} />
            <InputField label="Monthly Salary" value={salary2} onChange={setSalary2} placeholder="8000" />
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculate}
          style={{ marginTop: '16px', width: '100%', padding: '11px', borderRadius: '10px', background: '#6366F1', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Compare Salaries
        </motion.button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['Item', name1, name2, 'Difference'].map(h => (
                <span key={h} style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {[
              { label: 'Gross Salary', v1: result.s1, v2: result.s2, diff: result.diff.gross },
              { label: 'SSNIT (Employee)', v1: result.r1.ssnitEmployee, v2: result.r2.ssnitEmployee, diff: result.diff.ssnit },
              { label: 'PAYE Tax', v1: result.r1.paye, v2: result.r2.paye, diff: result.diff.paye },
              { label: 'Net Pay', v1: result.r1.netPay, v2: result.r2.netPay, diff: result.diff.net },
              { label: 'Employer SSNIT', v1: result.r1.ssnitEmployer, v2: result.r2.ssnitEmployer, diff: result.r2.ssnitEmployer - result.r1.ssnitEmployer },
              { label: 'Total Cost to Company', v1: result.s1 + result.r1.ssnitEmployer + result.r1.tier2Employer, v2: result.s2 + result.r2.ssnitEmployer + result.r2.tier2Employer, diff: result.diff.totalCost },
            ].map(row => (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{row.label}</span>
                <span style={{ fontSize: '12px', color: '#818CF8', fontWeight: 600 }}>{fmt(row.v1)}</span>
                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>{fmt(row.v2)}</span>
                <span style={{ fontSize: '12px', color: row.diff >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                  {row.diff >= 0 ? '+' : ''}{fmt(row.diff)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function CalculatorPage() {
  const [tab, setTab] = useState<CalcTab>('basic')

  return (
    <DashboardLayout title="Payroll Calculator">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <motion.button key={t.key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setTab(t.key as CalcTab)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontSize: '12px', fontWeight: 500, transition: 'all 0.15s',
                background: tab === t.key ? '#6366F1' : 'rgba(255,255,255,0.03)',
                borderColor: tab === t.key ? '#6366F1' : 'rgba(255,255,255,0.08)',
                color: tab === t.key ? '#fff' : '#64748B' }}>
              <t.icon size={13} />
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* Calculator content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {tab === 'basic' && <BasicCalculator />}
            {tab === 'paye' && <PAYECalculator />}
            {tab === 'ssnit' && <SSNITCalculator />}
            {tab === 'netpay' && <NetPayCalculator />}
            {tab === 'reverse' && <ReverseCalculator />}
            {tab === 'overtime' && <OvertimeCalculator />}
            {tab === 'gratuity' && <GratuityCalculator />}
            {tab === 'loan' && <LoanCalculator />}
            {tab === 'bonus' && <BonusCalculator />}
            {tab === 'compare' && <CompareCalculator />}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
