'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

const SUPER_ADMIN_EMAILS = [
  'samuelannanemensah@gmail.com',
  'samuelannanemensah@proton.me',
  'hello.pavroll@proton.me',
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push('/sign-in'); return }
    const email = user.primaryEmailAddress?.emailAddress || ''
    if (!SUPER_ADMIN_EMAILS.includes(email)) {
      router.push('/dashboard')
    }
  }, [user, isLoaded])

  if (!isLoaded) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color="#6366F1" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const email = user?.primaryEmailAddress?.emailAddress || ''
  if (!SUPER_ADMIN_EMAILS.includes(email)) return null

  return <>{children}</>
}
