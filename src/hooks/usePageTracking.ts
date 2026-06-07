'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'
import { getCompanyId } from '@/lib/employees'

export function usePageTracking() {
  const pathname = usePathname()

  useEffect(() => {
    const track = async () => {
      try {
        const cId = await getCompanyId()
        if (cId) {
          await trackEvent(cId, 'page_view', pathname)
        }
      } catch {
        // Silent fail
      }
    }
    track()
  }, [pathname])
}
