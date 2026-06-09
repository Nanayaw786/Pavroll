import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pavroll — Ghana HR & Payroll Software',
  description: 'Ghana GRA 2026 compliant payroll software for SMEs. Auto-calculate PAYE, SSNIT & Tier 2. Generate PDF payslips. Starting at GHS 120/month.',
  keywords: ['Ghana payroll software', 'Ghana HR software', 'PAYE calculator Ghana', 'SSNIT calculator', 'payroll Ghana', 'HR software Ghana', 'GRA compliant payroll'],
  robots: 'index, follow',
  verification: {
    google: 'WhsYgi4EMJOEEW7Krad36vb23FCWcETkmuA5Qeym3I8',
  },
  openGraph: {
    title: 'Pavroll — Ghana HR & Payroll Software',
    description: 'Ghana GRA 2026 compliant payroll for SMEs. Auto-calculate PAYE, SSNIT & Tier 2. Starting at GHS 120/month.',
    url: 'https://pavroll.com',
    siteName: 'Pavroll',
    locale: 'en_GH',
    type: 'website',
  },
  manifest: '/manifest.json',
  themeColor: '#6366F1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pavroll',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body suppressHydrationWarning>
          {children}
          <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
        </body>
      </html>
    </ClerkProvider>
  )
}
