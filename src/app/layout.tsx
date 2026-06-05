import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pavroll — Ghana HR & Payroll',
  description: 'Ghana GRA 2024 compliant payroll for SMEs. Auto-calculate PAYE, SSNIT & Tier 2.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
