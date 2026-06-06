'use client'
import TrialBanner from '@/components/ui/TrialBanner'
import MobileNotice from '@/components/ui/MobileNotice'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { motion } from 'framer-motion'

export default function DashboardLayout({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0F' }}>
      <Sidebar />

      {/* Main content */}
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <Topbar title={title} />
        <TrialBanner />
        <MobileNotice />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="main-scroll grid-bg"
          style={{ flex: 1, overflowY: 'auto', padding: '24px' }}
        >
          {children}
        </motion.main>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .main-content {
            margin-left: 240px;
            max-width: calc(100vw - 240px);
          }
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            max-width: 100vw;
          }
          .main-scroll {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
