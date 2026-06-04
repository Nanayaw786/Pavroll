// Ghana GRA 2024 Payroll Calculation Engine

export type PayrollResult = {
  basicSalary: number
  grossSalary: number
  ssnitEmployee: number
  ssnitEmployer: number
  tier2Employee: number
  tier2Employer: number
  taxableIncome: number
  paye: number
  totalDeductions: number
  netPay: number
}

export function calculatePAYE(annualTaxable: number): number {
  const bands = [
    { limit: 4380, rate: 0 },
    { limit: 1320, rate: 0.05 },
    { limit: 1560, rate: 0.10 },
    { limit: 38000, rate: 0.175 },
    { limit: 192000, rate: 0.25 },
    { limit: Infinity, rate: 0.35 },
  ]
  let tax = 0
  let remaining = annualTaxable
  for (const band of bands) {
    if (remaining <= 0) break
    const taxable = Math.min(remaining, band.limit)
    tax += taxable * band.rate
    remaining -= taxable
  }
  return tax / 12 // monthly
}

export function calculatePayroll(basicSalary: number, allowances = 0): PayrollResult {
  const grossSalary = basicSalary + allowances

  // SSNIT: employee 5.5%, employer 13% (11% SSNIT + 2% tier 2)
  const ssnitEmployee = grossSalary * 0.055
  const ssnitEmployer = grossSalary * 0.11
  const tier2Employee = 0
  const tier2Employer = grossSalary * 0.02

  // Taxable income = gross - employee SSNIT contribution
  const taxableIncome = grossSalary - ssnitEmployee

  // PAYE (annualise, calculate, de-annualise)
  const annualTaxable = taxableIncome * 12
  const paye = calculatePAYE(annualTaxable)

  const totalDeductions = ssnitEmployee + paye
  const netPay = grossSalary - totalDeductions

  return {
    basicSalary,
    grossSalary,
    ssnitEmployee: Math.round(ssnitEmployee * 100) / 100,
    ssnitEmployer: Math.round(ssnitEmployer * 100) / 100,
    tier2Employee,
    tier2Employer: Math.round(tier2Employer * 100) / 100,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    paye: Math.round(paye * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
  }
}
