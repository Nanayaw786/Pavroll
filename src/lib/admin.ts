export const SUPER_ADMIN_EMAILS = [
  'samuelannanemensah@gmail.com',
  'samuelannanemensah@proton.me',
  'hello.pavroll@proton.me',
]

export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase())
}