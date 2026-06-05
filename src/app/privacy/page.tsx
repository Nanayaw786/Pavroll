'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
            <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>Privacy Policy</h1>
            <p style={{ fontSize: '14px', color: '#475569' }}>Last updated: June 5, 2026</p>
          </div>

          {[
            {
              title: '1. Introduction',
              content: `Pavroll ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our HR and payroll management platform. By using Pavroll, you consent to the data practices described in this policy.`
            },
            {
              title: '2. Information We Collect',
              content: `We collect information you provide directly to us, including:

- Company information (name, address, TIN, SSNIT employer code)
- Employee information (name, email, phone, Ghana Card number, SSNIT number, bank details, salary)
- Account credentials and authentication data via Clerk
- Payment information processed through Paystack
- Usage data and audit logs within the platform`
            },
            {
              title: '3. How We Use Your Information',
              content: `We use the information we collect to:

- Process and manage your payroll calculations
- Generate PDF payslips and SSNIT schedules
- Send payslips to employees via email
- Comply with Ghana Revenue Authority (GRA) regulations
- Provide customer support and respond to inquiries
- Improve and optimize our platform
- Send important service notifications`
            },
            {
              title: '4. Data Storage & Security',
              content: `Your data is stored securely on Supabase (PostgreSQL database hosted in West EU - Ireland). We implement industry-standard security measures including:

- Row Level Security (RLS) on all database tables
- Encrypted data transmission via HTTPS/TLS
- Authentication handled by Clerk with MFA support
- Regular security audits and monitoring
- Automated backups to prevent data loss`
            },
            {
              title: '5. Ghana Data Protection Act Compliance',
              content: `Pavroll complies with the Ghana Data Protection Act, 2012 (Act 843). We are registered with the Data Protection Commission of Ghana. You have the right to access, correct, and delete your personal data. To exercise these rights, contact us at privacy@pavroll.app.`
            },
            {
              title: '6. Data Sharing',
              content: `We do not sell your personal data. We may share data with:

- Supabase (database hosting)
- Clerk (authentication)
- Paystack (payment processing)
- Resend (email delivery)
- Vercel (hosting infrastructure)

All third-party providers are bound by data processing agreements and maintain appropriate security standards.`
            },
            {
              title: '7. Employee Data',
              content: `As an HR and payroll platform, we process employee personal data on behalf of your company. Your company acts as the Data Controller and Pavroll acts as the Data Processor. You are responsible for obtaining appropriate consent from your employees for data processing activities.`
            },
            {
              title: '8. Data Retention',
              content: `We retain your data for as long as your account is active. Payroll records are retained for 7 years in compliance with Ghana's tax regulations. Upon account deletion, we will delete or anonymize your data within 30 days, except where retention is required by law.`
            },
            {
              title: '9. Cookies',
              content: `We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. You can control cookies through your browser settings.`
            },
            {
              title: '10. Changes to This Policy',
              content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform. Continued use of Pavroll after changes constitutes acceptance of the updated policy.`
            },
            {
              title: '11. Contact Us',
              content: `For privacy-related questions or to exercise your data rights, contact us at:

Email: privacy@pavroll.app
Address: Accra, Ghana
Data Protection Officer: Samuel Mensah`
            },
          ].map((section, i) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
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
