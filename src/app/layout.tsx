import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pavroll — Ghana HR & Payroll',
  description: 'Ghana GRA 2024 compliant payroll for SMEs. Auto-calculate PAYE, SSNIT & Tier 2.',
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
