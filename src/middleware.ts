import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/employee(.*)',
  '/about(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/contact(.*)',
  '/trial-expired(.*)',
  '/billing(.*)',
  '/api/contact(.*)',
  '/api/paystack(.*)',
  '/select-org(.*)',
])

// Suspicious patterns to block
const BLOCKED_PATTERNS = [
  /\.\.\//,           // Path traversal
  /<script/i,         // XSS attempts
  /javascript:/i,     // JS injection
  /union.*select/i,   // SQL injection
  /exec\s*\(/i,       // Code execution
  /eval\s*\(/i,       // Eval injection
  /\x00/,             // Null bytes
  /etc\/passwd/i,     // System file access
]

function isBlockedRequest(req: NextRequest): boolean {
  const url = req.url
  const userAgent = req.headers.get('user-agent') || ''

  // Block suspicious URL patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(url)) return true
  }

  // Block known bad bots
  const blockedBots = ['sqlmap', 'nikto', 'nessus', 'masscan', 'zgrab', 'nmap']
  for (const bot of blockedBots) {
    if (userAgent.toLowerCase().includes(bot)) return true
  }

  return false
}

export default clerkMiddleware(async (auth, request) => {
  // Block suspicious requests
  if (isBlockedRequest(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
