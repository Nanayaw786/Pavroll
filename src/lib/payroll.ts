// Ghana GRA 2026 PAYE & SSNIT Calculator
// Updated: June 2026
// Supports custom rates per company

export type PayrollSettings = {
  ssnit_employee_rate: number    // Default 5.5%
  ssnit_employer_rate: number    // Default 13%
  tier2_employer_rate: number    // Default 5%
  use_custom_paye: boolean       // Use flat rate instead of GRA bands
  custom_paye_rate: number       // Custom flat PAYE % if enabled
  overtime_rate: number          // Default 1.5x
  currency: string               // Default GHS
}

export const DEFAULT_SETTINGS: PayrollSettings = {
  ssnit_employee_rate: 5.5,
  ssnit_employer_rate: 13.0,
  tier2_employer_rate: 5.0,
  use_custom_paye: false,
  custom_paye_rate: 0,
  overtime_rate: 1.5,
  currency: 'GHS',
}

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
  settings: PayrollSettings
}

// SSNIT insurable earnings ceiling 2026
const SSNIT_CEILING = 69000

// GRA PAYE Tax Bands 2026 (Annual)
const PAYE_BANDS = [
  { limit: 5880,     rate: 0.00  },
  { limit: 1320,     rate: 0.05  },
  { limit: 1560,     rate: 0.10  },
  { limit: 38000,    rate: 0.175 },
  { limit: 192000,   rate: 0.25  },
  { limit: 366240,   rate: 0.30  },
  { limit: Infinity, rate: 0.35  },
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

export function calculatePayroll(
  basicSalary: number,
  settings: PayrollSettings = DEFAULT_SETTINGS
): PayrollResult {

  // Use custom rates from settings
  const ssnitEmployeeRate = (settings.ssnit_employee_rate || 5.5) / 100
  const ssnitEmployerRate = (settings.ssnit_employer_rate || 13.0) / 100
  const tier2EmployerRate = (settings.tier2_employer_rate || 5.0) / 100

  // Cap at SSNIT ceiling
  const insurableSalary = Math.min(basicSalary, SSNIT_CEILING)

  // SSNIT calculations using company rates
  const ssnitEmployee = Math.round(insurableSalary * ssnitEmployeeRate * 100) / 100
  const ssnitEmployer = Math.round(insurableSalary * ssnitEmployerRate * 100) / 100
  const tier2Employer = Math.round(insurableSalary * tier2EmployerRate * 100) / 100

  const grossSalary = basicSalary

  // PAYE calculation
  let monthlyPAYE = 0

  if (settings.use_custom_paye && settings.custom_paye_rate > 0) {
    // Use company's custom flat PAYE rate
    monthlyPAYE = Math.round(grossSalary * (settings.custom_paye_rate / 100) * 100) / 100
  } else {
    // Use standard GRA 2026 progressive bands
    const monthlyTaxableIncome = grossSalary - ssnitEmployee
    const annualTaxableIncome = monthlyTaxableIncome * 12
    const annualPAYE = calculatePAYE(annualTaxableIncome)
    monthlyPAYE = Math.round((annualPAYE / 12) * 100) / 100
  }

  const totalDeductions = Math.round((ssnitEmployee + monthlyPAYE) * 100) / 100
  const netPay = Math.round((grossSalary - totalDeductions) * 100) / 100
  const effectiveTaxRate = grossSalary > 0
    ? Math.round((totalDeductions / grossSalary) * 10000) / 100
    : 0

  return {
    basicSalary,
    grossSalary,
    ssnitEmployee,
    ssnitEmployer,
    tier2Employer,
    paye: monthlyPAYE,
    totalDeductions,
    netPay,
    effectiveTaxRate,
    settings,
  }
}

export function formatGHS(amount: number): string {
  return `GHS ${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

export function getPAYEBreakdown(basicSalary: number, settings: PayrollSettings = DEFAULT_SETTINGS) {
  if (settings.use_custom_paye) {
    return [{
      band: 'Custom Flat Rate',
      amount: Math.round(basicSalary * (settings.custom_paye_rate / 100) * 100) / 100,
      rate: `${settings.custom_paye_rate}%`
    }]
  }

  const ssnitEmployee = basicSalary * ((settings.ssnit_employee_rate || 5.5) / 100)
  const annualTaxable = (basicSalary - ssnitEmployee) * 12
  let remaining = annualTaxable
  const breakdown = []
  const bandNames = [
    'First GHS 5,880 (0%)',
    'Next GHS 1,320 (5%)',
    'Next GHS 1,560 (10%)',
    'Next GHS 38,000 (17.5%)',
    'Next GHS 192,000 (25%)',
    'Next GHS 366,240 (30%)',
    'Above GHS 605,000 (35%)'
  ]

  for (let i = 0; i < PAYE_BANDS.length; i++) {
    if (remaining <= 0) break
    const band = PAYE_BANDS[i]
    const taxable = Math.min(remaining, band.limit)
    const tax = taxable * band.rate
    if (taxable > 0 && tax > 0) {
      breakdown.push({
        band: bandNames[i],
        amount: Math.round((tax / 12) * 100) / 100,
        rate: `${band.rate * 100}%`
      })
    }
    remaining -= taxable
  }
  return breakdown
}
