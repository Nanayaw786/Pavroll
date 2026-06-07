// Ghana GRA 2026 PAYE & SSNIT Calculator
// Updated: June 2026
// Source: Ghana Revenue Authority (GRA) & SSNIT

export type PayrollResult = {
  basicSalary: number
  grossSalary: number
  ssnitEmployee: number
  ssnitEmployer: number
  tier2Employer: number
  paye: number
  totalDeductions: number
  netPay: number
  effectiveTaxRate: number
}

const SSNIT_EMPLOYEE_RATE = 0.055
const SSNIT_EMPLOYER_RATE = 0.13
const TIER2_EMPLOYER_RATE = 0.05
const SSNIT_CEILING = 69000

const PAYE_BANDS = [
  { limit: 5880,    rate: 0.00  },
  { limit: 1320,    rate: 0.05  },
  { limit: 1560,    rate: 0.10  },
  { limit: 38000,   rate: 0.175 },
  { limit: 192000,  rate: 0.25  },
  { limit: 366240,  rate: 0.30  },
  { limit: Infinity, rate: 0.35 },
]

export function calculatePAYE(annualTaxableIncome: number): number {
  let tax = 0
  let remaining = annualTaxableIncome
  for (const band of PAYE_BANDS) {
    if (remaining <= 0) break
    const taxable = Math.min(remaining, band.limit)
    tax += taxable * band.rate
    remaining -= taxable
  }
  return Math.max(0, tax)
}

export function calculatePayroll(basicSalary: number): PayrollResult {
  const insurableSalary = Math.min(basicSalary, SSNIT_CEILING)
  const ssnitEmployee = Math.round(insurableSalary * SSNIT_EMPLOYEE_RATE * 100) / 100
  const ssnitEmployer = Math.round(insurableSalary * SSNIT_EMPLOYER_RATE * 100) / 100
  const tier2Employer = Math.round(insurableSalary * TIER2_EMPLOYER_RATE * 100) / 100
  const grossSalary = basicSalary
  const monthlyTaxableIncome = grossSalary - ssnitEmployee
  const annualTaxableIncome = monthlyTaxableIncome * 12
  const annualPAYE = calculatePAYE(annualTaxableIncome)
  const monthlyPAYE = Math.round((annualPAYE / 12) * 100) / 100
  const totalDeductions = Math.round((ssnitEmployee + monthlyPAYE) * 100) / 100
  const netPay = Math.round((grossSalary - totalDeductions) * 100) / 100
  const effectiveTaxRate = grossSalary > 0 ? Math.round((totalDeductions / grossSalary) * 10000) / 100 : 0
  return { basicSalary, grossSalary, ssnitEmployee, ssnitEmployer, tier2Employer, paye: monthlyPAYE, totalDeductions, netPay, effectiveTaxRate }
}

export function formatGHS(amount: number): string {
  return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
