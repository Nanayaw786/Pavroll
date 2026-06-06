// Sanitize user inputs to prevent XSS attacks

export function sanitizeString(input: string): string {
  if (!input) return ''
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#x60;')
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {}
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key])
    } else if (typeof obj[key] === 'number') {
      sanitized[key] = obj[key]
    } else if (typeof obj[key] === 'boolean') {
      sanitized[key] = obj[key]
    } else if (obj[key] === null || obj[key] === undefined) {
      sanitized[key] = obj[key]
    } else {
      sanitized[key] = obj[key]
    }
  }
  return sanitized as T
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9@._+-]/g, '')
}

export function sanitizePhone(phone: string): string {
  return phone.trim().replace(/[^0-9+\s-]/g, '')
}

export function sanitizeAmount(amount: string | number): number {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return isNaN(num) || num < 0 ? 0 : Math.round(num * 100) / 100
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateGhanaPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '')
  return /^(\+233|233|0)[0-9]{9}$/.test(cleaned)
}

export function validateSSNIT(ssnit: string): boolean {
  return ssnit.length >= 6 && ssnit.length <= 20
}

export function sanitizeAndValidateEmployee(data: any): { valid: boolean; errors: string[]; sanitized: any } {
  const errors: string[] = []

  if (!data.name || data.name.trim().length < 2) errors.push('Name must be at least 2 characters')
  if (!validateEmail(data.email)) errors.push('Invalid email address')
  if (data.phone && !validateGhanaPhone(data.phone)) errors.push('Invalid Ghana phone number')
  if (!data.department) errors.push('Department is required')
  if (!data.basic_salary || data.basic_salary <= 0) errors.push('Basic salary must be greater than 0')
  if (data.basic_salary > 1000000) errors.push('Basic salary seems too high — please verify')

  const sanitized = {
    name: sanitizeString(data.name),
    email: sanitizeEmail(data.email),
    phone: data.phone ? sanitizePhone(data.phone) : '',
    department: sanitizeString(data.department),
    position: sanitizeString(data.position || ''),
    basic_salary: sanitizeAmount(data.basic_salary),
    ssnit_number: sanitizeString(data.ssnit_number || ''),
    bank_name: sanitizeString(data.bank_name || ''),
    bank_account: sanitizeString(data.bank_account || ''),
    ghana_card: sanitizeString(data.ghana_card || ''),
    join_date: data.join_date || '',
    employment_type: sanitizeString(data.employment_type || 'Full-time'),
    status: data.status === 'archived' ? 'archived' : 'active',
  }

  return { valid: errors.length === 0, errors, sanitized }
}
