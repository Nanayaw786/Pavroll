'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div style={{ background: '#0A0A0F', color: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 80px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366F1,#818CF8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>Pav<span style={{ color: '#6366F1' }}>roll</span></span>
        </Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', fontSize: '13px', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', color: '#6366F1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Legal</p>
            <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>Terms of Service</h1>
            <p style={{ fontSize: '14px', color: '#475569' }}>Last updated: June 5, 2026</p>
          </div>

          {[
            {
              title: '1. Acceptance of Terms',
              content: `By accessing or using Pavroll, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all users, including company administrators and employees accessing the Employee Self-Service portal.`
            },
            {
              title: '2. Description of Service',
              content: `Pavroll is a cloud-based HR and payroll management platform designed for Ghanaian businesses. Our services include:

- Monthly payroll processing with Ghana GRA 2024 compliant calculations
- PAYE, SSNIT and Tier 2 pension computation
- PDF payslip generation and email delivery
- Employee management and self-service portal
- Leave management and approval workflows
- SSNIT schedule CSV export
- Audit trail and compliance alerts
- Offboarding and final pay calculation`
            },
            {
              title: '3. Account Registration',
              content: `To use Pavroll, you must create an account and provide accurate, complete information. You are responsible for:

- Maintaining the confidentiality of your account credentials
- All activities that occur under your account
- Ensuring your employee data is accurate and up to date
- Notifying us immediately of any unauthorized use of your account`
            },
            {
              title: '4. Subscription & Billing',
              content: `Pavroll offers three subscription plans:

- Starter: GHS 120/month — up to 10 employees
- Growth: GHS 350/month — up to 50 employees
- Business: GHS 800/month — unlimited employees

Payments are processed monthly via Paystack. Subscriptions auto-renew unless cancelled. You may cancel at any time. No refunds are provided for partial months. Prices may change with 30 days notice.`
            },
            {
              title: '5. Acceptable Use',
              content: `You agree to use Pavroll only for lawful purposes. You must not:

- Use the platform to process fraudulent payroll
- Submit false employee data or tax information
- Attempt to gain unauthorized access to other accounts
- Reverse engineer, copy or resell the platform
- Use the platform in violation of Ghana's labour or tax laws`
            },
            {
              title: '6. Payroll Accuracy',
              content: `Pavroll calculates payroll based on Ghana GRA 2024 tax regulations. While we strive for accuracy, you are ultimately responsible for verifying all payroll calculations before processing. Pavroll is not liable for errors arising from incorrect employee data entered by users. We recommend reviewing payroll outputs before finalizing each run.`
            },
            {
              title: '7. Data Ownership',
              content: `You retain ownership of all data you input into Pavroll, including employee records, payroll data and company information. By using Pavroll, you grant us a limited license to process this data to provide our services. We do not claim ownership of your data and will not use it for purposes beyond providing the platform.`
            },
            {
              title: '8. Intellectual Property',
              content: `The Pavroll platform, including its design, code, features and branding, is owned by Pavroll and protected by intellectual property laws. You may not copy, modify, distribute or create derivative works based on our platform without written permission.`
            },
            {
              title: '9. Limitation of Liability',
              content: `To the maximum extent permitted by law, Pavroll shall not be liable for:

- Indirect, incidental or consequential damages
- Loss of profits or business opportunities
- Errors in payroll calculations arising from incorrect input data
- Service interruptions beyond our reasonable control
- Actions taken by third-party service providers

Our total liability shall not exceed the amount paid by you in the 3 months preceding the claim.`
            },
            {
              title: '10. Service Availability',
              content: `We strive to maintain 99.9% uptime. Scheduled maintenance will be communicated in advance. We are not liable for downtime caused by factors outside our control, including internet outages, third-party service failures or force majeure events.`
            },
            {
              title: '11. Termination',
              content: `Either party may terminate this agreement at any time. Upon termination:

- Your access to the platform will be revoked
- You may export your data within 30 days
- We will delete your data after 30 days (except where required by law)
- No refunds will be issued for unused subscription periods`
            },
            {
              title: '12. Governing Law',
              content: `These Terms of Service are governed by the laws of the Republic of Ghana. Any disputes shall be resolved in the courts of Accra, Ghana. If any provision of these terms is found invalid, the remaining provisions shall continue in full force.`
            },
            {
              title: '13. Changes to Terms',
              content: `We may update these terms from time to time. We will notify you of significant changes via email or platform notification. Continued use of Pavroll after changes constitutes acceptance of the updated terms.`
            },
            {
              title: '14. Contact',
              content: `For questions about these Terms of Service, contact us at:

Email: legal@pavroll.app
Address: Accra, Ghana`
            },
          ].map((section, i) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', marginBottom: '12px' }}>{section.title}</h2>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{section.content}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '24px 80px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '12px', color: '#475569' }}>© 2026 Pavroll. Built for Ghana. 🇬🇭</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: '/terms' }, { label: 'Contact', href: '/contact' }].map(link => (
            <Link key={link.label} href={link.href} style={{ fontSize: '12px', color: '#475569', textDecoration: 'none' }}>{link.label}</Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
